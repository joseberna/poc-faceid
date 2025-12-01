import mongoose from 'mongoose';
import Logger from '../utils/Logger';

export const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI!;
    await mongoose.connect(mongoURI);
    Logger.success('MongoDB connected successfully', { service: 'System', method: 'connectDB' });
  } catch (error: any) {
    Logger.error(`MongoDB connection error: ${error.message}`, { service: 'System', method: 'connectDB' });
    process.exit(1);
  }
};
