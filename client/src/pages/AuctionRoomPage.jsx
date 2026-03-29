import React, { useState, useEffect } from 'react';
import { useAuctionStore } from '../store/auctionStore';
import { useTeamStore } from '../store/teamStore';
import { useAuthStore } from '../store/authStore';
import { socketClient } from '../lib/socketClient';
import { motion, AnimatePresence } from 'framer-motion';
import { TEAM_SQUAD_LIMIT } from '../lib/auctionData';

const AuctionRoomPage = () => {
  const { currentPlayer, bids, timer, status } = useAuctionStore();
  const { user, role, loading: authLoading } = useAuthStore();
  const { teams, loading: teamsLoading } = useTeamStore();

  const [lastBid, setLastBid] = useState(null);

  const [view, setView] = useState('podium'); // podium, draft

  useEffect(() => {
    setLastBid(bids && bids.length > 0 ? bids[0] : null);
  }, [bids]);

  // Find current team's data with robust null checking
  const currentTeam = user ? (teams.find(t => String(t.id) === String(user.id).replace('team-', '')) || { name: role === 'admin' ? 'Auction Admin' : 'Unknown Franchise', budget: 1000000000, spent: 0, players: [] }) : { name: 'Guest', budget: 1000000000, spent: 0, players: [] };


  if (authLoading || (teamsLoading && teams.length === 0)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-primary/20 rounded-full" />
          <div className="absolute top-0 w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
        <p className="mt-8 text-xs font-headline font-black uppercase tracking-widest text-primary animate-pulse tracking-[0.3em]">Synchronizing State...</p>
      </div>
    );
  }

  if (!currentPlayer) {
    return (
      <div className="container mx-auto px-4 lg:px-8 py-4 max-w-[1600px] h-full flex flex-col">
        {/* Top Info Bar (Simplified for Waiting State) */}
        <div className="flex justify-between items-center mb-8 px-6 py-4 glass-panel rounded-2xl border border-white/5">
          <div className="flex items-center gap-6">
            <div className="flex flex-col">
              <span className="text-[10px] font-headline font-black text-primary uppercase tracking-[0.2em]">Logged In As: {currentTeam.name}</span>
              <div className="flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-tertiary animate-pulse"></span>
                <span className="text-white font-headline font-black text-sm uppercase italic tracking-widest">{role === 'admin' ? 'Auctioneer Control' : currentTeam.shortName || 'Franchise'}</span>
              </div>

            </div>
          </div>
          <div className="flex h-10 w-10 rounded-full bg-surface-container border border-white/5 items-center justify-center text-primary shadow-lg shadow-primary/20">
            <span className="material-symbols-outlined text-xl">wifi_tethering</span>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
          <div className="relative">
            <div className="w-24 h-24 border-4 border-primary/20 rounded-full" />
            <div className="absolute top-0 w-24 h-24 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary scale-125">stadium</span>
            </div>
          </div>
          <h2 className="mt-8 text-2xl font-headline font-black uppercase italic tracking-widest text-primary animate-pulse">Waiting for the Auctioneer...</h2>
          <p className="mt-2 text-slate-500 font-label font-bold uppercase text-xs tracking-widest">Next set incoming shortly</p>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount) => {
    return (amount / 10000000).toFixed(2);
  };

  return (
    <div className="container mx-auto px-4 lg:px-8 py-4 max-w-[1600px] h-full flex flex-col">
      {/* Top Info Bar */}
      <div className="flex justify-between items-center mb-8 px-6 py-4 glass-panel rounded-2xl border border-white/5">
        <div className="flex items-center gap-6">
          <div className="flex flex-col">
            <span className="text-[10px] font-headline font-black text-primary uppercase tracking-[0.2em]">Logged In As: {currentTeam.name}</span>
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-tertiary animate-pulse"></span>
              <span className="text-white font-headline font-black text-sm uppercase italic tracking-widest">{role === 'admin' ? 'Auctioneer Control' : currentTeam.shortName || 'Franchise'}</span>
            </div>

          </div>
        </div>

        {/* View Toggles */}
        <div className="flex bg-surface-container-low p-1 rounded-xl border border-white/5">
          <button 
            onClick={() => setView('podium')}
            className={`px-6 py-2 rounded-lg font-headline font-bold text-[10px] uppercase tracking-widest transition-all ${view === 'podium' ? 'bg-primary text-on-primary shadow-lg' : 'text-slate-500 hover:text-white'}`}
          >
            Live Podium
          </button>
          <button 
            onClick={() => setView('draft')}
            className={`px-6 py-2 rounded-lg font-headline font-bold text-[10px] uppercase tracking-widest transition-all ${view === 'draft' ? 'bg-primary text-on-primary shadow-lg' : 'text-slate-500 hover:text-white'}`}
          >
            Draft Board
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Active Connection</p>
            <p className="text-[10px] font-headline font-black text-tertiary uppercase">Real-Time Sync: ON</p>
          </div>
          <div className="flex h-10 w-10 rounded-full bg-surface-container border border-white/5 items-center justify-center text-primary shadow-lg shadow-primary/20">
            <span className="material-symbols-outlined text-xl">wifi_tethering</span>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {view === 'podium' ? (
          <motion.div 
            key="podium"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid lg:grid-cols-12 gap-8 items-stretch flex-grow"
          >
            {/* Left: Player Spotlight */}
            <div className="lg:col-span-4 flex flex-col justify-center">
              <div className="bg-surface-container-highest rounded-2xl overflow-hidden shadow-2xl border border-white/5 stadium-glow">
                <div className="relative aspect-[4/5]">
                  <img 
                    className="w-full h-full object-cover object-top filter grayscale opacity-80" 
                    src={currentPlayer.image_url || 'https://lh3.googleusercontent.com/aida-public/AB6AXuBhJZp4U25g7hdrV3QbaEydgD2bLzaEMyyT0w7FUSME4ANlOuWRv8WCNaaFkZlwLBMZy9RdyjOwGIbgD0EB0cuHso-DnJsASYx294FtahV7OZrrXU89dZ1vDoTrdmfBBYr5RqW6-kax8R3NvFlU9l6dM2CDQqJK7O8WzX1Dq4nummADTKM1gakzygE2HHv4FjgsbOEg3QAdMWOk-op5SRRFvFvDUIPuCrOiEEM98EMHKq1OjgU006rmGJ-lFdzxEhOgSBhU4psRSJc'} 
                    alt={currentPlayer.name} 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-surface-container-highest via-transparent to-transparent" />
                  <div className="absolute top-4 left-4 bg-primary text-on-primary px-3 py-1 font-headline font-black uppercase text-xs tracking-widest italic">
                    {currentPlayer.role}
                  </div>
                </div>
                <div className="p-6">
                  <h2 className="font-headline font-black text-4xl uppercase italic tracking-tighter leading-none text-white mb-2">{currentPlayer.name}</h2>
                  <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest">
                    <span className="text-slate-500">Base Price</span>
                    <span className="text-tertiary">₹ {formatCurrency(currentPlayer.base_price)} Cr</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Middle: Bid Center & Podium */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center space-y-12">
              <div className="text-center w-full">
                <p className="text-xs font-headline font-bold text-slate-500 tracking-[0.4em] uppercase mb-4">Current Leading Bid</p>
                <div className="relative inline-block">
                  <motion.div
                    key={lastBid?.amount}
                    initial={{ scale: 1.2, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="absolute inset-0 bg-primary/20 blur-2xl rounded-full"
                  />
                  <motion.h3 
                    key={lastBid?.amount + '_text'}
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="font-data text-6xl sm:text-7xl md:text-8xl lg:text-9xl leading-none gold-gradient bg-clip-text text-transparent drop-shadow-[0_10px_30px_rgba(255,185,85,0.4)] relative z-10"
                  >
                    {formatCurrency(lastBid?.amount || currentPlayer.base_price)}
                    <span className="text-xl md:text-2xl lg:text-3xl font-headline font-black ml-4 text-on-surface">CR</span>
                  </motion.h3>
                </div>
              </div>

              <div className="relative w-64 h-64">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle className="text-white/5" cx="50" cy="50" fill="transparent" r="45" stroke="currentColor" strokeWidth="2" />
                  <motion.circle 
                    className="text-primary" 
                    cx="50" cy="50" fill="transparent" r="45" stroke="currentColor" strokeWidth="4" 
                    strokeDasharray="282.6"
                    animate={{ strokeDashoffset: (1 - timer/300) * 282.6 }}
                    transition={{ duration: 1, ease: "linear" }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-data text-8xl leading-none text-on-surface">
                    {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
                  </span>
                  <span className="font-label font-bold text-slate-500 uppercase tracking-widest text-[10px]">Time Remaining</span>
                </div>
              </div>

              {/* User Controls */}
              {role === 'team' && (
                <div className="flex justify-center w-full">

                  <div className="relative group">
                    <AnimatePresence>
                      {String(lastBid?.team_id) === String(currentTeam.id) && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute -top-12 left-1/2 -translate-x-1/2 bg-amber-500 text-black px-4 py-1 rounded-full font-headline font-black text-[10px] uppercase tracking-widest shadow-xl border-2 border-white/20 whitespace-nowrap z-20"
                        >
                          You Are Leading
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <button 
                      onClick={() => socketClient.placeBid(
                        currentPlayer.id, 
                        (lastBid?.amount || currentPlayer.base_price),
                        currentTeam.name,
                        currentTeam.id
                      )}
                      disabled={status !== 'active' || String(lastBid?.team_id) === String(currentTeam.id)}
                      className={`w-full max-w-md py-5 rounded-2xl font-headline font-black uppercase text-lg tracking-[0.2em] transition-all relative overflow-hidden shadow-2xl flex items-center justify-center gap-3 border border-white/10 ${
                        String(lastBid?.team_id) === String(currentTeam.id) 
                        ? 'bg-slate-900/50 text-slate-600 cursor-not-allowed grayscale' 
                        : 'bg-gradient-to-br from-amber-400 via-primary to-amber-600 text-on-primary hover:shadow-primary/40 hover:translate-y-[-2px] active:translate-y-[1px] active:scale-[0.98] ring-4 ring-primary/20'
                      } disabled:opacity-50 disabled:grayscale disabled:hover:scale-100 group`}
                    >
                      <span className="material-symbols-outlined text-xl group-hover:rotate-12 transition-transform">gavel</span>
                      {String(lastBid?.team_id) === String(currentTeam.id) ? 'CURRENTLY LEADING' : 'PLACE BID (+0.25 CR)'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Right: Leading Holder */}
            <div className="lg:col-span-3 flex flex-col justify-center">
              <div className="bg-surface-container rounded-3xl p-8 border border-white/5 shadow-2xl text-center space-y-6">
                <span className="font-headline font-bold text-slate-500 tracking-widest uppercase text-[10px] block">Bid Currently With</span>
                <div className="w-24 h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto stadium-glow">
                  <span className="material-symbols-outlined text-5xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>groups</span>
                </div>
                <h4 className="font-headline font-black text-lg md:text-xl lg:text-2xl uppercase tracking-tighter text-white truncate px-2">
                  {lastBid?.team_name || 'OPEN FOR BIDS'}
                </h4>
                <div className="pt-6 border-t border-white/5 space-y-3">
                  <div className="flex flex-col sm:flex-row justify-between items-center px-2 gap-1 text-center sm:text-left">
                    <span className="text-[8px] md:text-[10px] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">Purse Left</span>
                    <span className="font-data text-base md:text-lg lg:text-xl text-tertiary whitespace-nowrap">₹ {formatCurrency(currentTeam.budget - currentTeam.spent)} Cr</span>
                  </div>
                  <div className="flex flex-col sm:flex-row justify-between items-center px-2 gap-1 text-center sm:text-left">
                    <span className="text-[8px] md:text-[10px] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">Squad Strength</span>
                    <span className="font-data text-base md:text-lg lg:text-xl text-white whitespace-nowrap">
                      {currentTeam.players.length} / {TEAM_SQUAD_LIMIT}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row justify-between items-center px-2 gap-1 text-center sm:text-left">
                    <span className="text-[8px] md:text-[10px] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">Spots Remaining</span>
                    <span className="font-data text-base md:text-lg lg:text-xl text-primary whitespace-nowrap">
                      {Math.max(0, TEAM_SQUAD_LIMIT - currentTeam.players.length)} / {TEAM_SQUAD_LIMIT}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="draft"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto mb-10 pb-10"
          >
            {teams.filter(t => t.players.length > 0).map(team => (
              <div key={team.id} className="bg-surface-container rounded-3xl p-6 border border-white/5 shadow-xl hover:border-primary/20 transition-all">
                <div className="flex items-center gap-3 mb-4 border-b border-white/5 pb-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center font-headline font-black text-primary text-xs border border-primary/20">{team.shortName}</div>
                  <div>
                    <h4 className="text-sm font-headline font-black text-white uppercase truncate">{team.name}</h4>
                    <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">{team.players.length} Players</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {team.players.map(p => (
                    <div key={p.id} className="flex justify-between items-center bg-surface-container-low p-2 rounded-lg border border-white/5 text-[10px]">
                      <span className="font-bold text-slate-300 uppercase">
                        {p.name}
                        {p.rating ? ` (RT ${p.rating})` : ''}
                      </span>
                      <span className="font-data text-primary">₹{formatCurrency(p.sale_price)}Cr</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {teams.every(t => t.players.length === 0) && (
              <div className="col-span-full py-20 text-center">
                <span className="material-symbols-outlined text-4xl text-slate-700 mb-2">assignment_late</span>
                <p className="font-headline font-bold text-slate-600 uppercase tracking-widest">No players sold yet</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bid Ticker */}
      <div className="mt-auto bg-surface-container-lowest h-20 rounded-xl border border-white/5 flex items-stretch overflow-hidden">
        <div className="bg-primary px-6 flex items-center justify-center font-headline font-black uppercase text-xs tracking-widest italic text-on-primary">
          Bid Log
        </div>
        <div className="flex-grow flex items-center px-8 gap-8 overflow-x-auto no-scrollbar">
          <AnimatePresence>
            {bids.map((bid, i) => (
              <motion.div 
                key={bid.id || i}
                initial={{ opacity: 0, scale: 0.9, x: 20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                className="flex items-center gap-3 shrink-0 opacity-80"
              >
                <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center">
                  <span className="material-symbols-outlined text-xs text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>shield</span>
                </div>
                <div>
                  <div className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">{bid.team_name}</div>
                  <div className="font-data text-lg text-white">₹ {formatCurrency(bid.amount)} CR</div>
                </div>
                {i < bids.length - 1 && <span className="material-symbols-outlined text-white/10 text-sm">chevron_right</span>}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default AuctionRoomPage;
