const mongoose = require('mongoose');
const config = require('../src/config');

// Setup test database connection
beforeAll(async () => {
  // Use test database
  const testDbUri = config.mongoTestUri;
  await mongoose.connect(testDbUri);
});

// Clean up after each test
afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});

// Close database connection after all tests
afterAll(async () => {
  await mongoose.connection.close();
});

// Increase timeout for database operations
jest.setTimeout(30000); 