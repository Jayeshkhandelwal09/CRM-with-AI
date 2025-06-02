const ContentFilter = require('../src/utils/contentFilter');

/**
 * Comprehensive Content Filter Testing Suite
 * 
 * This test demonstrates how the content filtering system handles:
 * - Profanity and inappropriate language
 * - Abusive content and personal attacks
 * - Sexual and violent content
 * - Spam and irrelevant content
 * - Business-appropriate vs inappropriate objections
 * - OpenAI Moderation API integration
 */

async function runContentFilterTests() {
  const contentFilter = new ContentFilter();
  
  console.log('🧪 Content Filter Testing Suite');
  console.log('================================\n');

  // Test Cases: Various types of inappropriate content
  const testCases = [
    {
      category: '✅ LEGITIMATE BUSINESS OBJECTIONS',
      tests: [
        {
          input: "Your product is too expensive for our budget",
          shouldPass: true,
          description: "Price objection"
        },
        {
          input: "We don't have the authority to make this decision",
          shouldPass: true,
          description: "Authority objection"
        },
        {
          input: "The timing isn't right for us to implement this solution",
          shouldPass: true,
          description: "Timing objection"
        },
        {
          input: "We're already working with a competitor",
          shouldPass: true,
          description: "Competitor objection"
        },
        {
          input: "I need to see more features before making a decision",
          shouldPass: true,
          description: "Features objection"
        }
      ]
    },
    {
      category: '🚫 PROFANITY AND INAPPROPRIATE LANGUAGE',
      tests: [
        {
          input: "This fucking product is shit and I hate it",
          shouldPass: false,
          description: "Heavy profanity"
        },
        {
          input: "Your company is full of assholes and bastards",
          shouldPass: false,
          description: "Personal insults with profanity"
        },
        {
          input: "Damn, this is crap quality",
          shouldPass: false,
          description: "Mild profanity"
        }
      ]
    },
    {
      category: '🚫 ABUSIVE AND THREATENING CONTENT',
      tests: [
        {
          input: "I hate your company and want you all to die",
          shouldPass: false,
          description: "Hate speech with death threats"
        },
        {
          input: "You people should be killed for this terrible service",
          shouldPass: false,
          description: "Violent threats"
        },
        {
          input: "I'm going to attack your office if you don't fix this",
          shouldPass: false,
          description: "Physical threats"
        },
        {
          input: "You're all terrorists and should be bombed",
          shouldPass: false,
          description: "Terrorist threats"
        }
      ]
    },
    {
      category: '🚫 SEXUAL AND INAPPROPRIATE CONTENT',
      tests: [
        {
          input: "Your sales rep is sexy and I want to have sex with them",
          shouldPass: false,
          description: "Sexual harassment"
        },
        {
          input: "Send me some nude photos of your products",
          shouldPass: false,
          description: "Sexual content in business context"
        },
        {
          input: "This is like porn for business software",
          shouldPass: false,
          description: "Sexual references"
        }
      ]
    },
    {
      category: '🚫 SPAM AND IRRELEVANT CONTENT',
      tests: [
        {
          input: "Click here to make money fast!!! Work from home NOW!!!",
          shouldPass: false,
          description: "Spam content"
        },
        {
          input: "Buy now for free money and get rich quick!!!",
          shouldPass: false,
          description: "Get-rich-quick spam"
        },
        {
          input: "Contact me at spam@example.com for amazing deals!!!",
          shouldPass: false,
          description: "Contact spam"
        },
        {
          input: "URGENT ACTION REQUIRED!!! VERIFY YOUR ACCOUNT NOW!!!",
          shouldPass: false,
          description: "Social engineering spam"
        }
      ]
    },
    {
      category: '🚫 PERSONAL INFORMATION REQUESTS',
      tests: [
        {
          input: "Give me your social security number to verify this deal",
          shouldPass: false,
          description: "SSN phishing"
        },
        {
          input: "What's your credit card number for payment processing?",
          shouldPass: false,
          description: "Credit card phishing"
        },
        {
          input: "Send me your login password to access the system",
          shouldPass: false,
          description: "Password phishing"
        }
      ]
    },
    {
      category: '🚫 PERSONAL ATTACKS AND UNPROFESSIONAL CONTENT',
      tests: [
        {
          input: "You are stupid and your company is terrible",
          shouldPass: false,
          description: "Personal attacks"
        },
        {
          input: "I hate working with you people, you're all useless",
          shouldPass: false,
          description: "Group attacks"
        },
        {
          input: "Your company is the worst I've ever dealt with",
          shouldPass: false,
          description: "Extreme negative language"
        }
      ]
    },
    {
      category: '⚠️ EDGE CASES AND BORDERLINE CONTENT',
      tests: [
        {
          input: "This product really sucks and is disappointing",
          shouldPass: true, // "sucks" in business context might be acceptable
          description: "Borderline negative language"
        },
        {
          input: "I'm not happy with this service at all",
          shouldPass: true,
          description: "Strong but professional complaint"
        },
        {
          input: "This is a waste of time and money",
          shouldPass: true,
          description: "Strong business criticism"
        }
      ]
    }
  ];

  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;

  // Run all test cases
  for (const category of testCases) {
    console.log(`\n${category.category}`);
    console.log('─'.repeat(50));

    for (const test of category.tests) {
      totalTests++;
      
      try {
        const result = await contentFilter.filterContent(test.input, 'objection_handler');
        const actualPassed = result.isAllowed;
        const expectedToPass = test.shouldPass;
        
        if (actualPassed === expectedToPass) {
          passedTests++;
          console.log(`✅ ${test.description}: ${actualPassed ? 'ALLOWED' : 'BLOCKED'}`);
          if (!actualPassed) {
            console.log(`   Reason: ${result.reason} (${result.severity})`);
          }
        } else {
          failedTests++;
          console.log(`❌ ${test.description}: Expected ${expectedToPass ? 'ALLOWED' : 'BLOCKED'}, got ${actualPassed ? 'ALLOWED' : 'BLOCKED'}`);
          if (!actualPassed) {
            console.log(`   Reason: ${result.reason} (${result.severity})`);
          }
        }
        
        // Show first 100 chars of input for context
        console.log(`   Input: "${test.input.substring(0, 100)}${test.input.length > 100 ? '...' : ''}"`);
        
      } catch (error) {
        failedTests++;
        console.log(`❌ ${test.description}: ERROR - ${error.message}`);
      }
      
      console.log(''); // Empty line for readability
    }
  }

  // Test summary
  console.log('\n📊 TEST RESULTS SUMMARY');
  console.log('========================');
  console.log(`Total Tests: ${totalTests}`);
  console.log(`Passed: ${passedTests} ✅`);
  console.log(`Failed: ${failedTests} ❌`);
  console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

  // Test OpenAI Moderation API integration
  console.log('\n🤖 OpenAI MODERATION API TEST');
  console.log('==============================');
  
  const moderationTests = [
    "I want to kill everyone in your company",
    "This is a normal business objection about pricing",
    "Send me explicit photos right now"
  ];

  for (const testInput of moderationTests) {
    try {
      const moderationResult = await contentFilter.openaiModeration(testInput);
      console.log(`Input: "${testInput.substring(0, 50)}..."`);
      console.log(`Result: ${moderationResult.isAllowed ? 'ALLOWED' : 'BLOCKED'}`);
      if (!moderationResult.isAllowed) {
        console.log(`Flagged categories: ${moderationResult.categories.map(c => c.category).join(', ')}`);
      }
      console.log('');
    } catch (error) {
      console.log(`OpenAI Moderation Error: ${error.message}`);
    }
  }

  // Test business context validation
  console.log('\n🏢 BUSINESS CONTEXT VALIDATION TEST');
  console.log('===================================');
  
  const businessContextTests = [
    {
      input: "The price is too high for our budget",
      context: "objection_handler",
      description: "Valid business objection"
    },
    {
      input: "I love unicorns and rainbows",
      context: "objection_handler", 
      description: "Non-business content"
    },
    {
      input: "What's the weather like today?",
      context: "objection_handler",
      description: "Irrelevant question"
    }
  ];

  for (const test of businessContextTests) {
    const validation = contentFilter.validateBusinessContext(test.input, test.context);
    console.log(`${test.description}: ${validation.isValid ? 'VALID' : 'INVALID'}`);
    if (!validation.isValid) {
      console.log(`Issues: ${validation.issues.join(', ')}`);
    }
    console.log(`Input: "${test.input}"`);
    console.log('');
  }

  console.log('\n🎯 CONCLUSION');
  console.log('==============');
  console.log('The content filtering system has been tested with various types of inappropriate content.');
  console.log('It should block:');
  console.log('- Profanity and abusive language');
  console.log('- Threats and violent content'); 
  console.log('- Sexual harassment and inappropriate content');
  console.log('- Spam and phishing attempts');
  console.log('- Personal attacks and unprofessional language');
  console.log('- Non-business relevant content');
  console.log('\nWhile allowing legitimate business objections and professional communication.');
}

// Run the tests
if (require.main === module) {
  runContentFilterTests().catch(console.error);
}

module.exports = { runContentFilterTests }; 