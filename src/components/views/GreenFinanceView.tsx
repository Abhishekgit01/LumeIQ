'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, TrendingUp, Car, Utensils, ShoppingBag, Home, ChevronRight,
  ChevronDown, ChevronUp, Target, Crown, Lock, Unlock, Sparkles,
  Coins, Wallet, CreditCard, Gift, Clock, Calendar, Check, X,
  Award, BadgeCheck, Leaf, PieChart
} from 'lucide-react';

/* ─── Types ─── */
interface ScoreCategory {
  id: string; name: string; icon: React.ReactNode; weight: number;
  score: number; maxScore: number; color: string;
  breakdown: { label: string; value: number; max: number; tip: string }[];
}

interface EcoChallenge {
  id: string; name: string; description: string; icon: string;
  target: number; current: number; unit: string; reward: number;
  deadline: string; category: string;
}

interface EcoCoin { id: string; source: string; amount: number; date: string; icon: string; }

/* ─── Data ─── */
const SCORE_CATEGORIES: ScoreCategory[] = [
  { id: 'transport', name: 'Transport', icon: <Car className="w-4 h-4" />, weight: 30, score: 0, maxScore: 100, color: '#007aff',
    breakdown: [
      { label: 'Public transit usage', value: 0, max: 100, tip: 'Log metro/bus rides' },
      { label: 'Ride-hail frequency', value: 0, max: 100, tip: 'Use e-bikes for short trips' },
      { label: 'Flight frequency', value: 0, max: 100, tip: 'Less flights = higher score' },
      { label: 'EV adoption', value: 0, max: 100, tip: 'Log EV charging sessions' },
    ]
  },
  { id: 'food', name: 'Food & Diet', icon: <Utensils className="w-4 h-4" />, weight: 25, score: 0, maxScore: 100, color: '#30d158',
    breakdown: [
      { label: 'Organic spending', value: 0, max: 100, tip: 'Shop at organic stores' },
      { label: 'Delivery vs dine-in', value: 0, max: 100, tip: 'Dine-in reduces emissions' },
      { label: 'Plant-based meals', value: 0, max: 100, tip: 'Log plant-based meals' },
      { label: 'Local sourcing', value: 0, max: 100, tip: 'Buy from local farms' },
    ]
  },
  { id: 'shopping', name: 'Shopping', icon: <ShoppingBag className="w-4 h-4" />, weight: 20, score: 0, maxScore: 100, color: '#ff9f0a',
    breakdown: [
      { label: 'Fast fashion', value: 0, max: 100, tip: 'Avoid fast fashion' },
      { label: 'Secondhand buying', value: 0, max: 100, tip: 'Log thrift visits' },
      { label: 'Package-free shopping', value: 0, max: 100, tip: 'Use refill stations' },
      { label: 'Repair vs replace', value: 0, max: 100, tip: 'Log repair activities' },
    ]
  },
  { id: 'energy', name: 'Energy & Home', icon: <Home className="w-4 h-4" />, weight: 15, score: 0, maxScore: 100, color: '#bf5af2',
    breakdown: [
      { label: 'Electricity trend', value: 0, max: 100, tip: 'Connect your utility account' },
      { label: 'Renewable energy', value: 0, max: 100, tip: 'Rooftop solar boosts this' },
      { label: 'Water conservation', value: 0, max: 100, tip: 'Track daily water usage' },
      { label: 'Waste management', value: 0, max: 100, tip: 'Start composting' },
    ]
  },
  { id: 'finance', name: 'Green Investments', icon: <TrendingUp className="w-4 h-4" />, weight: 10, score: 0, maxScore: 100, color: '#5ac8fa',
    breakdown: [
      { label: 'ESG fund allocation', value: 0, max: 100, tip: 'Allocate portfolio to ESG' },
      { label: 'Green bond holdings', value: 0, max: 100, tip: 'Green bonds offer impact' },
      { label: 'Carbon offset purchases', value: 0, max: 100, tip: 'Buy carbon offsets' },
      { label: 'Sustainable SIP', value: 0, max: 100, tip: 'Start a green SIP' },
    ]
  },
];

