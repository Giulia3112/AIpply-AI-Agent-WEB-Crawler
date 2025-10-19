#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

// Simple console logging for production startup
const log = (message) => {
  console.log(`[${new Date().toISOString()}] ${message}`);
};

async function startApp() {
  try {
    log('Starting AIpply Web Crawler API...');
    
    // Run database migration first
    log('Running database migration...');
    const migrateProcess = spawn('node', ['src/database/migrate.js'], {
      stdio: 'inherit',
      env: process.env,
      cwd: process.cwd()
    });

    migrateProcess.on('close', (code) => {
      if (code === 0) {
        log('Database migration completed successfully');
        
        // Start the main application
        log('Starting main application...');
        const appProcess = spawn('node', ['src/server.js'], {
          stdio: 'inherit',
          env: process.env,
          cwd: process.cwd()
        });

        appProcess.on('close', (code) => {
          log(`Application exited with code ${code}`);
          process.exit(code);
        });

        appProcess.on('error', (error) => {
          console.error('Failed to start application:', error);
          process.exit(1);
        });
      } else {
        console.error(`Database migration failed with code ${code}`);
        process.exit(code);
      }
    });

    migrateProcess.on('error', (error) => {
      console.error('Failed to run database migration:', error);
      process.exit(1);
    });

  } catch (error) {
    console.error('Failed to start application:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
  log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

startApp();
