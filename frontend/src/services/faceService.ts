import * as faceapi from 'face-api.js';
import Logger from '../utils/Logger';

const MODEL_URL = '/models';

export const loadModels = async () => {
  try {
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
    ]);
    return true;
  } catch (error: any) {
    Logger.error(`Failed loading models: ${error.message}`, { service: 'services', method: 'loadModels' });

    return false;
  }
};

export const extractDescriptor = async (imageSrc: string) => {
  const img = await faceapi.fetchImage(imageSrc);
  const detection = await faceapi.detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
    .withFaceLandmarks()
    .withFaceDescriptor();
  return detection ? detection.descriptor : null;
};
