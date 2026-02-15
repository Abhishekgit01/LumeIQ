'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wallet, Gift, ChevronLeft, ChevronRight, Copy, Lock, QrCode,
  TrendingUp, TrendingDown, ArrowUpRight, ArrowDownLeft,
  Leaf, Building2, CreditCard, PiggyBank, Receipt,
  Sparkles, Star, ShieldCheck, Check, BadgePercent,
} from 'lucide-react';
import { useStore } from '@/store/useStore';

/* ═══ Reward Coupons ═══ */
const COUPONS = [
  {
    id: 'eco10', title: '10% off on eco products', partner: 'GreenMart',
    emoji: '🛒', code: 'ECO10', expires: '1 Apr 2026', iqRequired: 0,
    gradient: 'linear-gradient(135deg, #1b6b3a 0%, #0d4a25 100%)',
  },
  {
    id: 'metro5', title: '5% cashback on public transport', partner: 'MetroPass',
    emoji: '🚇', code: 'METRO5', expires: '15 Apr 2026', iqRequired: 0,
    gradient: 'linear-gradient(135deg, #1a4a7a 0%, #0d2e52 100%)',
  },
  {
    id: 'tree', title: 'Tree planting voucher', partner: 'GreenEarth',
    emoji: '🌳', code: 'TREE2026', expires: '1 May 2026', iqRequired: 60,
    gradient: 'linear-gradient(135deg, #4a3a1a 0%, #2e250d 100%)',
  },
  {
    id: 'solar', title: '15% off solar accessories', partner: 'SunPower',
    emoji: '☀️', code: 'SOLAR15', expires: '30 Jun 2026', iqRequired: 75,
    gradient: 'linear-gradient(135deg, #7a4a1a 0%, #523210 100%)',
  },
];

/* ═══ Transaction History ═══ */
const TRANSACTIONS = [
  { id: 1, title: 'Metro Ride Cashback', amount: 12, type: 'credit' as const, date: '14 Feb', icon: '🚇', category: 'Transport' },
  { id: 2, title: 'GreenMart Purchase', amount: -245, type: 'debit' as const, date: '13 Feb', icon: '🛒', category: 'Shopping' },
  { id: 3, title: 'Eco Challenge Reward', amount: 50, type: 'credit' as const, date: '12 Feb', icon: '🏆', category: 'Rewards' },
  { id: 4, title: 'Carbon Offset Credit', amount: 25, type: 'credit' as const, date: '11 Feb', icon: '🌿', category: 'Offset' },
  { id: 5, title: 'Thrift Store Purchase', amount: -89, type: 'debit' as const, date: '10 Feb', icon: '👕', category: 'Shopping' },
  { id: 6, title: 'Cycle Commute Bonus', amount: 30, type: 'credit' as const, date: '9 Feb', icon: '🚲', category: 'Transport' },
  { id: 7, title: 'Recycling Reward', amount: 15, type: 'credit' as const, date: '8 Feb', icon: '♻️', category: 'Rewards' },
];

/* ═══ Savings Goals ═══ */
const SAVINGS_GOALS = [
  { id: 'solar', name: 'Solar Panel Fund', target: 50000, current: 12500, icon: '☀️', color: '#ff9f0a' },
  { id: 'ev', name: 'EV Down Payment', target: 200000, current: 45000, icon: '⚡', color: '#5856d6' },
  { id: 'garden', name: 'Rooftop Garden', target: 15000, current: 9800, icon: '🌱', color: '#34c759' },
];

/* ═══ Partner Offers ═══ */
const PARTNER_OFFERS = [
  { id: 1, partner: 'GreenMart', offer: '2x cashback this week', badge: 'HOT', color: '#ff453a' },
  { id: 2, partner: 'MetroPass', offer: 'Free ride after 10 trips', badge: 'NEW', color: '#007aff' },
  { id: 3, partner: 'EcoWear', offer: '20% off sustainable fashion', badge: 'ECO', color: '#34c759' },
];

