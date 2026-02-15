'use client';

import { useMemo, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { IMPACT_MODES, ImpactMode } from '@/types';
import {
  Leaf, Award, Star, CheckCircle2, TrendingUp, Zap,
  ChevronRight, Clock, Flame, Target, BarChart3, Trophy
} from 'lucide-react';
import { User } from '@/types';

/* ── Activity Card Data ── */
interface ActivityCard {
  id: string;
  title: string;
  subtitle: string;
  impact: string;
  gradient: string;
  icon: string;
  category: 'recommended' | 'boost' | 'completed';
  modeId?: string;
  co2Saved: string;
  points: number;
}

const RECOMMENDED_ACTIVITIES: ActivityCard[] = [
  {
    id: 'r1', title: 'Metro Commute\nWeek', subtitle: 'Save 2.3kg CO₂ this week',
    impact: '+18 Impact Points', gradient: 'from-emerald-600 via-teal-500 to-cyan-400',
    icon: '🚇', category: 'recommended', modeId: 'transit', co2Saved: '2.3kg', points: 18,
  },
  {
    id: 'r2', title: 'Plant-Based\nChallenge', subtitle: '5 days meat-free streak',
    impact: '+25 Impact Points', gradient: 'from-green-600 via-lime-500 to-emerald-400',
    icon: '🥗', category: 'recommended', modeId: 'plant-based', co2Saved: '4.1kg', points: 25,
  },
  {
    id: 'r3', title: 'Thrift\nHunt', subtitle: 'Second-hand shopping day',
    impact: '+30 Impact Points', gradient: 'from-purple-600 via-violet-500 to-indigo-400',
    icon: '👕', category: 'recommended', modeId: 'thrift', co2Saved: '1.8kg', points: 30,
  },
  {
    id: 'r4', title: 'Repair\nSession', subtitle: 'Fix instead of replace',
    impact: '+35 Impact Points', gradient: 'from-orange-600 via-amber-500 to-yellow-400',
    icon: '🔧', category: 'recommended', modeId: 'repair', co2Saved: '3.2kg', points: 35,
  },
];

const IMPACT_BOOSTERS: ActivityCard[] = [
  {
    id: 'b1', title: 'Cycle to Work', subtitle: 'Zero emission commute',
    impact: '+12 pts', gradient: 'from-lime-600 to-green-500',
    icon: '🚲', category: 'boost', co2Saved: '1.5kg', points: 12,
  },
  {
    id: 'b2', title: 'Zero Waste Day', subtitle: 'No single-use plastic',
    impact: '+15 pts', gradient: 'from-teal-600 to-cyan-500',
    icon: '♻️', category: 'boost', co2Saved: '0.8kg', points: 15,
  },
  {
    id: 'b3', title: 'Energy Saver', subtitle: 'Reduce home energy 20%',
    impact: '+10 pts', gradient: 'from-blue-600 to-sky-500',
    icon: '💡', category: 'boost', co2Saved: '2.0kg', points: 10,
  },
  {
    id: 'b4', title: 'Local Food', subtitle: 'Eat from local farms',
    impact: '+8 pts', gradient: 'from-rose-600 to-pink-500',
    icon: '🌾', category: 'boost', co2Saved: '0.6kg', points: 8,
  },
];

/* ── Main Activities View ── */
export function ActivitiesView() {
  const { user, activateMode } = useStore();
  const [showUpload, setShowUpload] = useState(false);
  const [activeMode, setActiveMode] = useState<string | null>(null);

  if (!user) return null;

  const handleCardAction = (modeId?: string) => {
    if (modeId) {
      setActiveMode(modeId);
      setShowUpload(true);
    }
  };

  const handleConfirm = (verified: boolean) => {
    if (activeMode) {
      activateMode(activeMode, verified);
      setActiveMode(null);
      setShowUpload(false);
    }
  };

  const totalCo2 = useMemo(() => {
    return (user.dailyLogs.length * 1.2).toFixed(1);
  }, [user.dailyLogs.length]);

  const todayScore = useMemo(() => {
    const avg = Math.round((user.rings.circularity + user.rings.consumption + user.rings.mobility) / 3);
    return avg;
  }, [user.rings]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-0 -mx-4 sm:-mx-6">

      {/* ── Large Title Header ── */}
      <div className="px-5 pt-2 pb-4">
        <p className="text-[13px] text-[#5e7a5e] font-medium uppercase tracking-wider">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
        </p>
        <h1 className="text-[34px] font-bold text-[#1a2e1a] leading-tight mt-1">Activities</h1>
      </div>

      {/* ── Recommended For You ── */}
      <div className="px-5 mb-1">
        <h2 className="text-[22px] font-bold text-[#1a2e1a]">Recommended for You</h2>
        <p className="text-[13px] text-[#5e7a5e] mt-0.5">AI-picked actions based on your impact profile</p>
      </div>
      <div className="overflow-x-auto scrollbar-none">
        <div className="flex gap-4 px-5 py-3" style={{ minWidth: 'max-content' }}>
          {RECOMMENDED_ACTIVITIES.map((card, i) => (
            <PrimaryActivityCard key={card.id} card={card} index={i} onAction={() => handleCardAction(card.modeId)} />
          ))}
        </div>
      </div>

      {/* ── Impact Boosters ── */}
      <div className="px-5 mt-5 mb-1">
        <h2 className="text-[22px] font-bold text-[#1a2e1a]">Impact Boosters</h2>
      </div>
      <div className="overflow-x-auto scrollbar-none">
        <div className="flex gap-3 px-5 py-3" style={{ minWidth: 'max-content' }}>
          {IMPACT_BOOSTERS.map((card, i) => (
            <SecondaryActivityCard key={card.id} card={card} index={i} onAction={() => handleCardAction(card.modeId)} />
          ))}
        </div>
      </div>

      {/* ── Recently Completed ── */}
      <div className="px-5 mt-5">
        <RecentlyCompleted user={user} />
      </div>

      {/* ── Achievements ── */}
      <div className="px-5 mt-5">
        <Achievements user={user} />
      </div>

      {/* ── Milestones ── */}
      <div className="px-5 mt-5 pb-4">
        <EcoMilestones user={user} />
      </div>

      {/* ── Persistent Impact Summary Bar ── */}
      <ImpactSummaryBar iq={Math.round(user.IQ)} co2={totalCo2} todayScore={todayScore} />

      {/* Upload/Verify Sheet */}
      <AnimatePresence>
        {showUpload && activeMode && (
          <VerifySheet
            mode={IMPACT_MODES.find(m => m.id === activeMode)}
            onConfirm={handleConfirm}
            onCancel={() => { setActiveMode(null); setShowUpload(false); }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ── Primary Activity Card (Large, Apple Music style) ── */
function PrimaryActivityCard({ card, index, onAction }: { card: ActivityCard; index: number; onAction: () => void }) {
  return (
    <motion.button
      onClick={onAction}
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      className="relative w-[260px] h-[320px] rounded-[20px] overflow-hidden flex-shrink-0 text-left shadow-lg active:scale-[0.97] transition-transform"
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient}`} />
      {/* Subtle overlay pattern */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-white/10" />

      <div className="relative h-full flex flex-col justify-between p-5">
        {/* Top: Category badge */}
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-white/70 uppercase tracking-wider bg-white/15 backdrop-blur-sm px-2.5 py-1 rounded-full">
            LumeIQ
          </span>
          <span className="text-[28px]">{card.icon}</span>
        </div>

        {/* Center: Title */}
        <div>
          <h3 className="text-[28px] font-bold text-white leading-[1.1] whitespace-pre-line drop-shadow-sm">
            {card.title}
          </h3>
        </div>

        {/* Bottom: Info strip */}
        <div className="bg-white/15 backdrop-blur-sm rounded-[14px] p-3">
          <p className="text-[13px] text-white/90 font-medium">{card.subtitle}</p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-[12px] text-white/70 flex items-center gap-1">
              <Leaf className="w-3 h-3" /> {card.co2Saved} CO₂
            </span>
            <span className="text-[13px] text-white font-bold">{card.impact}</span>
          </div>
        </div>
      </div>
    </motion.button>
  );
}

/* ── Secondary Activity Card (Smaller, horizontal scroll) ── */
function SecondaryActivityCard({ card, index, onAction }: { card: ActivityCard; index: number; onAction: () => void }) {
  return (
    <motion.button
      onClick={onAction}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.35 }}
      className="relative w-[180px] h-[200px] rounded-[16px] overflow-hidden flex-shrink-0 text-left shadow-md active:scale-[0.97] transition-transform"
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient}`} />
      <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-white/10" />

      <div className="relative h-full flex flex-col justify-between p-4">
        <span className="text-[24px]">{card.icon}</span>
        <div>
          <h4 className="text-[16px] font-bold text-white leading-tight">{card.title}</h4>
          <p className="text-[11px] text-white/70 mt-1">{card.subtitle}</p>
          <div className="flex items-center gap-1 mt-2">
            <Zap className="w-3 h-3 text-white/80" />
            <span className="text-[12px] text-white font-semibold">{card.impact}</span>
          </div>
        </div>
      </div>
    </motion.button>
  );
}

/* ── Recently Completed Actions ── */
function RecentlyCompleted({ user }: { user: User }) {
  const recentLogs = useMemo(() => {
    return user.dailyLogs.slice(-5).reverse();
  }, [user.dailyLogs]);

  if (recentLogs.length === 0) {
    return (
      <div>
        <h2 className="text-[22px] font-bold text-[#1a2e1a] mb-3">Recently Completed</h2>
        <div className="card-surface p-6 text-center">
          <div className="text-[40px] mb-2">🌱</div>
          <p className="text-[14px] text-[#5e7a5e]">No activities yet. Start your first impact action above!</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[22px] font-bold text-[#1a2e1a]">Recently Completed</h2>
        <span className="text-[13px] text-[#2d8a4e] font-medium">{recentLogs.length} actions</span>
      </div>
      <div className="space-y-2">
        {recentLogs.map((log, i) => {
          const mode = IMPACT_MODES.find(m => log.modes.includes(m.id));
          return (
            <motion.div
              key={`${log.date}-${i}`}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="card-surface-sm px-4 py-3.5 flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-[12px] bg-[#2d8a4e]/10 flex items-center justify-center text-[20px] flex-shrink-0">
                {mode?.icon || '🌿'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-semibold text-[#1a2e1a] truncate">{mode?.name || 'Eco Action'}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[11px] text-[#5e7a5e]">{log.date}</span>
                  {log.verified && (
                    <span className="flex items-center gap-0.5 text-[10px] text-[#2d8a4e] font-medium">
                      <CheckCircle2 className="w-3 h-3" /> Verified
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-[15px] font-bold text-[#2d8a4e] tabular-nums">+{Math.round(log.IQChange * 10) / 10}</p>
                <p className="text-[10px] text-[#5e7a5e]">IQ pts</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Achievements (Awards Shelf style) ── */
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

  const unlockedCount = badges.filter(b => b.unlocked).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[22px] font-bold text-[#1a2e1a] flex items-center gap-2">
          Awards
        </h2>
        <span className="text-[13px] text-[#2d8a4e] font-medium">{unlockedCount}/{badges.length} earned</span>
      </div>
      <div className="overflow-x-auto scrollbar-none -mx-5">
        <div className="flex gap-3 px-5 py-1" style={{ minWidth: 'max-content' }}>
          {badges.map((badge, i) => (
            <motion.div
              key={badge.id}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.04 }}
              className={`w-[110px] flex-shrink-0 rounded-[16px] p-3.5 text-center transition-all ${
                badge.unlocked
                  ? 'bg-[#1a2e1a] shadow-lg'
                  : 'bg-[#1a2e1a]/60'
              }`}
            >
              <div className="text-[32px] mb-1.5">{badge.unlocked ? badge.icon : '🔒'}</div>
              <p className={`text-[12px] font-semibold ${badge.unlocked ? 'text-white' : 'text-white/50'}`}>{badge.label}</p>
              <p className={`text-[10px] mt-0.5 ${badge.unlocked ? 'text-white/70' : 'text-white/30'}`}>{badge.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Eco Milestones ── */
function EcoMilestones({ user }: { user: User }) {
  const milestones = [
    { label: 'First Plant-Based Day', target: 1, current: user.dailyLogs.filter(l => l.modes.includes('plant-based')).length, emoji: '🌿' },
    { label: '10 Days Active', target: 10, current: user.dailyLogs.length, emoji: '📅' },
    { label: 'IQ Score 50+', target: 50, current: Math.round(user.IQ), emoji: '🧠' },
    { label: '100kg CO₂ Saved', target: 100, current: Math.round(user.IQ * 0.8), emoji: '🌍' },
    { label: 'Close All Rings 90%+', target: 90, current: Math.round(Math.min(user.rings.circularity, user.rings.consumption, user.rings.mobility)), emoji: '💪' },
    { label: '30 Day Streak', target: 30, current: user.dailyLogs.length, emoji: '🔥' },
  ];

  return (
    <div>
      <h2 className="text-[22px] font-bold text-[#1a2e1a] mb-3">Milestones</h2>
      <div className="grid grid-cols-2 gap-3">
        {milestones.map((m, i) => {
          const pct = Math.min(100, (m.current / m.target) * 100);
          const done = m.current >= m.target;
          return (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="card-surface-sm p-4 relative"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[20px]">{m.emoji}</span>
                {done && <CheckCircle2 className="w-4 h-4 text-[#2d8a4e]" />}
              </div>
              <p className="text-[13px] font-medium text-[#1a2e1a]">{m.label}</p>
              <div className="h-[4px] rounded-full bg-[#2d8a4e]/8 mt-2">
                <motion.div
                  className="h-full rounded-full bg-[#2d8a4e]"
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.6, delay: i * 0.05 }}
                />
              </div>
              <p className="text-[11px] text-[#5e7a5e] mt-1 tabular-nums">{Math.round(pct)}% complete</p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Impact Summary Bar (Persistent, replaces mini-player) ── */
function ImpactSummaryBar({ iq, co2, todayScore }: { iq: number; co2: string; todayScore: number }) {
  return (
    <div className="sticky bottom-0 left-0 right-0 bg-[#1a2e1a] backdrop-blur-xl border-t border-white/5 px-5 py-3 flex items-center gap-4 z-40">
      {/* IQ Score */}
      <div className="flex items-center gap-2">
        <div className="w-9 h-9 rounded-full bg-[#2d8a4e] flex items-center justify-center">
          <span className="text-[14px] font-bold text-white tabular-nums">{iq}</span>
        </div>
        <div>
          <p className="text-[12px] font-semibold text-white">Impact IQ</p>
          <p className="text-[10px] text-white/50">Your score</p>
        </div>
      </div>

      {/* Divider */}
      <div className="w-[1px] h-8 bg-white/10" />

      {/* CO2 */}
      <div>
        <p className="text-[14px] font-bold text-[#5cb85c] tabular-nums">{co2}kg</p>
        <p className="text-[10px] text-white/50">CO₂ saved</p>
      </div>

      {/* Divider */}
      <div className="w-[1px] h-8 bg-white/10" />

      {/* Today */}
      <div className="flex-1">
        <p className="text-[14px] font-bold text-white tabular-nums">{todayScore}%</p>
        <p className="text-[10px] text-white/50">Ring avg</p>
      </div>

      {/* CTA */}
      <button className="px-4 py-2 rounded-[10px] bg-[#2d8a4e] text-white text-[12px] font-semibold flex items-center gap-1.5 active:scale-95 transition-transform">
        <BarChart3 className="w-3.5 h-3.5" /> Details
      </button>
    </div>
  );
}

/* ── Verify Sheet ── */
function VerifySheet({ mode, onConfirm, onCancel }: { mode?: ImpactMode; onConfirm: (verified: boolean) => void; onCancel: () => void }) {
  if (!mode) return null;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-end sm:items-center justify-center z-50"
      onClick={onCancel}
    >
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        className="w-full sm:max-w-sm bg-white rounded-t-[24px] sm:rounded-[24px]"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-6 pt-4 pb-8">
          <div className="w-9 h-1 rounded-full bg-[#2d8a4e]/15 mx-auto mb-5" />
          <div className="flex items-center gap-3 mb-4">
            <span className="text-[36px]">{mode.icon}</span>
            <div>
              <h3 className="text-[20px] font-semibold text-[#1a2e1a]">{mode.name}</h3>
              <p className="text-[13px] text-[#5e7a5e]">{mode.description}</p>
            </div>
          </div>
          <p className="text-[#5e7a5e] text-[14px] mb-6">
            Upload a photo for <span className="font-semibold text-[#2d8a4e]">+15% verified boost</span>
          </p>
          <div className="card-inset py-8 text-center mb-6 rounded-[16px]">
            <div className="text-4xl mb-2">📸</div>
            <p className="text-[#5e7a5e] text-[13px]">Tap to upload photo</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => onConfirm(false)}
              className="flex-1 py-3.5 rounded-[14px] bg-[#2d8a4e]/8 text-[#1a2e1a] text-[15px] font-medium hover:bg-[#2d8a4e]/12 transition-colors"
            >
              Skip
            </button>
            <button
              onClick={() => onConfirm(true)}
              className="flex-1 py-3.5 rounded-[14px] bg-[#2d8a4e] text-white text-[15px] font-semibold hover:bg-[#247a42] transition-colors"
            >
              Verify +15%
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
