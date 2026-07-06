#!/bin/bash

echo "🔧 Setting up BuildTrack Environment..."

# Create backend .env
echo "📁 Creating backend .env..."
cat > backend/.env << 'EOT'
NODE_ENV=development
PORT=3000
DB_DIALECT=sqlite
DB_STORAGE=./database.sqlite
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=buildtrack_secret_key_$(openssl rand -hex 16)
JWT_EXPIRY=7d
CORS_ORIGIN=http://localhost:5173,http://127.0.0.1:5173
LOG_LEVEL=info
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads
ENABLE_EMAIL_NOTIFICATIONS=false
ENABLE_PUSH_NOTIFICATIONS=false
ENABLE_OFFLINE_MODE=true
EOT

# Create frontend .env
echo "📁 Creating frontend .env..."
cat > frontend/.env << 'EOT'
VITE_API_URL=http://localhost:3000/api/v1
VITE_APP_NAME=BuildTrack
VITE_APP_VERSION=1.0.0
VITE_ENABLE_NOTIFICATIONS=true
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_OFFLINE=false
EOT

# Create uploads directory
echo "📁 Creating uploads directory..."
mkdir -p backend/uploads

echo ""
echo "✅ Environment setup complete!"
echo ""
echo "📝 Next steps:"
echo "   1. Run: cd backend && npm run dev"
echo "   2. Run: cd frontend && npm run dev"
echo "   3. Access: http://localhost:5173"
echo ""
echo "🔑 Default credentials:"
echo "   Contractor: contractor@buildtrack.com / password123"
echo "   Site Manager: manager@buildtrack.com / password123"
echo "   Accountant: accountant@buildtrack.com / password123"
echo ""
echo "🐘 For PostgreSQL (Production):"
echo "   1. Run: ./setup-postgres.sh"
echo "   2. Update backend/.env with PostgreSQL config"
echo "   3. Run: node migrate.js"
