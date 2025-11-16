# Stripe Payment Integration Setup Guide

This guide will help you set up Stripe payments for your Karima course platform.

## Table of Contents
1. [Create Stripe Account](#create-stripe-account)
2. [Get API Keys](#get-api-keys)
3. [Configure Environment Variables](#configure-environment-variables)
4. [Set Up Webhooks](#set-up-webhooks)
5. [Test Mode vs Live Mode](#test-mode-vs-live-mode)
6. [Testing Payments](#testing-payments)
7. [Going Live](#going-live)

---

## Create Stripe Account

1. Go to [stripe.com](https://stripe.com)
2. Click "Sign up" or "Start now"
3. Create your account with business details
4. Complete the onboarding process

---

## Get API Keys

### For Development (Test Mode)

1. Log in to your Stripe Dashboard
2. Make sure you're in **Test Mode** (toggle in the top right)
3. Go to **Developers** > **API keys**
4. You'll see two keys:
   - **Publishable key** (starts with `pk_test_`)
   - **Secret key** (starts with `sk_test_`) - Click "Reveal test key"

### For Production (Live Mode)

1. Toggle to **Live Mode** in the Stripe Dashboard
2. Go to **Developers** > **API keys**
3. You'll see:
   - **Publishable key** (starts with `pk_live_`)
   - **Secret key** (starts with `sk_live_`)

---

## Configure Environment Variables

Add these to your `.env` file:

```bash
# Stripe Test Keys (for development)
STRIPE_SECRET_KEY="sk_test_your_secret_key_here"
STRIPE_PUBLISHABLE_KEY="pk_test_your_publishable_key_here"

# Stripe Webhook Secret (get this after creating webhook)
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret_here"

# Your app URL (important for redirects)
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## Set Up Webhooks

Webhooks allow Stripe to notify your app about payment events.

### Local Development with Stripe CLI

**1. Install Stripe CLI:**

```bash
# macOS
brew install stripe/stripe-cli/stripe

# Windows (with Scoop)
scoop bucket add stripe https://github.com/stripe/scoop-stripe-cli.git
scoop install stripe

# Linux
# Download from https://github.com/stripe/stripe-cli/releases
```

**2. Login to Stripe CLI:**

```bash
stripe login
```

This will open your browser for authentication.

**3. Forward Webhooks to Local Server:**

```bash
stripe listen --forward-to localhost:3000/api/payments/webhook
```

You'll see output like:
```
> Ready! Your webhook signing secret is whsec_xxxxx
```

**4. Copy the webhook secret** to your `.env` file:

```bash
STRIPE_WEBHOOK_SECRET="whsec_xxxxx"
```

**5. Keep the CLI running** while developing. In a separate terminal, run:

```bash
npm run dev
```

### Production Webhooks

**1. Go to Stripe Dashboard** > **Developers** > **Webhooks**

**2. Click "Add endpoint"**

**3. Enter your webhook URL:**
```
https://yourdomain.com/api/payments/webhook
```

**4. Select events to listen to:**
- `checkout.session.completed`
- `checkout.session.expired`
- `payment_intent.succeeded`
- `payment_intent.payment_failed`

Or select "Receive all events" for simplicity.

**5. Click "Add endpoint"**

**6. Reveal the webhook signing secret** and add it to your production environment variables.

---

## Test Mode vs Live Mode

### Test Mode (Development)
- Use test API keys (pk_test_*, sk_test_*)
- No real money is charged
- Use test card numbers
- Perfect for development and testing

### Live Mode (Production)
- Use live API keys (pk_live_*, sk_live_*)
- Real money is charged
- Real credit cards are used
- Only use when ready for production

---

## Testing Payments

### Test Card Numbers

Stripe provides test card numbers for different scenarios:

#### Successful Payment
```
Card Number: 4242 4242 4242 4242
Expiry: Any future date (e.g., 12/34)
CVC: Any 3 digits (e.g., 123)
ZIP: Any 5 digits (e.g., 12345)
```

#### Payment Requires Authentication
```
Card Number: 4000 0027 6000 3184
```

#### Payment is Declined
```
Card Number: 4000 0000 0000 0002
```

#### Insufficient Funds
```
Card Number: 4000 0000 0000 9995
```

More test cards: https://stripe.com/docs/testing#cards

### Testing the Flow

1. **Start your development server:**
   ```bash
   npm run dev
   ```

2. **In another terminal, run Stripe CLI:**
   ```bash
   stripe listen --forward-to localhost:3000/api/payments/webhook
   ```

3. **Test the purchase flow:**
   - Login as a student
   - Browse to a paid course
   - Click "Buy Now"
   - Use test card: 4242 4242 4242 4242
   - Complete checkout
   - Verify enrollment is created

4. **Check webhook logs** in the Stripe CLI terminal to see events being processed

5. **Monitor Stripe Dashboard** > **Payments** to see test transactions

---

## Going Live

### Pre-launch Checklist

- [ ] Complete Stripe account verification
- [ ] Add business details in Stripe Dashboard
- [ ] Set up bank account for payouts
- [ ] Review and accept Stripe's terms
- [ ] Test the entire payment flow thoroughly
- [ ] Set up production webhooks
- [ ] Update environment variables with live keys
- [ ] Enable HTTPS on your production domain
- [ ] Test with real cards (small amounts)

### Switch to Live Mode

1. **Update environment variables** with live keys:
   ```bash
   STRIPE_SECRET_KEY="sk_live_your_live_secret_key"
   STRIPE_PUBLISHABLE_KEY="pk_live_your_live_publishable_key"
   STRIPE_WEBHOOK_SECRET="whsec_your_live_webhook_secret"
   NEXT_PUBLIC_APP_URL="https://yourdomain.com"
   ```

2. **Deploy to production** with updated environment variables

3. **Test with a real payment** (low amount)

4. **Verify webhook delivery** in Stripe Dashboard > Developers > Webhooks

5. **Monitor** the first few transactions carefully

---

## Webhook Event Handling

Our platform handles these Stripe events:

### checkout.session.completed
- Triggered when a checkout is completed
- Creates enrollment for the user
- Updates payment status to COMPLETED

### checkout.session.expired
- Triggered when checkout expires without payment
- Updates payment status to FAILED

### payment_intent.succeeded
- Triggered when payment is successful
- Logged for tracking

### payment_intent.payment_failed
- Triggered when payment fails
- Updates payment status to FAILED

---

## Troubleshooting

### Webhook Not Receiving Events

**Check:**
1. Stripe CLI is running (for local development)
2. Webhook URL is correct in Stripe Dashboard
3. Webhook secret is correct in `.env`
4. Your server is accessible from the internet (for production)

**Debug:**
```bash
# Check webhook logs in Stripe Dashboard
Developers > Webhooks > [Your Endpoint] > Events

# Check Stripe CLI output
stripe listen --forward-to localhost:3000/api/payments/webhook --print-json
```

### Payment Not Creating Enrollment

**Check:**
1. Webhook is being received (check logs)
2. Metadata is correctly set in checkout session
3. Database connection is working
4. No errors in server logs

**Debug:**
```bash
# Check server logs
npm run dev

# Check webhook event details in Stripe Dashboard
```

### Test Cards Not Working

**Ensure:**
1. You're in Test Mode in Stripe Dashboard
2. Using test API keys in `.env`
3. Using correct test card format
4. CVC and expiry are valid (any future date, any 3 digits)

---

## Security Best Practices

### API Keys
- ✅ Never commit API keys to Git
- ✅ Use environment variables
- ✅ Keep secret keys server-side only
- ✅ Rotate keys if exposed
- ✅ Use different keys for test and live modes

### Webhooks
- ✅ Always verify webhook signatures
- ✅ Use HTTPS in production
- ✅ Implement idempotency
- ✅ Log webhook events
- ✅ Monitor webhook delivery

### Payments
- ✅ Validate amount server-side
- ✅ Check user authentication
- ✅ Verify course ownership
- ✅ Prevent duplicate payments
- ✅ Handle all payment states

---

## Monitoring and Analytics

### Stripe Dashboard

Monitor these metrics:
- **Payments** - All transactions
- **Customers** - User payment history
- **Events** - Webhook deliveries
- **Radar** - Fraud detection (if enabled)

### Application Logs

Log these events:
- Payment created
- Payment completed
- Payment failed
- Enrollment created
- Webhook received
- Errors and exceptions

---

## Support and Resources

### Official Documentation
- [Stripe Docs](https://stripe.com/docs)
- [Stripe API Reference](https://stripe.com/docs/api)
- [Testing Stripe](https://stripe.com/docs/testing)
- [Webhooks Guide](https://stripe.com/docs/webhooks)

### Stripe Support
- [Support Center](https://support.stripe.com)
- [Community Forum](https://discord.gg/stripe)
- Email: support@stripe.com

### Karima Platform
- Check server logs for errors
- Review payment records in database
- Monitor webhook delivery in Stripe Dashboard

---

## Quick Reference

### Test a Payment Locally

```bash
# Terminal 1: Start dev server
npm run dev

# Terminal 2: Forward webhooks
stripe listen --forward-to localhost:3000/api/payments/webhook

# Browser: Navigate to course and checkout
# Use test card: 4242 4242 4242 4242
```

### Check Payment Status

```sql
-- In your database
SELECT * FROM "Payment" ORDER BY "createdAt" DESC LIMIT 10;
```

### View Webhook Events

```bash
# Stripe CLI
stripe events list

# Or in Stripe Dashboard
Developers > Events
```

---

## Congratulations! 🎉

Your Stripe payment integration is now set up. You can:
- Accept payments for courses
- Automatically enroll students
- Track payment history
- Handle refunds and disputes

Remember to thoroughly test in Test Mode before going live!
