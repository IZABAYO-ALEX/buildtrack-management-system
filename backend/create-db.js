import { sequelize } from './src/config/database.js';
import bcrypt from 'bcryptjs';

const createDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');

    // Create users table manually with correct password
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY DEFAULT (uuid()),
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        full_name TEXT NOT NULL,
        role TEXT NOT NULL,
        phone TEXT,
        company_name TEXT,
        is_active INTEGER DEFAULT 1,
        is_verified INTEGER DEFAULT 0,
        last_login TEXT,
        created_by TEXT,
        verified_by TEXT,
        verified_at TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Generate hash for 'password123'
    const hash = await bcrypt.hash('password123', 10);
    console.log('📝 Hash generated:', hash);

    // Insert users
    await sequelize.query(`
      INSERT INTO users (id, email, password_hash, full_name, role, phone, company_name, is_active, is_verified)
      VALUES 
        ('c1', 'contractor@buildtrack.com', '${hash}', 'John Contractor', 'contractor', '+256701234567', 'BuildTrack Construction Ltd', 1, 1),
        ('c2', 'manager@buildtrack.com', '${hash}', 'Sarah Manager', 'site_manager', '+256701234568', NULL, 1, 1),
        ('c3', 'accountant@buildtrack.com', '${hash}', 'Peter Accountant', 'accountant', '+256701234569', NULL, 1, 1)
    `);

    console.log('✅ Users inserted');

    // Verify
    const users = await sequelize.query('SELECT email, password_hash FROM users');
    console.log('📋 Users in database:');
    users[0].forEach(u => {
      console.log('  -', u.email);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

createDB();
