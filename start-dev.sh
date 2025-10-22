#!/bin/bash

echo "🚀 Starting BEN-MARKET Development Environment"
echo "=============================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if MongoDB is running (for local development)
if ! pgrep -x "mongod" > /dev/null; then
    echo "⚠️  MongoDB is not running. Starting MongoDB..."
    echo "   Please make sure MongoDB is installed and running on your system."
    echo "   You can start it with: sudo systemctl start mongod"
    echo ""
fi

# Function to start backend
start_backend() {
    echo "🔧 Starting Backend Server..."
    cd backend
    if [ ! -d "node_modules" ]; then
        echo "📦 Installing backend dependencies..."
        npm install
    fi
    echo "🚀 Starting backend on http://localhost:5000"
    npm run dev &
    BACKEND_PID=$!
    cd ..
}

# Function to start frontend
start_frontend() {
    echo "🔧 Starting Frontend Server..."
    cd frontend
    if [ ! -d "node_modules" ]; then
        echo "📦 Installing frontend dependencies..."
        npm install
    fi
    echo "🚀 Starting frontend on http://localhost:5173"
    npm run dev &
    FRONTEND_PID=$!
    cd ..
}

# Start both services
start_backend
sleep 3
start_frontend

echo ""
echo "✅ Both servers are starting up!"
echo "📱 Frontend: http://localhost:5173"
echo "🔧 Backend API: http://localhost:5000"
echo "📊 Backend Health: http://localhost:5000/health"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for user to stop
wait
