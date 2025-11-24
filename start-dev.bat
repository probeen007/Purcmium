@echo off
echo 🌟 Starting Purcmium Development Environment...

REM Check if .env files exist
if not exist "server\.env" (
    echo ⚠️ Server .env file not found. Please create server\.env with required variables.
    echo 📄 See README.md for environment setup instructions.
    pause
    exit /b 1
)

if not exist "client\.env" (
    echo ⚠️ Client .env file not found. Please create client\.env with REACT_APP_API_URL.
    echo 📄 See README.md for environment setup instructions.
    pause
    exit /b 1
)

REM Install dependencies if node_modules don't exist
if not exist "server\node_modules" (
    echo 📦 Installing dependencies...
    npm run install-all
)
if not exist "client\node_modules" (
    echo 📦 Installing dependencies...
    npm run install-all
)

echo 🚀 Starting development servers...
echo 📱 Frontend: http://localhost:3000
echo 🔧 Backend API: http://localhost:5000
echo 🔐 Admin Panel: http://localhost:3000/webapp/admin
echo.
echo Default Admin Credentials:
echo Username: admin
echo Password: admin123456
echo.
echo Press Ctrl+C to stop all services

REM Start development
npm run dev