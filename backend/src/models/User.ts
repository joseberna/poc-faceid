import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  faceDescriptor: { type: [Number], required: true },
  points: { type: Number, default: 0 },
  role: { type: String, enum: ['USER', 'ADMIN'], default: 'USER' },
}, { timestamps: true });

export const User = mongoose.model('User', userSchema);
