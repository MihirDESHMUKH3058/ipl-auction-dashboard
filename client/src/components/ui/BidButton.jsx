import React from 'react';
import { motion } from 'framer-motion';

const BidButton = ({ amount, onBid, disabled }) => {
  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      whileHover={{ scale: 1.05 }}
      onClick={() => onBid(amount)}
      disabled={disabled}
      className="relative group p-6 rounded-2xl bg-primary text-background font-black text-2xl flex flex-col items-center justify-center shadow-[0_0_20px_rgba(212,175,55,0.3)] disabled:opacity-50 disabled:grayscale"
    >
      <span className="text-xs uppercase tracking-[0.2em] mb-1 opacity-70">Place Bid</span>
      <span>+ ₹{(amount / 10000000).toFixed(2)} Cr</span>
      
      <div className="absolute inset-0 rounded-2xl border-2 border-white/20 group-hover:scale-110 group-hover:opacity-0 transition-all duration-500" />
    </motion.button>
  );
};

export default BidButton;
