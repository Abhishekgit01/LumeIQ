'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { IQChart } from '@/components/profile/IQChart';
import { Globe, Bike, Footprints, MapPin, Zap, BarChart3, Lightbulb, ShoppingBag, Utensils, Recycle, Wind, Calendar } from 'lucide-react';
import { CardLeaves, TinyLeaf, SmallLeaf, SectionHeader, LeafDivider } from '@/components/ui/LeafDecorations';
import { User } from '@/types';

export function InsightsView() {
  const { user } = useStore();
  if (!user) return null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-5">
      <ImpactComparison user={user} />

      <div className="lg:grid lg:grid-cols-2 lg:gap-5 flex flex-col gap-4">
        <SustainabilityBreakdown user={user} />
        <CarbonBudget user={user} />
      </div>

      <LeafDivider />

      <TransportLog />
      <IQChart user={user} days={30} />

      <div className="lg:grid lg:grid-cols-2 lg:gap-5 flex flex-col gap-4">
        <AirQuality user={user} />
        <MonthlyReport user={user} />
      </div>
    </motion.div>
  );
}

/* ── Sub-components ── */

function ImpactComparison({ user }: { user: User }) {
  const comparisons = [
    { label: 'Your IQ', value: Math.round(user.IQ), avg: 45, max: 100, color: '#2d8a4e' },
    { label: 'Circularity', value: Math.round(user.rings.circularity), avg: 35, max: 100, color: '#2d8a4e' },
    { label: 'Consumption', value: Math.round(user.rings.consumption), avg: 40, max: 100, color: '#5cb85c' },
    { label: 'Mobility', value: Math.round(user.rings.mobility), avg: 30, max: 100, color: '#8fd18f' },
  ];
  return (
    <div className="card-surface p-5">
      <CardLeaves variant="b" />
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[17px] font-semibold text-[#1a2e1a]">How You Compare</span>
            <TinyLeaf className="rotate-[-20deg]" />
          </div>
          <p className="text-[12px] text-[#5e7a5e] mt-0.5">vs community average in {user.baseline.city}</p>
        </div>
        <Globe className="w-5 h-5 text-[#5e7a5e]" />
      </div>
      <div className="space-y-3 relative z-10">
        {comparisons.map((c) => (
          <div key={c.label}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[13px] text-[#5e7a5e]">{c.label}</span>
              <div className="flex items-center gap-3">
                <span className="text-[13px] font-semibold tabular-nums text-[#1a2e1a]">{c.value}</span>
                <span className="text-[11px] text-[#5e7a5e]">avg {c.avg}</span>
              </div>
            </div>
            <div className="h-[8px] rounded-full bg-[#2d8a4e]/8 relative">
              <motion.div className="h-full rounded-full absolute left-0 top-0" style={{ backgroundColor: c.color }} initial={{ width: 0 }} animate={{ width: `${(c.value / c.max) * 100}%` }} transition={{ duration: 0.8 }} />
              <div className="absolute top-0 h-full w-[2px] bg-[#1a2e1a]/20 rounded-full" style={{ left: `${(c.avg / c.max) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SustainabilityBreakdown({ user }: { user: User }) {
  const areas = [
    { label: 'Transportation', score: Math.round(user.rings.mobility), icon: <Bike className="w-4 h-4" />, tip: 'Try biking once this week' },
    { label: 'Food & Diet', score: Math.round(user.rings.consumption * 0.8), icon: <Utensils className="w-4 h-4" />, tip: 'Add one plant-based meal' },
    { label: 'Waste & Recycling', score: Math.round(user.rings.circularity * 0.9), icon: <Recycle className="w-4 h-4" />, tip: 'Separate plastics this week' },
    { label: 'Energy Usage', score: Math.round((user.rings.consumption + user.rings.circularity) / 2.5), icon: <Lightbulb className="w-4 h-4" />, tip: 'Unplug unused devices' },
    { label: 'Shopping Habits', score: Math.round(user.rings.circularity * 0.7), icon: <ShoppingBag className="w-4 h-4" />, tip: 'Buy second-hand first' },
  ];
  const overallScore = Math.round(areas.reduce((s, a) => s + a.score, 0) / areas.length);

  return (
    <div className="card-surface p-5">
      <CardLeaves variant="d" />
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-[17px] font-semibold text-[#1a2e1a]">Sustainability Score</h3>
            <TinyLeaf className="rotate-[25deg]" />
          </div>
          <p className="text-[12px] text-[#5e7a5e]">Breakdown by category</p>
        </div>
        <div className="w-12 h-12 rounded-full bg-[#2d8a4e]/10 flex items-center justify-center">
          <span className="text-[18px] font-bold text-[#2d8a4e]">{overallScore}</span>
        </div>
      </div>
      <div className="space-y-3 relative z-10">
        {areas.map((a) => (
          <div key={a.label} className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#2d8a4e]/8 flex items-center justify-center text-[#2d8a4e] shrink-0">{a.icon}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[13px] font-medium text-[#1a2e1a]">{a.label}</span>
                <span className="text-[13px] font-semibold tabular-nums text-[#2d8a4e]">{a.score}</span>
              </div>
              <div className="h-[5px] rounded-full bg-[#2d8a4e]/8">
                <motion.div className="h-full rounded-full bg-[#2d8a4e]" initial={{ width: 0 }} animate={{ width: `${a.score}%` }} transition={{ duration: 0.7 }} />
              </div>
              <p className="text-[11px] text-[#5e7a5e] mt-0.5">{a.tip}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CarbonBudget({ user }: { user: User }) {
  const monthlyBudget = 800;
  const used = Math.round(monthlyBudget * (1 - user.IQ / 200));
  const remaining = monthlyBudget - used;
  const pct = Math.round((used / monthlyBudget) * 100);
  return (
    <div className="card-surface p-5">
      <CardLeaves variant="b" />
      <div className="flex items-center gap-2 mb-1 relative z-10">
        <BarChart3 className="w-5 h-5 text-[#2d8a4e]" />
        <span className="text-[17px] font-semibold text-[#1a2e1a]">Carbon Budget</span>
        <SmallLeaf className="text-[#5cb85c] rotate-[-10deg]" size={10} />
      </div>
      <p className="text-[12px] text-[#5e7a5e] mb-4 relative z-10">Monthly CO2 allowance</p>
      <div className="flex items-center gap-6 relative z-10">
        <div className="relative w-24 h-24">
          <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="42" stroke="#2d8a4e" strokeOpacity="0.08" strokeWidth="10" fill="none" />
            <circle cx="50" cy="50" r="42" stroke="#2d8a4e" strokeWidth="10" fill="none" strokeDasharray={`${pct * 2.64} ${264 - pct * 2.64}`} strokeLinecap="round" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[20px] font-bold text-[#2d8a4e]">{pct}%</span>
          </div>
        </div>
        <div>
          <p className="text-[28px] font-bold tabular-nums text-[#1a2e1a] leading-tight">{remaining}<span className="text-[14px] text-[#5e7a5e]"> kg left</span></p>
          <p className="text-[12px] text-[#5e7a5e] mt-1">{used} kg used of {monthlyBudget} kg budget</p>
          <p className="text-[12px] text-[#2d8a4e] font-medium mt-0.5">{remaining > 200 ? 'On track!' : remaining > 50 ? 'Watch spending' : 'Over budget'}</p>
        </div>
      </div>
    </div>
  );
}

function TransportLog() {
  const modes = [
    { mode: 'Walking', distance: '12.4 km', co2: '0 kg', pct: 35, color: '#2d8a4e', icon: <Footprints className="w-4 h-4" /> },
    { mode: 'Cycling', distance: '8.2 km', co2: '0 kg', pct: 25, color: '#5cb85c', icon: <Bike className="w-4 h-4" /> },
    { mode: 'Public Transit', distance: '22.1 km', co2: '1.8 kg', pct: 30, color: '#8fd18f', icon: <MapPin className="w-4 h-4" /> },
    { mode: 'Car', distance: '5.0 km', co2: '1.2 kg', pct: 10, color: '#3a7d5c', icon: <Zap className="w-4 h-4" /> },
  ];
  return (
    <div className="card-surface p-5">
      <CardLeaves variant="d" />
      <div className="flex items-center gap-2 mb-1 relative z-10">
        <Bike className="w-5 h-5 text-[#2d8a4e]" />
        <span className="text-[17px] font-semibold text-[#1a2e1a]">Transport Log</span>
        <TinyLeaf className="rotate-[25deg]" />
      </div>
      <p className="text-[12px] text-[#5e7a5e] mb-4 relative z-10">This week&apos;s travel breakdown</p>
      <div className="h-[10px] rounded-full overflow-hidden flex mb-4 relative z-10">
        {modes.map((m) => (<div key={m.mode} className="h-full" style={{ width: `${m.pct}%`, backgroundColor: m.color }} />))}
      </div>
      <div className="space-y-2.5 relative z-10">
        {modes.map((m) => (
          <div key={m.mode} className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: `${m.color}15`, color: m.color }}>{m.icon}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-medium text-[#1a2e1a]">{m.mode}</span>
                <span className="text-[12px] text-[#5e7a5e] tabular-nums">{m.distance}</span>
              </div>
              <p className="text-[11px] text-[#5e7a5e]">{m.co2} CO2</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AirQuality({ user }: { user: User }) {
  const aqi = 42;
  return (
    <div className="card-surface p-5">
      <CardLeaves variant="b" />
      <div className="flex items-center gap-2 mb-1 relative z-10">
        <Wind className="w-5 h-5 text-[#2d8a4e]" />
        <span className="text-[17px] font-semibold text-[#1a2e1a]">Air Quality</span>
        <TinyLeaf className="rotate-[30deg]" />
      </div>
      <p className="text-[12px] text-[#5e7a5e] mb-4 relative z-10">{user.baseline.city} - Today</p>
      <div className="flex items-end gap-4 relative z-10">
        <div>
          <p className="text-[48px] font-bold tabular-nums leading-none text-[#2d8a4e]">{aqi}</p>
          <p className="text-[14px] font-medium text-[#2d8a4e] mt-1">Good</p>
        </div>
        <div className="flex-1 ml-4">
          <div className="h-[10px] rounded-full overflow-hidden flex">
            <div className="h-full bg-[#2d8a4e]" style={{ width: '33%' }} />
            <div className="h-full bg-[#5cb85c]" style={{ width: '33%' }} />
            <div className="h-full bg-[#8fd18f]" style={{ width: '34%' }} />
          </div>
          <div className="flex justify-between mt-1"><span className="text-[10px] text-[#5e7a5e]">0</span><span className="text-[10px] text-[#5e7a5e]">150</span><span className="text-[10px] text-[#5e7a5e]">300</span></div>
        </div>
      </div>
    </div>
  );
}

function MonthlyReport({ user }: { user: User }) {
  const month = new Date().toLocaleDateString('en-US', { month: 'long' });
  const highlights = [
    { label: 'IQ Change', value: `+${(user.IQ * 0.12).toFixed(1)}`, color: '#2d8a4e' },
    { label: 'CO2 Saved', value: `${(user.IQ * 0.3).toFixed(0)}kg`, color: '#5cb85c' },
    { label: 'Streaks', value: `${Math.max(1, user.dailyLogs.length)}d`, color: '#8fd18f' },
    { label: 'Modes Logged', value: `${user.dailyLogs.reduce((s, l) => s + l.modes.length, 0)}`, color: '#3a7d5c' },
  ];
  return (
    <div className="card-surface p-5">
      <CardLeaves variant="c" />
      <div className="flex items-center gap-2 mb-4 relative z-10">
        <Calendar className="w-5 h-5 text-[#2d8a4e]" />
        <span className="text-[17px] font-semibold text-[#1a2e1a]">{month} Report</span>
        <TinyLeaf className="rotate-[15deg]" />
      </div>
      <div className="grid grid-cols-2 gap-3 relative z-10">
        {highlights.map((h) => (
          <div key={h.label} className="text-center p-3 rounded-[12px] bg-[#2d8a4e]/5">
            <p className="text-[24px] font-bold tabular-nums" style={{ color: h.color }}>{h.value}</p>
            <p className="text-[12px] text-[#5e7a5e] mt-1">{h.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
