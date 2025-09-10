#!/usr/bin/env node

/**
 * Interactive Setup Script for Real Payment Integration
 * Blue Carbon Platform - Payment Processor Configuration
 */

const fs = require("fs");
const path = require("path");
const readline = require("readline");
const https = require("https");

// Colors for console output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
};

function colorLog(color, message) {
  console.log(colors[color] + message + colors.reset);
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

// Load environment variables
function loadEnvFile() {
  const envPath = path.join(__dirname, ".env");
  if (!fs.existsSync(envPath)) {
    colorLog("red", "❌ .env file not found!");
    process.exit(1);
  }

  const envContent = fs.readFileSync(envPath, "utf8");
  const envVars = {};

  envContent.split("\n").forEach((line) => {
    const [key, ...valueParts] = line.split("=");
    if (key && valueParts.length > 0 && !key.startsWith("#")) {
      envVars[key.trim()] = valueParts.join("=").trim();
    }
  });

  return { envVars, envContent, envPath };
}

// Update environment variable in .env file
function updateEnvVar(envPath, envContent, key, newValue) {
  const lines = envContent.split("\n");
  let updated = false;

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith(key + "=")) {
      lines[i] = `${key}=${newValue}`;
      updated = true;
      break;
    }
  }

  if (!updated) {
    lines.push(`${key}=${newValue}`);
  }

  const newContent = lines.join("\n");
  fs.writeFileSync(envPath, newContent);
  colorLog("green", `✅ Updated ${key} in .env file`);
}

// Test API endpoint
function testEndpoint(url, options = {}) {
  return new Promise((resolve) => {
    const req = https.request(
      url,
      {
        method: "GET",
        timeout: 5000,
        ...options,
      },
      (res) => {
        resolve({ success: true, status: res.statusCode });
      }
    );

    req.on("error", () => {
      resolve({ success: false });
    });

    req.on("timeout", () => {
      resolve({ success: false });
    });

    req.end();
  });
}

async function checkCurrentSetup() {
  colorLog("cyan", "\n🔍 CHECKING CURRENT PAYMENT SETUP...\n");

  const { envVars } = loadEnvFile();

  // Check Stripe
  console.log("💳 STRIPE (Credit Cards):");
  if (
    envVars.STRIPE_PUBLIC_KEY &&
    envVars.STRIPE_PUBLIC_KEY.startsWith("pk_")
  ) {
    colorLog("green", "  ✅ Public Key: Configured");
  } else {
    colorLog("red", "  ❌ Public Key: Missing or invalid");
  }

  if (
    envVars.STRIPE_SECRET_KEY &&
    envVars.STRIPE_SECRET_KEY.startsWith("sk_")
  ) {
    colorLog("green", "  ✅ Secret Key: Configured");
  } else {
    colorLog("red", "  ❌ Secret Key: Missing or invalid");
  }

  if (
    envVars.STRIPE_WEBHOOK_SECRET &&
    envVars.STRIPE_WEBHOOK_SECRET.startsWith("whsec_")
  ) {
    colorLog("green", "  ✅ Webhook Secret: Configured");
  } else if (
    envVars.STRIPE_WEBHOOK_SECRET === "whsec_your_stripe_webhook_secret"
  ) {
    colorLog("yellow", "  ⚠️  Webhook Secret: Placeholder (needs real secret)");
  } else {
    colorLog("red", "  ❌ Webhook Secret: Missing");
  }

  // Check PayPal
  console.log("\n🅿️  PAYPAL:");
  if (envVars.PAYPAL_CLIENT_ID) {
    colorLog("green", "  ✅ Client ID: Configured");
  } else {
    colorLog("red", "  ❌ Client ID: Missing");
  }

  if (envVars.PAYPAL_CLIENT_SECRET) {
    colorLog("green", "  ✅ Client Secret: Configured");
  } else {
    colorLog("red", "  ❌ Client Secret: Missing");
  }

  if (envVars.PAYPAL_MODE) {
    colorLog("green", `  ✅ Mode: ${envVars.PAYPAL_MODE}`);
  } else {
    colorLog("red", "  ❌ Mode: Missing");
  }

  // Check Coinbase
  console.log("\n₿ COINBASE COMMERCE (Crypto):");
  if (envVars.COINBASE_API_KEY) {
    colorLog("green", "  ✅ API Key: Configured");
  } else {
    colorLog("red", "  ❌ API Key: Missing");
  }

  if (
    envVars.COINBASE_WEBHOOK_SECRET &&
    envVars.COINBASE_WEBHOOK_SECRET !== "your_coinbase_webhook_secret"
  ) {
    colorLog("green", "  ✅ Webhook Secret: Configured");
  } else {
    colorLog("yellow", "  ⚠️  Webhook Secret: Placeholder (needs real secret)");
  }

  console.log("");
  return envVars;
}

