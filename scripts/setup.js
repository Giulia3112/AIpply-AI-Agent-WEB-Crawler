#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Setting up AIpply Web Crawler API...\n');

// Check if .env exists
const envPath = path.join(__dirname, '..', '.env');
if (!fs.existsSync(envPath)) {
  console.log('📝 Creating .env file from template...');
  const envExample = fs.readFileSync(path.join(__dirname, '..', 'env.example'), 'utf8');
  fs.writeFileSync(envPath, envExample);
  console.log('✅ .env file created. Please update it with your configuration.\n');
} else {
  console.log('✅ .env file already exists.\n');
}

// Check if logs directory exists
const logsPath = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsPath)) {
  console.log('📁 Creating logs directory...');
  fs.mkdirSync(logsPath, { recursive: true });
  console.log('✅ Logs directory created.\n');
} else {
  console.log('✅ Logs directory already exists.\n');
}

// Check Node.js version
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);

if (majorVersion < 18) {
  console.log('⚠️  Warning: Node.js 18 or higher is recommended. Current version:', nodeVersion);
} else {
  console.log('✅ Node.js version check passed:', nodeVersion);
}

console.log('\n📋 Next steps:');
console.log('1. Update your .env file with your configuration');
console.log('2. Set up your PostgreSQL database');
console.log('3. Get your Exa API key from https://exa.ai');
console.log('4. Run: npm run migrate (to set up database schema)');
console.log('5. Run: npm run dev (to start development server)');
console.log('\n🎉 Setup complete!');
