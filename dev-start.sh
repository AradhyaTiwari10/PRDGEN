#!/bin/bash

# Development startup script for Quill Collaborative Editor
# This script starts both the WebSocket server and Vite development server

echo "🚀 Starting Quill Collaborative Editor Development Environment"
echo "============================================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

echo "🔧 Starting WebSocket server and Vite development server..."
echo "📡 WebSocket server will run on ws://localhost:1234"
echo "🌐 Vite development server will run on http://localhost:8081"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Start both servers using npm script
npm run dev
