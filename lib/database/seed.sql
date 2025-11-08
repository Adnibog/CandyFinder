-- Test/Seed Data for CandyFinder
-- Run this AFTER running schema.sql
-- This adds sample candy houses for testing

-- Clear existing test data (optional - comment out if you want to keep existing houses)
DELETE FROM candy_houses WHERE user_id LIKE 'test_%';

-- Insert test candy houses
INSERT INTO candy_houses (latitude, longitude, address, candy_quality, notes, user_id, user_email, user_name, is_active) VALUES
  -- Near user's typical location (adjust these coordinates based on your location)
  (37.7749, -122.4194, '123 Spooky Lane, San Francisco, CA', 5, '🎃 Full-size candy bars! Amazing house!', 'test_user_1', 'test@candyfinder.com', 'Test User', true),
  (37.7769, -122.4174, '456 Haunted Ave, San Francisco, CA', 4, '👻 Great decorations and good candy', 'test_user_2', 'demo@candyfinder.com', 'Demo User', true),
  (37.7729, -122.4214, '789 Candy Court, San Francisco, CA', 5, '🍬 King-size treats! Must visit!', 'test_user_3', 'sample@candyfinder.com', 'Sample User', true),
  (37.7789, -122.4154, '321 Pumpkin Street, San Francisco, CA', 3, '🦇 Decent candy, nice people', 'test_user_4', 'test2@candyfinder.com', 'Another Tester', true),
  (37.7709, -122.4234, '654 Ghost Road, San Francisco, CA', 5, '💀 Super scary house with amazing candy!', 'test_user_5', 'demo2@candyfinder.com', 'Demo User 2', true),
  (37.7799, -122.4144, '987 Witch Way, San Francisco, CA', 4, '🕷️ Fun haunted maze and great treats', 'test_user_6', 'sample2@candyfinder.com', 'Sample User 2', true),
  (37.7719, -122.4224, '147 Skeleton Drive, San Francisco, CA', 4, '🎭 Interactive decorations, good candy selection', 'test_user_7', 'test3@candyfinder.com', 'Test User 3', true);

-- Verify the data was inserted
SELECT id, address, candy_quality, notes FROM candy_houses WHERE user_id LIKE 'test_%';
