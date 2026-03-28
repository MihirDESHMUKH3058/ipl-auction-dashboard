import { create } from 'zustand';

const initialTeams = [
  { id: 1, name: 'Chennai Super Kings', shortName: 'CSK', logoURL: 'https://documents.iplt20.com/ipl/CSK/logos/Logooutline/CSKoutline.png', budget: 1000000000, spent: 0, players: [], colors: { primary: '#FFFF00', secondary: '#00277f' } },
  { id: 2, name: 'Delhi Capitals', shortName: 'DC', logoURL: 'https://documents.iplt20.com/ipl/DC/Logos/LogoOutline/DCoutline.png', budget: 1000000000, spent: 0, players: [], colors: { primary: '#00008B', secondary: '#FF0000' } },
  { id: 3, name: 'Gujarat Titans', shortName: 'GT', logoURL: 'https://documents.iplt20.com/ipl/GT/Logos/Logooutline/GToutline.png', budget: 1000000000, spent: 0, players: [], colors: { primary: '#00274C', secondary: '#FFD700' } },
  { id: 4, name: 'Kolkata Knight Riders', shortName: 'KKR', logoURL: 'https://documents.iplt20.com/ipl/KKR/Logos/Logooutline/KKRoutline.png', budget: 1000000000, spent: 0, players: [], colors: { primary: '#3A225D', secondary: '#B3A123' } },
  { id: 5, name: 'Lucknow Super Giants', shortName: 'LSG', logoURL: 'https://documents.iplt20.com/ipl/LSG/Logos/Logooutline/LSGoutline.png', budget: 1000000000, spent: 0, players: [], colors: { primary: '#254AA5', secondary: '#FF822A' } },
  { id: 6, name: 'Mumbai Indians', shortName: 'MI', logoURL: 'https://documents.iplt20.com/ipl/MI/Logos/Logooutline/MIoutline.png', budget: 1000000000, spent: 0, players: [], colors: { primary: '#004BA0', secondary: '#D1AB3E' } },
  { id: 7, name: 'Punjab Kings', shortName: 'PBKS', logoURL: 'https://documents.iplt20.com/ipl/PBKS/Logos/Logooutline/PBKSoutline.png', budget: 1000000000, spent: 0, players: [], colors: { primary: '#D71920', secondary: '#E6BE8A' } },
  { id: 8, name: 'Rajasthan Royals', shortName: 'RR', logoURL: 'https://documents.iplt20.com/ipl/RR/Logos/Logooutline/RRoutline.png', budget: 1000000000, spent: 0, players: [], colors: { primary: '#EA1B85', secondary: '#254AA5' } },
  { id: 9, name: 'Royal Challengers Bengaluru', shortName: 'RCB', logoURL: 'https://documents.iplt20.com/ipl/RCB/Logos/Logooutline/RCBoutline.png', budget: 1000000000, spent: 0, players: [], colors: { primary: '#EC1C24', secondary: '#2B2A29' } },
  { id: 10, name: 'Sunrisers Hyderabad', shortName: 'SRH', logoURL: 'https://documents.iplt20.com/ipl/SRH/Logos/Logooutline/SRHoutline.png', budget: 1000000000, spent: 0, players: [], colors: { primary: '#F26522', secondary: '#000000' } },
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
        // Fetch players assigned to teams
        const { data: teamPlayers, error: tpError } = await supabase.from('team_players').select('*, players(*)');
        
        const enhancedTeams = data.map(team => {
          const tps = tpError ? [] : (teamPlayers || []).filter(tp => String(tp.team_id) === String(team.id));
          
          let spent = 0;
          const players = tps.map(tp => {
            spent += tp.final_price || tp.players?.sale_price || 0;
            return {
              name: tp.players?.name || 'Unknown Player',
              role: tp.players?.role || 'Unknown',
              sale_price: tp.final_price || tp.players?.sale_price || 0
            };
          });

          // Merge with initialTeams to ensure colors and logos are present
          const initialMatch = initialTeams.find(it => String(it.id) === String(team.id)) || {};
          return {
            budget: 1000000000,
            ...initialMatch,
            ...team,
            spent,
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
          return {
            ...team,
            spent: team.spent + playerPrice,
            players: [...team.players, { name: 'Player Added', role: playerRole, sale_price: playerPrice }]
          };
        }
        return team;
      }),
    }));
  },
}));
