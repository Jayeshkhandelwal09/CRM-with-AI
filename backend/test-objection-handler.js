const axios = require('axios');
const config = require('./src/config');

// Test configuration
const BASE_URL = 'http://localhost:3000';
let authToken = null;

/**
 * Comprehensive Objection Handler Testing
 * 
 * Tests both legitimate business objections and inappropriate content
 * to ensure the API works correctly and security filtering is active
 */

async function authenticate() {
  try {
    console.log('🔐 Authenticating test user...');
    
    const response = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'test@example.com',
      password: 'TestPassword123!'
    });

    if (response.data.success && response.data.data.tokens.accessToken) {
      authToken = response.data.data.tokens.accessToken;
      console.log('✅ Authentication successful');
      return true;
    } else {
      console.log('❌ Authentication failed:', response.data.message);
      return false;
    }
  } catch (error) {
    console.log('❌ Authentication error:', error.response?.data?.message || error.message);
    return false;
  }
}

async function makeRequest(method, endpoint, data = null) {
  try {
    const config = {
      method,
      url: `${BASE_URL}/api${endpoint}`,
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    };

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    return {
      success: true,
      data: response.data,
      status: response.status
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || error.message,
      status: error.response?.status || 500
    };
  }
}

/**
 * Test legitimate business objections
 */
async function testLegitimateObjections() {
  console.log('\n✅ Testing Legitimate Business Objections');
  console.log('==========================================');

  const legitimateObjections = [
    {
      objectionText: "Your product is too expensive for our current budget",
      category: "price",
      severity: "high",
      description: "Price objection"
    },
    {
      objectionText: "We don't have the authority to make this decision right now",
      category: "authority",
      severity: "medium",
      description: "Authority objection"
    },
    {
      objectionText: "The timing isn't right for us to implement this solution",
      category: "timing",
      severity: "medium",
      description: "Timing objection"
    },
    {
      objectionText: "We're already working with a competitor and are satisfied",
      category: "competitor",
      severity: "high",
      description: "Competition objection"
    },
    {
      objectionText: "I need to see more features before making a decision",
      category: "features",
      severity: "low",
      description: "Product features objection"
    }
  ];

  let passedTests = 0;
  let totalTests = legitimateObjections.length;

  for (const objection of legitimateObjections) {
    console.log(`\n🛡️ Testing: ${objection.description}`);
    console.log(`   Input: "${objection.objectionText}"`);

    const result = await makeRequest('POST', '/ai/objections/handle', objection);

    if (result.success) {
      passedTests++;
      console.log(`   ✅ SUCCESS: Got AI response`);
      console.log(`   📝 Response: "${result.data.data.response.response.substring(0, 100)}..."`);
      console.log(`   🎯 Approach: ${result.data.data.response.approach}`);
      console.log(`   📊 Confidence: ${result.data.data.confidence}%`);
    } else {
      console.log(`   ❌ FAILED: ${result.error.message || 'Unknown error'}`);
      if (result.error.errors) {
        console.log(`   📋 Validation errors:`, result.error.errors);
      }
    }
  }

  console.log(`\n📊 Legitimate Objections Results: ${passedTests}/${totalTests} passed`);
  return passedTests === totalTests;
}

/**
 * Test inappropriate content filtering
 */
async function testInappropriateContent() {
  console.log('\n🚫 Testing Inappropriate Content Filtering');
  console.log('===========================================');

  const inappropriateInputs = [
    {
      objectionText: "This fucking product is shit and I hate your stupid company",
      description: "Heavy profanity"
    },
    {
      objectionText: "I want to kill everyone in your company and burn down your office",
      description: "Death threats and violence"
    },
    {
      objectionText: "Your sales rep is sexy and I want to have sex with them",
      description: "Sexual harassment"
    },
    {
      objectionText: "Give me your social security number to verify this deal",
      description: "Personal information phishing"
    },
    {
      objectionText: "Click here to make money fast!!! Work from home NOW!!!",
      description: "Spam content"
    },
    {
      objectionText: "You are stupid and your company is the worst I've ever seen",
      description: "Personal attacks"
    }
  ];

  let blockedTests = 0;
  let totalTests = inappropriateInputs.length;

  for (const input of inappropriateInputs) {
    console.log(`\n🚫 Testing: ${input.description}`);
    console.log(`   Input: "${input.objectionText.substring(0, 50)}..."`);

    const result = await makeRequest('POST', '/ai/objections/handle', {
      objectionText: input.objectionText,
      category: "other",
      severity: "medium"
    });

    if (!result.success && result.error.message && result.error.message.includes('inappropriate content')) {
      blockedTests++;
      console.log(`   ✅ CORRECTLY BLOCKED: Content filtering working`);
      console.log(`   🛡️ Reason: ${result.error.contentViolation?.reason || 'Content violation'}`);
      console.log(`   📋 Guidance: ${result.error.contentViolation?.guidance || 'Professional communication required'}`);
      
      if (result.error.fallbackResponse) {
        console.log(`   💬 Fallback: "${result.error.fallbackResponse.response.substring(0, 80)}..."`);
      }
    } else if (result.success) {
      console.log(`   ❌ SECURITY ISSUE: Inappropriate content was processed!`);
      console.log(`   ⚠️ This should have been blocked by content filtering`);
    } else {
      console.log(`   ⚠️ UNEXPECTED ERROR: ${result.error.message || 'Unknown error'}`);
    }
  }

  console.log(`\n📊 Inappropriate Content Results: ${blockedTests}/${totalTests} correctly blocked`);
  return blockedTests === totalTests;
}

