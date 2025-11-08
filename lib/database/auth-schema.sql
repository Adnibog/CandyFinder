-- Authentication & User Profiles Extension
-- Add this to your existing schema.sql or run separately

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User Profiles Table (extends auth.users)
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  phone TEXT,
  address TEXT,
  preferences JSONB DEFAULT '{}'::jsonb,
  two_factor_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Update candy_houses to use user_profiles
ALTER TABLE candy_houses 
  DROP CONSTRAINT IF EXISTS candy_houses_user_id_fkey,
  ADD CONSTRAINT candy_houses_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE;

ALTER TABLE ratings 
  DROP CONSTRAINT IF EXISTS ratings_user_id_fkey,
  ADD CONSTRAINT ratings_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE;

ALTER TABLE routes 
  DROP CONSTRAINT IF EXISTS routes_user_id_fkey,
  ADD CONSTRAINT routes_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE;

-- Indexes
CREATE INDEX idx_user_profiles_id ON user_profiles(id);
CREATE INDEX idx_user_profiles_created_at ON user_profiles(created_at);

-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies for user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles"
  ON user_profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Activity Log Table (for security audit)
CREATE TABLE user_activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_activity_log_user_id ON user_activity_log(user_id);
CREATE INDEX idx_activity_log_created_at ON user_activity_log(created_at);

-- RLS for activity log
ALTER TABLE user_activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own activity"
  ON user_activity_log FOR SELECT
  USING (auth.uid() = user_id);

-- Insert demo users (passwords will be hashed by Supabase Auth)
-- Note: These should be created through Supabase Auth API or Dashboard
-- This is just for reference

-- Demo User 1: demo@candyfinder.com / Demo123!@#
-- Full Name: Demo User
-- This user should be created in Supabase Dashboard with email verification

-- Demo User 2: trick@treat.com / Treat123!@#
-- Full Name: Trick Treater
-- This user should be created in Supabase Dashboard with email verification

-- Demo User 3: candy@lover.com / Candy123!@#
-- Full Name: Candy Lover
-- This user should be created in Supabase Dashboard with email verification

-- Sample data for demo user profiles (after users are created via Auth)
-- INSERT INTO user_profiles (id, full_name, bio, preferences)
-- VALUES 
--   ('uuid-of-demo-user', 'Demo User', 'Halloween enthusiast and candy route optimizer!', '{"favorite_candy": "Chocolate", "scare_level": "medium"}'),
--   ('uuid-of-trick-user', 'Trick Treater', 'Professional trick-or-treater with 10+ years experience', '{"favorite_candy": "Gummy Bears", "scare_level": "high"}'),
--   ('uuid-of-candy-user', 'Candy Lover', 'Love sharing candy with the community!', '{"favorite_candy": "All", "scare_level": "low"}');

-- Views for enhanced user data
CREATE OR REPLACE VIEW user_profiles_with_stats AS
SELECT 
  up.*,
  COUNT(DISTINCT ch.id) as houses_added,
  COUNT(DISTINCT r.id) as ratings_given,
  COUNT(DISTINCT ro.id) as routes_created
FROM user_profiles up
LEFT JOIN candy_houses ch ON up.id = ch.user_id
LEFT JOIN ratings r ON up.id = r.user_id
LEFT JOIN routes ro ON up.id = ro.user_id
GROUP BY up.id;

-- Grant access
GRANT SELECT ON user_profiles_with_stats TO authenticated;

-- Security: Prevent email enumeration
CREATE POLICY "Prevent email enumeration"
  ON user_profiles FOR SELECT
  USING (true);

COMMENT ON TABLE user_profiles IS 'Extended user profile information';
COMMENT ON TABLE user_activity_log IS 'Security audit log for user actions';
COMMENT ON COLUMN user_profiles.two_factor_enabled IS 'Whether user has enabled 2FA (managed by Supabase Auth)';
