const axios = require('axios');
require('dotenv').config();

/**
 * AI Caching Fix Test Script
 * 
 * This script tests that AI responses are properly cached per deal ID
 * and that different deals don't share cached responses.
 */

const BASE_URL = 'http://localhost:3000/api';
let authToken = null;

// Test user credentials
const TEST_USER = {
  email: 'test@example.com',
  password: 'TestPassword123!'
};

/**
 * Helper function to make authenticated requests
 */
async function makeRequest(method, endpoint, data = null) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
    };

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || error.message,
      status: error.response?.status
    };
  }
}

/**
 * Authenticate user and get token
 */
async function authenticate() {
  console.log('🔐 Authenticating user...');
  
  const result = await makeRequest('POST', '/auth/login', TEST_USER);
  
  if (result.success && result.data.data?.tokens?.accessToken) {
    authToken = result.data.data.tokens.accessToken;
    console.log('✅ Authentication successful');
    return true;
  } else {
    console.log('❌ Authentication failed:', result.error);
    return false;
  }
}

/**
 * Get all available deals
 */
async function getDeals() {
  const result = await makeRequest('GET', '/deals?limit=10');
  if (result.success && result.data.data?.deals) {
    return result.data.data.deals;
  }
  return [];
}

/**
 * Test Deal Coach caching with multiple deals
 */
async function testDealCoachCaching() {
  console.log('\n🎯 Testing Deal Coach Caching Fix...');
  
  const deals = await getDeals();
  if (deals.length < 2) {
    console.log('❌ Need at least 2 deals to test caching. Found:', deals.length);
    return false;
  }

  console.log(`📋 Found ${deals.length} deals. Testing first 2...`);
  
  // Test first deal
  const deal1 = deals[0];
  console.log(`\n📈 Testing Deal 1: ${deal1.title} (ID: ${deal1._id})`);
  console.log(`   Stage: ${deal1.stage}, Value: $${deal1.value}`);
  
  const coach1Result = await makeRequest('GET', `/ai/deals/${deal1._id}/coach`);
  if (!coach1Result.success) {
    console.log('❌ Deal Coach failed for Deal 1:', coach1Result.error);
    return false;
  }
  
  const suggestions1 = coach1Result.data.data.suggestions;
  console.log(`   ✅ Got ${suggestions1.length} suggestions`);
  console.log(`   📝 First suggestion: "${suggestions1[0]?.action?.substring(0, 50)}..."`);
  
  // Test second deal
  const deal2 = deals[1];
  console.log(`\n📈 Testing Deal 2: ${deal2.title} (ID: ${deal2._id})`);
  console.log(`   Stage: ${deal2.stage}, Value: $${deal2.value}`);
  
  const coach2Result = await makeRequest('GET', `/ai/deals/${deal2._id}/coach`);
  if (!coach2Result.success) {
    console.log('❌ Deal Coach failed for Deal 2:', coach2Result.error);
    return false;
  }
  
  const suggestions2 = coach2Result.data.data.suggestions;
  console.log(`   ✅ Got ${suggestions2.length} suggestions`);
  console.log(`   📝 First suggestion: "${suggestions2[0]?.action?.substring(0, 50)}..."`);
  
  // Compare responses
  const response1Hash = JSON.stringify(suggestions1);
  const response2Hash = JSON.stringify(suggestions2);
  
  if (response1Hash === response2Hash) {
    console.log('\n❌ CACHING BUG DETECTED! Both deals returned identical responses.');
    console.log('   This indicates cached responses are being shared between different deals.');
    return false;
  } else {
    console.log('\n✅ CACHING FIX WORKING! Different deals returned different responses.');
    console.log('   Each deal gets its own unique AI coaching suggestions.');
    return true;
  }
}

/**
 * Test Win/Loss Explainer caching with closed deals
 */
async function testWinLossExplainerCaching() {
  console.log('\n📊 Testing Win/Loss Explainer Caching Fix...');
  
  const deals = await getDeals();
  const closedDeals = deals.filter(deal => deal.stage === 'closed_won' || deal.stage === 'closed_lost');
  
  if (closedDeals.length < 2) {
    console.log(`❌ Need at least 2 closed deals to test Win/Loss caching. Found: ${closedDeals.length}`);
    return false;
  }

  console.log(`📋 Found ${closedDeals.length} closed deals. Testing first 2...`);
  
  // Test first closed deal
  const deal1 = closedDeals[0];
  console.log(`\n📈 Testing Closed Deal 1: ${deal1.title} (ID: ${deal1._id})`);
  console.log(`   Stage: ${deal1.stage}, Value: $${deal1.value}`);
  
  const explainer1Result = await makeRequest('GET', `/ai/deals/${deal1._id}/explain`);
  if (!explainer1Result.success) {
    console.log('❌ Win/Loss Explainer failed for Deal 1:', explainer1Result.error);
    return false;
  }
  
  const analysis1 = explainer1Result.data.data.analysis;
  console.log(`   ✅ Got analysis for ${analysis1.outcome} deal`);
  console.log(`   📝 Primary factors: ${analysis1.primaryFactors?.length || 0}`);
  
  // Test second closed deal
  const deal2 = closedDeals[1];
  console.log(`\n📈 Testing Closed Deal 2: ${deal2.title} (ID: ${deal2._id})`);
  console.log(`   Stage: ${deal2.stage}, Value: $${deal2.value}`);
  
  const explainer2Result = await makeRequest('GET', `/ai/deals/${deal2._id}/explain`);
  if (!explainer2Result.success) {
    console.log('❌ Win/Loss Explainer failed for Deal 2:', explainer2Result.error);
    return false;
  }
  
  const analysis2 = explainer2Result.data.data.analysis;
  console.log(`   ✅ Got analysis for ${analysis2.outcome} deal`);
  console.log(`   📝 Primary factors: ${analysis2.primaryFactors?.length || 0}`);
  
  // Compare responses
  const response1Hash = JSON.stringify(analysis1);
  const response2Hash = JSON.stringify(analysis2);
  
  if (response1Hash === response2Hash) {
    console.log('\n❌ CACHING BUG DETECTED! Both deals returned identical analyses.');
    console.log('   This indicates cached responses are being shared between different deals.');
    return false;
  } else {
    console.log('\n✅ CACHING FIX WORKING! Different deals returned different analyses.');
    console.log('   Each deal gets its own unique win/loss analysis.');
    return true;
  }
}

