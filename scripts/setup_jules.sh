#!/bin/bash
set -e

echo "Starting Jules setup..."

# Create .env if it doesn't exist, using environment variables
if [ ! -f .env ]; then
  echo "Creating .env file from environment variables..."
  cat <<EOT > .env
VITE_SUPABASE_URL=${VITE_SUPABASE_URL}
VITE_SUPABASE_ANON_KEY=${VITE_SUPABASE_ANON_KEY}
VITE_APP_NAME="${VITE_APP_NAME}"
VITE_APP_URL=${VITE_APP_URL}
VITE_DEV_MODE=${VITE_DEV_MODE}
EOT
fi

# Install dependencies
echo "Installing dependencies..."
npm install

# Run type check to ensure code quality
echo "Running type check..."
npm run typecheck

# Run build to ensure everything works
echo "Running build..."
npm run build:all

echo "Jules setup complete!"
