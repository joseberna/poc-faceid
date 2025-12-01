import mongoose from 'mongoose';

const historySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  videoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Video', required: true },
  completed: { type: Boolean, default: false },
  pointsEarned: { type: Number, default: 0 },
  validFace: { type: Boolean, default: true },
  watchedAt: { type: Date, default: Date.now },
});

export const History = mongoose.model('History', historySchema);
