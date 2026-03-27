-- 1. Users table (Extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  role TEXT CHECK (role IN ('admin', 'team_owner', 'viewer')) DEFAULT 'viewer',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Players table
CREATE TABLE IF NOT EXISTS public.players (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  age INT,
  role TEXT CHECK (role IN ('Batsman', 'Bowler', 'All-Rounder', 'Wicketkeeper')),
  nationality TEXT,
  base_price BIGINT NOT NULL, -- Price in paise or lakhs (consistent unit needed)
  image_url TEXT,
  status TEXT CHECK (status IN ('available', 'sold', 'unsold')) DEFAULT 'available',
  category TEXT, -- e.g., Set 1, Marquee
  is_anonymous BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Teams table
CREATE TABLE IF NOT EXISTS public.teams (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  short_name TEXT UNIQUE NOT NULL,
  owner_id UUID REFERENCES public.users(id),
  purse_remaining BIGINT DEFAULT 10000000000, -- 100 Cr in paise (10^10)
  logo_url TEXT,
  max_players INT DEFAULT 25,
  max_overseas INT DEFAULT 8,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Auction Sessions
CREATE TABLE IF NOT EXISTS public.auction_sessions (
  id SERIAL PRIMARY KEY,
  status TEXT CHECK (status IN ('pending', 'active', 'paused', 'completed')) DEFAULT 'pending',
  current_player_id INT REFERENCES public.players(id),
  timer_duration INT DEFAULT 15, -- Default 15s
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ
);

-- 5. Bids
CREATE TABLE IF NOT EXISTS public.bids (
  id SERIAL PRIMARY KEY,
  player_id INT REFERENCES public.players(id) NOT NULL,
  team_id INT REFERENCES public.teams(id) NOT NULL,
  amount BIGINT NOT NULL,
  session_id INT REFERENCES public.auction_sessions(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Team Players (Junction table)
CREATE TABLE IF NOT EXISTS public.team_players (
  team_id INT REFERENCES public.teams(id) NOT NULL,
  player_id INT REFERENCES public.players(id) NOT NULL,
  final_price BIGINT NOT NULL,
  acquired_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (team_id, player_id)
);

-- 7. Triggers for Auth (Auto-create public.users entry)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, role)
  VALUES (NEW.id, NEW.email, 'viewer');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
