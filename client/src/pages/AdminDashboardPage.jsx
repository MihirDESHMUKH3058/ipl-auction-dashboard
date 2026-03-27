import React, { useState } from 'react';
import { usePlayerStore } from '../store/playerStore';
import { Play, Pause, SkipForward, Upload, ChartBar, Users } from 'lucide-react';
import { motion } from 'framer-motion';

const AdminDashboardPage = () => {
  const { players } = usePlayerStore();
  const [isUploading, setIsUploading] = useState(false);

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-12">
        <h1 className="text-4xl font-black uppercase italic italic tracking-tighter mb-2">Admin <span className="text-primary">Control Center</span></h1>
        <p className="text-gray-400">Master controls for the 2026 Season Auction</p>
      </header>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Session Controls */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <Play className="text-primary" />
            <h3 className="text-xl font-bold uppercase tracking-wider">Session Control</h3>
          </div>
          
          <div className="space-y-4">
            <button className="w-full btn-primary flex items-center justify-center gap-2">
              <Play size={20} /> Start Next Player
            </button>
            <div className="grid grid-cols-2 gap-4">
              <button className="p-3 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center gap-2 hover:bg-white/10 transition-all font-bold">
                <Pause size={18} /> Pause
              </button>
              <button className="p-3 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center gap-2 hover:bg-white/10 transition-all font-bold">
                <SkipForward size={18} /> Skip
              </button>
            </div>
          </div>
        </div>

        {/* Data Management */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <Upload className="text-primary" />
            <h3 className="text-xl font-bold uppercase tracking-wider">Data Sync</h3>
          </div>
          
          <div className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer group">
            <Upload className="mx-auto mb-4 text-gray-500 group-hover:text-primary transition-colors" size={40} />
            <p className="text-sm text-gray-400">Drag & drop player CSV here</p>
            <p className="text-[10px] text-gray-600 uppercase mt-2">Max 10MB • CSV format only</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <ChartBar className="text-primary" />
            <h3 className="text-xl font-bold uppercase tracking-wider">Quick Stats</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-end p-4 bg-white/5 rounded-lg border border-white/5">
              <div>
                <p className="text-[10px] uppercase text-gray-500 font-bold">Total Players</p>
                <p className="text-2xl font-black">{players.length}</p>
              </div>
              <Users className="text-gray-700" size={32} />
            </div>
            <div className="flex justify-between items-end p-4 bg-white/5 rounded-lg border border-white/5">
              <div>
                <p className="text-[10px] uppercase text-gray-500 font-bold">Total Spent</p>
                <p className="text-2xl font-black text-primary">₹342.5 Cr</p>
              </div>
              <ChartBar className="text-gray-700" size={32} />
            </div>
          </div>
        </div>
      </div>
      
      {/* Player Management Table */}
      <div className="mt-12 glass-card overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-white/5 border-b border-white/10">
              <th className="px-6 py-4 text-xs uppercase tracking-widest text-gray-500 font-black">Player</th>
              <th className="px-6 py-4 text-xs uppercase tracking-widest text-gray-500 font-black">Role</th>
              <th className="px-6 py-4 text-xs uppercase tracking-widest text-gray-500 font-black">Base Price</th>
              <th className="px-6 py-4 text-xs uppercase tracking-widest text-gray-500 font-black">Status</th>
              <th className="px-6 py-4 text-xs uppercase tracking-widest text-gray-500 font-black text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {players.slice(0, 5).map(player => (
              <tr key={player.id} className="hover:bg-white/5 transition-colors group">
                <td className="px-6 py-4 font-bold group-hover:text-primary transition-colors">{player.name}</td>
                <td className="px-6 py-4 text-sm text-gray-400">{player.role}</td>
                <td className="px-6 py-4 text-sm text-primary font-bold">₹{(player.base_price / 10000000).toFixed(2)} Cr</td>
                <td className="px-6 py-4">
                  <span className={`text-[10px] uppercase px-2 py-1 rounded font-bold ${player.status === 'available' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                    {player.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-gray-500 hover:text-white transition-colors">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
