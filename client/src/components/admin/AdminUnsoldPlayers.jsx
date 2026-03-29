import React from 'react';
import { motion } from 'framer-motion';

const AdminUnsoldPlayers = ({ players, formatCurrency, onRevert }) => {
  const unsoldPlayers = players.filter(p => p.status === 'unsold');

  return (
    <div className="space-y-6 pb-24">
      <div className="bg-surface-container rounded-[32px] p-8 border border-white/5 shadow-2xl">
        <h2 className="text-2xl font-headline font-black uppercase text-error mb-6 flex items-center gap-3">
          <span className="material-symbols-outlined">block</span>
          Unsold Players Repo
        </h2>
        
        {unsoldPlayers.length === 0 ? (
          <div className="text-center py-12 text-slate-500 uppercase tracking-widest text-sm font-headline italic">
            No unsold players currently recorded.
          </div>
        ) : (
          <div className="overflow-x-auto no-scrollbar rounded-xl border border-white/5">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 text-[10px] uppercase font-black tracking-widest text-slate-400 border-b border-white/10">
                  <th className="p-4 whitespace-nowrap hidden sm:table-cell">ID</th>
                  <th className="p-4 whitespace-nowrap">Player</th>
                  <th className="p-4 whitespace-nowrap">Role</th>
                  <th className="p-4 whitespace-nowrap">Base Price</th>
                  <th className="p-4 whitespace-nowrap text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs font-data">
                {unsoldPlayers.map((player) => (
                  <tr key={player.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4 text-slate-500 hidden sm:table-cell">#{player.id}</td>
                    <td className="p-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-surface-container-high border border-white/10 overflow-hidden shrink-0">
                         <img src={player.image_url || '/placeholder.png'} alt={player.name} className="w-full h-full object-cover grayscale" />
                      </div>
                      <span className="font-bold text-white uppercase">{player.name}</span>
                    </td>
                    <td className="p-4 text-slate-300">
                      <span className="px-2 py-1 rounded bg-white/5 text-[9px] uppercase tracking-widest">{player.role}</span>
                    </td>
                    <td className="p-4 text-amber-400">₹{formatCurrency(player.base_price)}Cr</td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => onRevert(player)}
                        className="px-4 py-2 bg-primary/20 text-primary border border-primary/30 rounded-lg uppercase text-[10px] font-black tracking-widest hover:bg-primary hover:text-black transition-all shadow-lg active:scale-95"
                      >
                        Revert to Available
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUnsoldPlayers;
