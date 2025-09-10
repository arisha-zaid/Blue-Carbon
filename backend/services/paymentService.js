const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const paypal = require("@paypal/checkout-server-sdk");
const { Client } = require("coinbase-commerce-node");
const { PlaidApi, Configuration, PlaidEnvironments } = require("plaid");

// Initialize payment clients
Client.init(process.env.COINBASE_API_KEY);

// PayPal environment setup
const payPalEnvironment =
  process.env.PAYPAL_MODE === "production"
    ? new paypal.core.LiveEnvironment(
        process.env.PAYPAL_CLIENT_ID,
        process.env.PAYPAL_CLIENT_SECRET
      )
    : new paypal.core.SandboxEnvironment(
        process.env.PAYPAL_CLIENT_ID,
        process.env.PAYPAL_CLIENT_SECRET
      );
const payPalClient = new paypal.core.PayPalHttpClient(payPalEnvironment);

// Plaid configuration
const plaidConfig = new Configuration({
  basePath: PlaidEnvironments[process.env.PLAID_ENV],
  baseOptions: {
    headers: {
      "PLAID-CLIENT-ID": process.env.PLAID_CLIENT_ID,
      "PLAID-SECRET": process.env.PLAID_SECRET,
    },
  },
});
const plaidClient = new PlaidApi(plaidConfig);

class PaymentService {
  /**
   * Process credit card payment via Stripe
   */
  async processStripePayment({ amount, paymentDetails, metadata = {} }) {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Stripe expects cents
        currency: "usd",
        payment_method_types: ["card"],
        payment_method_data: {
          type: "card",
          card: {
            number: paymentDetails.cardNumber,
            exp_month: paymentDetails.expiryDate.split("/")[0],
            exp_year: paymentDetails.expiryDate.split("/")[1],
            cvc: paymentDetails.cvv,
          },
          billing_details: {
            name: paymentDetails.cardholderName,
            address: paymentDetails.billingAddress
              ? {
                  line1: paymentDetails.billingAddress.street,
                  city: paymentDetails.billingAddress.city,
                  state: paymentDetails.billingAddress.state,
                  postal_code: paymentDetails.billingAddress.zipCode,
                  country: paymentDetails.billingAddress.country || "US",
                }
              : undefined,
          },
        },
        confirm: true,
        metadata: {
          ...metadata,
          processor: "stripe",
        },
      });

      return {
        success: true,
        transactionId: paymentIntent.id,
        status: paymentIntent.status,
        processorResponse: paymentIntent,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        errorCode: error.code,
        processorResponse: error,
      };
    }
  }

  /**
   * Process PayPal payment
   */
  async processPayPalPayment({ amount, paymentDetails, metadata = {} }) {
    try {
      const request = new paypal.orders.OrdersCreateRequest();
      request.prefer("return=representation");
      request.requestBody({
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: "USD",
              value: amount.toFixed(2),
            },
            description: "Carbon Credits Purchase",
          },
        ],
        payer: {
          email_address: paymentDetails.email,
          name: {
            given_name: paymentDetails.firstName,
            surname: paymentDetails.lastName,
          },
        },
        application_context: {
          return_url: `${process.env.FRONTEND_URL}/payment/success`,
          cancel_url: `${process.env.FRONTEND_URL}/payment/cancel`,
        },
      });

      const order = await payPalClient.execute(request);

      return {
        success: true,
        transactionId: order.result.id,
        status: order.result.status,
        approvalUrl: order.result.links.find((link) => link.rel === "approve")
          ?.href,
        processorResponse: order.result,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        processorResponse: error,
      };
    }
  }

  /**
   * Process cryptocurrency payment via Coinbase Commerce
   */
  async processCryptoPayment({ amount, paymentDetails, metadata = {} }) {
    try {
      const { Charge } = require("coinbase-commerce-node");

      const chargeData = {
        name: "Carbon Credits Purchase",
        description: `Purchase of carbon credits - ${metadata.carbonAmount} tCO₂`,
        local_price: {
          amount: amount.toFixed(2),
          currency: "USD",
        },
        pricing_type: "fixed_price",
        requested_info: ["name", "email"],
        metadata: {
          ...metadata,
          processor: "coinbase",
          customer_wallet: paymentDetails.walletAddress,
        },
      };

      const charge = await Charge.create(chargeData);

      return {
        success: true,
        transactionId: charge.id,
        status: charge.timeline[0].status,
        paymentUrl: charge.hosted_url,
        processorResponse: charge,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        processorResponse: error,
      };
    }
  }

  /**
   * Process ACH bank transfer via Plaid
   */
  async processACHPayment({ amount, paymentDetails, metadata = {} }) {
    try {
      // This is a simplified version - in production you'd need to:
      // 1. Link the bank account via Plaid Link
      // 2. Verify micro-deposits
      // 3. Create ACH transfer

      const request = {
        access_token: paymentDetails.plaidAccessToken,
        account_id: paymentDetails.accountId,
        amount: {
          value: amount,
          currency: "USD",
        },
        description: "Carbon Credits Purchase",
      };

      // This would be replaced with actual ACH transfer API call
      // For now, we'll simulate the process

      return {
        success: true,
        transactionId: `ACH_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}`,
        status: "pending",
        estimatedCompletionDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
        processorResponse: { simulated: true, request },
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        processorResponse: error,
      };
    }
  }

  /**
   * Verify payment status across different processors
   */
  async verifyPayment(transactionId, processor) {
    try {
      switch (processor) {
        case "stripe":
          const paymentIntent = await stripe.paymentIntents.retrieve(
            transactionId
          );
          return {
            success: true,
            status: paymentIntent.status,
            amount: paymentIntent.amount / 100,
            processorResponse: paymentIntent,
          };

        case "paypal":
          const request = new paypal.orders.OrdersGetRequest(transactionId);
          const order = await payPalClient.execute(request);
          return {
            success: true,
            status: order.result.status,
            amount: parseFloat(order.result.purchase_units[0].amount.value),
            processorResponse: order.result,
          };

        case "coinbase":
          const { Charge } = require("coinbase-commerce-node");
          const charge = await Charge.retrieve(transactionId);
          return {
            success: true,
            status: charge.timeline[charge.timeline.length - 1].status,
            amount: parseFloat(charge.local_price.amount),
            processorResponse: charge,
          };

        default:
          throw new Error(`Unsupported processor: ${processor}`);
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        processorResponse: error,
      };
    }
  }

  /**
   * Main payment processing method
   */
  async processPayment({
    paymentMethod,
    amount,
    paymentDetails,
    metadata = {},
  }) {
    let result;

    switch (paymentMethod) {
      case "credit_card":
        result = await this.processStripePayment({
          amount,
          paymentDetails,
          metadata,
        });
        break;

      case "paypal":
        result = await this.processPayPalPayment({
          amount,
          paymentDetails,
          metadata,
        });
        break;

      case "crypto":
        result = await this.processCryptoPayment({
          amount,
          paymentDetails,
          metadata,
        });
        break;

      case "bank_transfer":
        result = await this.processACHPayment({
          amount,
          paymentDetails,
          metadata,
        });
        break;

      default:
        result = {
          success: false,
          error: `Unsupported payment method: ${paymentMethod}`,
        };
    }

    return {
      ...result,
      processor: this.getProcessorName(paymentMethod),
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get processor name for payment method
   */
  getProcessorName(paymentMethod) {
    const processorMap = {
      credit_card: "stripe",
      paypal: "paypal",
      crypto: "coinbase",
      bank_transfer: "plaid",
    };
    return processorMap[paymentMethod] || "unknown";
  }
}

module.exports = new PaymentService();
