import { sequelize } from './src/config/database.js';
import logger from './src/utils/logger.js';

async function migrateDatabase() {
  try {
    await sequelize.authenticate();
    logger.info('✅ Database connected successfully');

    // Sync all models
    await sequelize.sync({ alter: true });
    logger.info('✅ Database synced successfully');

    logger.info('✅ Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    logger.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrateDatabase();
