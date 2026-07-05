#!/bin/bash

echo "🏗️ Starting BuildTrack Complete System..."

echo "1. Killing processes..."
lsof -ti :3000 | xargs kill -9 2>/dev/null
pkill -f "nodemon" 2>/dev/null
pkill -f "vite" 2>/dev/null

echo "2. Setting up backend..."
cd ~/buildtrack/backend
rm -f database.sqlite
node src/scripts/seed.js

echo ""
echo "3. Starting backend..."
npm run dev &
sleep 5

echo ""
echo "4. Setting up frontend..."
cd ~/buildtrack/frontend
rm -rf node_modules/.vite

echo "5. Starting frontend..."
npm run dev &
sleep 3

echo ""
echo "✅ System Started!"
echo ""
echo "📝 LOGIN CREDENTIALS:"
echo "  👔 Contractor: contractor@buildtrack.com / password123"
echo "  🏗️ Site Manager: manager@buildtrack.com / password123"
echo "  💰 Accountant: accountant@buildtrack.com / password123"
echo ""
echo "🌐 Access: http://localhost:5173"
