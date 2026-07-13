import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import logger from '../utils/logger.js';

dotenv.config();

// Create Sequelize instance with MySQL configuration
const sequelize = new Sequelize(
  process.env.DB_NAME || 'buildtrack_db',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    dialectModule: await import('mysql2'),
    dialectOptions: {
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci',
      connectTimeout: 60000,
      ...(process.env.DB_SSL === 'true' && {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      })
    },
    logging: (msg) => logger.debug(msg),
    define: {
      timestamps: true,
      underscored: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at',
      paranoid: true
    },
    pool: {
      max: parseInt(process.env.DB_POOL_MAX) || 10,
      min: parseInt(process.env.DB_POOL_MIN) || 0,
      acquire: parseInt(process.env.DB_POOL_ACQUIRE) || 30000,
      idle: parseInt(process.env.DB_POOL_IDLE) || 10000
    },
    retry: {
      max: 3,
      match: [
        /SequelizeConnectionError/,
        /SequelizeConnectionRefusedError/,
        /SequelizeHostNotFoundError/,
        /SequelizeHostNotReachableError/,
        /SequelizeInvalidConnectionError/,
        /SequelizeConnectionTimedOutError/
      ]
    },
    timezone: '+00:00'
  }
);

console.log('🐬 Using MySQL database');

// Test the connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    logger.info('✅ MySQL connection established successfully.');
    return true;
  } catch (error) {
    logger.error('❌ Unable to connect to MySQL database:', error);
    return false;
  }
};

// Initialize database
const initDatabase = async () => {
  try {
    const connected = await testConnection();
    if (!connected) {
      throw new Error('Failed to connect to database');
    }
    logger.info('✅ Database initialized successfully.');
  } catch (error) {
    logger.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
};

export { sequelize, testConnection, initDatabase };