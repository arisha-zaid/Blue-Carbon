# Webhook Setup Guide for Payment Processors

## The Problem

You're confusing **webhook URLs** with **webhook secrets**:

- **Webhook URL**: Where the payment processor sends notifications (e.g., `https://yourdomain.com/api/webhooks/stripe`)
- **Webhook Secret**: A secret key to verify the webhook is authentic (e.g., `whsec_1234567890abcdef`)

## Current Status of Your Configuration

✅ **Stripe**: API keys are configured correctly  
❌ **Stripe Webhook Secret**: Needs the actual secret from Stripe dashboard  
✅ **PayPal**: API keys are configured correctly  
✅ **Coinbase**: API key is configured  
❌ **Coinbase Webhook Secret**: Needs the actual secret from Coinbase dashboard

## Step-by-Step Webhook Configuration

### 1. Stripe Webhooks

#### Get Webhook Secret:

1. Go to https://dashboard.stripe.com/test/webhooks
2. Click "Add endpoint"
3. Endpoint URL: `https://yourdomain.com/api/webhooks/stripe`
4. Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`
5. Click "Add endpoint"
6. Click on the created webhook
7. Copy the "Signing secret" (starts with `whsec_`)

#### Update .env:

```bash
STRIPE_WEBHOOK_SECRET=whsec_1234567890abcdef... # Replace with actual secret
```

### 2. PayPal Webhooks

#### Get Webhook URL configured:

1. Go to https://developer.paypal.com/developer/applications
2. Click on your application
3. Scroll to "SANDBOX WEBHOOKS" (or LIVE for production)
4. Add webhook URL: `https://yourdomain.com/api/webhooks/paypal`
5. Select events: `PAYMENT.CAPTURE.COMPLETED`, `PAYMENT.CAPTURE.DENIED`

PayPal doesn't use webhook secrets like Stripe/Coinbase - it uses certificate validation.

### 3. Coinbase Commerce Webhooks

#### Get Webhook Secret:

1. Go to https://commerce.coinbase.com/settings
2. Click "Webhook subscriptions"
3. Add endpoint: `https://yourdomain.com/api/webhooks/coinbase`
4. Select events: `charge:confirmed`, `charge:failed`, `charge:delayed`
5. Copy the "Signing secret"

#### Update .env:

```bash
COINBASE_WEBHOOK_SECRET=whsec_1234567890abcdef... # Replace with actual secret
```

## For Local Development

Since webhooks require HTTPS, use ngrok for local testing:

```bash
# Install ngrok
npm install -g ngrok

# Start your backend
npm run dev

# In another terminal, expose your local server
ngrok http 5000

# Use the HTTPS URL provided by ngrok in your webhook configurations
# Example: https://abc123.ngrok.io/api/webhooks/stripe
```

## Testing Your Webhooks

Use the webhook test endpoints:

```bash
# Test Stripe webhook
curl -X POST https://your-domain.com/api/webhooks/stripe \
  -H "Content-Type: application/json" \
  -d '{"test": true}'

# Test PayPal webhook
curl -X POST https://your-domain.com/api/webhooks/paypal \
  -H "Content-Type: application/json" \
  -d '{"test": true}'

# Test Coinbase webhook
curl -X POST https://your-domain.com/api/webhooks/coinbase \
  -H "Content-Type: application/json" \
  -d '{"test": true}'
```

## Production Checklist

Before going live:

- [ ] Replace all test API keys with live keys
- [ ] Update webhook URLs to use your production domain
- [ ] Enable HTTPS on your production server
- [ ] Test webhooks with real (small) payments
- [ ] Set up monitoring for webhook delivery failures
- [ ] Implement retry logic for failed webhook processing

## Troubleshooting

### Webhook not received:

1. Check if URL is publicly accessible
2. Verify HTTPS is working
3. Check firewall settings
4. Look at payment processor logs

### Signature verification failed:

1. Ensure you have the correct webhook secret
2. Check for extra spaces in the secret
3. Verify the secret format (should start with `whsec_`)

### PayPal webhooks not working:

1. Ensure sandbox mode matches your API credentials
2. Check that webhook events are properly selected
3. Verify the webhook URL is correctly configured in PayPal dashboard

Need help? Check the server logs when processing webhooks for detailed error messages.
