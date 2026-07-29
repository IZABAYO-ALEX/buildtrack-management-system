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
  }// src/config/redis.js
import { createClient } from 'redis';
import logger from '../utils/logger.js';

// Redis configuration for React (browser environment)
const redisConfig = {
  host: process.env.REACT_APP_REDIS_HOST || 'localhost',
  port: parseInt(process.env.REACT_APP_REDIS_PORT, 10) || 6379,
  password: process.env.REACT_APP_REDIS_PASSWORD || undefined,
  db: parseInt(process.env.REACT_APP_REDIS_DB, 10) || 0
};

let redisInstance = null;
let isConnected = false;
let connectionPromise = null;

/**
 * Check if we're in a browser environment
 */
const isBrowser = typeof window !== 'undefined';

/**
 * Get Redis client instance
 * @returns {Promise<Object>} Redis client or mock client
 */
export const getRedisClient = async () => {
  // In browser, always use mock client (Redis doesn't work in browser)
  if (isBrowser) {
    logger.warn('⚠️ Redis is not available in browser, using mock client');
    return getMockRedisClient();
  }

  // If already connected, return the client
  if (redisInstance && isConnected) {
    return redisInstance;
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
      
      redisInstance = createClient({
        url,
        socket: {
          reconnectStrategy: (retries) => {
            if (retries > 10) {
              logger.error('Redis connection failed after 10 retries');
              return new Error('Redis connection failed');
            }
            return Math.min(retries * 100, 3000);
          },
          connectTimeout: 10000,
          keepAlive: 30000
        },
        commandsQueueMaxLength: 1000
      });

      // Set up event listeners
      redisInstance.on('connect', () => {
        isConnected = true;
        logger.info('✅ Redis connected successfully');
      });

      redisInstance.on('error', (error) => {
        isConnected = false;
        logger.error('❌ Redis connection error:', error.message);
      });

      redisInstance.on('end', () => {
        isConnected = false;
        connectionPromise = null;
        logger.warn('Redis connection ended');
      });

      redisInstance.on('reconnecting', () => {
        logger.info('Redis reconnecting...');
      });

      // Connect with timeout
      await Promise.race([
        redisInstance.connect(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Redis connection timeout')), 15000)
        )
      ]);

      return redisInstance;
    } catch (error) {
      connectionPromise = null;
      logger.error('Failed to connect to Redis:', error.message);
      
      // Return mock client for development
      logger.warn('Using mock Redis client');
      return getMockRedisClient();
    }
  })();

  return connectionPromise;
};

// Singleton mock client instance
let mockClientInstance = null;

/**
 * Get or create mock Redis client
 * @returns {Object} Mock Redis client
 */
