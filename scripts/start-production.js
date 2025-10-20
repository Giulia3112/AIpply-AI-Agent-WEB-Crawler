#!/usr/bin/env node

// Production startup script for Railway deployment
const fs = require('fs');
const path = require('path');

// Ensure logs directory exists
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  try {
    fs.mkdirSync(logsDir, { recursive: true });
    console.log('Created logs directory');
  } catch (error) {
    console.warn('Could not create logs directory:', error.message);
  }
}

// Set production environment
process.env.NODE_ENV = 'production';

// Start the application
require('../src/server.js');