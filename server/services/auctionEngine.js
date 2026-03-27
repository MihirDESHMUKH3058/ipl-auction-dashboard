import { supabase } from './supabaseClient.js';

class AuctionEngine {
  async placeBid(playerId, teamId, amount) {
    // 1. Validate team purse
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .select('purse_remaining')
      .eq('id', teamId)
      .single();

    if (teamError || !team) throw new Error('Team not found');
    if (team.purse_remaining < amount) throw new Error('Insufficient purse');

    // 2. Validate current session
    const { data: session } = await supabase
      .from('auction_sessions')
      .select('*')
      .eq('status', 'active')
      .eq('current_player_id', playerId)
      .single();

    if (!session) throw new Error('No active session for this player');

    // 3. Insert bid
    const { data: bid, error: bidError } = await supabase
      .from('bids')
      .insert({ player_id: playerId, team_id: teamId, amount })
      .select()
      .single();

    if (bidError) throw new Error(bidError.message);
    return bid;
  }

  async markSold(playerId, teamId, finalPrice) {
    // Transactional logic: Update player status, update team purse, insert into team_players
    // Since we are using Supabase client, we do these sequentially (or via RPC if needed for atomicity)
    
    // 1. Update Player
    await supabase.from('players').update({ status: 'sold' }).eq('id', playerId);

    // 2. Update Team Purse
    const { data: team } = await supabase.from('teams').select('purse_remaining').eq('id', teamId).single();
    const newPurse = team.purse_remaining - finalPrice;
    await supabase.from('teams').update({ purse_remaining: newPurse }).eq('id', teamId);

    // 3. Add to Team Players
    const { data: record } = await supabase.from('team_players').insert({
      team_id: teamId,
      player_id: playerId,
      final_price: finalPrice
    }).select().single();

    return record;
  }
}

export const auctionEngine = new AuctionEngine();
