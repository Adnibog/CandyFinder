# Email Verification Setup Guide

## Overview

CandyFinder supports email verification for new user registrations. The app works in two modes:

1. **Demo Mode** (No setup required)
   - Verification codes appear in browser console
   - Perfect for development and testing
   - No email service needed

2. **Production Mode** (Recommended for live deployment)
   - Real emails sent to users
   - Professional experience
   - Uses Resend email service

## Quick Start (Demo Mode)

No setup needed! Just run the app and:

1. Sign up with any email
2. Open browser console (F12)
3. Look for the 6-digit verification code
4. Enter it in the verification modal

## Production Setup (Real Emails)

### Step 1: Get Resend API Key

1. Go to [Resend.com](https://resend.com)
2. Sign up for a free account (100 emails/day free tier)
3. Navigate to "API Keys" section
4. Create a new API key
5. Copy the API key (starts with `re_`)

### Step 2: Configure Environment Variables

1. Copy the example env file:
   ```bash
   cp .env.local.example .env.local
   ```

2. Add your Resend API key to `.env.local`:
   ```bash
   RESEND_API_KEY=re_your_actual_api_key_here
   ```

### Step 3: Configure Domain (Optional but Recommended)

For production, you'll want to verify your sending domain with Resend:

1. In Resend dashboard, go to "Domains"
2. Add your domain (e.g., candyfinder.app)
3. Add the DNS records Resend provides
4. Wait for verification (usually a few minutes)
5. Update the "from" address in `/app/api/send-verification/route.ts`:
   ```typescript
   from: 'CandyFinder <noreply@yourdomain.com>',
   ```

### Step 4: Restart Development Server

```bash
npm run dev
```

Now when users sign up, they'll receive a beautiful email with their verification code!

## Email Template Features

The verification email includes:

- 🍬 Branded CandyFinder design
- Halloween-themed gradient header
- Large, easy-to-read 6-digit code
- Security warning
- Mobile-responsive layout
- Professional styling

## Testing Email Delivery

1. Sign up with your real email address
2. Check your inbox (and spam folder)
3. You should receive an email from CandyFinder
4. Enter the 6-digit code to verify

## Troubleshooting

### Emails not sending

1. **Check API key**: Ensure `RESEND_API_KEY` is set in `.env.local`
2. **Restart server**: Stop and restart `npm run dev`
3. **Check console**: Look for error messages
4. **Verify Resend account**: Ensure you're within free tier limits

### Emails going to spam

1. Verify your domain with Resend (see Step 3 above)
2. Add SPF and DKIM records
3. Use a professional "from" address
4. Avoid spam trigger words in content

### Demo mode vs Production mode

The app automatically detects which mode to use:

- **No `RESEND_API_KEY`**: Demo mode (console logging)
- **`RESEND_API_KEY` set**: Production mode (real emails)

## API Reference

### POST `/api/send-verification`

Send a verification email to a user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "code": "123456",
  "name": "John Doe"
}
```

**Response (Success):**
```json
{
  "success": true,
  "data": { /* Resend response */ }
}
```

**Response (Demo Mode):**
```json
{
  "success": true,
  "demo": true,
  "message": "Check console for verification code (demo mode)"
}
```

## Cost & Limits

### Resend Free Tier

- 100 emails per day
- 3,000 emails per month
- Perfect for hackathons and small apps

### Resend Paid Plans

- Start at $20/month for 50,000 emails
- See [Resend pricing](https://resend.com/pricing)

## Security Notes

1. **Never commit** `.env.local` to git (it's in `.gitignore`)
2. **Rotate API keys** if they're ever exposed
3. **Use environment variables** for all sensitive data
4. **Codes expire** after 15 minutes (configurable)
5. **One-time use**: Codes are deleted after verification

## Alternative Email Services

While we recommend Resend, you can also use:

- **SendGrid**: More features, higher free tier (100/day)
- **Mailgun**: Good for transactional emails
- **AWS SES**: Very cheap for high volume
- **Postmark**: Fast delivery, great support

To switch providers, update `/app/api/send-verification/route.ts` with your chosen service's SDK.

## Support

If you need help:

1. Check the [Resend Documentation](https://resend.com/docs)
2. Review error messages in browser console
3. Check server logs for API errors
4. Test with demo mode first to isolate issues

---

Happy candy hunting! 🍬🎃
