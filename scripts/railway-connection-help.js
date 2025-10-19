#!/usr/bin/env node

console.log('🔍 Railway Database Connection Help\n');

console.log('Your current connection string uses an internal hostname:');
console.log('postgresql://postgres:WRgEaYJJYoBqsvXSfjDBVLSOxaqtcSrz@postgres-8b_e.railway.internal:5432/railway\n');

console.log('❌ This won\'t work from your local machine because:');
console.log('   - "postgres-8b_e.railway.internal" is only accessible within Railway\'s network');
console.log('   - You need the PUBLIC hostname for external connections\n');

console.log('✅ To get the correct connection string:');
console.log('1. Go to your Railway dashboard: https://railway.app');
console.log('2. Click on your PostgreSQL service');
console.log('3. Go to the "Connect" tab');
console.log('4. Look for "Public Networking" section');
console.log('5. Copy the PUBLIC connection string (should look like):');
console.log('   postgresql://postgres:password@containers-us-west-xxx.railway.app:5432/railway\n');

console.log('🔧 Alternative: Enable Public Networking');
console.log('1. In Railway dashboard, go to your PostgreSQL service');
console.log('2. Click on "Settings" tab');
console.log('3. Scroll down to "Public Networking"');
console.log('4. Toggle it ON');
console.log('5. Copy the new public connection string\n');

console.log('📝 Once you have the public connection string:');
console.log('1. Update your .env file with the new DATABASE_URL');
console.log('2. Run: npm run migrate');
console.log('3. Run: npm run dev');
