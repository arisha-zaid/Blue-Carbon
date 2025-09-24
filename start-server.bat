@echo off
echo 🌊 Starting Blue Carbon API Server...
echo.

cd backend

echo Checking if Node.js is installed...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js is installed
echo.

echo Checking if dependencies are installed...
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    npm install
    if errorlevel 1 (
        echo ❌ Failed to install dependencies
        pause
        exit /b 1
    )
    echo ✅ Dependencies installed
    echo.
)

echo 🚀 Starting server...
echo.
echo Server will be available at: http://localhost:5000
echo API Documentation: http://localhost:5000/api/health
echo Client Example: Open CLIENT_EXAMPLE.html in your browser
echo.
echo Press Ctrl+C to stop the server
echo.

npm start