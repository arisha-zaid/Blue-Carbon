# Coinbase Commerce Webhook Setup Guide

## The Issue

You're trying to put a URL (`http://localhost:5000/coinbase/webhook`) in the `COINBASE_WEBHOOK_SECRET` field, but this field expects a **secret key**, not a URL.

## How to Get the Correct Webhook Secret

### Step 1: Log into Coinbase Commerce

1. Go to https://commerce.coinbase.com
2. Log into your account

### Step 2: Navigate to Webhook Settings

1. Click on **"Settings"** in the sidebar
2. Click on **"Webhook subscriptions"**
3. If you don't have a webhook set up, click **"Add an endpoint"**

### Step 3: Configure Your Webhook

1. **Endpoint URL**: Enter `https://yourdomain.com/api/webhooks/coinbase`

   - For local development with ngrok: `https://your-ngrok-url.ngrok.io/api/webhooks/coinbase`
   - For localhost testing, you'll need to use a tunneling service like ngrok

2. **Events to subscribe to**: Select:

   - `charge:confirmed`
   - `charge:failed`
   - `charge:delayed`

3. Click **"Add endpoint"**

### Step 4: Get the Webhook Secret

1. After creating the webhook endpoint, you'll see it in your webhook list
2. Click on the webhook endpoint you just created
3. You'll see a **"Signing secret"** - this is what you need!
4. It looks something like: `whsec_1234567890abcdef...`

### Step 5: Update Your .env File

```bash
# Replace 'your_coinbase_webhook_secret' with the actual signing secret
COINBASE_WEBHOOK_SECRET=whsec_1234567890abcdef1234567890abcdef12345678
```

## For Local Development

Since Coinbase webhooks require HTTPS, for local development you need to:

### Option 1: Use ngrok (Recommended)

1. Install ngrok: `npm install -g ngrok`
2. Start your backend server: `npm run dev`
3. In another terminal: `ngrok http 5000`
4. Use the HTTPS URL provided by ngrok in your Coinbase webhook settings

### Option 2: Use localtunnel

1. Install: `npm install -g localtunnel`
2. Run: `lt --port 5000`
3. Use the provided URL in Coinbase settings

## Testing Your Setup

After configuring:

1. Create a test charge in Coinbase Commerce
2. Complete the payment (you can use testnet crypto)
3. Check your server logs for webhook receipts
4. Verify the webhook signature is validating correctly

## Common Issues

### "Invalid webhook secret" error:

- Make sure you copied the complete secret including `whsec_` prefix
- Ensure no extra spaces or characters

### Webhooks not received:

- Check if your endpoint URL is accessible from the internet
- Verify HTTPS is working (required for webhooks)
- Check firewall settings

### Signature verification fails:

- Ensure you're using the correct secret
- Check that the webhook URL matches exactly what you configured

## Example Valid Configuration

```bash
# ✅ Correct format
COINBASE_API_KEY=12345678-1234-1234-1234-123456789012
COINBASE_WEBHOOK_SECRET=whsec_1234567890abcdef1234567890abcdef12345678

# ❌ Wrong - this is a URL, not a secret
COINBASE_WEBHOOK_SECRET=http://localhost:5000/coinbase/webhook

# ❌ Wrong - missing whsec_ prefix
COINBASE_WEBHOOK_SECRET=1234567890abcdef1234567890abcdef12345678
```

## Need Help?

If you're still having issues:

1. Double-check the secret format in Coinbase dashboard
2. Try creating a new webhook endpoint
3. Test with a simple webhook testing tool like webhook.site first
