#!/bin/bash

echo "🐘 Setting up PostgreSQL for BuildTrack..."

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed. Installing..."
    brew install postgresql
    brew services start postgresql
fi

# Create database
echo "📁 Creating database..."
createdb buildtrack_db 2>/dev/null || echo "Database already exists"

# Create user
echo "👤 Creating user..."
psql -c "CREATE USER buildtrack_user WITH PASSWORD 'secure_password';" 2>/dev/null || echo "User already exists"

# Grant privileges
psql -c "ALTER USER buildtrack_user WITH SUPERUSER;" 2>/dev/null
psql -c "GRANT ALL PRIVILEGES ON DATABASE buildtrack_db TO buildtrack_user;" 2>/dev/null

echo ""
echo "✅ PostgreSQL setup complete!"
echo ""
echo "📝 Update your .env file with:"
echo "   DB_DIALECT=postgres"
echo "   DB_HOST=localhost"
echo "   DB_PORT=5432"
echo "   DB_USER=buildtrack_user"
echo "   DB_PASSWORD=secure_password"
echo "   DB_NAME=buildtrack_db"
