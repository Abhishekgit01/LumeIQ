'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { ImpactModes } from '@/components/dashboard/ImpactModes';
import { Sprout, Heart, Award, Star, CheckCircle2, Leaf } from 'lucide-react';
import { CardLeaves, TinyLeaf, SmallLeaf, SectionHeader, LeafDivider } from '@/components/ui/LeafDecorations';
import { User } from '@/types';

export function ActivitiesView() {
  const { user } = useStore();
  if (!user) return null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-5">
      <ImpactModes />

      <LeafDivider />

      <EcoHabitsHeatmap />
      <PlantTracker />

      <div className="lg:grid lg:grid-cols-2 lg:gap-5 flex flex-col gap-4">
        <GreenShoppingScore user={user} />
        <MindfulMinutes />
      </div>

      <LeafDivider />

      <Achievements user={user} />
      <EcoMilestones user={user} />
      <GardenJournal />
    </motion.div>
  );
}

/* ── Sub-components ── */

function EcoHabitsHeatmap() {
  const habits = ['Recycle', 'Walk/Bike', 'Plant-Based', 'No Waste', 'Save Energy'];
  const daysOfWeek = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const data = useMemo(() => habits.map(() => daysOfWeek.map(() => Math.random() > 0.4 ? Math.floor(Math.random() * 3) + 1 : 0)), []);
  const getColor = (val: number) => val === 0 ? 'bg-[#2d8a4e]/5' : val === 1 ? 'bg-[#8fd18f]' : val === 2 ? 'bg-[#5cb85c]' : 'bg-[#2d8a4e]';

  return (
    <div className="card-surface p-5">
      <CardLeaves variant="c" />
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center gap-2">
          <h3 className="text-[17px] font-semibold text-[#1a2e1a]">Eco Habits</h3>
          <TinyLeaf className="rotate-[-15deg]" />
        </div>
        <span className="text-[12px] text-[#5e7a5e]">This week</span>
      </div>
      <div className="space-y-2 relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-20" />
          {daysOfWeek.map((d, i) => (<div key={i} className="flex-1 text-center text-[10px] text-[#5e7a5e] font-medium">{d}</div>))}
        </div>
        {habits.map((habit, hi) => (
          <div key={habit} className="flex items-center gap-2">
            <span className="w-20 text-[12px] text-[#5e7a5e] truncate shrink-0">{habit}</span>
            {data[hi].map((val, di) => (<div key={di} className={`flex-1 aspect-square rounded-[6px] ${getColor(val)}`} />))}
          </div>
        ))}
      </div>
    </div>
  );
}

