-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auction_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_players ENABLE ROW LEVEL SECURITY;

-- 0. Helper function to bypass recursive RLS on users table
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT AS $$
  SELECT role FROM public.users WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- 1. Users policies
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.users
  FOR SELECT USING (
    public.get_my_role() = 'admin'
  );

-- 2. Players policies
CREATE POLICY "Anyone can view players" ON public.players
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage players" ON public.players
  FOR ALL USING (
    public.get_my_role() = 'admin'
  );

-- 3. Teams policies
CREATE POLICY "Anyone can view teams" ON public.teams
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage teams" ON public.teams
  FOR ALL USING (
    public.get_my_role() = 'admin'
  );

-- 4. Bids policies
CREATE POLICY "Anyone can view bids" ON public.bids
  FOR SELECT USING (true);

CREATE POLICY "Team owners can place bids" ON public.bids
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.teams t 
      WHERE t.owner_id = auth.uid() AND t.id = team_id
    )
  );

-- 5. Auction status policies
CREATE POLICY "Anyone can view auction status" ON public.auction_sessions
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage auction status" ON public.auction_sessions
  FOR ALL USING (
    public.get_my_role() = 'admin'
  );

