'use client';

import { motion } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { ChevronRight, Flame, Target, Zap, Droplets, BatteryCharging, Footprints, Gift, Route, ScanLine, Leaf } from 'lucide-react';
import { User } from '@/types';
import { useExtensionStore } from '@/store/useExtensionStore';

/* ─── Activity Ring SVG (Apple Fitness style) ─── */
function ActivityRing({ value, max, color, size, strokeWidth = 8 }: {
  value: number; max: number; color: string; size: number; strokeWidth?: number;
}) {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const pct = max > 0 ? Math.min(value / max, 1) : 0;

  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={color} strokeWidth={strokeWidth} opacity={0.2} strokeLinecap="round" />
      <motion.circle cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: circ - pct * circ }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
      />
    </svg>
  );
}

function TripleRings({ rings }: { rings: { circularity: number; consumption: number; mobility: number } }) {
  const data = [
    { value: rings.circularity, color: '#ff375f', label: 'Circularity', icon: '→' },
    { value: rings.consumption, color: '#30d158', label: 'Consumption', icon: '»' },
    { value: rings.mobility, color: '#5ac8fa', label: 'Mobility', icon: '↑' },
  ];

  return (
    <div className="relative w-[160px] h-[160px] flex items-center justify-center">
      {/* Outer ring - Circularity */}
      <div className="absolute"><ActivityRing value={data[0].value} max={100} color={data[0].color} size={160} strokeWidth={14} /></div>
      {/* Middle ring - Consumption */}
      <div className="absolute"><ActivityRing value={data[1].value} max={100} color={data[1].color} size={124} strokeWidth={14} /></div>
      {/* Inner ring - Mobility */}
      <div className="absolute"><ActivityRing value={data[2].value} max={100} color={data[2].color} size={88} strokeWidth={14} /></div>
      {/* Center arrows */}
      <div className="flex flex-col items-center gap-0 z-10">
        <span className="text-[10px] font-bold" style={{ color: data[0].color }}>→</span>
        <span className="text-[10px] font-bold" style={{ color: data[1].color }}>»</span>
        <span className="text-[10px] font-bold" style={{ color: data[2].color }}>↑</span>
      </div>
    </div>
  );
}

