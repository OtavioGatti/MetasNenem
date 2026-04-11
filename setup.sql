-- MetasNenem Supabase setup
-- Run this file in Supabase SQL Editor for a fresh project.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id TEXT NOT NULL,
  player_number INT NOT NULL CHECK (player_number IN (1, 2)),
  name TEXT NOT NULL,
  coins INT NOT NULL DEFAULT 0,
  level INT NOT NULL DEFAULT 1,
  streak INT NOT NULL DEFAULT 0,
  tasks_completed INT NOT NULL DEFAULT 0,
  achievements TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  last_activity_date TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (room_id, player_number)
);

CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id TEXT NOT NULL,
  description TEXT NOT NULL,
  coins INT NOT NULL DEFAULT 10,
  type TEXT NOT NULL DEFAULT 'pessoal' CHECK (type IN ('pessoal', 'casal')),
  assigned TEXT NOT NULL DEFAULT 'ambos' CHECK (assigned IN ('player1', 'player2', 'ambos')),
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  completed_by TEXT CHECK (completed_by IN ('player1', 'player2')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id TEXT NOT NULL,
  description TEXT NOT NULL,
  coins INT NOT NULL DEFAULT 20,
  difficulty TEXT NOT NULL DEFAULT 'facil' CHECK (difficulty IN ('facil', 'medio', 'dificil')),
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id TEXT NOT NULL,
  action TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS shop_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id TEXT NOT NULL,
  player_number INT NOT NULL CHECK (player_number IN (1, 2)),
  item_id INT NOT NULL,
  item_name TEXT NOT NULL,
  item_icon TEXT,
  cost INT NOT NULL DEFAULT 0,
  purchased_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_players_room ON players(room_id);
CREATE INDEX IF NOT EXISTS idx_tasks_room_created ON tasks(room_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_challenges_room_completed ON challenges(room_id, completed);
CREATE INDEX IF NOT EXISTS idx_history_room_timestamp ON history(room_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_shop_purchases_room_player ON shop_purchases(room_id, player_number, purchased_at DESC);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_players_updated_at ON players;
CREATE TRIGGER set_players_updated_at
BEFORE UPDATE ON players
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS set_tasks_updated_at ON tasks;
CREATE TRIGGER set_tasks_updated_at
BEFORE UPDATE ON tasks
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS set_challenges_updated_at ON challenges;
CREATE TRIGGER set_challenges_updated_at
BEFORE UPDATE ON challenges
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE history ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_purchases ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "metasnenem_public_players" ON players;
CREATE POLICY "metasnenem_public_players"
ON players FOR ALL
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "metasnenem_public_tasks" ON tasks;
CREATE POLICY "metasnenem_public_tasks"
ON tasks FOR ALL
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "metasnenem_public_challenges" ON challenges;
CREATE POLICY "metasnenem_public_challenges"
ON challenges FOR ALL
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "metasnenem_public_history" ON history;
CREATE POLICY "metasnenem_public_history"
ON history FOR ALL
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "metasnenem_public_shop_purchases" ON shop_purchases;
CREATE POLICY "metasnenem_public_shop_purchases"
ON shop_purchases FOR ALL
USING (true)
WITH CHECK (true);
