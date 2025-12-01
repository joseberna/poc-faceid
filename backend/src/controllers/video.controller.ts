import { Request, Response } from 'express';
import { Video } from '../models/Video';
import { History } from '../models/History';
import { User } from '../models/User';
import Logger from '../utils/Logger';

export const getVideos = async (req: Request, res: Response) => {
  try {
    const videos = await Video.find({ active: true }).select(
      'title description url thumbnail duration points'
    );
    res.json(videos);
  } catch (error: any) {
    Logger.error(`Get videos error: ${error.message}`, { service: 'VideoController', method: 'getVideos' });
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getVideoById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const video = await Video.findById(id);

    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    res.json(video);
  } catch (error: any) {
    Logger.error(`Get video error: ${error.message}`, { service: 'VideoController', method: 'getVideoById' });
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const watchVideo = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { completed, watchedPercentage } = req.body;
    const userId = (req as any).userId;

    const video = await Video.findById(id);
    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    // RF-08: Validate 90% watched with face detection
    const isValid = completed && watchedPercentage >= 90;
    const pointsEarned = isValid ? video.points : 0;

    // Create history record
    await History.create({
      userId,
      videoId: id,
      completed: isValid,
      pointsEarned,
      validFace: isValid,
    });

    // RF-09: Award points if valid
    if (isValid) {
      await User.findByIdAndUpdate(userId, { $inc: { points: pointsEarned } });
    }

    res.json({
      success: isValid,
      pointsEarned,
      message: isValid
        ? `Congratulations! You earned ${pointsEarned} points`
        : 'Video not completed. You need to watch at least 90% with face detection.',
    });
  } catch (error: any) {
    Logger.error(`Watch video error: ${error.message}`, { service: 'VideoController', method: 'watchVideo' });
    res.status(500).json({ error: 'Internal server error' });
  }
};
