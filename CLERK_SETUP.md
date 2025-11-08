# 🔐 Clerk Authentication Setup Guide

This guide will help you set up Clerk authentication for CandyFinder.

## 📋 What is Clerk?

Clerk is a complete authentication and user management solution that provides:
- ✅ Email verification (automatic)
- ✅ Social logins (Google, GitHub, etc.)
- ✅ Two-factor authentication (2FA)
- ✅ Magic links (passwordless)
- ✅ User profile management
- ✅ Session management with JWT tokens
- ✅ Production-ready security

## 🚀 Step-by-Step Setup

### Step 1: Create a Clerk Account

1. Go to [https://clerk.com](https://clerk.com)
2. Click "Sign Up" and create an account
3. You'll get **10,000 free monthly active users** - perfect for this project!

### Step 2: Create Your Application

1. After signing in, click "Add Application"
2. **Application Name**: `CandyFinder` (or your preferred name)
3. **Sign-in options**: Select at least:
   - ✅ Email address
   - ✅ (Optional) Google
   - ✅ (Optional) GitHub
4. Click "Create Application"

### Step 3: Get Your API Keys

After creating your application, you'll see your API keys:

1. Copy the **Publishable Key** (starts with `pk_test_...`)
2. Copy the **Secret Key** (starts with `sk_test_...`)

### Step 4: Configure Email Verification

1. Go to **Settings** → **Email, Phone, Username**
2. Make sure **Email address** is enabled
3. Enable **Verify email address**
4. Choose verification method:
   - **Email verification code** (recommended) - 6-digit code sent to email
   - **Email verification link** - Click link in email

### Step 5: Add Keys to Your Project

1. Open `/home/gobinda/Hackathon/CandyFinder/.env.local`
2. Add these keys:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_actual_key_here
CLERK_SECRET_KEY=sk_test_your_actual_secret_key_here

# Clerk URLs (these are correct as-is)
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/map
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/map
```

**Important**: Replace `pk_test_your_actual_key_here` and `sk_test_your_actual_secret_key_here` with your actual keys from the Clerk dashboard!

### Step 6: Test Your Setup

1. Start your dev server:
   ```bash
   cd /home/gobinda/Hackathon/CandyFinder
   npm run dev
   ```

2. Open [http://localhost:3004](http://localhost:3004)

3. Click "Sign Up" button

4. You should see the Clerk sign-up modal with Halloween styling! 🎃

## ✨ Features You Get with Clerk

### 🔐 Email Verification (Automatic)
- Users receive a 6-digit code when they sign up
- Code expires after a set time
- Professional email templates
- No code needed on your end!

### 🔑 Social Logins (Optional)
To enable Google or GitHub login:

1. Go to Clerk Dashboard → **SSO Connections**
2. Click **Add Connection**
3. Choose **Google** or **GitHub**
4. Follow the setup wizard
5. That's it! Social login buttons appear automatically

### 👤 User Profiles
Clerk automatically provides:
- Profile pictures (avatars)
- Name fields
- Email management
- Password reset flows
- Account deletion

### 🔒 Security Features
- JWT session tokens (secure)
- Automatic session refresh
- CSRF protection
- Rate limiting
- IP blocking for suspicious activity

## 🎨 Customization (Optional)

### Change Theme Colors

The sign-in/sign-up modals are already styled with Halloween colors in the code, but you can customize further in Clerk Dashboard:

1. Go to **Customization** → **Theme**
2. Choose colors that match your brand
3. Upload a custom logo

### Custom Email Templates

1. Go to **Customization** → **Emails**
2. Edit the verification email template
3. Add your Halloween-themed styling!

## 📱 User Data Access

### In Your Code

```typescript
import { useUser } from '@clerk/nextjs'

function MyComponent() {
  const { isSignedIn, user } = useUser()
  
  if (isSignedIn) {
    console.log(user.id) // Clerk user ID
    console.log(user.emailAddresses[0].emailAddress) // User email
    console.log(user.firstName) // First name
    console.log(user.fullName) // Full name
    console.log(user.imageUrl) // Profile picture
  }
}
```

### Storing User Data in Supabase

When saving candy houses, use the Clerk user ID:

```typescript
const { user } = useUser()

const newHouse = {
  id: crypto.randomUUID(),
  address: '123 Main St',
  clerk_user_id: user?.id, // Clerk user ID
  user_email: user?.emailAddresses[0].emailAddress,
  user_name: user?.fullName,
  // ... other fields
}

// Save to Supabase or localStorage
```

## 🆘 Troubleshooting

### "Invalid Publishable Key" Error
- Make sure you copied the entire key (including `pk_test_`)
- Check for extra spaces in `.env.local`
- Restart your dev server after adding keys

### Email Verification Not Sending
- Check your Clerk dashboard → **Email Delivery**
- Free tier uses Clerk's shared domain (works fine for dev)
- For production, add your own domain

### Styling Looks Wrong
- The Halloween theme is applied in the code
- Check that Tailwind CSS is loading properly
- Clear browser cache and restart server

## 📊 Clerk Dashboard

### Useful Sections:

1. **Users** - View all registered users
2. **Sessions** - Active user sessions
3. **Webhooks** - Get notified of user events
4. **Analytics** - Sign-up rates, active users, etc.
5. **Logs** - Debug authentication issues

## 🚀 Going to Production

When you're ready to deploy:

1. Go to Clerk Dashboard → **API Keys**
2. Switch from **Development** to **Production**
3. Copy the production keys
4. Update your Vercel environment variables:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...`
   - `CLERK_SECRET_KEY=sk_live_...`

## ⚠️ Important Security Notes

1. **Never commit `.env.local`** - It's in `.gitignore` for a reason!
2. **Secret Key** - Only use on server-side (API routes, middleware)
3. **Publishable Key** - Safe to use in client-side code
4. **Rotate keys** - If compromised, regenerate in Clerk dashboard

## 💰 Pricing (as of November 2025)

- **Free**: 10,000 Monthly Active Users (MAU)
- **Pro**: $25/month for 10,000 MAU + $0.02 per additional user
- **Perfect for hackathons and MVPs!**

## 🎯 Next Steps

After setup:
1. ✅ Test sign-up flow
2. ✅ Test email verification
3. ✅ Test sign-in
4. ✅ Add a candy house while signed in
5. ✅ Sign out and sign back in
6. ✅ Verify candy houses persist

## 📞 Support

- **Clerk Docs**: [https://clerk.com/docs](https://clerk.com/docs)
- **Clerk Discord**: [https://clerk.com/discord](https://clerk.com/discord)
- **CandyFinder Issues**: Create an issue on GitHub

---

**Happy Building! 🎃🍬**
