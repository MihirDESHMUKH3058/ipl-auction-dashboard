import React, { useState, useEffect } from 'react';
import { usePlayerStore } from '../store/playerStore';
import { useAuctionStore } from '../store/auctionStore';
import { useTeamStore } from '../store/teamStore';
import { motion, AnimatePresence } from 'framer-motion';
import { socketClient } from '../lib/socketClient';

// Modular Components
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminConsole from '../components/admin/AdminConsole';
import AdminPlayerManager from '../components/admin/AdminPlayerManager';
import AdminTeamOverview from '../components/admin/AdminTeamOverview';
import AdminSettings from '../components/admin/AdminSettings';

const AdminDashboardPage = () => {
  const playerStore = usePlayerStore();
  const auctionStore = useAuctionStore();
  const teamStore = useTeamStore();
  
  const { players } = playerStore;
  const { currentPlayer, bids, status, timer, setCurrentPlayer, handleSold, handleUnsold } = auctionStore;
  const { teams } = teamStore;
  
  const [activeTab, setActiveTab] = useState('console'); 
  const [autoQueue, setAutoQueue] = useState(false);
  const [manualBidValue, setManualBidValue] = useState('');
  const [notification, setNotification] = useState(null);
  // No longer requires authentication

  // Initial Connection
  useEffect(() => {
    socketClient.connect();
    if (players.length === 0) playerStore.fetchPlayers();
    if (teams.length === 0) teamStore.fetchTeams();
  }, []);

  // Auto-Queue Logic
  useEffect(() => {
    if (autoQueue && (status === 'sold' || status === 'unsold')) {
      const autoTimer = setTimeout(() => {
        onNextPlayer();
      }, 3000);
      return () => clearTimeout(autoTimer);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, autoQueue]);

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const formatCurrency = (amount) => (amount / 10000000).toFixed(2);

  const upcomingPlayers = players.filter(p => p.status === 'available' && p.id !== currentPlayer?.id).slice(0, 10);
  const totalSpent = teams.reduce((acc, t) => acc + t.spent, 0);

  const onHandleSold = () => {
    if (!currentPlayer || bids.length === 0) return;
    handleSold(playerStore, teamStore);
    showNotification(`${currentPlayer.name} MARKED AS SOLD`, 'success');
  };

  const onHandleUnsold = () => {
    if (!currentPlayer) return;
    handleUnsold(playerStore);
    showNotification(`${currentPlayer.name} MARKED AS UNSOLD`, 'warning');
  };

  const onNextPlayer = () => {
    if (upcomingPlayers.length > 0) {
      const player = upcomingPlayers[0];
      setCurrentPlayer(player);
      socketClient.startAuction(player);
    } else {
      showNotification("PLAYER POOL EXHAUSTED", 'error');
    }
  };

  const onBringToPodium = (player) => {
    setCurrentPlayer(player);
    socketClient.startAuction(player);
    showNotification(`${player.name} DEPLOYED TO PODIUM`, 'info');
  };


  const onBeginBidding = () => {
    socketClient.beginBidding();
    showNotification("AUCTION STARTED", 'success');
  };

  const onManualBidSubmit = () => {
    if (!manualBidValue || !currentPlayer) return;
    auctionStore.manualBid(manualBidValue);
    setManualBidValue('');
    showNotification(`MANUAL BID AT ₹${manualBidValue}Cr`, 'info');
  };


  return (
    <div className="flex h-screen bg-[#000a2a] text-white overflow-hidden selection:bg-primary selection:text-on-primary">
      {/* Toast Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div 
            initial={{ y: -100, opacity: 0 }} animate={{ y: 20, opacity: 1 }} exit={{ y: -100, opacity: 0 }}
            className={`fixed top-4 left-1/2 -translate-x-1/2 z-[100] px-8 py-3 rounded-2xl font-headline font-black uppercase text-[10px] tracking-widest shadow-2xl border flex items-center gap-3 backdrop-blur-xl ${
              notification.type === 'success' ? 'bg-tertiary/20 text-tertiary border-tertiary/40 shadow-tertiary/20' : 
              notification.type === 'error' ? 'bg-error/20 text-error border-error/40' : 
              'bg-primary/20 text-primary border-primary/40 shadow-primary/20'
            }`}
          >
            <span className="material-symbols-outlined text-sm">notifications_active</span>
            {notification.message}
          </motion.div>
        )}
      </AnimatePresence>

      <AdminSidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        autoQueue={autoQueue} 
        setAutoQueue={setAutoQueue}
        availablePoolCount={players.filter(p => p.status === 'available').length}
        onGenerateBag={() => { playerStore.generateRandomBag(10); showNotification("NEW RANDOM BAG REQUEST SENT", 'success'); }}
      />

      <main className="flex-1 lg:ml-0 overflow-y-auto p-4 sm:p-8 lg:p-12 relative h-screen pb-24">
        {/* Header */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse shadow-[0_0_8px_rgb(52,211,153)]" />
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Node Cluster: GHRCEMN-01 (Stable)</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-headline font-black italic uppercase tracking-tighter shadow-text">
              {activeTab === 'console' && 'Auction Command'}
              {activeTab === 'manager' && 'Player Catalog'}
              {activeTab === 'budget' && 'Financial Ledger'}
              {activeTab === 'draft' && 'Draft Tracker'}
              {activeTab === 'settings' && 'System Node'}
            </h1>
          </div>
          
          <div className="flex bg-surface-container/50 backdrop-blur-md rounded-[28px] p-2 border border-white/5 shadow-2xl items-center divide-x divide-white/5 overflow-x-auto no-scrollbar max-w-full">
            <div className="px-5 py-2 text-center min-w-[80px]">
              <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Lot Res.</p>
              <p className="font-data text-2xl text-primary leading-none">#{players.length}</p>
            </div>
            <div className="px-5 py-2 text-center text-tertiary min-w-[80px]">
              <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Clock Sync</p>
              <p className="font-data text-2xl leading-none">
                {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
              </p>
            </div>
            <div className="px-5 py-2 text-center min-w-[120px]">
              <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Liquidity</p>
              <p className="font-data text-2xl text-amber-400 leading-none">₹{formatCurrency(totalSpent)}Cr</p>
            </div>
          </div>
        </header>

        {/* Dynamic Views */}
        <div className="relative">
          <AnimatePresence mode="wait">
            {activeTab === 'console' && (
              <motion.div key="console" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                <AdminConsole 
                  currentPlayer={currentPlayer} bids={bids} status={status} timer={timer} formatCurrency={formatCurrency}
                  onHandleSold={onHandleSold} onHandleUnsold={onHandleUnsold}
                  manualBidValue={manualBidValue} setManualBidValue={setManualBidValue} onManualBidSubmit={onManualBidSubmit}
                  upcomingPlayers={upcomingPlayers} onBringToPodium={onBringToPodium} onNextPlayer={onNextPlayer}
                  onBeginBidding={onBeginBidding}
                />
              </motion.div>
            )}
            {activeTab === 'manager' && (
              <motion.div key="manager" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
                <AdminPlayerManager 
                  players={players} formatCurrency={formatCurrency}
                  onAdd={(p) => { playerStore.addPlayer(p); showNotification("PLAYER POOL REQUEST SENT", 'success'); }}
                  onUpdate={(id, u) => { playerStore.updatePlayer(id, u); showNotification("PLAYER SYNC REQUEST SENT", 'info'); }}
                  onDelete={(id) => { playerStore.deletePlayer(id); showNotification("PLAYER PURGE REQUEST SENT", 'warning'); }}
                />
              </motion.div>
            )}
            {activeTab === 'budget' && (
              <motion.div key="budget" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <AdminTeamOverview teams={teams} formatCurrency={formatCurrency} />
              </motion.div>
            )}
            {activeTab === 'draft' && (
              <motion.div key="draft" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <AdminTeamOverview teams={teams.filter(t => t.players?.length > 0)} formatCurrency={formatCurrency} />
              </motion.div>
            )}
            {activeTab === 'settings' && (
               <motion.div key="settings" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                 <AdminSettings 
                   onSetTimer={(t) => { auctionStore.setTimer(t); showNotification(`TIMER RESET TO ${Math.floor(t/60)}m`, 'info'); }}
                   onResetSession={() => { playerStore.resetSession(); showNotification("SESSION RESET REQUESTED", 'error'); }}
                   onLotCleanup={() => { showNotification("CALCULATING TOTALS...", 'info'); }}
                 />
               </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Broadcast Marquee */}
      <div className="fixed bottom-0 w-full z-[80] bg-[#00175e] h-14 border-t border-white/10 flex items-center overflow-hidden shadow-[0_-12px_40px_rgba(0,0,0,0.8)] backdrop-blur-xl">
        <div className="bg-primary text-black px-8 h-full flex items-center font-headline font-black italic text-[11px] uppercase skew-x-[-20deg] -ml-4 shadow-[10px_0_30px_rgba(255,185,85,0.4)]">
          <span className="skew-x-[20deg] whitespace-nowrap">Live Satellite Feed</span>
        </div>
        <div className="flex whitespace-nowrap gap-20 px-12 animate-marquee items-center text-white/90">
          {bids.slice(0, 5).map((bid, i) => (
            <span key={i} className="text-[10px] font-headline font-black uppercase tracking-[0.2em] flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-primary shadow-[0_0_12px_#ffb955]" />
              {bid.team_name} ACQUIRED POSITION AT ₹{formatCurrency(bid.amount)}CR
            </span>
          ))}
          <span className="text-[10px] font-headline font-black uppercase tracking-[0.2em] flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-tertiary" />
            GHRCEMN IPL 2026 AUCTION PROVISIONAL COMMAND ENABLED
          </span>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
