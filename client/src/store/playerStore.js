import { create } from 'zustand';
import { supabase } from '../supabaseClient';

export const usePlayerStore = create((set) => ({
  players: [],
  loading: false,
  filters: {
    role: 'All',
    nationality: 'All',
    status: 'available'
  },

  setFilters: (filters) => set((state) => ({ filters: { ...state.filters, ...filters } })),
  
  fetchPlayers: async () => {
    set({ loading: true });
    const { data, error } = await supabase.from('players').select('*');
    if (!error) set({ players: data });
    set({ loading: false });
  }
}));
