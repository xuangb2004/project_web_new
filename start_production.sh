#!/bin/bash
# Script to start the server in production mode

# Navigate to the server directory
cd project_web/web_news/server

# Set environment variables for production
export NODE_ENV=production
# Add other environment variables as needed, e.g., DB_CONFIG

# Start the server
npm start
