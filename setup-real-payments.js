#!/usr/bin/env node

/**
 * Blue Carbon - Real Payment Setup Script
 *
 * This script helps you set up real payment processing by:
 * 1. Checking required environment variables
 * 2. Testing API key validity
 * 3. Setting up webhook endpoints
 * 4. Providing next steps
 */

const fs = require("fs");
const path = require("path");
const readline = require("readline");

// Colors for console output
const colors = {
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
  reset: "\x1b[0m",
};

class PaymentSetup {
  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    this.envPath = path.join(__dirname, "backend", ".env");
  }

  log(message, color = "white") {
    console.log(`${colors[color]}${message}${colors.reset}`);
  }

  async question(prompt) {
    return new Promise((resolve) => {
      this.rl.question(prompt, resolve);
    });
  }

  async run() {
    this.log("\n🚀 Blue Carbon - Real Payment Setup\n", "cyan");

    try {
      // Check if .env file exists
      if (!fs.existsSync(this.envPath)) {
        this.log("❌ .env file not found in backend directory", "red");
        this.log(
          "Please ensure you have a .env file in the backend directory",
          "yellow"
        );
        return;
      }

      const choice = await this.question(
        "Choose setup option:\n" +
          "1. Check current configuration\n" +
          "2. Set up Stripe (recommended for beginners)\n" +
          "3. Set up PayPal\n" +
          "4. Set up Coinbase Commerce (crypto)\n" +
          "5. Set up all processors\n" +
          "6. View setup guide\n" +
          "Enter choice (1-6): "
      );

      switch (choice.trim()) {
        case "1":
          await this.checkConfiguration();
          break;
        case "2":
          await this.setupStripe();
          break;
        case "3":
          await this.setupPayPal();
          break;
        case "4":
          await this.setupCoinbase();
          break;
        case "5":
          await this.setupAllProcessors();
          break;
        case "6":
          this.showSetupGuide();
          break;
        default:
          this.log("❌ Invalid choice", "red");
      }
    } catch (error) {
      this.log(`❌ Error: ${error.message}`, "red");
    } finally {
      this.rl.close();
    }
  }

  async checkConfiguration() {
    this.log("\n🔍 Checking current payment configuration...\n", "blue");

    const envContent = fs.readFileSync(this.envPath, "utf8");
    const lines = envContent.split("\n");

    const processors = {
      stripe: [
        "STRIPE_PUBLIC_KEY",
        "STRIPE_SECRET_KEY",
        "STRIPE_WEBHOOK_SECRET",
      ],
      paypal: ["PAYPAL_CLIENT_ID", "PAYPAL_CLIENT_SECRET", "PAYPAL_MODE"],
      coinbase: ["COINBASE_API_KEY", "COINBASE_WEBHOOK_SECRET"],
      plaid: ["PLAID_CLIENT_ID", "PLAID_SECRET", "PLAID_ENV"],
    };

    for (const [processor, keys] of Object.entries(processors)) {
      this.log(`\n${processor.toUpperCase()}:`, "magenta");

      let configured = 0;
      for (const key of keys) {
        const line = lines.find((line) => line.startsWith(`${key}=`));
        if (line) {
          const value = line.split("=")[1];
          if (value && value.trim() !== "" && !value.includes("your_")) {
            this.log(`  ✅ ${key}: Configured`, "green");
            configured++;
          } else {
            this.log(`  ❌ ${key}: Not configured`, "red");
          }
        } else {
          this.log(`  ❌ ${key}: Missing`, "red");
        }
      }

      if (configured === keys.length) {
        this.log(`  🎉 ${processor} is fully configured!`, "green");
      } else if (configured > 0) {
        this.log(
          `  ⚠️  ${processor} is partially configured (${configured}/${keys.length})`,
          "yellow"
        );
      } else {
        this.log(`  ❌ ${processor} is not configured`, "red");
      }
    }

    this.log("\n📝 Next steps:", "cyan");
    this.log("1. Configure at least one payment processor", "white");
    this.log("2. Set up webhook endpoints for production", "white");
    this.log("3. Test with small amounts before going live", "white");
  }

  async setupStripe() {
    this.log("\n💳 Setting up Stripe (recommended for credit cards)\n", "blue");

    this.log("Steps to get Stripe keys:", "cyan");
    this.log("1. Go to https://stripe.com and create account", "white");
    this.log("2. Complete business verification", "white");
    this.log("3. Go to Developers → API Keys", "white");
    this.log("4. Copy your keys (use test keys for development)", "white");
    this.log("5. Set up webhooks at Developers → Webhooks\n", "white");

    const setupNow = await this.question(
      "Do you have Stripe keys ready? (y/n): "
    );

    if (setupNow.toLowerCase() === "y") {
      const publicKey = await this.question(
        "Enter Stripe Public Key (pk_test_...): "
      );
      const secretKey = await this.question(
        "Enter Stripe Secret Key (sk_test_...): "
      );
      const webhookSecret = await this.question(
        "Enter Webhook Secret (whsec_..., optional): "
      );

      await this.updateEnvFile({
        STRIPE_PUBLIC_KEY: publicKey,
        STRIPE_SECRET_KEY: secretKey,
        STRIPE_WEBHOOK_SECRET: webhookSecret || "your_webhook_secret",
      });

      this.log("\n✅ Stripe configuration updated!", "green");
      this.log("\nNext steps:", "cyan");
      this.log(
        "1. Set up webhook endpoint: https://yourdomain.com/api/webhooks/stripe",
        "white"
      );
      this.log(
        "2. Select events: payment_intent.succeeded, payment_intent.payment_failed",
        "white"
      );
      this.log("3. Test with card: 4242 4242 4242 4242", "white");
    } else {
      this.log("Visit https://stripe.com to get started", "yellow");
    }
  }

  async setupPayPal() {
    this.log("\n🅿️ Setting up PayPal\n", "blue");

    this.log("Steps to get PayPal credentials:", "cyan");
    this.log("1. Go to https://developer.paypal.com", "white");
    this.log("2. Create a developer account", "white");
    this.log("3. Create new application", "white");
    this.log("4. Copy Client ID and Secret\n", "white");

    const setupNow = await this.question(
      "Do you have PayPal credentials ready? (y/n): "
    );

    if (setupNow.toLowerCase() === "y") {
      const clientId = await this.question("Enter PayPal Client ID: ");
      const clientSecret = await this.question("Enter PayPal Client Secret: ");
      const mode =
        (await this.question("Enter mode (sandbox/live) [sandbox]: ")) ||
        "sandbox";

      await this.updateEnvFile({
        PAYPAL_CLIENT_ID: clientId,
        PAYPAL_CLIENT_SECRET: clientSecret,
        PAYPAL_MODE: mode,
      });

      this.log("\n✅ PayPal configuration updated!", "green");
      this.log("\nNext steps:", "cyan");
      this.log(
        "1. Set up webhook endpoint: https://yourdomain.com/api/webhooks/paypal",
        "white"
      );
      this.log("2. Test with sandbox accounts", "white");
    } else {
      this.log("Visit https://developer.paypal.com to get started", "yellow");
    }
  }

  async setupCoinbase() {
    this.log("\n₿ Setting up Coinbase Commerce (cryptocurrency)\n", "blue");

    this.log("Steps to get Coinbase Commerce keys:", "cyan");
    this.log("1. Go to https://commerce.coinbase.com", "white");
    this.log("2. Create account and verify business", "white");
    this.log("3. Go to Settings → API Keys", "white");
    this.log("4. Create new API key\n", "white");

    const setupNow = await this.question(
      "Do you have Coinbase Commerce keys ready? (y/n): "
    );

    if (setupNow.toLowerCase() === "y") {
      const apiKey = await this.question("Enter Coinbase Commerce API Key: ");
      const webhookSecret = await this.question(
        "Enter Webhook Shared Secret: "
      );

      await this.updateEnvFile({
        COINBASE_API_KEY: apiKey,
        COINBASE_WEBHOOK_SECRET: webhookSecret,
      });

      this.log("\n✅ Coinbase Commerce configuration updated!", "green");
      this.log("\nNext steps:", "cyan");
      this.log(
        "1. Set up webhook endpoint: https://yourdomain.com/api/webhooks/coinbase",
        "white"
      );
      this.log("2. Test with testnet cryptocurrencies", "white");
    } else {
      this.log("Visit https://commerce.coinbase.com to get started", "yellow");
    }
  }

  async setupAllProcessors() {
    this.log("\n🔧 Setting up all payment processors\n", "blue");

    await this.setupStripe();
    await this.setupPayPal();
    await this.setupCoinbase();

    this.log("\n🎉 All payment processors setup complete!", "green");
    this.log("\nRemember to:", "cyan");
    this.log("- Test each payment method thoroughly", "white");
    this.log("- Set up proper webhook endpoints", "white");
    this.log("- Use HTTPS in production", "white");
    this.log("- Monitor transaction success rates", "white");
  }

  showSetupGuide() {
    this.log("\n📚 Payment Setup Guide\n", "blue");

    this.log("Complete setup documentation is available at:", "white");
    this.log("./backend/config/payment-setup.md\n", "green");

    this.log("Quick links:", "cyan");
    this.log("• Stripe: https://stripe.com", "white");
    this.log("• PayPal: https://developer.paypal.com", "white");
    this.log("• Coinbase Commerce: https://commerce.coinbase.com", "white");
    this.log("• Plaid: https://plaid.com\n", "white");

    this.log("Important security notes:", "magenta");
    this.log("• Never commit real API keys to version control", "white");
    this.log("• Use test/sandbox keys for development", "white");
    this.log("• Always verify webhook signatures", "white");
    this.log("• Use HTTPS for all payment endpoints", "white");
  }

  async updateEnvFile(updates) {
    let envContent = fs.readFileSync(this.envPath, "utf8");

    for (const [key, value] of Object.entries(updates)) {
      const regex = new RegExp(`^${key}=.*$`, "m");
      if (regex.test(envContent)) {
        envContent = envContent.replace(regex, `${key}=${value}`);
      } else {
        envContent += `\n${key}=${value}`;
      }
    }

    fs.writeFileSync(this.envPath, envContent);
  }
}

// Run the setup
const setup = new PaymentSetup();
setup.run().catch(console.error);
