import { sequelize } from './src/config/database.js';
import User from './src/models/User.js';
import bcrypt from 'bcryptjs';

const seedDatabase = async () => {
  try {
    await sequelize.sync({ force: true });
    console.log('✅ Database synced');

    const salt = await bcrypt.genSalt(12);
    
    const users = await User.bulkCreate([
      {
        email: 'contractor@buildtrack.com',
        passwordHash: await bcrypt.hash('password123', salt),
        fullName: 'John Contractor',
        role: 'contractor',
        phone: '+256701234567',
        companyName: 'BuildTrack Construction Ltd',
        isActive: true,
        isVerified: true,
        createdBy: null
      },
      {
        email: 'manager@buildtrack.com',
        passwordHash: await bcrypt.hash('password123', salt),
        fullName: 'Sarah Manager',
        role: 'site_manager',
        phone: '+256701234568',
        isActive: true,
        isVerified: true,
        createdBy: null
      },
      {
        email: 'accountant@buildtrack.com',
        passwordHash: await bcrypt.hash('password123', salt),
        fullName: 'Peter Accountant',
        role: 'accountant',
        phone: '+256701234569',
        isActive: true,
        isVerified: true,
        createdBy: null
      }
    ]);

    console.log(`✅ Created ${users.length} users`);
    console.log('');
    console.log('📝 LOGIN CREDENTIALS:');
    console.log('  👔 Contractor: contractor@buildtrack.com / password123');
    console.log('  🏗️ Site Manager: manager@buildtrack.com / password123');
    console.log('  💰 Accountant: accountant@buildtrack.com / password123');
    console.log('');
    console.log('✅ Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();
