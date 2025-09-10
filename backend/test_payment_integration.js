// Test script to verify payment integration
const axios = require("axios");

const testPaymentIntegration = async () => {
  console.log("🧪 Testing Payment Integration...\n");

  const baseURL = "http://localhost:5000/api";

  try {
    // Test 1: Payment Methods Endpoint
    console.log("1. Testing Payment Methods Endpoint...");
    const methodsResponse = await axios.get(`${baseURL}/payments/methods`, {
      withCredentials: true,
      headers: {
        Origin: "http://localhost:5173",
      },
    });
    console.log(
      "✅ Payment methods endpoint:",
      methodsResponse.status === 200 ? "SUCCESS" : "FAILED"
    );

    // Test 2: Payment Wallets Endpoint
    console.log("2. Testing Payment Wallets Endpoint...");
    const walletsResponse = await axios.get(`${baseURL}/payments/wallets`, {
      withCredentials: true,
      headers: {
        Origin: "http://localhost:5173",
      },
    });
    console.log(
      "✅ Payment wallets endpoint:",
      walletsResponse.status === 200 ? "SUCCESS" : "FAILED"
    );

    // Test 3: CORS Headers
    console.log("3. Testing CORS Headers...");
    const corsTest = methodsResponse.headers["access-control-allow-origin"];
    console.log("✅ CORS Origin Header:", corsTest ? "PRESENT" : "MISSING");

    console.log("\n🎉 Payment Integration Tests Completed!");
  } catch (error) {
    if (error.response) {
      console.log("❌ API Error:", error.response.status, error.response.data);
    } else if (error.request) {
      console.log(
        "❌ Network Error - Check if backend is running on port 5000"
      );
    } else {
      console.log("❌ Test Error:", error.message);
    }
  }
};

testPaymentIntegration();
