# 🎃 CandyFinder

**Find the Best Candy Houses with GPS & Community Ratings**

Halloween trick-or-treating app with real-time GPS mapping, address search, and Google Maps directions.

---

## ✨ Features

- 🗺️ **Interactive Map** - Real-time candy house locations
- 🔍 **Address Search** - Find any location instantly
- 🧭 **Google Maps** - Turn-by-turn directions
- ⭐ **Community Ratings** - Rate houses (1-5 stars)
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
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE VIEW houses_with_ratings AS
SELECT h.*, COALESCE(AVG(r.rating), 3) as avg_rating, COUNT(r.id) as rating_count
FROM candy_houses h LEFT JOIN ratings r ON h.id = r.house_id GROUP BY h.id;

CREATE INDEX idx_houses_location ON candy_houses(latitude, longitude);
ALTER TABLE candy_houses ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public access" ON candy_houses FOR ALL USING (true);
CREATE POLICY "Allow public ratings" ON ratings FOR ALL USING (true);
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

**Add House**: Click "Add Candy House" button → Choose GPS or manual entry → Fill details → Submit  
**Edit House**: In sidebar, click Edit icon on your houses → Update candy types/notes → Save  
**Delete House**: Click Delete icon on your houses → Confirm deletion  
**Search**: Type address in search bar → Click result → Map flies to location  
**Directions**: Click house marker → "Get Directions" → Opens Google Maps  
**Filter**: Toggle "All Houses" or "My Houses" to filter the list  
**Range**: Adjust slider to show houses within X miles of your location

---

## 🛠️ Tech Stack

Next.js 14 • TypeScript • Tailwind CSS • Supabase • Clerk • Leaflet • Google Maps

---

## � Deploy to Vercel

```bash
git push origin main
```

1. Import repo to [vercel.com](https://vercel.com)
2. Add environment variables from `.env.local`
3. Deploy

---

## 🐛 Troubleshooting

**Houses not loading?** Run the SQL schema in Supabase SQL Editor  
**Modal hidden?** Fixed - z-index is 9999  
**GPS not working?** Use "Enter Manually" or deploy to HTTPS  

---

## � License

MIT License

---

**Happy Trick-or-Treating! 🍬👻**
