#!/bin/bash
# ╔════════════════════════════════════════════╗
# ║   JHB StreamPulse Dashboard v2.1           ║
# ║   Double-click to launch                   ║
# ╚════════════════════════════════════════════╝

cd "$(dirname "$0")"
clear

echo ""
echo "  ╔══════════════════════════════════════════════╗"
echo "  ║   JHB StreamPulse Dashboard v2.1             ║"
echo "  ╚══════════════════════════════════════════════╝"
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
  echo "  ❌ Node.js is required but not installed."
  echo "     Install from: https://nodejs.org"
  echo ""
  read -p "  Press Enter to exit..."
  exit 1
fi

NODE_VERSION=$(node -v | sed 's/v//' | cut -d. -f1)
echo "  ✓ Node.js $(node -v)"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo ""
  echo "  📦 Installing dependencies (first run only)..."
  npm install --loglevel=error
  echo "  ✓ Dependencies installed"
fi

# Build frontend if needed
if [ ! -f "public/index.html" ] || [ "src/Dashboard.jsx" -nt "public/index.html" ]; then
  echo ""
  echo "  🔨 Building frontend..."
  npx vite build 2>/dev/null
  echo "  ✓ Frontend built"
fi

# Seed database if empty
if [ ! -f "data/streampulse.db" ]; then
  echo ""
  echo "  🗄️  Initializing database..."
  node seed.js
  echo "  ✓ Database ready"
fi

echo ""
echo "  🚀 Starting server..."
echo "  📊 Dashboard: http://localhost:8000"
if [ -n "$ANTHROPIC_API_KEY" ]; then
  echo "  ✨ AI Insights: ON"
else
  echo "  💡 AI Insights: OFF (export ANTHROPIC_API_KEY=sk-... to enable)"
fi
echo ""
echo "  Press Ctrl+C to stop"
echo ""

# Open browser
sleep 1
open "http://localhost:8000" 2>/dev/null || xdg-open "http://localhost:8000" 2>/dev/null &

# Start server
node server.js
