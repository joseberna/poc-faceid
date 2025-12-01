import mongoose from 'mongoose';

const redemptionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rewardId: { type: mongoose.Schema.Types.ObjectId, ref: 'Reward', required: true },
  cost: { type: Number, required: true },
  redeemedAt: { type: Date, default: Date.now },
});

export const Redemption = mongoose.model('Redemption', redemptionSchema);
