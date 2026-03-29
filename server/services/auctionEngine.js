import { supabase } from './supabaseClient.js';

const INITIAL_TEAM_BUDGET = 1000000000;

class AuctionEngine {
  async getPlayerById(playerId) {
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .eq('id', playerId)
      .single();

    if (error || !data) throw new Error('Player not found');
    return data;
  }

  async getTeamById(teamId) {
    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .eq('id', teamId)
      .single();

    if (error || !data) throw new Error('Team not found');
    return data;
  }

  async setTeamPurse(teamId, purseRemaining) {
    const { error } = await supabase
      .from('teams')
      .update({ purse_remaining: Math.max(0, purseRemaining) })
      .eq('id', teamId);

    if (error) throw error;
  }

  async placeBid(playerId, teamId, amount) {
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .select('purse_remaining')
      .eq('id', teamId)
      .single();

    if (teamError || !team) throw new Error('Team not found');
    if (team.purse_remaining < amount) throw new Error('Insufficient purse');

    const { data: session } = await supabase
      .from('auction_sessions')
      .select('*')
      .eq('status', 'active')
      .eq('current_player_id', playerId)
      .single();

    if (!session) throw new Error('No active session for this player');

    const { data: bid, error: bidError } = await supabase
      .from('bids')
      .insert({ player_id: playerId, team_id: teamId, amount })
      .select()
      .single();

    if (bidError) throw new Error(bidError.message);
    return bid;
  }

  async markSold(playerId, teamId, teamName, finalPrice) {
    const price = Number(finalPrice);
    if (!Number.isFinite(price) || price <= 0) {
      throw new Error('Final price must be a positive number');
    }

    const player = await this.getPlayerById(playerId);
    const team = await this.getTeamById(teamId);

    if (String(player.status).toLowerCase() === 'sold') {
      throw new Error('Player is already sold');
    }

    const purseRemaining = Number(team.purse_remaining ?? INITIAL_TEAM_BUDGET);
    if (purseRemaining < price) {
      throw new Error('Insufficient purse remaining');
    }

    const resolvedTeamName = teamName || team.name;

    const { error: playerError } = await supabase.from('players')
      .update({
        status: 'sold',
        team_name: resolvedTeamName,
        sale_price: price
      })
      .eq('id', playerId);

    if (playerError) throw playerError;

    try {
      const { error: existingMappingError } = await supabase
        .from('team_players')
        .delete()
        .eq('player_id', playerId);

      if (existingMappingError) throw existingMappingError;

      const nextPurse = purseRemaining - price;
      await this.setTeamPurse(teamId, nextPurse);

      const { data: record, error: mappingError } = await supabase
      .from('team_players')
      .insert({
        team_id: teamId,
        player_id: playerId,
        final_price: price
      })
      .select()
      .single();

      if (mappingError) {
        throw mappingError;
      }

      return {
        ...record,
        team_name: resolvedTeamName,
        sale_price: price,
        team_id: teamId,
        id: playerId
      };
    } catch (error) {
      await supabase
        .from('players')
        .update({
          status: player.status || 'available',
          team_name: player.team_name || null,
          sale_price: player.sale_price || null
        })
        .eq('id', playerId);

      await this.setTeamPurse(teamId, purseRemaining);
      throw error;
    }
  }

  async markUnsold(playerId) {
    const player = await this.getPlayerById(playerId);
    const { data: assignments, error: assignmentError } = await supabase
      .from('team_players')
      .select('*')
      .eq('player_id', playerId);

    if (assignmentError) throw assignmentError;

    for (const assignment of assignments || []) {
      const team = await this.getTeamById(assignment.team_id);
      const purseRemaining = Number(team.purse_remaining ?? INITIAL_TEAM_BUDGET);
      await this.setTeamPurse(team.id, purseRemaining + Number(assignment.final_price || player.sale_price || 0));
    }

    const { error } = await supabase.from('players')
      .update({ status: 'unsold', team_name: null, sale_price: null })
      .eq('id', playerId);

    if (error) throw error;

    const { error: deleteError } = await supabase.from('team_players').delete().eq('player_id', playerId);
    if (deleteError) {
      await supabase
        .from('players')
        .update({
          status: player.status || 'available',
          team_name: player.team_name || null,
          sale_price: player.sale_price || null
        })
        .eq('id', playerId);
      throw deleteError;
    }
    
    return { id: playerId, status: 'unsold' };
  }

  async recalculateTeamBudgets() {
    const { data: teams, error: teamsError } = await supabase.from('teams').select('*');
    if (teamsError) throw teamsError;

    const { data: mappings, error: mappingsError } = await supabase.from('team_players').select('*');
    if (mappingsError) throw mappingsError;

    for (const team of teams || []) {
      const spent = (mappings || [])
        .filter((mapping) => String(mapping.team_id) === String(team.id))
        .reduce((sum, mapping) => sum + Number(mapping.final_price || 0), 0);

      await this.setTeamPurse(team.id, INITIAL_TEAM_BUDGET - spent);
    }
  }

  async resetSession() {
    const { error: teamPlayersError } = await supabase
      .from('team_players')
      .delete()
      .neq('player_id', 0);

    if (teamPlayersError) throw teamPlayersError;

    const { error: playerError } = await supabase
      .from('players')
      .update({ status: 'hidden', team_name: null, sale_price: null })
      .neq('id', 0);

    if (playerError) throw playerError;

    const { error: bidsError } = await supabase
      .from('bids')
      .delete()
      .neq('id', 0);

    if (bidsError) throw bidsError;

    const { error: teamsError } = await supabase
      .from('teams')
      .update({ purse_remaining: INITIAL_TEAM_BUDGET })
      .neq('id', 0);

    if (teamsError) throw teamsError;

    await supabase
      .from('auction_sessions')
      .update({ status: 'completed', ended_at: new Date().toISOString() })
      .in('status', ['active', 'paused']);

    return { ok: true };
  }
}

export const auctionEngine = new AuctionEngine();
