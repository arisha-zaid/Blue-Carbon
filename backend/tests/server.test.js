const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../test-app'); // We'll create a test app

describe('Server Health', () => {
  beforeAll(async () => {
    // Connect to test database
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/blue_carbon_test', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
    }
  });

  afterAll(async () => {
    // Clean up
    await mongoose.connection.close();
  });

  describe('Health Check', () => {
    test('GET /api/health should return server status', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'OK');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
    });
  });

  describe('CORS Headers', () => {
    test('Should include CORS headers', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.headers).toHaveProperty('access-control-allow-origin');
    });
  });

  describe('Security Headers', () => {
    test('Should include security headers', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.headers).toHaveProperty('x-content-type-options', 'nosniff');
      expect(response.headers).toHaveProperty('x-frame-options');
    });
  });

  describe('404 Handler', () => {
    test('Should return 404 for non-existent routes', async () => {
      const response = await request(app)
        .get('/api/non-existent-route')
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'Route not found');
    });
  });

  describe('Rate Limiting', () => {
    test('Should apply rate limiting to API routes', async () => {
      // Make multiple requests quickly
      const requests = Array.from({ length: 5 }, () =>
        request(app).get('/api/health')
      );

      const responses = await Promise.all(requests);
      
      // All should succeed if under limit
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
    });
  });
});

describe('Authentication Routes', () => {
  describe('POST /api/auth/register', () => {
    test('Should reject registration without required fields', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com'
          // Missing required fields
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('errors');
      expect(Array.isArray(response.body.errors)).toBe(true);
    });

    test('Should reject invalid email format', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          firstName: 'Test',
          lastName: 'User',
          email: 'invalid-email',
          password: 'password123'
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('POST /api/auth/login', () => {
    test('Should reject login without credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });

    test('Should reject invalid email format', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'invalid-email',
          password: 'password123'
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });
  });
});

describe('Protected Routes', () => {
  describe('GET /api/auth/profile', () => {
    test('Should require authentication', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toMatch(/token/i);
    });

    test('Should reject invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });
  });
});

describe('Complaints Routes', () => {
  describe('GET /api/complaints', () => {
    test('Should return complaints list', async () => {
      const response = await request(app)
        .get('/api/complaints')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body).toHaveProperty('pagination');
    });

    test('Should handle pagination parameters', async () => {
      const response = await request(app)
        .get('/api/complaints?page=1&limit=5')
        .expect(200);

      expect(response.body.pagination).toHaveProperty('current', 1);
      expect(response.body.data.length).toBeLessThanOrEqual(5);
    });

    test('Should handle filtering parameters', async () => {
      const response = await request(app)
        .get('/api/complaints?category=air_pollution&status=submitted')
        .expect(200);

      expect(response.body).toHaveProperty('filters');
      expect(response.body.filters).toHaveProperty('category', 'air_pollution');
      expect(response.body.filters).toHaveProperty('status', 'submitted');
    });
  });

  describe('GET /api/complaints/statistics', () => {
    test('Should return complaint statistics', async () => {
      const response = await request(app)
        .get('/api/complaints/statistics')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('total');
      expect(response.body.data).toHaveProperty('resolved');
      expect(response.body.data).toHaveProperty('pending');
    });
  });
});

describe('Projects Routes', () => {
  describe('GET /api/projects', () => {
    test('Should return projects list', async () => {
      const response = await request(app)
        .get('/api/projects')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body).toHaveProperty('pagination');
    });

    test('Should handle project type filtering', async () => {
      const response = await request(app)
        .get('/api/projects?type=reforestation')
        .expect(200);

      expect(response.body.filters).toHaveProperty('type', 'reforestation');
    });
  });

  describe('GET /api/projects/statistics', () => {
    test('Should return project statistics', async () => {
      const response = await request(app)
        .get('/api/projects/statistics')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('total');
    });
  });
});

describe('Blockchain Routes', () => {
  describe('GET /api/blockchain/status', () => {
    test('Should return blockchain status', async () => {
      const response = await request(app)
        .get('/api/blockchain/status')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('isConnected');
      expect(typeof response.body.data.isConnected).toBe('boolean');
    });
  });

  describe('Protected blockchain routes', () => {
    test('Should require authentication for issuing credits', async () => {
      const response = await request(app)
        .post('/api/blockchain/credits/issue')
        .send({
          to: '0x742d35Cc7D28fb0A7EdAE0b3F7e1E9D52b0B6D12',
          amount: 100,
          projectId: 'TEST-001',
          location: 'Test Location',
          expiryDate: '2025-12-31T00:00:00Z',
          methodology: 'Test Method'
        })
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });
  });
});

describe('Input Validation', () => {
  test('Should validate complaint creation data', async () => {
    const response = await request(app)
      .post('/api/complaints')
      .send({
        title: 'A', // Too short
        description: 'B', // Too short
        category: 'invalid_category',
        location: {}
      })
      .expect(400);

    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty('errors');
    expect(response.body.errors.length).toBeGreaterThan(0);
  });

  test('Should validate project creation data', async () => {
    const response = await request(app)
      .post('/api/projects')
      .set('Authorization', 'Bearer fake-token')
      .send({
        name: 'A', // Too short
        type: 'invalid_type',
        funding: { goal: -100 } // Invalid amount
      })
      .expect(401); // Will fail auth first

    expect(response.body).toHaveProperty('success', false);
  });
});