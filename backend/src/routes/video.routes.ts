import { Router } from 'express';
import { getVideos, getVideoById, watchVideo } from '../controllers/video.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authMiddleware, getVideos);
router.get('/:id', authMiddleware, getVideoById);
router.post('/:id/watch', authMiddleware, watchVideo);

export default router;
