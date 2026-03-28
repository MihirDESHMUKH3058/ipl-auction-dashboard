import { create } from 'zustand';
import { supabase } from '../supabaseClient';

const generateMockStats = (player) => {
  const rating = player.rating || 8;
  const isBowler = player.role === 'Bowler';
  const isAllRounder = player.role === 'All-Rounder';
  const isWK = player.role === 'Wicket-Keeper';
  
  return {
    matches: Math.floor(Math.random() * 50) + (rating * 15),
    runs: isBowler ? Math.floor(Math.random() * 200) : Math.floor(Math.random() * 2000) + (rating * 400),
    wickets: isBowler || isAllRounder ? Math.floor(Math.random() * 50) + (rating * 12) : Math.floor(Math.random() * 5),
    avg: isBowler ? (Math.random() * 10 + 20).toFixed(2) : (Math.random() * 15 + 35).toFixed(2),
    strikeRate: isBowler ? (Math.random() * 5 + 15).toFixed(2) : (Math.random() * 20 + 130).toFixed(2),
    economy: isBowler || isAllRounder ? (Math.random() * 2 + 7).toFixed(2) : 'N/A',
    best: isBowler ? `${Math.floor(Math.random()*4+2)}/${Math.floor(Math.random()*20+10)}` : 'N/A'
  };
};

export const usePlayerStore = create((set) => ({
  players: [],
  loading: false,
  filters: {
    role: 'All',
    nationality: 'All',
    status: 'available'
  },

  setFilters: (filters) => set((state) => ({ filters: { ...state.filters, ...filters } })),
  
  updatePlayerStatus: (playerId, status, teamName = null, salePrice = null) => {
    set((state) => ({
      players: state.players.map(p => 
        p.id === playerId ? { ...p, status, team_name: teamName, sale_price: salePrice } : p
      )
    }));
  },

  addPlayer: (newPlayer) => {
    const playerWithDefaults = {
      ...newPlayer,
      status: 'hidden',
    };
    import('../lib/socketClient').then(m => m.socketClient.addPlayer(playerWithDefaults));
  },

  updatePlayer: (playerId, updates) => {
    import('../lib/socketClient').then(m => m.socketClient.updatePlayer(playerId, updates));
  },

  deletePlayer: (playerId) => {
    import('../lib/socketClient').then(m => m.socketClient.deletePlayer(playerId));
  },

  generateRandomBag: (count = 10) => {
    import('../lib/socketClient').then(m => m.socketClient.generateBag(count));
  },

  resetSession: () => {
    import('../lib/socketClient').then(m => m.socketClient.resetSession());
  },
  
  fetchPlayers: async () => {
    const state = set; // Need get for proper loading check, but we can't cleanly access it without get(). So we'll skip the check or add get.
    // Instead of using get(), let's just update the DB status handling.
    set({ loading: true });
    try {
      const { data, error } = await supabase.from('players').select('*');
      
      let playersData = [];
      if (!error && data && data.length > 0) {
        playersData = data;
      } else {
        console.warn('Supabase fetch failed or empty, falling back to local JSON');
        const response = await fetch('/players.json');
        const localData = await response.json();
        playersData = localData.map(p => ({
          ...p,
          image_url: p.image_url || (p.image_file ? `/players/${p.image_file}` : null),
          base_price: p.basePrice ? parseInt(p.basePrice.replace(/[^\d]/g, '')) : p.base_price,
          status: p.status?.toLowerCase() || 'available'
        }));
      }

      // Assign batches (11 players per batch) and respect DB status
      const enhancedPlayers = playersData.map((p, index) => {
        const batch = Math.floor(index / 11) + 1;
        
        return {
          ...p,
          batch,
          status: p.status || 'available',
          stats: p.stats || generateMockStats(p)
        };
      });
      
      set({ players: enhancedPlayers });
    } catch (err) {
      console.error('Error fetching players:', err);
    } finally {
      set({ loading: false });
    }
  }
}));
