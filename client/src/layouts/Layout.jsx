import React, { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import LoginPortal from '../components/auth/LoginPortal';
import { useAuctionBootstrap } from '../hooks/useAuctionBootstrap';

const Layout = () => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [loginMode, setLoginMode] = useState('admin');
  useAuctionBootstrap();

  return (
    <div className="min-h-screen bg-background text-on-surface font-body overflow-x-hidden">
      {/* Stadium Beam Visuals */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-20 left-1/4 w-64 h-[1228px] stadium-beam rotate-[-15deg]"></div>
        <div className="absolute -top-20 right-1/4 w-80 h-[1228px] stadium-beam rotate-[15deg]"></div>
        <div className="absolute inset-0 bg-arena-radial opacity-90"></div>
      </div>

      {/* Top Navigation */}
      <nav className="flex justify-between items-center px-6 h-16 w-full fixed top-0 z-50 bg-blue-950/40 backdrop-blur-xl border-b border-white/10 shadow-[0_0_20px_rgba(0,218,243,0.1)]">
        <div className="text-xl font-black italic text-amber-400 tracking-tighter uppercase font-headline">GHRCEMN IPL AUCTION 2026</div>
        <div className="hidden md:flex gap-8">
          <NavLink to="/" className={({isActive}) => `font-headline tracking-tight font-bold uppercase transition-all duration-300 ${isActive ? 'text-amber-400 border-b-2 border-amber-400 pb-1' : 'text-slate-300 hover:text-white'}`}>Lobby</NavLink>
          <NavLink to="/teams" className={({isActive}) => `font-headline tracking-tight font-bold uppercase transition-all duration-300 ${isActive ? 'text-amber-400 border-b-2 border-amber-400 pb-1' : 'text-slate-300 hover:text-white'}`}>Teams</NavLink>
          <NavLink to="/catalog" className={({isActive}) => `font-headline tracking-tight font-bold uppercase transition-all duration-300 ${isActive ? 'text-amber-400 border-b-2 border-amber-400 pb-1' : 'text-slate-300 hover:text-white'}`}>Players</NavLink>
          <NavLink to="/auction" className={({isActive}) => `font-headline tracking-tight font-bold uppercase transition-all duration-300 ${isActive ? 'text-amber-400 border-b-2 border-amber-400 pb-1' : 'text-slate-300 hover:text-white'}`}>Live Auction</NavLink>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => { setLoginMode('admin'); setIsLoginOpen(true); }}
            className="flex items-center gap-2 px-4 py-1.5 bg-surface-container-high hover:bg-white/10 text-amber-400 rounded-xl transition-all duration-200 group"
          >
            <span className="material-symbols-outlined text-sm">shield_person</span>
            <span className="font-headline font-bold text-xs tracking-widest uppercase">Admin Login</span>
          </button>
          <span className="material-symbols-outlined text-slate-300 cursor-pointer hover:bg-white/5 p-2 rounded-full transition-all">notifications</span>
        </div>
      </nav>

      {/* Main Content Canvas */}
      <main className="relative z-10 pt-24 pb-32">
        <Outlet />
      </main>

      {/* Broadcast Ticker */}
      <div className="fixed bottom-20 w-full h-10 bg-surface-bright flex items-center z-40 overflow-hidden shadow-[0_-4px_24px_rgba(0,0,0,0.5)]">
        <div className="bg-primary h-full px-6 flex items-center whitespace-nowrap">
          <span className="font-headline font-black text-on-primary-fixed text-xs tracking-widest uppercase text-on-primary">Latest Updates</span>
        </div>
        <div className="flex-grow overflow-hidden relative">
          <div className="flex gap-12 items-center whitespace-nowrap animate-marquee px-4">
            <span className="font-label text-xs text-on-surface uppercase font-bold">Registration Closed for 2026 Season</span>
            <span className="text-primary">•</span>
            <span className="font-label text-xs text-on-surface uppercase font-bold">Total Purse: ₹ 100.00 Cr Per Team</span>
            <span className="text-primary">•</span>
            <span className="font-label text-xs text-on-surface uppercase font-bold">Live Stream begins 15 mins before Auction</span>
            <span className="text-primary">•</span>
            <span className="font-label text-xs text-on-surface uppercase font-bold">Defending Champions: Royal Bengals</span>
          </div>
        </div>
      </div>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 w-full z-50 rounded-t-2xl bg-[#000d41] border-t border-white/5 shadow-[0_-4px_24px_rgba(0,0,0,0.5)] flex justify-around items-center h-20 pb-safe px-2">
        <NavLink to="/" className={({isActive}) => `flex flex-col items-center justify-center transition-all duration-300 ${isActive ? 'text-amber-400 bg-amber-400/10 rounded-xl px-3 py-1 ring-1 ring-amber-400/30' : 'text-slate-400 hover:text-amber-200'}`}>
          <span className="material-symbols-outlined">home</span>
          <span className="font-['Epilogue'] text-[10px] font-bold uppercase tracking-widest mt-1">Lobby</span>
        </NavLink>
        <NavLink to="/auction" className={({isActive}) => `flex flex-col items-center justify-center transition-all duration-300 ${isActive ? 'text-amber-400 bg-amber-400/10 rounded-xl px-3 py-1 ring-1 ring-amber-400/30' : 'text-slate-400 hover:text-amber-200'}`}>
          <span className="material-symbols-outlined">sensors</span>
          <span className="font-['Epilogue'] text-[10px] font-bold uppercase tracking-widest mt-1">Live</span>
        </NavLink>
        <NavLink to="/teams" className={({isActive}) => `flex flex-col items-center justify-center transition-all duration-300 ${isActive ? 'text-amber-400 bg-amber-400/10 rounded-xl px-3 py-1 ring-1 ring-amber-400/30' : 'text-slate-400 hover:text-amber-200'}`}>
          <span className="material-symbols-outlined">groups</span>
          <span className="font-['Epilogue'] text-[10px] font-bold uppercase tracking-widest mt-1">Teams</span>
        </NavLink>
        <NavLink to="/catalog" className={({isActive}) => `flex flex-col items-center justify-center transition-all duration-300 ${isActive ? 'text-amber-400 bg-amber-400/10 rounded-xl px-3 py-1 ring-1 ring-amber-400/30' : 'text-slate-400 hover:text-amber-200'}`}>
          <span className="material-symbols-outlined">leaderboard</span>
          <span className="font-['Epilogue'] text-[10px] font-bold uppercase tracking-widest mt-1">Players</span>
        </NavLink>
      </nav>

      {/* Auth Portal Overlay */}
      <LoginPortal 
        isOpen={isLoginOpen} 
        onClose={() => setIsLoginOpen(false)} 
        initialMode={loginMode}
      />
    </div>
  );
};

export default Layout;
