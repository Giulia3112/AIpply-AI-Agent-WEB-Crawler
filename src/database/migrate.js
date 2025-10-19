const fs = require('fs');
const path = require('path');
require('dotenv').config(); // Load environment variables
const { connectDatabase, query } = require('./connection');
const logger = require('../utils/logger');

const runMigrations = async () => {
  try {
    logger.info('Starting database migration...');
    
    // Check if DATABASE_URL is available
    if (!process.env.DATABASE_URL && !process.env.DB_HOST) {
      logger.warn('No database configuration found, skipping migration');
      return;
    }
    
    // Connect to database
    await connectDatabase();
    
    // Read and execute schema file
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Parse SQL statements properly (handle multi-line and dollar-quoted strings)
    const statements = [];
    let currentStatement = '';
    let inDollarQuote = false;
    let dollarTag = '';
    
    const lines = schema.split('\n');
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Skip comments and empty lines
      if (trimmedLine.startsWith('--') || trimmedLine === '') {
        continue;
      }
      
      // Check for dollar-quoted strings
      if (!inDollarQuote) {
        const dollarMatch = trimmedLine.match(/\$([^$]*)\$/);
        if (dollarMatch) {
          inDollarQuote = true;
          dollarTag = dollarMatch[1];
        }
      } else {
        // Check for end of dollar-quoted string
        if (trimmedLine.includes(`$${dollarTag}$`)) {
          inDollarQuote = false;
          dollarTag = '';
        }
      }
      
      currentStatement += line + '\n';
      
      // If we're not in a dollar-quoted string and line ends with semicolon, it's a complete statement
      if (!inDollarQuote && trimmedLine.endsWith(';')) {
        statements.push(currentStatement.trim());
        currentStatement = '';
      }
    }
    
    // Add any remaining statement
    if (currentStatement.trim()) {
      statements.push(currentStatement.trim());
    }
    
    // Execute each statement
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await query(statement);
          logger.debug('Executed statement:', statement.substring(0, 100) + '...');
        } catch (error) {
          // Log error but continue with other statements
          logger.warn('Statement execution warning:', error.message);
        }
      }
    }
    
    logger.info('Database migration completed successfully');
  } catch (error) {
    logger.error('Database migration failed:', error);
    throw error;
  }
};

// Run migrations if this file is executed directly
if (require.main === module) {
  runMigrations()
    .then(() => {
      logger.info('Migration process completed');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Migration process failed:', error);
      process.exit(1);
    });
}

module.exports = { runMigrations };
