import { sequelize } from '../config/database.js';
import logger from '../utils/logger.js';

const reset = async () => {
  try {
    logger.info('🔄 Resetting database...');
    
    // Drop all tables
    await sequelize.drop();
    logger.info('✅ Tables dropped successfully.');
    
    // Recreate tables
    await sequelize.sync({ force: true });
    logger.info('✅ Tables recreated successfully.');
    
    logger.info('✅ Database reset completed!');
    process.exit(0);
  } catch (error) {
    logger.error('❌ Reset failed:', error);
    process.exit(1);
  }
};

reset();
