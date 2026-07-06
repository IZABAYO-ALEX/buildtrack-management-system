import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import logger from '../utils/logger.js';

dotenv.config();

let sequelize;

// Check if using SQLite or PostgreSQL
const dbDialect = process.env.DB_DIALECT || 'sqlite';

if (dbDialect === 'sqlite') {
  // SQLite Configuration (Development)
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: process.env.DB_STORAGE || './database.sqlite',
    logging: (msg) => logger.debug(msg),
    define: {
      timestamps: true,
      underscored: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    }
  });
  console.log('📦 Using SQLite database');
} else {
  // PostgreSQL Configuration (Production)
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 5432,
      dialect: 'postgres',
      logging: (msg) => logger.debug(msg),
      define: {
        timestamps: true,
        underscored: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
      },
      dialectOptions: {
        ssl: process.env.DB_SSL === 'true' ? { require: true, rejectUnauthorized: false } : false
      },
      pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    }
  );
  console.log('🐘 Using PostgreSQL database');
}

export { sequelize };
