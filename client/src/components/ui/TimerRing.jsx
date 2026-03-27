import React from 'react';
import { motion } from 'framer-motion';

const TimerRing = ({ seconds, total = 15 }) => {
  const percentage = (seconds / total) * 100;
  const isCritical = seconds <= 5;
  
  return (
    <div className="relative w-32 h-32 flex items-center justify-center">
      <svg className="w-full h-full -rotate-90">
        <circle
          cx="64"
          cy="64"
          r="60"
          className="stroke-white/10 fill-none"
          strokeWidth="8"
        />
        <motion.circle
          cx="64"
          cy="64"
          r="60"
          className={`fill-none ${isCritical ? 'stroke-red-500' : 'stroke-primary'}`}
          strokeWidth="8"
          strokeDasharray="377"
          animate={{ strokeDashoffset: 377 - (377 * percentage) / 100 }}
          transition={{ duration: 1, ease: "linear" }}
          strokeLinecap="round"
        />
      </svg>
      <div className={`absolute inset-0 flex flex-col items-center justify-center ${isCritical ? 'text-red-500 animate-pulse' : 'text-white'}`}>
        <span className="text-4xl font-display font-black leading-none">{seconds}</span>
        <span className="text-[10px] uppercase tracking-widest opacity-60">Seconds</span>
      </div>
    </div>
  );
};

export default TimerRing;