const getMockRedisClient = () => {
  if (mockClientInstance) {
    return mockClientInstance;
  }

  const cache = new Map();
  const timers = new Map();

  mockClientInstance = {
    get: async (key) => {
      const value = cache.get(key);
      return value !== undefined ? value : null;
    },
    set: async (key, value, options) => {
      cache.set(key, value);
      if (options?.EX) {
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
      return await mockClientInstance.set(key, value, { EX: seconds });
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
      await mockClientInstance.del(key);
      return value || null;
    },
    exists: async (key) => {
      return cache.has(key) ? 1 : 0;
    },
    expire: async (key, seconds) => {
      if (!cache.has(key)) return 0;
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
      return 3600;
    },
    flushAll: async () => {
      cache.clear();
      for (const timer of timers.values()) {
        clearTimeout(timer);
      }
      timers.clear();
      return 'OK';
    },
    ping: async () => {
      return 'PONG';
    },
    on: () => {},
    quit: async () => {
      for (const timer of timers.values()) {
        clearTimeout(timer);
      }
      timers.clear();
      cache.clear();
    },
    isMock: true,
    // React-specific methods
    subscribe: (channel, callback) => {
      logger.info(`Mock subscribe to channel: ${channel}`);
      return { unsubscribe: () => {} };
    },
    publish: async (channel, message) => {
      logger.info(`Mock publish to channel: ${channel}`, message);
      return 1;
    }
  };

  return mockClientInstance;
};

/**
 * Initialize Redis client
 * @returns {Promise<Object>} Redis client or null if failed
 */
export const initRedis = async () => {
  try {
    const client = await getRedisClient();
    return client;
  } catch (error) {
    logger.error('Redis initialization failed:', error.message);
    return null;
  }
};

/**
 * Check Redis health
 * @returns {Promise<boolean>} True if Redis is healthy
 */
export const checkRedisHealth = async () => {
  try {
    const client = await getRedisClient();
    if (!client) return false;
    
    if (client.ping) {
      await client.ping();
    }
    return true;
  } catch (error) {
    logger.error('Redis health check failed:', error.message);
    return false;
  }
};

/**
 * Close Redis connection
 * @returns {Promise<void>}
 */
export const closeRedisConnection = async () => {
  if (redisInstance) {
    try {
      await redisInstance.quit();
      isConnected = false;
      connectionPromise = null;
      logger.info('Redis connection closed successfully');
    } catch (error) {
      logger.error('Error closing Redis connection:', error.message);
    }
  }
};

/**
 * Get the current Redis instance (synchronous)
 * @returns {Object|null} Redis instance or null if not connected
 */
export const getRedisInstance = () => {
  return redisInstance || mockClientInstance;
};

/**
 * Check if Redis is connected
 * @returns {boolean} True if connected
 */
export const isRedisConnected = () => {
  return isConnected;
};

/**
 * Redis hook for React components
 * @returns {Object} Redis methods for React
 */
export const useRedis = () => {
  const [client, setClient] = React.useState(null);
  const [isReady, setIsReady] = React.useState(false);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        const redisClient = await getRedisClient();
        if (mounted) {
          setClient(redisClient);
          setIsReady(true);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError(err.message);
          setIsReady(false);
        }
      }
    };

    init();

    return () => {
      mounted = false;
    };
  }, []);

  return {
    client,
    isReady,
    error,
    get: async (key) => {
      if (!client) throw new Error('Redis not ready');
      return await client.get(key);
    },
    set: async (key, value, options) => {
      if (!client) throw new Error('Redis not ready');
      return await client.set(key, value, options);
    },
    setEx: async (key, seconds, value) => {
      if (!client) throw new Error('Redis not ready');
      return await client.setEx(key, seconds, value);
    },
    del: async (key) => {
      if (!client) throw new Error('Redis not ready');
      return await client.del(key);
    },
    exists: async (key) => {
      if (!client) throw new Error('Redis not ready');
      return await client.exists(key);
    },
    flushAll: async () => {
      if (!client) throw new Error('Redis not ready');
      return await client.flushAll();
    }
  };
};

// Export a promise that resolves to the Redis client
export const redisClient = getRedisClient();

// React component for Redis provider
export const RedisProvider = ({ children }) => {
  const [client, setClient] = React.useState(null);
  const [isReady, setIsReady] = React.useState(false);

  React.useEffect(() => {
    getRedisClient().then((c) => {
      setClient(c);
      setIsReady(true);
    }).catch((err) => {
      logger.error('Redis provider error:', err);
    });
  }, []);

  const contextValue = React.useMemo(() => ({
    client,
    isReady,
    get: async (key) => client?.get(key),
    set: async (key, value, options) => client?.set(key, value, options),
    setEx: async (key, seconds, value) => client?.setEx(key, seconds, value),
    del: async (key) => client?.del(key),
    exists: async (key) => client?.exists(key),
    flushAll: async () => client?.flushAll(),
  }), [client]);

  return (
    <RedisContext.Provider value={contextValue}>
      {children}
    </RedisContext.Provider>
  );
};

// Redis Context
export const RedisContext = React.createContext(null);

// Default export with all functions
export default { 
  getRedisClient, 
  initRedis, 
  redisClient,
  getRedisInstance,
  checkRedisHealth,
  closeRedisConnection,
  isRedisConnected,
  useRedis,
  RedisProvider,
  RedisContext
};

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