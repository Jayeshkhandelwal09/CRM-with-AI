const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testAuth() {
  try {
    console.log('Testing authentication...');
    
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'test@example.com',
      password: 'TestPassword123!'
    }, {
      headers: { 'Content-Type': 'application/json' }
    });
    
    console.log('✅ Success:', response.data.success);
    console.log('✅ Token exists:', !!response.data.data?.tokens?.accessToken);
    console.log('✅ Token preview:', response.data.data?.tokens?.accessToken?.substring(0, 50) + '...');
    
  } catch (error) {
    console.log('❌ Error status:', error.response?.status);
    console.log('❌ Error data:', error.response?.data);
    console.log('❌ Error message:', error.message);
  }
}

testAuth(); 