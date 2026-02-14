'use client';

import { motion } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { LeaderboardList } from '@/components/leaderboard/LeaderboardList';
import { Users, Globe, TreePine, MapPin, Bug, Fish, Bird } from 'lucide-react';
import { CardLeaves, TinyLeaf, SmallLeaf, SectionHeader, LeafDivider } from '@/components/ui/LeafDecorations';

export function CommunityView() {
  const { user, leaderboard } = useStore();
  if (!user) return null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-5">
      <CommunityImpact />
      <LeafDivider />
      <CommunityChallenges />
      <LeafDivider />
      <FriendsFeed />
      <NatureIndex />

      <div>
        <SectionHeader>Weekly Leaderboard</SectionHeader>
        <p className="text-[14px] text-[#5e7a5e] mb-4">Weekly ranking by 7-day rolling IQ</p>
        <LeaderboardList users={leaderboard} />
      </div>

      <BiodiversityTracker />
    </motion.div>
  );
}

/* ── Sub-components ── */

function CommunityImpact() {
  const stats = [
    { label: 'Total Users', value: '24.8K', icon: <Users className="w-5 h-5" /> },
    { label: 'CO2 Saved Together', value: '156t', icon: <Globe className="w-5 h-5" /> },
    { label: 'Trees Planted', value: '3,240', icon: <TreePine className="w-5 h-5" /> },
    { label: 'Cities Active', value: '89', icon: <MapPin className="w-5 h-5" /> },
  ];
  return (
    <div>
      <SectionHeader icon={<Users className="w-5 h-5 text-[#2d8a4e]/30" />}>Community Impact</SectionHeader>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((s, i) => (
          <div key={s.label} className="card-surface-sm p-4 text-center relative">
            <CardLeaves variant={(['a', 'b', 'c', 'd'] as const)[i % 4]} />
            <div className="w-10 h-10 mx-auto rounded-full bg-[#2d8a4e]/8 flex items-center justify-center text-[#2d8a4e] mb-2 relative z-10">{s.icon}</div>
            <p className="text-[22px] font-bold text-[#1a2e1a] relative z-10">{s.value}</p>
            <p className="text-[11px] text-[#5e7a5e] mt-0.5 relative z-10">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function CommunityChallenges() {
  const challenges = [
    { id: 1, title: 'No-Car Week', desc: 'Avoid personal cars for 7 days', participants: 1247, daysLeft: 4, color: '#2d8a4e', progress: 43 },
    { id: 2, title: 'Plant-Based February', desc: 'Go meat-free for the whole month', participants: 3891, daysLeft: 15, color: '#5cb85c', progress: 67 },
    { id: 3, title: 'Zero Waste Weekend', desc: 'Produce zero landfill waste', participants: 856, daysLeft: 2, color: '#8fd18f', progress: 80 },
  ];

  return (
    <div>
      <SectionHeader>Community Challenges</SectionHeader>
      <div className="lg:grid lg:grid-cols-3 lg:gap-3 space-y-2 lg:space-y-0">
        {challenges.map((c, i) => (
          <div key={c.id} className="card-surface p-4">
            <CardLeaves variant={(['a', 'b', 'c'] as const)[i % 3]} />
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-[15px] font-semibold text-[#1a2e1a]">{c.title}</p>
                  <p className="text-[12px] text-[#5e7a5e] mt-0.5">{c.desc}</p>
                </div>
                <span className="text-[11px] text-[#5e7a5e] bg-[#2d8a4e]/8 px-2 py-1 rounded-full shrink-0">{c.daysLeft}d left</span>
              </div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[12px] text-[#5e7a5e]">{c.participants.toLocaleString()} joined</span>
                <span className="text-[12px] font-medium tabular-nums text-[#1a2e1a]">{c.progress}%</span>
              </div>
              <div className="h-[6px] rounded-full bg-[#2d8a4e]/8">
                <div className="h-full rounded-full transition-all" style={{ width: `${c.progress}%`, backgroundColor: c.color }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FriendsFeed() {
  const friends = [
    { name: 'Emma', action: 'Completed No-Car Week challenge', time: '2h ago', emoji: '🚶‍♀️', iq: '+3.2' },
    { name: 'Alex', action: 'Planted 3 new herbs in their garden', time: '5h ago', emoji: '🌱', iq: '+1.5' },
    { name: 'Jordan', action: 'Went fully plant-based for a week', time: '1d ago', emoji: '🥗', iq: '+4.8' },
    { name: 'Sam', action: 'Switched to renewable energy provider', time: '2d ago', emoji: '⚡', iq: '+6.0' },
  ];
  return (
    <div>
      <SectionHeader icon={<Users className="w-5 h-5 text-[#2d8a4e]/30" />}>Friends Activity</SectionHeader>
      <div className="card-surface p-5">
        <CardLeaves variant="a" />
        <div className="space-y-3 relative z-10">
          {friends.map((f, i) => (
            <div key={i} className="flex items-center gap-3 py-2 border-b border-[#2d8a4e]/5 last:border-0">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#2d8a4e]/20 to-[#5cb85c]/20 flex items-center justify-center text-[16px]">{f.emoji}</div>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] text-[#1a2e1a]"><span className="font-semibold">{f.name}</span> {f.action}</p>
                <p className="text-[11px] text-[#5e7a5e]">{f.time}</p>
              </div>
              <span className="text-[13px] font-semibold text-[#2d8a4e] tabular-nums shrink-0">{f.iq}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function NatureIndex() {
  const metrics = [
    { label: 'Trees Equivalent Saved', value: '12', unit: 'trees/yr', icon: <TreePine className="w-5 h-5" /> },
    { label: 'Ocean Plastic Avoided', value: '4.2', unit: 'kg/yr', icon: <Fish className="w-5 h-5" /> },
    { label: 'Wildlife Habitat Protected', value: '0.3', unit: 'acres', icon: <Bird className="w-5 h-5" /> },
  ];
  return (
    <div>
      <SectionHeader icon={<TreePine className="w-5 h-5 text-[#2d8a4e]/30" />}>Nature Index</SectionHeader>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {metrics.map((m, i) => (
          <div key={m.label} className="card-surface p-4 flex items-center gap-4">
            <CardLeaves variant={(['a', 'b', 'c'] as const)[i % 3]} />
            <div className="w-12 h-12 rounded-[14px] bg-[#2d8a4e]/8 flex items-center justify-center text-[#2d8a4e] shrink-0 relative z-10">{m.icon}</div>
            <div className="relative z-10">
              <p className="text-[24px] font-bold tabular-nums text-[#1a2e1a] leading-tight">{m.value}</p>
              <p className="text-[11px] text-[#5e7a5e]">{m.unit}</p>
              <p className="text-[12px] text-[#5e7a5e] mt-0.5">{m.label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BiodiversityTracker() {
  const species = [
    { name: 'Monarch Butterfly', status: 'Endangered', trend: 'up', emoji: '🦋', change: '+12%' },
    { name: 'Honeybee Colony', status: 'Recovering', trend: 'up', emoji: '🐝', change: '+8%' },
    { name: 'Local Songbirds', status: 'Stable', trend: 'stable', emoji: '🐦', change: '0%' },
    { name: 'River Salmon', status: 'At Risk', trend: 'down', emoji: '🐟', change: '-5%' },
    { name: 'Oak Trees', status: 'Thriving', trend: 'up', emoji: '🌳', change: '+3%' },
  ];
  return (
    <div>
      <SectionHeader icon={<Bug className="w-5 h-5 text-[#2d8a4e]/30" />}>Biodiversity Tracker</SectionHeader>
      <div className="card-surface p-5">
        <CardLeaves variant="c" />
        <p className="text-[12px] text-[#5e7a5e] mb-4 relative z-10">Local species health in your area</p>
        <div className="space-y-3 relative z-10">
          {species.map((s) => (
            <div key={s.name} className="flex items-center gap-3 py-2 border-b border-[#2d8a4e]/5 last:border-0">
              <span className="text-[24px]">{s.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-medium text-[#1a2e1a]">{s.name}</p>
                <p className="text-[12px] text-[#5e7a5e]">{s.status}</p>
              </div>
              <span className={`text-[13px] font-semibold tabular-nums ${s.trend === 'up' ? 'text-[#2d8a4e]' : s.trend === 'down' ? 'text-[#d94f4f]' : 'text-[#5e7a5e]'}`}>{s.change}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
