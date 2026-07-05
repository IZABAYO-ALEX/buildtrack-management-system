import { sequelize } from '../config/database.js';
import User from '../models/User.js';
import Project from '../models/Project.js';
import Expense from '../models/Expense.js';
import Worker from '../models/Worker.js';
import WorkerPayment from '../models/WorkerPayment.js';
import Material from '../models/Material.js';
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
        companyName: 'BuildTrack Construction Ltd'
      },
      {
        email: 'manager@buildtrack.com',
        passwordHash: await bcrypt.hash('password123', 10),
        fullName: 'Sarah Manager',
        role: 'site_manager',
        phone: '+256701234568'
      },
      {
        email: 'accountant@buildtrack.com',
        passwordHash: await bcrypt.hash('password123', 10),
        fullName: 'Peter Accountant',
        role: 'accountant',
        phone: '+256701234569'
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
      },
      {
        name: 'Jinja Industrial Complex',
        clientName: 'Jinja Industrial Park',
        description: 'Industrial complex in Jinja',
        budget: 1000000,
        location: 'Jinja, Uganda',
        startDate: '2024-06-01',
        endDate: '2025-05-31',
        status: 'planning',
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
        isActive: true
      },
      {
        fullName: 'Mary Nakato',
        phone: '+256701234571',
        role: 'Skilled Laborer',
        rate: 10000,
        projectId: projects[0].id,
        isActive: true
      },
      {
        fullName: 'Robert Odongo',
        phone: '+256701234572',
        role: 'Unskilled Laborer',
        rate: 8000,
        projectId: projects[0].id,
        isActive: true
      },
      {
        fullName: 'Grace Atim',
        phone: '+256701234573',
        role: 'Site Foreman',
        rate: 15000,
        projectId: projects[1].id,
        isActive: true
      },
      {
        fullName: 'David Ouma',
        phone: '+256701234574',
        role: 'Skilled Laborer',
        rate: 10000,
        projectId: projects[1].id,
        isActive: true
      }
    ]);

    console.log(`✅ Created ${workers.length} workers`);

    await Expense.bulkCreate([
      {
        projectId: projects[0].id,
        category: 'Materials',
        amount: 25000,
        description: 'Purchase of cement and steel bars',
        date: '2024-01-15',
        recordedBy: users[1].id,
        status: 'approved'
      },
      {
        projectId: projects[0].id,
        category: 'Labor',
        amount: 15000,
        description: 'Weekly wages for construction team',
        date: '2024-01-20',
        recordedBy: users[1].id,
        status: 'approved'
      },
      {
        projectId: projects[0].id,
        category: 'Equipment',
        amount: 8000,
        description: 'Excavator rental',
        date: '2024-01-25',
        recordedBy: users[1].id,
        status: 'pending'
      },
      {
        projectId: projects[1].id,
        category: 'Materials',
        amount: 30000,
        description: 'High-quality tiles for mall floors',
        date: '2024-03-15',
        recordedBy: users[1].id,
        status: 'approved'
      }
    ]);

    console.log('✅ Created expenses');

    await Material.bulkCreate([
      {
        projectId: projects[0].id,
        name: 'Cement',
        quantity: 500,
        unit: 'bags',
        unitCost: 8.5,
        supplier: 'Kampala Cement Co.',
        purchaseDate: '2024-01-15'
      },
      {
        projectId: projects[0].id,
        name: 'Steel Bars',
        quantity: 200,
        unit: 'pieces',
        unitCost: 25,
        supplier: 'Steel Uganda Ltd',
        purchaseDate: '2024-01-20'
      },
      {
        projectId: projects[1].id,
        name: 'Tiles',
        quantity: 1000,
        unit: 'sq meters',
        unitCost: 15,
        supplier: 'Tile World',
        purchaseDate: '2024-03-15'
      }
    ]);

    console.log('✅ Created materials');

    await WorkerPayment.bulkCreate([
      {
        workerId: workers[0].id,
        amount: 75000,
        paymentDate: '2024-01-25',
        paymentMethod: 'Bank Transfer',
        reference: 'PAY-001',
        recordedBy: users[1].id
      },
      {
        workerId: workers[1].id,
        amount: 50000,
        paymentDate: '2024-01-25',
        paymentMethod: 'Mobile Money',
        reference: 'PAY-002',
        recordedBy: users[1].id
      }
    ]);

    console.log('✅ Created worker payments');

    console.log('');
    console.log('📝 Login credentials:');
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
