-- Migration: Add user_name column to candy_houses table
-- Run this in your Supabase SQL Editor to add the user_name field

-- Add user_name column to candy_houses table (if not exists)
ALTER TABLE candy_houses ADD COLUMN IF NOT EXISTS user_name TEXT;

-- For existing records, we'll need to update them manually or through the app
-- This update sets user_name to email as a temporary fallback for existing records
-- The next time a user adds a house, it will use their actual full name from Clerk
UPDATE candy_houses 
SET user_name = COALESCE(user_name, user_email)
WHERE user_name IS NULL;

-- Create an index on user_name for better query performance
CREATE INDEX IF NOT EXISTS idx_candy_houses_user_name ON candy_houses(user_name);

-- Note: To get actual full names for existing houses, users need to:
-- 1. Delete and re-add their houses, OR
-- 2. We can create a script to fetch names from Clerk API and update the database
