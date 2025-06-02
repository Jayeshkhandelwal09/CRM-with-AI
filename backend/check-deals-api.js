const axios = require('axios');
require('dotenv').config();

async function testDealsAPI() {
  try {
    // Login first
    const loginResult = await axios.post('http://localhost:3000/api/auth/login', {
      email: 'test@example.com',
      password: 'TestPassword123!'
    });
    
    const token = loginResult.data.data.tokens.accessToken;
    
    // Get deals
    const dealsResult = await axios.get('http://localhost:3000/api/deals?limit=20', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('Deals returned by API:');
    console.log('Total deals:', dealsResult.data.data?.deals?.length || 0);
    
    if (dealsResult.data.data?.deals) {
      dealsResult.data.data.deals.forEach((deal, index) => {
        console.log(`${index + 1}. ${deal.title} (${deal._id}) - Stage: ${deal.stage}, Value: $${deal.value}`);
      });
    }
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

testDealsAPI(); 