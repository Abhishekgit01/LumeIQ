'use client';

import { motion } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { RingGroup } from '@/components/rings/RingGroup';
import { IQDisplay } from '@/components/dashboard/IQDisplay';
import { DailySummary } from '@/components/dashboard/DailySummary';
import { ChevronRight, Flame, Target, Zap, Droplets, BatteryCharging, Leaf, Sprout } from 'lucide-react';
import { CardLeaves, TinyLeaf, SmallLeaf, SectionHeader, LeafDivider } from '@/components/ui/LeafDecorations';
import { User } from '@/types';

export function DashboardView() {
  const { user } = useStore();
  if (!user) return null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-5">
      {/* Mobile date */}
      <div className="lg:hidden flex items-center gap-2">
        <p className="text-[14px] text-[#5e7a5e]">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
        <Leaf className="w-3 h-3 text-[#2d8a4e]/20" />
      </div>

      <div className="lg:grid lg:grid-cols-2 lg:gap-5 flex flex-col gap-4">
        {/* LEFT COLUMN */}
        <div className="flex flex-col gap-4">
          <ImpactIQCard user={user} />
          <StatsRow user={user} />
          <DailySummary rings={user.rings} />
          <WeeklyGoals user={user} />
        </div>

        {/* RIGHT COLUMN */}
        <div className="flex flex-col gap-4">
          <CarbonFootprint user={user} />
          <StreakCalendar user={user} />
          <WaterUsage />
          <EnergyMonitor />
        </div>
      </div>

      <LeafDivider />

      {/* Eco Coach */}
      <div>
        <SectionHeader icon={<Sprout className="w-5 h-5 text-[#2d8a4e]/30" />}>Eco Coach</SectionHeader>
        <div className="lg:grid lg:grid-cols-3 lg:gap-3 space-y-2 lg:space-y-0">
          {getCoachSuggestions(user.rings, user.IQ).map((tip, i) => (
            <div key={tip.id} className="card-surface-sm flex items-center gap-3 px-4 py-3.5 relative">
              <CardLeaves variant={(['a', 'b', 'c', 'd'] as const)[i % 4]} />
              <span className="text-[20px] shrink-0 relative z-10">{tip.icon}</span>
              <div className="flex-1 min-w-0 relative z-10">
                <p className="font-medium text-[14px] text-[#1a2e1a]">{tip.title}</p>
                <p className="text-[12px] text-[#5e7a5e] mt-0.5 leading-relaxed">{tip.body}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-[#c8dfc8] shrink-0 relative z-10" />
            </div>
          ))}
        </div>
      </div>

      <RecentActivity user={user} />
    </motion.div>
  );
}

/* ── Sub-components ── */

