#!/usr/bin/env node

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

console.log('🗄️  Setting up database connection...\n');

// Get database configuration from environment
let config;

if (process.env.DATABASE_URL) {
  // Parse DATABASE_URL
  const url = new URL(process.env.DATABASE_URL);
  config = {
    host: url.hostname,
    port: parseInt(url.port) || 5432,
    database: url.pathname.slice(1), // Remove leading slash
    user: url.username,
    password: url.password,
    ssl: { rejectUnauthorized: false } // Railway requires SSL
  };
} else {
  // Fallback to individual environment variables
  config = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || 'aipply_crawler',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  };
}

// Try to connect with default settings
async function testConnection(config) {
  const client = new Client(config);
  
  try {
    await client.connect();
    console.log('✅ Database connection successful!');
    console.log(`   Host: ${config.host}:${config.port}`);
    console.log(`   Database: ${config.database}`);
    console.log(`   User: ${config.user}`);
    await client.end();
    return true;
  } catch (error) {
    console.log('❌ Database connection failed:');
    console.log(`   Error: ${error.message}`);
    await client.end();
    return false;
  }
}

// Create .env file with database configuration
function createEnvFile() {
  const envPath = path.join(__dirname, '..', '.env');
  
  if (fs.existsSync(envPath)) {
    console.log('📝 .env file already exists. Please update it manually if needed.\n');
    return;
  }

  const envContent = `# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DATABASE_URL=postgresql://postgres:password@localhost:5432/aipply_crawler
DB_HOST=localhost
DB_PORT=5432
DB_NAME=aipply_crawler
DB_USER=postgres
DB_PASSWORD=password

# Exa API Configuration
EXA_API_KEY=your_exa_api_key_here
EXA_BASE_URL=https://api.exa.ai

# Security
JWT_SECRET=your_jwt_secret_here
API_KEY=your_api_key_here

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info`;

  fs.writeFileSync(envPath, envContent);
  console.log('📝 Created .env file with default database configuration.\n');
}

async function main() {
  // Create .env file
  createEnvFile();
  
  // Test connection
  console.log('🔍 Testing database connection...');
  console.log(`   Using: ${config.host}:${config.port}/${config.database}`);
  const connected = await testConnection(config);
  
  if (!connected) {
    console.log('\n📋 To fix this issue:');
    console.log('1. Make sure PostgreSQL is running on your system');
    console.log('2. Create a database named "aipply_crawler"');
    console.log('3. Update the .env file with your correct database credentials');
    console.log('4. Or use a connection string format:');
    console.log('   DATABASE_URL=postgresql://username:password@localhost:5432/aipply_crawler');
    console.log('\n💡 Common solutions:');
    console.log('   - Install PostgreSQL: https://www.postgresql.org/download/');
    console.log('   - Use Docker: docker run --name postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres');
    console.log('   - Use Railway: https://railway.app (provides free PostgreSQL)');
  } else {
    console.log('\n🎉 Database setup complete! You can now run:');
    console.log('   npm run migrate');
  }
}

main().catch(console.error);
