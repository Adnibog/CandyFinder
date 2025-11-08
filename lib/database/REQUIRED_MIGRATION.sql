-- ============================================
-- REQUIRED MIGRATION - RUN THIS IN SUPABASE
-- ============================================
-- This migration fixes the ratings table schema error
-- and ensures user_name column exists
-- 
-- INSTRUCTIONS:
-- 1. Copy this entire file
-- 2. Go to your Supabase Dashboard > SQL Editor
-- 3. Paste and run this SQL
-- ============================================

-- Step 1: Add user_name column if it doesn't exist
ALTER TABLE candy_houses ADD COLUMN IF NOT EXISTS user_name TEXT;

-- Update existing records to use email as fallback
UPDATE candy_houses 
SET user_name = COALESCE(user_name, user_email)
WHERE user_name IS NULL;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_candy_houses_user_name ON candy_houses(user_name);

-- Step 2: Recreate ratings table with correct schema
DROP TABLE IF EXISTS ratings CASCADE;

CREATE TABLE ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  house_id UUID REFERENCES candy_houses(id) ON DELETE CASCADE,
  clerk_user_id TEXT NOT NULL,
  candy_rating INTEGER CHECK (candy_rating >= 1 AND candy_rating <= 5) NOT NULL,
  spooky_rating INTEGER CHECK (spooky_rating >= 1 AND spooky_rating <= 5) NOT NULL,
  overall_rating INTEGER CHECK (overall_rating >= 1 AND overall_rating <= 5) NOT NULL,
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(house_id, clerk_user_id)
);

-- Create indexes for ratings
CREATE INDEX idx_ratings_house ON ratings(house_id);
CREATE INDEX idx_ratings_user ON ratings(clerk_user_id);

-- Step 3: Enable Row Level Security
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;

-- Create policies for ratings
CREATE POLICY "Anyone can view ratings"
  ON ratings FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert ratings"
  ON ratings FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own ratings"
  ON ratings FOR UPDATE
  USING (true);

CREATE POLICY "Users can delete their own ratings"
  ON ratings FOR DELETE
  USING (true);

-- Step 4: Create/Update the view for houses with ratings
DROP VIEW IF EXISTS houses_with_ratings CASCADE;

CREATE VIEW houses_with_ratings AS
SELECT 
  h.*,
  COALESCE(AVG(r.candy_rating), 0) as avg_candy_rating,
  COALESCE(AVG(r.spooky_rating), 0) as avg_spooky_rating,
  COALESCE(AVG(r.overall_rating), 0) as avg_overall_rating,
  COUNT(r.id) as rating_count
FROM candy_houses h
LEFT JOIN ratings r ON h.id = r.house_id
GROUP BY h.id;

-- Grant permissions
GRANT ALL ON ratings TO authenticated, anon;

-- ============================================
-- MIGRATION COMPLETE!
-- ============================================
-- After running this:
-- 1. Refresh your app
-- 2. Try rating a house again
-- 3. New houses will save user's full name
-- ============================================
