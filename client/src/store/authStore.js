import { create } from 'zustand';
import { supabase } from '../supabaseClient';

export const useAuthStore = create((set) => ({
  user: null,
  role: null,
  isAuthenticated: false,
  loading: true,

  setUser: (user, role) => set({ user, role, isAuthenticated: !!user, loading: false }),
  
  login: async (identifier, password, type) => {
    set({ loading: true });
    try {
      if (type === 'admin') {
        if (identifier === 'admin' && password === 'admin123') {
          const mockUser = { id: 'admin-id', email: 'admin@auction.com' };
          set({ user: mockUser, role: 'admin', isAuthenticated: true, loading: false });
          return { success: true };
        }
      } else {
        // Team login with passcode
        if (password === 'ipl2026') {
          const mockUser = { id: `team-${identifier}`, email: `team${identifier}@auction.com` };
          set({ user: mockUser, role: 'team', isAuthenticated: true, loading: false });
          return { success: true };
        }
      }
      set({ loading: false });
      return { success: false, error: 'Invalid credentials' };
    } catch (err) {
      set({ loading: false });
      return { success: false, error: err.message };
    }
  },
  fetchProfile: async (userId) => {
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();
    set({ role: profile?.role || 'viewer' });
  },

  logout: async () => {
    // Supabase auth is not used in this app version
    set({ user: null, role: null, isAuthenticated: false });
  }
}));