function ImpactIQCard({ user }: { user: User }) {
  return (
    <div className="card-surface p-5">
      <CardLeaves variant="b" />
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center gap-2">
          <span className="text-[17px] font-semibold text-[#1a2e1a]">Impact IQ</span>
          <SmallLeaf className="text-[#2d8a4e] rotate-[-10deg]" size={12} />
        </div>
        <button className="w-8 h-8 rounded-full bg-[#2d8a4e]/8 flex items-center justify-center">
          <ChevronRight className="w-4 h-4 text-[#5e7a5e]" />
        </button>
      </div>
      <div className="flex items-center justify-center py-2 relative z-10">
        <div className="relative">
          <RingGroup rings={user.rings} />
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <IQDisplay iq={user.IQ} tier={user.tier} />
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center gap-5 mt-4 relative z-10">
        {[
          { label: 'Circularity', color: '#2d8a4e' },
          { label: 'Consumption', color: '#5cb85c' },
          { label: 'Mobility', color: '#8fd18f' }
        ].map((ring) => (
          <div key={ring.label} className="flex items-center gap-1.5">
            <div className="w-[7px] h-[7px] rounded-full" style={{ backgroundColor: ring.color }} />
            <span className="text-[12px] text-[#5e7a5e]">{ring.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatsRow({ user }: { user: User }) {
  const stats = [
    { label: 'Streak', value: Math.max(1, user.dailyLogs.length).toString(), sub: 'days' },
    { label: 'Best Ring', value: getBestRingLabel(user.rings), sub: 'Leading' },
    { label: 'Tier', value: user.tier, sub: 'Rank' },
  ];
  return (
    <div className="grid grid-cols-3 gap-3">
      {stats.map((stat) => (
        <div key={stat.label} className="card-surface-sm p-3.5 relative">
          <TinyLeaf className="absolute top-1.5 right-2 rotate-[15deg]" />
          <span className="text-[12px] text-[#5e7a5e]">{stat.label}</span>
          <p className={`${stat.label === 'Streak' ? 'text-[24px]' : 'text-[16px]'} font-bold tabular-nums leading-tight mt-1 text-[#1a2e1a]`}>{stat.value}</p>
          <p className="text-[12px] text-[#5e7a5e]">{stat.sub}</p>
        </div>
      ))}
    </div>
  );
}

function WeeklyGoals({ user }: { user: User }) {
  const goals = [
    { label: 'Close all rings 3x', progress: Math.min(3, user.dailyLogs.length), target: 3, icon: <Target className="w-4 h-4" /> },
    { label: 'Log 5 impact modes', progress: Math.min(5, user.dailyLogs.reduce((sum, l) => sum + l.modes.length, 0)), target: 5, icon: <Zap className="w-4 h-4" /> },
    { label: 'Maintain 7-day streak', progress: Math.min(7, user.dailyLogs.length), target: 7, icon: <Flame className="w-4 h-4" /> },
  ];

  return (
    <div className="card-surface p-5">
      <CardLeaves variant="c" />
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center gap-2">
          <span className="text-[17px] font-semibold text-[#1a2e1a]">Weekly Goals</span>
          <TinyLeaf className="rotate-[15deg]" />
        </div>
        <span className="text-[12px] text-[#5e7a5e]">{goals.filter(g => g.progress >= g.target).length}/{goals.length} done</span>
      </div>
      <div className="space-y-3 relative z-10">
        {goals.map((goal) => {
          const pct = Math.min(100, (goal.progress / goal.target) * 100);
          const done = goal.progress >= goal.target;
          return (
            <div key={goal.label}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className={done ? 'text-[#2d8a4e]' : 'text-[#5e7a5e]'}>{goal.icon}</span>
                  <span className={`text-[14px] font-medium ${done ? 'text-[#2d8a4e]' : 'text-[#1a2e1a]'}`}>{goal.label}</span>
                </div>
                <span className="text-[12px] tabular-nums text-[#5e7a5e]">{goal.progress}/{goal.target}</span>
              </div>
              <div className="h-[6px] rounded-full bg-[#2d8a4e]/8">
                <motion.div className="h-full rounded-full" style={{ backgroundColor: done ? '#2d8a4e' : '#5cb85c' }} initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CarbonFootprint({ user }: { user: User }) {
  const baselineCarbon = 16.0;
  const reductionPct = Math.min(60, (user.IQ / 100) * 55);
  const currentCarbon = baselineCarbon * (1 - reductionPct / 100);
  const saved = baselineCarbon - currentCarbon;
  const categories = [
    { label: 'Transport', value: currentCarbon * 0.35, color: '#2d8a4e' },
    { label: 'Diet', value: currentCarbon * 0.25, color: '#5cb85c' },
    { label: 'Home', value: currentCarbon * 0.25, color: '#8fd18f' },
    { label: 'Shopping', value: currentCarbon * 0.15, color: '#3a7d5c' },
  ];
  const maxVal = Math.max(...categories.map(c => c.value));

  return (
    <div className="card-surface p-5">
      <CardLeaves variant="d" />
      <div className="flex items-center justify-between mb-1 relative z-10">
        <div className="flex items-center gap-2">
          <span className="text-[17px] font-semibold text-[#1a2e1a]">Carbon Footprint</span>
          <SmallLeaf className="text-[#2d8a4e] rotate-[-15deg]" size={10} />
        </div>
      </div>
      <p className="text-[12px] text-[#5e7a5e] mb-4 relative z-10">Estimated annual CO2</p>
      <div className="flex items-end gap-6 mb-4 relative z-10">
        <div>
          <p className="text-[36px] font-bold tabular-nums leading-none text-[#1a2e1a]">{currentCarbon.toFixed(1)}</p>
          <p className="text-[13px] text-[#5e7a5e] mt-1">tonnes/year</p>
        </div>
        <div className="card-surface-sm px-3 py-1.5">
          <p className="text-[14px] font-semibold text-[#2d8a4e]">-{saved.toFixed(1)}t saved</p>
          <p className="text-[11px] text-[#5e7a5e]">vs US average</p>
        </div>
      </div>
      <div className="space-y-2.5 relative z-10">
        {categories.map((cat) => (
          <div key={cat.label}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[13px] text-[#5e7a5e]">{cat.label}</span>
              <span className="text-[13px] font-medium tabular-nums text-[#1a2e1a]">{cat.value.toFixed(1)}t</span>
            </div>
            <div className="h-[8px] rounded-full bg-[#2d8a4e]/8">
              <motion.div className="h-full rounded-full" style={{ backgroundColor: cat.color }} initial={{ width: 0 }} animate={{ width: `${(cat.value / maxVal) * 100}%` }} transition={{ duration: 0.8 }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StreakCalendar({ user }: { user: User }) {
  const logDates = new Set(user.dailyLogs.map(l => l.date));
  const today = new Date();
  const days: { date: string; hasLog: boolean; day: number }[] = [];
  for (let i = 27; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    days.push({ date: dateStr, hasLog: logDates.has(dateStr), day: d.getDate() });
  }

  return (
    <div className="card-surface p-5">
      <CardLeaves variant="a" />
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center gap-2">
          <span className="text-[17px] font-semibold text-[#1a2e1a]">Activity Calendar</span>
          <TinyLeaf className="rotate-[20deg]" />
        </div>
        <span className="text-[12px] text-[#5e7a5e]">Last 28 days</span>
      </div>
      <div className="grid grid-cols-7 gap-1.5 relative z-10">
        {days.map((d) => (
          <div key={d.date} className="flex flex-col items-center gap-1">
            <div className={`w-7 h-7 rounded-[8px] flex items-center justify-center text-[11px] tabular-nums font-medium ${d.hasLog ? 'bg-[#2d8a4e] text-white' : 'bg-[#2d8a4e]/6 text-[#5e7a5e]'}`}>
              {d.day}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function WaterUsage() {
  const weekData = [0, 0, 0, 0, 0, 0, 0];
  const maxWeek = Math.max(...weekData, 1);
  return (
    <div className="card-surface p-5">
      <CardLeaves variant="b" />
      <div className="flex items-center gap-2 mb-1 relative z-10">
        <Droplets className="w-5 h-5 text-[#2d8a4e]" />
        <span className="text-[17px] font-semibold text-[#1a2e1a]">Water Usage</span>
        <TinyLeaf className="rotate-[-10deg]" />
      </div>
      <p className="text-[12px] text-[#5e7a5e] mb-3 relative z-10">Estimated daily average</p>
      <div className="flex items-end gap-4 mb-4 relative z-10">
        <p className="text-[32px] font-bold tabular-nums leading-none text-[#1a2e1a]">0<span className="text-[16px] font-semibold text-[#5e7a5e]">L</span></p>
        <span className="text-[13px] text-[#5e7a5e] font-medium mb-1">No data yet</span>
      </div>
      <div className="flex items-end gap-1 h-[60px] relative z-10">
        {weekData.map((val, i) => (
          <div key={i} className="flex-1">
            <motion.div className="w-full rounded-t-[4px] bg-[#2d8a4e]" initial={{ height: 0 }} animate={{ height: `${(val / maxWeek) * 100}%` }} transition={{ delay: i * 0.05, duration: 0.5 }} style={{ opacity: i === weekData.length - 1 ? 1 : 0.4 }} />
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-1.5 relative z-10">
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
          <span key={i} className="text-[10px] text-[#5e7a5e] flex-1 text-center">{d}</span>
        ))}
      </div>
    </div>
  );
}

function EnergyMonitor() {
  const categories = [
    { label: 'Heating', pct: 0, color: '#2d8a4e' },
    { label: 'Appliances', pct: 0, color: '#5cb85c' },
    { label: 'Lighting', pct: 0, color: '#8fd18f' },
    { label: 'Other', pct: 0, color: '#3a7d5c' },
  ];
  return (
    <div className="card-surface p-5">
      <CardLeaves variant="c" />
      <div className="flex items-center gap-2 mb-1 relative z-10">
        <BatteryCharging className="w-5 h-5 text-[#5cb85c]" />
        <span className="text-[17px] font-semibold text-[#1a2e1a]">Energy</span>
        <SmallLeaf className="text-[#2d8a4e] rotate-[15deg]" size={10} />
      </div>
      <p className="text-[12px] text-[#5e7a5e] mb-3 relative z-10">Monthly household estimate</p>
      <p className="text-[32px] font-bold tabular-nums leading-none mb-1 text-[#1a2e1a] relative z-10">0<span className="text-[16px] font-semibold text-[#5e7a5e]"> kWh</span></p>
      <p className="text-[13px] text-[#5e7a5e] font-medium mb-4 relative z-10">No data yet</p>
      <div className="h-[12px] rounded-full overflow-hidden flex bg-[#e8f5e8] relative z-10">
        {categories.map((cat) => (
          <motion.div key={cat.label} className="h-full" style={{ backgroundColor: cat.color }} initial={{ width: 0 }} animate={{ width: `${cat.pct}%` }} transition={{ duration: 0.6 }} />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 relative z-10">
        {categories.map((cat) => (
          <div key={cat.label} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
            <span className="text-[11px] text-[#5e7a5e]">{cat.label} {cat.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function RecentActivity({ user }: { user: User }) {
  const recentLogs = user.dailyLogs.slice(-5).reverse();
  const modeLabels: Record<string, string> = { 'plant-based': 'Plant-Based Day', 'transit': 'Transit Day', 'thrift': 'Thrift Hunt', 'repair': 'Repair Session', 'minimal': 'Minimal Mode' };
  const modeIcons: Record<string, string> = { 'plant-based': '🥗', 'transit': '🚌', 'thrift': '👕', 'repair': '🔧', 'minimal': '✨' };

  if (recentLogs.length === 0) {
    return (
      <div>
        <SectionHeader>Recent Activity</SectionHeader>
        <div className="card-surface p-6 text-center">
          <p className="text-[14px] text-[#5e7a5e]">No activity yet. Log your first impact mode!</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <SectionHeader>Recent Activity</SectionHeader>
      <div className="card-surface overflow-hidden">
        <CardLeaves variant="a" />
        {recentLogs.map((log, i) => (
          <div key={log.date + i} className={`flex items-center gap-3 px-4 py-3.5 relative z-10 ${i < recentLogs.length - 1 ? 'border-b border-[#2d8a4e]/5' : ''}`}>
            <div className="w-10 h-10 rounded-[12px] bg-[#2d8a4e]/6 flex items-center justify-center text-[20px]">{modeIcons[log.modes[0]] || '📋'}</div>
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-medium text-[#1a2e1a]">{log.modes.map(m => modeLabels[m] || m).join(', ')}</p>
              <p className="text-[12px] text-[#5e7a5e]">{log.date} {log.verified && '- Verified'}</p>
            </div>
            <div className="text-right shrink-0">
              <p className={`text-[14px] font-semibold tabular-nums ${log.IQChange >= 0 ? 'text-[#2d8a4e]' : 'text-[#d94f4f]'}`}>{log.IQChange >= 0 ? '+' : ''}{log.IQChange.toFixed(1)}</p>
              <p className="text-[11px] text-[#5e7a5e]">IQ</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Helpers ── */

function getBestRingLabel(rings: { circularity: number; consumption: number; mobility: number }) {
  const entries: [string, number][] = [['Circ.', rings.circularity], ['Cons.', rings.consumption], ['Mob.', rings.mobility]];
  entries.sort((a, b) => b[1] - a[1]);
  return entries[0]?.[0] ?? 'Even';
}

function getCoachSuggestions(rings: { circularity: number; consumption: number; mobility: number }, iq: number) {
  const lowest = Math.min(rings.circularity, rings.consumption, rings.mobility);
  const focus: 'circularity' | 'consumption' | 'mobility' = lowest === rings.circularity ? 'circularity' : lowest === rings.consumption ? 'consumption' : 'mobility';
  const baseTips = {
    circularity: [
      { id: 'circ-1', icon: '🧵', title: 'Repair before you replace', body: 'Pick one item you would normally replace and repair it instead.' },
      { id: 'circ-2', icon: '🛍️', title: 'Go second-hand first', body: 'Check thrift or resale options before buying new.' },
    ],
    consumption: [
      { id: 'cons-1', icon: '🥗', title: 'Plan a plant-based day', body: 'Choose one day where every meal is plant-based.' },
      { id: 'cons-2', icon: '🧾', title: 'Audit one category', body: 'Pause one impulse category for 7 days.' },
    ],
    mobility: [
      { id: 'mob-1', icon: '🚍', title: 'Swap one commute', body: 'Replace your easiest commute with transit or cycling.' },
      { id: 'mob-2', icon: '📍', title: 'Cluster your trips', body: 'Batch errands into a single trip to cut distance.' },
    ],
  } as const;
  const progressionTip = iq < 60
    ? { id: 'tier-grow', icon: '🌱', title: 'Build your foundation', body: 'Repeat one easy action daily.' }
    : iq < 80
    ? { id: 'tier-edge', icon: '📈', title: 'Edge into next tier', body: 'Close all three rings for 3 consecutive days.' }
    : { id: 'tier-lead', icon: '🌍', title: 'Lead by example', body: 'Invite a friend to join a challenge.' };
  return [...baseTips[focus], progressionTip];
}