/**
 * Test Objection Handler caching with different objections
 */
async function testObjectionHandlerCaching() {
  console.log('\n🛡️ Testing Objection Handler Caching Fix...');
  
  const deals = await getDeals();
  if (deals.length < 2) {
    console.log('❌ Need at least 2 deals to test objection caching. Found:', deals.length);
    return false;
  }

  // Test different objections for different deals
  const testObjections = [
    {
      objectionText: "Your product is too expensive compared to competitors",
      category: "price",
      severity: "high",
      dealId: deals[0]._id
    },
    {
      objectionText: "We don't have budget for this right now",
      category: "price", 
      severity: "medium",
      dealId: deals[1]._id
    }
  ];

  console.log(`📋 Testing objections for 2 different deals...`);
  
  // Test first objection
  console.log(`\n🛡️ Testing Objection 1 for Deal ${testObjections[0].dealId}:`);
  console.log(`   "${testObjections[0].objectionText}"`);
  
  const objection1Result = await makeRequest('POST', '/ai/objections/handle', testObjections[0]);
  if (!objection1Result.success) {
    console.log('❌ Objection Handler failed for Objection 1:', objection1Result.error);
    return false;
  }
  
  const response1 = objection1Result.data.data.response;
  console.log(`   ✅ Got response: "${response1.response?.substring(0, 50)}..."`);
  
  // Test second objection
  console.log(`\n🛡️ Testing Objection 2 for Deal ${testObjections[1].dealId}:`);
  console.log(`   "${testObjections[1].objectionText}"`);
  
  const objection2Result = await makeRequest('POST', '/ai/objections/handle', testObjections[1]);
  if (!objection2Result.success) {
    console.log('❌ Objection Handler failed for Objection 2:', objection2Result.error);
    return false;
  }
  
  const response2 = objection2Result.data.data.response;
  console.log(`   ✅ Got response: "${response2.response?.substring(0, 50)}..."`);
  
  // Compare responses (they should be different because they're different objections)
  const response1Hash = JSON.stringify(response1);
  const response2Hash = JSON.stringify(response2);
  
  if (response1Hash === response2Hash) {
    console.log('\n❌ CACHING BUG DETECTED! Different objections returned identical responses.');
    console.log('   This indicates inappropriate cache sharing.');
    return false;
  } else {
    console.log('\n✅ CACHING FIX WORKING! Different objections returned different responses.');
    console.log('   Each objection gets its own appropriate response.');
    return true;
  }
}

/**
 * Main test function
 */
async function runCacheTests() {
  console.log('🧪 AI Caching Fix Verification Test');
  console.log('=====================================');
  
  if (!await authenticate()) {
    process.exit(1);
  }

  const tests = [
    { name: 'Deal Coach Caching', fn: testDealCoachCaching },
    { name: 'Win/Loss Explainer Caching', fn: testWinLossExplainerCaching },
    { name: 'Objection Handler Caching', fn: testObjectionHandlerCaching }
  ];

  let passed = 0;
  let total = tests.length;

  for (const test of tests) {
    try {
      const result = await test.fn();
      if (result) {
        passed++;
      }
    } catch (error) {
      console.log(`❌ ${test.name} test failed with error:`, error.message);
    }
  }

  console.log('\n📋 Cache Fix Test Results Summary');
  console.log('==================================');
  console.log(`✅ Passed: ${passed}/${total} tests`);
  
  if (passed === total) {
    console.log('🎉 ALL CACHING TESTS PASSED! The fix is working correctly.');
    console.log('   Different deals now get unique AI responses instead of shared cached responses.');
  } else {
    console.log('⚠️  Some caching tests failed. The fix may need additional work.');
  }
  
  process.exit(passed === total ? 0 : 1);
}

// Run the tests
runCacheTests().catch(error => {
  console.error('Test execution failed:', error);
  process.exit(1);
}); 