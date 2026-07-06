#!/bin/bash

echo "🚀 Deploying BuildTrack to Production..."

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose -f docker-compose.prod.yml down

# Build and start containers
echo "��️ Building and starting containers..."
docker-compose -f docker-compose.prod.yml up -d --build

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 10

# Run migrations
echo "📁 Running database migrations..."
docker exec buildtrack-backend node migrate.js

echo ""
echo "✅ Production deployment complete!"
echo ""
echo "🌐 Access the application:"
echo "   Frontend: http://localhost:80"
echo "   Backend: http://localhost:3000"
echo ""
echo "📝 Default credentials:"
echo "   Contractor: contractor@buildtrack.com / password123"
echo "   Site Manager: manager@buildtrack.com / password123"
echo "   Accountant: accountant@buildtrack.com / password123"
echo ""
echo "🔍 To view logs:"
echo "   docker logs buildtrack-backend -f"
echo "   docker logs buildtrack-frontend -f"
