import React, { useEffect } from 'react';
import { usePlayerStore } from '../store/playerStore';
import PlayerCard from '../components/ui/PlayerCard';
import { motion } from 'framer-motion';

const CatalogPage = () => {
  const { players, loading, fetchPlayers, filters, setFilters } = usePlayerStore();

  useEffect(() => {
    fetchPlayers();
  }, []);

  const filteredPlayers = players.filter(p => {
    if (filters.role !== 'All' && p.role !== filters.role) return false;
    if (filters.status !== 'All' && p.status !== filters.status) return false;
    return true;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
        <div>
          <h1 className="text-5xl font-black text-white italic tracking-tighter uppercase mb-2">
            Player <span className="text-primary">Catalog</span>
          </h1>
          <p className="text-gray-400">Browse through the available talent for the 2026 Season</p>
        </div>
        
        <div className="flex gap-4">
          <select 
            value={filters.role}
            onChange={(e) => setFilters({ role: e.target.value })}
            className="input-field max-w-[200px]"
          >
            <option value="All">All Roles</option>
            <option value="Batsman">Batsman</option>
            <option value="Bowler">Bowler</option>
            <option value="All-Rounder">All-Rounder</option>
            <option value="Wicketkeeper">WK</option>
          </select>
        </div>
      </header>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="aspect-[4/6] bg-white/5 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <motion.div 
          layout
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8"
        >
          {filteredPlayers.map(player => (
            <PlayerCard key={player.id} player={player} status={player.status} />
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default CatalogPage;