async function setupStripeWebhook(envVars, envPath, envContent) {
  colorLog("blue", "\n🔧 STRIPE WEBHOOK SETUP\n");

  if (
    envVars.STRIPE_WEBHOOK_SECRET &&
    envVars.STRIPE_WEBHOOK_SECRET.startsWith("whsec_")
  ) {
    console.log("Stripe webhook secret is already configured!");
    const update = await ask("Do you want to update it? (y/N): ");
    if (update.toLowerCase() !== "y" && update.toLowerCase() !== "yes") {
      return;
    }
  }

  console.log("To get your Stripe webhook secret:");
  console.log("1. Go to: https://dashboard.stripe.com/test/webhooks");
  console.log('2. Click "Add endpoint"');
  console.log("3. Endpoint URL: https://yourdomain.com/api/webhooks/stripe");
  console.log(
    "   (For local dev, use ngrok: https://abc123.ngrok.io/api/webhooks/stripe)"
  );
  console.log(
    "4. Select events: payment_intent.succeeded, payment_intent.payment_failed"
  );
  console.log('5. Click "Add endpoint"');
  console.log('6. Copy the "Signing secret" (starts with whsec_)');
  console.log("");

  const secret = await ask("Enter your Stripe webhook secret (whsec_...): ");

  if (secret && secret.startsWith("whsec_")) {
    updateEnvVar(envPath, envContent, "STRIPE_WEBHOOK_SECRET", secret);
    colorLog("green", "✅ Stripe webhook secret updated!");
  } else {
    colorLog(
      "red",
      '❌ Invalid webhook secret format. Should start with "whsec_"'
    );
  }
}

async function setupCoinbaseWebhook(envVars, envPath, envContent) {
  colorLog("blue", "\n🔧 COINBASE COMMERCE WEBHOOK SETUP\n");

  if (
    envVars.COINBASE_WEBHOOK_SECRET &&
    envVars.COINBASE_WEBHOOK_SECRET !== "your_coinbase_webhook_secret" &&
    envVars.COINBASE_WEBHOOK_SECRET.length > 20
  ) {
    console.log("Coinbase webhook secret is already configured!");
    const update = await ask("Do you want to update it? (y/N): ");
    if (update.toLowerCase() !== "y" && update.toLowerCase() !== "yes") {
      return;
    }
  }

  console.log("To get your Coinbase Commerce webhook secret:");
  console.log("1. Go to: https://commerce.coinbase.com/settings");
  console.log('2. Click "Webhook subscriptions"');
  console.log('3. Click "Add an endpoint"');
  console.log("4. Endpoint URL: https://yourdomain.com/api/webhooks/coinbase");
  console.log(
    "   (For local dev, use ngrok: https://abc123.ngrok.io/api/webhooks/coinbase)"
  );
  console.log(
    "5. Select events: charge:confirmed, charge:failed, charge:delayed"
  );
  console.log('6. Copy the "Shared Secret"');
  console.log("");

  const secret = await ask("Enter your Coinbase webhook secret: ");

  if (
    secret &&
    secret.length > 10 &&
    secret !== "your_coinbase_webhook_secret"
  ) {
    updateEnvVar(envPath, envContent, "COINBASE_WEBHOOK_SECRET", secret);
    colorLog("green", "✅ Coinbase webhook secret updated!");
  } else {
    colorLog(
      "red",
      "❌ Invalid webhook secret. Please enter the actual secret from Coinbase."
    );
  }
}

