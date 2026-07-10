import { sequelize, testConnection } from './src/config/database.js';
import User from './src/models/User.js';

const test = async () => {
  try {
    console.log('�� Testing MySQL connection...');
    
    const connected = await testConnection();
    if (!connected) {
      console.log('❌ Failed to connect to MySQL');
      process.exit(1);
    }

    console.log('✅ MySQL connection successful');

    // Sync the User model
    await User.sync({ alter: true });
    console.log('✅ User table synced');

    // Count users
    const count = await User.count();
    console.log(`👥 Total users: ${count}`);

    console.log('✅ All tests passed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
};

test();
