#!/bin/bash

# Purcmium Development Startup Script
echo "🌟 Starting Purcmium Development Environment..."

# Check if MongoDB is running (optional check)
# You can uncomment this if you want to check for MongoDB
# if ! pgrep -x "mongod" > /dev/null; then
#     echo "⚠️ MongoDB doesn't appear to be running. Please start MongoDB first."
#     exit 1
# fi

# Check if .env files exist
if [ ! -f "server/.env" ]; then
    echo "⚠️ Server .env file not found. Please create server/.env with required variables."
    echo "📄 See README.md for environment setup instructions."
    exit 1
fi

if [ ! -f "client/.env" ]; then
    echo "⚠️ Client .env file not found. Please create client/.env with REACT_APP_API_URL."
    echo "📄 See README.md for environment setup instructions."
    exit 1
fi

# Install dependencies if node_modules don't exist
if [ ! -d "server/node_modules" ] || [ ! -d "client/node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm run install-all
fi

# Create admin user if it doesn't exist (you can uncomment this)
# echo "👤 Creating admin user..."
# cd server && node utils/createAdmin.js
# cd ..

echo "🚀 Starting development servers..."
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:5000"
echo "🔐 Admin Panel: http://localhost:3000/webapp/admin"
echo ""
echo "Default Admin Credentials:"
echo "Username: admin"
echo "Password: admin123456"
echo ""
echo "Press Ctrl+C to stop all services"

# Start development
npm run dev