// src/config/redis.js
import { createClient } from 'redis';
import dotenv from 'dotenv';
import logger from '../utils/logger.js';
import config from './config.js';

dotenv.config();

// Use config values with fallbacks
const redisConfig = {
  host: config.redis?.host || process.env.REDIS_HOST || 'localhost',
  port: config.redis?.port || parseInt(process.env.REDIS_PORT) || 6379,
  password: config.redis?.password || process.env.REDIS_PASSWORD || undefined,
  db: config.redis?.db || parseInt(process.env.REDIS_DB) || 0
};

let redisClient = null;
let isConnected = false;

export const getRedisClient = async () => {
  if (redisClient && isConnected) {
    return redisClient;
  }

  try {
    const url = `redis://${redisConfig.password ? `:${redisConfig.password}@` : ''}${redisConfig.host}:${redisConfig.port}/${redisConfig.db}`;
    
    redisClient = createClient({
      url,
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 10) {
            logger.error('Redis connection failed after 10 retries');
            return new Error('Redis connection failed');
          }
          return Math.min(retries * 100, 3000);
        }
      }
    });

    redisClient.on('connect', () => {
      isConnected = true;
      logger.info('✅ Redis connected successfully');
    });

    redisClient.on('error', (error) => {
      isConnected = false;
      logger.error('❌ Redis connection error:', error.message);
    });

    redisClient.on('end', () => {
      isConnected = false;
      logger.warn('Redis connection ended');
    });

    await redisClient.connect();
    return redisClient;
  } catch (error) {
    logger.error('Failed to connect to Redis:', error.message);
    // Return a mock client for development if Redis is not available
    if (process.env.NODE_ENV !== 'production') {
      logger.warn('Using mock Redis client for development');
      return createMockRedisClient();
    }
    throw error;
  }
};

// Mock Redis client for development
const createMockRedisClient = () => {
  const cache = new Map();
  return {
    get: async (key) => cache.get(key) || null,
    set: async (key, value, options) => {
      cache.set(key, value);
      return 'OK';
    },
    del: async (key) => {
      cache.delete(key);
      return 1;
    },
    setEx: async (key, seconds, value) => {
      cache.set(key, value);
      setTimeout(() => cache.delete(key), seconds * 1000);
      return 'OK';
    },
    on: () => {},
    quit: async () => {}
  };
};

// Initialize Redis client
export const initRedis = async () => {
  try {
    const client = await getRedisClient();
    return client;
  } catch (error) {
    logger.error('Redis initialization failed:', error.message);
    return null;
  }
};

// Export a promise that resolves to the Redis client
export const redisClient = getRedisClient();

// Default export
export default { getRedisClient, initRedis, redisClient };