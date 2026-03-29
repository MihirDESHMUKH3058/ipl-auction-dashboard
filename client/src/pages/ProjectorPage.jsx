import React, { useState, useEffect } from 'react';
import { useAuctionStore } from '../store/auctionStore';
import { useTeamStore } from '../store/teamStore';
import { motion, AnimatePresence } from 'framer-motion';
import { TEAM_SQUAD_LIMIT } from '../lib/auctionData';
import { useAuctionBootstrap } from '../hooks/useAuctionBootstrap';

const ProjectorPage = () => {
  const { currentPlayer, bids, timer } = useAuctionStore();
  const { teams } = useTeamStore();
  const [lastBid, setLastBid] = useState(null);
  useAuctionBootstrap();

  useEffect(() => {
    setLastBid(bids.length > 0 ? bids[0] : null);
  }, [bids]);

  const formatCurrency = (amount) => {
    return (amount / 10000000).toFixed(2);
  };

  const leadingTeam = teams.find(t => t.name === lastBid?.team_name) || {
    name: 'MUMBAI TITANS',
    shortName: 'MT',
    budget: 1000000000,
    spent: 577500000,
    players: Array(18).fill({}),
  };

  if (!currentPlayer) {
    return (
      <div className="h-screen w-screen bg-stadium flex items-center justify-center text-center">
        <div className="space-y-6">
          <div className="w-32 h-32 border-4 border-primary/20 rounded-full mx-auto relative">
            <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="material-symbols-outlined absolute inset-0 flex items-center justify-center text-4xl text-primary scale-150">stadium</span>
          </div>
          <h1 className="text-4xl font-headline font-black text-white uppercase italic tracking-widest animate-pulse">Waiting for the Next Player...</h1>
          <p className="text-slate-500 font-label font-bold uppercase tracking-[0.4em] text-sm">Official Broadcast Mode Active</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-stadium text-on-background font-body overflow-hidden flex flex-col relative">
      {/* Decorative Beams */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-1 bg-tertiary/20 h-full blur-3xl rotate-12"></div>
        <div className="absolute top-0 right-1/4 w-1 bg-tertiary/20 h-full blur-3xl -rotate-12"></div>
        <div className="fixed top-0 left-0 w-32 h-32 border-l-4 border-t-4 border-primary/20 m-6"></div>
        <div className="fixed top-0 right-0 w-32 h-32 border-r-4 border-t-4 border-primary/20 m-6"></div>
        <div className="fixed bottom-32 left-0 w-32 h-16 border-l-4 border-primary/20 m-6"></div>
        <div className="fixed bottom-32 right-0 w-32 h-16 border-r-4 border-primary/20 m-6"></div>
      </div>

      {/* Top Status Bar - Broadcast Style */}
      <header className="bg-blue-950/40 backdrop-blur-xl border-b border-white/10 shadow-[0_0_40px_rgba(0,218,243,0.1)] flex justify-between items-center px-12 h-20 w-full z-50">
        <div className="flex items-center gap-8">
          <span className="text-2xl font-black italic text-amber-400 tracking-tighter uppercase font-headline">GHRCEMN IPL AUCTION 2026</span>
          <div className="flex items-center gap-3">
            <span className="flex h-3 w-3 rounded-full bg-error animate-pulse shadow-[0_0_10px_#ff0000]"></span>
            <span className="font-headline font-bold uppercase tracking-widest text-on-surface text-lg">Live Broadcast Mode</span>
          </div>
        </div>
        <div className="flex items-center gap-12 font-condensed font-bold text-3xl uppercase tracking-tighter">
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-slate-400 font-label tracking-widest">LOT #42</span>
            <span className="text-on-surface">MARQUEE ALL-ROUNDERS</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-slate-400 font-label tracking-widest">SET STATUS</span>
            <span className="text-primary italic">14 PLAYERS REMAINING</span>
          </div>
        </div>
      </header>

      {/* Main Content: The Arena */}
      <main className="flex-1 flex items-center justify-center p-12 relative">
        <div className="grid grid-cols-12 gap-12 w-full max-w-[1700px] h-full items-center z-10">
          {/* Left: Player Spotlight */}
          <div className="col-span-4 h-full flex flex-col justify-center">
            <div className="relative group">
              <div className="absolute -top-16 -left-8 w-48 h-48 opacity-20 rotate-[-15deg] pointer-events-none">
                <span className="material-symbols-outlined text-[10rem] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>trophy</span>
              </div>
              <div className="bg-surface-container-highest rounded-2xl overflow-hidden stadium-glow border border-white/5 shadow-[0_0_60px_rgba(255,185,85,0.1)]">
                <div className="aspect-[4/5] relative">
                  <img 
                    className="w-full h-full object-cover object-top grayscale" 
                    src={currentPlayer.image_url || 'https://lh3.googleusercontent.com/aida-public/AB6AXuBhJZp4U25g7hdrV3QbaEydgD2bLzaEMyyT0w7FUSME4ANlOuWRv8WCNaaFkZlwLBMZy9RdyjOwGIbgD0EB0cuHso-DnJsASYx294FtahV7OZrrXU89dZ1vDoTrdmfBBYr5RqW6-kax8R3NvFlU9l6dM2CDQqJK7O8WzX1Dq4nummADTKM1gakzygE2HHv4FjgsbOEg3QAdMWOk-op5SRRFvFvDUIPuCrOiEEM98EMHKq1OjgU006rmGJ-lFdzxEhOgSBhU4psRSJc'} 
                    alt={currentPlayer.name} 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-surface-container-highest via-transparent to-transparent"></div>
                  <div className="absolute top-6 left-6 bg-primary text-on-primary px-5 py-2 font-headline font-black uppercase tracking-tighter text-2xl skew-x-[-10deg]">
                    <span className="skew-x-[10deg] inline-block">{currentPlayer.role}</span>
                  </div>
                </div>
                <div className="p-10 space-y-4">
                  <h1 className="font-headline font-black text-7xl uppercase tracking-tighter leading-none italic text-white drop-shadow-lg">{currentPlayer.name}</h1>
                  <div className="flex items-center gap-4">
                    <span className="font-label font-bold text-slate-400 tracking-widest uppercase text-sm">Base Price: ₹ {formatCurrency(currentPlayer.base_price)} Cr</span>
                    <span className="h-1.5 w-1.5 bg-slate-600 rounded-full"></span>
                    <span className="font-label font-bold text-tertiary uppercase text-sm tracking-widest">International Tier</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Center: The Bid & Timer */}
          <div className="col-span-5 flex flex-col items-center justify-center text-center space-y-16">
            <div className="space-y-6">
              <span className="font-headline font-bold text-slate-500 tracking-[0.4em] uppercase text-3xl">Current Leading Bid</span>
              <div className="relative">
                <motion.h2 
                  key={lastBid?.amount}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="font-data text-[15rem] leading-none gold-gradient bg-clip-text text-transparent drop-shadow-[0_10px_30px_rgba(255,185,85,0.4)] animate-bid"
                >
                  {formatCurrency(lastBid?.amount || currentPlayer.base_price)}
                  <span className="text-7xl font-headline font-black ml-6 text-on-surface">CR</span>
                </motion.h2>
              </div>
            </div>
            
            <div className="relative w-80 h-80">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle className="text-white/5" cx="50" cy="50" fill="transparent" r="45" stroke="currentColor" strokeWidth="2" />
                <motion.circle 
                  className="text-primary countdown-ring" 
                  cx="50" cy="50" fill="transparent" r="45" stroke="currentColor" strokeWidth="4" 
                  strokeDasharray="282.6"
                  animate={{ strokeDashoffset: (1 - timer/60) * 282.6 }}
                  transition={{ duration: 1, ease: "linear" }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-data text-[12rem] leading-none text-on-surface drop-shadow-lg">{timer}</span>
                <span className="font-label font-bold text-slate-500 uppercase tracking-[0.5em] text-sm mt-4">Seconds Remaining</span>
              </div>
            </div>
          </div>

          {/* Right: Leading Team */}
          <div className="col-span-3 flex flex-col items-center justify-center space-y-8">
            <div className="bg-surface-container rounded-3xl p-16 w-full text-center border border-white/5 shadow-[0_0_80px_rgba(0,0,0,0.4)] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full -mr-24 -mt-24 blur-3xl"></div>
              <span className="font-headline font-bold text-slate-500 tracking-[0.3em] uppercase text-sm block mb-12">Bid Held By</span>
              <div className="bg-white/10 rounded-full p-12 inline-block mb-10 stadium-glow border border-white/10 shadow-2xl">
                <span className="material-symbols-outlined text-[10rem] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>shield</span>
              </div>
              <h3 className="font-headline font-black text-6xl uppercase tracking-tighter text-white italic">{leadingTeam.name}</h3>
              <div className="mt-12 pt-12 border-t border-white/5 space-y-6">
                <div className="flex justify-between items-center px-4">
                  <span className="font-label text-slate-400 uppercase text-xs tracking-[0.2em] font-bold">Purse Remaining</span>
                  <span className="font-data text-4xl text-tertiary">₹ {formatCurrency(leadingTeam.budget - leadingTeam.spent)} CR</span>
                </div>
                <div className="flex justify-between items-center px-4">
                  <span className="font-label text-slate-400 uppercase text-xs tracking-[0.2em] font-bold">Squad Roster</span>
                  <span className="font-data text-4xl text-on-surface">{leadingTeam.players.length} / {TEAM_SQUAD_LIMIT}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Ticker: Last 5 Bids Feed */}
      <footer className="bg-surface-container-lowest h-36 w-full border-t border-white/10 flex items-stretch z-50">
        <div className="bg-primary text-on-primary w-80 flex items-center justify-center font-headline font-black uppercase italic tracking-tighter text-4xl px-12 text-center skew-x-[-15deg] -ml-8">
          <span className="skew-x-[15deg]">BID LOG</span>
        </div>
        <div className="flex-1 overflow-hidden flex items-center px-20 gap-16">
          <AnimatePresence>
            {bids.slice(0, 5).map((bid, i) => (
              <motion.div 
                key={bid.id || i}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1 - (i * 0.15), x: 0 }}
                className="flex items-center gap-8 shrink-0"
              >
                <div className="w-16 h-16 rounded-xl bg-surface-container-highest flex items-center justify-center shadow-lg">
                  <span className="material-symbols-outlined text-3xl text-slate-400" style={{ fontVariationSettings: "'FILL' 1" }}>shield</span>
                </div>
                <div>
                  <div className="font-label font-bold text-slate-500 text-xs uppercase tracking-widest mb-1">{bid.team_name}</div>
                  <div className="font-data text-4xl text-white">₹ {formatCurrency(bid.amount)} CR</div>
                </div>
                {i < 4 && <span className="material-symbols-outlined text-white/5 text-4xl">chevron_right</span>}
              </motion.div>
            ))}
          </AnimatePresence>
          
          <div className="ml-auto flex items-center gap-4 bg-tertiary/10 px-8 py-4 rounded-full border border-tertiary/20 animate-pulse">
            <span className="material-symbols-outlined text-tertiary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
            <span className="font-headline font-bold text-tertiary uppercase tracking-[0.2em] text-sm">Bidding War: Intense</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ProjectorPage;
