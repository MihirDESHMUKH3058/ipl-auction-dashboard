import React from 'react';
import { motion } from 'framer-motion';

const AdminTeamOverview = ({ teams, formatCurrency }) => {
  return (
    <div className="space-y-8 pb-24">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {teams.map((team) => (
          <motion.div 
            key={team.id} 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }}
            className="bg-surface-container rounded-[32px] p-8 border border-white/5 shadow-2xl space-y-6 relative overflow-hidden"
          >
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center font-headline font-black text-primary text-xl border border-white/10 shadow-lg">
                  {team.shortName}
                </div>
                <div>
                  <h4 className="font-headline font-black text-white uppercase italic leading-none truncate max-w-[150px]">{team.name}</h4>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Franchise Account</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-1">
                <span>Budget Spent: ₹{formatCurrency(team.spent)}Cr</span>
                <span>Limit: 100Cr</span>
              </div>
              <div className="h-3 w-full bg-surface-container-low rounded-full overflow-hidden border border-white/5 shadow-inner">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(team.spent / team.budget) * 100}%` }}
                  className="h-full bg-gradient-to-r from-primary to-amber-500 shadow-[0_0_12px_rgba(255,185,85,0.4)]" 
                />
              </div>
              <div className="flex justify-between text-xs font-data text-white px-1">
                <span className="text-tertiary">PURSE LEFT: ₹{formatCurrency(team.budget - team.spent)}Cr</span>
              </div>
            </div>

            <div className="pt-6 border-t border-white/5 grid grid-cols-2 gap-4">
              <div className="bg-surface-container-low p-3 rounded-2xl border border-white/5 text-center">
                <p className="text-[9px] font-bold text-slate-500 uppercase">Squad Count</p>
                <p className="font-data text-xl text-white">{team.players.length}</p>
              </div>
              <div className="bg-surface-container-low p-3 rounded-2xl border border-white/5 text-center">
                <p className="text-[9px] font-bold text-slate-500 uppercase">Spots Open</p>
                <p className="font-data text-xl text-primary">{25 - team.players.length}</p>
              </div>
            </div>

            <div className="space-y-2 max-h-[120px] overflow-y-auto no-scrollbar pt-2">
              <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest sticky top-0 bg-surface-container py-1">Recent Signings</p>
              {team.players.map((p, i) => (
                <div key={i} className="flex justify-between items-center bg-white/5 p-2 rounded-xl text-[10px]">
                  <span className="text-slate-300 font-bold uppercase truncate pr-4">{p.name || 'Anonymous Player'}</span>
                  <span className="font-data text-primary">₹{formatCurrency(p.sale_price)}Cr</span>
                </div>
              ))}
              {team.players.length === 0 && <p className="text-[8px] text-slate-700 uppercase italic py-2">Empty Roster</p>}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default AdminTeamOverview;
