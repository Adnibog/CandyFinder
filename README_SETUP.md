# 🎃 IMPORTANT - READ THIS FIRST! 🎃

## ⚠️ CRITICAL: Database Migration Required

You're seeing the error **"Could not find the 'candy_rating' column"** because your database needs to be updated.

### 🔧 Fix This Now (Takes 2 minutes):

1. **Open Supabase Dashboard**: Go to https://supabase.com/dashboard
2. **Navigate to**: SQL Editor (in left sidebar)
3. **Copy & Run**: The SQL from `lib/database/REQUIRED_MIGRATION.sql`
4. **Refresh your app**: The error will be fixed!

---

## ✅ What's Been Fixed in the Code:

### 1. ⭐ Rating System (3 Separate Ratings)
Users now rate houses on 3 aspects:
- 🍬 **Candy Quality** (orange stars)
- 👻 **Spooky Level** (purple stars)  
- ⭐ **Overall Experience** (yellow stars)

Each rating is saved separately and averaged across all users.

### 2. 👤 User Full Names
- **Before**: "Added by: user@email.com"
- **After**: "Added by: John Doe"

New houses automatically save the user's full name from Clerk authentication.

### 3. 🏷️ Page Title
- **Before**: "🍬 CandyFinder - Find the Best Halloween Candy Houses"
- **After**: "🍬 CandyFinder"

Cleaner, simpler title!

---

## 📁 Project Structure

```
CandyFinder/
├── app/                          # Next.js app directory
│   ├── layout.tsx               # Root layout with metadata
│   ├── page.tsx                 # Home page
│   ├── map/                     # Map page
│   └── globals.css              # Global styles
├── components/
│   ├── Map/
│   │   ├── MapView.tsx          # Main map component
│   │   ├── RatingModal.tsx      # 3-rating system modal
│   │   ├── ReportModal.tsx      # Report fake houses
│   │   └── AddHouseModal.tsx    # Add new candy house
│   ├── UI/
│   │   ├── Sidebar.tsx          # House list with ratings
│   │   ├── Header.tsx           # App header
│   │   └── Footer.tsx           # App footer
│   └── Auth/
│       ├── AuthModal.tsx        # Sign in/up modal
│       └── UserMenu.tsx         # User dropdown menu
├── lib/
│   ├── database/
│   │   ├── REQUIRED_MIGRATION.sql  # ⚠️ RUN THIS IN SUPABASE!
│   │   ├── schema.sql              # Original schema
│   │   └── update-schema.sql       # Rating system schema
│   ├── types.ts                    # TypeScript interfaces
│   └── supabase/
│       └── client.ts               # Supabase client config
└── public/                         # Static assets
```

---

## 🚀 How the App Works

### Adding a House
1. Click "Add Candy House" button
2. Choose "Use Current Location" or "Enter Manually"
3. Address is auto-filled (GPS) or manually entered
4. House is saved with your full name

### Rating a House
1. Find a house in the sidebar (left panel)
2. Click "Rate House" button (only on other users' houses)
3. Rate all 3 aspects (Candy, Spooky, Overall) - all required
4. Optionally add a comment
5. Submit - rating is saved and averaged with others

### Viewing Ratings
- **Sidebar**: Shows all 3 rating types with stars
- **Map Popup**: Click any house marker to see ratings
- **Review Count**: "Based on X reviews" shows total ratings

### Reporting Fake Houses
1. Click "Report" button on suspicious house
2. Select a reason (Fake Address, Duplicate, etc.)
3. Add optional details
4. Submit - report goes to pending status

---

## 🗄️ Database Tables

### `candy_houses`
Stores all trick-or-treat locations.

**Key Fields:**
- `id`: Unique identifier (UUID)
- `latitude`, `longitude`: GPS coordinates
- `address`: Full street address
- `clerk_user_id`: User who added it
- `user_name`: **NEW!** Full name of user
- `user_email`: User's email (fallback)

### `ratings`
Stores user ratings for houses.

**Key Fields:**
- `house_id`: Which house was rated
- `clerk_user_id`: Who rated it
- `candy_rating`: 1-5 stars (required)
- `spooky_rating`: 1-5 stars (required)
- `overall_rating`: **NEW!** 1-5 stars (required)
- `comment`: Optional text

**Constraint:** One rating per user per house (UNIQUE)

### `reports`
Stores reports of fake/invalid houses.

**Key Fields:**
- `house_id`: Reported house
- `clerk_user_id`: Who reported it
- `reason`: Predefined reason
- `status`: pending/reviewed/resolved/dismissed

---

## 🎨 Rating Color System

- 🍬 **Candy**: Orange (`#FF6B35` - halloween-orange)
- 👻 **Spooky**: Purple (`#9333EA` - halloween-purple)
- ⭐ **Overall**: Yellow (`#FBBF24` - yellow-400)

---

## ⚡ Quick Troubleshooting

### "candy_rating column not found"
→ **Run the migration SQL** in `lib/database/REQUIRED_MIGRATION.sql`

### "Added by" shows email instead of name
→ Migration SQL updates this. New houses will show names automatically.

### Can't rate a house
→ Make sure you're NOT the owner. You can only rate other users' houses.

### Rating button missing
→ Only appears for houses you don't own. Check if you're logged in.

---

## 📝 Notes for Development

- **Authentication**: Uses Clerk (clerk_user_id as TEXT, not UUID)
- **Database**: PostgreSQL via Supabase
- **Maps**: Leaflet with OpenStreetMap tiles
- **Styling**: Tailwind CSS with Halloween theme
- **Icons**: Lucide React

### Environment Variables Needed:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
CLERK_SECRET_KEY=your_clerk_secret
```

---

## 🎯 What's Next?

After running the migration:
1. ✅ Rating system will work perfectly
2. ✅ All 3 ratings will save and display
3. ✅ User full names will appear
4. ✅ Clean, organized workspace

**Happy Trick-or-Treating! 🍬🎃👻**
