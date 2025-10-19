#!/usr/bin/env node

const { spawn } = require('child_process');
const logger = require('./src/utils/logger');

async function startApp() {
  try {
    logger.info('Starting AIpply Web Crawler API...');
    
    // Run database migration first
    logger.info('Running database migration...');
    const migrateProcess = spawn('node', ['src/database/migrate.js'], {
      stdio: 'inherit',
      env: process.env
    });

    migrateProcess.on('close', (code) => {
      if (code === 0) {
        logger.info('Database migration completed successfully');
        
        // Start the main application
        logger.info('Starting main application...');
        const appProcess = spawn('node', ['src/server.js'], {
          stdio: 'inherit',
          env: process.env
        });

        appProcess.on('close', (code) => {
          logger.info(`Application exited with code ${code}`);
          process.exit(code);
        });

        appProcess.on('error', (error) => {
          logger.error('Failed to start application:', error);
          process.exit(1);
        });
      } else {
        logger.error(`Database migration failed with code ${code}`);
        process.exit(code);
      }
    });

    migrateProcess.on('error', (error) => {
      logger.error('Failed to run database migration:', error);
      process.exit(1);
    });

  } catch (error) {
    logger.error('Failed to start application:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

startApp();
