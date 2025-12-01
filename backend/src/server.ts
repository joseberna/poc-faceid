import app from './app';
import dotenv from 'dotenv';
import { connectDB } from './config/database';
import Logger from './utils/Logger';

dotenv.config();

const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB().then(() => {
  app.listen(PORT, () => {
    Logger.success(`Server running on port ${PORT}`, { service: 'System', method: 'startup' });
  });
}).catch(err => {
  Logger.error(`Failed to connect to database: ${err.message}`, { service: 'System', method: 'startup' });
  process.exit(1);
});
