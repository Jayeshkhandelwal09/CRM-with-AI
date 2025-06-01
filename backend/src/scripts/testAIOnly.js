const config = require('../config');
const VectorService = require('../services/vectorService');

/**
 * Simplified AI test without MongoDB dependency
 * 
 * This script tests:
 * 1. Vector database connection
 * 2. OpenAI API connection
 * 3. Basic embedding generation
 * 4. Vector storage and retrieval
 */

async function testAIOnly() {
  console.log('🧪 Starting AI-Only Setup Test...\n');

  try {
    // Check if OpenAI API key is configured
    if (!config.openaiApiKey || config.openaiApiKey === 'your_openai_api_key_here') {
      throw new Error('OpenAI API key not configured. Please set OPENAI_API_KEY in your .env file.');
    }

    // Test 1: Vector Service
    console.log('1️⃣ Testing Vector Service...');
    const vectorService = new VectorService();
    await vectorService.initialize();
    console.log('✅ Vector Service initialized successfully');
    
    // Test embedding generation
    console.log('2️⃣ Testing Embedding Generation...');
    const testText = "This is a test deal for a SaaS company worth $10,000";
    const embedding = await vectorService.generateEmbedding(testText);
    console.log(`✅ Generated embedding with ${embedding.length} dimensions`);
    
    // Test vector storage
    console.log('3️⃣ Testing Vector Storage...');
    await vectorService.storeVector(
      'deals',
      'test-deal-123',
      testText,
      { value: 10000, industry: 'SaaS', outcome: 'closed_won' }
    );
    console.log('✅ Vector stored successfully');
    
    // Test vector search
    console.log('4️⃣ Testing Vector Search...');
    const searchResults = await vectorService.searchSimilar(
      'deals',
      'SaaS deal worth ten thousand dollars',
      1
    );
    console.log(`✅ Vector search returned ${searchResults.length} results`);
    if (searchResults.length > 0) {
      console.log(`   Similarity: ${(searchResults[0].similarity * 100).toFixed(1)}%`);
      console.log(`   Metadata: ${JSON.stringify(searchResults[0].metadata)}`);
    }

    // Test health check
    console.log('5️⃣ Testing Health Check...');
    const health = await vectorService.healthCheck();
    console.log(`✅ Vector DB Health: ${health.status}`);
    console.log(`   Collections: ${Object.keys(health.collections).join(', ')}`);

    // Cleanup test data
    console.log('6️⃣ Cleaning up test data...');
    await vectorService.deleteVector('deals', 'test-deal-123');
    console.log('✅ Test data cleaned up');

    console.log('\n🎉 All AI tests passed! Your AI setup is working correctly.');
    console.log('\n📋 Summary:');
    console.log('   ✅ Vector database (Chroma) connection');
    console.log('   ✅ OpenAI API integration');
    console.log('   ✅ Embedding generation');
    console.log('   ✅ Vector storage and search');
    console.log('   ✅ Health monitoring');
    console.log('\n🚀 Ready to implement AI features!');
    console.log('\n📝 Next steps:');
    console.log('   1. Install and start MongoDB for full CRM functionality');
    console.log('   2. Run the complete test: node src/scripts/testAISetup.js');
    console.log('   3. Start implementing AI endpoints');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('\n🔧 Troubleshooting tips:');
    
    if (error.message.includes('OpenAI') || error.message.includes('API key')) {
      console.error('   • Get your API key from: https://platform.openai.com/api-keys');
      console.error('   • Add it to your .env file: OPENAI_API_KEY=sk-your-key-here');
      console.error('   • Ensure you have credits in your OpenAI account');
    }
    
    if (error.message.includes('Chroma') || error.message.includes('vector')) {
      console.error('   • Make sure Chroma DB is running: chroma run --host localhost --port 8000');
      console.error('   • Check if port 8000 is available');
      console.error('   • Try restarting Chroma DB');
    }
    
    console.error('\n📝 Full error details:');
    console.error(error);
  }
}

// Run the test
if (require.main === module) {
  testAIOnly().catch(console.error);
}

module.exports = testAIOnly; 