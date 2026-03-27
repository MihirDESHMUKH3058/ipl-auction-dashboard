import express from 'express';
import { supabase } from '../services/supabaseClient.js';
import { authGuard, roleCheck } from '../middleware/auth.js';
import { auctionEngine } from '../services/auctionEngine.js';

const router = express.Router();

// Get active session
router.get('/session', async (req, res) => {
  const { data, error } = await supabase.from('auction_sessions').select('*, players(*)').eq('status', 'active').single();
  res.json(data || { status: 'none' });
});

// Start auction for a player (Admin)
router.post('/start', authGuard, roleCheck('admin'), async (req, res) => {
  const { playerId } = req.body;
  const { data, error } = await supabase
    .from('auction_sessions')
    .insert({ current_player_id: playerId, status: 'active', started_at: new Date() })
    .select()
    .single();
  
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Mark Sold (Admin)
router.post('/sold', authGuard, roleCheck('admin'), async (req, res) => {
  const { playerId, teamId, amount } = req.body;
  try {
    const result = await auctionEngine.markSold(playerId, teamId, amount);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
