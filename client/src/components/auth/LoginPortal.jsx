import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import { useTeamStore } from '../../store/teamStore';
import { useNavigate } from 'react-router-dom';

const LoginPortal = ({ isOpen, onClose, initialMode = 'team', selectedTeamId = null }) => {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const teams = useTeamStore((state) => state.teams);
  const [mode, setMode] = useState(selectedTeamId ? 'team' : initialMode);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedTeamId) {
      setMode('team');
      setFormData(prev => ({ ...prev, teamId: selectedTeamId }));
    }
  }, [selectedTeamId]);
  
  const [formData, setFormData] = useState({
    teamId: selectedTeamId || '',
    passcode: '',
    adminId: '',
    adminPassword: ''
  });

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const identifier = mode === 'team' ? formData.teamId : formData.adminId;
      const password = mode === 'team' ? formData.passcode : formData.adminPassword;
      
      const result = await login(identifier, password, mode);
      
      if (result.success) {
        onClose();
        if (mode === 'team') {
          navigate('/auction');
        } else {
          navigate('/admin');
        }
      } else {
        setError(result.error || 'Authentication failed');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-background/80 backdrop-blur-xl"
        />

        {/* Modal Content */}
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative w-full max-w-md bg-surface-container rounded-3xl border border-white/10 shadow-[0_0_80px_rgba(0,0,0,0.5)] overflow-hidden"
        >
          {/* Top Branding Bar */}
          <div className="bg-primary px-8 py-4 flex justify-between items-center">
            <span className="font-headline font-black uppercase italic text-xs tracking-widest text-on-primary">GHRCEMN Secure Access</span>
            <button onClick={onClose} className="text-on-primary/60 hover:text-on-primary transition-colors">
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>

          <div className="p-10">
            {/* Tabs */}
            <div className="flex gap-4 mb-8 bg-surface-container-low p-1.5 rounded-2xl">
              <button 
                type="button"
                onClick={() => setMode('team')}
                className={`flex-1 py-3 rounded-xl font-headline font-bold text-[10px] uppercase tracking-widest transition-all ${mode === 'team' ? 'bg-primary text-on-primary shadow-lg' : 'text-slate-500 hover:text-white'}`}
              >
                Franchise
              </button>
              <button 
                type="button"
                onClick={() => setMode('admin')}
                className={`flex-1 py-3 rounded-xl font-headline font-bold text-[10px] uppercase tracking-widest transition-all ${mode === 'admin' ? 'bg-primary text-on-primary shadow-lg' : 'text-slate-500 hover:text-white'}`}
              >
                Auctioneer
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {mode === 'team' ? (
                <>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Identify Franchise</label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-lg">shield</span>
                      <select 
                        className="w-full bg-surface-container-low border border-white/5 rounded-xl py-4 pl-12 pr-4 text-slate-200 font-headline font-bold text-sm focus:ring-1 focus:ring-primary transition-all appearance-none outline-none"
                        value={formData.teamId}
                        onChange={(e) => setFormData({...formData, teamId: e.target.value})}
                      >
                        <option value="" className="bg-[#0f172a] text-slate-400">Select Your Team</option>
                        {teams.map(team => (
                          <option key={team.id} value={team.id} className="bg-[#0f172a] text-white py-2">
                            {team.name} ({team.shortName})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Franchise Access Key</label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-lg">key</span>
                      <input 
                        type="password"
                        placeholder="Enter Key (e.g. ipl2026)"
                        className="w-full bg-surface-container-low border border-white/5 rounded-xl py-4 pl-12 pr-4 text-slate-200 placeholder:text-slate-500 font-headline font-bold text-sm focus:ring-1 focus:ring-primary transition-all outline-none"
                        value={formData.passcode}
                        onChange={(e) => setFormData({...formData, passcode: e.target.value})}
                      />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Control ID</label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-lg">account_circle</span>
                      <input 
                        type="text"
                        placeholder="Admin Username"
                        className="w-full bg-surface-container-low border border-white/5 rounded-xl py-4 pl-12 pr-4 text-slate-200 placeholder:text-slate-500 font-headline font-bold text-sm focus:ring-1 focus:ring-primary transition-all outline-none"
                        value={formData.adminId}
                        onChange={(e) => setFormData({...formData, adminId: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Secret Password</label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-lg">lock</span>
                      <input 
                        type="password"
                        placeholder="Auctioneer Passphrase"
                        className="w-full bg-surface-container-low border border-white/5 rounded-xl py-4 pl-12 pr-4 text-slate-200 placeholder:text-slate-500 font-headline font-bold text-sm focus:ring-1 focus:ring-primary transition-all outline-none"
                        value={formData.adminPassword}
                        onChange={(e) => setFormData({...formData, adminPassword: e.target.value})}
                      />
                    </div>
                  </div>
                </>
              )}

              <button 
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-primary text-on-primary font-headline font-black rounded-xl hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all uppercase tracking-widest text-xs shadow-lg shadow-primary/20 mt-4 h-12 flex items-center justify-center"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />
                ) : (
                  'Authenticate & Enter'
                )}
              </button>
            </form>

            <AnimatePresence>
              {error && (
                <motion.p 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-center text-error text-[10px] font-bold uppercase tracking-widest mt-6"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            <p className="text-center text-[8px] text-slate-600 font-bold uppercase tracking-[0.2em] mt-8">
              Access Restricted • GHRCEMN Sports Division
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default LoginPortal;
