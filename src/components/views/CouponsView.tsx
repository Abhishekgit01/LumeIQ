'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Gift, Lock, Unlock, Tag, CheckCircle, Clock, ChevronRight,
  Sparkles, Star, Building2, ShoppingBag, Zap, Leaf, Coffee,
  Sun, Truck, Award, Copy, Check, X, TrendingUp
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useExtensionStore } from '@/store/useExtensionStore';
import { MOCK_COMPANIES } from '@/data/mockCompanies';
import { CardLeaves, SectionHeader, SmallLeaf } from '@/components/ui/LeafDecorations';

/* ─── Category Icons ─── */
const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  food: <Leaf className="w-4 h-4" />,
  fashion: <ShoppingBag className="w-4 h-4" />,
  transport: <Truck className="w-4 h-4" />,
  energy: <Sun className="w-4 h-4" />,
  lifestyle: <Coffee className="w-4 h-4" />,
};

const CATEGORY_COLORS: Record<string, string> = {
  food: '#2d8a4e',
  fashion: '#bf5af2',
  transport: '#007aff',
  energy: '#ff9f0a',
  lifestyle: '#ff6b6b',
};

export function CouponsView() {
  const { user } = useStore();
  const {
    availableCoupons,
    lockedCoupons,
    initialized,
    initializeExtensions,
    refreshCoupons,
    redeemCoupon,
  } = useExtensionStore();

  const [tab, setTab] = useState<'available' | 'locked' | 'companies'>('available');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [redeemingId, setRedeemingId] = useState<string | null>(null);
  const [justRedeemed, setJustRedeemed] = useState<string | null>(null);

  // Initialize on mount
  useEffect(() => {
    if (user && !initialized) {
      initializeExtensions(user.id, user.IQ, user.createdAt);
    }
  }, [user, initialized, initializeExtensions]);

  // Refresh coupons when IQ changes
  useEffect(() => {
    if (user && initialized) {
      refreshCoupons(user.IQ);
    }
  }, [user?.IQ, initialized, refreshCoupons]);

  const userIQ = user?.IQ ?? 0;

  const handleRedeem = (couponId: string) => {
    if (!user) return;
    setRedeemingId(couponId);
    setTimeout(() => {
      const result = redeemCoupon(couponId, user.id, user.IQ);
      setRedeemingId(null);
      if (result) {
        setJustRedeemed(couponId);
        setTimeout(() => setJustRedeemed(null), 3000);
      }
    }, 800);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col gap-5"
    >
      {/* ═══ Hero ═══ */}
      <div className="card-surface p-6 relative overflow-hidden">
        <CardLeaves variant="b" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-[16px] bg-gradient-to-br from-[#ff9f0a] to-[#ff6b00] flex items-center justify-center">
              <Gift className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-[22px] font-bold text-[var(--ios-label)] tracking-[-0.02em]">Eco Rewards</h2>
              <p className="text-[13px] text-[var(--ios-secondary-label)]">
                Unlock coupons as your Impact Quotient grows
              </p>
            </div>
          </div>

          {/* IQ Progress */}
          <div className="mt-4 p-3 rounded-[12px] bg-[var(--ios-bg)]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[12px] font-medium text-[var(--ios-secondary-label)]">Your Impact Quotient</span>
              <span className="text-[16px] font-bold text-[var(--ios-blue)]">{Math.round(userIQ)}</span>
            </div>
            <div className="w-full h-2 bg-[var(--ios-separator)] rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-[#007aff] to-[#30d158] rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, userIQ)}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-[10px] text-[var(--ios-tertiary-label)]">0</span>
              <span className="text-[10px] text-[var(--ios-tertiary-label)]">100</span>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ Tab Switcher ═══ */}
      <div className="flex gap-2 p-1 rounded-[12px] bg-[var(--ios-card)]">
        {([
          { id: 'available' as const, label: 'Available', icon: Unlock, count: availableCoupons.length },
          { id: 'locked' as const, label: 'Locked', icon: Lock, count: lockedCoupons.length },
          { id: 'companies' as const, label: 'Partners', icon: Building2, count: MOCK_COMPANIES.length },
        ]).map(({ id, label, icon: Icon, count }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-[10px] text-[13px] font-medium transition-all ${
              tab === id
                ? 'bg-[var(--ios-blue)] text-white shadow-sm'
                : 'text-[var(--ios-secondary-label)] ios-press'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
            <span className={`text-[11px] px-1.5 py-0.5 rounded-full ${
              tab === id ? 'bg-white/20' : 'bg-[var(--ios-separator)]'
            }`}>{count}</span>
          </button>
        ))}
      </div>

      {/* ═══ Content ═══ */}
      <AnimatePresence mode="wait">
        {tab === 'available' && (
          <motion.div
            key="available"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col gap-3"
          >
            {availableCoupons.length === 0 ? (
              <div className="card-surface p-8 text-center">
                <Sparkles className="w-10 h-10 text-[var(--ios-tertiary-label)] mx-auto mb-3" />
                <p className="text-[15px] font-medium text-[var(--ios-label)]">No coupons unlocked yet</p>
                <p className="text-[13px] text-[var(--ios-secondary-label)] mt-1">
                  Increase your IQ to {lockedCoupons.length > 0 ? lockedCoupons[0].minIQRequired : 40} to unlock your first reward!
                </p>
              </div>
            ) : (
              availableCoupons.map((coupon) => {
                const company = MOCK_COMPANIES.find(c => c.id === coupon.companyId);
                const isRedeeming = redeemingId === coupon.id;
                const wasRedeemed = justRedeemed === coupon.id;

                return (
                  <motion.div
                    key={coupon.id}
                    layout
                    className="card-surface p-4 relative overflow-hidden"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="w-11 h-11 rounded-[14px] flex items-center justify-center text-[22px] shrink-0"
                        style={{ backgroundColor: `${CATEGORY_COLORS[company?.category || 'food']}15` }}
                      >
                        {coupon.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-[15px] font-semibold text-[var(--ios-label)] truncate">{coupon.title}</p>
                          {wasRedeemed && <CheckCircle className="w-4 h-4 text-[#30d158] shrink-0" />}
                        </div>
                        <p className="text-[12px] text-[var(--ios-secondary-label)] mt-0.5">{company?.name}</p>
                        <p className="text-[12px] text-[var(--ios-tertiary-label)] mt-1">{coupon.description}</p>

                        {/* Coupon Code */}
                        <div className="flex items-center gap-2 mt-3">
                          <div className="flex-1 px-3 py-1.5 rounded-[8px] bg-[var(--ios-bg)] border border-dashed border-[var(--ios-separator)]">
                            <span className="text-[13px] font-mono font-bold text-[var(--ios-blue)] tracking-wide">
                              {coupon.code}
                            </span>
                          </div>
                          <button
                            onClick={() => handleCopyCode(coupon.code)}
                            className="p-2 rounded-[8px] bg-[var(--ios-bg)] ios-press"
                          >
                            {copiedCode === coupon.code
                              ? <Check className="w-4 h-4 text-[#30d158]" />
                              : <Copy className="w-4 h-4 text-[var(--ios-secondary-label)]" />}
                          </button>
                        </div>

                        {/* Redeem Button */}
                        <button
                          onClick={() => handleRedeem(coupon.id)}
                          disabled={isRedeeming || wasRedeemed}
                          className={`w-full mt-3 py-2.5 rounded-[10px] text-[14px] font-semibold transition-all ${
                            wasRedeemed
                              ? 'bg-[#30d158]/10 text-[#30d158]'
                              : 'bg-[var(--ios-blue)] text-white ios-press active:scale-[0.98]'
                          }`}
                        >
                          {isRedeeming ? 'Redeeming...' : wasRedeemed ? 'Redeemed ✓' : 'Redeem Coupon'}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </motion.div>
        )}

        {tab === 'locked' && (
          <motion.div
            key="locked"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col gap-3"
          >
            {lockedCoupons.length === 0 ? (
              <div className="card-surface p-8 text-center">
                <Award className="w-10 h-10 text-[#30d158] mx-auto mb-3" />
                <p className="text-[15px] font-medium text-[var(--ios-label)]">All rewards unlocked!</p>
                <p className="text-[13px] text-[var(--ios-secondary-label)] mt-1">You&apos;ve reached the IQ for every available coupon.</p>
              </div>
            ) : (
              lockedCoupons.map((coupon) => {
                const company = MOCK_COMPANIES.find(c => c.id === coupon.companyId);
                const progress = Math.min(100, (userIQ / coupon.minIQRequired) * 100);

                return (
                  <div key={coupon.id} className="card-surface p-4 opacity-75 relative overflow-hidden">
                    <div className="flex items-start gap-3">
                      <div className="w-11 h-11 rounded-[14px] bg-[var(--ios-separator)] flex items-center justify-center text-[22px] shrink-0 grayscale">
                        {coupon.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Lock className="w-3.5 h-3.5 text-[var(--ios-tertiary-label)] shrink-0" />
                          <p className="text-[15px] font-semibold text-[var(--ios-label)] truncate">{coupon.title}</p>
                        </div>
                        <p className="text-[12px] text-[var(--ios-secondary-label)] mt-0.5">{company?.name}</p>
                        <p className="text-[12px] text-[var(--ios-tertiary-label)] mt-1">{coupon.description}</p>

                        {/* Progress to unlock */}
                        <div className="mt-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[11px] text-[var(--ios-tertiary-label)]">
                              IQ {Math.round(userIQ)} / {coupon.minIQRequired}
                            </span>
                            <span className="text-[11px] font-medium text-[var(--ios-orange)]">
                              Need +{coupon.iqNeeded} IQ
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-[var(--ios-separator)] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[var(--ios-orange)] rounded-full transition-all"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </motion.div>
        )}

        {tab === 'companies' && (
          <motion.div
            key="companies"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col gap-3"
          >
            {MOCK_COMPANIES.map((company) => (
              <div key={company.id} className="card-surface p-4 relative overflow-hidden">
                <div className="flex items-start gap-3">
                  <div
                    className="w-12 h-12 rounded-[14px] flex items-center justify-center text-[24px] shrink-0"
                    style={{ backgroundColor: `${CATEGORY_COLORS[company.category]}15` }}
                  >
                    {company.logoPlaceholder}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-[16px] font-semibold text-[var(--ios-label)]">{company.name}</p>
                      <div
                        className="px-2 py-0.5 rounded-full text-[10px] font-medium capitalize"
                        style={{
                          backgroundColor: `${CATEGORY_COLORS[company.category]}15`,
                          color: CATEGORY_COLORS[company.category],
                        }}
                      >
                        {company.category}
                      </div>
                    </div>
                    <p className="text-[13px] text-[var(--ios-secondary-label)] mt-1">{company.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <TrendingUp className="w-3 h-3 text-[#30d158]" />
                      <span className="text-[11px] text-[#30d158] font-medium">
                        {company.sustainabilityWeight}x Impact Weight
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
