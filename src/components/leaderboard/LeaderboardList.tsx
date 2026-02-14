'use client';

import { motion } from 'framer-motion';
import { LeaderboardUser } from '@/types';
import { getTierColor } from '@/lib/calculations';

interface LeaderboardListProps {
  users: LeaderboardUser[];
}

export function LeaderboardList({ users }: LeaderboardListProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full"
    >
      <div className="card-surface overflow-hidden">
        <div className="max-h-[65vh] overflow-y-auto scrollbar-thin">
          {users.slice(0, 10).map((user, index) => (
            <LeaderboardItem key={user.id} user={user} index={index} isLast={index === Math.min(users.length, 10) - 1} />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function LeaderboardItem({ user, index, isLast }: { user: LeaderboardUser; index: number; isLast: boolean }) {
  const getMedalColor = (rank: number) => {
    if (rank === 0) return 'bg-[#2d8a4e] text-white';
    if (rank === 1) return 'bg-[#5cb85c] text-white';
    if (rank === 2) return 'bg-[#8fd18f] text-white';
    return 'bg-[#2d8a4e]/8 text-[#5e7a5e]';
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04 }}
      className={`
        flex items-center gap-4 px-5 py-3.5
        ${!isLast ? 'border-b border-[#2d8a4e]/5' : ''}
        ${user.isCurrentUser ? 'bg-[#2d8a4e]/[0.04]' : ''}
      `}
    >
      <div className={`
        w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-bold shrink-0
        ${getMedalColor(index)}
      `}>
        {user.rank}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[15px] font-medium text-[#1a2e1a] truncate">
            {user.isCurrentUser ? 'You' : `User ${user.id.slice(-4)}`}
          </span>
          <span 
            className="text-[11px] px-1.5 py-0.5 rounded-full font-medium shrink-0 bg-[#2d8a4e]/8 text-[#5e7a5e]"
          >
            {user.tier}
          </span>
        </div>
        <div className="text-[12px] text-[#5e7a5e] mt-0.5">
          {user.city} · Top {100 - user.percentile}%
        </div>
      </div>
      
      <div className="text-right shrink-0">
        <div className="text-[17px] font-bold text-[#1a2e1a] tabular-nums">
          {Math.round(user.IQ)}
        </div>
        <div className="text-[11px] text-[#5e7a5e]">IQ</div>
      </div>
    </motion.div>
  );
}
