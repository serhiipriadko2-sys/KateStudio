#!/bin/bash
set -e

# Ensure we are in the project root
cd "$(dirname "$0")/.."

echo "🚀 Starting Jules Environment Setup..."

# Install dependencies
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
else
    echo "✅ Dependencies already installed."
fi

# Build shared workspace
echo "🏗️ Building shared workspace..."
npm run build:all

# Run Typecheck to ensure integrity
echo "🔍 Running Typecheck..."
npm run typecheck

echo "✅ Setup Complete!"
