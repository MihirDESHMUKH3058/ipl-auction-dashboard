import express from 'express';
import { supabase } from '../services/supabaseClient.js';
import { authGuard, roleCheck } from '../middleware/auth.js';

const router = express.Router();

// Get all players
router.get('/', async (req, res) => {
  const { data, error } = await supabase.from('players').select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Create player (Admin only)
router.post('/', authGuard, roleCheck('admin'), async (req, res) => {
  const { data, error } = await supabase.from('players').insert(req.body).select();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data[0]);
});

export default router;
