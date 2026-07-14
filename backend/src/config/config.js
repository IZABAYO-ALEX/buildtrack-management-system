// src/config.js
import dotenv from "dotenv";
import { fileURLToPath } from 'url';
import path from 'path';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env';
dotenv.config({ 
  path: path.resolve(__dirname, '..', envFile) 
});

// Required environment variables with descriptions
const requiredConfig = {
  DB_HOST: 'Database host (e.g., zephyr.proxy.rlwy.net)',
  DB_PORT: 'Database port (e.g., 11964)',
  DB_USER: 'Database username (e.g., root)',
  DB_PASSWORD: 'Database password',
  DB_NAME: 'Database name (e.g., railway)',
  JWT_SECRET: 'JWT secret key for authentication',
  CORS_ORIGIN: 'Frontend URL for CORS'
};

// Validate required environment variables
const missingVars = [];
const invalidVars = [];

for (const [key, description] of Object.entries(requiredConfig)) {
  const value = process.env[key];
  if (!value || value.trim() === '') {
    missingVars.push({ key, description });
  }
}

// Validate specific fields
if (process.env.DB_PORT) {
  const port = Number(process.env.DB_PORT);
  if (isNaN(port) || port < 1 || port > 65535) {
    invalidVars.push({ 
      key: 'DB_PORT', 
      value: process.env.DB_PORT, 
      reason: 'Must be a valid port number between 1-65535'
    });
  }
}

if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
  invalidVars.push({ 
    key: 'JWT_SECRET', 
    value: process.env.JWT_SECRET, 
    reason: 'Must be at least 32 characters long for security'
  });
}

// Throw error if any required variables are missing or invalid
if (missingVars.length > 0 || invalidVars.length > 0) {
  const errors = [];
  
  if (missingVars.length > 0) {
    errors.push('❌ Missing required environment variables:');
    missingVars.forEach(({ key, description }) => {
      errors.push(`   - ${key}: ${description}`);
    });
  }
  
  if (invalidVars.length > 0) {
    errors.push('❌ Invalid environment variables:');
    invalidVars.forEach(({ key, value, reason }) => {
      errors.push(`   - ${key}: "${value}" - ${reason}`);
    });
  }
  
  errors.push('\n💡 Please check your .env file and ensure all required variables are set correctly.');
  throw new Error(errors.join('\n'));
}

// Type conversions with fallbacks
const parseNumber = (value, fallback) => {
  const num = Number(value);
  return isNaN(num) || num < 0 ? fallback : num;
};

const parseBoolean = (value) => {
  if (typeof value === 'string') {
    return value.toLowerCase() === 'true' || value === '1';
  }
  return Boolean(value);
};