export function DashboardView() {
  const { user, setView } = useStore();
  const { totalCarbonSaved, availableCoupons, initializeExtensions, initialized } = useExtensionStore();
  if (!user) return null;

  // Initialize extensions on mount
  if (!initialized) {
    initializeExtensions(user.id, user.IQ, user.createdAt);
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-4">
      {/* Activity Card - Apple Fitness style */}
      <section>
        <h2 className="text-[22px] font-bold text-[var(--ios-label)] mb-3">Activity</h2>
        <div className="ios-card p-5">
          <div className="flex items-center gap-6">
            {/* Rings */}
            <TripleRings rings={user.rings} />
            {/* Stats */}
            <div className="flex-1 space-y-4">
              <RingStat label="Circularity" value={Math.round(user.rings.circularity)} unit="/100" color="#ff375f" />
              <RingStat label="Consumption" value={Math.round(user.rings.consumption)} unit="/100" color="#30d158" />
              <RingStat label="Mobility" value={Math.round(user.rings.mobility)} unit="/100" color="#5ac8fa" />
            </div>
          </div>
          {/* Bottom stats */}
          <div className="flex gap-4 mt-5 pt-4" style={{ borderTop: '0.5px solid var(--ios-separator)' }}>
            <div className="flex-1">
              <p className="text-[11px] text-[var(--ios-tertiary-label)]">Impact IQ</p>
              <p className="text-[22px] font-bold tabular-nums text-[var(--ios-label)]">{Math.round(user.IQ)}</p>
            </div>
            <div className="flex-1">
              <p className="text-[11px] text-[var(--ios-tertiary-label)]">Tier</p>
              <p className="text-[22px] font-bold text-[var(--ios-label)]">{user.tier}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions - New Features */}
      <section>
        <h2 className="text-[22px] font-bold text-[var(--ios-label)] mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-2">
          <motion.button
            onClick={() => setView('scan')}
            whileTap={{ scale: 0.97 }}
            className="ios-card p-4 flex flex-col items-center gap-2 text-center ios-press"
          >
            <div className="w-10 h-10 rounded-[12px] bg-[#2d8a4e]/10 flex items-center justify-center">
              <ScanLine className="w-5 h-5 text-[#2d8a4e]" />
            </div>
            <span className="text-[13px] font-semibold text-[var(--ios-label)]">Scan & Buy</span>
            <span className="text-[11px] text-[var(--ios-tertiary-label)]">Earn IQ from purchases</span>
          </motion.button>
          <motion.button
            onClick={() => setView('transit')}
            whileTap={{ scale: 0.97 }}
            className="ios-card p-4 flex flex-col items-center gap-2 text-center ios-press"
          >
            <div className="w-10 h-10 rounded-[12px] bg-[#007aff]/10 flex items-center justify-center">
              <Route className="w-5 h-5 text-[#007aff]" />
            </div>
            <span className="text-[13px] font-semibold text-[var(--ios-label)]">Eco Routes</span>
            <span className="text-[11px] text-[var(--ios-tertiary-label)]">
              {totalCarbonSaved > 0 ? `${(totalCarbonSaved / 1000).toFixed(1)}kg saved` : 'Save carbon'}
            </span>
          </motion.button>
          <motion.button
            onClick={() => setView('coupons')}
            whileTap={{ scale: 0.97 }}
            className="ios-card p-4 flex flex-col items-center gap-2 text-center ios-press"
          >
            <div className="w-10 h-10 rounded-[12px] bg-[#ff9f0a]/10 flex items-center justify-center">
              <Gift className="w-5 h-5 text-[#ff9f0a]" />
            </div>
            <span className="text-[13px] font-semibold text-[var(--ios-label)]">Rewards</span>
            <span className="text-[11px] text-[var(--ios-tertiary-label)]">
              {availableCoupons.length > 0 ? `${availableCoupons.length} available` : 'Unlock coupons'}
            </span>
          </motion.button>
          <motion.button
            onClick={() => setView('ecospace')}
            whileTap={{ scale: 0.97 }}
            className="ios-card p-4 flex flex-col items-center gap-2 text-center ios-press"
          >
            <div className="w-10 h-10 rounded-[12px] bg-[#30d158]/10 flex items-center justify-center">
              <Leaf className="w-5 h-5 text-[#30d158]" />
            </div>
            <span className="text-[13px] font-semibold text-[var(--ios-label)]">EcoSpace</span>
            <span className="text-[11px] text-[var(--ios-tertiary-label)]">Explore eco places</span>
          </motion.button>
        </div>
      </section>

      {/* Weekly Goals */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[22px] font-bold text-[var(--ios-label)]">Goals</h2>
          <span className="text-[15px] text-[var(--ios-blue)] font-medium">Show More</span>
        </div>
        <div className="space-y-2">
          {getGoals(user).map((goal, i) => (
            <GoalRow key={i} goal={goal} index={i} />
          ))}
        </div>
      </section>

      {/* History */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[22px] font-bold text-[var(--ios-label)]">History</h2>
          <span className="text-[15px] text-[var(--ios-blue)] font-medium">Show More</span>
        </div>
        <div className="space-y-2">
          {user.dailyLogs.length === 0 ? (
            <div className="ios-card p-5 text-center">
              <Footprints className="w-8 h-8 text-[var(--ios-tertiary-label)] mx-auto mb-2" />
              <p className="text-[15px] text-[var(--ios-tertiary-label)]">No activity yet</p>
              <p className="text-[13px] text-[var(--ios-tertiary-label)] mt-1">Log your first eco action to see history</p>
            </div>
          ) : (
            user.dailyLogs.slice(-5).reverse().map((log, i) => (
              <HistoryRow key={log.date + i} log={log} />
            ))
          )}
        </div>
      </section>

      {/* Quick Stats Grid */}
      <section>
        <h2 className="text-[22px] font-bold text-[var(--ios-label)] mb-3">Stats</h2>
        <div className="grid grid-cols-2 gap-2">
          <QuickStat icon={<Flame className="w-5 h-5" />} label="Streak" value={`${Math.max(0, user.dailyLogs.length)}`} sub="days" color="var(--ios-orange)" />
          <QuickStat icon={<Target className="w-5 h-5" />} label="Best Ring" value={getBestRingLabel(user.rings)} sub="leading" color="var(--ios-green)" />
          <QuickStat icon={<Droplets className="w-5 h-5" />} label="Water" value="0" sub="L today" color="var(--ios-cyan)" />
          <QuickStat icon={<BatteryCharging className="w-5 h-5" />} label="Energy" value="0" sub="kWh" color="var(--ios-yellow)" />
        </div>
      </section>

      {/* Streak Calendar */}
      <section>
        <h2 className="text-[22px] font-bold text-[var(--ios-label)] mb-3">28-Day Calendar</h2>
        <StreakCalendar user={user} />
      </section>

      {/* Eco Coach */}
      <section className="pb-4">
        <h2 className="text-[22px] font-bold text-[var(--ios-label)] mb-3">Trainer Tips</h2>
        <div className="space-y-2">
          {getCoachTips(user.rings, user.IQ).map((tip, i) => (
            <motion.div key={tip.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              className="ios-card px-4 py-3.5 flex items-center gap-3">
              <span className="text-[22px]">{tip.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-[15px] font-semibold text-[var(--ios-label)]">{tip.title}</p>
                <p className="text-[13px] text-[var(--ios-tertiary-label)] mt-0.5">{tip.body}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-[var(--ios-tertiary-label)] flex-shrink-0" />
            </motion.div>
          ))}
        </div>
      </section>
    </motion.div>
  );
}

/* ─── Sub Components ─── */

function RingStat({ label, value, unit, color }: { label: string; value: number; unit: string; color: string }) {
  return (
    <div>
      <p className="text-[11px] font-medium" style={{ color }}>{label}</p>
      <p className="text-[20px] font-bold tabular-nums leading-tight" style={{ color }}>
        {value}<span className="text-[13px] font-semibold text-[var(--ios-tertiary-label)]">{unit}</span>
      </p>
    </div>
  );
}

function GoalRow({ goal, index }: { goal: { label: string; progress: number; target: number; icon: React.ReactNode; color: string }; index: number }) {
  const pct = Math.min(100, (goal.progress / goal.target) * 100);
  return (
    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.06 }}
      className="ios-card px-4 py-3.5 flex items-center gap-3">
      <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: `${goal.color}20`, color: goal.color }}>
        {goal.icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[15px] font-semibold text-[var(--ios-label)]">{goal.label}</p>
        <div className="flex items-center gap-2 mt-1">
          <div className="flex-1 h-[4px] rounded-full bg-[var(--ios-separator)]">
            <motion.div className="h-full rounded-full" style={{ background: goal.color }}
              initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8 }} />
          </div>
          <span className="text-[11px] tabular-nums font-medium text-[var(--ios-tertiary-label)]">{goal.progress}/{goal.target}</span>
        </div>
      </div>
      <ChevronRight className="w-4 h-4 text-[var(--ios-tertiary-label)] flex-shrink-0" />
    </motion.div>
  );
}

