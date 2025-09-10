#!/usr/bin/env node

/**
 * Real Payment Integration Test
 *
 * Tests the payment integration with actual payment processors
 * (using test/sandbox environments)
 */

const axios = require("axios");
const path = require("path");

// Load environment variables
require("dotenv").config({
  path: path.join(__dirname, "backend", ".env"),
  override: true,
});

class RealPaymentTest {
  constructor() {
    this.baseURL = `http://localhost:${process.env.PORT || 5000}/api`;
    this.authToken = null;
  }

  log(message, type = "info") {
    const colors = {
      info: "\x1b[36m", // cyan
      success: "\x1b[32m", // green
      warning: "\x1b[33m", // yellow
      error: "\x1b[31m", // red
      reset: "\x1b[0m",
    };

    const icons = {
      info: "ℹ️",
      success: "✅",
      warning: "⚠️",
      error: "❌",
    };

    console.log(`${colors[type]}${icons[type]} ${message}${colors.reset}`);
  }

  async authenticateTestUser() {
    try {
      this.log("Creating test user for payment testing...");

      // Try to login first
      try {
        const loginResponse = await axios.post(`${this.baseURL}/auth/login`, {
          email: "payment.test@example.com",
          password: "TestPayment123!",
        });

        this.authToken = loginResponse.data.token;
        this.log("Test user logged in successfully", "success");
        return true;
      } catch (loginError) {
        // User doesn't exist, create it
        this.log("Test user not found, creating new user...");

        const signupResponse = await axios.post(`${this.baseURL}/auth/signup`, {
          email: "payment.test@example.com",
          password: "TestPayment123!",
          firstName: "Payment",
          lastName: "Tester",
          userType: "individual",
        });

        this.authToken = signupResponse.data.token;
        this.log("Test user created successfully", "success");
        return true;
      }
    } catch (error) {
      this.log(`Authentication failed: ${error.message}`, "error");
      return false;
    }
  }

  async testPaymentMethods() {
    try {
      this.log("\nTesting payment methods endpoint...");

      const response = await axios.get(`${this.baseURL}/payments/methods`, {
        headers: { Authorization: `Bearer ${this.authToken}` },
      });

      if (response.data.success) {
        this.log("Payment methods loaded successfully", "success");
        console.log(
          "Available methods:",
          response.data.data.methods.map((m) => m.name).join(", ")
        );
        return response.data.data.methods;
      } else {
        this.log("Payment methods request failed", "error");
        return null;
      }
    } catch (error) {
      this.log(
        `Payment methods test failed: ${
          error.response?.data?.message || error.message
        }`,
        "error"
      );
      return null;
    }
  }

  async testPaymentCalculation() {
    try {
      this.log("\nTesting payment calculation...");

      const testData = {
        amount: 10, // 10 carbon credits
        pricePerUnit: 25, // $25 per credit
        paymentMethod: "credit_card",
      };

      const response = await axios.post(
        `${this.baseURL}/payments/calculate`,
        testData,
        {
          headers: { Authorization: `Bearer ${this.authToken}` },
        }
      );

      if (response.data.success) {
        this.log("Payment calculation successful", "success");
        const calc = response.data.data;
        console.log(`Base value: $${calc.baseValue}`);
        console.log(`Total fees: $${calc.totalFees}`);
        console.log(`Final total: $${calc.total}`);
        return calc;
      } else {
        this.log("Payment calculation failed", "error");
        return null;
      }
    } catch (error) {
      this.log(
        `Payment calculation test failed: ${
          error.response?.data?.message || error.message
        }`,
        "error"
      );
      return null;
    }
  }

  async testStripeIntegration() {
    if (
      !process.env.STRIPE_SECRET_KEY ||
      process.env.STRIPE_SECRET_KEY === "sk_test_your_stripe_secret_key"
    ) {
      this.log("Stripe not configured, skipping test", "warning");
      return false;
    }

    try {
      this.log("\nTesting Stripe integration...");

      // Test payment data
      const paymentData = {
        transactionData: {
          type: "purchase",
          amount: 5,
          pricePerUnit: 20,
          paymentMethod: "credit_card",
          project: {
            id: "test-project-id",
            name: "Test Project",
          },
        },
        paymentMethod: "credit_card",
        paymentDetails: {
          cardNumber: "4242424242424242", // Stripe test card
          cvv: "123",
          expiryDate: "12/25",
          cardholderName: "Payment Tester",
          billingAddress: {
            street: "123 Test St",
            city: "Test City",
            state: "TC",
            zipCode: "12345",
            country: "US",
          },
        },
        calculation: {
          baseValue: 100,
          platformFee: 0.5,
          paymentFee: 2.9,
          blockchainFee: 25,
          totalFees: 28.4,
          total: 128.4,
        },
      };

      const response = await axios.post(
        `${this.baseURL}/payments/process`,
        paymentData,
        {
          headers: { Authorization: `Bearer ${this.authToken}` },
        }
      );

      if (response.data.success) {
        this.log("Stripe payment test successful", "success");
        console.log("Payment ID:", response.data.data.paymentId);
        console.log("Status:", response.data.data.status);
        return true;
      } else {
        this.log("Stripe payment test failed", "error");
        console.log("Error details:", response.data.details);
        return false;
      }
    } catch (error) {
      this.log(
        `Stripe integration test failed: ${
          error.response?.data?.message || error.message
        }`,
        "error"
      );
      if (error.response?.data?.details) {
        console.log("Error details:", error.response.data.details);
      }
      return false;
    }
  }

