#!/usr/bin/env node

const { Client } = require('pg');

const commonPasswords = [
  'password',
  'postgres',
  'admin',
  'root',
  '123456',
  '', // empty password
  'postgres123',
  'admin123'
];

async function testPassword(password) {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    database: 'postgres', // Try connecting to default 'postgres' database first
    user: 'postgres',
    password: password
  });

  try {
    await client.connect();
    console.log(`✅ SUCCESS! Password found: "${password}"`);
    await client.end();
    return password;
  } catch (error) {
    console.log(`❌ Failed with password: "${password}"`);
    await client.end();
    return null;
  }
}

async function main() {
  console.log('🔍 Testing common PostgreSQL passwords...\n');
  
  for (const password of commonPasswords) {
    const result = await testPassword(password);
    if (result) {
      console.log(`\n🎉 Found working password: "${result}"`);
      console.log('\n📝 Update your .env file with:');
      console.log(`DB_PASSWORD=${result}`);
      console.log(`DATABASE_URL=postgresql://postgres:${result}@localhost:5432/aipply_crawler`);
      return;
    }
  }
  
  console.log('\n❌ None of the common passwords worked.');
  console.log('\n💡 Try these solutions:');
  console.log('1. Reset PostgreSQL password:');
  console.log('   - Windows: Use pgAdmin or psql command line');
  console.log('   - Or reinstall PostgreSQL with a known password');
  console.log('2. Use a different user:');
  console.log('   - Create a new PostgreSQL user with a known password');
  console.log('3. Use Docker (easiest):');
  console.log('   docker run --name postgres -e POSTGRES_PASSWORD=mypassword -p 5432:5432 -d postgres');
}

main().catch(console.error);
