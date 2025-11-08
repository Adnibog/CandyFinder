# Supabase Setup Guide for CandyFinder

## Current Status
The app is currently running in **DEMO MODE** with placeholder Supabase credentials. To enable full authentication and database features, you need to set up a real Supabase project.

## Quick Setup (5 minutes)

### 1. Create Supabase Project
1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in:
   - **Name**: CandyFinder
   - **Database Password**: (save this securely!)
   - **Region**: Choose closest to you
5. Wait 2-3 minutes for project to initialize

### 2. Get Your Credentials
1. In your Supabase project dashboard, click ⚙️ **Settings** → **API**
2. Find these values:
   - **Project URL** (looks like: `https://xxxxxxxxxxxxx.supabase.co`)
   - **anon public** key (long string starting with `eyJ...`)

### 3. Update .env.local
Replace the placeholder values in `/home/gobinda/Hackathon/CandyFinder/.env.local`:

```bash
# Replace these lines:
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...your-actual-anon-key-here
```

### 4. Set Up Database Schema
1. In Supabase dashboard, click 🗄️ **SQL Editor**
2. Click **New query**
3. Copy and paste the contents of `lib/database/schema.sql`
4. Click **Run** (or press Ctrl+Enter)
5. Create another new query
6. Copy and paste the contents of `lib/database/auth-schema.sql`
7. Click **Run**

### 5. Configure Authentication
1. In Supabase dashboard, click 🔐 **Authentication** → **Providers**
2. Ensure **Email** is enabled
3. Configure email settings:
   - Click **Email** provider
   - Enable "Confirm email" if you want email verification
   - Or disable it for easier testing

### 6. Test Your Setup
1. Restart your dev server: `npm run dev`
2. Open http://localhost:3000
3. Click **Sign Up** in the navbar
4. Fill in the form:
   - Full Name: Test User
   - Email: test@example.com
   - Password: TestPassword123!
5. Check if account is created in Supabase:
   - Go to **Authentication** → **Users**
   - You should see your new user!

## What Works in Demo Mode vs Real Supabase

### Demo Mode (Current)
✅ UI works perfectly
✅ Navigation and layout
✅ Form validation
❌ User accounts are NOT saved
❌ No database persistence
❌ Can't actually log in between sessions
❌ No email verification

### With Real Supabase
✅ Everything from Demo Mode
✅ User accounts persist in database
✅ Login works between sessions
✅ Email verification (optional)
✅ Secure authentication with JWT
✅ Can add houses, ratings, routes
✅ Multi-user support

## Troubleshooting

### "Invalid API key" error
- Double-check you copied the **anon public** key (not the service_role key!)
- Make sure there are no extra spaces in `.env.local`

### "User already registered" but can't log in
- Check if email confirmation is required
- Go to Supabase → Authentication → Users
- Click on the user and "Confirm email"

### Changes not taking effect
- Restart the dev server: Stop (Ctrl+C) and `npm run dev`
- Clear browser cache and cookies for localhost:3000

### Database tables not created
- Make sure you ran BOTH SQL files:
  1. `schema.sql` - creates tables
  2. `auth-schema.sql` - sets up auth triggers

## Security Notes

⚠️ **NEVER commit your real Supabase keys to git!**

The `.env.local` file is already in `.gitignore`, but be careful:
- Don't share screenshots with your keys visible
- Don't paste your keys in public chats
- If keys are leaked, regenerate them in Supabase dashboard

## Alternative: Keep Demo Mode for Hackathon

If you're short on time, you can keep the demo mode for the presentation:
1. The UI and features will work perfectly
2. Just explain: "Auth system is built and ready - currently in demo mode"
3. Show the code in `lib/auth-context.tsx` to prove it's properly implemented
4. Deploy with real Supabase later if you win! 🎃

## Need Help?

Check these resources:
- [Supabase Docs](https://supabase.com/docs)
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)
- [CandyFinder Auth Setup](./AUTH_SETUP.md)
