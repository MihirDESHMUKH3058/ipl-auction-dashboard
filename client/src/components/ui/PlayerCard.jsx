import React from 'react';
import { motion } from 'framer-motion';

const PlayerCard = ({ player, status, finalPrice }) => {
  const isSold = status === 'sold';
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className={`relative glass-card group ${isSold ? 'opacity-75' : ''}`}
    >
      <div className="aspect-[4/5] relative bg-secondary">
        <img 
          src={player.image_url || '/mystery_player_placeholder.png'} 
          alt={player.name}
          className="w-full h-full object-cover"
        />
        {isSold && (
          <motion.div 
            initial={{ scale: 2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]"
          >
            <div className="border-4 border-red-500 text-red-500 font-black text-4xl px-6 py-2 rotate-[-15deg] uppercase">
              Sold
            </div>
          </motion.div>
        )}
      </div>
      
      <div className="p-4 bg-gradient-to-t from-background to-secondary/50">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-display font-bold text-white group-hover:text-primary transition-colors">
            {player.name}
          </h3>
          <span className="text-xs bg-white/10 px-2 py-1 rounded text-primary border border-white/5">
            {player.role}
          </span>
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-sm text-gray-400">
          <div>
            <p className="text-[10px] uppercase tracking-wider">Nationality</p>
            <p className="text-white">{player.nationality}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-wider">Base Price</p>
            <p className="text-primary font-bold">₹{(player.base_price / 10000000).toFixed(2)} Cr</p>
          </div>
        </div>
        
        {isSold && (
          <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center">
            <p className="text-xs uppercase text-gray-400">Winning Bid</p>
            <p className="text-xl font-display font-bold text-primary">₹{(finalPrice / 10000000).toFixed(2)} Cr</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default PlayerCard;
