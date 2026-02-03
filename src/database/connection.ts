import mongoose from 'mongoose';
import { logger } from '../shared/logger';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cedtp';

export async function connectDatabase(): Promise<void> {
  try {
    await mongoose.connect(MONGODB_URI);
    logger.info('MongoDB connected successfully');
  } catch (error) {
    logger.error(`MongoDB connection error: ${error}`);
    throw error;
  }
}

export async function disconnectDatabase(): Promise<void> {
  try {
    await mongoose.disconnect();
    logger.info('MongoDB disconnected');
  } catch (error) {
    logger.error(`MongoDB disconnection error: ${error}`);
  }
}

mongoose.connection.on('error', (error) => {
  logger.error(`MongoDB error: ${error}`);
});

mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB disconnected');
});
