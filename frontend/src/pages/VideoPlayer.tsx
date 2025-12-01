import { useRef, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';
import * as faceapi from 'face-api.js';
import axios from 'axios';
import { Play, Pause, Volume2, Maximize, AlertCircle, Trophy, ArrowLeft, Loader2 } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import confetti from 'canvas-confetti';
import Logger from '../utils/Logger';

const VideoPlayer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const webcamRef = useRef<Webcam>(null);
  const [video, setVideo] = useState<any>(null);
  const [playing, setPlaying] = useState(false);
  const [faceDetected, setFaceDetected] = useState(true);
  const [watchedTime, setWatchedTime] = useState(0);
  const [totalWatchedWithFace, setTotalWatchedWithFace] = useState(0);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const detectionIntervalRef = useRef<any>(null);
  const lastCheckTimeRef = useRef<number>(0);
  const consecutiveFailuresRef = useRef<number>(0);

  useEffect(() => {
    loadModels();
    fetchVideo();
    return () => {
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }
    };
  }, [id]);

  const loadModels = async () => {
    try {
      const MODEL_URL = '/models';
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      ]);
      setModelsLoaded(true);
    } catch (error: any) {
      Logger.error(`Failed to load AI models: ${error.message}`, { service: 'VideoPlayer', method: 'loadModels' });
    }
  };

  const fetchVideo = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:3000/api/videos/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setVideo(response.data);
    } catch (error) {
      console.error('Error fetching video:', error);
      navigate('/dashboard');
    }
  };

  const startFaceDetection = () => {
    if (!modelsLoaded || !webcamRef.current) return;

    lastCheckTimeRef.current = videoRef.current?.currentTime || 0;
    Logger.info(`🎬 Face detection started at: ${lastCheckTimeRef.current}`, { service: 'VideoPlayer', method: 'startFaceDetection' });

    detectionIntervalRef.current = setInterval(async () => {
      try {
        const videoElement = webcamRef.current?.video;
        const currentVideoTime = videoRef.current?.currentTime || 0;
        const isVideoPlaying = videoRef.current && !videoRef.current.paused;

        if (!videoElement) {
          console.log('⏸️ Skipping detection - webcam element missing');
          return;
        }

        if (!isVideoPlaying) {
          console.log('⏸️ Skipping detection - video is paused');
          return;
        }

        // Opciones MUY permisivas para distancia de 60-80cm
        const options = new faceapi.TinyFaceDetectorOptions({
          inputSize: 224, // Menor tamaño = más rápido y detecta rostros más pequeños
          scoreThreshold: 0.3 // Muy permisivo para detectar rostros a distancia
        });

        const detection = await faceapi.detectSingleFace(videoElement, options).withFaceLandmarks();

        if (detection) {
          // Rostro detectado correctamente
          const wasFailingBefore = consecutiveFailuresRef.current >= 2;
          consecutiveFailuresRef.current = 0;
          setFaceDetected(true);
          setShowWarning(false);
          
          // Si estaba pausado por falta de rostro, permitir reanudar
          if (wasFailingBefore) {
            Logger.info('✅ Face detected again! You can resume the video.', { service: 'VideoPlayer', method: 'startFaceDetection' });
            toast.success('✅ Rostro detectado! Puedes continuar viendo el video.', {
              duration: 3000,
              position: 'top-center',
            });
          }
          
          // Calcular tiempo transcurrido
          const timeDiff = currentVideoTime - lastCheckTimeRef.current;
          Logger.info(`✅ Face detected! Time diff: ${timeDiff.toFixed(2)}s, Current video time: ${currentVideoTime.toFixed(2)}s`, { service: 'VideoPlayer', method: 'startFaceDetection' });
          
          if (timeDiff > 0 && timeDiff < 3) {
            setTotalWatchedWithFace(prev => {
              const newTotal = prev + timeDiff;
              console.log(`📊 Adding ${timeDiff.toFixed(2)}s. Total: ${newTotal.toFixed(2)}s`);
              return newTotal;
            });
          } else {
            Logger.warn(`⚠️ Time diff out of range: ${timeDiff.toFixed(2)}s`, { service: 'VideoPlayer', method: 'startFaceDetection' });
          }
          lastCheckTimeRef.current = currentVideoTime;
        } else {
          // No se detectó rostro
          consecutiveFailuresRef.current++;
          Logger.info(`❌ No face detected. Failures: ${consecutiveFailuresRef.current}`, { service: 'VideoPlayer', method: 'startFaceDetection' });

          if (consecutiveFailuresRef.current >= 2) {
            setFaceDetected(false);
            setShowWarning(true);
            handlePause();
            lastCheckTimeRef.current = currentVideoTime;
            Logger.info('⏸️ Video paused - no face detected', { service: 'VideoPlayer', method: 'startFaceDetection' });
          }
        }
      } catch (error) {
        Logger.error('Face detection error: ' + error, { service: 'VideoPlayer', method: 'startFaceDetection' });
      }
    }, 1500);
  };

  const handlePlay = () => {
    if (!modelsLoaded) {
      alert('Please wait for face detection models to load');
      return;
    }
    videoRef.current?.play();
    setPlaying(true);
    lastCheckTimeRef.current = videoRef.current?.currentTime || 0;
    if (!detectionIntervalRef.current) {
      startFaceDetection();
    }
  };

  const handlePause = () => {
    videoRef.current?.pause();
    setPlaying(false);
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setWatchedTime(videoRef.current.currentTime);
    }
  };

  const handleVideoEnd = async () => {
    setPlaying(false);
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
    }

    // Get REAL video duration from the HTML element
    const realDuration = videoRef.current?.duration || video.duration;
    const currentTime = videoRef.current?.currentTime || 0;
    
    // Si el rostro estaba siendo detectado, sumar el tiempo restante
    let finalWatchedTime = totalWatchedWithFace;
    if (faceDetected && lastCheckTimeRef.current < currentTime) {
      const remainingTime = currentTime - lastCheckTimeRef.current;
      if (remainingTime > 0 && remainingTime < 3) {
        finalWatchedTime += remainingTime;
        Logger.info(`➕ Adding remaining time: ${remainingTime.toFixed(2)}s`, { service: 'VideoPlayer', method: 'handleVideoEnd' });
      }
    }
    
    // Calculate percentage watched with face
    const percentage = (finalWatchedTime / realDuration) * 100;

    Logger.info('🏁 Video ended!', { service: 'VideoPlayer', method: 'handleVideoEnd' });
    Logger.info(`📊 Total watched with face: ${finalWatchedTime.toFixed(2)}s`, { service: 'VideoPlayer', method: 'handleVideoEnd' });
    Logger.info(`⏱️ Video duration (DB): ${video.duration}s`, { service: 'VideoPlayer', method: 'handleVideoEnd' });
    Logger.info(`⏱️ Video duration (REAL): ${realDuration.toFixed(2)}s`, { service: 'VideoPlayer', method: 'handleVideoEnd' });
    Logger.info(`📈 Percentage: ${percentage.toFixed(2)}%`, { service: 'VideoPlayer', method: 'handleVideoEnd' });
    Logger.info(`✅ Completed: ${percentage >= 90}`, { service: 'VideoPlayer', method: 'handleVideoEnd' });

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/videos/${id}/watch`,
        {
          completed: percentage >= 90,
          watchedPercentage: percentage,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        // ¡Éxito! Mostrar confetti y toast
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });

        toast.success(
          `🎉 ¡Felicidades! Ganaste ${response.data.pointsEarned} punto${response.data.pointsEarned > 1 ? 's' : ''}`,
          {
            duration: 5000,
            position: 'top-center',
            style: {
              background: '#10b981',
              color: '#fff',
              fontSize: '16px',
              fontWeight: 'bold',
            },
          }
        );

        // Update user points in localStorage
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        userData.points = (userData.points || 0) + response.data.pointsEarned;
        localStorage.setItem('user', JSON.stringify(userData));
      } else {
        // No completó el 90%
        toast.error(
          `😔 No completaste el video. Necesitas ver al menos el 90% con tu rostro visible. Viste: ${percentage.toFixed(1)}%`,
          {
            duration: 6000,
            position: 'top-center',
            style: {
              background: '#ef4444',
              color: '#fff',
              fontSize: '14px',
            },
          }
        );
      }
    } catch (error: any) {
      Logger.error('Error submitting watch:' + error, { service: 'VideoPlayer', method: 'handleVideoEnd' });
      toast.error(
        error.response?.data?.error || 'Error procesando el video',
        {
          duration: 4000,
          position: 'top-center',
        }
      );
    }
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        videoRef.current.requestFullscreen();
      }
    }
  };

  const watchedPercentage = video && videoRef.current?.duration 
    ? (totalWatchedWithFace / videoRef.current.duration) * 100 
    : 0;

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Toaster />
      {/* Header */}
      <header className="bg-slate-800/50 backdrop-blur-xl border-b border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </button>

          <div className="flex items-center gap-4">
            <div className="text-sm text-slate-400">
              Valid Watch Time: <span className="text-green-400 font-bold">{watchedPercentage.toFixed(1)}%</span>
              <span className="text-slate-500 ml-2">({totalWatchedWithFace.toFixed(1)}s / {videoRef.current?.duration?.toFixed(1) || video?.duration || 0}s)</span>
            </div>
            {video && (
              <div className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg px-4 py-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                <span className="font-bold text-yellow-500">{video.points} pts</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {!video ? (
          <div className="text-center py-20">
            <Loader2 className="w-12 h-12 animate-spin mx-auto text-blue-500" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Video Player */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-slate-800/50 rounded-xl overflow-hidden border border-slate-700">
                <div className="relative aspect-video bg-black">
                  <video
                    ref={videoRef}
                    src={video.url}
                    className="w-full h-full"
                    onTimeUpdate={handleTimeUpdate}
                    onEnded={handleVideoEnd}
                  />

                  {/* Controls */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={playing ? handlePause : handlePlay}
                        className="bg-blue-600 hover:bg-blue-500 p-3 rounded-full transition"
                      >
                        {playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                      </button>

                      <div className="flex-1">
                        <div className="h-1 bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 transition-all"
                            style={{ width: `${(watchedTime / video.duration) * 100}%` }}
                          />
                        </div>
                      </div>

                      <button className="text-slate-400 hover:text-white transition">
                        <Volume2 className="w-5 h-5" />
                      </button>

                      <button
                        onClick={toggleFullscreen}
                        className="text-slate-400 hover:text-white transition"
                      >
                        <Maximize className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                <h1 className="text-2xl font-bold mb-2">{video.title}</h1>
                <p className="text-slate-400">{video.description}</p>
              </div>
            </div>

            {/* Face Detection Panel */}
            <div className="space-y-4">
              <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-blue-500" />
                  Face Verification
                </h3>

                <div className="relative aspect-video rounded-lg overflow-hidden bg-black mb-4">
                  {modelsLoaded ? (
                    <Webcam
                      ref={webcamRef}
                      audio={false}
                      className="w-full h-full object-cover"
                      mirrored
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                    </div>
                  )}

                  <div className={`absolute inset-0 border-4 rounded-lg transition ${faceDetected ? 'border-green-500' : 'border-red-500'
                    }`} />
                </div>

                <div className={`p-3 rounded-lg flex items-center gap-2 ${faceDetected ? 'bg-green-500/10 border border-green-500/30' : 'bg-red-500/10 border border-red-500/30'
                  }`}>
                  <div className={`w-3 h-3 rounded-full ${faceDetected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
                  <span className={`text-sm font-medium ${faceDetected ? 'text-green-400' : 'text-red-400'}`}>
                    {faceDetected ? 'Face Detected' : 'No Face Detected'}
                  </span>
                </div>

                {showWarning && (
                  <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <p className="text-sm text-red-400">
                      ⚠️ Please look at the screen. Video has been paused.
                    </p>
                  </div>
                )}

                <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <p className="text-xs text-blue-400">
                    💡 Keep your face visible and look at the screen to earn points. You need 90% valid watch time.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default VideoPlayer;
