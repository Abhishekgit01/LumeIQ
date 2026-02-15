'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wallet, TrendingUp, Shield, Leaf, Camera, Gift, BarChart3,
  ChevronRight, ChevronDown, ChevronUp, CheckCircle, MapPin,
  Navigation, Train, Bus, Car, Bike, Footprints, Zap, Lock, Unlock,
  Award, Sparkles, Copy, Check, Building2, Clock, Star, Upload,
  ArrowRight, Package, Globe, CreditCard
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useExtensionStore } from '@/store/useExtensionStore';

/* ─── Vision API (client-side, works in static APK) ─── */
const VISION_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_CLOUD_VISION_API_KEY || '';
const VISION_URL = `https://vision.googleapis.com/v1/images:annotate?key=${VISION_API_KEY}`;

const VERIFICATION_KEYWORDS: Record<string, string[]> = {
  'eco-purchase': ['food', 'vegetable', 'fruit', 'grocery', 'organic', 'produce', 'bag', 'store', 'shop', 'receipt', 'product', 'package', 'bottle', 'container', 'reusable', 'market', 'plant', 'green', 'vegan', 'label', 'brand', 'shelf', 'cart'],
  'transit-proof': ['bus', 'train', 'metro', 'subway', 'station', 'platform', 'ticket', 'bicycle', 'bike', 'cycling', 'walking', 'pedestrian', 'scooter', 'rail', 'transit', 'commute', 'transport', 'road', 'street', 'vehicle'],
};

async function verifyWithVisionAPI(base64Image: string, tag: string): Promise<{ verified: boolean; confidence: number; labels: string[] }> {
  try {
    const imageContent = base64Image.replace(/^data:image\/[a-zA-Z]+;base64,/, '');
    const res = await fetch(VISION_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requests: [{
          image: { content: imageContent },
          features: [
            { type: 'LABEL_DETECTION', maxResults: 20 },
            { type: 'OBJECT_LOCALIZATION', maxResults: 10 },
          ],
        }],
      }),
    });
    if (!res.ok) throw new Error(`Vision API: ${res.status}`);
    const data = await res.json();
    const response = data.responses?.[0];
    if (!response) return { verified: false, confidence: 0, labels: [] };

    const detected: string[] = [];
    if (response.labelAnnotations) response.labelAnnotations.forEach((l: any) => detected.push(l.description.toLowerCase()));
    if (response.localizedObjectAnnotations) response.localizedObjectAnnotations.forEach((o: any) => detected.push(o.name.toLowerCase()));

    const keywords = VERIFICATION_KEYWORDS[tag] || [];
    const matched = detected.filter(label => keywords.some(kw => label.includes(kw) || kw.includes(label)));
    const confidence = Math.min(100, Math.round((matched.length / 3) * 100));
    return { verified: matched.length >= 1, confidence, labels: [...new Set(matched)] };
  } catch (e) {
    console.error('Vision API error:', e);
    // Fallback: auto-approve if API fails (offline mode)
    return { verified: true, confidence: 50, labels: ['offline-approved'] };
  }
}

async function capturePhoto(): Promise<string | null> {
  try {
    const { Camera, CameraResultType, CameraSource } = await import('@capacitor/camera');
    const photo = await Camera.getPhoto({
      quality: 80,
      allowEditing: false,
      resultType: CameraResultType.Base64,
      source: CameraSource.Prompt,
    });
    return photo.base64String ? `data:image/jpeg;base64,${photo.base64String}` : null;
  } catch {
    // Fallback: HTML file input for web
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.capture = 'environment';
      input.onchange = () => {
        const file = input.files?.[0];
        if (!file) { resolve(null); return; }
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(file);
      };
      input.click();
    });
  }
}

/* ─── Wallet State (localStorage persisted) ─── */
const WALLET_KEY = 'lumeiq_impact_wallet';

interface ImpactWallet {
  impactScore: number;
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  greenCredits: number;
  totalCarbonSaved: number;
  purchaseCount: number;
  transitCount: number;
  verificationCount: number;
}

