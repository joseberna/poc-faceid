import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import authRoutes from './routes/auth.routes';
import videoRoutes from './routes/video.routes';
import rewardRoutes from './routes/reward.routes';

const app = express();

// Middleware
app.use(express.json({ limit: '50mb' })); // Increased limit for base64 images
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/rewards', rewardRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Facial Verification Platform API' });
});

export default app;
