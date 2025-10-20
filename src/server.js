const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const logger = require('./utils/logger');
const { connectDatabase } = require('./database/connection');
const opportunityRoutes = require('./routes/opportunities');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const { corsOptions, rateLimitByApiKey } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors(corsOptions));

// Rate limiting with API key support
const limiter = rateLimitByApiKey(
  parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
);
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    version: '1.0.0'
  });
});

// API routes
app.use('/api/opportunities', opportunityRoutes);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Start server
async function startServer() {
  try {
    logger.info('Starting AIpply Crawler API server...');
    logger.info(`Environment: ${process.env.NODE_ENV}`);
    logger.info(`Port: ${PORT}`);
    
    // Check required environment variables
    const requiredEnvVars = ['EXA_API_KEY', 'API_KEY'];
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      logger.warn(`Missing environment variables: ${missingVars.join(', ')}`);
      logger.warn('Server will start but some features may not work properly');
    }

    // Connect to database (optional for basic functionality)
    try {
      await connectDatabase();
      logger.info('Database connected successfully');

      // Run database migration
      logger.info('Running database migration...');
      try {
        const runMigrations = require('./database/migrate');
        await runMigrations();
        logger.info('Database migration completed successfully');
      } catch (migrationError) {
        logger.warn('Database migration warning:', migrationError.message);
        // Continue startup even if migration has warnings
      }
    } catch (dbError) {
      logger.warn('Database connection failed:', dbError.message);
      logger.warn('Server will start without database connection');
    }

    // Start the server
    const server = app.listen(PORT, () => {
      logger.info(`✅ AIpply Crawler API server running on port ${PORT}`);
      logger.info(`🔗 Health check: http://localhost:${PORT}/health`);
      logger.info('🚀 Server is ready to accept requests');
    });

    // Handle server errors
    server.on('error', (error) => {
      logger.error('Server error:', error);
      process.exit(1);
    });

  } catch (error) {
    logger.error('Failed to start server:', error);
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

startServer();

module.exports = app;