function PlantTracker() {
  const plants = [
    { name: 'Basil', daysSince: 12, health: 85, emoji: '🌿' },
    { name: 'Tomato', daysSince: 28, health: 92, emoji: '🍅' },
    { name: 'Succulent', daysSince: 45, health: 78, emoji: '🪴' },
    { name: 'Mint', daysSince: 8, health: 95, emoji: '🌱' },
  ];
  return (
    <div>
      <SectionHeader icon={<Sprout className="w-5 h-5 text-[#2d8a4e]/30" />}>Plant Tracker</SectionHeader>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {plants.map((p, i) => (
          <div key={p.name} className="card-surface-sm p-4 text-center relative">
            <CardLeaves variant={(['a', 'b', 'c', 'd'] as const)[i % 4]} />
            <div className="text-[32px] mb-2 relative z-10">{p.emoji}</div>
            <p className="text-[14px] font-semibold text-[#1a2e1a] relative z-10">{p.name}</p>
            <p className="text-[11px] text-[#5e7a5e] mt-0.5 relative z-10">{p.daysSince} days old</p>
            <div className="h-[4px] rounded-full bg-[#2d8a4e]/8 mt-2 relative z-10">
              <div className="h-full rounded-full bg-[#2d8a4e]" style={{ width: `${p.health}%` }} />
            </div>
            <p className="text-[11px] text-[#2d8a4e] mt-1 relative z-10">{p.health}% health</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function GreenShoppingScore({ user }: { user: User }) {
  const score = Math.round(user.rings.circularity * 0.85);
  const purchases = [
    { item: 'Organic groceries', impact: '+3', type: 'positive' },
    { item: 'Second-hand jacket', impact: '+5', type: 'positive' },
    { item: 'Reusable water bottle', impact: '+2', type: 'positive' },
    { item: 'Fast fashion item', impact: '-4', type: 'negative' },
  ];
  return (
    <div className="card-surface p-5">
      <CardLeaves variant="a" />
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center gap-2">
          <h3 className="text-[17px] font-semibold text-[#1a2e1a]">Green Shopping</h3>
          <SmallLeaf className="text-[#2d8a4e] rotate-[-10deg]" size={10} />
        </div>
        <div className="w-10 h-10 rounded-full bg-[#2d8a4e]/10 flex items-center justify-center">
          <span className="text-[16px] font-bold text-[#2d8a4e]">{score}</span>
        </div>
      </div>
      <div className="space-y-2 relative z-10">
        {purchases.map((p, i) => (
          <div key={i} className="flex items-center justify-between py-2 border-b border-[#2d8a4e]/5 last:border-0">
            <span className="text-[14px] text-[#1a2e1a]">{p.item}</span>
            <span className={`text-[13px] font-semibold tabular-nums ${p.type === 'positive' ? 'text-[#2d8a4e]' : 'text-[#d94f4f]'}`}>{p.impact}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MindfulMinutes() {
  const weekData = [15, 20, 10, 25, 30, 12, 18];
  const total = weekData.reduce((s, v) => s + v, 0);
  const maxW = Math.max(...weekData);
  return (
    <div className="card-surface p-5">
      <CardLeaves variant="d" />
      <div className="flex items-center gap-2 mb-1 relative z-10">
        <Heart className="w-5 h-5 text-[#2d8a4e]" />
        <span className="text-[17px] font-semibold text-[#1a2e1a]">Mindful Minutes</span>
        <TinyLeaf className="rotate-[20deg]" />
      </div>
      <p className="text-[12px] text-[#5e7a5e] mb-3 relative z-10">Time spent in nature & mindfulness</p>
      <p className="text-[32px] font-bold tabular-nums leading-none text-[#1a2e1a] mb-4 relative z-10">{total}<span className="text-[16px] font-semibold text-[#5e7a5e]"> min</span></p>
      <div className="flex items-end gap-1.5 h-[50px] relative z-10">
        {weekData.map((val, i) => (
          <div key={i} className="flex-1">
            <motion.div className="w-full rounded-t-[4px] bg-[#8fd18f]" initial={{ height: 0 }} animate={{ height: `${(val / maxW) * 100}%` }} transition={{ delay: i * 0.05, duration: 0.4 }} />
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-1.5 relative z-10">
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (<span key={i} className="text-[10px] text-[#5e7a5e] flex-1 text-center">{d}</span>))}
      </div>
    </div>
  );
}

function Achievements({ user }: { user: User }) {
  const badges = [
    { id: 'first-log', label: 'First Step', desc: 'Log your first impact', icon: '🌱', unlocked: user.dailyLogs.length >= 1 },
    { id: 'week-streak', label: 'Week Warrior', desc: '7-day streak', icon: '🔥', unlocked: user.dailyLogs.length >= 7 },
    { id: 'ring-close', label: 'Ring Master', desc: 'Close all rings 80%+', icon: '💫', unlocked: user.rings.circularity >= 80 && user.rings.consumption >= 80 && user.rings.mobility >= 80 },
    { id: 'iq-60', label: 'Aware', desc: 'Reach IQ 60', icon: '🧠', unlocked: user.IQ >= 60 },
    { id: 'iq-80', label: 'Progressive', desc: 'Reach IQ 80', icon: '🚀', unlocked: user.IQ >= 80 },
    { id: 'verify-3', label: 'Verified', desc: 'Verify 3 activities', icon: '📸', unlocked: user.dailyLogs.filter(l => l.verified).length >= 3 },
    { id: 'plant-5', label: 'Plant Power', desc: '5 plant-based days', icon: '🥬', unlocked: user.dailyLogs.reduce((n, l) => n + (l.modes.includes('plant-based') ? 1 : 0), 0) >= 5 },
    { id: 'vanguard', label: 'Vanguard', desc: 'Reach Vanguard tier', icon: '🌍', unlocked: user.tier === 'Vanguard' },
  ];

  return (
    <div>
      <SectionHeader icon={<Award className="w-5 h-5 text-[#2d8a4e]/30" />}>Achievements</SectionHeader>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {badges.map((badge, i) => (
          <div key={badge.id} className={`card-surface-sm p-3.5 text-center transition-all relative ${badge.unlocked ? '' : 'opacity-40'}`}>
            <CardLeaves variant={(['a', 'b', 'c', 'd'] as const)[i % 4]} />
            <div className="text-[28px] mb-1.5 relative z-10">{badge.unlocked ? badge.icon : '🔒'}</div>
            <p className="text-[13px] font-semibold text-[#1a2e1a] relative z-10">{badge.label}</p>
            <p className="text-[11px] text-[#5e7a5e] mt-0.5 relative z-10">{badge.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function EcoMilestones({ user }: { user: User }) {
  const milestones = [
    { label: 'First Plant-Based Day', target: 1, current: user.dailyLogs.filter(l => l.modes.includes('plant-based')).length, emoji: '🌿' },
    { label: '10 Days Active', target: 10, current: user.dailyLogs.length, emoji: '📅' },
    { label: 'IQ Score 50+', target: 50, current: Math.round(user.IQ), emoji: '🧠' },
    { label: '100kg CO2 Saved', target: 100, current: Math.round(user.IQ * 0.8), emoji: '🌍' },
    { label: 'Close All Rings 90%+', target: 90, current: Math.round(Math.min(user.rings.circularity, user.rings.consumption, user.rings.mobility)), emoji: '💪' },
    { label: '30 Day Streak', target: 30, current: user.dailyLogs.length, emoji: '🔥' },
  ];
  return (
    <div>
      <SectionHeader icon={<Star className="w-5 h-5 text-[#2d8a4e]/30" />}>Milestones</SectionHeader>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {milestones.map((m, i) => {
          const pct = Math.min(100, (m.current / m.target) * 100);
          const done = m.current >= m.target;
          return (
            <div key={m.label} className="card-surface-sm p-4 relative">
              <CardLeaves variant={(['a', 'b', 'c', 'd'] as const)[i % 4]} />
              <div className="flex items-center gap-2 mb-2 relative z-10">
                <span className="text-[20px]">{m.emoji}</span>
                {done && <CheckCircle2 className="w-4 h-4 text-[#2d8a4e]" />}
              </div>
              <p className="text-[13px] font-medium text-[#1a2e1a] relative z-10">{m.label}</p>
              <div className="h-[4px] rounded-full bg-[#2d8a4e]/8 mt-2 relative z-10">
                <div className="h-full rounded-full bg-[#2d8a4e] transition-all" style={{ width: `${pct}%` }} />
              </div>
              <p className="text-[11px] text-[#5e7a5e] mt-1 tabular-nums relative z-10">{Math.round(pct)}% complete</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function GardenJournal() {
  const entries = [
    { date: 'Feb 12', note: 'Planted spring herbs - basil, cilantro, parsley', emoji: '🌿', type: 'Planting' },
    { date: 'Feb 10', note: 'Composted 2kg kitchen scraps', emoji: '♻️', type: 'Composting' },
    { date: 'Feb 8', note: 'Watered garden with collected rainwater', emoji: '💧', type: 'Watering' },
    { date: 'Feb 5', note: 'Harvested first winter lettuce!', emoji: '🥬', type: 'Harvest' },
  ];
  return (
    <div>
      <SectionHeader>Garden Journal</SectionHeader>
      <div className="card-surface p-5">
        <CardLeaves variant="d" />
        <div className="space-y-3 relative z-10">
          {entries.map((e, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="flex flex-col items-center">
                <span className="text-[20px]">{e.emoji}</span>
                {i < entries.length - 1 && <div className="w-[1px] h-6 bg-[#2d8a4e]/10 mt-1" />}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-[#5e7a5e]">{e.date}</span>
                  <span className="text-[10px] text-[#2d8a4e] bg-[#2d8a4e]/8 px-2 py-0.5 rounded-full">{e.type}</span>
                </div>
                <p className="text-[14px] text-[#1a2e1a] mt-0.5">{e.note}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
