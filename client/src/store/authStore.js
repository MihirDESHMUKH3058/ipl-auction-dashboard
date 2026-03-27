import { create } from 'zustand';
import { supabase } from '../supabaseClient';

export const useAuthStore = create((set) => ({
  user: null,
  role: null,
  isAuthenticated: false,
  loading: true,

  setUser: (user, role) => set({ user, role, isAuthenticated: !!user, loading: false }),
  
  fetchProfile: async (userId) => {
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();
    set({ role: profile?.role || 'viewer' });
  },

  logout: async () => {
    await supabase.auth.signOut();
    set({ user: null, role: null, isAuthenticated: false });
  }
}));
