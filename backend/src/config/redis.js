import Redis from 'redis';
import dotenv from 'dotenv';
import logger from '../utils/logger.js';

dotenv.config();

const redisClient = Redis.createClient({
  url: `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`
});

redisClient.on('connect', () => {
  logger.info('Redis connected successfully');
});

redisClient.on('error', (error) => {
  logger.error('Redis connection error:', error);
});

await redisClient.connect();

export { redisClient };
