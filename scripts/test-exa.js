#!/usr/bin/env node

require('dotenv').config();
const ExaService = require('../src/services/exaService');

async function testExaAPI() {
  try {
    console.log('🔍 Testing Exa API connection...\n');
    
    const exaService = new ExaService();
    
    // Test connection
    console.log('📡 Testing API connection...');
    const isConnected = await exaService.testConnection();
    
    if (isConnected) {
      console.log('✅ Exa API connection successful!\n');
      
      // Test search
      console.log('🔍 Testing search functionality...');
      const results = await exaService.searchOpportunities('scholarships for women in STEM', {
        country: 'United States',
        type: 'scholarship'
      });
      
      console.log(`✅ Search successful! Found ${results.length} results\n`);
      
      if (results.length > 0) {
        console.log('📋 Sample result:');
        console.log(`   Title: ${results[0].title || 'N/A'}`);
        console.log(`   URL: ${results[0].url || 'N/A'}`);
        console.log(`   Text: ${(results[0].text || '').substring(0, 100)}...`);
      }
      
    } else {
      console.log('❌ Exa API connection failed');
      console.log('   Please check your EXA_API_KEY in the .env file');
    }
    
  } catch (error) {
    console.log('❌ Error testing Exa API:');
    console.log(`   ${error.message}`);
    
    if (error.message.includes('API key')) {
      console.log('\n💡 Make sure your EXA_API_KEY is correct in the .env file');
    }
  }
}

testExaAPI();
