import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import logger from '../utils/logger.js';

const execAsync = promisify(exec);

export const backupDatabase = async () => {
  try {
    const backupDir = path.join(process.cwd(), 'backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(backupDir, `backup-${timestamp}.sqlite3`);

    if (process.env.DB_DIALECT === 'sqlite') {
      fs.copyFileSync(
        path.join(process.cwd(), 'database.sqlite'),
        backupFile
      );
      logger.info(`✅ Database backup created: ${backupFile}`);
    } else {
      // PostgreSQL backup
      const { stdout } = await execAsync(
        `PGPASSWORD=${process.env.DB_PASSWORD} pg_dump -h ${process.env.DB_HOST} -U ${process.env.DB_USER} ${process.env.DB_NAME} > ${backupFile}.sql`
      );
      logger.info(`✅ PostgreSQL backup created: ${backupFile}.sql`);
    }

    // Clean old backups (keep last 30)
    const files = fs.readdirSync(backupDir);
    const sorted = files
      .filter(f => f.startsWith('backup-'))
      .sort((a, b) => {
        return fs.statSync(path.join(backupDir, a)).mtime - 
               fs.statSync(path.join(backupDir, b)).mtime;
      });

    while (sorted.length > 30) {
      const oldFile = sorted.shift();
      fs.unlinkSync(path.join(backupDir, oldFile));
      logger.info(`🗑️ Removed old backup: ${oldFile}`);
    }

    return backupFile;
  } catch (error) {
    logger.error('Backup failed:', error);
    throw error;
  }
};

export const restoreDatabase = async (backupFile) => {
  try {
    if (!fs.existsSync(backupFile)) {
      throw new Error('Backup file not found');
    }

    if (process.env.DB_DIALECT === 'sqlite') {
      fs.copyFileSync(backupFile, path.join(process.cwd(), 'database.sqlite'));
      logger.info(`✅ Database restored from: ${backupFile}`);
    } else {
      const { stdout } = await execAsync(
        `PGPASSWORD=${process.env.DB_PASSWORD} psql -h ${process.env.DB_HOST} -U ${process.env.DB_USER} ${process.env.DB_NAME} < ${backupFile}`
      );
      logger.info(`✅ PostgreSQL restored from: ${backupFile}`);
    }

    return true;
  } catch (error) {
    logger.error('Restore failed:', error);
    throw error;
  }
};

// Schedule automatic backups
export const scheduleBackups = () => {
  const cron = require('node-cron');
  
  // Run daily at 2 AM
  cron.schedule('0 2 * * *', async () => {
    await backupDatabase();
    logger.info('✅ Scheduled backup completed');
  });
};
