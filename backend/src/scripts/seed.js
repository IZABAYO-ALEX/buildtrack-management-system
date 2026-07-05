import { sequelize } from '../config/database.js';
import User from '../models/User.js';
import Project from '../models/Project.js';
import Expense from '../models/Expense.js';
import Worker from '../models/Worker.js';
import WorkerPayment from '../models/WorkerPayment.js';
import Material from '../models/Material.js';
import Attendance from '../models/Attendance.js';
import bcrypt from 'bcryptjs';

const seedDatabase = async () => {
  try {
    await sequelize.sync({ force: true });
    console.log('✅ Database synced');

    const users = await User.bulkCreate([
      {
        email: 'contractor@buildtrack.com',
        passwordHash: await bcrypt.hash('password123', 10),
        fullName: 'John Contractor',
        role: 'contractor',
        phone: '+256701234567',
        companyName: 'BuildTrack Construction Ltd',
        isActive: true
      },
      {
        email: 'manager@buildtrack.com',
        passwordHash: await bcrypt.hash('password123', 10),
        fullName: 'Sarah Manager',
        role: 'site_manager',
        phone: '+256701234568',
        isActive: true
      },
      {
        email: 'accountant@buildtrack.com',
        passwordHash: await bcrypt.hash('password123', 10),
        fullName: 'Peter Accountant',
        role: 'accountant',
        phone: '+256701234569',
        isActive: true
      }
    ]);

    console.log(`✅ Created ${users.length} users`);

    const projects = await Project.bulkCreate([
      {
        name: 'Kampala Heights Apartment',
        clientName: 'Kampala Developers Ltd',
        description: '12-story residential apartment building in Kampala',
        budget: 500000,
        location: 'Kampala, Uganda',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        status: 'active',
        contractorId: users[0].id
      },
      {
        name: 'Entebbe Road Mall',
        clientName: 'Entebbe Commercial Properties',
        description: 'Shopping mall along Entebbe Road',
        budget: 750000,
        location: 'Entebbe, Uganda',
        startDate: '2024-03-01',
        endDate: '2025-02-28',
        status: 'active',
        contractorId: users[0].id
      }
    ]);

    console.log(`✅ Created ${projects.length} projects`);

    const workers = await Worker.bulkCreate([
      {
        fullName: 'James Muwonge',
        phone: '+256701234570',
        role: 'Site Foreman',
        rate: 15000,
        projectId: projects[0].id,
        isActive: true,
        joinedDate: '2024-01-01'
      },
      {
        fullName: 'Mary Nakato',
        phone: '+256701234571',
        role: 'Skilled Laborer',
        rate: 10000,
        projectId: projects[0].id,
        isActive: true,
        joinedDate: '2024-01-05'
      }
    ]);

    console.log(`✅ Created ${workers.length} workers`);

    console.log('');
    console.log('📝 LOGIN CREDENTIALS:');
    console.log('  Contractor: contractor@buildtrack.com / password123');
    console.log('  Site Manager: manager@buildtrack.com / password123');
    console.log('  Accountant: accountant@buildtrack.com / password123');
    console.log('');
    console.log('✅ Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();
