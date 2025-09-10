const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const crypto = require("crypto");
const Payment = require("../models/Payment");
const Transaction = require("../models/Transaction");
const Wallet = require("../models/Wallet");

// Stripe webhook handler
router.post(
  "/stripe",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error(
        "Stripe webhook signature verification failed:",
        err.message
      );
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
      switch (event.type) {
        case "payment_intent.succeeded":
          await handleStripePaymentSuccess(event.data.object);
          break;
        case "payment_intent.payment_failed":
          await handleStripePaymentFailure(event.data.object);
          break;
        case "payment_intent.requires_action":
          await handleStripePaymentRequiresAction(event.data.object);
          break;
        default:
          console.log(`Unhandled Stripe event type: ${event.type}`);
      }

      res.json({ received: true });
    } catch (error) {
      console.error("Error handling Stripe webhook:", error);
      res.status(500).json({ error: "Webhook processing failed" });
    }
  }
);

// PayPal webhook handler
router.post("/paypal", express.json(), async (req, res) => {
  try {
    const event = req.body;

    switch (event.event_type) {
      case "PAYMENT.CAPTURE.COMPLETED":
        await handlePayPalPaymentSuccess(event.resource);
        break;
      case "PAYMENT.CAPTURE.DENIED":
        await handlePayPalPaymentFailure(event.resource);
        break;
      default:
        console.log(`Unhandled PayPal event type: ${event.event_type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error("Error handling PayPal webhook:", error);
    res.status(500).json({ error: "Webhook processing failed" });
  }
});

// Coinbase Commerce webhook handler
router.post("/coinbase", express.json(), async (req, res) => {
  const signature = req.headers["x-cc-webhook-signature"];

  try {
    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac("sha256", process.env.COINBASE_WEBHOOK_SECRET)
      .update(JSON.stringify(req.body))
      .digest("hex");

    if (signature !== expectedSignature) {
      return res.status(401).json({ error: "Invalid signature" });
    }

    const event = req.body;

    switch (event.type) {
      case "charge:confirmed":
        await handleCoinbasePaymentSuccess(event.data);
        break;
      case "charge:failed":
        await handleCoinbasePaymentFailure(event.data);
        break;
      case "charge:delayed":
        await handleCoinbasePaymentDelayed(event.data);
        break;
      default:
        console.log(`Unhandled Coinbase event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error("Error handling Coinbase webhook:", error);
    res.status(500).json({ error: "Webhook processing failed" });
  }
});

// Stripe payment success handler
async function handleStripePaymentSuccess(paymentIntent) {
  const payment = await Payment.findOne({
    processorTransactionId: paymentIntent.id,
  });

  if (payment && payment.status !== "completed") {
    await payment.markAsCompleted({
      gatewayTransactionId: paymentIntent.id,
      responseCode: "200",
      responseMessage: "Payment confirmed by Stripe",
      authorizationCode: paymentIntent.charges.data[0]?.id,
    });

    // Update transaction status if needed
    if (payment.transactionId) {
      const transaction = await Transaction.findById(payment.transactionId);
      if (transaction) {
        transaction.status = "confirmed";
        await transaction.save();
      }
    }

    console.log(`Stripe payment ${payment.paymentId} confirmed via webhook`);
  }
}

// Stripe payment failure handler
async function handleStripePaymentFailure(paymentIntent) {
  const payment = await Payment.findOne({
    processorTransactionId: paymentIntent.id,
  });

  if (payment && payment.status !== "failed") {
    await payment.markAsFailed({
      errorCode: paymentIntent.last_payment_error?.code || "PAYMENT_FAILED",
      errorMessage:
        paymentIntent.last_payment_error?.message || "Payment failed",
    });

    console.log(`Stripe payment ${payment.paymentId} failed via webhook`);
  }
}

// Stripe payment requires action handler
async function handleStripePaymentRequiresAction(paymentIntent) {
  const payment = await Payment.findOne({
    processorTransactionId: paymentIntent.id,
  });

  if (payment) {
    payment.status = "requires_action";
    payment.metadata = {
      ...payment.metadata,
      client_secret: paymentIntent.client_secret,
    };
    await payment.save();

    console.log(`Stripe payment ${payment.paymentId} requires action`);
  }
}

// PayPal payment success handler
async function handlePayPalPaymentSuccess(resource) {
  // PayPal order ID is in the resource
  const payment = await Payment.findOne({
    processorTransactionId: resource.supplementary_data?.related_ids?.order_id,
  });

  if (payment && payment.status !== "completed") {
    await payment.markAsCompleted({
      gatewayTransactionId: resource.id,
      responseCode: "200",
      responseMessage: "Payment confirmed by PayPal",
      authorizationCode: resource.id,
    });

    console.log(`PayPal payment ${payment.paymentId} confirmed via webhook`);
  }
}

// PayPal payment failure handler
async function handlePayPalPaymentFailure(resource) {
  const payment = await Payment.findOne({
    processorTransactionId: resource.supplementary_data?.related_ids?.order_id,
  });

  if (payment && payment.status !== "failed") {
    await payment.markAsFailed({
      errorCode: "PAYPAL_PAYMENT_DENIED",
      errorMessage: "Payment denied by PayPal",
    });

    console.log(`PayPal payment ${payment.paymentId} failed via webhook`);
  }
}

// Coinbase payment success handler
async function handleCoinbasePaymentSuccess(charge) {
  const payment = await Payment.findOne({
    processorTransactionId: charge.id,
  });

  if (payment && payment.status !== "completed") {
    await payment.markAsCompleted({
      gatewayTransactionId: charge.id,
      responseCode: "200",
      responseMessage: "Payment confirmed by Coinbase Commerce",
      authorizationCode: charge.timeline.find((t) => t.status === "CONFIRMED")
        ?.payment?.transaction_id,
    });

    console.log(`Coinbase payment ${payment.paymentId} confirmed via webhook`);
  }
}

// Coinbase payment failure handler
async function handleCoinbasePaymentFailure(charge) {
  const payment = await Payment.findOne({
    processorTransactionId: charge.id,
  });

  if (payment && payment.status !== "failed") {
    await payment.markAsFailed({
      errorCode: "CRYPTO_PAYMENT_FAILED",
      errorMessage: "Cryptocurrency payment failed",
    });

    console.log(`Coinbase payment ${payment.paymentId} failed via webhook`);
  }
}

// Coinbase payment delayed handler
async function handleCoinbasePaymentDelayed(charge) {
  const payment = await Payment.findOne({
    processorTransactionId: charge.id,
  });

  if (payment) {
    payment.status = "delayed";
    await payment.save();

    console.log(`Coinbase payment ${payment.paymentId} delayed via webhook`);
  }
}

module.exports = router;
