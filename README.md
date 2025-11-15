# 🎃 CandyFinder

**Find the Best Candy Houses with GPS & Community Ratings**

Halloween trick-or-treating app with real-time GPS mapping, address search, and Google Maps directions.

---

## ✨ Features

- 🗺️ **Interactive Map** - Real-time candy house locations
- 🔍 **Address Search** - Find any location instantly
- 🧭 **Google Maps** - Turn-by-turn directions
- ⭐ **Community Ratings** - Rate candy quality & spooky level (1-5 stars)
- 🚨 **Report System** - Report fake/invalid addresses
- 🔐 **Secure Auth** - Clerk email verification
- 📍 **GPS Entry** - Add houses via location or manually
- 📱 **Responsive** - Works on all devices

---

## 🚀 Quick Start

### 1. Install
```bash
npm install
```

### 2. Set Up Database

**Run this SQL in [Supabase SQL Editor](https://supabase.com/dashboard)**:

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE candy_houses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clerk_user_id TEXT NOT NULL,
  user_email TEXT,
  address TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  candy_types TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  house_id UUID REFERENCES candy_houses(id) ON DELETE CASCADE,
  clerk_user_id TEXT NOT NULL,
  candy_rating INTEGER CHECK (candy_rating >= 1 AND candy_rating <= 5) NOT NULL,
  spooky_rating INTEGER CHECK (spooky_rating >= 1 AND spooky_rating <= 5) NOT NULL,
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(house_id, clerk_user_id)
);

CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  house_id UUID REFERENCES candy_houses(id) ON DELETE CASCADE,
  clerk_user_id TEXT NOT NULL,
  reason TEXT NOT NULL,
  details TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE VIEW houses_with_ratings AS
SELECT h.*, 
  COALESCE(AVG(r.candy_rating), 0) as avg_candy_rating,
  COALESCE(AVG(r.spooky_rating), 0) as avg_spooky_rating,
  COUNT(r.id) as rating_count
FROM candy_houses h LEFT JOIN ratings r ON h.id = r.house_id GROUP BY h.id;

CREATE INDEX idx_houses_location ON candy_houses(latitude, longitude);
CREATE INDEX idx_ratings_house ON ratings(house_id);
CREATE INDEX idx_reports_house ON reports(house_id);
ALTER TABLE candy_houses ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public access" ON candy_houses FOR ALL USING (true);
CREATE POLICY "Allow public ratings" ON ratings FOR ALL USING (true);
CREATE POLICY "Allow public reports" ON reports FOR ALL USING (true);
```

### 3. Configure Environment

Your `.env.local` is already configured:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xmczcfvfpjrgdfzeyznv.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4. Run
```bash
npm run dev
```

Open **http://localhost:3000**

---

## 📖 Usage

**Add House**: Click "Add Candy House" button → Choose GPS or manual entry → Enter address and notes → Submit  
**Rate House**: In sidebar, click "Rate House" button → Rate candy quality (1-5 ⭐) → Rate spooky level (1-5 👻) → Add comment (optional) → Submit  
**Report House**: Click "Report" button → Select reason (Fake Address, etc.) → Add details → Submit  
**Edit House**: In sidebar, click Edit icon on your houses → Update candy types/notes → Save  
**Delete House**: Click Delete icon on your houses → Confirm deletion  
**Search**: Type address in search bar → Click result → Map flies to location  
**Directions**: Click house marker → "Get Directions" → Opens Google Maps  
**Filter**: Toggle "All Houses" or "My Houses" to filter the list  
**Range**: Adjust slider to show houses within X miles of your location

---

## 🛠️ Tech Stack

**Frontend:** Next.js 14 • TypeScript • Tailwind CSS • Leaflet Maps  
**Backend:** Supabase (PostgreSQL) • Clerk Authentication  
**Deployment:** Vercel (recommended) • GitHub  
**APIs:** Google Maps Directions • OpenStreetMap Geocoding

---

## 🚀 Deploy to Vercel

This app is optimized for **Vercel** deployment (made by Next.js creators).

### Quick Deploy (5 minutes):

1. **Push to GitHub** (already done ✅):
```bash
git push origin main
```

2. **Deploy on Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "Sign Up" → Continue with GitHub
   - Click "Add New..." → "Project"
   - Import `Adnibog/CandyFinder` repository
   - Framework: **Next.js** (auto-detected)

3. **Add Environment Variables**:
   ```
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_SECRET_KEY=sk_test_...
   NEXT_PUBLIC_SUPABASE_URL=https://xmczcfvfpjrgdfzeyznv.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
   ```

4. **Click "Deploy"** → Wait 2-3 minutes → Done! 🎉

5. **Update Clerk**:
   - Go to [dashboard.clerk.com](https://dashboard.clerk.com)
   - Add your Vercel URL to allowed domains

### Why Vercel?
- ✅ **Free** for hobby projects
- ✅ **Auto-deploy** on every git push
- ✅ **Global CDN** - fast worldwide
- ✅ **Zero config** - works out of the box
- ✅ **Built for Next.js** - optimal performance

Your app will be live at: `https://candy-finder-[random].vercel.app`

---

## 🐛 Troubleshooting

**Houses not loading?** Run the SQL schema in Supabase SQL Editor  
**Modal hidden?** Fixed - z-index is 9999  
**GPS not working?** Use "Enter Manually" or deploy to HTTPS  

---

## 📄 License

MIT License

---

**Happy Trick-or-Treating! 🍬👻**
