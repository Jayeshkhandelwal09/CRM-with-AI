const mongoose = require('mongoose');
require('dotenv').config();

async function fixDealOwnership() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/crm-ai-dev');
  
  const Deal = require('./src/models/Deal');
  const User = require('./src/models/User');
  
  // Find the test user
  const testUser = await User.findOne({ email: 'test@example.com' });
  if (!testUser) {
    console.log('❌ Test user not found');
    await mongoose.disconnect();
    return;
  }
  
  console.log('✅ Test user found:', testUser._id);
  
  // Update all deals to be owned by test user
  const result = await Deal.updateMany({}, { owner: testUser._id });
  console.log('📝 Updated deals:', result.modifiedCount);
  
  // Show all deals
  const deals = await Deal.find({}).populate('owner');
  console.log('\n📋 All deals:');
  deals.forEach(deal => {
    console.log(`- ${deal.title} (${deal._id}) - Stage: ${deal.stage}, Owner: ${deal.owner?.email || 'unknown'}`);
  });
  
  console.log(`\n✅ Total deals: ${deals.length}`);
  
  await mongoose.disconnect();
}

fixDealOwnership().catch(console.error); 