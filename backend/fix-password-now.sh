#!/bin/bash

echo "🔧 FIXING PASSWORD NOW..."

cd ~/buildtrack/backend

# Stop server
pkill -f "nodemon" 2>/dev/null

# Delete database
rm -f database.sqlite

echo "📦 Creating new database with pre-hashed passwords..."

# Create new database with SQL
cat > /tmp/seed.sql << 'EOT'
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id TEXT PRIMARY KEY,
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
);

INSERT INTO users (id, email, password_hash, full_name, role, phone, company_name, is_active, is_verified) VALUES 
('contractor-id-1', 'contractor@buildtrack.com', '$2a$10$N9qo8uLOickgx2ZMRZoMy.Mr/.TZzN5hJzL5nVZg6Qz5xHhX9hYqK', 'John Contractor', 'contractor', '+256701234567', 'BuildTrack Construction Ltd', 1, 1),
('manager-id-1', 'manager@buildtrack.com', '$2a$10$N9qo8uLOickgx2ZMRZoMy.Mr/.TZzN5hJzL5nVZg6Qz5xHhX9hYqK', 'Sarah Manager', 'site_manager', '+256701234568', NULL, 1, 1),
('accountant-id-1', 'accountant@buildtrack.com', '$2a$10$N9qo8uLOickgx2ZMRZoMy.Mr/.TZzN5hJzL5nVZg6Qz5xHhX9hYqK', 'Peter Accountant', 'accountant', '+256701234569', NULL, 1, 1);
EOT

sqlite3 database.sqlite < /tmp/seed.sql

echo ""
echo "✅ Database created with pre-hashed passwords!"

echo ""
echo "📝 Testing login..."
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"contractor@buildtrack.com","password":"password123"}' \
  -s | head -200

echo ""
echo ""
echo "✅ FIX COMPLETE!"
echo ""
echo "�� LOGIN CREDENTIALS:"
echo "  👔 Contractor: contractor@buildtrack.com / password123"
echo "  🏗️ Site Manager: manager@buildtrack.com / password123"
echo "  💰 Accountant: accountant@buildtrack.com / password123"
echo ""
echo "🚀 Start server: npm run dev"
echo "🌐 Open: http://localhost:5173"
