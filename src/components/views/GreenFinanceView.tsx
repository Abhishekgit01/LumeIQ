'use client';

import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Leaf, TrendingUp, TrendingDown, Award, Star, Shield, Zap, Car, Train, Bike,
  Footprints, ShoppingBag, Utensils, Home, Droplets, Recycle, Gift, ChevronRight,
  ChevronDown, ChevronUp, ArrowRight, Target, Crown, Flame, Lock, Unlock,
  BarChart3, PieChart, Clock, Calendar, Sparkles, BadgeCheck, Coins, Wallet,
  CreditCard, RefreshCw, CircleDot, Trophy, Heart, Share2, ExternalLink,
  Check, X, Info, AlertTriangle, Bell
} from 'lucide-react';
import { CardLeaves, TinyLeaf, SectionHeader } from '@/components/ui/LeafDecorations';
import { useStore } from '@/store/useStore';

/* ─── Green Score Types ─── */
interface ScoreCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  weight: number;
  score: number;
  maxScore: number;
  color: string;
  breakdown: { label: string; value: number; max: number; tip: string }[];
}

interface Transaction {
  id: string;
  merchant: string;
  category: string;
  amount: number;
  co2: number;
  date: string;
  icon: string;
  isGreen: boolean;
}

interface RewardTier {
  name: string;
  minScore: number;
  icon: React.ReactNode;
  color: string;
  perks: string[];
  badgeEmoji: string;
}

interface EcoChallenge {
  id: string;
  name: string;
  description: string;
  icon: string;
  target: number;
  current: number;
  unit: string;
  reward: number;
  deadline: string;
  category: string;
}

interface EcoCoin {
  id: string;
  source: string;
  amount: number;
  date: string;
  icon: string;
}

/* ─── No mock transactions — starts empty ─── */
const EMPTY_TRANSACTIONS: Transaction[] = [];

/* ─── Score Categories — all start at 0 ─── */
const SCORE_CATEGORIES: ScoreCategory[] = [
  {
    id: 'transport', name: 'Transport', icon: <Car className="w-4 h-4" />, weight: 30, score: 0, maxScore: 100, color: '#3b82f6',
    breakdown: [
      { label: 'Public transit usage', value: 0, max: 100, tip: 'Log metro/bus rides to increase this score' },
      { label: 'Ride-hail frequency', value: 0, max: 100, tip: 'Use Yulu e-bikes for short trips to score higher' },
      { label: 'Flight frequency', value: 0, max: 100, tip: 'Less flights = higher score' },
      { label: 'EV adoption', value: 0, max: 100, tip: 'Log EV charging sessions to boost this' },
    ]
  },
  {
    id: 'food', name: 'Food & Diet', icon: <Utensils className="w-4 h-4" />, weight: 25, score: 0, maxScore: 100, color: '#22c55e',
    breakdown: [
      { label: 'Organic spending ratio', value: 0, max: 100, tip: 'Shop at organic stores to increase this' },
      { label: 'Food delivery vs dine-in', value: 0, max: 100, tip: 'Dine-in reduces delivery emissions' },
      { label: 'Plant-based meals', value: 0, max: 100, tip: 'Log plant-based meals to improve' },
      { label: 'Local sourcing', value: 0, max: 100, tip: 'Buy from local farms and markets' },
    ]
  },
  {
    id: 'shopping', name: 'Shopping', icon: <ShoppingBag className="w-4 h-4" />, weight: 20, score: 0, maxScore: 100, color: '#f59e0b',
    breakdown: [
      { label: 'Fast fashion purchases', value: 0, max: 100, tip: 'Avoid fast fashion to score higher' },
      { label: 'Secondhand buying', value: 0, max: 100, tip: 'Log thrift store visits' },
      { label: 'Package-free shopping', value: 0, max: 100, tip: 'Use refill stations at EcoMart' },
      { label: 'Repair vs replace', value: 0, max: 100, tip: 'Log repair activities' },
    ]
  },
  {
    id: 'energy', name: 'Energy & Home', icon: <Home className="w-4 h-4" />, weight: 15, score: 0, maxScore: 100, color: '#8b5cf6',
    breakdown: [
      { label: 'BESCOM bill trend', value: 0, max: 100, tip: 'Connect your BESCOM account to track' },
      { label: 'Renewable energy', value: 0, max: 100, tip: 'Rooftop solar will boost this category' },
      { label: 'Water conservation', value: 0, max: 100, tip: 'Track your daily water usage' },
      { label: 'Waste management', value: 0, max: 100, tip: 'Start composting to earn points' },
    ]
  },
  {
    id: 'finance', name: 'Green Investments', icon: <TrendingUp className="w-4 h-4" />, weight: 10, score: 0, maxScore: 100, color: '#06b6d4',
    breakdown: [
      { label: 'ESG fund allocation', value: 0, max: 100, tip: 'Allocate portfolio to ESG funds' },
      { label: 'Green bond holdings', value: 0, max: 100, tip: 'Green bonds offer 7-9% returns + impact' },
      { label: 'Carbon offset purchases', value: 0, max: 100, tip: 'Buy carbon offsets to boost this' },
      { label: 'Sustainable SIP', value: 0, max: 100, tip: 'Start a green SIP to earn points' },
    ]
  },
];