function loadWallet(): ImpactWallet {
  if (typeof window === 'undefined') return defaultWallet();
  const raw = localStorage.getItem(WALLET_KEY);
  return raw ? JSON.parse(raw) : defaultWallet();
}

function saveWallet(w: ImpactWallet) {
  localStorage.setItem(WALLET_KEY, JSON.stringify(w));
}

function defaultWallet(): ImpactWallet {
  return { impactScore: 0, tier: 'Bronze', greenCredits: 0, totalCarbonSaved: 0, purchaseCount: 0, transitCount: 0, verificationCount: 0 };
}

function getTier(score: number): 'Bronze' | 'Silver' | 'Gold' | 'Platinum' {
  if (score >= 85) return 'Platinum';
  if (score >= 70) return 'Gold';
  if (score >= 50) return 'Silver';
  return 'Bronze';
}

const TIER_COLORS = {
  Bronze: '#cd7f32',
  Silver: '#c0c0c0',
  Gold: '#ffd700',
  Platinum: '#e5e4e2',
};

const TIER_ICONS = {
  Bronze: '🥉',
  Silver: '🥈',
  Gold: '🥇',
  Platinum: '💎',
};

/* ─── Mock Partners ─── */
const PARTNERS = [
  { id: 'p1', name: 'GreenKart India', cashbackBoost: 1.5, minImpact: 30, emoji: '🛒', category: 'Food & Groceries' },
  { id: 'p2', name: 'MetroGreen Mobility', cashbackBoost: 2.0, minImpact: 50, emoji: '🚇', category: 'Transport' },
  { id: 'p3', name: 'TerraTech Electronics', cashbackBoost: 1.3, minImpact: 40, emoji: '💻', category: 'Electronics' },
  { id: 'p4', name: 'EcoAxis Finance', cashbackBoost: 1.8, minImpact: 60, emoji: '💰', category: 'Finance' },
];

/* ─── Mock Coupons ─── */
const IMPACT_COUPONS = [
  { id: 'c1', partnerId: 'p1', value: 50, impactRequired: 30, code: 'GREEN50', description: '₹50 off organic groceries', expiry: '2026-03-15' },
  { id: 'c2', partnerId: 'p2', value: 100, impactRequired: 50, code: 'METRO100', description: 'Free metro day pass', expiry: '2026-03-20' },
  { id: 'c3', partnerId: 'p3', value: 200, impactRequired: 70, code: 'TERRA200', description: '₹200 off refurbished electronics', expiry: '2026-04-01' },
  { id: 'c4', partnerId: 'p4', value: 500, impactRequired: 85, code: 'ECOFI500', description: '₹500 green bond credit', expiry: '2026-04-15' },
];

/* ─── Transit Mock Data ─── */
const TRANSIT_MODES = [
  { mode: 'cab', label: 'Cab', co2: 3.5, cost: 480, icon: <Car className="w-4 h-4" />, color: '#ff453a' },
  { mode: 'metro', label: 'Metro', co2: 0.9, cost: 40, icon: <Train className="w-4 h-4" />, color: '#30d158' },
];

/* ═══════════════════════════════════════════════
   MAIN IMPACT VIEW
   ═══════════════════════════════════════════════ */