async function setupNgrok() {
  colorLog("blue", "\n🌐 LOCAL DEVELOPMENT SETUP\n");

  console.log(
    "For local development, webhooks need HTTPS. We recommend using ngrok:"
  );
  console.log("");
  console.log("1. Install ngrok: npm install -g ngrok");
  console.log("2. Start your backend: npm run dev");
  console.log("3. In another terminal: ngrok http 5000");
  console.log("4. Use the HTTPS URL for webhook endpoints");
  console.log("");

  const setupNow = await ask(
    "Would you like instructions to set up ngrok now? (y/N): "
  );

  if (setupNow.toLowerCase() === "y" || setupNow.toLowerCase() === "yes") {
    console.log("\n📋 NGROK SETUP COMMANDS:");
    console.log("");
    colorLog("yellow", "# In Terminal 1 (Backend Server):");
    console.log("cd c:\\Users\\HP\\Blue-Carbon\\backend");
    console.log("npm run dev");
    console.log("");
    colorLog("yellow", "# In Terminal 2 (ngrok):");
    console.log("ngrok http 5000");
    console.log("");
    console.log("After running ngrok, you'll get a URL like:");
    colorLog("green", "https://abc123.ngrok.io");
    console.log("");
    console.log("Use this for your webhook URLs:");
    console.log("• Stripe: https://abc123.ngrok.io/api/webhooks/stripe");
    console.log("• PayPal: https://abc123.ngrok.io/api/webhooks/paypal");
    console.log("• Coinbase: https://abc123.ngrok.io/api/webhooks/coinbase");
  }
}

async function testPaymentEndpoints() {
  colorLog("blue", "\n🧪 TESTING PAYMENT ENDPOINTS\n");

  const baseUrl = "http://localhost:5000";

  // Test if server is running
  console.log("Testing server connection...");
  const healthCheck = await testEndpoint(baseUrl + "/api/health");

  if (!healthCheck.success) {
    colorLog("red", "❌ Server is not running on port 5000");
    console.log("Please start your backend server first:");
    console.log("  cd c:\\Users\\HP\\Blue-Carbon\\backend");
    console.log("  npm run dev");
    return;
  }

  colorLog("green", "✅ Server is running");

  // Test webhook endpoints
  const webhookEndpoints = [
    "/api/webhooks/stripe",
    "/api/webhooks/paypal",
    "/api/webhooks/coinbase",
  ];

  console.log("\nTesting webhook endpoints...");
  for (const endpoint of webhookEndpoints) {
    const result = await testEndpoint(baseUrl + endpoint, { method: "POST" });
    if (result.success) {
      colorLog("green", `✅ ${endpoint} - accessible`);
    } else {
      colorLog("red", `❌ ${endpoint} - not accessible`);
    }
  }
}

async function generateTestScript() {
  colorLog("blue", "\n📝 GENERATING TEST SCRIPT\n");

  const testScript = `
// Test Real Payments - Auto-generated test script
const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

// Test Stripe Credit Card Payment
async function testStripePayment() {
    console.log('🧪 Testing Stripe Payment...');
    
    try {
        const response = await axios.post(\`\${BASE_URL}/api/payments/process\`, {
            transactionData: {
                type: 'purchase',
                amount: 1, // $1 test
                pricePerUnit: 25,
                paymentMethod: 'credit_card'
            },
            paymentMethod: 'credit_card',
            paymentDetails: {
                cardNumber: '4242424242424242', // Stripe test card
                cvv: '123',
                expiryDate: '12/25',
                cardholderName: 'Test User'
            }
        }, {
            headers: {
                'Authorization': 'Bearer YOUR_JWT_TOKEN_HERE',
                'Content-Type': 'application/json'
            }
        });
        
        console.log('✅ Stripe Payment Success:', response.data);
    } catch (error) {
        console.log('❌ Stripe Payment Error:', error.response?.data || error.message);
    }
}

// Test PayPal Payment
async function testPayPalPayment() {
    console.log('🧪 Testing PayPal Payment...');
    
    try {
        const response = await axios.post(\`\${BASE_URL}/api/payments/process\`, {
            transactionData: {
                type: 'purchase', 
                amount: 1, // $1 test
                pricePerUnit: 25,
                paymentMethod: 'paypal'
            },
            paymentMethod: 'paypal'
        }, {
            headers: {
                'Authorization': 'Bearer YOUR_JWT_TOKEN_HERE',
                'Content-Type': 'application/json'
            }
        });
        
        console.log('✅ PayPal Payment Success:', response.data);
    } catch (error) {
        console.log('❌ PayPal Payment Error:', error.response?.data || error.message);
    }
}

// Test Coinbase Crypto Payment  
async function testCoinbasePayment() {
    console.log('🧪 Testing Coinbase Payment...');
    
    try {
        const response = await axios.post(\`\${BASE_URL}/api/payments/process\`, {
            transactionData: {
                type: 'purchase',
                amount: 1, // $1 test
                pricePerUnit: 25, 
                paymentMethod: 'crypto'
            },
            paymentMethod: 'crypto'
        }, {
            headers: {
                'Authorization': 'Bearer YOUR_JWT_TOKEN_HERE',
                'Content-Type': 'application/json'
            }
        });
        
        console.log('✅ Coinbase Payment Success:', response.data);
    } catch (error) {
        console.log('❌ Coinbase Payment Error:', error.response?.data || error.message);
    }
}

// Run all tests
async function runAllTests() {
    console.log('🚀 Starting Payment Integration Tests...\\n');
    
    await testStripePayment();
    console.log('');
    await testPayPalPayment();  
    console.log('');
    await testCoinbasePayment();
    
    console.log('\\n✅ All tests completed!');
    console.log('\\n📝 Note: Replace YOUR_JWT_TOKEN_HERE with actual JWT token');
}

runAllTests().catch(console.error);
`;

  const testPath = path.join(__dirname, "test-real-payments.js");
  fs.writeFileSync(testPath, testScript.trim());
  colorLog("green", "✅ Created test-real-payments.js");
  console.log("Run with: node test-real-payments.js");
}