function HistoryRow({ log }: { log: { date: string; modes: string[]; IQChange: number; verified: boolean } }) {
  const modeIcons: Record<string, string> = { 'plant-based': '🥗', transit: '🚌', thrift: '👕', repair: '🔧', minimal: '✨' };
  const modeLabels: Record<string, string> = { 'plant-based': 'Plant-Based', transit: 'Transit', thrift: 'Thrift', repair: 'Repair', minimal: 'Minimal' };

  return (
    <div className="ios-card px-4 py-3.5 flex items-center gap-3">
      <div className="w-9 h-9 rounded-full bg-[var(--eco-green)]/10 flex items-center justify-center text-[18px]">
        {modeIcons[log.modes[0]] || '📋'}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[15px] font-semibold text-[var(--ios-label)]">
          {log.modes.map(m => modeLabels[m] || m).join(', ')}
        </p>
        <p className="text-[13px] text-[var(--ios-tertiary-label)]">
          {log.date} {log.verified && '· Verified'}
        </p>
      </div>
      <div className="text-right">
        <p className={`text-[15px] font-bold tabular-nums ${log.IQChange >= 0 ? 'text-[var(--eco-green)]' : 'text-[var(--ios-red)]'}`}>
          {log.IQChange >= 0 ? '+' : ''}{log.IQChange.toFixed(1)}
        </p>
        <p className="text-[11px] text-[var(--ios-tertiary-label)]">IQ</p>
      </div>
      <ChevronRight className="w-4 h-4 text-[var(--ios-tertiary-label)] flex-shrink-0" />
    </div>
  );
}

