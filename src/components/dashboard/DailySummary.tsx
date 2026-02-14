'use client';

import { motion } from 'framer-motion';
import { RingValues } from '@/types';

interface DailySummaryProps {
  rings: RingValues;
  ringChanges?: RingValues;
}

export function DailySummary({ rings, ringChanges }: DailySummaryProps) {
  const ringData = [
    { key: 'circularity' as const, label: 'Circularity', color: '#2d8a4e' },
    { key: 'consumption' as const, label: 'Consumption', color: '#5cb85c' },
    { key: 'mobility' as const, label: 'Mobility', color: '#8fd18f' }
  ];
  
  const avg = Math.round(
    (rings.circularity + rings.consumption + rings.mobility) / 3
  );
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="w-full"
    >
      <div className="card-surface p-5">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[12px] text-[#5e7a5e]">Average</span>
        </div>
        <p className="text-[32px] font-bold tracking-[-0.02em] text-[#1a2e1a] leading-tight mb-4">
          {avg}<span className="text-[20px] font-semibold text-[#5e7a5e]">%</span>
        </p>

        {/* Bar chart */}
        <div className="flex items-end gap-2 h-[100px] mb-4">
          {ringData.map((ring, i) => {
            const val = Math.round(rings[ring.key]);
            return (
              <div key={ring.key} className="flex-1 flex flex-col items-center gap-1">
                <motion.div
                  className="w-full rounded-t-md"
                  style={{ backgroundColor: ring.color }}
                  initial={{ height: 0 }}
                  animate={{ height: `${val}%` }}
                  transition={{ delay: 0.4 + i * 0.1, duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                />
              </div>
            );
          })}
        </div>

        {/* Labels */}
        <div className="flex gap-2">
          {ringData.map((ring) => (
            <div key={ring.key} className="flex-1 text-center">
              <span className="text-[11px] text-[#5e7a5e]">{ring.label}</span>
              <p className="text-[14px] font-semibold tabular-nums text-[#1a2e1a]">
                {Math.round(rings[ring.key])}%
                {ringChanges && ringChanges[ring.key] > 0 && (
                  <span className="text-[#2d8a4e] text-[11px] ml-1">
                    +{Math.round(ringChanges[ring.key])}
                  </span>
                )}
              </p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
