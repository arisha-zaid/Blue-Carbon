const mongoose = require('mongoose');

// Setup test environment
process.env.NODE_ENV = 'test';
process.env.MONGODB_URI_TEST = process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/blue_carbon_test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret';
process.env.SESSION_SECRET = process.env.SESSION_SECRET || 'test_session_secret';

// Increase timeout for async operations
jest.setTimeout(30000);

// Global test hooks
beforeAll(async () => {
  // Suppress console output during tests unless explicitly needed
  if (!process.env.VERBOSE_TESTS) {
    global.console = {
      ...console,
      log: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      // Keep error for debugging
      error: console.error
    };
  }
});

afterAll(async () => {
  // Clean up any open database connections
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
});

// Helper function to create test user
global.createTestUser = () => ({
  firstName: 'Test',
  lastName: 'User',
  email: 'test@example.com',
  password: 'testpassword123',
  role: 'community'
});

// Helper function to create test complaint
global.createTestComplaint = () => ({
  title: 'Test Environmental Complaint',
  description: 'This is a test complaint for environmental issues in the local area',
  category: 'air_pollution',
  priority: 'medium',
  location: {
    address: '123 Test Street, Test City, Test State',
    coordinates: {
      latitude: 40.7128,
      longitude: -74.0060
    },
    city: 'Test City',
    state: 'Test State',
    country: 'USA'
  },
  contactInfo: {
    name: 'Test Reporter',
    email: 'reporter@test.com',
    phone: '+1234567890'
  }
});

// Helper function to create test project
global.createTestProject = () => ({
  name: 'Test Environmental Project',
  description: 'This is a comprehensive test project for environmental restoration and conservation efforts',
  shortDescription: 'Test project for environmental restoration',
  type: 'reforestation',
  category: 'restoration',
  location: {
    address: 'Test Forest Area, Test County',
    coordinates: {
      latitude: 35.6762,
      longitude: 139.6503
    },
    city: 'Test City',
    state: 'Test State',
    country: 'USA',
    area: 50
  },
  endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
  funding: {
    goal: 100000,
    currency: 'USD'
  },
  carbonImpact: {
    estimatedReduction: 500
  }
});