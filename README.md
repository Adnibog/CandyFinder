# 🎃 CandyFinder

**Find the Best Candy Houses with GPS & AI**

A Next.js-based Halloween trick-or-treating application that uses real-time GPS mapping, community ratings, and AI route optimization to help you find the best candy spots.

---

## ✨ Features

- 🗺️ **Real-Time GPS Mapping** - Interactive map showing candy houses near you
- 🤖 **AI Route Optimization** - Smart routing to maximize your candy haul
- ⭐ **Community Ratings** - See which houses give out the best candy
- � **Secure & Private** - Built with security-first architecture
- � **Responsive Design** - Works seamlessly on mobile and desktop
- 🎨 **Halloween-Themed UI** - Spooky, festive interface with animations

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Maps**: Leaflet
- **Authentication**: Clerk (Email verification, Social login)
- **Deployment**: Vercel

## 📦 Quick Start

### 1. Install Dependencies

```bash
cd CandyFinder
npm install
```

### 2. Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Copy your project URL and anon key
3. Create a `.env.local` file:

```bash
cp .env.local.example .env.local
```

4. Update `.env.local` with your Supabase credentials:



---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd CandyFinder
npm install
```

### 2. Set Up Environment Variables
```bash
cp .env.example .env.local
# Edit .env.local with your credentials
```

Required variables in `.env.local`:
```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
CLERK_SECRET_KEY=sk_test_your_key_here
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/map
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/map

# Supabase (Database only - Auth handled by Clerk)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Set Up Clerk Authentication
1. Go to [clerk.com](https://clerk.com) and create a free account
2. Create a new application "CandyFinder"
3. Enable email verification in Settings → Email, Phone, Username
4. Copy your API keys to `.env.local`
5. (Optional) Configure social logins (Google, GitHub, etc.)

### 4. Set Up Supabase (Database Only)
1. Go to [supabase.com](https://supabase.com) and create a project
2. Get your project URL and anon key
3. Run the database migration in SQL editor: `lib/database/schema.sql`
4. Update `.env.local` with Supabase credentials

### 5. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

---

## � Project Structure

```
CandyFinder/
├── app/                    # Next.js 14 App Router
│   ├── api/               # API routes
│   ├── map/               # Map page
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── Auth/             # Authentication components
│   ├── UI/               # Reusable UI components
│   ├── Map/              # Map-related components
│   └── HomePage.tsx      # Landing page
├── lib/                   # Utility libraries
│   ├── supabase/         # Database client
│   ├── encryption.ts     # Security utilities
│   └── database/         # SQL schemas
├── public/               # Static assets
└── scripts/              # Build & utility scripts
```

---

## 🔐 Security

CandyFinder implements enterprise-grade security:

- **AES-256-GCM Encryption** for sensitive data
- **Bcrypt** password hashing
- **Row Level Security (RLS)** in Supabase
- **Environment variable protection**
- **Secure session management**
- **2FA support** via TOTP

For detailed security documentation, see [SECURITY_SUMMARY.md](./SECURITY_SUMMARY.md)

---

## 📚 Documentation

- [SETUP.md](./SETUP.md) - Detailed setup instructions
- [SECURITY_SUMMARY.md](./SECURITY_SUMMARY.md) - Security architecture
- [HACKATHON_CHECKLIST.md](./HACKATHON_CHECKLIST.md) - Development checklist
- [PRESENTATION.md](./PRESENTATION.md) - Hackathon presentation notes

---

## 🎯 Hackathon Information

Built for **Halloween Hackathon Fall 2025**

**Features Completed:**
- ✅ User authentication with secure encryption
- ✅ Interactive GPS mapping
- ✅ Real-time candy house tracking
- ✅ Community rating system
- ✅ Route optimization
- ✅ Responsive UI with Halloween theme
- ✅ Security implementation (encryption, RLS)

---

## 🚀 Deployment

### Deploy to Vercel
```bash
npm i -g vercel
vercel
```

Set environment variables in Vercel dashboard:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_APP_URL`
- `ENCRYPTION_KEY`

---

## 🤝 Contributing

This is a hackathon project. For improvements:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

---

## 📄 License

MIT License - see LICENSE file for details

---

## � Happy Halloween & Happy Trick-or-Treating! 🍬

Built with ❤️ for safer, smarter candy hunting.
