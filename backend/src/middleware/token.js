import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import Redis from 'ioredis';

// Initialize Redis with fallback
let redisClient = null;
try {
  redisClient = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    lazyConnect: true,
    retryStrategy: (times) => {
      if (times > 3) {
        console.warn('⚠️ Redis connection failed, using memory store for tokens');
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

// In-memory fallback store
const memoryStore = {};

export const generateTokens = async (user) => {
  const accessToken = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'buildtrack_secret_key',
    { expiresIn: '15m' }
  );

  const refreshToken = jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET || 'buildtrack_refresh_secret',
    { expiresIn: '7d' }
  );

  const tokenId = uuidv4();
  const tokenData = {
    userId: user.id,
    token: refreshToken,
    expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000
  };

  // Store refresh token
  try {
    if (redisClient) {
      await redisClient.setex(
        `refresh_${user.id}`,
        7 * 24 * 60 * 60,
        JSON.stringify(tokenData)
      );
    } else {
      memoryStore[`refresh_${user.id}`] = tokenData;
    }
  } catch (error) {
    memoryStore[`refresh_${user.id}`] = tokenData;
  }

  return { accessToken, refreshToken };
};

export const refreshAccessToken = async (refreshToken) => {
  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'buildtrack_refresh_secret');
    let storedToken = null;

    try {
      if (redisClient) {
        const data = await redisClient.get(`refresh_${decoded.id}`);
        if (data) {
          storedToken = JSON.parse(data);
        }
      } else {
        storedToken = memoryStore[`refresh_${decoded.id}`];
      }
    } catch (error) {
      storedToken = memoryStore[`refresh_${decoded.id}`];
    }

    if (!storedToken || storedToken.token !== refreshToken) {
      throw new Error('Invalid refresh token');
    }

    if (storedToken.expiresAt < Date.now()) {
      throw new Error('Refresh token expired');
    }

    const user = await User.findByPk(decoded.id);
    if (!user) throw new Error('User not found');

    const newAccessToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'buildtrack_secret_key',
      { expiresIn: '15m' }
    );

    return { accessToken: newAccessToken };
  } catch (error) {
    throw new Error('Invalid refresh token');
  }
};

export const revokeRefreshToken = async (userId) => {
  try {
    if (redisClient) {
      await redisClient.del(`refresh_${userId}`);
    }
    delete memoryStore[`refresh_${userId}`];
  } catch (error) {
    delete memoryStore[`refresh_${userId}`];
  }
};