const REWARD_TIERS = [
  { name: 'Seedling', minScore: 0, color: '#8e8e93', perks: ['Basic eco tips', 'Weekly report'], badge: '🌱' },
  { name: 'Sapling', minScore: 400, color: '#ff9f0a', perks: ['2% green cashback', 'Partner discounts'], badge: '🌿' },
  { name: 'Canopy', minScore: 550, color: '#30d158', perks: ['5% cashback', 'Green loan 0.5% cut'], badge: '🌳' },
  { name: 'Evergreen', minScore: 700, color: '#007aff', perks: ['8% cashback', 'Free metro pass'], badge: '🏔️' },
  { name: 'Guardian', minScore: 850, color: '#bf5af2', perks: ['12% cashback', 'Premium perks'], badge: '🌍' },
];

const INITIAL_CHALLENGES: EcoChallenge[] = [
  { id: 'ch1', name: 'Car-Free Week', description: 'Use only metro, bus, or cycle for 7 days', icon: '🚇', target: 7, current: 0, unit: 'days', reward: 50, deadline: '2026-02-21', category: 'Transport' },
  { id: 'ch2', name: 'Zero Delivery', description: 'No food delivery apps for 5 days', icon: '🍳', target: 5, current: 0, unit: 'days', reward: 30, deadline: '2026-02-19', category: 'Food' },
  { id: 'ch3', name: 'Thrift Hunter', description: 'Make 3 secondhand purchases', icon: '♻️', target: 3, current: 0, unit: 'purchases', reward: 40, deadline: '2026-02-28', category: 'Shopping' },
  { id: 'ch4', name: 'Green Commuter', description: 'Plan 5 eco routes', icon: '🗺️', target: 5, current: 0, unit: 'routes', reward: 35, deadline: '2026-02-20', category: 'Transport' },
  { id: 'ch5', name: 'Plant Power', description: 'Log 10 plant-based meals', icon: '🥗', target: 10, current: 0, unit: 'meals', reward: 45, deadline: '2026-02-28', category: 'Food' },
  { id: 'ch6', name: 'Energy Saver', description: 'Reduce electricity by 10%', icon: '💡', target: 10, current: 0, unit: '% saved', reward: 60, deadline: '2026-02-28', category: 'Energy' },
];

const REDEEM_OPTIONS = [
  { id: 'r1', name: 'Metro Day Pass', cost: 50, icon: '🚇', partner: 'BMRCL' },
  { id: 'r2', name: 'E-Bike 1hr Free', cost: 20, icon: '🚲', partner: 'Yulu' },
  { id: 'r3', name: '20% Off Meal', cost: 35, icon: '🥬', partner: 'Terra Kitchen' },
  { id: 'r4', name: '₹100 Groceries', cost: 40, icon: '🌿', partner: 'EcoMart' },
  { id: 'r5', name: 'Free Coffee', cost: 15, icon: '☕', partner: 'GreenLeaf' },
  { id: 'r6', name: 'EV Free Charge', cost: 60, icon: '⚡', partner: 'BESCOM' },
  { id: 'r7', name: 'Plant a Tree', cost: 100, icon: '🌳', partner: 'SayTrees' },
  { id: 'r8', name: 'Offset 10kg CO₂', cost: 80, icon: '🌍', partner: 'Gold Standard' },
];

/* ─── Score Ring ─── */
function ScoreRing({ score, size = 120 }: { score: number; size?: number }) {
  const r = (size - 12) / 2;
  const circ = 2 * Math.PI * r;
  const pct = score / 900;
  const color = score >= 700 ? '#30d158' : score >= 550 ? '#007aff' : score >= 400 ? '#ff9f0a' : score > 0 ? '#ff375f' : '#8e8e93';

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--ios-separator)" strokeWidth={10} />
        <motion.circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={10} strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - pct * circ }}
          transition={{ duration: 1.5, ease: 'easeOut' }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span className="text-[28px] font-bold" style={{ color }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
          {score}
        </motion.span>
        <span className="text-[11px] text-[var(--ios-tertiary-label)]">/ 900</span>
      </div>
    </div>
  );
}

