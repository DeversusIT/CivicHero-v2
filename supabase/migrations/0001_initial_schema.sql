-- CivicHero Initial Schema
-- Migration: 0001_initial_schema.sql

-- PROFILES TABLE
CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username    TEXT UNIQUE NOT NULL CHECK (length(username) BETWEEN 3 AND 20),
  avatar_url  TEXT,
  notify_leaderboard BOOLEAN DEFAULT TRUE,
  notify_badges      BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- LEVELS TABLE
CREATE TABLE levels (
  id          INTEGER PRIMARY KEY,
  name        TEXT NOT NULL,
  theme       TEXT NOT NULL,
  description TEXT,
  order_index INTEGER UNIQUE NOT NULL,
  is_active   BOOLEAN DEFAULT TRUE
);

-- SCORES TABLE
CREATE TABLE scores (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  level_id     INTEGER NOT NULL REFERENCES levels(id),
  score        INTEGER NOT NULL CHECK (score >= 0 AND score <= 10000),
  time_seconds INTEGER NOT NULL CHECK (time_seconds > 0),
  quiz_bonus   INTEGER NOT NULL DEFAULT 0 CHECK (quiz_bonus >= 0),
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, level_id)
);

-- BADGES TABLE
CREATE TABLE badges (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL UNIQUE,
  description     TEXT NOT NULL,
  icon_url        TEXT NOT NULL,
  condition_type  TEXT NOT NULL CHECK (condition_type IN (
    'level_complete', 'score_threshold', 'all_levels', 'quiz_perfect', 'speed_run', 'top10'
  )),
  condition_value JSONB NOT NULL DEFAULT '{}'
);

-- USER_BADGES TABLE
CREATE TABLE user_badges (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  badge_id  UUID NOT NULL REFERENCES badges(id),
  earned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- LEADERBOARD VIEW
CREATE VIEW leaderboard_view AS
SELECT
  p.id          AS user_id,
  p.username,
  p.avatar_url,
  COALESCE(SUM(s.score + s.quiz_bonus), 0)::INTEGER AS total_score,
  COUNT(DISTINCT s.level_id)::INTEGER               AS levels_completed,
  RANK() OVER (ORDER BY COALESCE(SUM(s.score + s.quiz_bonus), 0) DESC) AS rank
FROM profiles p
LEFT JOIN scores s ON s.user_id = p.id
GROUP BY p.id, p.username, p.avatar_url
ORDER BY total_score DESC;

-- ROW LEVEL SECURITY
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Scores policies
CREATE POLICY "Scores are viewable by everyone" ON scores FOR SELECT USING (true);
CREATE POLICY "Users can insert own scores" ON scores FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own scores" ON scores FOR UPDATE USING (auth.uid() = user_id);

-- Badges policies (read-only for users)
CREATE POLICY "Badges are viewable by everyone" ON badges FOR SELECT USING (true);

-- User badges policies
CREATE POLICY "User badges viewable by everyone" ON user_badges FOR SELECT USING (true);

-- Updated_at trigger for profiles
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
