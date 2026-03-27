import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Trophy, Users, LayoutDashboard, Settings } from 'lucide-react';

const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <nav className="h-20 border-b border-white/5 flex items-center justify-between px-8 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center font-black text-background text-xl italic">IPL</div>
          <span className="text-xl font-black uppercase italic tracking-tighter">Auction <span className="text-primary italic">2026</span></span>
        </div>
        
        <div className="flex gap-8">
          <NavLink to="/" className={({isActive}) => `flex items-center gap-2 text-sm font-bold uppercase tracking-wider transition-colors ${isActive ? 'text-primary' : 'text-gray-400 hover:text-white'}`}>
            <LayoutDashboard size={18} /> Catalog
          </NavLink>
          <NavLink to="/auction" className={({isActive}) => `flex items-center gap-2 text-sm font-bold uppercase tracking-wider transition-colors ${isActive ? 'text-primary' : 'text-gray-400 hover:text-white'}`}>
            <Trophy size={18} /> Live Room
          </NavLink>
          <NavLink to="/teams" className={({isActive}) => `flex items-center gap-2 text-sm font-bold uppercase tracking-wider transition-colors ${isActive ? 'text-primary' : 'text-gray-400 hover:text-white'}`}>
            <Users size={18} /> Teams
          </NavLink>
          <NavLink to="/admin" className={({isActive}) => `flex items-center gap-2 text-sm font-bold uppercase tracking-wider transition-colors ${isActive ? 'text-primary' : 'text-gray-400 hover:text-white'}`}>
            <Settings size={18} /> Admin
          </NavLink>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-[10px] text-gray-500 uppercase font-bold">Remaining Purse</p>
            <p className="text-primary font-black">₹84.50 Cr</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-secondary border border-white/10 flex items-center justify-center font-bold text-primary">CS</div>
        </div>
      </nav>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="py-8 text-center text-gray-600 text-xs border-t border-white/5 uppercase tracking-[0.2em]">
        IPL College Auction Portal &copy; 2026 • Secure Production Ready
      </footer>
    </div>
  );
};

export default Layout;
