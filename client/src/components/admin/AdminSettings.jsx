import React from 'react';
import { motion } from 'framer-motion';

const AdminSettings = ({ onSetTimer, onPauseTimer, onResetSession, onLotCleanup }) => {
  return (
    <div className="max-w-4xl space-y-8 pb-32">
      <div className="bg-surface-container rounded-[40px] p-8 sm:p-12 border border-white/5 shadow-2xl space-y-10">
        <div>
          <h3 className="text-2xl font-headline font-black text-white uppercase italic underline decoration-primary underline-offset-8 mb-8 tracking-tighter">System Overrides</h3>
          <p className="text-slate-500 text-sm leading-relaxed max-w-2xl font-medium">Global auction synchronization controls. These actions propagate instantly across all 10 franchise portals and the broadcast projector.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-8 bg-surface-container-low rounded-3xl border border-white/5 space-y-6 flex flex-col shadow-inner">
            <div className="flex items-center gap-3 text-primary">
              <span className="material-symbols-outlined text-lg">timer</span>
              <h4 className="text-[10px] font-black uppercase tracking-widest leading-none">Timer Control</h4>
            </div>
            <div className="flex gap-2">
              {[
                { label: 'Set 1m', val: 60 },
                { label: 'Set 3m', val: 180 },
                { label: 'Set 5m', val: 300 }
              ].map(opt => (
                <button 
                  key={opt.label} 
                  onClick={() => onSetTimer(opt.val)} 
                  className="flex-1 py-3 bg-primary/10 text-primary text-[9px] font-black uppercase rounded-xl hover:bg-primary hover:text-on-primary transition-all shadow-inner"
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button 
                onClick={onPauseTimer}
                className="flex-1 py-3 bg-amber-500/20 text-amber-500 text-[9px] font-black uppercase rounded-xl border border-amber-500/30 hover:bg-amber-500 hover:text-black transition-all"
              >
                Pause Auction
              </button>
              <button 
                onClick={() => onSetTimer(0)}
                className="flex-1 py-3 bg-error/20 text-error text-[9px] font-black uppercase rounded-xl border border-error/30 hover:bg-error hover:text-white transition-all"
              >
                Reset Timer
              </button>
            </div>
            <button 
              onClick={() => { if(confirm('EMERGENCY STOP? This will halt the session.')) onPauseTimer(); }}
              className="w-full py-4 bg-error/20 text-error text-[10px] font-black uppercase tracking-[0.2em] hover:bg-error/30 rounded-2xl transition-all border border-error/30 mt-auto"
            >
              Emergency Kill Switch
            </button>
          </div>

          <div className="p-8 bg-surface-container-low rounded-3xl border border-white/5 space-y-6 flex flex-col shadow-inner">
            <div className="flex items-center gap-3 text-tertiary">
              <span className="material-symbols-outlined text-lg">database</span>
              <h4 className="text-[10px] font-black uppercase tracking-widest leading-none">Session Cleanup</h4>
            </div>
            <div className="space-y-3">
              <button onClick={onLotCleanup} className="w-full py-3 bg-white/5 text-slate-400 text-[9px] font-black uppercase tracking-widest hover:bg-white/10 rounded-xl transition-all border border-white/10">Recalculate Totals</button>
              <button 
                onClick={() => { if(confirm('RESET ALL DATA? This is permanent.')) onResetSession(); }}
                className="w-full py-4 bg-slate-800 text-white text-[10px] font-black uppercase tracking-widest hover:bg-slate-700 rounded-2xl transition-all shadow-xl shadow-black/40 mt-3"
              >
                Full Database Reset
              </button>
            </div>
          </div>
        </div>

        <div className="bg-amber-500/10 p-6 rounded-3xl border border-amber-500/20 flex flex-col sm:flex-row items-center gap-6">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-black flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/20">
            <span className="material-symbols-outlined text-xl">warning</span>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-amber-500 tracking-[0.1em] mb-1">Production Warning</p>
            <p className="text-slate-400 text-[10px] leading-relaxed">These controls are restricted to the head auctioneer. Any action performed here will permanently update the central session and cannot be undone during live bidding rounds.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
