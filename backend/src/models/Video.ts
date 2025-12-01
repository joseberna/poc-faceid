import mongoose from 'mongoose';

const videoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  url: { type: String, required: true },
  thumbnail: { type: String },
  duration: { type: Number, required: true }, // in seconds
  points: { type: Number, required: true },
  active: { type: Boolean, default: true },
}, { timestamps: true });

export const Video = mongoose.model('Video', videoSchema);
