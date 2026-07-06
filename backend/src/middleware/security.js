import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import Redis from 'ioredis';
import logger from '../utils/logger.js';

// Simple in-memory rate limiting fallback
class MemoryStore {
  constructor() {
    this.store = {};
    this.interval = setInterval(() => {
      // Clean up old entries every 5 minutes
      const now = Date.now();
      Object.keys(this.store).forEach(key => {
        if (this.store[key].reset < now) {
          delete this.store[key];
        }
      });
    }, 300000);
  }

  async increment(key) {
    const now = Date.now();
    if (!this.store[key] || this.store[key].reset < now) {
      this.store[key] = { total: 1, reset: now + 60000 };
      return { total: 1, reset: this.store[key].reset };
    }
    this.store[key].total += 1;
    return { total: this.store[key].total, reset: this.store[key].reset };
  }

  async decrement(key) {
    if (this.store[key]) {
      this.store[key].total -= 1;
    }
  }

  async resetKey(key) {
    delete this.store[key];
  }
}

// Initialize Redis if available
let redisClient = null;
try {
  redisClient = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    lazyConnect: true,
    retryStrategy: (times) => {
      if (times > 3) {
        console.warn('⚠️ Redis connection failed, using memory store');
        return null;
      }
      return Math.min(times * 100, 3000);
    }
  });
  redisClient.connect().catch(() => {
    console.warn('⚠️ Redis connection failed, using memory store');
    redisClient = null;
  });
} catch (error) {
  console.warn('⚠️ Redis not available, using memory store');
  redisClient = null;
}

export const rateLimitMiddleware = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: {
    success: false,
    message: 'Too many requests, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  store: new MemoryStore()
});

export const strictRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 requests per 15 minutes
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  store: new MemoryStore()
});

export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.buildtrack.com"]
    }
  },
  crossOriginEmbedderPolicy: true,
  crossOriginOpenerPolicy: true,
  crossOriginResourcePolicy: { policy: "cross-origin" }
});

export const preventBruteForce = async (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  const key = `bruteforce_${ip}`;
  
  try {
    if (redisClient) {
      const attempts = await redisClient.get(key) || 0;
      if (attempts > 10) {
        return res.status(429).json({
          success: false,
          message: 'Too many failed attempts. Please try again later.'
        });
      }
    }
    next();
  } catch (error) {
    // If Redis fails, allow the request
    next();
  }
};

export const trackFailedAttempt = async (req) => {
  const ip = req.ip || req.connection.remoteAddress;
  const key = `bruteforce_${ip}`;
  
  try {
    if (redisClient) {
      const attempts = await redisClient.incr(key);
      if (attempts === 1) {
        await redisClient.expire(key, 900); // 15 minutes
      }
    }
  } catch (error) {
    // Silently fail
  }
};
