// src/config/redis.js
import { createClient } from 'redis';
import dotenv from 'dotenv';
import logger from '../utils/logger.js';
import config from './config.js';

dotenv.config();

// Use config values with fallbacks
const redisConfig = {
  host: config.redis?.host || process.env.REDIS_HOST || 'localhost',
  port: config.redis?.port || parseInt(process.env.REDIS_PORT, 10) || 6379,
  password: config.redis?.password || process.env.REDIS_PASSWORD || undefined,
  db: config.redis?.db || parseInt(process.env.REDIS_DB, 10) || 0
};

let redisClient = null;
let isConnected = false;
let connectionPromise = null;

export const getRedisClient = async () => {
  // If already connected, return the client
  if (redisClient && isConnected) {
    return redisClient;
  }

  // If connection is in progress, wait for it
  if (connectionPromise) {
    return connectionPromise;
  }

  // Start new connection attempt
  connectionPromise = (async () => {
    try {
      // Build Redis URL safely
      let url = `redis://`;
      if (redisConfig.password) {
        url += `:${encodeURIComponent(redisConfig.password)}@`;
      }
      url += `${redisConfig.host}:${redisConfig.port}/${redisConfig.db}`;
      
      redisClient = createClient({
        url,
        socket: {
          reconnectStrategy: (retries) => {
            if (retries > 10) {
              logger.error('Redis connection failed after 10 retries');
              return new Error('Redis connection failed');
            }
            return Math.min(retries * 100, 3000);
          },
          connectTimeout: 10000, // 10 seconds timeout
          keepAlive: 30000 // 30 seconds keep-alive
        },
        // Add retry strategy for commands
        commandsQueueMaxLength: 1000
      });

      // Set up event listeners
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
        connectionPromise = null;
        logger.warn('Redis connection ended');
      });

      redisClient.on('reconnecting', () => {
        logger.info('Redis reconnecting...');
      });

      // Connect with timeout
      await Promise.race([
        redisClient.connect(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Redis connection timeout')), 15000)
        )
      ]);

      return redisClient;
    } catch (error) {
      connectionPromise = null;
      logger.error('Failed to connect to Redis:', error.message);
      
      // Return a mock client for development if Redis is not available
      if (process.env.NODE_ENV !== 'production') {
        logger.warn('Using mock Redis client for development');
        const mockClient = createMockRedisClient();
        redisClient = mockClient;
        isConnected = true;
        return mockClient;
      }
      throw error;
    }
  })();

  return connectionPromise;
};

// Mock Redis client for development with better implementation
const createMockRedisClient = () => {
  const cache = new Map();
  const timers = new Map();

  return {
    get: async (key) => {
      const value = cache.get(key);
      return value !== undefined ? value : null;
    },
    set: async (key, value, options) => {
      cache.set(key, value);
      // Handle EX option for expiration
      if (options?.EX) {
        // Clear existing timer if any
        if (timers.has(key)) {
          clearTimeout(timers.get(key));
          timers.delete(key);
        }
        const timer = setTimeout(() => {
          cache.delete(key);
          timers.delete(key);
        }, options.EX * 1000);
        timers.set(key, timer);
      }
      return 'OK';
    },
    setEx: async (key, seconds, value) => {
      return await this.set(key, value, { EX: seconds });
    },
    del: async (key) => {
      const deleted = cache.delete(key);
      if (timers.has(key)) {
        clearTimeout(timers.get(key));
        timers.delete(key);
      }
      return deleted ? 1 : 0;
    },
    getDel: async (key) => {
      const value = cache.get(key);
      await this.del(key);
      return value || null;
    },
    exists: async (key) => {
      return cache.has(key) ? 1 : 0;
    },
    expire: async (key, seconds) => {
      if (!cache.has(key)) return 0;
      // Reset expiration
      if (timers.has(key)) {
        clearTimeout(timers.get(key));
        timers.delete(key);
      }
      const timer = setTimeout(() => {
        cache.delete(key);
        timers.delete(key);
      }, seconds * 1000);
      timers.set(key, timer);
      return 1;
    },
    ttl: async (key) => {
      if (!cache.has(key)) return -2;
      // Mock TTL - approximate
      return 3600; // Return 1 hour as default
    },
    flushAll: async () => {
      cache.clear();
      // Clear all timers
      for (const timer of timers.values()) {
        clearTimeout(timer);
      }
      timers.clear();
      return 'OK';
    },
    on: () => {},
    quit: async () => {
      // Clear all timers
      for (const timer of timers.values()) {
        clearTimeout(timer);
      }
      timers.clear();
      cache.clear();
    },
    // Add method to check if mock is being used
    isMock: true
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

// Health check function
export const checkRedisHealth = async () => {
  try {
    const client = await getRedisClient();
    if (!client) return false;
    
    // Try to ping Redis
    if (client.ping) {
      await client.ping();
    }
    return true;
  } catch (error) {
    logger.error('Redis health check failed:', error.message);
    return false;
  }
};

// Cleanup function
export const closeRedisConnection = async () => {
  if (redisClient) {
    try {
      await redisClient.quit();
      isConnected = false;
      connectionPromise = null;
      logger.info('Redis connection closed successfully');
    } catch (error) {
      logger.error('Error closing Redis connection:', error.message);
    }
  }
};

// Export a promise that resolves to the Redis client
export const redisClient = getRedisClient();

// Default export with all functions
export default { 
  getRedisClient, 
  initRedis, 
  redisClient,
  checkRedisHealth,
  closeRedisConnection
};