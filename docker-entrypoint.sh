#!/bin/sh

# Wait for database to be ready (optional)
echo "Waiting for database to be ready..."
sleep 5

# Run database migrations
echo "Running database migrations..."
npx prisma migrate deploy

# Start the application
echo "Starting the application..."
exec node server.js 