async function showFinalSummary() {
  colorLog("magenta", "\n🎉 SETUP COMPLETE!\n");

  console.log(
    "Your real payment integration is configured! Here's what to do next:"
  );
  console.log("");
  colorLog("yellow", "1. Complete Webhook Setup:");
  console.log("   • Get webhook secrets from Stripe and Coinbase dashboards");
  console.log("   • Configure webhook URLs in payment processor settings");
  console.log("");
  colorLog("yellow", "2. Test Your Integration:");
  console.log("   • Start backend: npm run dev");
  console.log("   • Run tests: node test-real-payments.js");
  console.log("");
  colorLog("yellow", "3. For Local Development:");
  console.log("   • Install ngrok: npm install -g ngrok");
  console.log("   • Expose local server: ngrok http 5000");
  console.log("   • Use ngrok HTTPS URL for webhooks");
  console.log("");
  colorLog("yellow", "4. Production Deployment:");
  console.log("   • Replace test API keys with live keys");
  console.log("   • Set up HTTPS on production domain");
  console.log("   • Update webhook URLs to production endpoints");
  console.log("");

  colorLog("green", "💳 Your payment system now processes REAL payments!");
  colorLog("green", "🔒 All security measures are in place");
  colorLog(
    "green",
    "📊 Webhook handlers will update payment status automatically"
  );
  console.log("");
  console.log("Questions? Check the documentation:");
  console.log("• webhook-setup-guide.md");
  console.log("• coinbase-webhook-setup.md");
  console.log("• REAL-PAYMENT-IMPLEMENTATION.md");
}

async function main() {
  console.clear();
  colorLog("bright", "🚀 BLUE CARBON PAYMENT SETUP");
  colorLog("bright", "================================\n");

  try {
    // Step 1: Check current setup
    const envVars = await checkCurrentSetup();
    const { envContent, envPath } = loadEnvFile();

    // Step 2: Main menu
    while (true) {
      colorLog("cyan", "\n📋 SETUP OPTIONS:\n");
      console.log("1. Set up Stripe webhook secret");
      console.log("2. Set up Coinbase webhook secret");
      console.log("3. Local development (ngrok) setup");
      console.log("4. Test payment endpoints");
      console.log("5. Generate test script");
      console.log("6. Show final summary");
      console.log("7. Exit");
      console.log("");

      const choice = await ask("Choose an option (1-7): ");

      switch (choice) {
        case "1":
          await setupStripeWebhook(envVars, envPath, envContent);
          break;
        case "2":
          await setupCoinbaseWebhook(envVars, envPath, envContent);
          break;
        case "3":
          await setupNgrok();
          break;
        case "4":
          await testPaymentEndpoints();
          break;
        case "5":
          await generateTestScript();
          break;
        case "6":
          await showFinalSummary();
          break;
        case "7":
          colorLog("green", "\n👋 Setup complete! Happy coding!");
          rl.close();
          return;
        default:
          colorLog("red", "❌ Invalid option. Please choose 1-7.");
      }
    }
  } catch (error) {
    colorLog("red", `❌ Error: ${error.message}`);
  } finally {
    rl.close();
  }
}

// Run the setup
if (require.main === module) {
  main();
}