// Build configuration object with your values
const config = {
  app: {
    name: process.env.APP_NAME || 'BuildTrack',
    env: process.env.NODE_ENV || 'production',
    port: parseNumber(process.env.PORT, 10000),
    apiVersion: process.env.API_VERSION || 'v1',
    isProduction: (process.env.NODE_ENV || 'production') === 'production',
    isDevelopment: (process.env.NODE_ENV || 'production') === 'development',
    isTest: (process.env.NODE_ENV || 'production') === 'test'
  },

  database: {
    host: process.env.DB_HOST,// Your Railway host
    port: parseNumber(process.env.DB_PORT, 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    name: process.env.DB_NAME,
    ssl: parseBoolean(process.env.DB_SSL, false),
    dialect: process.env.DB_DIALECT || 'mysql',
    
    dialectModule: await import('mysql2'),
    dialectOptions: {
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci',
      connectTimeout: 60000,
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    pool: {
      max: parseNumber(process.env.DB_POOL_MAX, 10),
      min: parseNumber(process.env.DB_POOL_MIN, 0),
      acquire: parseNumber(process.env.DB_POOL_ACQUIRE, 30000),
      idle: parseNumber(process.env.DB_POOL_IDLE, 10000)
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
    timezone: '+00:00',
    logging: process.env.NODE_ENV !== 'production'
  },

  jwt: {
    secret: process.env.JWT_SECRET, // Your JWT secret
    expiry: process.env.JWT_EXPIRY || '7d',
    refreshExpiry: process.env.JWT_REFRESH_EXPIRY || '30d',
    issuer: process.env.JWT_ISSUER || 'buildtrack',
    audience: process.env.JWT_AUDIENCE || 'buildtrack-api'
  },

  cors: {
    origin: process.env.CORS_ORIGIN, // Your frontend URL
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type', 
      'Authorization', 
      'X-Requested-With', 
      'Accept',
      'X-Refresh-Token'
    ],
    exposedHeaders: ['X-Refresh-Token'],
    maxAge: 86400 // 24 hours
  },

  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseNumber(process.env.REDIS_PORT, 6379),
    password: process.env.REDIS_PASSWORD || undefined,
    db: parseNumber(process.env.REDIS_DB, 0),
    keyPrefix: process.env.REDIS_KEY_PREFIX || 'buildtrack:'
  },

  rateLimit: {
    windowMs: parseNumber(process.env.RATE_LIMIT_WINDOW, 15) * 60 * 1000,
    max: parseNumber(process.env.RATE_LIMIT_MAX, 100),
    message: 'Too many requests from this IP, please try again later.'
  },

  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.NODE_ENV === 'production' ? 'json' : 'pretty',
    file: process.env.LOG_FILE || 'logs/combined.log',
    errorFile: process.env.LOG_ERROR_FILE || 'logs/error.log'
  },

  security: {
    bcryptRounds: parseNumber(process.env.BCRYPT_ROUNDS, 12),
    rateLimit: {
      windowMs: parseNumber(process.env.RATE_LIMIT_WINDOW, 15) * 60 * 1000,
      max: parseNumber(process.env.RATE_LIMIT_MAX, 100)
    }
  },

  email: {
    host: process.env.SMTP_HOST || undefined,
    port: parseNumber(process.env.SMTP_PORT, 587),
    secure: parseBoolean(process.env.SMTP_SECURE || 'false'),
    auth: {
      user: process.env.SMTP_USER || undefined,
      pass: process.env.SMTP_PASS || undefined
    },
    from: process.env.EMAIL_FROM || 'noreply@buildtrack.com'
  },

  upload: {
    maxFileSize: parseNumber(process.env.MAX_FILE_SIZE, 50 * 1024 * 1024), // 50MB
    allowedMimeTypes: [
      'image/jpeg', 
      'image/png', 
      'image/gif', 
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ],
    uploadDir: process.env.UPLOAD_DIR || 'uploads'
  },

  features: {
    enable2FA: parseBoolean(process.env.ENABLE_2FA || 'false'),
    enableEmailVerification: parseBoolean(process.env.ENABLE_EMAIL_VERIFICATION || 'true'),
    enablePasswordReset: parseBoolean(process.env.ENABLE_PASSWORD_RESET || 'true'),
    enableNotifications: parseBoolean(process.env.ENABLE_NOTIFICATIONS || 'true'),
    enableAuditLogs: parseBoolean(process.env.ENABLE_AUDIT_LOGS || 'true'),
    enableFileUploads: parseBoolean(process.env.ENABLE_FILE_UPLOADS || 'true')
  },

  urls: {
    client: process.env.CORS_ORIGIN,
    api: process.env.API_URL || `http://localhost:${parseNumber(process.env.PORT, 10000)}`,
    docs: process.env.API_DOCS_URL || '/api-docs'
  }
};

// Log configuration status (excluding sensitive data)
console.log('✅ Configuration loaded successfully');
console.log(`📊 Environment: ${config.app.env}`);
console.log(`🗄️  Database: ${config.database.host}:${config.database.port}/${config.database.name}`);
console.log(`🔐 SSL: ${config.database.ssl ? 'Enabled' : 'Disabled'}`);
console.log(`🌐 CORS: ${config.cors.origin}`);
console.log(`📦 Redis: ${config.redis.host}:${config.redis.port}`);

// Export the configuration
export default config;