import { sequelize } from '../config/database.js';
import redisClient from '../config/redis.js';
import os from 'os';
import logger from '../utils/logger.js';
import { Op } from 'sequelize';

export const healthCheck = async (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0',
    services: {
      database: 'unknown',
      redis: 'unknown'
    },
    system: {
      memory: {
        total: os.totalmem(),
        free: os.freemem(),
        used: os.totalmem() - os.freemem()
      },
      cpu: os.cpus().length,
      load: os.loadavg()
    }
  };

  try {
    await sequelize.authenticate();
    health.services.database = 'healthy';
  } catch (error) {
    health.services.database = 'unhealthy';
    health.status = 'degraded';
    logger.error('Database health check failed:', error);
  }

  try {
    await redisClient.ping();
    health.services.redis = 'healthy';
  } catch (error) {
    health.services.redis = 'unhealthy';
    health.status = 'degraded';
    logger.error('Redis health check failed:', error);
  }

  const statusCode = health.status === 'ok' ? 200 : 503;
  res.status(statusCode).json(health);
};

export const metrics = async (req, res) => {
  const metrics = {
    requests: {
      total: 0,
      byEndpoint: {},
      byMethod: {}
    },
    users: {
      total: 0,
      active: 0,
      byRole: {}
    },
    projects: {
      total: 0,
      active: 0,
      byStatus: {}
    }
  };

  try {
    // Get user stats
    const users = await User.findAll();
    metrics.users.total = users.length;
    metrics.users.active = users.filter(u => u.isActive).length;
    users.forEach(u => {
      metrics.users.byRole[u.role] = (metrics.users.byRole[u.role] || 0) + 1;
    });

    // Get project stats
    const projects = await Project.findAll();
    metrics.projects.total = projects.length;
    metrics.projects.active = projects.filter(p => p.status === 'active').length;
    projects.forEach(p => {
      metrics.projects.byStatus[p.status] = (metrics.projects.byStatus[p.status] || 0) + 1;
    });

    res.json(metrics);
  } catch (error) {
    logger.error('Metrics error:', error);
    res.status(500).json({ error: error.message });
  }
};
