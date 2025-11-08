-- Update CandyFinder Database Schema
-- Run this in your Supabase SQL Editor to add rating and reporting features

-- Update ratings table structure
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

-- Create reports table
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  house_id UUID REFERENCES candy_houses(id) ON DELETE CASCADE,
  clerk_user_id TEXT NOT NULL,
  reason TEXT NOT NULL,
  details TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_ratings_house ON ratings(house_id);
CREATE INDEX idx_ratings_user ON ratings(clerk_user_id);
CREATE INDEX idx_reports_house ON reports(house_id);
CREATE INDEX idx_reports_status ON reports(status);

-- Update view for houses with ratings
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

-- Row Level Security for ratings
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;

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

-- Row Level Security for reports
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own reports"
  ON reports FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create reports"
  ON reports FOR INSERT
  WITH CHECK (true);

-- Grant permissions
GRANT ALL ON ratings TO authenticated, anon;
GRANT ALL ON reports TO authenticated, anon;
GRANT SELECT ON houses_with_ratings TO authenticated, anon;