function QuickStat({ icon, label, value, sub, color }: { icon: React.ReactNode; label: string; value: string; sub: string; color: string }) {
  return (
    <div className="ios-card p-4">
      <div className="flex items-center gap-2 mb-2">
        <div style={{ color }}>{icon}</div>
        <span className="text-[13px] font-medium text-[var(--ios-tertiary-label)]">{label}</span>
      </div>
      <p className="text-[28px] font-bold tabular-nums leading-none text-[var(--ios-label)]">{value}</p>
      <p className="text-[13px] text-[var(--ios-tertiary-label)] mt-0.5">{sub}</p>
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
    <div className="ios-card p-4">
      <div className="grid grid-cols-7 gap-1.5">
        {days.map((d) => (
          <div key={d.date} className="flex flex-col items-center">
            <div className={`w-[36px] h-[36px] rounded-full flex items-center justify-center text-[13px] tabular-nums font-medium transition-all ${
              d.hasLog
                ? 'bg-[var(--eco-green)] text-white'
                : 'text-[var(--ios-tertiary-label)]'
            }`}>
              {d.day}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Helpers ─── */

function getGoals(user: User) {
  return [
    { label: 'Close all rings 3x', progress: Math.min(3, user.dailyLogs.length), target: 3, icon: <Target className="w-4 h-4" />, color: '#ff375f' },
    { label: 'Log 5 impact modes', progress: Math.min(5, user.dailyLogs.reduce((sum, l) => sum + l.modes.length, 0)), target: 5, icon: <Zap className="w-4 h-4" />, color: '#30d158' },
    { label: 'Maintain 7-day streak', progress: Math.min(7, user.dailyLogs.length), target: 7, icon: <Flame className="w-4 h-4" />, color: '#ff9f0a' },
  ];
}

function getBestRingLabel(rings: { circularity: number; consumption: number; mobility: number }) {
  const entries: [string, number][] = [['Circ.', rings.circularity], ['Cons.', rings.consumption], ['Mob.', rings.mobility]];
  entries.sort((a, b) => b[1] - a[1]);
  return entries[0]?.[0] ?? 'Even';
}

function getCoachTips(rings: { circularity: number; consumption: number; mobility: number }, iq: number) {
  const lowest = Math.min(rings.circularity, rings.consumption, rings.mobility);
  const focus = lowest === rings.circularity ? 'circularity' : lowest === rings.consumption ? 'consumption' : 'mobility';
  const tips = {
    circularity: [
      { id: 'c1', icon: '🧵', title: 'Repair before replace', body: 'Pick one item to repair instead of buying new.' },
      { id: 'c2', icon: '🛍️', title: 'Go second-hand first', body: 'Check thrift options before buying new.' },
    ],
    consumption: [
      { id: 'co1', icon: '🥗', title: 'Plan a plant-based day', body: 'Choose one day with all plant-based meals.' },
      { id: 'co2', icon: '🧾', title: 'Audit one category', body: 'Pause one impulse category for 7 days.' },
    ],
    mobility: [
      { id: 'm1', icon: '🚍', title: 'Swap one commute', body: 'Replace your easiest commute with transit.' },
      { id: 'm2', icon: '📍', title: 'Cluster your trips', body: 'Batch errands into a single trip.' },
    ],
  };
  const prog = iq < 60
    ? { id: 'tg', icon: '🌱', title: 'Build your foundation', body: 'Repeat one easy action daily.' }
    : iq < 80
    ? { id: 'te', icon: '📈', title: 'Edge into next tier', body: 'Close all rings for 3 consecutive days.' }
    : { id: 'tl', icon: '🌍', title: 'Lead by example', body: 'Invite a friend to join a challenge.' };
  return [...tips[focus], prog];
}