/* ─── Reward Tiers ─── */
const REWARD_TIERS: RewardTier[] = [
  { name: 'Seedling', minScore: 0, icon: <Leaf className="w-5 h-5" />, color: '#8e8e93', perks: ['Basic eco tips', 'Weekly carbon report'], badgeEmoji: '🌱' },
  { name: 'Sapling', minScore: 400, icon: <TrendingUp className="w-5 h-5" />, color: '#f59e0b', perks: ['2% green cashback', 'Partner store discounts', 'Monthly impact report'], badgeEmoji: '🌿' },
  { name: 'Canopy', minScore: 550, icon: <Shield className="w-5 h-5" />, color: '#22c55e', perks: ['5% green cashback', 'Priority EV charging', 'Green loan 0.5% rate cut', 'Eco NFT badges'], badgeEmoji: '🌳' },
  { name: 'Evergreen', minScore: 700, icon: <Crown className="w-5 h-5" />, color: '#2d8a4e', perks: ['8% green cashback', 'Free metro pass (₹1400/mo)', 'Green loan 1% rate cut', 'VIP eco events', 'Carbon credit trading'], badgeEmoji: '🏔️' },
  { name: 'Guardian', minScore: 850, icon: <Sparkles className="w-5 h-5" />, color: '#7c3aed', perks: ['12% green cashback', 'Premium insurance discount', 'Green bond priority access', 'Annual tree plantation', 'Exclusive NFT collection'], badgeEmoji: '🌍' },
];

/* ─── Eco Challenges — all start at 0 progress ─── */
const INITIAL_CHALLENGES: EcoChallenge[] = [
  { id: 'ch1', name: 'Car-Free Week', description: 'Use only metro, bus, or cycle for 7 days', icon: '🚇', target: 7, current: 0, unit: 'days', reward: 50, deadline: '2026-02-21', category: 'Transport' },
  { id: 'ch2', name: 'Zero Delivery', description: 'No food delivery apps for 5 days', icon: '🍳', target: 5, current: 0, unit: 'days', reward: 30, deadline: '2026-02-19', category: 'Food' },
  { id: 'ch3', name: 'Thrift Hunter', description: 'Make 3 secondhand purchases this month', icon: '♻️', target: 3, current: 0, unit: 'purchases', reward: 40, deadline: '2026-02-28', category: 'Shopping' },
  { id: 'ch4', name: 'Green Commuter', description: 'Plan 5 eco routes using Route Planner', icon: '🗺️', target: 5, current: 0, unit: 'routes', reward: 35, deadline: '2026-02-20', category: 'Transport' },
  { id: 'ch5', name: 'Plant Power', description: 'Log 10 plant-based meals', icon: '🥗', target: 10, current: 0, unit: 'meals', reward: 45, deadline: '2026-02-28', category: 'Food' },
  { id: 'ch6', name: 'BESCOM Saver', description: 'Reduce electricity usage by 10% this month', icon: '💡', target: 10, current: 0, unit: '% saved', reward: 60, deadline: '2026-02-28', category: 'Energy' },
];

/* ─── No initial coins ─── */
const INITIAL_COINS: EcoCoin[] = [];

/* ─── Helper Components ─── */
function AnimatedGauge({ score, maxScore = 900, size = 140 }: { score: number; maxScore?: number; size?: number }) {
  const pct = score / maxScore;
  const r = (size - 16) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - pct * circ;
  const color = score >= 700 ? '#2d8a4e' : score >= 550 ? '#22c55e' : score >= 400 ? '#f59e0b' : score > 0 ? '#ef4444' : '#8e8e93';

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e8f5e8" strokeWidth={10} />
        <motion.circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={10} strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span className="text-[28px] font-bold" style={{ color }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}>
          {score}
        </motion.span>
        <span className="text-[11px] text-[#5e7a5e]">/ {maxScore}</span>
      </div>
    </div>
  );
}

