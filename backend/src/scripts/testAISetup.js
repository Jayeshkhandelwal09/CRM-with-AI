const mongoose = require('mongoose');
const config = require('../config');
const VectorService = require('../services/vectorService');
const AIService = require('../services/aiService');
const RAGIndexingService = require('../services/ragIndexingService');

/**
 * Test script to verify AI setup
 * 
 * This script tests:
 * 1. Database connection
 * 2. Vector database connection
 * 3. OpenAI API connection
 * 4. Basic embedding generation
 * 5. Vector storage and retrieval
 */

async function testAISetup() {
  console.log('🧪 Starting AI Setup Test...\n');

  try {
    // Test 1: Database Connection
    console.log('1️⃣ Testing MongoDB connection...');
    await mongoose.connect(config.mongoUri);
    console.log('✅ MongoDB connected successfully\n');

    // Test 2: Vector Service
    console.log('2️⃣ Testing Vector Service...');
    const vectorService = new VectorService();
    await vectorService.initialize();
    
    // Test embedding generation
    const testText = "This is a test deal for a SaaS company worth $10,000";
    const embedding = await vectorService.generateEmbedding(testText);
    console.log(`✅ Generated embedding with ${embedding.length} dimensions`);
    
    // Test vector storage
    await vectorService.storeVector(
      'deals',
      'test-deal-123',
      testText,
      { value: 10000, industry: 'SaaS', outcome: 'closed_won' }
    );
    console.log('✅ Vector stored successfully');
    
    // Test vector search
    const searchResults = await vectorService.searchSimilar(
      'deals',
      'SaaS deal worth ten thousand dollars',
      1
    );
    console.log(`✅ Vector search returned ${searchResults.length} results`);
    if (searchResults.length > 0) {
      console.log(`   Similarity: ${(searchResults[0].similarity * 100).toFixed(1)}%`);
    }
    console.log('');

    // Test 3: AI Service
    console.log('3️⃣ Testing AI Service...');
    const aiService = new AIService();
    await aiService.initialize();
    
    // Test basic AI response (without user ID to skip rate limiting)
    const response = await aiService.generateResponse(
      'test',
      'You are a helpful assistant.',
      'Say hello in exactly 5 words.',
      { maxTokens: 20, skipCache: true }
    );
    console.log('✅ AI response generated successfully');
    console.log(`   Response: "${response.content}"`);
    console.log(`   Confidence: ${response.confidence}`);
    console.log('');

    // Test 4: Health Checks
    console.log('4️⃣ Testing Health Checks...');
    const vectorHealth = await vectorService.healthCheck();
    console.log(`✅ Vector DB Health: ${vectorHealth.status}`);
    
    const aiHealth = await aiService.healthCheck();
    console.log(`✅ AI Service Health: ${aiHealth.status}`);
    console.log('');

    // Test 5: RAG Indexing Service (basic initialization)
    console.log('5️⃣ Testing RAG Indexing Service...');
    const ragService = new RAGIndexingService();
    await ragService.initialize();
    console.log('✅ RAG Indexing Service initialized');
    
    const summary = await ragService.getIndexingSummary();
    console.log('✅ RAG summary generated');
    console.log('');

    // Cleanup test data
    console.log('🧹 Cleaning up test data...');
    await vectorService.deleteVector('deals', 'test-deal-123');
    console.log('✅ Test data cleaned up');
    console.log('');

    console.log('🎉 All tests passed! AI setup is working correctly.');
    console.log('\n📋 Summary:');
    console.log('   ✅ MongoDB connection');
    console.log('   ✅ Vector database (Chroma)');
    console.log('   ✅ OpenAI API integration');
    console.log('   ✅ Embedding generation');
    console.log('   ✅ Vector storage and search');
    console.log('   ✅ AI response generation');
    console.log('   ✅ RAG indexing service');
    console.log('\n🚀 Ready to implement AI features!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('\n🔧 Troubleshooting tips:');
    
    if (error.message.includes('OpenAI')) {
      console.error('   • Check your OpenAI API key in .env file');
      console.error('   • Ensure you have credits in your OpenAI account');
    }
    
    if (error.message.includes('Chroma') || error.message.includes('vector')) {
      console.error('   • Make sure Chroma DB is running: chroma run --host localhost --port 8000');
      console.error('   • Check if port 8000 is available');
    }
    
    if (error.message.includes('MongoDB')) {
      console.error('   • Check your MongoDB connection string');
      console.error('   • Ensure MongoDB is running');
    }
    
    console.error('\n📝 Full error details:');
    console.error(error);
  } finally {
    // Close connections
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the test
if (require.main === module) {
  testAISetup().catch(console.error);
}

module.exports = testAISetup; 