import React, { useState } from 'react';
import { motion } from 'framer-motion';

const AdminSidebar = ({ activeTab, setActiveTab, autoQueue, setAutoQueue, availablePoolCount, onGenerateBag }) => {
  const menuItems = [
    { id: 'console', icon: 'shield_person', label: 'Admin Console' },
    { id: 'manager', icon: 'person_add', label: 'Player Management' },
    { id: 'budget', icon: 'payments', label: 'Team Budgets' },
    { id: 'draft', icon: 'dashboard', label: 'Draft Board' },
    { id: 'unsold', icon: 'block', label: 'Unsold Players' },
    { id: 'settings', icon: 'settings', label: 'System Settings' }
  ];

  const [selectedTier, setSelectedTier] = useState('');

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col py-8 gap-4 w-72 h-screen sticky top-0 bg-[#00175e] shadow-2xl border-r border-white/10 z-50">
        <div className="px-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-surface-container-highest flex items-center justify-center border border-primary/20 shadow-lg">
              <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>trophy</span>
            </div>
            <div>
              <h3 className="font-headline font-black text-amber-400 text-sm leading-tight uppercase tracking-tight">Auction Command</h3>
              <p className="text-slate-400 text-[10px] uppercase tracking-widest">v2.0 Production</p>
            </div>
          </div>
          
          <button 
            onClick={() => setAutoQueue(!autoQueue)}
            className={`w-full py-3 font-headline font-bold rounded-lg shadow-lg transition-all uppercase text-xs flex items-center justify-center gap-2 mb-6 ${autoQueue ? 'bg-tertiary text-on-tertiary scale-105' : 'bg-surface-container-high text-slate-400 border border-white/10'}`}
          >
            <span className="material-symbols-outlined text-sm">{autoQueue ? 'sync' : 'sync_disabled'}</span>
            Auto-Queue: {autoQueue ? 'ON' : 'OFF'}
          </button>

          <div className="pt-6 border-t border-white/5">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-4 ml-1">Bag Control</h4>
            <div className="flex gap-2 mb-2">
              <select 
                value={selectedTier} 
                onChange={e => setSelectedTier(e.target.value)}
                className="w-full bg-surface-container-high border border-white/10 rounded overflow-hidden text-[10px] uppercase font-bold p-1 text-slate-300"
              >
                <option value="">Any Tier</option>
                <option value="80+">80+ Rating</option>
                <option value="70-79">70-79 Rating</option>
                <option value="60-69">60-69 Rating</option>
              </select>
            </div>
            <motion.button 
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={() => onGenerateBag(selectedTier)}
              className="w-full py-4 bg-tertiary text-on-tertiary font-headline font-black rounded-xl shadow-lg hover:brightness-110 active:scale-95 transition-all uppercase text-[10px] flex flex-col items-center justify-center gap-1 leading-none shadow-tertiary/20"
            >
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">casino</span> Generate Random Bag
              </div>
              <span className="text-[8px] opacity-60 tracking-[0.2em] font-bold">10 UNSOLD ONLY</span>
            </motion.button>
            <div className="mt-3 bg-surface-container-low p-3 rounded-xl border border-white/5 flex justify-between items-center">
              <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Available</span>
              <span className="text-[10px] font-black text-primary uppercase">{availablePoolCount}</span>
            </div>
          </div>
        </div>

        <nav className="flex flex-col flex-grow">
          {menuItems.map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-4 flex items-center gap-3 font-headline font-medium transition-all ${activeTab === tab.id ? 'bg-white/10 text-amber-400 border-r-4 border-amber-400' : 'text-slate-400 hover:bg-white/5'}`}
            >
              <span className="material-symbols-outlined">{tab.icon}</span> {tab.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-14 left-0 w-full bg-[#00175e] border-t border-white/10 flex items-center justify-around z-50 h-16 shadow-[0_-8px_24px_rgba(0,0,0,0.5)]">
        {menuItems.map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center justify-center gap-1 transition-all flex-1 h-full ${activeTab === tab.id ? 'text-amber-400 bg-white/5' : 'text-slate-500'}`}
          >
            <span className="material-symbols-outlined text-xl">{tab.icon}</span>
            <span className="text-[8px] font-black uppercase tracking-tighter">{tab.label.split(' ')[0]}</span>
          </button>
        ))}
      </nav>
    </>
  );
};

export default AdminSidebar;