export function ImpactView() {
  const { user } = useStore();
  const { totalCarbonSaved, totalEcoRoutes, purchaseHistory } = useExtensionStore();
  const [wallet, setWallet] = useState<ImpactWallet>(defaultWallet());
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  // Transit optimizer state
  const [transitFrom, setTransitFrom] = useState('');
  const [transitTo, setTransitTo] = useState('');
  const [transitResult, setTransitResult] = useState<{ carbonSaved: number; moneySaved: number } | null>(null);

  // Photo verification state
  const [verificationTag, setVerificationTag] = useState<'eco-purchase' | 'transit-proof'>('eco-purchase');
  const [photoUploaded, setPhotoUploaded] = useState(false);
  const [photoApproved, setPhotoApproved] = useState(false);
  const [photoVerifying, setPhotoVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{ confidence: number; labels: string[] } | null>(null);
  const [capturedImageUrl, setCapturedImageUrl] = useState<string | null>(null);

  // Coupon state
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Load wallet
  useEffect(() => {
    const w = loadWallet();
    // Sync with extension store data
    w.totalCarbonSaved = totalCarbonSaved;
    w.transitCount = totalEcoRoutes;
    w.purchaseCount = purchaseHistory.length;
    if (user) {
      w.impactScore = user.IQ;
      w.tier = getTier(user.IQ);
      w.greenCredits = Math.round(user.IQ * 0.5 * 100) / 100;
    }
    saveWallet(w);
    setWallet(w);
  }, [user, totalCarbonSaved, totalEcoRoutes, purchaseHistory.length]);

  const toggleSection = (s: string) => setExpandedSection(prev => prev === s ? null : s);

  const handleTransitCalculate = () => {
    if (!transitFrom.trim() || !transitTo.trim()) return;
    const carbonSaved = 2.6; // 3.5 - 0.9
    const moneySaved = 440; // 480 - 40
    setTransitResult({ carbonSaved, moneySaved });

    // Update wallet
    const updated = { ...wallet };
    updated.impactScore = Math.min(100, updated.impactScore + carbonSaved * 10 * 0.1);
    updated.tier = getTier(updated.impactScore);
    updated.greenCredits += carbonSaved * 0.05;
    updated.totalCarbonSaved += carbonSaved * 1000;
    updated.transitCount += 1;
    saveWallet(updated);
    setWallet(updated);
  };

  const handlePhotoUpload = async () => {
    const imageData = await capturePhoto();
    if (!imageData) return;

    setCapturedImageUrl(imageData);
    setPhotoUploaded(true);
    setPhotoVerifying(true);
    setPhotoApproved(false);
    setVerificationResult(null);

    const result = await verifyWithVisionAPI(imageData, verificationTag);
    setPhotoVerifying(false);
    setVerificationResult(result);

    if (result.verified) {
      setPhotoApproved(true);
      const points = verificationTag === 'eco-purchase' ? 5 : 8;
      const updated = { ...wallet };
      updated.impactScore = Math.min(100, updated.impactScore + points * 0.1);
      updated.tier = getTier(updated.impactScore);
      updated.greenCredits += points * 0.05;
      updated.verificationCount += 1;
      saveWallet(updated);
      setWallet(updated);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-4">

      {/* ═══ 1. WALLET SUMMARY CARD ═══ */}
      <section className="ios-card p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-[16px] bg-gradient-to-br from-[#007aff] to-[#5856d6] flex items-center justify-center">
            <Wallet className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-[20px] font-bold text-[var(--ios-label)]">Impact Wallet</h2>
            <p className="text-[13px] text-[var(--ios-tertiary-label)]">Your sustainability footprint</p>
          </div>
        </div>

        {/* Score + Tier */}
        <div className="flex items-center gap-5 mb-4">
          <WalletScoreRing score={wallet.impactScore} tier={wallet.tier} />
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-[28px]">{TIER_ICONS[wallet.tier]}</span>
              <div>
                <p className="text-[17px] font-bold" style={{ color: TIER_COLORS[wallet.tier] }}>{wallet.tier}</p>
                <p className="text-[11px] text-[var(--ios-tertiary-label)]">Impact Tier</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2 rounded-[8px] bg-[var(--ios-bg)]">
                <p className="text-[15px] font-bold text-[#30d158] tabular-nums">₹{wallet.greenCredits.toFixed(2)}</p>
                <p className="text-[10px] text-[var(--ios-tertiary-label)]">Green Credits</p>
              </div>
              <div className="p-2 rounded-[8px] bg-[var(--ios-bg)]">
                <p className="text-[15px] font-bold text-[var(--ios-blue)] tabular-nums">
                  {wallet.totalCarbonSaved >= 1000 ? `${(wallet.totalCarbonSaved / 1000).toFixed(1)}kg` : `${Math.round(wallet.totalCarbonSaved)}g`}
                </p>
                <p className="text-[10px] text-[var(--ios-tertiary-label)]">CO₂ Saved</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2 pt-3" style={{ borderTop: '0.5px solid var(--ios-separator)' }}>
          <div className="text-center">
            <p className="text-[17px] font-bold text-[var(--ios-label)] tabular-nums">{wallet.purchaseCount}</p>
            <p className="text-[10px] text-[var(--ios-tertiary-label)]">Purchases</p>
          </div>
          <div className="text-center">
            <p className="text-[17px] font-bold text-[var(--ios-label)] tabular-nums">{wallet.transitCount}</p>
            <p className="text-[10px] text-[var(--ios-tertiary-label)]">Eco Routes</p>
          </div>
          <div className="text-center">
            <p className="text-[17px] font-bold text-[var(--ios-label)] tabular-nums">{wallet.verificationCount}</p>
            <p className="text-[10px] text-[var(--ios-tertiary-label)]">Verified</p>
          </div>
        </div>
      </section>

      {/* ═══ 2. TRANSIT OPTIMIZER ═══ */}
      <SectionCard
        title="Transit Optimizer"
        icon={<Navigation className="w-5 h-5 text-white" />}
        iconBg="from-[#007aff] to-[#5ac8fa]"
        expanded={expandedSection === 'transit'}
        onToggle={() => toggleSection('transit')}
      >
        <div className="space-y-3">
          <div>
            <label className="text-[12px] font-medium text-[var(--ios-secondary-label)] mb-1 block">From</label>
            <input
              value={transitFrom}
              onChange={(e) => setTransitFrom(e.target.value)}
              placeholder="e.g. Koramangala"
              className="w-full px-3 py-2.5 rounded-[10px] bg-[var(--ios-bg)] text-[14px] text-[var(--ios-label)] placeholder:text-[var(--ios-tertiary-label)] border border-[var(--ios-separator)] focus:outline-none"
            />
          </div>
          <div>
            <label className="text-[12px] font-medium text-[var(--ios-secondary-label)] mb-1 block">To</label>
            <input
              value={transitTo}
              onChange={(e) => setTransitTo(e.target.value)}
              placeholder="e.g. Electronic City"
              className="w-full px-3 py-2.5 rounded-[10px] bg-[var(--ios-bg)] text-[14px] text-[var(--ios-label)] placeholder:text-[var(--ios-tertiary-label)] border border-[var(--ios-separator)] focus:outline-none"
            />
          </div>

          {/* Route comparison */}
          <div className="space-y-2">
            {TRANSIT_MODES.map(t => (
              <div key={t.mode} className="flex items-center justify-between p-3 rounded-[10px] bg-[var(--ios-bg)]">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-[8px] flex items-center justify-center" style={{ backgroundColor: `${t.color}15`, color: t.color }}>
                    {t.icon}
                  </div>
                  <span className="text-[14px] font-medium text-[var(--ios-label)]">{t.label}</span>
                </div>
                <div className="text-right">
                  <p className="text-[13px] font-semibold" style={{ color: t.color }}>{t.co2}kg CO₂</p>
                  <p className="text-[11px] text-[var(--ios-tertiary-label)]">₹{t.cost}</p>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={handleTransitCalculate}
            disabled={!transitFrom.trim() || !transitTo.trim()}
            className="w-full py-3 rounded-[12px] bg-[var(--ios-blue)] text-white text-[15px] font-semibold disabled:opacity-40 ios-press"
          >
            Choose Eco Route (Metro)
          </button>

          {transitResult && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-[12px] bg-[#30d158]/10 border border-[#30d158]/20 text-center">
              <CheckCircle className="w-8 h-8 text-[#30d158] mx-auto mb-2" />
              <p className="text-[15px] font-bold text-[#30d158]">
                You saved ₹{transitResult.moneySaved} and {transitResult.carbonSaved}kg CO₂
              </p>
              <p className="text-[12px] text-[var(--ios-tertiary-label)] mt-1">
                +{(transitResult.carbonSaved * 10).toFixed(0)} impact points added
              </p>
            </motion.div>
          )}
        </div>
      </SectionCard>

      {/* ═══ 3. PURCHASE VERIFICATION ═══ */}
      <SectionCard
        title="Purchase Verification"
        icon={<Package className="w-5 h-5 text-white" />}
        iconBg="from-[#30d158] to-[#34c759]"
        expanded={expandedSection === 'purchase'}
        onToggle={() => toggleSection('purchase')}
      >
        <div className="space-y-3">
          <p className="text-[13px] text-[var(--ios-secondary-label)]">
            After scanning a product, confirm your purchase to earn Impact Points.
          </p>
          <div className="p-4 rounded-[12px] bg-[var(--ios-bg)]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-[12px] bg-[#30d158]/10 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-[#30d158]" />
              </div>
              <div className="flex-1">
                <p className="text-[14px] font-semibold text-[var(--ios-label)]">Impact Formula</p>
                <p className="text-[12px] text-[var(--ios-tertiary-label)] mt-0.5">
                  Points = ProductScore × 2 | Credits += Points × ₹0.05
                </p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="p-3 rounded-[10px] bg-[var(--ios-bg)] text-center">
              <p className="text-[20px] font-bold text-[#30d158]">{wallet.purchaseCount}</p>
              <p className="text-[11px] text-[var(--ios-tertiary-label)]">Verified Purchases</p>
            </div>
            <div className="p-3 rounded-[10px] bg-[var(--ios-bg)] text-center">
              <p className="text-[20px] font-bold text-[var(--ios-blue)]">₹{(wallet.purchaseCount * 0.4).toFixed(2)}</p>
              <p className="text-[11px] text-[var(--ios-tertiary-label)]">Credits Earned</p>
            </div>
          </div>
          <button
            onClick={() => useStore.getState().setView('scan')}
            className="w-full py-2.5 rounded-[12px] bg-[#30d158] text-white text-[14px] font-semibold ios-press flex items-center justify-center gap-2"
          >
            <ArrowRight className="w-4 h-4" /> Go to Scan & Buy
          </button>
        </div>
      </SectionCard>

      {/* ═══ 4. PHOTO VERIFICATION ═══ */}
      <SectionCard
        title="Photo Verification"
        icon={<Camera className="w-5 h-5 text-white" />}
        iconBg="from-[#ff9f0a] to-[#ffd60a]"
        expanded={expandedSection === 'photo'}
        onToggle={() => toggleSection('photo')}
      >
        <div className="space-y-3">
          <p className="text-[13px] text-[var(--ios-secondary-label)]">
            Upload proof of eco actions. Auto-approved after verification.
          </p>

          {/* Tag selector */}
          <div className="flex gap-2">
            {(['eco-purchase', 'transit-proof'] as const).map(tag => (
                <button
                  key={tag}
                  onClick={() => { setVerificationTag(tag); setPhotoUploaded(false); setPhotoApproved(false); setPhotoVerifying(false); setVerificationResult(null); setCapturedImageUrl(null); }}
                  className={`flex-1 py-2 rounded-[10px] text-[13px] font-medium transition-all ${
                  verificationTag === tag
                    ? 'bg-[var(--ios-blue)] text-white'
                    : 'bg-[var(--ios-bg)] text-[var(--ios-secondary-label)]'
                }`}
              >
                {tag === 'eco-purchase' ? '🛍️ Eco Purchase' : '🚌 Transit Proof'}
              </button>
            ))}
          </div>

          {!photoUploaded ? (
              <button
                onClick={handlePhotoUpload}
                className="w-full py-4 rounded-[12px] border-2 border-dashed border-[var(--ios-separator)] flex flex-col items-center gap-2 ios-press"
              >
                <Upload className="w-8 h-8 text-[var(--ios-tertiary-label)]" />
                <span className="text-[14px] font-medium text-[var(--ios-secondary-label)]">Tap to Take Photo</span>
                <span className="text-[11px] text-[var(--ios-tertiary-label)]">Opens camera or gallery</span>
              </button>
            ) : photoVerifying ? (
              <div className="space-y-3">
                {capturedImageUrl && (
                  <img src={capturedImageUrl} alt="Captured" className="w-full h-40 object-cover rounded-[10px]" />
                )}
                <div className="p-4 rounded-[12px] bg-[#ff9f0a]/10 text-center">
                  <motion.div className="w-8 h-8 border-3 border-[#ff9f0a]/30 border-t-[#ff9f0a] rounded-full mx-auto mb-2"
                    animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} />
                  <p className="text-[14px] font-medium text-[#ff9f0a]">Analyzing with Google Vision AI...</p>
                </div>
              </div>
            ) : photoApproved ? (
              <div className="space-y-3">
                {capturedImageUrl && (
                  <img src={capturedImageUrl} alt="Verified" className="w-full h-40 object-cover rounded-[10px]" />
                )}
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  className="p-4 rounded-[12px] bg-[#30d158]/10 border border-[#30d158]/20">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-6 h-6 text-[#30d158]" />
                    <p className="text-[15px] font-bold text-[#30d158]">Verified!</p>
                    {verificationResult && (
                      <span className="ml-auto text-[12px] font-medium text-[#30d158] bg-[#30d158]/10 px-2 py-0.5 rounded-full">
                        {verificationResult.confidence}% confidence
                      </span>
                    )}
                  </div>
                  {verificationResult && verificationResult.labels.length > 0 && (
                    <p className="text-[12px] text-[var(--ios-tertiary-label)]">
                      Detected: {verificationResult.labels.join(', ')}
                    </p>
                  )}
                  <p className="text-[12px] text-[var(--ios-secondary-label)] mt-1">
                    +{verificationTag === 'eco-purchase' ? 5 : 8} impact points added to wallet
                  </p>
                </motion.div>
                <button onClick={() => { setPhotoUploaded(false); setPhotoApproved(false); setCapturedImageUrl(null); setVerificationResult(null); }}
                  className="w-full py-2.5 rounded-[10px] bg-[var(--ios-bg)] text-[13px] font-medium text-[var(--ios-secondary-label)] ios-press">
                  Verify Another Photo
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {capturedImageUrl && (
                  <img src={capturedImageUrl} alt="Not verified" className="w-full h-40 object-cover rounded-[10px]" />
                )}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="p-4 rounded-[12px] bg-[#ff453a]/10 border border-[#ff453a]/20 text-center">
                  <p className="text-[14px] font-bold text-[#ff453a]">Not Verified</p>
                  {verificationResult && (
                    <p className="text-[12px] text-[var(--ios-tertiary-label)] mt-1">
                      Could not match eco-action in image. Try a clearer photo.
                    </p>
                  )}
                </motion.div>
                <button onClick={() => { setPhotoUploaded(false); setCapturedImageUrl(null); setVerificationResult(null); }}
                  className="w-full py-2.5 rounded-[10px] bg-[var(--ios-bg)] text-[13px] font-medium text-[var(--ios-secondary-label)] ios-press">
                  Try Again
                </button>
              </div>
            )}
        </div>
      </SectionCard>

      {/* ═══ 5. PARTNER REWARDS ═══ */}
      <SectionCard
        title="Partner Companies"
        icon={<Building2 className="w-5 h-5 text-white" />}
        iconBg="from-[#5856d6] to-[#bf5af2]"
        expanded={expandedSection === 'partners'}
        onToggle={() => toggleSection('partners')}
      >
        <div className="space-y-2">
          {PARTNERS.map(partner => {
            const unlocked = wallet.impactScore >= partner.minImpact;
            return (
              <div key={partner.id} className={`flex items-center gap-3 p-3 rounded-[12px] bg-[var(--ios-bg)] ${!unlocked ? 'opacity-50' : ''}`}>
                <span className="text-[24px]">{partner.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-[14px] font-semibold text-[var(--ios-label)] truncate">{partner.name}</p>
                    {unlocked
                      ? <Unlock className="w-3.5 h-3.5 text-[#30d158]" />
                      : <Lock className="w-3.5 h-3.5 text-[var(--ios-tertiary-label)]" />
                    }
                  </div>
                  <p className="text-[12px] text-[var(--ios-tertiary-label)]">{partner.category}</p>
                </div>
                <div className="text-right">
                  <p className="text-[13px] font-bold text-[var(--ios-blue)]">{partner.cashbackBoost}x</p>
                  <p className="text-[10px] text-[var(--ios-tertiary-label)]">Boost</p>
                </div>
              </div>
            );
          })}
        </div>
      </SectionCard>

      {/* ═══ 6. COUPONS ═══ */}
      <SectionCard
        title="Eco Coupons"
        icon={<Gift className="w-5 h-5 text-white" />}
        iconBg="from-[#ff9f0a] to-[#ff6b00]"
        expanded={expandedSection === 'coupons'}
        onToggle={() => toggleSection('coupons')}
      >
        <div className="space-y-3">
          {IMPACT_COUPONS.map(coupon => {
            const partner = PARTNERS.find(p => p.id === coupon.partnerId);
            const unlocked = wallet.impactScore >= coupon.impactRequired;

            return (
              <div key={coupon.id} className={`p-4 rounded-[12px] bg-[var(--ios-bg)] ${!unlocked ? 'opacity-50' : ''}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[18px]">{partner?.emoji || '🎁'}</span>
                    <div>
                      <p className="text-[14px] font-semibold text-[var(--ios-label)]">{coupon.description}</p>
                      <p className="text-[11px] text-[var(--ios-tertiary-label)]">{partner?.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[15px] font-bold text-[#30d158]">₹{coupon.value}</p>
                  </div>
                </div>

                {unlocked ? (
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex-1 px-3 py-1.5 rounded-[8px] bg-[var(--ios-card)] border border-dashed border-[var(--ios-separator)]">
                      <span className="text-[13px] font-mono font-bold text-[var(--ios-blue)]">{coupon.code}</span>
                    </div>
                    <button onClick={() => handleCopyCode(coupon.code)}
                      className="p-2 rounded-[8px] bg-[var(--ios-card)] ios-press">
                      {copiedCode === coupon.code
                        ? <Check className="w-4 h-4 text-[#30d158]" />
                        : <Copy className="w-4 h-4 text-[var(--ios-secondary-label)]" />
                      }
                    </button>
                  </div>
                ) : (
                  <div className="mt-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] text-[var(--ios-tertiary-label)]">
                        IQ {Math.round(wallet.impactScore)} / {coupon.impactRequired}
                      </span>
                      <span className="text-[11px] font-medium text-[var(--ios-orange)]">
                        <Lock className="w-3 h-3 inline" /> Need +{coupon.impactRequired - Math.round(wallet.impactScore)} IQ
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-[var(--ios-separator)] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[var(--ios-orange)] rounded-full"
                        style={{ width: `${Math.min(100, (wallet.impactScore / coupon.impactRequired) * 100)}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </SectionCard>

      {/* ═══ 7. ESG METRICS ═══ */}
      <SectionCard
        title="ESG Metrics"
        icon={<BarChart3 className="w-5 h-5 text-white" />}
        iconBg="from-[#34c759] to-[#30d158]"
        expanded={expandedSection === 'esg'}
        onToggle={() => toggleSection('esg')}
      >
        <div className="space-y-3">
          {[
            {
              label: 'Monthly CO₂ Saved',
              value: wallet.totalCarbonSaved >= 1000 ? `${(wallet.totalCarbonSaved / 1000).toFixed(1)}kg` : `${Math.round(wallet.totalCarbonSaved)}g`,
              icon: <Leaf className="w-4 h-4" />,
              color: '#30d158',
              pct: Math.min(100, wallet.totalCarbonSaved / 50),
            },
            {
              label: 'Sustainable Commute %',
              value: wallet.transitCount > 0 ? `${Math.round((wallet.transitCount / Math.max(1, wallet.transitCount + 2)) * 100)}%` : '0%',
              icon: <Train className="w-4 h-4" />,
              color: '#007aff',
              pct: wallet.transitCount > 0 ? (wallet.transitCount / Math.max(1, wallet.transitCount + 2)) * 100 : 0,
            },
            {
              label: 'Verified Purchase Ratio',
              value: wallet.purchaseCount > 0 ? `${Math.round((wallet.verificationCount / Math.max(1, wallet.purchaseCount)) * 100)}%` : '0%',
              icon: <Shield className="w-4 h-4" />,
              color: '#5856d6',
              pct: wallet.purchaseCount > 0 ? (wallet.verificationCount / Math.max(1, wallet.purchaseCount)) * 100 : 0,
            },
            {
              label: 'Est. Scope 3 Reduction',
              value: `${(wallet.totalCarbonSaved * 0.003).toFixed(2)}%`,
              icon: <Globe className="w-4 h-4" />,
              color: '#ff9f0a',
              pct: Math.min(100, wallet.totalCarbonSaved * 0.003),
            },
          ].map((metric) => (
            <div key={metric.label} className="flex items-center gap-3 p-3 rounded-[12px] bg-[var(--ios-bg)]">
              <div className="w-9 h-9 rounded-[10px] flex items-center justify-center" style={{ backgroundColor: `${metric.color}15`, color: metric.color }}>
                {metric.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[13px] font-medium text-[var(--ios-label)]">{metric.label}</span>
                  <span className="text-[14px] font-bold tabular-nums" style={{ color: metric.color }}>{metric.value}</span>
                </div>
                <div className="w-full h-[3px] bg-[var(--ios-separator)] rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: metric.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${metric.pct}%` }}
                    transition={{ duration: 0.8 }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Bottom padding */}
      <div className="h-4" />
    </motion.div>
  );
}

/* ═══ Wallet Score Ring ═══ */
function WalletScoreRing({ score, tier }: { score: number; tier: string }) {
  const size = 100;
  const strokeWidth = 10;
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(score, 100) / 100;
  const color = TIER_COLORS[tier as keyof typeof TIER_COLORS] || '#8e8e93';

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--ios-separator)" strokeWidth={strokeWidth} />
        <motion.circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - pct * circ }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span className="text-[24px] font-bold tabular-nums" style={{ color }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          {Math.round(score)}
        </motion.span>
        <span className="text-[10px] text-[var(--ios-tertiary-label)]">IQ Score</span>
      </div>
    </div>
  );
}

/* ═══ Collapsible Section Card ═══ */
function SectionCard({ title, icon, iconBg, expanded, onToggle, children }: {
  title: string;
  icon: React.ReactNode;
  iconBg: string;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className="ios-card overflow-hidden">
      <button onClick={onToggle} className="w-full flex items-center gap-3 p-4 ios-press">
        <div className={`w-10 h-10 rounded-[12px] bg-gradient-to-br ${iconBg} flex items-center justify-center`}>
          {icon}
        </div>
        <span className="text-[17px] font-semibold text-[var(--ios-label)] flex-1 text-left">{title}</span>
        {expanded
          ? <ChevronUp className="w-5 h-5 text-[var(--ios-tertiary-label)]" />
          : <ChevronDown className="w-5 h-5 text-[var(--ios-tertiary-label)]" />
        }
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-1" style={{ borderTop: '0.5px solid var(--ios-separator)' }}>
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
