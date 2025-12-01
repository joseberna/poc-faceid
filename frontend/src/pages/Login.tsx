import React, { useRef, useState, useEffect } from 'react';
import Webcam from 'react-webcam';
import * as faceapi from 'face-api.js';
import { loadModels, extractDescriptor } from '../services/faceService';
import { Camera, Mail, Lock, Loader2 } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Logger from '../utils/Logger';

const MODEL_URL = '/models'; // Assuming models are in the public/models folder

const Login = () => {
  const webcamRef = useRef<Webcam>(null);
  const navigate = useNavigate();
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const loadFaceApiModels = async () => {
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ]);
        setModelsLoaded(true);
      } catch (error: any) {
        Logger.error(`Failed to load AI models: ${error.message}`, { service: 'Login', method: 'useEffect' });
        setError('Failed to load AI models. Please try again.');
      }
    };
    loadFaceApiModels();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!webcamRef.current) throw new Error('Webcam not ready');
      const imageSrc = webcamRef.current.getScreenshot();
      if (!imageSrc) throw new Error('Could not capture photo');

      const img = await faceapi.fetchImage(imageSrc);
      const detection = await faceapi.detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection || !detection.descriptor) throw new Error('No face detected. Please center your face.');

      const descriptorArray = Array.from(detection.descriptor);

      const response = await axios.post('http://localhost:3000/api/auth/login', {
        email,
        faceDescriptor: descriptorArray,
      });

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      navigate('/dashboard');
    } catch (error: any) {
      Logger.error(`Failed to login: ${error.message}`, { service: 'Login', method: 'handleLogin' });
      alert(error.response?.data?.error || error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 bg-slate-800/50 backdrop-blur-xl rounded-2xl p-8 border border-slate-700 shadow-2xl">

        <div className="space-y-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
            Welcome Back
          </h1>
          <p className="text-slate-400">Login with your face to continue.</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                <input
                  type="email"
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-lg py-2.5 pl-10 pr-4 focus:ring-2 focus:ring-green-500 outline-none transition"
                  placeholder="john@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !modelsLoaded}
              className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-500 hover:to-blue-500 text-white font-bold py-3 rounded-lg transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" /> : 'Login with FaceID'}
            </button>

            <div className="text-center">
              <a href="/register" className="text-sm text-blue-400 hover:text-blue-300">
                Don't have an account? Register
              </a>
            </div>
          </form>
        </div>

        <div className="flex flex-col items-center justify-center space-y-4 bg-black/20 rounded-xl p-4 border border-slate-700/50">
          <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-black shadow-inner">
            {modelsLoaded ? (
              <Webcam
                ref={webcamRef}
                audio={false}
                screenshotFormat="image/jpeg"
                className="w-full h-full object-cover"
                mirrored
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-slate-500">
                <Loader2 className="w-8 h-8 animate-spin mb-2" />
                <span className="ml-2">Loading AI Models...</span>
              </div>
            )}
            <div className="absolute inset-0 border-2 border-green-500/30 rounded-lg pointer-events-none"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-64 border-2 border-dashed border-green-400/50 rounded-full pointer-events-none"></div>
          </div>
          <p className="text-sm text-slate-400 text-center">
            <Camera className="inline w-4 h-4 mr-1" />
            Position your face within the oval
          </p>
        </div>

      </div>
    </div>
  );
};

export default Login;
