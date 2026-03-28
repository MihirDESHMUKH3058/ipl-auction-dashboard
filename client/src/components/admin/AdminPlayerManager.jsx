import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminPlayerManager = ({ players, onAdd, onUpdate, onDelete, formatCurrency }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '', role: 'Batsman', country: 'India', base_price: 20000000, image_url: ''
  });

  const filteredPlayers = players.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         (p.country || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'All' || p.role === roleFilter;
    return matchesSearch && matchesRole;
  }).sort((a,b) => b.id - a.id);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      onUpdate(editingId, formData);
      setEditingId(null);
    } else {
      onAdd(formData);
      setIsAdding(false);
    }
    setFormData({ name: '', role: 'Batsman', country: 'India', base_price: 20000000, image_url: '' });
  };

  const startEdit = (player) => {
    setEditingId(player.id);
    setFormData({
      name: player.name,
      role: player.role,
      country: player.country,
      base_price: player.base_price,
      image_url: player.image_url
    });
    setIsAdding(true);
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Search and Filters */}
      <div className="bg-surface-container rounded-3xl p-6 border border-white/5 shadow-xl flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-4 flex-grow max-w-xl">
          <div className="relative flex-grow">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">search</span>
            <input 
              type="text" placeholder="Search players or countries..." 
              className="w-full bg-surface-container-low border-none focus:ring-1 focus:ring-primary rounded-2xl pl-12 py-3 text-sm text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select 
            className="bg-surface-container-low border-none focus:ring-1 focus:ring-primary rounded-2xl px-4 py-3 text-sm text-slate-300"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            {['All', 'Batsman', 'Bowler', 'All-Rounder', 'Wicket-Keeper'].map(role => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
        </div>
        <button 
          onClick={() => { setIsAdding(true); setEditingId(null); }}
          className="px-6 py-3 bg-primary text-on-primary font-headline font-black rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20 flex items-center gap-2 text-sm uppercase"
        >
          <span className="material-symbols-outlined text-lg">person_add</span> Add New Player
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Players', val: players.length, color: 'primary' },
          { label: 'Unsold/Hidden', val: players.filter(p => p.status === 'hidden').length, color: 'slate-500' },
          { label: 'Available (Released)', val: players.filter(p => p.status === 'available').length, color: 'tertiary' },
          { label: 'Total Sold', val: players.filter(p => p.status === 'sold').length, color: 'amber-500' }
        ].map(stat => (
          <div key={stat.label} className="bg-surface-container-low p-4 rounded-2xl border border-white/5">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">{stat.label}</p>
            <p className={`font-data text-3xl leading-none text-${stat.color}`}>{stat.val}</p>
          </div>
        ))}
      </div>

      {/* Players List */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredPlayers.map(player => (
            <motion.div 
              key={player.id} layout
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              className="bg-surface-container rounded-3xl p-6 border border-white/5 shadow-2xl relative group overflow-hidden"
            >
              <div className="flex gap-4 items-center mb-6">
                <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-white/10 overflow-hidden shrink-0 shadow-lg">
                  <img 
                    src={player.image_url || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(player.name)} 
                    alt={player.name}
                    className="w-full h-full object-cover" 
                    onError={(e) => { e.target.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(player.name); }}
                  />
                </div>
                <div className="overflow-hidden">
                  <h4 className="text-lg font-headline font-black text-white uppercase italic truncate">{player.name}</h4>
                  <p className="text-[10px] font-bold text-primary uppercase tracking-widest">{player.role} • {player.country}</p>
                </div>
              </div>
              <div className="space-y-3 pt-4 border-t border-white/5">
                <div className="flex justify-between items-center text-[10px] font-bold uppercase text-slate-500 tracking-widest">
                  <span>Base Price</span>
                  <span className="text-white font-data text-sm">₹{formatCurrency(player.base_price)}Cr</span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-bold uppercase text-slate-500 tracking-widest">
                  <span>Current State</span>
                  <span className={`px-2 py-0.5 rounded text-[8px] font-black border ${
                    player.status === 'sold' ? 'text-amber-500 border-amber-500/20 bg-amber-500/10' : 
                    player.status === 'available' ? 'text-tertiary border-tertiary/20 bg-tertiary/10' : 
                    'text-slate-600 border-white/5'
                  }`}>{player.status.toUpperCase()}</span>
                </div>
              </div>
              
              <div className="absolute top-6 right-6 flex gap-2">
                <button 
                  onClick={() => startEdit(player)}
                  className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all flex items-center justify-center border border-white/10"
                >
                  <span className="material-symbols-outlined text-sm">edit</span>
                </button>
                <button 
                  onClick={() => { if(confirm('Delete '+player.name+'?')) onDelete(player.id) }}
                  className="w-8 h-8 rounded-lg bg-error/10 hover:bg-error text-error hover:text-on-error transition-all flex items-center justify-center border border-error/20"
                >
                  <span className="material-symbols-outlined text-sm">delete</span>
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-20">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#000a2a]/95 backdrop-blur-md" 
              onClick={() => setIsAdding(false)}
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-surface-container rounded-[40px] w-full max-w-2xl border border-white/10 shadow-[0_32px_120px_rgba(0,0,0,0.8)] relative z-10 overflow-hidden"
            >
              <form onSubmit={handleSubmit} className="p-8 sm:p-12 space-y-8">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-3xl font-headline font-black text-white uppercase italic">
                    {editingId ? 'Edit Player' : 'Register Player'}
                  </h3>
                  <button type="button" onClick={() => setIsAdding(false)} className="text-slate-500 hover:text-white">
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Player Full Name</label>
                      <input required className="w-full bg-[#00144d] border-none focus:ring-1 focus:ring-primary rounded-2xl px-6 py-4 text-white" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Player Role</label>
                      <select className="w-full bg-[#00144d] border-none focus:ring-1 focus:ring-primary rounded-2xl px-6 py-4 text-white" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                        {['Batsman', 'Bowler', 'All-Rounder', 'Wicket-Keeper'].map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Base Price (Rupees)</label>
                      <input type="number" required className="w-full bg-[#00144d] border-none focus:ring-1 focus:ring-primary rounded-2xl px-6 py-4 text-white font-data" value={formData.base_price} onChange={e => setFormData({...formData, base_price: parseInt(e.target.value)})} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Country</label>
                      <input required className="w-full bg-[#00144d] border-none focus:ring-1 focus:ring-primary rounded-2xl px-6 py-4 text-white" value={formData.country} onChange={e => setFormData({...formData, country: e.target.value})} />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Headshot URL</label>
                  <input placeholder="https://..." className="w-full bg-[#00144d] border-none focus:ring-1 focus:ring-primary rounded-2xl px-6 py-4 text-white text-xs truncate" value={formData.image_url} onChange={e => setFormData({...formData, image_url: e.target.value})} />
                </div>
                <button type="submit" className="w-full py-5 bg-primary text-on-primary font-headline font-black rounded-3xl shadow-2xl hover:brightness-110 active:scale-95 transition-all text-sm uppercase tracking-widest mt-8">
                  {editingId ? 'Update Record' : 'Add to Pool'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminPlayerManager;