function CategoryBar({ category, expanded, onToggle }: { category: ScoreCategory; expanded: boolean; onToggle: () => void }) {
  const pct = (category.score / category.maxScore) * 100;
  return (
    <div className="card-inset rounded-[12px] overflow-hidden">
      <button onClick={onToggle} className="w-full p-3 flex items-center gap-3 hover:bg-[#f0f7f0]/50 transition-colors">
        <div className="w-8 h-8 rounded-[8px] flex items-center justify-center flex-shrink-0" style={{ background: `${category.color}15`, color: category.color }}>
          {category.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[13px] font-semibold text-[#1a2e1a]">{category.name}</span>
            <span className="text-[12px] font-bold" style={{ color: category.color }}>{category.score}/{category.maxScore}</span>
          </div>
          <div className="h-2 bg-[#e8f5e8] rounded-full overflow-hidden">
            <motion.div className="h-full rounded-full" style={{ background: category.color }}
              initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, ease: 'easeOut' }} />
          </div>
        </div>
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#f0f7f0] text-[#5e7a5e] font-medium flex-shrink-0">{category.weight}%</span>
        {expanded ? <ChevronUp className="w-4 h-4 text-[#5e7a5e] flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-[#5e7a5e] flex-shrink-0" />}
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="px-3 pb-3 space-y-2 border-t border-[#2d8a4e]/8 pt-2">
              {category.breakdown.map((b, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[11px] text-[#5e7a5e]">{b.label}</span>
                    <span className="text-[11px] font-semibold" style={{ color: b.value >= 70 ? '#2d8a4e' : b.value >= 40 ? '#f59e0b' : b.value > 0 ? '#ef4444' : '#8e8e93' }}>{b.value}%</span>
                  </div>
                  <div className="h-1.5 bg-[#e8f5e8] rounded-full overflow-hidden mb-1">
                    <motion.div className="h-full rounded-full" initial={{ width: 0 }} animate={{ width: `${b.value}%` }}
                      transition={{ duration: 0.6, delay: i * 0.1 }}
                      style={{ background: b.value >= 70 ? '#2d8a4e' : b.value >= 40 ? '#f59e0b' : b.value > 0 ? '#ef4444' : '#8e8e93' }} />
                  </div>
                  <p className="text-[10px] text-[#5e7a5e]/70 italic flex items-center gap-1"><Sparkles className="w-3 h-3 text-amber-400" /> {b.tip}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   GREEN SCORE TAB
   ═══════════════════════════════════════════════ */
function GreenScoreTab() {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [showTransactions, setShowTransactions] = useState(false);
  const [txFilter, setTxFilter] = useState<'all' | 'green' | 'high-carbon'>('all');

  // All scores are 0 — no fake data
  const greenScore = useMemo(() => {
    const raw = SCORE_CATEGORIES.reduce((sum, c) => sum + (c.score * c.weight / 100), 0);
    return Math.round(raw * 9);
  }, []);

  const currentTier = useMemo(() => {
    return [...REWARD_TIERS].reverse().find(t => greenScore >= t.minScore) || REWARD_TIERS[0];
  }, [greenScore]);

  const nextTier = useMemo(() => {
    const idx = REWARD_TIERS.findIndex(t => t.name === currentTier.name);
    return idx < REWARD_TIERS.length - 1 ? REWARD_TIERS[idx + 1] : null;
  }, [currentTier]);

  const transactions = EMPTY_TRANSACTIONS;
  const totalCo2 = transactions.reduce((sum, t) => sum + t.co2, 0);
  const greenTxCount = transactions.filter(t => t.isGreen).length;
  const greenSpend = transactions.filter(t => t.isGreen).reduce((s, t) => s + t.amount, 0);
  const totalSpend = transactions.reduce((s, t) => s + t.amount, 0);

  const filteredTx = useMemo(() => {
    if (txFilter === 'green') return transactions.filter(t => t.isGreen);
    if (txFilter === 'high-carbon') return transactions.filter(t => !t.isGreen);
    return transactions;
  }, [txFilter, transactions]);

  return (
    <div className="flex flex-col gap-4">
      {/* Score Hero */}
      <div className="card-surface p-5 relative overflow-hidden">
        <CardLeaves variant="b" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-[10px] bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-[15px] font-bold text-[#1a2e1a]">LumeIQ Green Score</h3>
              <p className="text-[11px] text-[#5e7a5e]">Your sustainability credit rating</p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-8 flex-wrap">
            <AnimatedGauge score={greenScore} />
            <div className="space-y-3">
              {/* Current Tier */}
              <div className="flex items-center gap-2">
                <span className="text-2xl">{currentTier.badgeEmoji}</span>
                <div>
                  <p className="text-[14px] font-bold" style={{ color: currentTier.color }}>{currentTier.name} Tier</p>
                  <p className="text-[11px] text-[#5e7a5e]">
                    {nextTier ? `${nextTier.minScore - greenScore} points to ${nextTier.name}` : 'Highest tier achieved!'}
                  </p>
                </div>
              </div>
              {/* Progress to next tier */}
              {nextTier && (
                <div>
                  <div className="h-2.5 w-[160px] bg-[#e8f5e8] rounded-full overflow-hidden">
                    <motion.div className="h-full rounded-full"
                      style={{ background: `linear-gradient(90deg, ${currentTier.color}, ${nextTier.color})` }}
                      initial={{ width: 0 }}
                      animate={{ width: `${greenScore > currentTier.minScore ? ((greenScore - currentTier.minScore) / (nextTier.minScore - currentTier.minScore)) * 100 : 0}%` }}
                      transition={{ duration: 1, delay: 0.5 }} />
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-[9px] text-[#5e7a5e]">{currentTier.minScore}</span>
                    <span className="text-[9px] font-semibold" style={{ color: nextTier.color }}>{nextTier.minScore}</span>
                  </div>
                </div>
              )}
              {/* No fake trend data */}
              <p className="text-[11px] text-[#5e7a5e] italic">Start logging eco actions to build your score</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Monthly CO₂', value: totalCo2 === 0 ? '0' : `${(totalCo2 / 1000).toFixed(1)}kg`, sub: 'from spending', color: '#8e8e93', icon: <Leaf className="w-4 h-4" /> },
          { label: 'Green Spend', value: totalSpend === 0 ? '0%' : `${Math.round(greenSpend / totalSpend * 100)}%`, sub: totalSpend === 0 ? 'No data yet' : `₹${greenSpend.toLocaleString()}`, color: '#8e8e93', icon: <Wallet className="w-4 h-4" /> },
          { label: 'Eco Transactions', value: `${greenTxCount}/${transactions.length}`, sub: 'this month', color: '#8e8e93', icon: <CreditCard className="w-4 h-4" /> },
          { label: 'vs Average', value: '--', sub: 'Not enough data', color: '#8e8e93', icon: <BarChart3 className="w-4 h-4" /> },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className="card-surface-sm p-3 relative">
            <CardLeaves variant={(['a', 'b', 'c', 'd'] as const)[i % 4]} />
            <div className="relative z-10 text-center">
              <div className="w-8 h-8 rounded-[8px] mx-auto mb-1.5 flex items-center justify-center" style={{ background: `${s.color}12`, color: s.color }}>
                {s.icon}
              </div>
              <p className="text-[18px] font-bold" style={{ color: s.color }}>{s.value}</p>
              <p className="text-[11px] text-[#1a2e1a] font-medium">{s.label}</p>
              <p className="text-[9px] text-[#5e7a5e]/60">{s.sub}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Category Breakdown */}
      <div className="card-surface p-4 relative">
        <CardLeaves variant="c" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <PieChart className="w-4 h-4 text-[#2d8a4e]" />
            <h3 className="text-[14px] font-bold text-[#1a2e1a]">Score Breakdown</h3>
            <span className="text-[10px] text-[#5e7a5e] ml-auto">Tap to expand</span>
          </div>
          <div className="space-y-2">
            {SCORE_CATEGORIES.map(c => (
              <CategoryBar key={c.id} category={c} expanded={expandedCategory === c.id}
                onToggle={() => setExpandedCategory(expandedCategory === c.id ? null : c.id)} />
            ))}
          </div>
        </div>
      </div>

      {/* Carbon Per Transaction */}
      <div className="card-surface p-4 relative">
        <CardLeaves variant="a" />
        <div className="relative z-10">
          <button onClick={() => setShowTransactions(!showTransactions)}
            className="w-full flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-[#2d8a4e]" />
              <h3 className="text-[14px] font-bold text-[#1a2e1a]">Carbon Per Transaction</h3>
            </div>
            {showTransactions ? <ChevronUp className="w-4 h-4 text-[#5e7a5e]" /> : <ChevronDown className="w-4 h-4 text-[#5e7a5e]" />}
          </button>
          <p className="text-[11px] text-[#5e7a5e] mb-2">Every spend tagged with estimated CO₂ impact</p>

          <AnimatePresence>
            {showTransactions && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                {/* Filter chips */}
                <div className="flex gap-2 mb-3">
                  {([{ key: 'all' as const, label: 'All' }, { key: 'green' as const, label: 'Green' }, { key: 'high-carbon' as const, label: 'High Carbon' }]).map(f => (
                    <button key={f.key} onClick={() => setTxFilter(f.key)}
                      className={`px-3 py-1.5 rounded-full text-[11px] font-medium transition-all ${txFilter === f.key ? 'bg-[#2d8a4e] text-white' : 'bg-[#e8f5e8] text-[#5e7a5e] hover:bg-[#d4edd4]'}`}>
                      {f.label}
                    </button>
                  ))}
                </div>

                {filteredTx.length === 0 ? (
                  <div className="text-center py-8">
                    <CreditCard className="w-8 h-8 text-[#5e7a5e]/30 mx-auto mb-2" />
                    <p className="text-[13px] text-[#5e7a5e]">No transactions yet</p>
                    <p className="text-[11px] text-[#5e7a5e]/60">Your spending will appear here with CO₂ tags</p>
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-[400px] overflow-y-auto">
                    {filteredTx.map((tx, i) => (
                      <motion.div key={tx.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                        className="card-inset px-3 py-2.5 rounded-[10px] flex items-center gap-3">
                        <span className="text-xl flex-shrink-0">{tx.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] font-semibold text-[#1a2e1a] truncate">{tx.merchant}</p>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-[#5e7a5e]">{tx.category}</span>
                            <span className="text-[10px] text-[#5e7a5e]/40">•</span>
                            <span className="text-[10px] text-[#5e7a5e]">{tx.date}</span>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-[12px] font-semibold text-[#1a2e1a]">₹{tx.amount.toLocaleString()}</p>
                          <p className={`text-[10px] font-medium ${tx.isGreen ? 'text-[#2d8a4e]' : 'text-red-500'}`}>
                            {tx.co2}g CO₂
                          </p>
                        </div>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${tx.isGreen ? 'bg-[#2d8a4e]/10' : 'bg-red-50'}`}>
                          {tx.isGreen ? <Leaf className="w-3 h-3 text-[#2d8a4e]" /> : <AlertTriangle className="w-3 h-3 text-red-400" />}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Tier Comparison */}
      <div className="card-surface p-4 relative">
        <CardLeaves variant="d" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <Crown className="w-4 h-4 text-amber-500" />
            <h3 className="text-[14px] font-bold text-[#1a2e1a]">Green Score Tiers</h3>
          </div>
          <div className="space-y-2">
            {REWARD_TIERS.map((tier, i) => {
              const isCurrent = tier.name === currentTier.name;
              const isLocked = greenScore < tier.minScore;
              return (
                <motion.div key={tier.name} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                  className={`card-inset p-3 rounded-[12px] transition-all ${isCurrent ? 'ring-2' : ''} ${isLocked ? 'opacity-60' : ''}`}
                  style={isCurrent ? { ringColor: `${tier.color}40`, background: `${tier.color}08` } : {}}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl flex-shrink-0"
                      style={{ background: `${tier.color}15` }}>
                      {tier.badgeEmoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-bold" style={{ color: tier.color }}>{tier.name}</span>
                        <span className="text-[10px] text-[#5e7a5e]">{tier.minScore}+ pts</span>
                        {isCurrent && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#2d8a4e]/10 text-[#2d8a4e] font-bold">CURRENT</span>}
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {tier.perks.slice(0, 3).map(p => (
                          <span key={p} className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#f0f7f0] text-[#5e7a5e]">{p}</span>
                        ))}
                        {tier.perks.length > 3 && <span className="text-[9px] text-[#5e7a5e]/50">+{tier.perks.length - 3} more</span>}
                      </div>
                    </div>
                    {isLocked ? <Lock className="w-4 h-4 text-[#5e7a5e]/30 flex-shrink-0" /> : <Unlock className="w-4 h-4 text-[#2d8a4e] flex-shrink-0" />}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* AI Improvement Tips */}
      <div className="card-surface p-4 relative">
        <CardLeaves variant="b" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <h3 className="text-[14px] font-bold text-[#1a2e1a]">AI Score Boosters</h3>
          </div>
          <div className="space-y-2">
            {[
              { tip: 'Log your first metro or bus ride to kick off your Transport score', impact: '+15 pts', icon: '🚇', category: 'Transport' },
              { tip: 'Start a green SIP or ESG fund to unlock Green Investments', impact: '+25 pts', icon: '📈', category: 'Finance' },
              { tip: 'Visit an organic store or refill station to boost Shopping score', impact: '+18 pts', icon: '🌿', category: 'Shopping' },
              { tip: 'Log a plant-based meal to start building your Food & Diet score', impact: '+20 pts', icon: '🥗', category: 'Food' },
            ].map((t, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                className="card-inset px-3 py-2.5 rounded-[10px] flex items-start gap-2.5">
                <span className="text-lg mt-0.5">{t.icon}</span>
                <div className="flex-1">
                  <p className="text-[12px] text-[#1a2e1a] leading-relaxed">{t.tip}</p>
                  <span className="text-[10px] text-[#5e7a5e] mt-0.5 inline-block">{t.category}</span>
                </div>
                <span className="text-[11px] font-bold text-[#2d8a4e] flex-shrink-0 bg-[#2d8a4e]/8 px-2 py-1 rounded-full">{t.impact}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   REWARDS HUB TAB
   ═══════════════════════════════════════════════ */
function RewardsHubTab() {
  const [challenges, setChallenges] = useState(INITIAL_CHALLENGES);
  const [coins, setCoins] = useState<EcoCoin[]>(INITIAL_COINS);
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [selectedReward, setSelectedReward] = useState<string | null>(null);
  const [showCoinHistory, setShowCoinHistory] = useState(false);

  const totalCoins = coins.reduce((s, c) => s + c.amount, 0);
  const completedChallenges = challenges.filter(c => c.current >= c.target).length;

  const advanceChallenge = (id: string) => {
    setChallenges(prev => prev.map(c => {
      if (c.id !== id || c.current >= c.target) return c;
      const newCurrent = Math.min(c.current + 1, c.target);
      if (newCurrent === c.target) {
        setCoins(prev => [{
          id: `ec-${Date.now()}`,
          source: `Completed: ${c.name}`,
          amount: c.reward,
          date: new Date().toISOString().split('T')[0],
          icon: c.icon,
        }, ...prev]);
      }
      return { ...c, current: newCurrent };
    }));
  };

  const REDEEM_OPTIONS = [
    { id: 'r1', name: 'Namma Metro Day Pass', cost: 50, icon: '🚇', partner: 'BMRCL', desc: 'Free unlimited metro rides for 1 day' },
    { id: 'r2', name: 'Yulu E-Bike 1hr Free', cost: 20, icon: '🚲', partner: 'Yulu', desc: '1 hour free e-bike ride' },
    { id: 'r3', name: 'Terra Kitchen 20% Off', cost: 35, icon: '🥬', partner: 'Terra Kitchen', desc: '20% off on your next meal' },
    { id: 'r4', name: 'EcoMart ₹100 Voucher', cost: 40, icon: '🌿', partner: 'EcoMart', desc: '₹100 off organic groceries' },
    { id: 'r5', name: 'GreenLeaf Café Free Coffee', cost: 15, icon: '☕', partner: 'GreenLeaf Café', desc: 'Free organic coffee' },
    { id: 'r6', name: 'BESCOM EV Free Charge', cost: 60, icon: '⚡', partner: 'BESCOM', desc: 'One free EV charging session' },
    { id: 'r7', name: 'Tree Plantation (Your Name)', cost: 100, icon: '🌳', partner: 'SayTrees NGO', desc: 'Plant a tree in Bengaluru in your name' },
    { id: 'r8', name: 'Carbon Offset 10kg CO₂', cost: 80, icon: '🌍', partner: 'Gold Standard', desc: 'Offset 10kg of CO₂ emissions' },
  ];

  const redeemReward = (id: string) => {
    const reward = REDEEM_OPTIONS.find(r => r.id === id);
    if (!reward || totalCoins < reward.cost) return;
    setCoins(prev => [{
      id: `ec-redeem-${Date.now()}`,
      source: `Redeemed: ${reward.name}`,
      amount: -reward.cost,
      date: new Date().toISOString().split('T')[0],
      icon: reward.icon,
    }, ...prev]);
    setSelectedReward(reward.name);
    setTimeout(() => setSelectedReward(null), 3000);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Eco Coin Wallet */}
      <div className="card-surface p-5 relative overflow-hidden">
        <CardLeaves variant="c" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-[10px] bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center">
              <Coins className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-[15px] font-bold text-[#1a2e1a]">Eco Coin Wallet</h3>
              <p className="text-[11px] text-[#5e7a5e]">Earn coins for every green action</p>
            </div>
          </div>

          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <motion.p className="text-[36px] font-bold text-[#2d8a4e]"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                {totalCoins}
                <span className="text-[16px] font-normal text-[#5e7a5e] ml-2">coins</span>
              </motion.p>
              <p className="text-[12px] text-[#5e7a5e]">
                {coins.filter(c => c.amount > 0).length === 0
                  ? 'Complete challenges to earn your first coins'
                  : `Earned from ${coins.filter(c => c.amount > 0).length} green actions`}
              </p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowRedeemModal(!showRedeemModal)}
                className="px-4 py-2.5 rounded-[12px] bg-gradient-to-r from-[#2d8a4e] to-[#5cb85c] text-white text-[13px] font-semibold hover:shadow-lg hover:shadow-[#2d8a4e]/25 transition-all flex items-center gap-1.5">
                <Gift className="w-4 h-4" /> Redeem
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="card-inset p-3 rounded-[10px] text-center">
              <p className="text-[16px] font-bold text-[#2d8a4e]">{coins.filter(c => c.amount > 0).reduce((s, c) => s + c.amount, 0)}</p>
              <p className="text-[10px] text-[#5e7a5e]">Total Earned</p>
            </div>
            <div className="card-inset p-3 rounded-[10px] text-center">
              <p className="text-[16px] font-bold text-red-500">{Math.abs(coins.filter(c => c.amount < 0).reduce((s, c) => s + c.amount, 0))}</p>
              <p className="text-[10px] text-[#5e7a5e]">Redeemed</p>
            </div>
            <div className="card-inset p-3 rounded-[10px] text-center">
              <p className="text-[16px] font-bold text-amber-500">{completedChallenges}/{challenges.length}</p>
              <p className="text-[10px] text-[#5e7a5e]">Challenges Done</p>
            </div>
          </div>
        </div>
      </div>

      {/* Success Toast */}
      <AnimatePresence>
        {selectedReward && (
          <motion.div initial={{ opacity: 0, y: -20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="bg-[#2d8a4e] text-white p-4 rounded-[14px] flex items-center gap-3 shadow-xl shadow-[#2d8a4e]/30">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <Check className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[14px] font-bold">Reward Redeemed!</p>
              <p className="text-[12px] opacity-80">{selectedReward} — check your email for the voucher</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Redeem Marketplace */}
      <AnimatePresence>
        {showRedeemModal && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="card-surface p-4 relative overflow-hidden">
            <CardLeaves variant="a" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Gift className="w-4 h-4 text-[#2d8a4e]" />
                  <h3 className="text-[14px] font-bold text-[#1a2e1a]">Redeem Eco Coins</h3>
                </div>
                <button onClick={() => setShowRedeemModal(false)} className="p-1.5 rounded-full bg-[#1a2e1a]/5 hover:bg-[#1a2e1a]/10">
                  <X className="w-4 h-4 text-[#5e7a5e]" />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {REDEEM_OPTIONS.map((r, i) => {
                  const canAfford = totalCoins >= r.cost;
                  return (
                    <motion.div key={r.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                      className={`card-inset p-3 rounded-[12px] transition-all ${canAfford ? 'hover:shadow-md cursor-pointer' : 'opacity-50'}`}>
                      <div className="flex items-start gap-2.5">
                        <span className="text-xl mt-0.5">{r.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] font-semibold text-[#1a2e1a]">{r.name}</p>
                          <p className="text-[10px] text-[#5e7a5e]">{r.desc}</p>
                          <p className="text-[9px] text-[#5e7a5e]/60 mt-0.5">Partner: {r.partner}</p>
                        </div>
                        <button onClick={() => canAfford && redeemReward(r.id)} disabled={!canAfford}
                          className={`px-2.5 py-1.5 rounded-[8px] text-[11px] font-bold flex-shrink-0 flex items-center gap-1 ${canAfford ? 'bg-[#2d8a4e] text-white hover:bg-[#246e3f]' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>
                          <Coins className="w-3 h-3" /> {r.cost}
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Challenges */}
      <div className="card-surface p-4 relative">
        <CardLeaves variant="d" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-4 h-4 text-[#2d8a4e]" />
            <h3 className="text-[14px] font-bold text-[#1a2e1a]">Weekly Challenges</h3>
            <span className="text-[10px] text-[#5e7a5e] ml-auto">{completedChallenges}/{challenges.length} completed</span>
          </div>
          <div className="space-y-2.5">
            {challenges.map((ch, i) => {
              const pct = (ch.current / ch.target) * 100;
              const completed = ch.current >= ch.target;
              return (
                <motion.div key={ch.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                  className={`card-inset p-3 rounded-[12px] ${completed ? 'ring-1 ring-[#2d8a4e]/20 bg-[#2d8a4e]/5' : ''}`}>
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-[10px] flex items-center justify-center text-lg flex-shrink-0 ${completed ? 'bg-[#2d8a4e]/10' : 'bg-[#f0f7f0]'}`}>
                      {ch.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={`text-[13px] font-semibold ${completed ? 'text-[#2d8a4e]' : 'text-[#1a2e1a]'}`}>{ch.name}</p>
                        {completed && <BadgeCheck className="w-4 h-4 text-[#2d8a4e]" />}
                      </div>
                      <p className="text-[11px] text-[#5e7a5e]">{ch.description}</p>
                      <div className="mt-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] text-[#5e7a5e]">{ch.current}/{ch.target} {ch.unit}</span>
                          <span className="text-[10px] font-semibold text-amber-500 flex items-center gap-0.5"><Coins className="w-3 h-3" /> {ch.reward} coins</span>
                        </div>
                        <div className="h-2 bg-[#e8f5e8] rounded-full overflow-hidden">
                          <motion.div className="h-full rounded-full" initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }} transition={{ duration: 0.6, delay: i * 0.08 }}
                            style={{ background: completed ? '#2d8a4e' : pct > 50 ? '#22c55e' : pct > 0 ? '#f59e0b' : '#e8f5e8' }} />
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-[9px] text-[#5e7a5e]/60 flex items-center gap-1"><Calendar className="w-3 h-3" /> Due: {ch.deadline}</span>
                        {!completed && (
                          <button onClick={() => advanceChallenge(ch.id)}
                            className="text-[10px] font-semibold text-[#2d8a4e] bg-[#2d8a4e]/8 px-2.5 py-1 rounded-full hover:bg-[#2d8a4e]/15 transition-colors flex items-center gap-1">
                            <Check className="w-3 h-3" /> Log Progress
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Leaderboard — no fake users */}
      <div className="card-surface p-4 relative">
        <CardLeaves variant="b" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <Trophy className="w-4 h-4 text-amber-500" />
            <h3 className="text-[14px] font-bold text-[#1a2e1a]">Eco Coin Leaderboard</h3>
            <span className="text-[10px] text-[#5e7a5e] ml-auto">Bengaluru</span>
          </div>
          <div className="space-y-1.5">
            <div className="card-inset px-3 py-2.5 rounded-[10px] flex items-center gap-3 ring-1 ring-[#2d8a4e]/20 bg-[#2d8a4e]/5">
              <span className="text-[14px] font-bold w-6 text-center text-[#5e7a5e]">#1</span>
              <span className="text-lg">🌱</span>
              <div className="flex-1">
                <p className="text-[12px] font-semibold text-[#2d8a4e]">You</p>
                <p className="text-[10px] text-[#5e7a5e]">0 day streak</p>
              </div>
              <span className="text-[13px] font-bold text-amber-500 flex items-center gap-0.5"><Coins className="w-3.5 h-3.5" /> {totalCoins}</span>
            </div>
            <div className="text-center py-4">
              <p className="text-[12px] text-[#5e7a5e]">Earn coins to climb the leaderboard</p>
            </div>
          </div>
        </div>
      </div>

      {/* Coin History */}
      <div className="card-surface-sm p-4 relative">
        <CardLeaves variant="a" />
        <div className="relative z-10">
          <button onClick={() => setShowCoinHistory(!showCoinHistory)} className="w-full flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#2d8a4e]" />
              <h4 className="text-[14px] font-semibold text-[#1a2e1a]">Coin History ({coins.length})</h4>
            </div>
            {showCoinHistory ? <ChevronUp className="w-4 h-4 text-[#5e7a5e]" /> : <ChevronDown className="w-4 h-4 text-[#5e7a5e]" />}
          </button>
          <AnimatePresence>
            {showCoinHistory && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                className="mt-3 space-y-1.5 overflow-hidden max-h-[300px] overflow-y-auto">
                {coins.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-[12px] text-[#5e7a5e]">No coin activity yet</p>
                  </div>
                ) : (
                  coins.map((c) => (
                    <div key={c.id} className="card-inset px-3 py-2 rounded-[10px] flex items-center gap-3">
                      <span className="text-lg">{c.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-medium text-[#1a2e1a] truncate">{c.source}</p>
                        <p className="text-[10px] text-[#5e7a5e]">{c.date}</p>
                      </div>
                      <span className={`text-[12px] font-bold ${c.amount >= 0 ? 'text-[#2d8a4e]' : 'text-red-500'}`}>
                        {c.amount >= 0 ? '+' : ''}{c.amount}
                      </span>
                    </div>
                  ))
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Partner Badges Collection — all locked */}
      <div className="card-surface p-4 relative">
        <CardLeaves variant="c" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <Award className="w-4 h-4 text-[#2d8a4e]" />
            <h3 className="text-[14px] font-bold text-[#1a2e1a]">Badge Collection</h3>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {[
              { name: 'Metro Warrior', emoji: '🚇', earned: false, desc: '10+ metro rides' },
              { name: 'Zero Waste', emoji: '♻️', earned: false, desc: '5+ refill visits' },
              { name: 'Green Eater', emoji: '🥬', earned: false, desc: '15+ organic meals' },
              { name: 'EV Pioneer', emoji: '⚡', earned: false, desc: '10+ EV charges' },
              { name: 'Tree Hugger', emoji: '🌳', earned: false, desc: 'Plant 3 trees' },
              { name: 'Carbon Neutral', emoji: '🌍', earned: false, desc: 'Offset 50kg CO₂' },
            ].map((b, i) => (
              <motion.div key={b.name} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.06 }}
                className={`card-inset p-3 rounded-[12px] text-center ${!b.earned ? 'opacity-40 grayscale' : ''}`}>
                <div className="text-2xl mb-1">{b.emoji}</div>
                <p className="text-[10px] font-semibold text-[#1a2e1a]">{b.name}</p>
                <p className="text-[8px] text-[#5e7a5e]">{b.desc}</p>
                {b.earned && <Check className="w-3 h-3 text-[#2d8a4e] mx-auto mt-1" />}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   MAIN GREEN FINANCE VIEW
   ══════════════════════════════════════════════════════════════ */
export function GreenFinanceView() {
  const [activeTab, setActiveTab] = useState<'score' | 'rewards'>('score');

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-4">
      {/* Hero */}
      <div className="card-surface p-5 relative overflow-hidden">
        <CardLeaves variant="b" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-[20px] font-bold text-[#1a2e1a] flex items-center gap-2">Green Finance <TinyLeaf className="rotate-[15deg]" /></h1>
              <p className="text-[12px] text-[#5e7a5e]">Your sustainability credit score & eco rewards</p>
            </div>
          </div>
          <div className="flex gap-2 mt-2">
            <button onClick={() => setActiveTab('score')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-[12px] text-[12px] font-semibold transition-all ${activeTab === 'score' ? 'bg-[#2d8a4e] text-white shadow-lg shadow-[#2d8a4e]/20' : 'bg-[#e8f5e8] text-[#2d8a4e] hover:bg-[#d4edd4]'}`}>
              <Shield className="w-4 h-4" /> Green Score
            </button>
            <button onClick={() => setActiveTab('rewards')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-[12px] text-[12px] font-semibold transition-all ${activeTab === 'rewards' ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white shadow-lg shadow-amber-500/20' : 'bg-[#e8f5e8] text-amber-600 hover:bg-[#d4edd4]'}`}>
              <Gift className="w-4 h-4" /> Rewards Hub
            </button>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'score' ? (
          <motion.div key="score" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <GreenScoreTab />
          </motion.div>
        ) : (
          <motion.div key="rewards" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <RewardsHubTab />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
