const axios = require('axios');
require('dotenv').config();

/**
 * AI Endpoints Test Script
 * 
 * Tests all AI endpoints to ensure they're working correctly
 * Requires a running backend server and valid OpenAI API key
 */

const BASE_URL = 'http://localhost:5000/api';
let authToken = null;

// Test user credentials (you may need to adjust these)
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
      headers: {
        'Content-Type': 'application/json',
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {})
      },
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
    console.log('ℹ️  You may need to register this user first or check credentials');
    return false;
  }
}

/**
 * Test AI Health Check
 */
async function testAIHealth() {
  console.log('\n🏥 Testing AI Health Check...');
  
  const result = await makeRequest('GET', '/ai/health');
  
  if (result.success) {
    console.log('✅ AI Health Check passed');
    console.log('📊 Health Status:', JSON.stringify(result.data.data, null, 2));
  } else {
    console.log('❌ AI Health Check failed:', result.error);
  }
  
  return result.success;
}

/**
 * Test Deal Coach endpoint
 */
async function testDealCoach() {
  console.log('\n🎯 Testing Deal Coach endpoint...');
  
  // First, try to get a deal ID (you may need to create a deal first)
  const dealsResult = await makeRequest('GET', '/deals?limit=1');
  
  if (!dealsResult.success || !dealsResult.data.data?.deals?.length) {
    console.log('⚠️  No deals found. Creating a test deal...');
    
    // Create a test contact first
    const contactResult = await makeRequest('POST', '/contacts', {
      firstName: 'Test',
      lastName: 'Contact',
      email: 'testcontact@example.com',
      company: 'Test Company',
      industry: 'Technology'
    });
    
    let contactId;
    if (!contactResult.success) {
      if (contactResult.error?.existingContact?.id) {
        // Use existing contact
        contactId = contactResult.error.existingContact.id;
        console.log('✅ Using existing contact:', contactId);
      } else {
        console.log('❌ Failed to create test contact:', contactResult.error);
        return false;
      }
    } else {
      contactId = contactResult.data.data._id;
      console.log('✅ Created new contact:', contactId);
    }
    
    // Create a test deal
    const dealResult = await makeRequest('POST', '/deals', {
      title: 'Test Deal for AI',
      value: 50000,
      stage: 'proposal',
      contact: contactId,
      expectedCloseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      notes: 'This is a test deal for AI coaching'
    });
    
    if (!dealResult.success) {
      console.log('❌ Failed to create test deal:', dealResult.error);
      return false;
    }
    
    const dealId = dealResult.data.data?._id || dealResult.data.data?.id;
    console.log('✅ Created test deal:', dealId);
    console.log('Deal response:', JSON.stringify(dealResult.data, null, 2));
    
    if (!dealId) {
      console.log('❌ Deal ID not found in response');
      return false;
    }
    
    // Test Deal Coach
    const coachResult = await makeRequest('GET', `/ai/deals/${dealId}/coach`);
    
    if (coachResult.success) {
      console.log('✅ Deal Coach endpoint working');
      console.log('🤖 AI Suggestions:', JSON.stringify(coachResult.data.data.suggestions, null, 2));
    } else {
      console.log('❌ Deal Coach failed:', coachResult.error);
    }
    
    return coachResult.success;
  } else {
    const dealId = dealsResult.data.data.deals[0]._id;
    console.log('📋 Using existing deal:', dealId);
    
    const coachResult = await makeRequest('GET', `/ai/deals/${dealId}/coach`);
    
    if (coachResult.success) {
      console.log('✅ Deal Coach endpoint working');
      console.log('🤖 AI Suggestions:', JSON.stringify(coachResult.data.data.suggestions, null, 2));
    } else {
      console.log('❌ Deal Coach failed:', coachResult.error);
    }
    
    return coachResult.success;
  }
}

/**
 * Test Objection Handler endpoint
 */
async function testObjectionHandler() {
  console.log('\n🛡️  Testing Objection Handler endpoint...');
  
  const testObjection = {
    objectionText: "Your product is too expensive compared to competitors",
    category: "price",
    severity: "high"
  };
  
  const result = await makeRequest('POST', '/ai/objections/handle', testObjection);
  
  if (result.success) {
    console.log('✅ Objection Handler endpoint working');
    console.log('🤖 AI Response:', JSON.stringify(result.data.data.response, null, 2));
  } else {
    console.log('❌ Objection Handler failed:', result.error);
  }
  
  return result.success;
}

/**
 * Test Customer Persona Builder endpoint
 */
