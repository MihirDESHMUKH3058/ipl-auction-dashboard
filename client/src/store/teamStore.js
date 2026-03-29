import { create } from 'zustand';
import {
  dedupeById,
  INITIAL_TEAM_BUDGET,
  normalizeRole,
  TEAM_SQUAD_LIMIT
} from '../lib/auctionData';

const initialTeams = [
  { id: 1, name: 'Chennai Super Kings', shortName: 'CSK', logoURL: 'https://documents.iplt20.com/ipl/CSK/logos/Logooutline/CSKoutline.png', budget: INITIAL_TEAM_BUDGET, spent: 0, players: [], colors: { primary: '#FFFF00', secondary: '#00277f' } },
  { id: 2, name: 'Delhi Capitals', shortName: 'DC', logoURL: 'https://documents.iplt20.com/ipl/DC/Logos/LogoOutline/DCoutline.png', budget: INITIAL_TEAM_BUDGET, spent: 0, players: [], colors: { primary: '#00008B', secondary: '#FF0000' } },
  { id: 3, name: 'Gujarat Titans', shortName: 'GT', logoURL: 'https://documents.iplt20.com/ipl/GT/Logos/Logooutline/GToutline.png', budget: INITIAL_TEAM_BUDGET, spent: 0, players: [], colors: { primary: '#00274C', secondary: '#FFD700' } },
  { id: 4, name: 'Kolkata Knight Riders', shortName: 'KKR', logoURL: 'https://documents.iplt20.com/ipl/KKR/Logos/Logooutline/KKRoutline.png', budget: INITIAL_TEAM_BUDGET, spent: 0, players: [], colors: { primary: '#3A225D', secondary: '#B3A123' } },
  { id: 5, name: 'Lucknow Super Giants', shortName: 'LSG', logoURL: 'https://documents.iplt20.com/ipl/LSG/Logos/Logooutline/LSGoutline.png', budget: INITIAL_TEAM_BUDGET, spent: 0, players: [], colors: { primary: '#254AA5', secondary: '#FF822A' } },
  { id: 6, name: 'Mumbai Indians', shortName: 'MI', logoURL: 'https://documents.iplt20.com/ipl/MI/Logos/Logooutline/MIoutline.png', budget: INITIAL_TEAM_BUDGET, spent: 0, players: [], colors: { primary: '#004BA0', secondary: '#D1AB3E' } },
  { id: 7, name: 'Punjab Kings', shortName: 'PBKS', logoURL: 'https://documents.iplt20.com/ipl/PBKS/Logos/Logooutline/PBKSoutline.png', budget: INITIAL_TEAM_BUDGET, spent: 0, players: [], colors: { primary: '#D71920', secondary: '#E6BE8A' } },
  { id: 8, name: 'Rajasthan Royals', shortName: 'RR', logoURL: 'https://documents.iplt20.com/ipl/RR/Logos/Logooutline/RRoutline.png', budget: INITIAL_TEAM_BUDGET, spent: 0, players: [], colors: { primary: '#EA1B85', secondary: '#254AA5' } },
  { id: 9, name: 'Royal Challengers Bengaluru', shortName: 'RCB', logoURL: 'https://documents.iplt20.com/ipl/RCB/Logos/Logooutline/RCBoutline.png', budget: INITIAL_TEAM_BUDGET, spent: 0, players: [], colors: { primary: '#EC1C24', secondary: '#2B2A29' } },
  { id: 10, name: 'Sunrisers Hyderabad', shortName: 'SRH', logoURL: 'https://documents.iplt20.com/ipl/SRH/Logos/Logooutline/SRHoutline.png', budget: INITIAL_TEAM_BUDGET, spent: 0, players: [], colors: { primary: '#F26522', secondary: '#000000' } },
];

export const useTeamStore = create((set) => ({
  teams: initialTeams,
  loading: false,

  fetchTeams: async () => {
    set({ loading: true });
    try {
      // Use dynamic import for supabase to prevent initialization issues
      const { supabase } = await import('../supabaseClient');
      const { data, error } = await supabase.from('teams').select('*');
      
      if (!error && data && data.length > 0) {
        const { data: teamPlayers, error: tpError } = await supabase.from('team_players').select('*, players(*)');
        
        const enhancedTeams = data.map(team => {
          const budget = Number(team.budget || team.purse_total || INITIAL_TEAM_BUDGET);
          const linkedPlayers = tpError
            ? []
            : dedupeById((teamPlayers || []).filter(tp => String(tp.team_id) === String(team.id)));

          const players = linkedPlayers.map(tp => {
            const salePrice = Number(tp.final_price || tp.players?.sale_price || 0);
            return {
              id: tp.player_id || tp.players?.id,
              name: tp.players?.name || 'Unknown Player',
              role: normalizeRole(tp.players?.role),
              rating: tp.players?.rating || null,
              status: 'sold',
              sale_price: salePrice
            };
          });
          const spent = players.reduce((sum, player) => sum + Number(player.sale_price || 0), 0);

          const initialMatch = initialTeams.find(it => String(it.id) === String(team.id)) || {};
          return {
            ...initialMatch,
            ...team,
            shortName: team.short_name || team.shortName || initialMatch.shortName,
            logoURL: team.logo_url || team.logoURL || initialMatch.logoURL,
            budget,
            spent,
            purseRemaining: Math.max(0, budget - spent),
            spotsRemaining: Math.max(0, TEAM_SQUAD_LIMIT - players.length),
            squadLimit: TEAM_SQUAD_LIMIT,
            players
          };
        });
        set({ teams: enhancedTeams });
      } else {
        set({ teams: initialTeams });
      }
    } catch (err) {
      console.error('Error fetching teams:', err);
      set({ teams: initialTeams });
    } finally {
      set({ loading: false });
    }
  },

  updateTeamBudget: (teamId, playerPrice, playerRole) => {
    set((state) => ({
      teams: state.teams.map((team) => {
        if (String(team.id) === String(teamId)) {
          const nextSpent = team.spent + playerPrice;
          const nextPlayers = [...team.players, { name: 'Player Added', role: playerRole, sale_price: playerPrice }];
          return {
            ...team,
            spent: nextSpent,
            purseRemaining: Math.max(0, team.budget - nextSpent),
            spotsRemaining: Math.max(0, TEAM_SQUAD_LIMIT - nextPlayers.length),
            players: nextPlayers
          };
        }
        return team;
      }),
    }));
  },
}));