/* ─── Category Row ─── */
function CategoryRow({ cat, expanded, onToggle }: { cat: ScoreCategory; expanded: boolean; onToggle: () => void }) {
  return (
    <div>
      <button onClick={onToggle} className="w-full flex items-center gap-3 px-4 py-3 ios-press">
        <div className="w-8 h-8 rounded-[8px] flex items-center justify-center" style={{ background: `${cat.color}18`, color: cat.color }}>
          {cat.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[15px] font-semibold text-[var(--ios-label)]">{cat.name}</span>
            <span className="text-[13px] font-bold tabular-nums" style={{ color: cat.color }}>{cat.score}</span>
          </div>
          <div className="h-[3px] rounded-full bg-[var(--ios-separator)]">
            <motion.div className="h-full rounded-full" style={{ background: cat.color }}
              initial={{ width: 0 }} animate={{ width: `${(cat.score / cat.maxScore) * 100}%` }} transition={{ duration: 0.8 }} />
          </div>
        </div>
        <span className="text-[11px] text-[var(--ios-tertiary-label)] font-medium">{cat.weight}%</span>
        {expanded ? <ChevronUp className="w-4 h-4 text-[var(--ios-tertiary-label)]" /> : <ChevronDown className="w-4 h-4 text-[var(--ios-tertiary-label)]" />}
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="px-4 pb-3 pl-[60px] space-y-2.5">
              {cat.breakdown.map((b, i) => (
                <div key={i}>
                  <div className="flex justify-between mb-0.5">
                    <span className="text-[13px] text-[var(--ios-tertiary-label)]">{b.label}</span>
                    <span className="text-[13px] font-semibold text-[var(--ios-tertiary-label)]">{b.value}%</span>
                  </div>
                  <div className="h-[2px] rounded-full bg-[var(--ios-separator)]">
                    <div className="h-full rounded-full bg-[var(--ios-tertiary-label)]" style={{ width: `${b.value}%` }} />
                  </div>
                  <p className="text-[11px] text-[var(--ios-tertiary-label)] mt-0.5 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-[var(--ios-orange)]" />{b.tip}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══ GREEN SCORE TAB ═══ */
function GreenScoreTab() {
  const [expandedCat, setExpandedCat] = useState<string | null>(null);

  const greenScore = useMemo(() => {
    return Math.round(SCORE_CATEGORIES.reduce((sum, c) => sum + (c.score * c.weight / 100), 0) * 9);
  }, []);

  const currentTier = [...REWARD_TIERS].reverse().find(t => greenScore >= t.minScore) || REWARD_TIERS[0];
  const nextTier = REWARD_TIERS[REWARD_TIERS.findIndex(t => t.name === currentTier.name) + 1] || null;

  return (
    <div className="flex flex-col gap-4">
      {/* Score Hero */}
      <div className="ios-card p-5">
        <div className="flex items-center gap-6">
          <ScoreRing score={greenScore} />
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{currentTier.badge}</span>
              <div>
                <p className="text-[17px] font-bold" style={{ color: currentTier.color }}>{currentTier.name}</p>
                <p className="text-[13px] text-[var(--ios-tertiary-label)]">
                  {nextTier ? `${nextTier.minScore - greenScore} pts to ${nextTier.name}` : 'Highest tier!'}
                </p>
              </div>
            </div>
            {nextTier && (
              <div>
                <div className="h-[4px] rounded-full bg-[var(--ios-separator)]">
                  <motion.div className="h-full rounded-full"
                    style={{ background: `linear-gradient(90deg, ${currentTier.color}, ${nextTier.color})` }}
                    initial={{ width: 0 }}
                    animate={{ width: `${greenScore > currentTier.minScore ? ((greenScore - currentTier.minScore) / (nextTier.minScore - currentTier.minScore)) * 100 : 0}%` }}
                    transition={{ duration: 1 }} />
                </div>
              </div>
            )}
            <p className="text-[13px] text-[var(--ios-tertiary-label)]">Start logging eco actions to build your score</p>
          </div>
        </div>
      </div>

      {/* Score Breakdown */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <PieChart className="w-5 h-5 text-[var(--ios-blue)]" />
          <h2 className="text-[22px] font-bold text-[var(--ios-label)]">Breakdown</h2>
        </div>
        <div className="ios-card overflow-hidden">
          {SCORE_CATEGORIES.map((cat, i) => (
            <div key={cat.id}>
              <CategoryRow cat={cat} expanded={expandedCat === cat.id}
                onToggle={() => setExpandedCat(expandedCat === cat.id ? null : cat.id)} />
              {i < SCORE_CATEGORIES.length - 1 && <div className="ios-separator" />}
            </div>
          ))}
        </div>
      </section>

      {/* Tiers */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Crown className="w-5 h-5 text-[var(--ios-orange)]" />
          <h2 className="text-[22px] font-bold text-[var(--ios-label)]">Tiers</h2>
        </div>
        <div className="ios-card overflow-hidden">
          {REWARD_TIERS.map((tier, i) => {
            const isCurrent = tier.name === currentTier.name;
            const locked = greenScore < tier.minScore;
            return (
              <div key={tier.name}>
                <div className={`flex items-center gap-3 px-4 py-3 ${locked ? 'opacity-50' : ''}`}>
                  <span className="text-[22px]">{tier.badge}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[15px] font-semibold" style={{ color: tier.color }}>{tier.name}</span>
                      <span className="text-[11px] text-[var(--ios-tertiary-label)]">{tier.minScore}+</span>
                      {isCurrent && <span className="text-[9px] px-2 py-0.5 rounded-full font-bold" style={{ background: `${tier.color}18`, color: tier.color }}>CURRENT</span>}
                    </div>
                    <p className="text-[13px] text-[var(--ios-tertiary-label)] mt-0.5">{tier.perks.join(' · ')}</p>
                  </div>
                  {locked ? <Lock className="w-4 h-4 text-[var(--ios-tertiary-label)]" /> : <Unlock className="w-4 h-4" style={{ color: tier.color }} />}
                </div>
                {i < REWARD_TIERS.length - 1 && <div className="ios-separator" />}
              </div>
            );
          })}
        </div>
      </section>

      {/* Tips */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-5 h-5 text-[var(--ios-orange)]" />
          <h2 className="text-[22px] font-bold text-[var(--ios-label)]">Score Boosters</h2>
        </div>
        <div className="space-y-2">
          {[
            { tip: 'Log your first metro ride', impact: '+15', icon: '🚇' },
            { tip: 'Start a green SIP or ESG fund', impact: '+25', icon: '📈' },
            { tip: 'Visit an organic store', impact: '+18', icon: '🌿' },
            { tip: 'Log a plant-based meal', impact: '+20', icon: '🥗' },
          ].map((t, i) => (
            <div key={i} className="ios-card px-4 py-3 flex items-center gap-3">
              <span className="text-[20px]">{t.icon}</span>
              <p className="flex-1 text-[15px] text-[var(--ios-label)]">{t.tip}</p>
              <span className="text-[13px] font-bold text-[var(--eco-green)] px-2 py-1 rounded-full" style={{ background: 'var(--eco-green)', color: '#fff', opacity: 0.9 }}>
                {t.impact}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

/* ═══ REWARDS HUB TAB ═══ */
function RewardsHubTab() {
  const [challenges, setChallenges] = useState(INITIAL_CHALLENGES);
  const [coins, setCoins] = useState<EcoCoin[]>([]);
  const [showRedeem, setShowRedeem] = useState(false);
  const [redeemed, setRedeemed] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  const totalCoins = coins.reduce((s, c) => s + c.amount, 0);
  const completed = challenges.filter(c => c.current >= c.target).length;

  const advance = (id: string) => {
    setChallenges(prev => prev.map(c => {
      if (c.id !== id || c.current >= c.target) return c;
      const next = Math.min(c.current + 1, c.target);
      if (next === c.target) {
        setCoins(p => [{ id: `ec-${Date.now()}`, source: `Completed: ${c.name}`, amount: c.reward, date: new Date().toISOString().split('T')[0], icon: c.icon }, ...p]);
      }
      return { ...c, current: next };
    }));
  };

  const redeem = (id: string) => {
    const r = REDEEM_OPTIONS.find(o => o.id === id);
    if (!r || totalCoins < r.cost) return;
    setCoins(p => [{ id: `rd-${Date.now()}`, source: `Redeemed: ${r.name}`, amount: -r.cost, date: new Date().toISOString().split('T')[0], icon: r.icon }, ...p]);
    setRedeemed(r.name);
    setTimeout(() => setRedeemed(null), 3000);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Coin Wallet */}
      <div className="ios-card p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-[12px] bg-gradient-to-br from-[#ff9f0a] to-[#ffd60a] flex items-center justify-center">
            <Coins className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-[17px] font-bold text-[var(--ios-label)]">Eco Coins</h3>
            <p className="text-[13px] text-[var(--ios-tertiary-label)]">Earn coins for green actions</p>
          </div>
        </div>
        <motion.p className="text-[40px] font-bold text-[var(--ios-label)] tabular-nums"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {totalCoins}<span className="text-[17px] font-normal text-[var(--ios-tertiary-label)] ml-2">coins</span>
        </motion.p>
        <div className="grid grid-cols-3 gap-2 mt-4">
          <div className="ios-card-inset p-3 text-center">
            <p className="text-[17px] font-bold text-[var(--eco-green)]">{coins.filter(c => c.amount > 0).reduce((s, c) => s + c.amount, 0)}</p>
            <p className="text-[11px] text-[var(--ios-tertiary-label)]">Earned</p>
          </div>
          <div className="ios-card-inset p-3 text-center">
            <p className="text-[17px] font-bold text-[var(--ios-red)]">{Math.abs(coins.filter(c => c.amount < 0).reduce((s, c) => s + c.amount, 0))}</p>
            <p className="text-[11px] text-[var(--ios-tertiary-label)]">Redeemed</p>
          </div>
          <div className="ios-card-inset p-3 text-center">
            <p className="text-[17px] font-bold text-[var(--ios-orange)]">{completed}/{challenges.length}</p>
            <p className="text-[11px] text-[var(--ios-tertiary-label)]">Done</p>
          </div>
        </div>
        <button onClick={() => setShowRedeem(!showRedeem)}
          className="w-full mt-4 py-3 rounded-[12px] text-[15px] font-semibold flex items-center justify-center gap-2 ios-press"
          style={{ background: 'var(--ios-blue)', color: '#fff' }}>
          <Gift className="w-4 h-4" /> Redeem Coins
        </button>
      </div>

      {/* Success Toast */}
      <AnimatePresence>
        {redeemed && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="p-4 rounded-[14px] flex items-center gap-3"
            style={{ background: 'var(--eco-green)', color: '#fff' }}>
            <Check className="w-5 h-5" />
            <div>
              <p className="text-[15px] font-bold">Redeemed!</p>
              <p className="text-[13px] opacity-80">{redeemed}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Redeem Grid */}
      <AnimatePresence>
        {showRedeem && (
          <motion.section initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[22px] font-bold text-[var(--ios-label)]">Redeem</h2>
              <button onClick={() => setShowRedeem(false)} className="w-8 h-8 rounded-full bg-[var(--ios-card)] flex items-center justify-center ios-press">
                <X className="w-4 h-4 text-[var(--ios-tertiary-label)]" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {REDEEM_OPTIONS.map(r => {
                const ok = totalCoins >= r.cost;
                return (
                  <div key={r.id} className={`ios-card p-3 ${!ok ? 'opacity-40' : ''}`}>
                    <span className="text-[22px]">{r.icon}</span>
                    <p className="text-[13px] font-semibold text-[var(--ios-label)] mt-1">{r.name}</p>
                    <p className="text-[11px] text-[var(--ios-tertiary-label)]">{r.partner}</p>
                    <button onClick={() => ok && redeem(r.id)} disabled={!ok}
                      className="mt-2 w-full py-1.5 rounded-[8px] text-[11px] font-bold flex items-center justify-center gap-1 ios-press"
                      style={{ background: ok ? 'var(--ios-blue)' : 'var(--ios-separator)', color: ok ? '#fff' : 'var(--ios-tertiary-label)' }}>
                      <Coins className="w-3 h-3" />{r.cost}
                    </button>
                  </div>
                );
              })}
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Challenges */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[22px] font-bold text-[var(--ios-label)]">Challenges</h2>
          <span className="text-[13px] text-[var(--ios-tertiary-label)]">{completed}/{challenges.length}</span>
        </div>
        <div className="space-y-2">
          {challenges.map((ch) => {
            const pct = (ch.current / ch.target) * 100;
            const done = ch.current >= ch.target;
            return (
              <div key={ch.id} className="ios-card px-4 py-3.5 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-[18px] ${done ? '' : ''}`}
                  style={{ background: done ? 'var(--eco-green)' : 'var(--ios-grouped-bg)' }}>
                  {done ? <Check className="w-5 h-5 text-white" /> : ch.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-[15px] font-semibold ${done ? 'text-[var(--eco-green)]' : 'text-[var(--ios-label)]'}`}>{ch.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 h-[3px] rounded-full bg-[var(--ios-separator)]">
                      <motion.div className="h-full rounded-full" initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                        style={{ background: done ? 'var(--eco-green)' : pct > 50 ? 'var(--ios-blue)' : 'var(--ios-orange)' }} />
                    </div>
                    <span className="text-[11px] tabular-nums text-[var(--ios-tertiary-label)]">{ch.current}/{ch.target}</span>
                  </div>
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="text-[11px] text-[var(--ios-tertiary-label)] flex items-center gap-1"><Coins className="w-3 h-3 text-[var(--ios-orange)]" />{ch.reward} coins</span>
                    {!done && (
                      <button onClick={() => advance(ch.id)}
                        className="text-[11px] font-semibold px-2.5 py-1 rounded-full ios-press"
                        style={{ background: 'var(--ios-blue)', color: '#fff' }}>
                        Log
                      </button>
                    )}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[var(--ios-tertiary-label)] flex-shrink-0" />
              </div>
            );
          })}
        </div>
      </section>

      {/* Coin History */}
      <section>
        <button onClick={() => setShowHistory(!showHistory)} className="w-full flex items-center justify-between mb-3 ios-press">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-[var(--ios-blue)]" />
            <h2 className="text-[22px] font-bold text-[var(--ios-label)]">History</h2>
          </div>
          {showHistory ? <ChevronUp className="w-5 h-5 text-[var(--ios-tertiary-label)]" /> : <ChevronDown className="w-5 h-5 text-[var(--ios-tertiary-label)]" />}
        </button>
        <AnimatePresence>
          {showHistory && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
              {coins.length === 0 ? (
                <div className="ios-card p-5 text-center">
                  <p className="text-[15px] text-[var(--ios-tertiary-label)]">No coin activity yet</p>
                </div>
              ) : (
                <div className="ios-card overflow-hidden">
                  {coins.map((c, i) => (
                    <div key={c.id}>
                      <div className="flex items-center gap-3 px-4 py-3">
                        <span className="text-[18px]">{c.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-[15px] text-[var(--ios-label)] truncate">{c.source}</p>
                          <p className="text-[13px] text-[var(--ios-tertiary-label)]">{c.date}</p>
                        </div>
                        <span className={`text-[15px] font-bold tabular-nums ${c.amount >= 0 ? 'text-[var(--eco-green)]' : 'text-[var(--ios-red)]'}`}>
                          {c.amount >= 0 ? '+' : ''}{c.amount}
                        </span>
                      </div>
                      {i < coins.length - 1 && <div className="ios-separator" />}
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Badges */}
      <section className="pb-4">
        <div className="flex items-center gap-2 mb-3">
          <Award className="w-5 h-5 text-[var(--ios-blue)]" />
          <h2 className="text-[22px] font-bold text-[var(--ios-label)]">Badges</h2>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { name: 'Metro Warrior', emoji: '🚇', desc: '10+ rides' },
            { name: 'Zero Waste', emoji: '♻️', desc: '5+ refills' },
            { name: 'Green Eater', emoji: '🥬', desc: '15+ meals' },
            { name: 'EV Pioneer', emoji: '⚡', desc: '10+ charges' },
            { name: 'Tree Hugger', emoji: '🌳', desc: '3 trees' },
            { name: 'Carbon Neutral', emoji: '🌍', desc: '50kg offset' },
          ].map(b => (
            <div key={b.name} className="ios-card p-3 text-center opacity-40">
              <div className="text-[28px] mb-1">{b.emoji}</div>
              <p className="text-[11px] font-semibold text-[var(--ios-label)]">{b.name}</p>
              <p className="text-[9px] text-[var(--ios-tertiary-label)]">{b.desc}</p>
              <Lock className="w-3 h-3 text-[var(--ios-tertiary-label)] mx-auto mt-1" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

/* ═══ MAIN VIEW ═══ */
export function GreenFinanceView() {
  const [tab, setTab] = useState<'score' | 'rewards'>('score');

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-4">
      {/* Segmented Control */}
      <div className="flex p-[3px] rounded-[10px]" style={{ background: 'var(--ios-separator)' }}>
        {([['score', 'Green Score'], ['rewards', 'Rewards Hub']] as const).map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            className="flex-1 py-2 rounded-[8px] text-[13px] font-semibold transition-all ios-press flex items-center justify-center gap-1.5"
            style={{
              background: tab === key ? 'var(--ios-card)' : 'transparent',
              color: tab === key ? 'var(--ios-label)' : 'var(--ios-tertiary-label)',
              boxShadow: tab === key ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            }}>
            {key === 'score' ? <Shield className="w-4 h-4" /> : <Gift className="w-4 h-4" />}
            {label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {tab === 'score' ? (
          <motion.div key="score" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
            <GreenScoreTab />
          </motion.div>
        ) : (
          <motion.div key="rewards" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <RewardsHubTab />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