async function testPersonaBuilder() {
  console.log('\n👤 Testing Customer Persona Builder endpoint...');
  
  // Get a contact ID
  const contactsResult = await makeRequest('GET', '/contacts?limit=1');
  
  if (!contactsResult.success || !contactsResult.data.data?.contacts?.length) {
    console.log('⚠️  No contacts found. Creating a test contact...');
    
    const contactResult = await makeRequest('POST', '/contacts', {
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@techcorp.com',
      company: 'TechCorp Inc',
      industry: 'Technology',
      title: 'CTO'
    });
    
    if (!contactResult.success) {
      console.log('❌ Failed to create test contact:', contactResult.error);
      return false;
    }
    
    const contactId = contactResult.data.data._id;
    console.log('✅ Created test contact:', contactId);
    
    const personaResult = await makeRequest('GET', `/ai/contacts/${contactId}/persona`);
    
    if (personaResult.success) {
      console.log('✅ Persona Builder endpoint working');
      console.log('🤖 AI Persona:', JSON.stringify(personaResult.data.data.persona, null, 2));
    } else {
      console.log('❌ Persona Builder failed:', personaResult.error);
    }
    
    return personaResult.success;
  } else {
    const contactId = contactsResult.data.data.contacts[0]._id;
    console.log('👤 Using existing contact:', contactId);
    
    const personaResult = await makeRequest('GET', `/ai/contacts/${contactId}/persona`);
    
    if (personaResult.success) {
      console.log('✅ Persona Builder endpoint working');
      console.log('🤖 AI Persona:', JSON.stringify(personaResult.data.data.persona, null, 2));
    } else {
      console.log('❌ Persona Builder failed:', personaResult.error);
    }
    
    return personaResult.success;
  }
}

/**
 * Test AI Analytics endpoint
 */
async function testAIAnalytics() {
  console.log('\n📊 Testing AI Analytics endpoint...');
  
  const result = await makeRequest('GET', '/ai/analytics?period=7d');
  
  if (result.success) {
    console.log('✅ AI Analytics endpoint working');
    console.log('📈 Analytics Data:', JSON.stringify(result.data.data, null, 2));
  } else {
    console.log('❌ AI Analytics failed:', result.error);
  }
  
  return result.success;
}

/**
 * Test AI Feedback endpoint
 */
async function testAIFeedback() {
  console.log('\n📝 Testing AI Feedback endpoint...');
  
  // Test with valid feedback data
  const validFeedback = {
    feature: 'objection_handler',
    feedback: 'positive',
    responseId: 'test-response-123',
    rating: 5,
    comments: 'This AI response was very helpful'
  };
  
  const result = await makeRequest('POST', '/ai/feedback', validFeedback);
  
  if (result.success) {
    console.log('✅ AI Feedback endpoint working');
    console.log('📝 Feedback recorded:', result.data);
  } else {
    console.log('❌ AI Feedback failed:', result.error);
  }
  
  return result.success;
}

/**
 * Main test runner
 */
async function runTests() {
  console.log('🚀 Starting AI Endpoints Test Suite');
  console.log('=====================================');
  
  // Check if OpenAI API key is configured
  if (!process.env.OPENAI_API_KEY) {
    console.log('❌ OPENAI_API_KEY not found in environment variables');
    console.log('ℹ️  Please add your OpenAI API key to the .env file');
    return;
  }
  
  console.log('✅ OpenAI API key found');
  
  // Authenticate
  const authSuccess = await authenticate();
  if (!authSuccess) {
    console.log('❌ Cannot proceed without authentication');
    return;
  }
  
  // Run tests
  const tests = [
    { name: 'AI Health Check', fn: testAIHealth },
    { name: 'Deal Coach', fn: testDealCoach },
    { name: 'Objection Handler', fn: testObjectionHandler },
    { name: 'Persona Builder', fn: testPersonaBuilder },
    { name: 'AI Analytics', fn: testAIAnalytics },
    { name: 'AI Feedback', fn: testAIFeedback }
  ];
  
  const results = [];
  
  for (const test of tests) {
    try {
      const success = await test.fn();
      results.push({ name: test.name, success });
    } catch (error) {
      console.log(`❌ ${test.name} threw an error:`, error.message);
      results.push({ name: test.name, success: false });
    }
  }
  
  // Summary
  console.log('\n📋 Test Results Summary');
  console.log('=======================');
  
  const passed = results.filter(r => r.success).length;
  const total = results.length;
  
  results.forEach(result => {
    console.log(`${result.success ? '✅' : '❌'} ${result.name}`);
  });
  
  console.log(`\n🎯 Overall: ${passed}/${total} tests passed`);
  
  if (passed === total) {
    console.log('🎉 All AI endpoints are working correctly!');
  } else {
    console.log('⚠️  Some tests failed. Check the logs above for details.');
  }
}

// Run the tests
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { runTests }; 