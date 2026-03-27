import React, { useState, useEffect } from 'react';
import { useAuctionStore } from '../store/auctionStore';
import TimerRing from '../components/ui/TimerRing';
import BidButton from '../components/ui/BidButton';
import PlayerCard from '../components/ui/PlayerCard';
import { motion, AnimatePresence } from 'framer-motion';
import { socketClient } from '../lib/socketClient';
import { useAuthStore } from '../store/authStore';

const AuctionRoomPage = () => {
  const { currentPlayer, bids, timer, status } = useAuctionStore();
  const { user } = useAuthStore();
  const [lastBid, setLastBid] = useState(null);

  useEffect(() => {
    socketClient.connect();
    return () => socketClient.disconnect();
  }, []);

  useEffect(() => {
    if (bids.length > 0) setLastBid(bids[0]);
  }, [bids]);

  if (!currentPlayer) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center">
        <div className="w-24 h-24 border-4 border-primary border-t-transparent rounded-full animate-spin mb-8" />
        <h2 className="text-3xl font-bold opacity-50">Waiting for Auctioneer to bring next player...</h2>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="grid md:grid-cols-12 gap-12 items-start">
        {/* Left: Player Info */}
        <div className="md:col-span-5 lg:col-span-4">
          <PlayerCard player={currentPlayer} status={status} />
          
          <div className="mt-8 glass-card p-6">
            <h4 className="text-xs uppercase tracking-widest text-gray-500 mb-4 font-bold">Recent Bid History</h4>
            <div className="space-y-3">
              <AnimatePresence>
                {bids.slice(0, 5).map((bid, i) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={bid.id || i}
                    className="flex justify-between items-center p-3 bg-white/5 rounded-lg border border-white/5"
                  >
                    <span className="font-bold text-primary">{bid.team_name}</span>
                    <span className="text-white">₹{(bid.amount / 10000000).toFixed(2)} Cr</span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Right: Podium Controls */}
        <div className="md:col-span-7 lg:col-span-8 flex flex-col items-center">
          <div className="mb-12">
            <TimerRing seconds={timer} />
          </div>

          <div className="w-full glass-card p-12 text-center mb-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent animate-shimmer" />
            
            <p className="text-xs uppercase tracking-[0.4em] text-primary mb-2 font-black">Current Highest Bid</p>
            <motion.h2 
              key={lastBid?.amount}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-7xl font-black text-white mb-4"
            >
              ₹{( (lastBid?.amount || currentPlayer.base_price) / 10000000).toFixed(2)} <span className="text-3xl text-gray-400">Cr</span>
            </motion.h2>
            <p className="text-xl text-gray-400">
              Placed by <span className="text-white font-bold">{lastBid?.team_name || 'No Bids Yet'}</span>
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6 w-full max-w-2xl">
            <BidButton amount={10000000} onBid={(amt) => socketClient.placeBid(currentPlayer.id, amt)} />
            <BidButton amount={50000000} onBid={(amt) => socketClient.placeBid(currentPlayer.id, amt)} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuctionRoomPage;
