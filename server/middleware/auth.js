import { supabase } from '../services/supabaseClient.js';

export const authGuard = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'No authorization header' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Fetch user role from public.users
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    req.user = { ...user, role: profile?.role || 'viewer' };
    next();
  } catch (err) {
    res.status(500).json({ error: 'Auth internal error' });
  }
};

export const roleCheck = (requiredRole) => {
  return (req, res, next) => {
    if (!req.user || req.user.role !== requiredRole && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied: Insufficient permissions' });
    }
    next();
  };
};
