import express from 'express';
import { supabase } from '../services/supabaseClient.js';
import { authGuard, roleCheck } from '../middleware/auth.js';

const router = express.Router();

// Get all teams
router.get('/', async (req, res) => {
  const { data, error } = await supabase.from('teams').select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Get team by ID with squad
router.get('/:id', async (req, res) => {
  const { data: team, error: teamError } = await supabase.from('teams').select('*').eq('id', req.params.id).single();
  const { data: squad, error: squadError } = await supabase.from('team_players').select('*, players(*)').eq('team_id', req.params.id);
  
  if (teamError) return res.status(500).json({ error: teamError.message });
  res.json({ ...team, squad });
});

export default router;
