import React, { useState, useEffect } from 'react';
import { useTeamStore } from '../store/teamStore';
import { usePlayerStore } from '../store/playerStore';
import { motion } from 'framer-motion';

const LeaderboardPage = () => {
  const { teams } = useTeamStore();
  const { players } = usePlayerStore();
  const [countdown, setCountdown] = useState(42);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => (prev > 0 ? prev - 1 : 42));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const sortedTeams = [...teams].sort((a, b) => b.spent - a.spent);
  const mostExpensivePlayer = [...players]
    .filter(p => p.status === 'sold')
    .sort((a, b) => (b.sale_price || 0) - (a.sale_price || 0))[0] || {
      name: 'Virat Kohli',
      sale_price: 247500000,
      team_name: 'Royal Challengers Bangalore',
      image_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCzXvI0tO2XcDKDyLcOkAaf10X02c81tFxqhTLJWA1nMIjrTtVntwgn4XU7JHqyL4vl3wReDnsoanI2KPCxukBJztNcqXD86jCr67WPhtuZroZW1h5BcxIxQ_geKVwbIQIKCPTm5pRGV_dAHNdiX9X4fvQX5BGH_aagDN2atX10kTdyivFs9oEgdZzIQ6L4NnIMcKTh5KdYYTdxTPIsq4uUTt8bdHSpe2RW9Q9DiNeHI6PIPjOg-otZiGH4yJq6Qiav3t13Jl4NBH8'
    };

  const formatCurrency = (amount) => {
    return (amount / 10000000).toFixed(2);
  };

  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-8 h-full bg-grid-pattern overflow-x-hidden">
      {/* Header & Countdown Section */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-8">
        <div className="flex flex-col gap-2">
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-error-container text-error rounded-full text-xs font-bold tracking-widest uppercase">
            <span className="w-2 h-2 rounded-full bg-error animate-pulse"></span>
            Live Broadcast Mode
          </span>
          <h1 className="text-5xl md:text-7xl font-headline font-black uppercase tracking-tighter text-on-surface">
            Spend <span className="text-primary italic">Leaderboard</span>
          </h1>
          <p className="text-on-surface-variant max-w-xl text-lg">Real-time financial tracking of all franchises. Monitor remaining purses and total player acquisitions.</p>
        </div>

        <div className="glass-panel p-6 rounded-xl flex flex-col items-center min-w-[280px] shadow-2xl stadium-glow">
          <span className="text-[10px] font-headline font-bold uppercase tracking-[0.2em] text-tertiary mb-2">Next Player Reveal In</span>
          <div className="flex gap-4 items-baseline">
            <div className="flex flex-col items-center">
              <span className="text-5xl font-data text-white">00</span>
              <span className="text-[10px] uppercase font-bold text-slate-500">Min</span>
            </div>
            <span className="text-4xl font-data text-primary animate-pulse">:</span>
            <div className="flex flex-col items-center">
              <span className="text-5xl font-data text-white">{countdown}</span>
              <span className="text-[10px] uppercase font-bold text-slate-500">Sec</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bento Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Spend Rankings */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="bg-surface-container rounded-xl overflow-hidden shadow-2xl border border-white/5">
            <div className="px-8 py-6 border-b border-white/5 flex justify-between items-center bg-surface-container-low/50">
              <h2 className="font-headline font-bold uppercase tracking-widest text-primary flex items-center gap-2 text-sm italic">
                <span className="material-symbols-outlined text-primary">leaderboard</span>
                Franchise Spending Power
              </h2>
              <span className="text-[10px] font-bold text-slate-400 font-headline uppercase tracking-widest">Sorted by Total Spent</span>
            </div>
            <div className="p-8 flex flex-col gap-8">
              {sortedTeams.slice(0, 5).map((team, index) => {
                const spendPercentage = (team.spent / team.budget) * 100;

                return (
                  <div key={team.id} className="relative group">
                    <div className="flex justify-between items-end mb-3">
                      <div className="flex items-center gap-4">
                        <span className="text-3xl font-data text-slate-600">{(index + 1).toString().padStart(2, '0')}</span>
                        <div className="flex flex-col">
                          <span className="text-xl font-headline font-black text-white uppercase tracking-tight italic">{team.name}</span>
                          <span className="text-[10px] font-bold text-tertiary uppercase tracking-widest">{team.players.length} Players Signed</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-data text-primary">₹ {formatCurrency(team.spent)} Cr</span>
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Remaining: ₹ {formatCurrency(team.budget - team.spent)} Cr</div>
                      </div>
                    </div>
                    <div className="h-4 w-full bg-surface-container-low rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${spendPercentage}%` }}
                        className="h-full bg-gradient-to-r from-secondary-container to-primary rounded-full relative shadow-[0_0_15px_rgba(255,185,85,0.3)]"
                      >
                        <div className="absolute inset-0 bg-white/10 animate-pulse"></div>
                      </motion.div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Featured Cards */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Most Expensive Player Card */}
          <div className="bg-surface-container-highest rounded-xl overflow-hidden relative min-h-[400px] flex flex-col justify-end p-8 border border-primary/20 shadow-2xl">
            <div className="absolute top-0 right-0 p-4">
              <div className="bg-primary text-on-primary text-[10px] font-black uppercase px-3 py-1 rounded tracking-tighter shadow-lg transform rotate-12 italic">
                Marquee Buy
              </div>
            </div>
            <img 
              className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-luminosity filter grayscale group-hover:grayscale-0 transition-all duration-1000" 
              src={mostExpensivePlayer.image_url} 
              alt={mostExpensivePlayer.name}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-surface-container-highest via-surface-container-highest/60 to-transparent"></div>
            <div className="relative z-10">
              <span className="text-tertiary font-headline font-bold uppercase text-[10px] tracking-widest mb-2 block italic">Highest Auction Bid</span>
              <h3 className="text-4xl font-headline font-black text-white uppercase leading-none mb-1 italic">{mostExpensivePlayer.name}</h3>
              <p className="text-on-surface-variant font-bold uppercase text-xs mb-6 tracking-wide italic">{mostExpensivePlayer.team_name}</p>
              <div className="bg-primary/10 border-l-4 border-primary p-4 rounded-r-lg">
                <span className="text-[10px] text-primary font-bold uppercase tracking-widest block mb-1">Final Sale Price</span>
                <span className="text-4xl font-data text-primary text-glow-gold">₹ {formatCurrency(mostExpensivePlayer.sale_price)} Cr</span>
              </div>
            </div>
          </div>

          {/* Live Ticker Style Card */}
          <div className="bg-surface-bright p-6 rounded-xl border border-white/10 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <span className="material-symbols-outlined text-tertiary">history</span>
              <span className="font-headline font-bold uppercase text-[10px] tracking-tighter italic">Recent Bidding War</span>
            </div>
            <div className="flex flex-col gap-4">
              {[
                { name: 'Mitchell Starc', price: 22.50 },
                { name: 'Pat Cummins', price: 20.50 },
                { name: 'Daryl Mitchell', price: 14.00 }
              ].map(bid => (
                <div key={bid.name} className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-slate-300 text-xs font-bold uppercase">{bid.name}</span>
                  <span className="font-data text-xl text-primary">₹ {bid.price.toFixed(2)} Cr</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Marquee Ticker */}
      <div className="mt-12 overflow-hidden bg-surface-bright py-4 rounded-full border border-white/5 shadow-inner">
        <div className="flex whitespace-nowrap gap-12 items-center px-4 animate-marquee">
          <span className="flex items-center gap-2 text-[10px] font-bold font-headline uppercase text-tertiary">
            <span className="w-2 h-2 rounded-full bg-tertiary shadow-[0_0_8px_#00daf3]"></span>
            Live Feed
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wide text-slate-300">CSK wins bid for Rachin Ravindra at ₹1.8 Cr</span>
          <span className="text-slate-600 text-xs">/</span>
          <span className="text-[10px] font-bold uppercase tracking-wide text-slate-300">SRH Purse Remaining: ₹32.4 Cr</span>
          <span className="text-slate-600 text-xs">/</span>
          <span className="text-[10px] font-bold uppercase tracking-wide text-slate-300">Next Set: Spinners starting in 5 mins</span>
          <span className="text-slate-600 text-xs">/</span>
          <span className="text-[10px] font-bold uppercase tracking-wide text-slate-300">Trade Window Closing Soon</span>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;
