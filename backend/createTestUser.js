const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

const TEST_USER = {
  firstName: 'Test',
  lastName: 'User',
  email: 'test@example.com',
  password: 'TestPassword123!'
};

async function createTestUser() {
  try {
    console.log('🔧 Creating test user...');
    
    const response = await axios.post(`${BASE_URL}/auth/register`, TEST_USER);
    
    if (response.data.success) {
      console.log('✅ Test user created successfully');
      console.log('📧 Email:', TEST_USER.email);
      console.log('🔑 Password:', TEST_USER.password);
    } else {
      console.log('❌ Failed to create test user:', response.data.message);
    }
    
  } catch (error) {
    if (error.response?.status === 400 && error.response?.data?.message?.includes('already exists')) {
      console.log('ℹ️  Test user already exists');
      console.log('📧 Email:', TEST_USER.email);
      console.log('🔑 Password:', TEST_USER.password);
    } else {
      console.log('❌ Error creating test user:', error.response?.data || error.message);
    }
  }
}

createTestUser(); 