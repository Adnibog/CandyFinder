-- CandyFinder Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Candy Houses Table (using Clerk user IDs as strings)
CREATE TABLE candy_houses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  latitude FLOAT8 NOT NULL,
  longitude FLOAT8 NOT NULL,
  address TEXT NOT NULL,
  candy_quality INTEGER CHECK (candy_quality >= 1 AND candy_quality <= 5) DEFAULT 3,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  user_id TEXT NOT NULL,  -- Clerk user ID (string)
  user_email TEXT,        -- User email from Clerk
  user_name TEXT,         -- User name from Clerk
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ratings Table
CREATE TABLE ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  house_id UUID REFERENCES candy_houses(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,  -- Clerk user ID
  candy_quality INTEGER CHECK (candy_quality >= 1 AND candy_quality <= 5),
  decoration_rating INTEGER CHECK (decoration_rating >= 1 AND decoration_rating <= 5),
  scariness_level INTEGER CHECK (scariness_level >= 1 AND scariness_level <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(house_id, user_id)
);

-- Indexes for performance
CREATE INDEX idx_candy_houses_location ON candy_houses(latitude, longitude);
CREATE INDEX idx_candy_houses_active ON candy_houses(is_active);
CREATE INDEX idx_candy_houses_user ON candy_houses(user_id);
CREATE INDEX idx_ratings_house ON ratings(house_id);

-- Create a view for houses with average ratings
CREATE OR REPLACE VIEW houses_with_ratings AS
SELECT 
  h.*,
  COALESCE(AVG(r.candy_quality), h.candy_quality) as avg_candy_rating,
  COALESCE(AVG(r.decoration_rating), 0) as avg_decoration_rating,
  COALESCE(AVG(r.scariness_level), 0) as avg_scariness_rating,
  COUNT(r.id) as total_ratings
FROM candy_houses h
LEFT JOIN ratings r ON h.id = r.house_id
GROUP BY h.id, h.candy_quality;

-- Row Level Security (RLS) Policies

-- Enable RLS
ALTER TABLE candy_houses ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;

-- Candy Houses Policies (Allow anyone to read, authenticated users to write)
CREATE POLICY "Anyone can view active candy houses"
  ON candy_houses FOR SELECT
  USING (is_active = true);

CREATE POLICY "Anyone can insert candy houses"
  ON candy_houses FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own houses"
  ON candy_houses FOR UPDATE
  USING (true);

CREATE POLICY "Users can delete their own houses"
  ON candy_houses FOR DELETE
  USING (true);

-- Ratings Policies
CREATE POLICY "Anyone can view ratings"
  ON ratings FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert ratings"
  ON ratings FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update ratings"
  ON ratings FOR UPDATE
  USING (true);

CREATE POLICY "Anyone can delete ratings"
  ON ratings FOR DELETE
  USING (true);

-- Function to calculate distance between two points (Haversine formula)
CREATE OR REPLACE FUNCTION calculate_distance(
  lat1 FLOAT8, lon1 FLOAT8,
  lat2 FLOAT8, lon2 FLOAT8
) RETURNS FLOAT8 AS $$
DECLARE
  r FLOAT8 := 3959; -- Earth's radius in miles
  dlat FLOAT8;
  dlon FLOAT8;
  a FLOAT8;
  c FLOAT8;
BEGIN
  dlat := radians(lat2 - lat1);
  dlon := radians(lon2 - lon1);
  a := sin(dlat/2) * sin(dlat/2) + 
       cos(radians(lat1)) * cos(radians(lat2)) * 
       sin(dlon/2) * sin(dlon/2);
  c := 2 * atan2(sqrt(a), sqrt(1-a));
  RETURN r * c;
END;
$$ LANGUAGE plpgsql;

-- Function to get houses within range
CREATE OR REPLACE FUNCTION get_houses_within_range(
  user_lat FLOAT8,
  user_lon FLOAT8,
  range_miles FLOAT8
) RETURNS SETOF houses_with_ratings AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM houses_with_ratings h
  WHERE calculate_distance(user_lat, user_lon, h.latitude, h.longitude) <= range_miles
  AND h.is_active = true
  ORDER BY calculate_distance(user_lat, user_lon, h.latitude, h.longitude);
END;
$$ LANGUAGE plpgsql;

-- Insert some sample data (optional, for testing)
INSERT INTO candy_houses (latitude, longitude, address, candy_types, notes, is_active, user_id)
VALUES 
  (40.7128, -74.0060, '123 Spooky Lane', ARRAY['Chocolate', 'Gummy Bears'], 'Full-size candy bars!', true, NULL),
  (40.7158, -74.0090, '456 Haunted Ave', ARRAY['Candy Corn', 'Lollipops'], 'Amazing decorations!', true, NULL),
  (40.7098, -74.0030, '789 Ghost Street', ARRAY['Mixed Candy'], 'Super spooky house!', true, NULL);
