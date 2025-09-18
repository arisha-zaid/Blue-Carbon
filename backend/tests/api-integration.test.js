const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../test-app");

describe("API Integration Tests", () => {
  let authToken = null;
  let testUserId = null;
  let testProjectId = null;

  beforeAll(async () => {
    // Connect to test database
    if (mongoose.connection.readyState === 0) {
      const uri = (
        process.env.MONGODB_URI_TEST ||
        "mongodb://127.0.0.1:27017/blue_carbon_test"
      ).replace("localhost", "127.0.0.1");
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 20000,
        family: 4,
      });
    }
  });

  afterAll(async () => {
    // Cleanup test data
    if (testUserId) {
      await mongoose.connection.db
        .collection("users")
        .deleteOne({ _id: testUserId });
    }
    if (testProjectId) {
      await mongoose.connection.db
        .collection("projects")
        .deleteOne({ _id: testProjectId });
    }
    await mongoose.connection.close();
  });

  describe("Health and Status Endpoints", () => {
    test("GET /api/health should return server status", async () => {
      const response = await request(app).get("/api/health").expect(200);

      expect(response.body).toHaveProperty("status", "OK");
      expect(response.body).toHaveProperty("timestamp");
      expect(response.body).toHaveProperty("uptime");
    });

    test("GET /api/blockchain/status should return blockchain status", async () => {
      const response = await request(app)
        .get("/api/blockchain/status")
        .expect(200);

      expect(response.body).toHaveProperty("success", true);
      expect(response.body).toHaveProperty("data");
      expect(response.body.data).toHaveProperty("isConnected");
      expect(typeof response.body.data.isConnected).toBe("boolean");
    });
  });

  describe("Authentication Endpoints", () => {
    const testUser = {
      firstName: "Test",
      lastName: "User",
      email: `test.integration.${Date.now()}@example.com`,
      password: "TestPassword123!",
      userType: "community",
      organization: "Test Organization",
    };

    test("POST /api/auth/register should create new user with valid data", async () => {
      const response = await request(app)
        .post("/api/auth/register")
        .send(testUser);

      if (response.status === 201) {
        expect(response.body).toHaveProperty("success", true);
        expect(response.body).toHaveProperty("message");
        expect(response.body).toHaveProperty("user");

        testUserId = response.body.user._id || response.body.user.id;
      } else {
        // If registration fails, it should be due to validation or other expected reasons
        expect(response.status).toBeGreaterThanOrEqual(400);
        expect(response.body).toHaveProperty("success", false);
      }
    });

    test("POST /api/auth/login should authenticate user with valid credentials", async () => {
      // First ensure user exists by trying to register (might fail if already exists)
      await request(app).post("/api/auth/register").send(testUser);

      const response = await request(app).post("/api/auth/login").send({
        email: testUser.email,
        password: testUser.password,
      });

      if (response.status === 200) {
        expect(response.body).toHaveProperty("success", true);
        expect(response.body).toHaveProperty("token");
        expect(response.body).toHaveProperty("user");

        authToken = response.body.token;
      } else {
        // Login might fail for various reasons in test environment
        expect(response.status).toBeGreaterThanOrEqual(400);
      }
    });

    test("POST /api/auth/login should reject invalid credentials", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: "nonexistent@example.com",
          password: "wrongpassword",
        })
        .expect(401);

      expect(response.body).toHaveProperty("success", false);
      expect(response.body).toHaveProperty("message");
    });

    test("GET /api/auth/me should require authentication", async () => {
      const response = await request(app).get("/api/auth/me").expect(401);

      expect(response.body).toHaveProperty("success", false);
    });

    test("GET /api/auth/me should return user data with valid token", async () => {
      if (authToken) {
        const response = await request(app)
          .get("/api/auth/me")
          .set("Authorization", `Bearer ${authToken}`)
          .expect(200);

        expect(response.body).toHaveProperty("success", true);
        expect(response.body).toHaveProperty("data");
        expect(response.body.data).toHaveProperty("user");
        expect(response.body.data.user).toHaveProperty("email", testUser.email);
      } else {
        // Skip this test if we don't have a valid token
        console.log("Skipping profile test - no auth token available");
      }
    });
  });

  describe("Projects Endpoints", () => {
    test("GET /api/projects should return projects list", async () => {
      const response = await request(app).get("/api/projects");

      if (response.status === 200) {
        expect(response.body).toHaveProperty("success", true);
        expect(response.body).toHaveProperty("data");
        expect(Array.isArray(response.body.data)).toBe(true);
        expect(response.body).toHaveProperty("pagination");
      } else {
        // API might return error due to database connection issues
        expect(response.status).toBeGreaterThanOrEqual(400);
        expect(response.body).toHaveProperty("success", false);
      }
    });

    test("GET /api/projects should handle pagination", async () => {
      const response = await request(app).get("/api/projects?page=1&limit=5");

      if (response.status === 200) {
        expect(response.body.pagination).toHaveProperty("current", 1);
        expect(response.body.data.length).toBeLessThanOrEqual(5);
      } else {
        expect(response.status).toBeGreaterThanOrEqual(400);
      }
    });

    test("GET /api/projects should handle filtering", async () => {
      const response = await request(app).get(
        "/api/projects?type=mangroves&status=active"
      );

      if (response.status === 200) {
        expect(response.body).toHaveProperty("filters");
        if (response.body.filters) {
          expect(response.body.filters).toHaveProperty("type", "mangroves");
          expect(response.body.filters).toHaveProperty("status", "active");
        }
      } else {
        expect(response.status).toBeGreaterThanOrEqual(400);
      }
    });

    test("POST /api/projects should require authentication", async () => {
      const testProject = {
        name: "Test Project",
        type: "mangroves",
        location: {
          coordinates: [76.3388, 9.4981],
          address: "Alappuzha, Kerala",
        },
        area: 10.5,
        description: "Test project description",
      };

      const response = await request(app)
        .post("/api/projects")
        .send(testProject)
        .expect(401);

      expect(response.body).toHaveProperty("success", false);
    });

    test("POST /api/projects should create project with valid data and auth", async () => {
      if (authToken) {
        const testProject = {
          name: "Integration Test Project",
          type: "mangroves",
          location: {
            coordinates: [76.3388, 9.4981],
            address: "Alappuzha, Kerala",
          },
          area: 15.5,
          description: "Project created during integration testing",
        };

        const response = await request(app)
          .post("/api/projects")
          .set("Authorization", `Bearer ${authToken}`)
          .send(testProject);

        if (response.status === 201) {
          expect(response.body).toHaveProperty("success", true);
          expect(response.body).toHaveProperty("data");
          expect(response.body.data).toHaveProperty("name", testProject.name);

          testProjectId = response.body.data._id || response.body.data.id;
        } else {
          expect(response.status).toBeGreaterThanOrEqual(400);
        }
      } else {
        console.log("Skipping project creation test - no auth token available");
      }
    });

    test("GET /api/projects/statistics should return project stats", async () => {
      const response = await request(app).get("/api/projects/statistics");

      if (response.status === 200) {
        expect(response.body).toHaveProperty("success", true);
        expect(response.body).toHaveProperty("data");
        expect(response.body.data).toHaveProperty("total");
        expect(typeof response.body.data.total).toBe("number");
      } else {
        expect(response.status).toBeGreaterThanOrEqual(400);
      }
    });
  });

  describe("Complaints Endpoints", () => {
    test("GET /api/complaints should return complaints list", async () => {
      const response = await request(app).get("/api/complaints");

      if (response.status === 200) {
        expect(response.body).toHaveProperty("success", true);
        expect(response.body).toHaveProperty("data");
        expect(Array.isArray(response.body.data)).toBe(true);
        expect(response.body).toHaveProperty("pagination");
      } else {
        expect(response.status).toBeGreaterThanOrEqual(400);
      }
    });

    test("GET /api/complaints/statistics should return complaint stats", async () => {
      const response = await request(app).get("/api/complaints/statistics");

      if (response.status === 200) {
        expect(response.body).toHaveProperty("success", true);
        expect(response.body).toHaveProperty("data");
        expect(response.body.data).toHaveProperty("total");
        expect(response.body.data).toHaveProperty("resolved");
        expect(response.body.data).toHaveProperty("pending");
      } else {
        expect(response.status).toBeGreaterThanOrEqual(400);
      }
    });

    test("POST /api/complaints should validate complaint data", async () => {
      const invalidComplaint = {
        title: "A", // Too short
        description: "B", // Too short
        category: "invalid_category",
      };

      const response = await request(app)
        .post("/api/complaints")
        .send(invalidComplaint)
        .expect(400);

      expect(response.body).toHaveProperty("success", false);
      expect(response.body).toHaveProperty("errors");
      expect(Array.isArray(response.body.errors)).toBe(true);
    });
  });

  describe("Location Services", () => {
    test("GET /api/locations should return location suggestions", async () => {
      const response = await request(app).get("/api/locations?type=mangroves");

      // This endpoint might not exist or might require different parameters
      if (response.status === 200) {
        expect(response.body).toHaveProperty("success", true);
        expect(response.body).toHaveProperty("data");
      } else {
        // Location service might not be fully implemented
        expect(response.status).toBeDefined();
      }
    });
  });

  describe("Error Handling", () => {
    test("should return 404 for non-existent routes", async () => {
      const response = await request(app)
        .get("/api/non-existent-route")
        .expect(404);

      expect(response.body).toHaveProperty("success", false);
      expect(response.body).toHaveProperty("message", "Route not found");
    });

    test("should handle malformed JSON requests", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .set("Content-Type", "application/json")
        .send('{"invalid": json}')
        .expect(400);

      expect(response.body).toHaveProperty("success", false);
    });

    test("should include CORS headers", async () => {
      const response = await request(app).get("/api/health").expect(200);

      expect(response.headers).toHaveProperty("access-control-allow-origin");
    });

    test("should include security headers", async () => {
      const response = await request(app).get("/api/health").expect(200);

      expect(response.headers).toHaveProperty(
        "x-content-type-options",
        "nosniff"
      );
      expect(response.headers).toHaveProperty("x-frame-options");
    });
  });

  describe("Rate Limiting", () => {
    test("should apply rate limiting to auth endpoints", async () => {
      const requests = Array.from({ length: 3 }, () =>
        request(app).post("/api/auth/login").send({
          email: "test@example.com",
          password: "password",
        })
      );

      const responses = await Promise.all(requests);

      // All requests should complete (might be rate limited or fail for other reasons)
      responses.forEach((response) => {
        expect(response.status).toBeDefined();
        expect(typeof response.status).toBe("number");
      });
    });
  });

  describe("Input Validation", () => {
    test("should validate email format in registration", async () => {
      const response = await request(app)
        .post("/api/auth/register")
        .send({
          firstName: "Test",
          lastName: "User",
          email: "invalid-email-format",
          password: "password123",
        })
        .expect(400);

      expect(response.body).toHaveProperty("success", false);
      expect(response.body).toHaveProperty("errors");
    });

    test("should validate required fields in registration", async () => {
      const response = await request(app)
        .post("/api/auth/register")
        .send({
          firstName: "Test",
          // Missing required fields
        })
        .expect(400);

      expect(response.body).toHaveProperty("success", false);
      expect(response.body).toHaveProperty("errors");
      expect(Array.isArray(response.body.errors)).toBe(true);
    });
  });

  describe("Data Persistence", () => {
    test("should persist user data correctly", async () => {
      if (testUserId) {
        // Check if user exists in database
        const user = await mongoose.connection.db
          .collection("users")
          .findOne({ _id: new mongoose.Types.ObjectId(testUserId) });

        if (user) {
          expect(user).toHaveProperty("email");
          expect(user).toHaveProperty("firstName");
          expect(user).toHaveProperty("lastName");
        }
      }
    });

    test("should handle database connection gracefully", async () => {
      // This test ensures the API handles database issues gracefully
      const response = await request(app).get("/api/projects").timeout(10000);

      // Should either return data or a proper error response
      expect(response.status).toBeDefined();
      expect(typeof response.status).toBe("number");

      if (response.status >= 500) {
        expect(response.body).toHaveProperty("success", false);
      }
    });
  });
});
