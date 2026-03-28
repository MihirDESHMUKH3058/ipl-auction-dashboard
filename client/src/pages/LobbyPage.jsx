import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LoginPortal from '../components/auth/LoginPortal';

const teams = [
  { id: '1', name: 'Chennai Super Kings', img: 'https://documents.iplt20.com/ipl/CSK/logos/Logooutline/CSKoutline.png' },
  { id: '2', name: 'Delhi Capitals', img: 'https://documents.iplt20.com/ipl/DC/Logos/LogoOutline/DCoutline.png' },
  { id: '3', name: 'Gujarat Titans', img: 'https://documents.iplt20.com/ipl/GT/Logos/Logooutline/GToutline.png' },
  { id: '4', name: 'Kolkata Knight Riders', img: 'https://documents.iplt20.com/ipl/KKR/Logos/Logooutline/KKRoutline.png' },
  { id: '5', name: 'Lucknow Super Giants', img: 'https://documents.iplt20.com/ipl/LSG/Logos/Logooutline/LSGoutline.png' },
  { id: '6', name: 'Mumbai Indians', img: 'https://documents.iplt20.com/ipl/MI/Logos/Logooutline/MIoutline.png' },
  { id: '7', name: 'Punjab Kings', img: 'https://documents.iplt20.com/ipl/PBKS/Logos/Logooutline/PBKSoutline.png' },
  { id: '8', name: 'Rajasthan Royals', img: 'https://documents.iplt20.com/ipl/RR/Logos/Logooutline/RRoutline.png' },
  { id: '9', name: 'Royal Challengers Bengaluru', img: 'https://documents.iplt20.com/ipl/RCB/Logos/Logooutline/RCBoutline.png' },
  { id: '10', name: 'Sunrisers Hyderabad', img: 'https://documents.iplt20.com/ipl/SRH/Logos/Logooutline/SRHoutline.png' },
];

const LobbyPage = () => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [timeLeft, setTimeLeft] = useState({
    days: '00',
    hours: '00',
    minutes: '00',
    seconds: '00'
  });

  useEffect(() => {
    const targetDate = new Date('April 8, 2026 12:00:00').getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        const d = Math.floor(difference / (1000 * 60 * 60 * 24));
        const h = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({
          days: d.toString().padStart(2, '0'),
          hours: h.toString().padStart(2, '0'),
          minutes: m.toString().padStart(2, '0'),
          seconds: s.toString().padStart(2, '0')
        });
      }
    };

    updateTimer();
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero Section & Countdown */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-20 gap-12">
        <div className="text-center md:text-left space-y-4">
          <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary border border-primary/20 rounded-full font-headline font-bold text-xs uppercase tracking-widest">GHRCEMN Mega Auction 2026</span>
          <h1 className="text-6xl md:text-8xl font-headline font-black uppercase tracking-tighter italic">
            Command Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-white">Dynasty</span>
          </h1>
          <p className="text-on-surface-variant max-w-xl text-lg opacity-80">Welcome to the inner sanctum of the 2026 IPL Auction. Log in to your franchise portal to begin bidding for world-class talent.</p>
        </div>

        <div className="glass-panel p-8 rounded-3xl flex gap-6 md:gap-8 items-center border border-white/5 shadow-2xl stadium-glow">
          {['Days', 'Hours', 'Mins', 'Secs'].map((unit, idx) => (
            <div key={unit} className="flex flex-col items-center">
              <div className="flex items-baseline">
                <span className="text-5xl md:text-6xl font-data text-white drop-shadow-lg">
                  {Object.values(timeLeft)[idx]}
                </span>
                {idx < 3 && <span className="text-primary font-data text-4xl mx-2 animate-pulse">:</span>}
              </div>
              <span className="text-[10px] uppercase font-headline font-bold text-slate-500 tracking-widest mt-2">{unit}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Team Selection Grid */}
      <div className="space-y-12">
        <div className="flex flex-col md:flex-row items-center justify-between border-b border-white/5 pb-6 gap-4">
          <h2 className="text-3xl font-headline font-black uppercase italic tracking-tight">Pick Your <span className="text-amber-400">Franchise</span></h2>
          <div className="flex items-center gap-6">
            <span className="text-xl font-black italic text-amber-400 tracking-tighter uppercase font-headline hidden sm:block">GHRCEMN IPL AUCTION 2026</span>
            <button 
              onClick={() => { setSelectedTeam(null); setIsLoginOpen(true); }}
              className="px-6 py-2 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 rounded-full font-headline font-bold text-[10px] uppercase tracking-widest transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">admin_panel_settings</span>
              Auctioneer Control
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {teams.map((team) => (
            <motion.div 
              key={team.id}
              whileHover={{ y: -8, scale: 1.02 }}
              className="group bg-surface-container rounded-2xl p-6 border border-white/5 hover:border-primary/40 transition-all duration-300 cursor-pointer relative overflow-hidden flex flex-col items-center text-center shadow-lg"
            >
              {/* Card Hologram Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              <div className="relative mb-6">
                <div className="w-24 h-24 rounded-full bg-slate-900 border border-white/5 flex items-center justify-center stadium-glow group-hover:border-primary/20 transition-colors overflow-hidden">
                  <img src={team.img} alt={team.name} className="w-16 h-16 object-contain" />
                </div>
                <div className="absolute -bottom-2 -right-2 bg-primary text-on-primary text-[10px] font-black w-8 h-8 rounded-full flex items-center justify-center border-4 border-surface-container">
                  {team.id}
                </div>
              </div>

              <h3 className="font-headline font-black uppercase text-sm tracking-tight text-white mb-4 group-hover:text-primary transition-colors h-10 flex items-center">
                {team.name}
              </h3>

              <button 
                onClick={(e) => { e.stopPropagation(); setSelectedTeam(team.id); setIsLoginOpen(true); }}
                className="w-full py-2 bg-surface-container-high group-hover:bg-primary transition-all rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-on-primary"
              >
                Enter Portal
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Login Portal Overlay */}
      <LoginPortal 
        isOpen={isLoginOpen} 
        onClose={() => setIsLoginOpen(false)} 
        initialMode="team"
        selectedTeamId={selectedTeam}
      />

      {/* Bottom Features Ticker */}
      <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { icon: 'bolt', title: 'Real-time Bidding', desc: 'Zero-latency WebSocket sync for high-stakes competition.' },
          { icon: 'monitoring', title: 'Financial Analytics', desc: 'Dynamic purse tracking and roster optimization tools.' },
          { icon: 'verified_user', title: 'Secure Access', desc: 'End-to-end encryption for team strategy protection.' }
        ].map((feat) => (
          <div key={feat.title} className="flex gap-4 items-start p-6 glass-card rounded-2xl border border-white/5">
            <div className="w-12 h-12 rounded-xl bg-surface-variant flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-primary">{feat.icon}</span>
            </div>
            <div>
              <h4 className="font-headline font-bold uppercase text-xs tracking-widest text-white mb-2">{feat.title}</h4>
              <p className="text-slate-500 text-sm leading-relaxed">{feat.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LobbyPage;