/**
 * Test edge cases and validation
 */
async function testEdgeCases() {
  console.log('\n⚠️ Testing Edge Cases and Validation');
  console.log('====================================');

  const edgeCases = [
    {
      data: { objectionText: "" },
      description: "Empty objection text",
      shouldFail: true
    },
    {
      data: { objectionText: "Hi" },
      description: "Too short objection text (under 10 chars)",
      shouldFail: true
    },
    {
      data: { objectionText: "A".repeat(1001) },
      description: "Too long objection text (over 1000 chars)",
      shouldFail: true
    },
    {
      data: { 
        objectionText: "This is a valid objection about pricing",
        category: "invalid_category"
      },
      description: "Invalid category",
      shouldFail: true
    },
    {
      data: { 
        objectionText: "This is a valid objection about pricing",
        severity: "invalid_severity"
      },
      description: "Invalid severity",
      shouldFail: true
    },
    {
      data: { 
        objectionText: "This is a valid objection about pricing",
        dealId: "invalid_deal_id"
      },
      description: "Invalid deal ID format",
      shouldFail: true
    },
    {
      data: { 
        objectionText: "This product really sucks and is disappointing",
        category: "features",
        severity: "medium"
      },
      description: "Borderline language (should be allowed)",
      shouldFail: false
    }
  ];

  let passedTests = 0;
  let totalTests = edgeCases.length;

  for (const testCase of edgeCases) {
    console.log(`\n🧪 Testing: ${testCase.description}`);

    const result = await makeRequest('POST', '/ai/objections/handle', testCase.data);

    const actuallyFailed = !result.success;
    const expectedToFail = testCase.shouldFail;

    if (actuallyFailed === expectedToFail) {
      passedTests++;
      console.log(`   ✅ CORRECT: ${actuallyFailed ? 'Failed as expected' : 'Succeeded as expected'}`);
      
      if (actuallyFailed && result.error.message) {
        console.log(`   📋 Error: ${result.error.message}`);
      } else if (!actuallyFailed) {
        const responseText = result.data.data.response?.response || result.data.data.response || 'No response text';
        console.log(`   📝 Response: "${responseText.toString().substring(0, 60)}..."`);
      }
    } else {
      console.log(`   ❌ INCORRECT: Expected ${expectedToFail ? 'failure' : 'success'}, got ${actuallyFailed ? 'failure' : 'success'}`);
      
      if (result.error) {
        console.log(`   📋 Error: ${result.error.message || 'Unknown error'}`);
      }
    }
  }

  console.log(`\n📊 Edge Cases Results: ${passedTests}/${totalTests} passed`);
  return passedTests === totalTests;
}

/**
 * Test response format and structure
 */
