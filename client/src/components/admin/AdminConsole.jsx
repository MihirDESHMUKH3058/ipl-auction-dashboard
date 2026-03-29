import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminConsole = ({ 
  currentPlayer, bids, status, timer, formatCurrency, 
  onHandleSold, onHandleUnsold, manualBidValue, setManualBidValue, onManualBidSubmit,
  upcomingPlayers, onBringToPodium, onNextPlayer, onBeginBidding 
}) => {
  return (
    <div className="grid grid-cols-12 gap-6 pb-20">
      <section className="col-span-12 xl:col-span-8 space-y-6">
        {/* Podium View */}
        <div className="bg-surface-container-highest rounded-3xl overflow-hidden shadow-2xl relative border border-white/5">
          <div className="absolute top-0 right-0 p-6 flex gap-2 z-20">
            {status === 'sold' && <span className="bg-tertiary text-on-tertiary px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest">Sold Out</span>}
            {status === 'unsold' && <span className="bg-slate-700 text-white px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border border-white/10">Passed</span>}
            {status === 'active' && <span className="bg-error/20 text-error px-3 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest border border-error/30 animate-pulse">On Podium</span>}
            {status === 'preview' && <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest border border-blue-400/30 animate-pulse">Preview</span>}
            {status === 'expired' && <span className="bg-amber-500 text-black px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest shadow-lg">Time's Up</span>}
          </div>
          
          {currentPlayer ? (
            <div className={`p-8 flex flex-col md:flex-row gap-8 items-center transition-opacity ${(status === 'active' || status === 'preview') ? '' : 'opacity-50'}`}>
              <div className="relative w-48 h-48 md:w-56 md:h-56 flex-shrink-0 group">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl group-hover:bg-primary/30 transition-all"></div>
                <img 
                  className="w-full h-full object-cover rounded-full border-4 border-primary shadow-2xl relative z-10" 
                  src={currentPlayer.image_url || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(currentPlayer.name)} 
                  alt={currentPlayer.name} 
                  onError={(e) => { e.target.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(currentPlayer.name); }}
                />
              </div>
              <div className="flex-grow space-y-4 text-center md:text-left">
                <div>
                  <h2 className="text-2xl md:text-3xl lg:text-4xl font-headline font-black text-white leading-none uppercase mb-1 italic truncate max-w-[300px] md:max-w-none">{currentPlayer.name}</h2>
                  <div className="flex items-center gap-3">
                    <p className="text-primary font-headline font-bold tracking-widest text-[10px] md:text-xs uppercase">{currentPlayer.role} • {currentPlayer.country}</p>
                    {currentPlayer.rating && (
                      <span className="bg-white/10 px-2 py-1 rounded text-amber-400 text-[10px] font-black border border-amber-400/20 shadow-lg shrink-0">RT: {currentPlayer.rating}</span>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap justify-center md:justify-start gap-4">
                  <div className="bg-surface-container-low px-4 py-2 rounded-lg border border-white/5 flex-shrink-0">
                    <span className="block text-[8px] text-slate-500 uppercase font-bold tracking-widest">Base Price</span>
                    <span className="font-data text-xl md:text-2xl text-white whitespace-nowrap">₹ {formatCurrency(currentPlayer.base_price)} CR</span>
                  </div>
                  <div className="bg-primary/10 px-4 py-2 rounded-lg border border-primary/20 flex-shrink-0">
                    <span className="block text-[8px] text-primary uppercase font-bold tracking-widest">Current Bid</span>
                    <span className="font-data text-xl md:text-2xl text-primary animate-pulse whitespace-nowrap">₹ {formatCurrency(bids[0]?.amount || currentPlayer.base_price)} CR</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 justify-center md:justify-start text-tertiary">
                  <span className="material-symbols-outlined text-sm">shield</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest">{bids[0]?.team_name || 'WAITING FOR BIDS'}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-20 text-center">
              <div className="w-16 h-16 bg-surface-container-low rounded-full flex items-center justify-center mx-auto mb-4 border border-white/5 text-slate-700 shadow-inner">
                <span className="material-symbols-outlined text-3xl">person_off</span>
              </div>
              <p className="font-headline font-black uppercase text-xl text-slate-600 tracking-tighter">No Player At Podium</p>
              <button 
                onClick={onNextPlayer} 
                disabled={upcomingPlayers.length === 0}
                className="mt-4 text-[10px] font-bold text-primary uppercase tracking-[0.2em] border-b border-primary/30 hover:border-primary transition-all disabled:opacity-30"
              >
                Initiate Next Slot
              </button>
            </div>
          )}

          <div className="bg-[#000a2a] p-6 border-t border-white/10 flex flex-col sm:flex-row gap-6 items-center justify-between">
            <div className="flex gap-3 w-full sm:w-auto">
              {status === 'preview' && (
                <button 
                  onClick={onBeginBidding} 
                  className="flex-1 sm:flex-none px-8 py-3 bg-gradient-to-r from-primary to-amber-600 text-on-primary font-headline font-black rounded-xl hover:brightness-110 active:scale-95 transition-all uppercase text-xs flex items-center justify-center gap-2 shadow-lg shadow-primary/20 ring-4 ring-primary/10"
                >
                  <span className="material-symbols-outlined text-sm">play_arrow</span> Start Auction
                </button>
              )}
              <button 
                onClick={onHandleSold} 
                disabled={!currentPlayer || bids.length === 0 || (status !== 'active' && status !== 'expired')} 
                className="flex-1 sm:flex-none px-8 py-3 bg-gradient-to-r from-tertiary to-emerald-600 text-on-tertiary font-headline font-black rounded-xl hover:brightness-110 active:scale-95 disabled:opacity-30 transition-all uppercase text-xs flex items-center justify-center gap-2 shadow-lg shadow-tertiary/20 ring-4 ring-tertiary/10"
              >
                <span className="material-symbols-outlined text-sm">gavel</span> Mark SOLD
              </button>
              <button 
                onClick={onHandleUnsold} 
                disabled={!currentPlayer || (status !== 'active' && status !== 'expired')} 
                className="flex-1 sm:flex-none px-6 py-3 bg-surface-container-low text-slate-300 font-headline font-bold rounded-xl hover:bg-surface-container-high active:scale-95 disabled:opacity-30 transition-all uppercase text-[10px] border border-white/5 tracking-widest"
              >
                Pass Unsold
              </button>
            </div>
            <div className="flex items-center gap-3 w-full sm:max-w-xs">
              <div className="relative flex-grow">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-data text-xl">₹</span>
                <input 
                  type="number" step="0.25" placeholder="Cr" 
                  className="w-full bg-surface-container-low border-none focus:ring-1 focus:ring-primary rounded-xl pl-8 text-white font-data text-2xl py-2 px-4 shadow-inner" 
                  value={manualBidValue} 
                  onChange={(e) => setManualBidValue(e.target.value)} 
                />
              </div>
              <button 
                onClick={onManualBidSubmit} 
                className="bg-primary hover:bg-primary-container text-on-primary hover:scale-[1.02] active:scale-[0.98] p-3 rounded-xl transition-all shadow-lg shadow-primary/20 disabled:opacity-30 ring-2 ring-primary/20"
              >
                <span className="material-symbols-outlined text-base">send</span>
              </button>
            </div>
          </div>
        </div>

        {/* Activity Panels */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-surface-container rounded-3xl p-6 border border-white/5 shadow-xl">
            <h4 className="text-[10px] font-headline font-black text-slate-500 uppercase tracking-widest mb-6 border-b border-white/5 pb-2">Live Bid Log</h4>
            <div className="space-y-3">
              {bids.slice(0, 5).map((bid, i) => (
                <div key={i} className="flex justify-between items-center bg-surface-container-low p-3 rounded-xl border border-white/5">
                  <span className="text-[10px] font-bold text-white uppercase">{bid.team_name}</span>
                  <span className="text-sm font-data text-primary">₹{formatCurrency(bid.amount)}Cr</span>
                </div>
              ))}
              {bids.length === 0 && <p className="text-[10px] text-slate-700 uppercase font-bold tracking-[0.2em] italic py-4 text-center">Awaiting initial bid...</p>}
            </div>
          </div>
          <div className="bg-surface-container rounded-3xl p-6 border border-white/5 shadow-xl">
            <h4 className="text-[10px] font-headline font-black text-slate-500 uppercase tracking-widest mb-6 border-b border-white/5 pb-2">Upcoming Pipeline</h4>
            <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
              {upcomingPlayers.map(p => (
                <div key={p.id} className="w-16 h-16 rounded-xl bg-slate-900 overflow-hidden border border-white/5 relative flex-shrink-0 group">
                  <img 
                    src={p.image_url || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(p.name)} 
                    alt={p.name} 
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" 
                    onError={(e) => { e.target.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(p.name); }}
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-primary h-0.5 scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                </div>
              ))}
              {upcomingPlayers.length === 0 && (
                <div className="w-full h-16 flex items-center justify-center border-2 border-dashed border-white/5 rounded-xl text-[8px] font-black text-slate-700 uppercase">
                  No Players in Bag
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Queue Sidebar (Desktop) */}
      <aside className="col-span-12 xl:col-span-4 flex flex-col gap-6">
        <div className="bg-surface-container rounded-3xl border border-white/5 flex flex-col overflow-hidden h-full shadow-2xl">
          <div className="p-6 bg-surface-container-low/50 border-b border-white/10 flex justify-between items-center gap-4">
            <h3 className="font-headline font-black text-white uppercase tracking-tight text-sm italic">Queue Manager</h3>
            <span className="text-[8px] font-black border border-white/10 px-2 py-1 rounded-full text-slate-500 uppercase tracking-widest">
              Lot Balance: {upcomingPlayers.length}
            </span>
          </div>
          <div className="p-4 space-y-3 flex-grow overflow-y-auto max-h-[480px] no-scrollbar">
            <AnimatePresence>
              {upcomingPlayers.map((player) => (
                <motion.div 
                  key={player.id} layout
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                  className="bg-surface-container-low p-4 rounded-2xl border border-white/5 flex items-center gap-4 hover:border-primary/40 transition-all group"
                >
                  <div className="w-14 h-14 rounded-2xl bg-slate-800 overflow-hidden flex-shrink-0 border border-white/10 shadow-lg">
                    <img 
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all scale-110 group-hover:scale-100" 
                      src={player.image_url || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(player.name)} 
                      alt={player.name} 
                      onError={(e) => { e.target.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(player.name); }}
                    />
                  </div>
                  <div className="flex-grow min-w-0">
                    <p className="text-xs font-bold text-white uppercase truncate mb-1">{player.name}</p>
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">{player.role}</p>
                  </div>
                  <button 
                    onClick={() => onBringToPodium(player)} 
                    className="p-3 bg-primary/10 text-primary hover:bg-primary hover:text-on-primary rounded-xl transition-all shadow-inner"
                  >
                    <span className="material-symbols-outlined text-lg">play_arrow</span>
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          <div className="p-6 border-t border-white/10 bg-surface-container-low/50">
            <button 
              onClick={onNextPlayer} 
              disabled={upcomingPlayers.length === 0} 
              className="w-full py-4 bg-primary text-on-primary font-headline font-black rounded-xl hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-3 text-xs uppercase"
            >
              <span className="material-symbols-outlined text-xl">bolt</span>
              Deploy Next Slot
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default AdminConsole;
