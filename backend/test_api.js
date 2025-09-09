// Simple API test script for the transaction endpoints
const axios = require("axios");

const BASE_URL = "http://localhost:5000/api";

async function testAPI() {
  try {
    console.log("🧪 Testing API Endpoints...\n");

    // Test health endpoint
    console.log("1. Testing health endpoint...");
    const health = await axios.get(`${BASE_URL}/health`);
    console.log("✅ Health:", health.data);

    // Test market data endpoint (no auth required)
    console.log("\n2. Testing market data endpoint...");
    const marketData = await axios.get(`${BASE_URL}/transactions/market/data`);
    console.log("✅ Market Data:", JSON.stringify(marketData.data, null, 2));

    console.log("\n✅ All public endpoints working correctly!");
    console.log("\n📋 Available Endpoints:");
    console.log("- GET /api/health - Server health check");
    console.log("- GET /api/transactions/market/data - Market data (no auth)");
    console.log(
      "- POST /api/transactions/calculate-fees - Calculate transaction fees (auth required)"
    );
    console.log(
      "- POST /api/transactions/validate - Validate transaction (auth required)"
    );
    console.log("\n🔐 Industry-specific endpoints (require authentication):");
    console.log("- GET /api/industry/transactions - Get user transactions");
    console.log("- POST /api/industry/transactions - Create new transaction");
    console.log("- GET /api/industry/wallet/balance - Get wallet balance");
    console.log("- POST /api/industry/wallet/update - Update wallet balance");
    console.log(
      "- GET /api/industry/analytics/transactions - Transaction analytics"
    );
  } catch (error) {
    console.error("❌ API Test Error:", error.response?.data || error.message);
  }
}

testAPI();