  async testPayPalIntegration() {
    if (
      !process.env.PAYPAL_CLIENT_ID ||
      process.env.PAYPAL_CLIENT_ID === "your_paypal_client_id"
    ) {
      this.log("PayPal not configured, skipping test", "warning");
      return false;
    }

    try {
      this.log("\nTesting PayPal integration...");

      const paymentData = {
        transactionData: {
          type: "purchase",
          amount: 5,
          pricePerUnit: 20,
          paymentMethod: "paypal",
        },
        paymentMethod: "paypal",
        paymentDetails: {
          email: "buyer@example.com",
          firstName: "Payment",
          lastName: "Tester",
        },
        calculation: {
          baseValue: 100,
          total: 105,
        },
      };

      const response = await axios.post(
        `${this.baseURL}/payments/process`,
        paymentData,
        {
          headers: { Authorization: `Bearer ${this.authToken}` },
        }
      );

      if (response.data.success && response.data.data.approvalUrl) {
        this.log("PayPal payment test successful", "success");
        console.log("Approval URL:", response.data.data.approvalUrl);
        return true;
      } else {
        this.log("PayPal payment test failed", "error");
        return false;
      }
    } catch (error) {
      this.log(
        `PayPal integration test failed: ${
          error.response?.data?.message || error.message
        }`,
        "error"
      );
      return false;
    }
  }

  async testCryptoIntegration() {
    if (
      !process.env.COINBASE_API_KEY ||
      process.env.COINBASE_API_KEY === "your_coinbase_api_key"
    ) {
      this.log("Coinbase Commerce not configured, skipping test", "warning");
      return false;
    }

    try {
      this.log("\nTesting Coinbase Commerce integration...");

      const paymentData = {
        transactionData: {
          type: "purchase",
          amount: 2,
          pricePerUnit: 50,
          paymentMethod: "crypto",
        },
        paymentMethod: "crypto",
        paymentDetails: {
          walletAddress: "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa", // Example BTC address
          cryptoType: "bitcoin",
        },
        calculation: {
          baseValue: 100,
          total: 101,
        },
      };

      const response = await axios.post(
        `${this.baseURL}/payments/process`,
        paymentData,
        {
          headers: { Authorization: `Bearer ${this.authToken}` },
        }
      );

      if (response.data.success && response.data.data.paymentUrl) {
        this.log("Coinbase Commerce test successful", "success");
        console.log("Payment URL:", response.data.data.paymentUrl);
        return true;
      } else {
        this.log("Coinbase Commerce test failed", "error");
        return false;
      }
    } catch (error) {
      this.log(
        `Coinbase Commerce test failed: ${
          error.response?.data?.message || error.message
        }`,
        "error"
      );
      return false;
    }
  }

  async run() {
    this.log("🧪 Starting Real Payment Integration Tests\n");

    // Check server connectivity
    try {
      await axios.get(`${this.baseURL}/health`);
      this.log("Server is reachable", "success");
    } catch (error) {
      this.log(
        "Cannot connect to server. Make sure backend is running on port " +
          (process.env.PORT || 5000),
        "error"
      );
      return;
    }

    // Authenticate test user
    const authSuccess = await this.authenticateTestUser();
    if (!authSuccess) {
      this.log("Authentication failed, cannot continue tests", "error");
      return;
    }

    // Run tests
    const results = {
      paymentMethods: await this.testPaymentMethods(),
      paymentCalculation: await this.testPaymentCalculation(),
      stripe: await this.testStripeIntegration(),
      paypal: await this.testPayPalIntegration(),
      crypto: await this.testCryptoIntegration(),
    };

    // Summary
    this.log("\n📊 Test Results Summary:", "info");
    console.log("────────────────────────────");
    console.log(
      `Payment Methods API: ${results.paymentMethods ? "✅ PASS" : "❌ FAIL"}`
    );
    console.log(
      `Payment Calculation: ${
        results.paymentCalculation ? "✅ PASS" : "❌ FAIL"
      }`
    );
    console.log(
      `Stripe Integration: ${results.stripe ? "✅ PASS" : "❌ FAIL"}`
    );
    console.log(
      `PayPal Integration: ${results.paypal ? "✅ PASS" : "❌ FAIL"}`
    );
    console.log(
      `Crypto Integration: ${results.crypto ? "✅ PASS" : "❌ FAIL"}`
    );

    const passedTests = Object.values(results).filter(Boolean).length;
    const totalTests = Object.keys(results).length;

    this.log(
      `\n🎯 Overall: ${passedTests}/${totalTests} tests passed`,
      passedTests === totalTests ? "success" : "warning"
    );

    if (passedTests < totalTests) {
      this.log("\n💡 To fix failing tests:", "info");
      this.log("1. Run: node setup-real-payments.js", "info");
      this.log("2. Configure payment processor API keys", "info");
      this.log("3. Ensure all required environment variables are set", "info");
    } else {
      this.log("\n🎉 All payment integrations are working!", "success");
      this.log("Ready for production with proper API keys", "info");
    }
  }
}

// Run tests
const tester = new RealPaymentTest();
tester.run().catch(console.error);
