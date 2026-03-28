import React, { useState, useEffect, useMemo } from 'react';
import { usePlayerStore } from '../store/playerStore';
import { useAuctionStore } from '../store/auctionStore';
import { motion, AnimatePresence } from 'framer-motion';

const PlayerAnalyticsModal = ({ player, isOpen, onClose }) => {
  if (!isOpen || !player) return null;

  const stats = player.stats || {};
  const isBowler = player.role === 'Bowler';
  const isAllRounder = player.role === 'All-Rounder';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-background/80 backdrop-blur-xl"
      />
      
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative w-full max-w-4xl bg-surface-container rounded-3xl border border-white/10 shadow-[0_0_80px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col md:flex-row"
      >
        {/* Left: Player Visual */}
        <div className="w-full md:w-2/5 aspect-square md:aspect-auto bg-[#00175e] relative overflow-hidden group">
          <img 
            src={player.image_url || 'https://lh3.googleusercontent.com/aida-public/AB6AXuCzXvI0tO2XcDKDyLcOkAaf10X02c81tFxqhTLJWA1nMIjrTtVntwgn4XU7JHqyL4vl3wReDnsoanI2KPCxukBJztNcqXD86jCr67WPhtuZroZW1h5BcxIxQ_geKVwbIQIKCPTm5pRGV_dAHNdiX9X4fvQX5BGH_aagDN2atX10kTdyivFs9oEgdZzIQ6L4NnIMcKTh5KdYYTdxTPIsq4uUTt8bdHSpe2RW9Q9DiNeHI6PIPjOg-otZiGH4yJq6Qiav3t13Jl4NBH8'} 
            alt={player.name}
            className="w-full h-full object-cover object-top filter grayscale-[0.2] group-hover:grayscale-0 transition-all duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#00175e] via-transparent to-transparent" />
          <div className="absolute bottom-8 left-8 right-8">
            <h2 className="text-4xl font-headline font-black text-white leading-none uppercase italic mb-2">{player.name}</h2>
            <div className="flex gap-2">
              <span className="px-3 py-1 bg-primary text-on-primary rounded-full text-[10px] font-black uppercase tracking-widest">{player.role}</span>
              <span className="px-3 py-1 bg-white/10 text-white rounded-full text-[10px] font-bold uppercase tracking-widest border border-white/10">{player.country}</span>
            </div>
          </div>
        </div>

        {/* Right: Detailed Stats */}
        <div className="flex-1 p-8 md:p-12 overflow-y-auto max-h-[80vh]">
          <div className="flex justify-between items-start mb-10">
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] mb-1">Career Analytics</p>
              <h3 className="text-2xl font-headline font-black text-white uppercase italic">Performance Metrics</h3>
            </div>
            <button onClick={onClose} className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-slate-400 hover:text-white transition-colors border border-white/5">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
            <div className="bg-surface-container-low p-6 rounded-2xl border border-white/5 shadow-xl group hover:border-primary/30 transition-all">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Matches</p>
              <p className="text-3xl font-data text-white">{stats.matches}</p>
            </div>
            <div className="bg-surface-container-low p-6 rounded-2xl border border-white/5 shadow-xl group hover:border-primary/30 transition-all">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">{isBowler ? 'Wickets' : 'Runs'}</p>
              <p className="text-3xl font-data text-primary">{isBowler ? stats.wickets : stats.runs}</p>
            </div>
            <div className="bg-surface-container-low p-6 rounded-2xl border border-white/5 shadow-xl group hover:border-primary/30 transition-all">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Average</p>
              <p className="text-3xl font-data text-white">{stats.avg}</p>
            </div>
            <div className="bg-surface-container-low p-6 rounded-2xl border border-white/5 shadow-xl group hover:border-primary/30 transition-all">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Strike Rate</p>
              <p className="text-3xl font-data text-white">{stats.strikeRate}</p>
            </div>
            {(isBowler || isAllRounder) && (
              <div className="bg-surface-container-low p-6 rounded-2xl border border-white/5 shadow-xl group hover:border-primary/30 transition-all">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Economy</p>
                <p className="text-3xl font-data text-white">{stats.economy}</p>
              </div>
            )}
            {(isBowler || isAllRounder) && (
              <div className="bg-surface-container-low p-6 rounded-2xl border border-white/5 shadow-xl group hover:border-primary/30 transition-all">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Best Fig.</p>
                <p className="text-3xl font-data text-white">{stats.best}</p>
              </div>
            )}
          </div>

          <div className="bg-primary/5 p-6 rounded-2xl border border-primary/20">
            <h4 className="flex items-center gap-2 text-[10px] font-black uppercase text-primary tracking-widest mb-4">
              <span className="material-symbols-outlined text-sm">auto_awesome</span> Scouting Report
            </h4>
            <p className="text-slate-300 text-sm leading-relaxed">
              Highly impactful {player.role} with a rating of {player.rating}/10. Demonstrates exceptional consistency in high-pressure situations. Predicted to be a key asset for any franchise seeking a stable {player.role.toLowerCase()} who can anchor the {isBowler ? 'bowling attack' : 'batting lineup'}.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const CatalogPage = () => {
  const { players, loading, fetchPlayers } = usePlayerStore();
  const { currentPlayer } = useAuctionStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeRole, setActiveRole] = useState('All');
  const [sortBy, setSortBy] = useState('Base Price (High to Low)');
  const [analyticsPlayer, setAnalyticsPlayer] = useState(null);

  useEffect(() => {
    fetchPlayers();
  }, []);

  const filteredPlayers = useMemo(() => {
    let result = players.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            p.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            p.country?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = activeRole === 'All' || p.role === activeRole;
      return matchesSearch && matchesRole;
    });

    if (sortBy === 'Base Price (High to Low)') {
      result.sort((a, b) => b.base_price - a.base_price);
    } else if (sortBy === 'Base Price (Low to High)') {
      result.sort((a, b) => a.base_price - b.base_price);
    } else {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [players, searchTerm, activeRole, sortBy]);

  const formatCurrency = (amount) => {
    return (amount / 10000000).toFixed(2);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
      {/* Analytics Modal */}
      <AnimatePresence>
        {analyticsPlayer && (
          <PlayerAnalyticsModal 
            player={analyticsPlayer} 
            isOpen={!!analyticsPlayer} 
            onClose={() => setAnalyticsPlayer(null)} 
          />
        )}
      </AnimatePresence>

      {/* Header & Stats Ticker */}
      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <span className="font-display text-primary uppercase tracking-[0.2em] text-sm font-bold block mb-2">Auction Pool 2026</span>
          <h1 className="font-headline font-black text-5xl md:text-7xl italic uppercase tracking-tighter leading-none text-white">
            Player <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-white">Catalogue</span>
          </h1>
        </div>
        <div className="flex gap-4">
          <div className="bg-surface-container p-4 rounded-xl border-l-4 border-tertiary shadow-lg min-w-[140px]">
            <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-1">Total Pool</p>
            <p className="font-data text-3xl leading-none text-white">{players.length} Players</p>
          </div>
          <div className="bg-surface-container p-4 rounded-xl border-l-4 border-primary shadow-lg min-w-[140px]">
            <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-1">Live At Podium</p>
            <p className="font-data text-3xl leading-none text-white">{currentPlayer ? '1 ACTIVE' : 'NONE'}</p>
          </div>
        </div>
      </header>

      {/* Search & Filter Bar */}
      <section className="mb-10 glass-panel p-4 rounded-2xl flex flex-col lg:flex-row gap-6 items-center sticky top-20 z-40 shadow-2xl">
        <div className="relative w-full lg:w-96">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">search</span>
          <input 
            type="text"
            placeholder="Search by name, role or country..."
            className="w-full bg-surface-container-low border-none rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-slate-600 focus:ring-1 focus:ring-primary/50 transition-all text-sm outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2 w-full lg:w-auto">
          {['All', 'Batsman', 'Bowler', 'All-Rounder', 'Wicket-Keeper'].map(role => (
            <button 
              key={role}
              onClick={() => setActiveRole(role)}
              className={`px-5 py-2.5 rounded-xl font-headline font-bold text-[10px] uppercase tracking-wider transition-all shadow-md ${activeRole === role ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-slate-400 hover:bg-surface-variant'}`}
            >
              {role === 'Wicket-Keeper' ? 'WK' : role}
            </button>
          ))}
        </div>
        <div className="lg:ml-auto flex items-center gap-3">
          <span className="text-[10px] font-bold text-slate-500 uppercase">Sort By:</span>
          <select 
            className="bg-transparent border-none text-primary font-headline font-bold text-xs focus:ring-0 p-0 cursor-pointer uppercase tracking-tighter outline-none"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option className="bg-surface-container">Base Price (High to Low)</option>
            <option className="bg-surface-container">Base Price (Low to High)</option>
            <option className="bg-surface-container">Alphabetical</option>
          </select>
        </div>
      </section>

      {/* Player Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="aspect-[3/4] bg-surface-container-highest rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence>
            {filteredPlayers.map(player => {
              const isAtPodium = currentPlayer?.id === player.id;
              const isSold = player.status === 'sold';
              const isUnsold = player.status === 'unsold';
              const stats = player.stats || {};

              return (
                <motion.div 
                  layout
                  key={player.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className={`group relative bg-surface-container-highest rounded-2xl overflow-hidden shadow-xl border border-white/5 transition-all duration-500 ${isAtPodium ? 'at-podium-glow -translate-y-2' : 'hover:-translate-y-1'} ${isSold ? 'opacity-90' : ''} ${isUnsold ? 'grayscale brightness-75' : ''}`}
                >
                  {/* Status Badges */}
                  <div className="absolute top-4 right-4 z-20">
                    {isAtPodium && (
                      <span className="flex items-center gap-1.5 px-3 py-1 bg-primary text-on-primary rounded-full text-[8px] font-black uppercase tracking-widest animate-pulse">
                        <span className="w-1.5 h-1.5 bg-on-primary rounded-full"></span> AT PODIUM
                      </span>
                    )}
                    {isUnsold && (
                      <span className="px-3 py-1 bg-slate-700 text-white rounded-full text-[8px] font-black uppercase tracking-widest">
                        UNSOLD
                      </span>
                    )}
                  </div>

                  {/* SOLD Stamp */}
                  {isSold && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
                      <div className="sold-stamp px-6 py-2 text-4xl font-black uppercase tracking-tighter mix-blend-screen opacity-80 border-4">SOLD</div>
                    </div>
                  )}

                  {/* Player Image */}
                  <div className={`h-64 overflow-hidden relative ${isSold || isUnsold ? 'grayscale' : ''}`}>
                    <img 
                      className="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-700" 
                      src={player.image_url || 'https://lh3.googleusercontent.com/aida-public/AB6AXuCzXvI0tO2XcDKDyLcOkAaf10X02c81tFxqhTLJWA1nMIjrTtVntwgn4XU7JHqyL4vl3wReDnsoanI2KPCxukBJztNcqXD86jCr67WPhtuZroZW1h5BcxIxQ_geKVwbIQIKCPTm5pRGV_dAHNdiX9X4fvQX5BGH_aagDN2atX10kTdyivFs9oEgdZzIQ6L4NnIMcKTh5KdYYTdxTPIsq4uUTt8bdHSpe2RW9Q9DiNeHI6PIPjOg-otZiGH4yJq6Qiav3t13Jl4NBH8'} 
                      alt={player.name} 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-surface-container-highest via-transparent to-transparent" />
                    <div className="absolute bottom-4 left-4">
                      <span className="text-[10px] font-bold text-tertiary uppercase tracking-widest">Base Price: ₹ {formatCurrency(player.base_price)} CR</span>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="overflow-hidden">
                        <h3 className="font-headline font-black text-xl uppercase italic leading-none text-white truncate">{player.name}</h3>
                        <p className="text-[10px] font-medium text-slate-500 mt-1 uppercase tracking-widest truncate">{player.country || 'International'} • {player.role}</p>
                      </div>
                    </div>

                    {isSold ? (
                      <div className="flex items-center gap-2 mt-4 p-3 bg-tertiary/10 rounded-xl border border-tertiary/20">
                        <span className="material-symbols-outlined text-tertiary text-sm">handshake</span>
                        <div className="overflow-hidden">
                          <span className="block text-[8px] font-bold text-tertiary uppercase tracking-widest truncate">Bought by {player.team_name}</span>
                          <span className="block text-[10px] font-data text-white">₹ {formatCurrency(player.sale_price)} CR</span>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2 mt-4">
                        <div className="bg-surface-container-low p-2 rounded-lg border border-white/5">
                          <span className="block text-[8px] font-bold text-slate-500 uppercase">Matches</span>
                          <span className="font-data text-xl text-white">{stats.matches}</span>
                        </div>
                        <div className="bg-surface-container-low p-2 rounded-lg border border-white/5">
                          <span className="block text-[8px] font-bold text-slate-500 uppercase">S/R</span>
                          <span className="font-data text-xl text-white">{stats.strikeRate}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {!isSold && !isUnsold && (
                    <div className="px-6 pb-6">
                      <button 
                        onClick={() => setAnalyticsPlayer(player)}
                        className={`w-full py-3 font-headline font-black uppercase italic tracking-tighter rounded-lg shadow-lg transition-all ${isAtPodium ? 'bg-gradient-to-r from-primary to-on-primary-container text-on-primary shadow-primary/20 hover:scale-[1.02] active:scale-95' : 'border-2 border-primary/30 text-primary hover:bg-primary hover:text-on-primary'}`}
                      >
                        {isAtPodium ? 'Place Live Bid' : 'View Analytics'}
                      </button>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default CatalogPage;