export function FinanceView() {
  const { user } = useStore();
  const [couponIdx, setCouponIdx] = useState(0);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [txFilter, setTxFilter] = useState<'all' | 'credit' | 'debit'>('all');
  const walletRef = useRef<HTMLDivElement>(null);

  if (!user) return null;

  const iq = user.IQ;
  const ecoBalance = 1247; // Mock eco-currency balance
  const monthlyEarned = 342;
  const monthlySaved = 1580;

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code).catch(() => {});
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const nextCoupon = () => setCouponIdx(i => Math.min(i + 1, COUPONS.length - 1));
  const prevCoupon = () => setCouponIdx(i => Math.max(i - 1, 0));

  const filteredTx = TRANSACTIONS.filter(tx => txFilter === 'all' || tx.type === txFilter);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="flex flex-col gap-4 pb-6"
    >
      {/* ═══ ECO BALANCE CARD ═══ */}
      <section className="ios-card overflow-hidden">
        <div
          className="p-5"
          style={{ background: 'linear-gradient(135deg, var(--ios-blue) 0%, #5856d6 100%)' }}
        >
          <div className="flex items-center gap-2 mb-1">
            <Wallet className="w-4 h-4 text-white/70" />
            <span className="text-[12px] font-medium text-white/70 uppercase tracking-wider">Eco Wallet</span>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[36px] font-bold text-white tracking-tight">
                <span className="text-[20px] font-normal text-white/60 mr-1">₹</span>
                {ecoBalance.toLocaleString()}
              </p>
              <p className="text-[13px] text-white/60 mt-0.5">Available eco-credits</p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-white/15">
                <Leaf className="w-3 h-3 text-white" />
                <span className="text-[11px] font-semibold text-white">IQ {iq}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <div className="flex-1 p-3 rounded-[12px] bg-white/10 backdrop-blur-sm">
              <div className="flex items-center gap-1.5 mb-1">
                <ArrowDownLeft className="w-3.5 h-3.5 text-[#30d158]" />
                <span className="text-[11px] text-white/50">Earned</span>
              </div>
              <p className="text-[17px] font-bold text-white">₹{monthlyEarned}</p>
              <p className="text-[10px] text-white/40">This month</p>
            </div>
            <div className="flex-1 p-3 rounded-[12px] bg-white/10 backdrop-blur-sm">
              <div className="flex items-center gap-1.5 mb-1">
                <PiggyBank className="w-3.5 h-3.5 text-[#ff9f0a]" />
                <span className="text-[11px] text-white/50">Saved</span>
              </div>
              <p className="text-[17px] font-bold text-white">₹{monthlySaved}</p>
              <p className="text-[10px] text-white/40">vs non-eco</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ QUICK ACTIONS ═══ */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { icon: CreditCard, label: 'Pay', color: '#007aff' },
          { icon: ArrowUpRight, label: 'Send', color: '#34c759' },
          { icon: Receipt, label: 'Bills', color: '#ff9f0a' },
          { icon: BadgePercent, label: 'Offers', color: '#ff453a' },
        ].map(({ icon: Icon, label, color }) => (
          <button
            key={label}
            className="ios-card flex flex-col items-center gap-1.5 py-3 ios-press"
          >
            <div
              className="w-10 h-10 rounded-[12px] flex items-center justify-center"
              style={{ backgroundColor: `${color}15` }}
            >
              <Icon className="w-5 h-5" style={{ color }} />
            </div>
            <span className="text-[11px] font-medium text-[var(--ios-secondary-label)]">{label}</span>
          </button>
        ))}
      </div>

      {/* ═══ REWARDS WALLET ═══ */}
      <section className="ios-card p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-[12px] bg-gradient-to-br from-[#ff9f0a] to-[#ff6b00] flex items-center justify-center">
            <Gift className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-[17px] font-semibold text-[var(--ios-label)]">Rewards Wallet</h2>
            <p className="text-[12px] text-[var(--ios-tertiary-label)]">Swipe to browse rewards</p>
          </div>
          <div className="flex gap-1">
            <button onClick={prevCoupon} className="w-7 h-7 rounded-full bg-[var(--ios-bg)] flex items-center justify-center ios-press">
              <ChevronLeft className="w-4 h-4 text-[var(--ios-tertiary-label)]" />
            </button>
            <button onClick={nextCoupon} className="w-7 h-7 rounded-full bg-[var(--ios-bg)] flex items-center justify-center ios-press">
              <ChevronRight className="w-4 h-4 text-[var(--ios-tertiary-label)]" />
            </button>
          </div>
        </div>

        {/* Wallet Cards */}
        <div ref={walletRef} className="relative h-[200px] overflow-hidden">
          {COUPONS.map((c, i) => {
            const offset = i - couponIdx;
            const isLocked = iq < c.iqRequired;
            return (
              <motion.div
                key={c.id}
                className="absolute inset-x-0 rounded-[16px] p-4 shadow-lg"
                style={{ background: c.gradient }}
                initial={false}
                animate={{
                  y: offset * 12,
                  scale: 1 - Math.abs(offset) * 0.04,
                  opacity: Math.abs(offset) > 2 ? 0 : 1 - Math.abs(offset) * 0.15,
                  zIndex: COUPONS.length - Math.abs(offset),
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-[11px] font-medium text-white/70 uppercase tracking-wider">LumeIQ Reward</p>
                    <p className="text-[18px] font-bold text-white mt-0.5">{c.title}</p>
                  </div>
                  <span className="text-[28px]">{c.emoji}</span>
                </div>

                {!isLocked ? (
                  <>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[13px] text-white/80">{c.partner}</p>
                        <p className="text-[11px] text-white/50 mt-0.5">Expires: {c.expires}</p>
                      </div>
                      <button
                        onClick={() => handleCopyCode(c.code)}
                        className="px-3 py-1.5 rounded-[8px] bg-white text-[12px] font-bold ios-press text-black"
                      >
                        {copiedCode === c.code ? (
                          <><Check className="w-3 h-3 inline mr-1 text-green-600" />Copied</>
                        ) : (
                          <><Copy className="w-3 h-3 inline mr-1" />{c.code}</>
                        )}
                      </button>
                    </div>
                    <div className="mt-3 pt-3 border-t border-white/10 flex items-center gap-2">
                      <QrCode className="w-4 h-4 text-white/50" />
                      <span className="text-[11px] text-white/40 font-mono">LUMEIQ-{c.code}-2026</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[13px] text-white/80">{c.partner}</p>
                        <p className="text-[11px] text-white/50 mt-0.5">Expires: {c.expires}</p>
                      </div>
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] bg-white/10">
                        <Lock className="w-3 h-3 text-white/60" />
                        <span className="text-[11px] text-white/60">IQ {c.iqRequired}+</span>
                      </div>
                    </div>
                    <div className="mt-3">
                      <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-white/50 rounded-full"
                          style={{ width: `${Math.min(100, (iq / c.iqRequired) * 100)}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-white/40 mt-1">
                        Need +{c.iqRequired - iq} IQ to unlock
                      </p>
                    </div>
                  </>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-1.5 mt-3">
          {COUPONS.map((_, i) => (
            <button
              key={i}
              onClick={() => setCouponIdx(i)}
              className={`w-2 h-2 rounded-full transition-all ${
                i === couponIdx ? 'bg-[var(--ios-blue)] w-4' : 'bg-[var(--ios-separator)]'
              }`}
            />
          ))}
        </div>
      </section>

      {/* ═══ PARTNER OFFERS ═══ */}
      <section className="ios-card p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-[12px] bg-gradient-to-br from-[#5856d6] to-[#3634a3] flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-[17px] font-semibold text-[var(--ios-label)]">Partner Offers</h2>
            <p className="text-[12px] text-[var(--ios-tertiary-label)]">Exclusive eco deals</p>
          </div>
        </div>
        <div className="space-y-2">
          {PARTNER_OFFERS.map(o => (
            <div
              key={o.id}
              className="flex items-center gap-3 p-3 rounded-[12px] bg-[var(--ios-bg)] ios-press"
            >
              <Building2 className="w-5 h-5 text-[var(--ios-secondary-label)]" />
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-medium text-[var(--ios-label)]">{o.partner}</p>
                <p className="text-[12px] text-[var(--ios-tertiary-label)] truncate">{o.offer}</p>
              </div>
              <span
                className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white"
                style={{ backgroundColor: o.color }}
              >
                {o.badge}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ SAVINGS GOALS ═══ */}
      <section className="ios-card p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-[12px] bg-gradient-to-br from-[#34c759] to-[#248a3d] flex items-center justify-center">
            <PiggyBank className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-[17px] font-semibold text-[var(--ios-label)]">Green Savings</h2>
            <p className="text-[12px] text-[var(--ios-tertiary-label)]">Save for sustainable goals</p>
          </div>
        </div>
        <div className="space-y-3">
          {SAVINGS_GOALS.map(g => {
            const pct = Math.min(100, (g.current / g.target) * 100);
            return (
              <div key={g.id} className="p-3 rounded-[12px] bg-[var(--ios-bg)]">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[20px]">{g.icon}</span>
                    <div>
                      <p className="text-[14px] font-medium text-[var(--ios-label)]">{g.name}</p>
                      <p className="text-[11px] text-[var(--ios-tertiary-label)]">
                        ₹{g.current.toLocaleString()} / ₹{g.target.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <span className="text-[14px] font-bold" style={{ color: g.color }}>
                    {pct.toFixed(0)}%
                  </span>
                </div>
                <div className="w-full h-2 bg-[var(--ios-separator)] rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: g.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 1, delay: 0.2 }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ═══ TRANSACTIONS ═══ */}
      <section className="ios-card p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-[12px] bg-gradient-to-br from-[#007aff] to-[#0055d4] flex items-center justify-center">
            <Receipt className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-[17px] font-semibold text-[var(--ios-label)]">Transactions</h2>
            <p className="text-[12px] text-[var(--ios-tertiary-label)]">Recent eco activity</p>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 p-0.5 bg-[var(--ios-bg)] rounded-[10px] mb-3">
          {(['all', 'credit', 'debit'] as const).map(f => (
            <button
              key={f}
              onClick={() => setTxFilter(f)}
              className={`flex-1 py-1.5 rounded-[8px] text-[12px] font-medium transition-all ${
                txFilter === f
                  ? 'bg-[var(--ios-card)] text-[var(--ios-label)] shadow-sm'
                  : 'text-[var(--ios-tertiary-label)]'
              }`}
            >
              {f === 'all' ? 'All' : f === 'credit' ? 'Earned' : 'Spent'}
            </button>
          ))}
        </div>

        <div className="space-y-1">
          <AnimatePresence mode="popLayout">
            {filteredTx.map(tx => (
              <motion.div
                key={tx.id}
                layout
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="flex items-center gap-3 p-3 rounded-[12px] bg-[var(--ios-bg)]"
              >
                <span className="text-[22px]">{tx.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-medium text-[var(--ios-label)]">{tx.title}</p>
                  <p className="text-[11px] text-[var(--ios-tertiary-label)]">{tx.date} &middot; {tx.category}</p>
                </div>
                <div className="text-right">
                  <p className={`text-[15px] font-bold tabular-nums ${
                    tx.type === 'credit' ? 'text-[#34c759]' : 'text-[var(--ios-label)]'
                  }`}>
                    {tx.type === 'credit' ? '+' : ''}₹{Math.abs(tx.amount)}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </section>

      {/* ═══ ECO CREDIT SCORE ═══ */}
      <section className="ios-card p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-[12px] bg-gradient-to-br from-[#30d158] to-[#248a3d] flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-[17px] font-semibold text-[var(--ios-label)]">Eco Credit Score</h2>
            <p className="text-[12px] text-[var(--ios-tertiary-label)]">Your sustainability rating</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-6">
          <div className="relative w-40 h-40">
            <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
              <circle cx="60" cy="60" r="52" fill="none" stroke="var(--ios-separator)" strokeWidth="8" />
              <motion.circle
                cx="60" cy="60" r="52" fill="none"
                stroke="#30d158"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 52}`}
                initial={{ strokeDashoffset: 2 * Math.PI * 52 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 52 * (1 - Math.min(iq, 100) / 100) }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-[32px] font-bold text-[var(--ios-label)]">{iq}</p>
              <p className="text-[11px] text-[var(--ios-tertiary-label)]">out of 100</p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 mt-2">
          {[
            { label: 'Spending', value: 'Green', color: '#34c759' },
            { label: 'Transport', value: 'Good', color: '#007aff' },
            { label: 'Lifestyle', value: 'Great', color: '#ff9f0a' },
          ].map(m => (
            <div key={m.label} className="text-center p-2 rounded-[10px] bg-[var(--ios-bg)]">
              <p className="text-[13px] font-bold" style={{ color: m.color }}>{m.value}</p>
              <p className="text-[10px] text-[var(--ios-tertiary-label)] mt-0.5">{m.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ CARBON OFFSET MARKETPLACE ═══ */}
      <section className="ios-card p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-[12px] bg-gradient-to-br from-[#ff9f0a] to-[#e68600] flex items-center justify-center">
            <Star className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-[17px] font-semibold text-[var(--ios-label)]">Carbon Marketplace</h2>
            <p className="text-[12px] text-[var(--ios-tertiary-label)]">Offset your remaining footprint</p>
          </div>
        </div>
        <div className="space-y-2">
          {[
            { name: 'Plant 5 Trees', cost: 150, co2: '25 kg', icon: '🌳' },
            { name: 'Fund Solar Panel', cost: 500, co2: '100 kg', icon: '☀️' },
            { name: 'Ocean Cleanup', cost: 300, co2: '50 kg', icon: '🌊' },
          ].map(item => (
            <div
              key={item.name}
              className="flex items-center gap-3 p-3 rounded-[12px] bg-[var(--ios-bg)]"
            >
              <span className="text-[24px]">{item.icon}</span>
              <div className="flex-1">
                <p className="text-[14px] font-medium text-[var(--ios-label)]">{item.name}</p>
                <p className="text-[11px] text-[var(--ios-tertiary-label)]">Offsets {item.co2} CO₂</p>
              </div>
              <button className="px-3 py-1.5 rounded-[8px] bg-[var(--ios-blue)] text-white text-[12px] font-semibold ios-press">
                ₹{item.cost}
              </button>
            </div>
          ))}
        </div>
      </section>
    </motion.div>
  );
}
