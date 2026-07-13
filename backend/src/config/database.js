// src/config/database.js
import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import mysql2 from 'mysql2';
import logger from '../utils/logger.js';

dotenv.config();

/**
 * BuildTrack Database Configuration
 * Supports:
 * - Local MySQL development
 * - Railway Cloud MySQL production
 */

const isProduction = process.env.NODE_ENV === 'production';

const sequelize = new Sequelize(
  process.env.DB_NAME || 'railway',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'zephyr.proxy.rlwy.net',
    port: Number(process.env.DB_PORT || 11964),

    dialect: 'mysql',

    // Correct mysql2 driver for Sequelize
    dialectModule: mysql2,

    logging: isProduction
      ? false
      : (message) => logger.debug(message),

    dialectOptions: {
      charset: 'utf8mb4',
      connectTimeout: 60000,

      ...(process.env.DB_SSL === 'true' && {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      })
    },

    /**
     * Model defaults
     */
    define: {
      timestamps: true,
      underscored: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at',
      paranoid: true
    },

    /**
     * Connection pool
     */
    pool: {
      max: parseInt(process.env.DB_POOL_MAX) || 10,
      min: parseInt(process.env.DB_POOL_MIN) || 0,
      acquire: parseInt(process.env.DB_POOL_ACQUIRE) || 60000,
      idle: parseInt(process.env.DB_POOL_IDLE) || 10000
    },

    /**
     * Timezone
     */
    timezone: '+00:00',

    /**
     * Automatic retry
     */
    retry: {
      max: 5,
      match: [
        /SequelizeConnectionError/,
        /SequelizeConnectionRefusedError/,
        /SequelizeHostNotFoundError/,
        /SequelizeHostNotReachableError/,
        /SequelizeInvalidConnectionError/,
        /SequelizeConnectionTimedOutError/
      ]
    }
  }
);

/**
 * Test database connection
 */
export async function testConnection() {
  try {
    await sequelize.authenticate();
    logger.info(
      `✅ Database connected successfully (${process.env.DB_NAME || 'railway'})`
    );
    return true;
  } catch (error) {
    logger.error('❌ Database connection failed:', error.message);
    return false;
  }
}

/**
 * Initialize database
 */
export async function initDatabase() {
  const connected = await testConnection();

  if (!connected) {
    logger.error('Database initialization failed');
    process.exit(1);
  }

  logger.info('🚀 Database initialized successfully');
}

export { sequelize };