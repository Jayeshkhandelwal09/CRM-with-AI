const mongoose = require('mongoose');
require('dotenv').config();

async function createTestDeals() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/crm-ai-dev');
  
  const Deal = require('./src/models/Deal');
  const Contact = require('./src/models/Contact');
  
  console.log('📊 Current deals in database:');
  const deals = await Deal.find().populate('contact');
  
  deals.forEach(deal => {
    console.log(`- ${deal.title} (${deal._id}) - Stage: ${deal.stage}, Value: $${deal.value}`);
  });
  
  console.log(`\nTotal deals: ${deals.length}`);
  
  // Create additional test deals if needed
  if (deals.length < 4) {
    console.log('\n🔧 Creating additional test deals...');
    
    let testContact = await Contact.findOne({ email: 'testcontact@example.com' });
    if (!testContact) {
      testContact = await Contact.create({
        firstName: 'Test',
        lastName: 'Contact',
        email: 'testcontact@example.com',
        company: 'Test Company',
        industry: 'Technology',
        owner: deals[0]?.owner || new mongoose.Types.ObjectId()
      });
      console.log('✅ Created test contact');
    }
    
    const testDeals = [
      {
        title: 'Software Integration Deal',
        value: 75000,
        stage: 'proposal',
        contact: testContact._id,
        owner: testContact.owner,
        expectedCloseDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        notes: 'Enterprise software integration project'
      },
      {
        title: 'Consulting Services Package',
        value: 25000,
        stage: 'closed_won',
        contact: testContact._id,
        owner: testContact.owner,
        expectedCloseDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        closedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        closeReason: 'Successfully closed after demo',
        notes: 'Small consulting package for initial setup',
        isActive: false,
        isClosed: true
      },
      {
        title: 'Annual Support Contract',
        value: 40000,
        stage: 'closed_lost',
        contact: testContact._id,
        owner: testContact.owner,
        expectedCloseDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        closedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        closeReason: 'Competitor won with lower price',
        notes: 'Lost to competitor due to pricing concerns',
        isActive: false,
        isClosed: true
      }
    ];
    
    for (const dealData of testDeals) {
      const existingDeal = await Deal.findOne({ title: dealData.title });
      if (!existingDeal) {
        await Deal.create(dealData);
        console.log(`✅ Created: ${dealData.title}`);
      }
    }
  }
  
  console.log('\n🏁 Final deal count:');
  const finalDeals = await Deal.find();
  console.log(`Total deals: ${finalDeals.length}`);
  
  await mongoose.disconnect();
}

createTestDeals().catch(console.error); 