async function testResponseFormat() {
  console.log('\n📋 Testing Response Format and Structure');
  console.log('========================================');

  const testObjection = {
    objectionText: "Your product is too expensive compared to competitors",
    category: "price",
    severity: "high"
  };

  console.log('🧪 Testing response structure...');
  const result = await makeRequest('POST', '/ai/objections/handle', testObjection);

  if (!result.success) {
    console.log('❌ Failed to get response for format testing');
    return false;
  }

  const response = result.data;
  let formatTests = 0;
  let totalFormatTests = 0;

  // Test main response structure
  totalFormatTests++;
  if (response.success === true) {
    formatTests++;
    console.log('✅ Response has success field');
  } else {
    console.log('❌ Response missing success field');
  }

  // Test data field
  totalFormatTests++;
  if (response.data && typeof response.data === 'object') {
    formatTests++;
    console.log('✅ Response has data object');
  } else {
    console.log('❌ Response missing data object');
  }

  // Test response content
  totalFormatTests++;
  if (response.data.response && response.data.response.response) {
    formatTests++;
    console.log('✅ Response has AI response text');
    console.log(`   📝 Sample: "${response.data.response.response.substring(0, 80)}..."`);
  } else {
    console.log('❌ Response missing AI response text');
  }

  // Test approach field
  totalFormatTests++;
  if (response.data.response && response.data.response.approach) {
    formatTests++;
    console.log(`✅ Response has approach: ${response.data.response.approach}`);
  } else {
    console.log('❌ Response missing approach field');
  }

  // Test confidence score
  totalFormatTests++;
  if (typeof response.data.confidence === 'number' && response.data.confidence >= 0 && response.data.confidence <= 100) {
    formatTests++;
    console.log(`✅ Response has valid confidence score: ${response.data.confidence}%`);
  } else {
    console.log('❌ Response missing or invalid confidence score');
  }

  // Test content safety field
  totalFormatTests++;
  if (response.data.contentSafety && response.data.contentSafety.status === 'approved') {
    formatTests++;
    console.log('✅ Response has content safety confirmation');
  } else {
    console.log('❌ Response missing content safety field');
  }

  // Test timestamp
  totalFormatTests++;
  if (response.data.timestamp) {
    formatTests++;
    console.log('✅ Response has timestamp');
  } else {
    console.log('❌ Response missing timestamp');
  }

  console.log(`\n📊 Response Format Results: ${formatTests}/${totalFormatTests} passed`);
  return formatTests === totalFormatTests;
}

/**
 * Main test runner
 */
async function runObjectionHandlerTests() {
  console.log('🧪 Comprehensive Objection Handler Testing Suite');
  console.log('=================================================');
  console.log(`🔗 Testing against: ${BASE_URL}`);
  console.log(`🔑 OpenAI API Key: ${config.openaiApiKey ? 'Found' : 'Missing'}`);

  if (!config.openaiApiKey) {
    console.log('❌ OpenAI API key not found. Please check your environment variables.');
    return;
  }

  // Authenticate
  const authSuccess = await authenticate();
  if (!authSuccess) {
    console.log('❌ Authentication failed. Cannot proceed with tests.');
    return;
  }

  // Run all test suites
  const results = {
    legitimate: await testLegitimateObjections(),
    inappropriate: await testInappropriateContent(),
    edgeCases: await testEdgeCases(),
    responseFormat: await testResponseFormat()
  };

  // Final summary
  console.log('\n🎯 FINAL TEST RESULTS');
  console.log('=====================');
  console.log(`✅ Legitimate Objections: ${results.legitimate ? 'PASS' : 'FAIL'}`);
  console.log(`🚫 Inappropriate Content Filtering: ${results.inappropriate ? 'PASS' : 'FAIL'}`);
  console.log(`⚠️ Edge Cases & Validation: ${results.edgeCases ? 'PASS' : 'FAIL'}`);
  console.log(`📋 Response Format: ${results.responseFormat ? 'PASS' : 'FAIL'}`);

  const totalPassed = Object.values(results).filter(Boolean).length;
  const totalTests = Object.keys(results).length;

  console.log(`\n🏆 Overall Score: ${totalPassed}/${totalTests} test suites passed`);

  if (totalPassed === totalTests) {
    console.log('🎉 ALL TESTS PASSED! Objection Handler is working correctly.');
    console.log('✅ API endpoints are functional');
    console.log('🛡️ Content filtering is active and working');
    console.log('📋 Response format is correct');
    console.log('⚠️ Edge cases are handled properly');
  } else {
    console.log('⚠️ Some tests failed. Please review the results above.');
    
    if (!results.legitimate) {
      console.log('❌ Issue: Legitimate business objections are not being processed correctly');
    }
    if (!results.inappropriate) {
      console.log('🚨 SECURITY ISSUE: Inappropriate content is not being blocked properly');
    }
    if (!results.edgeCases) {
      console.log('❌ Issue: Edge cases and validation are not working correctly');
    }
    if (!results.responseFormat) {
      console.log('❌ Issue: Response format is incorrect or incomplete');
    }
  }

  console.log('\n📞 If you continue to experience issues:');
  console.log('1. Check that the backend server is running on port 5000');
  console.log('2. Verify your OpenAI API key is valid and has credits');
  console.log('3. Ensure the database is connected and populated with test data');
  console.log('4. Check the server logs for any error messages');
}

// Run the tests
if (require.main === module) {
  runObjectionHandlerTests().catch(console.error);
}

module.exports = { runObjectionHandlerTests }; 