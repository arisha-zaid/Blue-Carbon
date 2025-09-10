# Real Payment Integration Setup Guide

## Overview

This guide walks you through setting up real payment processors for the Blue Carbon platform.

## 1. Stripe Setup (Credit Cards)

### Create Stripe Account

1. Go to https://stripe.com and create an account
2. Complete business verification
3. Navigate to Developers → API Keys

### Get API Keys

```bash
# Test Keys (for development)
STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...

# Live Keys (for production)
STRIPE_PUBLIC_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
```

### Set up Webhooks

1. Go to Developers → Webhooks
2. Add endpoint: `https://yourdomain.com/api/webhooks/stripe`
3. Select events:
   - payment_intent.succeeded
   - payment_intent.payment_failed
   - payment_intent.requires_action
4. Copy webhook signing secret: `whsec_...`

## 2. PayPal Setup

### Create PayPal Developer Account

1. Go to https://developer.paypal.com
2. Create an application
3. Get Client ID and Secret

### Configuration

```bash
# Sandbox (development)
PAYPAL_CLIENT_ID=your_sandbox_client_id
PAYPAL_CLIENT_SECRET=your_sandbox_secret
PAYPAL_MODE=sandbox

# Live (production)
PAYPAL_CLIENT_ID=your_live_client_id
PAYPAL_CLIENT_SECRET=your_live_secret
PAYPAL_MODE=live
```

### Webhooks

1. Set webhook URL: `https://yourdomain.com/api/webhooks/paypal`
2. Subscribe to events:
   - PAYMENT.CAPTURE.COMPLETED
   - PAYMENT.CAPTURE.DENIED

## 3. Coinbase Commerce (Cryptocurrency)

### Create Coinbase Commerce Account

1. Go to https://commerce.coinbase.com
2. Create account and get API key
3. Generate webhook shared secret

### Configuration

```bash
COINBASE_API_KEY=your_api_key
COINBASE_WEBHOOK_SECRET=your_webhook_secret
```

### Webhook Setup

1. Set webhook URL: `https://yourdomain.com/api/webhooks/coinbase`
2. Events are automatically configured

## 4. Plaid (Bank Transfers/ACH)

### Create Plaid Account

1. Go to https://plaid.com
2. Get development keys
3. Apply for production access when ready

### Configuration

```bash
# Development
PLAID_CLIENT_ID=your_client_id
PLAID_SECRET=your_sandbox_secret
PLAID_ENV=sandbox

# Production
PLAID_CLIENT_ID=your_client_id
PLAID_SECRET=your_production_secret
PLAID_ENV=production
```

## 5. Environment Variable Setup

Update your `.env` file:

```bash
# Payment Processor Configuration
# Stripe (Credit Cards)
STRIPE_PUBLIC_KEY=pk_test_your_stripe_public_key
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# PayPal (Alternative payment method)
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_MODE=sandbox

# Coinbase Commerce (Crypto payments)
COINBASE_API_KEY=your_coinbase_api_key
COINBASE_WEBHOOK_SECRET=your_coinbase_webhook_secret

# ACH/Bank Transfer (Plaid)
PLAID_CLIENT_ID=your_plaid_client_id
PLAID_SECRET=your_plaid_secret
PLAID_ENV=sandbox
```

## 6. SSL Certificate Requirement

⚠️ **Important**: All payment processors require HTTPS in production.

### For Development

- Use ngrok or similar tunneling service
- Or deploy to a staging environment with SSL

### For Production

- Set up proper SSL certificate
- Use services like Let's Encrypt, Cloudflare, or AWS Certificate Manager

## 7. Testing

### Test Credit Cards (Stripe)

```bash
# Successful payment
Card: 4242 4242 4242 4242
Expiry: Any future date
CVC: Any 3 digits

# Declined payment
Card: 4000 0000 0000 0002
```

### Test PayPal

- Use PayPal sandbox accounts
- Create test buyer and seller accounts

### Test Crypto (Coinbase)

- Use testnet addresses
- Send small amounts for testing

## 8. Security Considerations

### API Key Security

- Never commit real API keys to version control
- Use environment variables or secure secret management
- Rotate keys regularly

### Webhook Security

- Always verify webhook signatures
- Use HTTPS endpoints only
- Implement idempotency to handle duplicate webhooks

### PCI Compliance

- Never store sensitive card data
- Use tokenization for saved payment methods
- Implement proper access controls

## 9. Monitoring and Logging

### Set up monitoring for:

- Payment success/failure rates
- Processing times
- Failed webhook deliveries
- Fraud patterns

### Log important events:

- Payment attempts
- Webhook receipts
- Error conditions
- Security events

## 10. Go Live Checklist

### Before Production:

- [ ] Complete business verification with all processors
- [ ] Set up production webhook endpoints
- [ ] Update environment variables to production keys
- [ ] Implement proper error handling and monitoring
- [ ] Test with real (small) amounts
- [ ] Set up customer support processes
- [ ] Implement refund/dispute handling
- [ ] Review and test security measures
- [ ] Set up automated reconciliation
- [ ] Document incident response procedures

### After Go Live:

- [ ] Monitor dashboard metrics daily
- [ ] Set up alerting for issues
- [ ] Review transaction reports regularly
- [ ] Handle customer payment issues promptly
- [ ] Keep backup payment methods available
