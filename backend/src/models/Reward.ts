import mongoose from 'mongoose';

const rewardSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  imageUrl: { type: String, required: true },
  cost: { type: Number, required: true },
  active: { type: Boolean, default: true },
}, { timestamps: true });

export const Reward = mongoose.model('Reward', rewardSchema);
