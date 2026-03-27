-- Enable Realtime Replication for critical tables
BEGIN;
  -- Remove existing if any
  DROP PUBLICATION IF EXISTS supabase_realtime;
  
  -- Create publication
  CREATE PUBLICATION supabase_realtime;
COMMIT;

-- Add tables to publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.players;
ALTER PUBLICATION supabase_realtime ADD TABLE public.auction_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.bids;
ALTER PUBLICATION supabase_realtime ADD TABLE public.teams;
ALTER PUBLICATION supabase_realtime ADD TABLE public.team_players;

-- Set replica identity to FULL for broad real-time support
ALTER TABLE public.players REPLICA IDENTITY FULL;
ALTER TABLE public.auction_sessions REPLICA IDENTITY FULL;
ALTER TABLE public.bids REPLICA IDENTITY FULL;
ALTER TABLE public.teams REPLICA IDENTITY FULL;
ALTER TABLE public.team_players REPLICA IDENTITY FULL;
