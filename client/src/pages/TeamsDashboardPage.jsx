import React, { useEffect } from 'react';
import { useTeamStore } from '../store/teamStore';
import { motion } from 'framer-motion';

const TeamsDashboardPage = () => {
  const { teams, loading, fetchTeams } = useTeamStore();

  useEffect(() => {
    fetchTeams();
  }, []);

  const totalPurse = teams.length * 1000000000;
  const totalSpent = teams.reduce((acc, team) => acc + team.spent, 0);
  const remainingPurse = totalPurse - totalSpent;

  const formatCurrency = (amount) => {
    return (amount / 10000000).toFixed(2);
  };

  const getRoleCount = (teamPlayers, role) => {
    return teamPlayers.filter(p => p.role === role).length || 0;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
      {/* Header & Global Stats */}
      <header className="mb-12 flex flex-col md:flex-row justify-between items-end gap-8">
        <div className="flex flex-col gap-2">
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-error-container text-error rounded-full text-xs font-bold tracking-widest uppercase">
            <span className="w-2 h-2 rounded-full bg-error animate-pulse"></span>
            Broadcast Mode Active
          </span>
          <h1 className="text-5xl md:text-7xl font-headline font-black uppercase tracking-tighter text-white">
            Spend <span className="text-primary italic">Leaderboard</span>
          </h1>
          <p className="text-slate-500 max-w-xl text-lg opacity-80">Real-time financial tracking of all franchises. Monitor remaining purses and total player acquisitions.</p>
        </div>

        <div className="flex gap-4">
          <div className="bg-surface-container p-6 rounded-2xl border-l-4 border-tertiary shadow-xl min-w-[200px]">
            <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-1">Total Spent</p>
            <p className="font-data text-4xl leading-none text-white">₹ {formatCurrency(totalSpent)} <span className="text-sm">CR</span></p>
          </div>
          <div className="bg-surface-container p-6 rounded-2xl border-l-4 border-primary shadow-xl min-w-[200px]">
            <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-1">Available Pool</p>
            <p className="font-data text-4xl leading-none text-white">₹ {formatCurrency(remainingPurse)} <span className="text-sm">CR</span></p>
          </div>
        </div>
      </header>

      {/* Team Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {[...teams].sort((a,b) => b.spent - a.spent).map((team, index) => {
          const spendPercentage = (team.spent / team.budget) * 100;
          
          return (
            <motion.div 
              key={team.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-surface-container rounded-2xl overflow-hidden border border-white/5 shadow-2xl group hover:border-primary/20 transition-all"
            >
              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    <span className="text-3xl font-data text-slate-600">{(index + 1).toString().padStart(2, '0')}</span>
                    <div className="flex flex-col">
                      <span className="text-xl font-headline font-black text-white uppercase tracking-tight">{team.name}</span>
                      <span className="text-[10px] font-bold text-tertiary uppercase tracking-widest">{team.players.length} Players Signed</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center border border-white/5">
                    <span className="text-primary font-black text-xs">{team.shortName}</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2 mb-8">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Purse Utilization</span>
                    <span className="font-data text-2xl text-primary">₹ {formatCurrency(team.spent)} Cr</span>
                  </div>
                  <div className="h-3 w-full bg-surface-container-low rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${spendPercentage}%` }}
                      className="h-full bg-gradient-to-r from-secondary-container to-primary rounded-full shadow-[0_0_15px_rgba(255,185,85,0.3)]"
                    />
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-slate-600 uppercase">Remaining: ₹ {formatCurrency(team.budget - team.spent)} Cr</span>
                  </div>
                </div>

                {/* Role Breakdown */}
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: 'BAT', icon: '🏏', count: getRoleCount(team.players, 'Batsman') },
                    { label: 'BOWL', icon: '⚾', count: getRoleCount(team.players, 'Bowler') },
                    { label: 'AR', icon: '⚡', count: getRoleCount(team.players, 'All-Rounder') },
                    { label: 'WK', icon: '🧤', count: getRoleCount(team.players, 'Wicketkeeper') }
                  ].map(role => (
                    <div key={role.label} className="bg-surface-container-low p-2 rounded-xl border border-white/5 flex flex-col items-center">
                      <span className="text-[8px] font-bold text-slate-500 uppercase mb-1">{role.label}</span>
                      <span className="font-data text-xl text-white leading-none">{role.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Marquee Ticker */}
      <div className="mt-12 overflow-hidden bg-surface-bright py-4 rounded-3xl border border-white/5 shadow-inner">
        <div className="flex animate-marquee whitespace-nowrap gap-12 items-center px-4">
          <span className="flex items-center gap-2 text-xs font-bold font-headline uppercase text-tertiary">
            <span className="w-2 h-2 rounded-full bg-tertiary shadow-[0_0_8px_#00daf3]"></span>
            Live Market Feed
          </span>
          <span className="text-xs font-bold uppercase tracking-wide text-slate-300">Mumbai Indians wins bid for Virat Kohli at ₹ 21.5 Cr</span>
          <span className="text-slate-600">/</span>
          <span className="text-xs font-bold uppercase tracking-wide text-slate-300">CSK Purse Remaining: ₹ 32.4 Cr</span>
          <span className="text-slate-600">/</span>
          <span className="text-xs font-bold uppercase tracking-wide text-slate-300">Next set opening in 5 mins</span>
        </div>
      </div>
    </div>
  );
};

export default TeamsDashboardPage;
