'use client';

import { motion } from 'framer-motion';
import { TierLevel, TIER_DEFINITIONS } from '@/types';

interface IQDisplayProps {
  iq: number;
  tier: TierLevel;
}

export function IQDisplay({ iq, tier }: IQDisplayProps) {
  const displayIQ = Math.round(iq);
  
  return (
    <motion.div 
      className="text-center"
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
    >
      <motion.div 
        className="text-[40px] font-bold tracking-[-0.03em] leading-none text-[#1a2e1a]"
        key={iq}
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        {displayIQ}
      </motion.div>
      
      <p className="text-[11px] text-[#5e7a5e] uppercase tracking-[0.06em] font-medium mt-0.5">
        Impact IQ
      </p>
    </motion.div>
  );
}
