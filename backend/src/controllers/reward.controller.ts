import { Request, Response } from 'express';
import { Reward } from '../models/Reward';
import { Redemption } from '../models/Redemption';
import { User } from '../models/User';
import mongoose from 'mongoose';

export const getRewards = async (req: Request, res: Response) => {
  try {
    const rewards = await Reward.find({ active: true });
    res.json(rewards);
  } catch (error) {
    console.error('Get rewards error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const redeemReward = async (req: Request, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const userId = (req as any).userId;

    const reward = await Reward.findById(id).session(session);
    if (!reward || !reward.active) {
      await session.abortTransaction();
      return res.status(404).json({ error: 'Reward not found or inactive' });
    }

    const user = await User.findById(userId).session(session);
    if (!user) {
      await session.abortTransaction();
      return res.status(404).json({ error: 'User not found' });
    }

    // RF-13: Validate sufficient points
    if (user.points < reward.cost) {
      await session.abortTransaction();
      return res.status(400).json({ error: 'Insufficient points' });
    }

    // Create redemption and deduct points
    await Redemption.create(
      [
        {
          userId,
          rewardId: id,
          cost: reward.cost,
        },
      ],
      { session }
    );

    user.points -= reward.cost;
    await user.save({ session });

    await session.commitTransaction();

    res.json({
      success: true,
      message: `Successfully redeemed ${reward.name}`,
      remainingPoints: user.points,
    });
  } catch (error) {
    await session.abortTransaction();
    console.error('Redeem reward error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    session.endSession();
  }
};
