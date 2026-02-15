'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag, Search, Star, Heart, ChevronRight, Tag, Leaf, Zap,
  TrendingUp, ArrowDownLeft, PiggyBank, Gift, ChevronLeft, Copy, Lock,
  QrCode, Check, Wallet, Receipt, BadgePercent, Building2,
  Sparkles, ShieldCheck, CreditCard, Filter, SlidersHorizontal, Bike,
  Droplets, Recycle, Sun, TreePine, ShoppingCart, Award, Flame, Eye,
    Camera, Upload, ScanLine, CheckCircle2, XCircle, Loader2, X, Minus, Plus,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { CameraCapture } from '@/components/ui/CameraCapture';

/* ═══════════════════════════════════════════════════════
   MARKETPLACE TAB TYPE
   ═══════════════════════════════════════════════════════ */
type MarketTab = 'shop' | 'finance';

/* ═══════════════════════════════════════════════════════
   ECO PRODUCT CATEGORIES
   ═══════════════════════════════════════════════════════ */
const CATEGORIES = [
  { id: 'all', label: 'All', emoji: '🌍', color: '#34c759' },
  { id: 'food', label: 'Food', emoji: '🥗', color: '#4cd964' },
  { id: 'fashion', label: 'Fashion', emoji: '👕', color: '#5856d6' },
  { id: 'home', label: 'Home', emoji: '🏠', color: '#ff9f0a' },
  { id: 'transport', label: 'Transport', emoji: '🚲', color: '#007aff' },
  { id: 'energy', label: 'Energy', emoji: '☀️', color: '#ffcc00' },
  { id: 'beauty', label: 'Beauty', emoji: '🌿', color: '#af52de' },
];

/* ═══════════════════════════════════════════════════════
   ECO PRODUCTS
   ═══════════════════════════════════════════════════════ */
const ECO_PRODUCTS = [
  // Food
  { id: 'p1', name: 'Organic Meal Kit', brand: 'GreenChef', price: 499, mrp: 699, category: 'food', rating: 4.6, reviews: 342, co2Saved: '1.2kg', ecoPoints: 15, emoji: '🥗', badge: 'BESTSELLER', badgeColor: '#ff453a', gradient: 'linear-gradient(135deg, #0d9f4f 0%, #0a7a3b 100%)' },
  { id: 'p2', name: 'Plant-Based Protein', brand: 'EcoNutrition', price: 899, mrp: 1199, category: 'food', rating: 4.8, reviews: 128, co2Saved: '3.5kg', ecoPoints: 25, emoji: '💪', badge: 'ECO PICK', badgeColor: '#34c759', gradient: 'linear-gradient(135deg, #2d8f4e 0%, #1a6b35 100%)' },
  { id: 'p3', name: 'Zero-Waste Snack Box', brand: 'NakedSnacks', price: 349, mrp: 449, category: 'food', rating: 4.4, reviews: 87, co2Saved: '0.8kg', ecoPoints: 10, emoji: '🍿', badge: null, badgeColor: '', gradient: 'linear-gradient(135deg, #3d7a2e 0%, #2a5a1f 100%)' },

  // Fashion
  { id: 'p4', name: 'Recycled Denim Jacket', brand: 'ReThread', price: 1899, mrp: 2999, category: 'fashion', rating: 4.7, reviews: 215, co2Saved: '5.2kg', ecoPoints: 35, emoji: '🧥', badge: 'TRENDING', badgeColor: '#007aff', gradient: 'linear-gradient(135deg, #4a3a8a 0%, #322870 100%)' },
  { id: 'p5', name: 'Bamboo Fiber Tee', brand: 'EcoWear', price: 599, mrp: 899, category: 'fashion', rating: 4.5, reviews: 456, co2Saved: '2.1kg', ecoPoints: 18, emoji: '👕', badge: 'POPULAR', badgeColor: '#ff9f0a', gradient: 'linear-gradient(135deg, #5856d6 0%, #3634a3 100%)' },
  { id: 'p6', name: 'Upcycled Sneakers', brand: 'GreenStep', price: 2499, mrp: 3499, category: 'fashion', rating: 4.9, reviews: 89, co2Saved: '4.8kg', ecoPoints: 30, emoji: '👟', badge: 'NEW', badgeColor: '#007aff', gradient: 'linear-gradient(135deg, #6b4fa0 0%, #4a3680 100%)' },

  // Home
  { id: 'p7', name: 'Beeswax Wrap Set', brand: 'WrapGreen', price: 299, mrp: 449, category: 'home', rating: 4.3, reviews: 678, co2Saved: '1.5kg', ecoPoints: 12, emoji: '🐝', badge: 'BESTSELLER', badgeColor: '#ff453a', gradient: 'linear-gradient(135deg, #c77d0a 0%, #9a6108 100%)' },
  { id: 'p8', name: 'Compost Bin Kit', brand: 'EarthCycle', price: 1299, mrp: 1799, category: 'home', rating: 4.6, reviews: 234, co2Saved: '8.0kg', ecoPoints: 40, emoji: '♻️', badge: 'HIGH IMPACT', badgeColor: '#34c759', gradient: 'linear-gradient(135deg, #8a6a1a 0%, #6b520f 100%)' },
  { id: 'p9', name: 'Solar Lantern', brand: 'SunPower', price: 799, mrp: 1099, category: 'home', rating: 4.7, reviews: 156, co2Saved: '6.0kg', ecoPoints: 28, emoji: '🔆', badge: null, badgeColor: '', gradient: 'linear-gradient(135deg, #d4a017 0%, #b8860b 100%)' },

  // Transport
  { id: 'p10', name: 'Bamboo Bike Basket', brand: 'CycleGreen', price: 699, mrp: 999, category: 'transport', rating: 4.4, reviews: 98, co2Saved: '0.5kg', ecoPoints: 8, emoji: '🧺', badge: null, badgeColor: '', gradient: 'linear-gradient(135deg, #007aff 0%, #0055d4 100%)' },
  { id: 'p11', name: 'E-Scooter Rental Pass', brand: 'GreenRide', price: 999, mrp: 1499, category: 'transport', rating: 4.8, reviews: 567, co2Saved: '12.0kg', ecoPoints: 50, emoji: '🛴', badge: 'TOP RATED', badgeColor: '#ff453a', gradient: 'linear-gradient(135deg, #0066cc 0%, #004499 100%)' },

  // Energy
  { id: 'p12', name: 'Portable Solar Charger', brand: 'SunJuice', price: 1499, mrp: 2199, category: 'energy', rating: 4.6, reviews: 312, co2Saved: '15.0kg', ecoPoints: 45, emoji: '🔋', badge: 'ECO PICK', badgeColor: '#34c759', gradient: 'linear-gradient(135deg, #e6a817 0%, #c99212 100%)' },
  { id: 'p13', name: 'LED Smart Bulb Set', brand: 'BrightEco', price: 599, mrp: 899, category: 'energy', rating: 4.5, reviews: 890, co2Saved: '20.0kg', ecoPoints: 35, emoji: '💡', badge: 'BESTSELLER', badgeColor: '#ff453a', gradient: 'linear-gradient(135deg, #d4a017 0%, #b08a10 100%)' },

  // Beauty
  { id: 'p14', name: 'Shampoo Bar Bundle', brand: 'BarNone', price: 399, mrp: 599, category: 'beauty', rating: 4.7, reviews: 445, co2Saved: '2.0kg', ecoPoints: 14, emoji: '🧴', badge: 'POPULAR', badgeColor: '#ff9f0a', gradient: 'linear-gradient(135deg, #af52de 0%, #8e44ad 100%)' },
  { id: 'p15', name: 'Organic Skincare Set', brand: 'PureEarth', price: 1299, mrp: 1899, category: 'beauty', rating: 4.8, reviews: 267, co2Saved: '3.0kg', ecoPoints: 22, emoji: '🌸', badge: 'NEW', badgeColor: '#007aff', gradient: 'linear-gradient(135deg, #c062e6 0%, #9b4cc0 100%)' },
];

/* ═══════════════════════════════════════════════════════
   FEATURED COLLECTIONS
   ═══════════════════════════════════════════════════════ */
const FEATURED_COLLECTIONS = [
  { id: 'c1', title: 'Zero Waste\nStarter Kit', subtitle: 'Save 4.5kg CO\u2082', emoji: '♻️', gradient: 'linear-gradient(135deg, #0d9f4f 0%, #067a35 100%)', badge: 'LUMEIQ', products: 4, points: 45 },
  { id: 'c2', title: 'Sustainable\nFashion Edit', subtitle: '5 days eco-fashion', emoji: '👗', gradient: 'linear-gradient(135deg, #5856d6 0%, #3634a3 100%)', badge: 'LUMEIQ', products: 6, points: 60 },
  { id: 'c3', title: 'Green Home\nEssentials', subtitle: 'Transform your space', emoji: '🏡', gradient: 'linear-gradient(135deg, #ff9f0a 0%, #e68600 100%)', badge: 'LUMEIQ', products: 8, points: 55 },
  { id: 'c4', title: 'Plant-Based\nMeal Prep', subtitle: 'Weekly meal kit', emoji: '🥬', gradient: 'linear-gradient(135deg, #34c759 0%, #248a3d 100%)', badge: 'LUMEIQ', products: 3, points: 30 },
];

/* ═══════════════════════════════════════════════════════
   REWARD COUPONS (from Finance)
   ═══════════════════════════════════════════════════════ */
const COUPONS = [
  { id: 'eco10', title: '10% off eco products', partner: 'GreenMart', emoji: '🛒', code: 'ECO10', expires: '1 Apr 2026', iqRequired: 0, gradient: 'linear-gradient(135deg, #1b6b3a 0%, #0d4a25 100%)' },
  { id: 'metro5', title: '5% cashback on transport', partner: 'MetroPass', emoji: '🚇', code: 'METRO5', expires: '15 Apr 2026', iqRequired: 0, gradient: 'linear-gradient(135deg, #1a4a7a 0%, #0d2e52 100%)' },
  { id: 'tree', title: 'Tree planting voucher', partner: 'GreenEarth', emoji: '🌳', code: 'TREE2026', expires: '1 May 2026', iqRequired: 60, gradient: 'linear-gradient(135deg, #4a3a1a 0%, #2e250d 100%)' },
  { id: 'solar', title: '15% off solar accessories', partner: 'SunPower', emoji: '\u2600\uFE0F', code: 'SOLAR15', expires: '30 Jun 2026', iqRequired: 75, gradient: 'linear-gradient(135deg, #7a4a1a 0%, #523210 100%)' },
];

const TRANSACTIONS = [
  { id: 1, title: 'Eco Meal Kit Purchase', amount: -499, type: 'debit' as const, date: '15 Feb', icon: '🥗', category: 'Marketplace', points: 15 },
  { id: 2, title: 'Marketplace Cashback', amount: 50, type: 'credit' as const, date: '14 Feb', icon: '💰', category: 'Rewards', points: 0 },
  { id: 3, title: 'Bamboo Tee Purchase', amount: -599, type: 'debit' as const, date: '13 Feb', icon: '👕', category: 'Marketplace', points: 18 },
  { id: 4, title: 'Eco Points Bonus', amount: 100, type: 'credit' as const, date: '12 Feb', icon: '🏆', category: 'Rewards', points: 0 },
  { id: 5, title: 'Solar Charger Purchase', amount: -1499, type: 'debit' as const, date: '11 Feb', icon: '🔋', category: 'Marketplace', points: 45 },
  { id: 6, title: 'Referral Reward', amount: 200, type: 'credit' as const, date: '10 Feb', icon: '🎁', category: 'Rewards', points: 0 },
  { id: 7, title: 'Recycling Verified', amount: 75, type: 'credit' as const, date: '9 Feb', icon: '♻️', category: 'Verified', points: 10 },
];

const SAVINGS_GOALS = [
  { id: 'solar', name: 'Solar Panel Fund', target: 50000, current: 12500, icon: '\u2600\uFE0F', color: '#ff9f0a' },
  { id: 'ev', name: 'EV Down Payment', target: 200000, current: 45000, icon: '\u26A1', color: '#5856d6' },
  { id: 'garden', name: 'Rooftop Garden', target: 15000, current: 9800, icon: '🌱', color: '#34c759' },
];

/* ═══════════════════════════════════════════════════════
   VISION API VERIFICATION
   ═══════════════════════════════════════════════════════ */
interface VerifyResult {
  verified: boolean;
  label: string;
  confidence: number;
  pointsEarned: number;
}

async function verifyEcoPurchase(imageBase64: string): Promise<VerifyResult> {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_CLOUD_VISION_API_KEY;
  if (!apiKey) return { verified: false, label: 'API key missing. Set NEXT_PUBLIC_GOOGLE_CLOUD_VISION_API_KEY in .env', confidence: 0, pointsEarned: 0 };

  try {
    const res = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requests: [{
          image: { content: imageBase64 },
          features: [
            { type: 'LABEL_DETECTION', maxResults: 15 },
            { type: 'OBJECT_LOCALIZATION', maxResults: 10 },
            { type: 'TEXT_DETECTION', maxResults: 5 },
          ],
        }],
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('Vision API error:', res.status, errText);
      if (res.status === 403) {
        return { verified: false, label: 'Cloud Vision API not enabled. Enable it at console.cloud.google.com > APIs & Services > Enable Cloud Vision API', confidence: 0, pointsEarned: 0 };
      }
      if (res.status === 401) {
        return { verified: false, label: 'Invalid API key. Check NEXT_PUBLIC_GOOGLE_CLOUD_VISION_API_KEY', confidence: 0, pointsEarned: 0 };
      }
      return { verified: false, label: `API error (${res.status})`, confidence: 0, pointsEarned: 0 };
    }

    const data = await res.json();
    const resp = data.responses?.[0];

    if (resp?.error) {
      return { verified: false, label: resp.error.message || 'Vision API returned an error', confidence: 0, pointsEarned: 0 };
    }

    const labels = (resp?.labelAnnotations || []).map((l: { description: string; score: number }) => ({
      name: l.description.toLowerCase(),
      score: l.score,
    }));
    const objects = (resp?.localizedObjectAnnotations || []).map((o: { name: string; score: number }) => ({
      name: o.name.toLowerCase(),
      score: o.score,
    }));
    const textContent = (resp?.textAnnotations?.[0]?.description || '').toLowerCase();

    const allItems = [...labels, ...objects];

    // Eco keywords
    const ecoKeywords = [
      'organic', 'eco', 'sustainable', 'recycled', 'plant', 'green', 'natural',
      'bamboo', 'compost', 'solar', 'reusable', 'biodegradable', 'vegan',
      'fair trade', 'upcycled', 'zero waste', 'renewable', 'bicycle', 'electric',
      'produce', 'vegetable', 'fruit', 'salad', 'herb', 'grocery', 'food',
      'clothing', 'textile', 'bottle', 'bag', 'container', 'packaging',
    ];

    const matched = allItems.filter(i => ecoKeywords.some(k => i.name.includes(k)));
    const textMatched = ecoKeywords.some(k => textContent.includes(k));

    if (matched.length > 0 || textMatched) {
      const topMatch = matched.length > 0 ? matched[0] : { name: 'eco-product', score: 0.7 };
      const points = Math.round(10 + topMatch.score * 25);
      return { verified: true, label: topMatch.name, confidence: topMatch.score, pointsEarned: points };
    }

    return { verified: false, label: allItems[0]?.name || 'unknown', confidence: allItems[0]?.score || 0, pointsEarned: 0 };
  } catch (err: any) {
    console.error('Vision API call failed:', err);
    return { verified: false, label: `Network error: ${err.message || 'Check internet connection'}`, confidence: 0, pointsEarned: 0 };
  }
}

/* ═══════════════════════════════════════════════════════
   MARKETPLACE VIEW COMPONENT
   ═══════════════════════════════════════════════════════ */
export function MarketplaceView() {
  const { user } = useStore();
  const [activeTab, setActiveTab] = useState<MarketTab>('shop');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [cart, setCart] = useState<Map<string, number>>(new Map());

  // Finance sub-tab state
  const [couponIdx, setCouponIdx] = useState(0);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [txFilter, setTxFilter] = useState<'all' | 'credit' | 'debit'>('all');

  // Quick action modals
  const [showPayModal, setShowPayModal] = useState(false);
  const [showBillsModal, setShowBillsModal] = useState(false);
  const [showBankConnect, setShowBankConnect] = useState(false);
  const [bankConnected, setBankConnected] = useState(false);
  const [bankName, setBankName] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [bankIfsc, setBankIfsc] = useState('');
  const [bankConnecting, setBankConnecting] = useState(false);
  const rewardsRef = useRef<HTMLElement>(null);

  // Verification state
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<VerifyResult | null>(null);
  const [showVerify, setShowVerify] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!user) return null;

  const iq = user.IQ;
  const ecoBalance = 1247;
  const monthlyEarned = 342;
  const totalEcoPoints = 185;

  const filteredProducts = ECO_PRODUCTS.filter(p => {
    const matchCat = selectedCategory === 'all' || p.category === selectedCategory;
    const matchSearch = !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.brand.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const toggleFavorite = (id: string) => {
    setFavorites(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const addToCart = (id: string) => {
    setCart(prev => {
      const next = new Map(prev);
      next.set(id, (next.get(id) || 0) + 1);
      return next;
    });
  };

  const cartCount = Array.from(cart.values()).reduce((a, b) => a + b, 0);
  const cartTotal = Array.from(cart.entries()).reduce((sum, [id, qty]) => {
    const p = ECO_PRODUCTS.find(x => x.id === id);
    return sum + (p ? p.price * qty : 0);
  }, 0);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code).catch(() => {});
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleVerifyPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setVerifying(true);
    setShowVerify(true);
    setVerifyResult(null);

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = (reader.result as string).split(',')[1];
      const result = await verifyEcoPurchase(base64);
      setVerifyResult(result);
      setVerifying(false);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleCameraCapture = async (base64: string) => {
    setVerifying(true);
    setShowVerify(true);
    setVerifyResult(null);
    const result = await verifyEcoPurchase(base64);
    setVerifyResult(result);
    setVerifying(false);
  };

  const filteredTx = TRANSACTIONS.filter(tx => txFilter === 'all' || tx.type === txFilter);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="flex flex-col gap-4 pb-6"
    >
      {/* ═══ TOP TABS: Shop / Finance ═══ */}
      <div className="flex gap-1 p-1 bg-[var(--ios-card)] rounded-[14px]" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        {([
          { key: 'shop' as MarketTab, label: 'Eco Shop', icon: ShoppingBag },
          { key: 'finance' as MarketTab, label: 'Eco Finance', icon: Wallet },
        ]).map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-[11px] text-[13px] font-semibold transition-all ${
              activeTab === key
                ? 'bg-gradient-to-r from-[#34c759] to-[#30d158] text-white shadow-md'
                : 'text-[var(--ios-secondary-label)]'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'shop' ? (
        <>
          {/* ═══ SEARCH BAR ═══ */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--ios-tertiary-label)]" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder='Search eco products...'
                className="w-full pl-10 pr-12 py-3 rounded-[14px] bg-[var(--ios-card)] text-[14px] text-[var(--ios-label)] placeholder:text-[var(--ios-tertiary-label)] outline-none"
                style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
              />
              <button
                onClick={() => setCameraOpen(true)}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-[10px] bg-[#34c75915] flex items-center justify-center"
              >
                <Camera className="w-4 h-4 text-[#34c759]" />
              </button>
            </div>

          {/* ═══ CATEGORIES ═══ */}
          <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1 -mx-1 px-1">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full whitespace-nowrap text-[12px] font-semibold transition-all shrink-0 ${
                  selectedCategory === cat.id
                    ? 'text-white shadow-md'
                    : 'bg-[var(--ios-card)] text-[var(--ios-secondary-label)]'
                }`}
                style={selectedCategory === cat.id ? { background: cat.color } : { boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
              >
                <span className="text-[14px]">{cat.emoji}</span>
                {cat.label}
              </button>
            ))}
          </div>

          {/* ═══ VERIFY PURCHASE MODAL ═══ */}
          <AnimatePresence>
            {showVerify && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="ios-card p-5"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-[15px] font-semibold text-[var(--ios-label)]">Eco Purchase Verification</h3>
                  <button onClick={() => { setShowVerify(false); setVerifyResult(null); }} className="text-[var(--ios-tertiary-label)]">
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>
                {verifying ? (
                  <div className="flex flex-col items-center gap-3 py-6">
                    <Loader2 className="w-8 h-8 text-[#34c759] animate-spin" />
                    <p className="text-[13px] text-[var(--ios-secondary-label)]">Analyzing with Google Vision AI...</p>
                  </div>
                ) : verifyResult ? (
                  <div className="flex flex-col items-center gap-3 py-4">
                    {verifyResult.verified ? (
                      <>
                        <div className="w-14 h-14 rounded-full bg-[#34c75920] flex items-center justify-center">
                          <CheckCircle2 className="w-8 h-8 text-[#34c759]" />
                        </div>
                        <p className="text-[15px] font-semibold text-[#34c759]">Eco Purchase Verified!</p>
                        <p className="text-[12px] text-[var(--ios-secondary-label)]">
                          Detected: <span className="font-medium">{verifyResult.label}</span> ({(verifyResult.confidence * 100).toFixed(0)}% confidence)
                        </p>
                        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#34c75915]">
                          <Zap className="w-4 h-4 text-[#34c759]" />
                          <span className="text-[14px] font-bold text-[#34c759]">+{verifyResult.pointsEarned} Eco Points</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="w-14 h-14 rounded-full bg-[#ff453a20] flex items-center justify-center">
                          <XCircle className="w-8 h-8 text-[#ff453a]" />
                        </div>
                        <p className="text-[15px] font-semibold text-[#ff453a]">Not Verified</p>
                        <p className="text-[12px] text-[var(--ios-secondary-label)] text-center">
                          Could not detect an eco product. Detected: {verifyResult.label}
                        </p>
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="px-4 py-2 rounded-[10px] bg-[var(--ios-blue)] text-white text-[13px] font-semibold ios-press"
                        >
                          Try Again
                        </button>
                      </>
                    )}
                  </div>
                ) : null}
              </motion.div>
            )}
          </AnimatePresence>

          {/* ═══ ECO POINTS BANNER ═══ */}
          <div className="ios-card overflow-hidden">
            <div className="p-4 flex items-center gap-3" style={{ background: 'linear-gradient(135deg, #34c759 0%, #248a3d 100%)' }}>
              <div className="w-11 h-11 rounded-full bg-white/20 flex items-center justify-center">
                <Leaf className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-[12px] text-white/70 font-medium">Your Eco Points</p>
                <p className="text-[22px] font-bold text-white">{totalEcoPoints} pts</p>
              </div>
              <div className="text-right">
                <p className="text-[11px] text-white/60">Eco Balance</p>
                <p className="text-[16px] font-bold text-white">{'\u20B9'}{ecoBalance}</p>
              </div>
            </div>
          </div>

          {/* ═══ FEATURED COLLECTIONS (like screenshot) ═══ */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[20px] font-bold text-[var(--ios-label)]">Suggested For You</h2>
              <div className="flex items-center gap-1 text-[#34c759]">
                <Sparkles className="w-4 h-4" />
                <span className="text-[12px] font-semibold">AI Picked</span>
              </div>
            </div>
            <div className="flex gap-3 overflow-x-auto scrollbar-none pb-2 -mx-1 px-1">
              {FEATURED_COLLECTIONS.map(col => (
                <div
                  key={col.id}
                  className="shrink-0 w-[220px] rounded-[20px] p-5 relative overflow-hidden"
                  style={{ background: col.gradient, minHeight: '200px' }}
                >
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-white/20 text-[10px] font-bold text-white/90 tracking-wider mb-2">
                    {col.badge}
                  </span>
                  <span className="absolute top-4 right-4 text-[28px]">{col.emoji}</span>
                  <h3 className="text-[22px] font-bold text-white leading-tight mt-3 whitespace-pre-line">{col.title}</h3>
                  <div className="mt-4 p-2 rounded-[10px] bg-white/15">
                    <p className="text-[12px] text-white/90 font-medium">{col.subtitle}</p>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-[11px] text-white/70">{col.products} items</span>
                      <span className="text-[12px] font-bold text-white">+{col.points} pts</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ═══ IMPACT BOOSTERS ═══ */}
          <section>
            <h2 className="text-[20px] font-bold text-[var(--ios-label)] mb-3">Impact Boosters</h2>
            <div className="flex gap-2.5 overflow-x-auto scrollbar-none pb-2 -mx-1 px-1">
              {[
                { emoji: '🚲', title: 'Cycle to Work', sub: 'Zero emission commute', pts: 12, gradient: 'linear-gradient(135deg, #34c759 0%, #248a3d 100%)' },
                { emoji: '♻️', title: 'Zero Waste Day', sub: 'No single-use plastic', pts: 15, gradient: 'linear-gradient(135deg, #30d158 0%, #1fa848 100%)' },
                { emoji: '🛒', title: 'Eco Shopping', sub: 'Buy verified eco goods', pts: 20, gradient: 'linear-gradient(135deg, #007aff 0%, #0055d4 100%)' },
                { emoji: '🔧', title: 'Repair Session', sub: 'Fix instead of replace', pts: 18, gradient: 'linear-gradient(135deg, #5856d6 0%, #3634a3 100%)' },
              ].map((b, i) => (
                <div
                  key={i}
                  className="shrink-0 w-[150px] rounded-[16px] p-4 flex flex-col justify-between"
                  style={{ background: b.gradient, minHeight: '140px' }}
                >
                  <span className="text-[24px]">{b.emoji}</span>
                  <div className="mt-auto">
                    <p className="text-[14px] font-bold text-white">{b.title}</p>
                    <p className="text-[11px] text-white/70 mt-0.5">{b.sub}</p>
                    <div className="flex items-center gap-1 mt-2">
                      <Zap className="w-3 h-3 text-white" />
                      <span className="text-[12px] font-bold text-white">+{b.pts} pts</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ═══ PRODUCTS GRID ═══ */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[20px] font-bold text-[var(--ios-label)]">Eco Products</h2>
              <span className="text-[12px] text-[var(--ios-tertiary-label)]">{filteredProducts.length} items</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {filteredProducts.map(product => {
                const discount = Math.round(((product.mrp - product.price) / product.mrp) * 100);
                return (
                  <motion.div
                    key={product.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="ios-card overflow-hidden"
                    style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
                  >
                    {/* Product image area */}
                    <div
                      className="relative h-[120px] flex items-center justify-center"
                      style={{ background: product.gradient }}
                    >
                      <span className="text-[48px]">{product.emoji}</span>
                      {product.badge && (
                        <span
                          className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[9px] font-bold text-white"
                          style={{ backgroundColor: product.badgeColor }}
                        >
                          {product.badge}
                        </span>
                      )}
                      <button
                        onClick={() => toggleFavorite(product.id)}
                        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm"
                      >
                        <Heart
                          className={`w-4 h-4 ${favorites.has(product.id) ? 'text-[#ff453a] fill-[#ff453a]' : 'text-white'}`}
                        />
                      </button>
                      <div className="absolute bottom-2 right-2 flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-black/30 backdrop-blur-sm">
                        <Leaf className="w-3 h-3 text-[#34c759]" />
                        <span className="text-[9px] font-bold text-white">{product.co2Saved}</span>
                      </div>
                    </div>
                    {/* Product info */}
                    <div className="p-3">
                      <p className="text-[10px] text-[var(--ios-tertiary-label)] font-medium">{product.brand}</p>
                      <p className="text-[13px] font-semibold text-[var(--ios-label)] mt-0.5 leading-tight line-clamp-2">{product.name}</p>
                      <div className="flex items-center gap-1 mt-1.5">
                        <Star className="w-3 h-3 text-[#ffcc00] fill-[#ffcc00]" />
                        <span className="text-[11px] font-medium text-[var(--ios-label)]">{product.rating}</span>
                        <span className="text-[10px] text-[var(--ios-tertiary-label)]">({product.reviews})</span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <span className="text-[15px] font-bold text-[var(--ios-label)]">{'\u20B9'}{product.price}</span>
                        <span className="text-[11px] text-[var(--ios-tertiary-label)] line-through">{'\u20B9'}{product.mrp}</span>
                        <span className="text-[10px] font-bold text-[#34c759]">{discount}% off</span>
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <Zap className="w-3 h-3 text-[#ff9f0a]" />
                        <span className="text-[10px] font-semibold text-[#ff9f0a]">+{product.ecoPoints} eco pts</span>
                      </div>
                      <button
                        onClick={() => addToCart(product.id)}
                        className="w-full mt-2.5 py-2 rounded-[10px] bg-[#34c759] text-white text-[12px] font-semibold ios-press flex items-center justify-center gap-1.5"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        Add to Cart
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </section>

          {/* ═══ VERIFY PURCHASE SECTION ═══ */}
            <section className="ios-card p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-[12px] bg-gradient-to-br from-[#007aff] to-[#0055d4] flex items-center justify-center">
                  <Camera className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-[17px] font-semibold text-[var(--ios-label)]">Verify Eco Purchase</h2>
                  <p className="text-[12px] text-[var(--ios-tertiary-label)]">Scan receipt or product for bonus points</p>
                </div>
              </div>
              <p className="text-[12px] text-[var(--ios-secondary-label)] mb-3">
                Take a photo of your eco-friendly purchase and our Google Vision AI will verify it. Earn bonus eco points for verified sustainable shopping!
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setCameraOpen(true)}
                  className="flex-1 py-3 rounded-[12px] bg-gradient-to-r from-[#34c759] to-[#30d158] text-white text-[14px] font-semibold ios-press flex items-center justify-center gap-2"
                >
                  <Camera className="w-5 h-5" />
                  Open Camera
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="py-3 px-5 rounded-[12px] bg-[var(--ios-card)] border border-[var(--ios-separator)] text-[14px] font-semibold text-[var(--ios-label)] ios-press flex items-center justify-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Gallery
                </button>
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleVerifyPhoto} />
            </section>

            {/* ═══ CAMERA CAPTURE OVERLAY ═══ */}
            <CameraCapture
              open={cameraOpen}
              onClose={() => setCameraOpen(false)}
              onCapture={handleCameraCapture}
              title="Verify Eco Purchase"
              subtitle="Point camera at eco product or receipt"
            />

          {/* ═══ CART FLOATING BAR ═══ */}
          <AnimatePresence>
            {cartCount > 0 && (
              <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                className="fixed bottom-28 left-1/2 -translate-x-1/2 z-[60] w-[calc(100%-48px)] max-w-[390px]"
              >
                <div
                  onClick={() => setShowPayModal(true)}
                  className="flex items-center justify-between px-5 py-3.5 rounded-[18px] text-white cursor-pointer ios-press"
                  style={{ background: 'linear-gradient(135deg, #34c759 0%, #248a3d 100%)', boxShadow: '0 4px 20px rgba(52,199,89,0.4)' }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                      <ShoppingCart className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-[14px] font-bold">Pay Now</p>
                      <p className="text-[11px] text-white/70">{cartCount} items</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[16px] font-bold">{'\u20B9'}{cartTotal}</span>
                    <ChevronRight className="w-5 h-5 text-white/70" />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      ) : (
        /* ═══════════════════════════════════════════════════
           FINANCE TAB (Marketplace-oriented)
           ═══════════════════════════════════════════════════ */
        <>
          {/* ═══ ECO WALLET ═══ */}
          <section className="ios-card overflow-hidden">
            <div className="p-5" style={{ background: 'linear-gradient(135deg, #34c759 0%, #248a3d 100%)' }}>
              <div className="flex items-center gap-2 mb-1">
                <Wallet className="w-4 h-4 text-white/70" />
                <span className="text-[12px] font-medium text-white/70 uppercase tracking-wider">Marketplace Wallet</span>
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-[36px] font-bold text-white tracking-tight">
                    <span className="text-[20px] font-normal text-white/60 mr-1">{'\u20B9'}</span>
                    {ecoBalance.toLocaleString()}
                  </p>
                  <p className="text-[13px] text-white/60 mt-0.5">Earned from eco purchases</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-white/15">
                    <Award className="w-3 h-3 text-white" />
                    <span className="text-[11px] font-semibold text-white">{totalEcoPoints} pts</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <div className="flex-1 p-3 rounded-[12px] bg-white/10 backdrop-blur-sm">
                  <div className="flex items-center gap-1.5 mb-1">
                    <ArrowDownLeft className="w-3.5 h-3.5 text-white" />
                    <span className="text-[11px] text-white/50">Earned</span>
                  </div>
                  <p className="text-[17px] font-bold text-white">{'\u20B9'}{monthlyEarned}</p>
                  <p className="text-[10px] text-white/40">From marketplace</p>
                </div>
                <div className="flex-1 p-3 rounded-[12px] bg-white/10 backdrop-blur-sm">
                  <div className="flex items-center gap-1.5 mb-1">
                    <TrendingUp className="w-3.5 h-3.5 text-white" />
                    <span className="text-[11px] text-white/50">Cashback</span>
                  </div>
                  <p className="text-[17px] font-bold text-white">5.2%</p>
                  <p className="text-[10px] text-white/40">Avg return</p>
                </div>
              </div>
            </div>
          </section>

            {/* ═══ QUICK ACTIONS ═══ */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { icon: CreditCard, label: 'Pay', color: '#007aff', action: () => setShowPayModal(true) },
                { icon: Receipt, label: 'Bills', color: '#ff9f0a', action: () => setShowBillsModal(true) },
                { icon: BadgePercent, label: 'Offers', color: '#ff453a', action: () => rewardsRef.current?.scrollIntoView({ behavior: 'smooth' }) },
              ].map(({ icon: Icon, label, color, action }) => (
                <button key={label} onClick={action} className="ios-card flex flex-col items-center gap-1.5 py-3 ios-press">
                  <div className="w-10 h-10 rounded-[12px] flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
                    <Icon className="w-5 h-5" style={{ color }} />
                  </div>
                  <span className="text-[11px] font-medium text-[var(--ios-secondary-label)]">{label}</span>
                </button>
              ))}
            </div>

          {/* ═══ ECO CREDIT SCORE ═══ */}
          <section className="ios-card p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-[12px] bg-gradient-to-br from-[#30d158] to-[#248a3d] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-[17px] font-semibold text-[var(--ios-label)]">Eco Credit Score</h2>
                <p className="text-[12px] text-[var(--ios-tertiary-label)]">Based on marketplace activity</p>
              </div>
            </div>
            <div className="flex items-center justify-center py-6">
              <div className="relative w-40 h-40">
                <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                  <circle cx="60" cy="60" r="52" fill="none" stroke="var(--ios-separator)" strokeWidth="8" />
                  <motion.circle
                    cx="60" cy="60" r="52" fill="none" stroke="#30d158" strokeWidth="8" strokeLinecap="round"
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
                { label: 'Shopping', value: 'Green', color: '#34c759' },
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

          {/* ═══ CARBON OFFSET ═══ */}
          <section className="ios-card p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-[12px] bg-gradient-to-br from-[#ff9f0a] to-[#e68600] flex items-center justify-center">
                <TreePine className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-[17px] font-semibold text-[var(--ios-label)]">Carbon Offset</h2>
                <p className="text-[12px] text-[var(--ios-tertiary-label)]">Use eco-credits to offset</p>
              </div>
            </div>
            <div className="space-y-2">
              {[
                { name: 'Plant 5 Trees', cost: 150, co2: '25 kg', icon: '🌳' },
                { name: 'Fund Solar Panel', cost: 500, co2: '100 kg', icon: '\u2600\uFE0F' },
                { name: 'Ocean Cleanup', cost: 300, co2: '50 kg', icon: '🌊' },
              ].map(item => (
                <div key={item.name} className="flex items-center gap-3 p-3 rounded-[12px] bg-[var(--ios-bg)]">
                  <span className="text-[24px]">{item.icon}</span>
                  <div className="flex-1">
                    <p className="text-[14px] font-medium text-[var(--ios-label)]">{item.name}</p>
                    <p className="text-[11px] text-[var(--ios-tertiary-label)]">Offsets {item.co2} CO{'\u2082'}</p>
                  </div>
                  <button className="px-3 py-1.5 rounded-[8px] bg-[#34c759] text-white text-[12px] font-semibold ios-press">
                    {'\u20B9'}{item.cost}
                  </button>
                </div>
              ))}
            </div>
          </section>

                {/* ═══ MARKETPLACE REWARDS ═══ */}
                <section ref={rewardsRef} className="ios-card p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-[12px] bg-gradient-to-br from-[#ff9f0a] to-[#ff6b00] flex items-center justify-center">
                      <Gift className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-[17px] font-semibold text-[var(--ios-label)]">Marketplace Rewards</h2>
                      <p className="text-[12px] text-[var(--ios-tertiary-label)]">Earned from eco shopping</p>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => setCouponIdx(i => Math.max(i - 1, 0))} className="w-7 h-7 rounded-full bg-[var(--ios-bg)] flex items-center justify-center ios-press">
                        <ChevronLeft className="w-4 h-4 text-[var(--ios-tertiary-label)]" />
                      </button>
                      <button onClick={() => setCouponIdx(i => Math.min(i + 1, COUPONS.length - 1))} className="w-7 h-7 rounded-full bg-[var(--ios-bg)] flex items-center justify-center ios-press">
                        <ChevronRight className="w-4 h-4 text-[var(--ios-tertiary-label)]" />
                      </button>
                    </div>
                  </div>
                  <div className="relative h-[200px] overflow-hidden">
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
                              <p className="text-[11px] font-medium text-white/70 uppercase tracking-wider">Marketplace Reward</p>
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
                                <button onClick={() => handleCopyCode(c.code)} className="px-3 py-1.5 rounded-[8px] bg-white text-[12px] font-bold ios-press text-black">
                                  {copiedCode === c.code ? <><Check className="w-3 h-3 inline mr-1 text-green-600" />Copied</> : <><Copy className="w-3 h-3 inline mr-1" />{c.code}</>}
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
                                  <div className="h-full bg-white/50 rounded-full" style={{ width: `${Math.min(100, (iq / c.iqRequired) * 100)}%` }} />
                                </div>
                                <p className="text-[10px] text-white/40 mt-1">Need +{c.iqRequired - iq} IQ to unlock</p>
                              </div>
                            </>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                  <div className="flex justify-center gap-1.5 mt-3">
                    {COUPONS.map((_, i) => (
                      <button key={i} onClick={() => setCouponIdx(i)} className={`w-2 h-2 rounded-full transition-all ${i === couponIdx ? 'bg-[var(--ios-blue)] w-4' : 'bg-[var(--ios-separator)]'}`} />
                    ))}
                  </div>
                </section>
      
                {/* ═══ GREEN SAVINGS ═══ */}
                <section className="ios-card p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-[12px] bg-gradient-to-br from-[#34c759] to-[#248a3d] flex items-center justify-center">
                      <PiggyBank className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-[17px] font-semibold text-[var(--ios-label)]">Green Savings</h2>
                      <p className="text-[12px] text-[var(--ios-tertiary-label)]">Funded by marketplace cashback</p>
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
                                <p className="text-[11px] text-[var(--ios-tertiary-label)]">{'\u20B9'}{g.current.toLocaleString()} / {'\u20B9'}{g.target.toLocaleString()}</p>
                              </div>
                            </div>
                            <span className="text-[14px] font-bold" style={{ color: g.color }}>{pct.toFixed(0)}%</span>
                          </div>
                          <div className="w-full h-2 bg-[var(--ios-separator)] rounded-full overflow-hidden">
                            <motion.div className="h-full rounded-full" style={{ backgroundColor: g.color }} initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1, delay: 0.2 }} />
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
                      <p className="text-[12px] text-[var(--ios-tertiary-label)]">Marketplace activity</p>
                    </div>
                  </div>
                  <div className="flex gap-1 p-0.5 bg-[var(--ios-bg)] rounded-[10px] mb-3">
                    {(['all', 'credit', 'debit'] as const).map(f => (
                      <button
                        key={f}
                        onClick={() => setTxFilter(f)}
                        className={`flex-1 py-1.5 rounded-[8px] text-[12px] font-medium transition-all ${
                          txFilter === f ? 'bg-[var(--ios-card)] text-[var(--ios-label)] shadow-sm' : 'text-[var(--ios-tertiary-label)]'
                        }`}
                      >
                        {f === 'all' ? 'All' : f === 'credit' ? 'Earned' : 'Spent'}
                      </button>
                    ))}
                  </div>
                  <div className="space-y-1">
                    <AnimatePresence mode="popLayout">
                      {filteredTx.map(tx => (
                        <motion.div key={tx.id} layout initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="flex items-center gap-3 p-3 rounded-[12px] bg-[var(--ios-bg)]">
                          <span className="text-[22px]">{tx.icon}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-[14px] font-medium text-[var(--ios-label)]">{tx.title}</p>
                            <p className="text-[11px] text-[var(--ios-tertiary-label)]">{tx.date} &middot; {tx.category}</p>
                          </div>
                          <div className="text-right">
                            <p className={`text-[15px] font-bold tabular-nums ${tx.type === 'credit' ? 'text-[#34c759]' : 'text-[var(--ios-label)]'}`}>
                              {tx.type === 'credit' ? '+' : ''}{'\u20B9'}{Math.abs(tx.amount)}
                            </p>
                            {tx.points > 0 && (
                              <p className="text-[10px] text-[#ff9f0a] font-semibold">+{tx.points} pts</p>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </section>
              </>
            )}

        {/* ═══ PAY MODAL ═══ */}
        <AnimatePresence>
          {showPayModal && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-black/50 flex items-end justify-center" onClick={() => setShowPayModal(false)}>
              <motion.div initial={{ y: 300 }} animate={{ y: 0 }} exit={{ y: 300 }} transition={{ type: 'spring', damping: 25 }} className="w-full max-w-[430px] bg-[var(--ios-card)] rounded-t-[24px] p-6 pb-8 max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="w-10 h-1 rounded-full bg-[var(--ios-separator)] mx-auto mb-5" />
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-12 h-12 rounded-[14px] bg-[#007aff15] flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-[#007aff]" />
                  </div>
                  <div>
                    <h3 className="text-[18px] font-bold text-[var(--ios-label)]">Pay for Cart</h3>
                    <p className="text-[13px] text-[var(--ios-tertiary-label)]">{cartCount} items in your cart</p>
                    {bankConnected && (
                      <div className="flex items-center gap-1.5 mt-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#34c759]" />
                        <span className="text-[11px] font-medium text-[#34c759]">{bankName} Bank Connected</span>
                      </div>
                    )}
                  </div>
                </div>
                {cartCount > 0 ? (
                  <>
                    <div className="space-y-2 mb-4 max-h-[200px] overflow-y-auto">
                      {Array.from(cart.entries()).map(([id, qty]) => {
                        const p = ECO_PRODUCTS.find(x => x.id === id);
                        if (!p) return null;
                        return (
                          <div key={id} className="flex items-center gap-3 p-3 rounded-[12px] bg-[var(--ios-bg)]">
                            <span className="text-[24px]">{p.emoji}</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-[13px] font-medium text-[var(--ios-label)] truncate">{p.name}</p>
                              <p className="text-[11px] text-[var(--ios-tertiary-label)]">{p.brand} &middot; Qty: {qty}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <button onClick={() => setCart(prev => { const n = new Map(prev); const c = n.get(id) || 0; if (c <= 1) n.delete(id); else n.set(id, c - 1); return n; })} className="w-6 h-6 rounded-full bg-[var(--ios-separator)] flex items-center justify-center"><Minus className="w-3 h-3" /></button>
                              <span className="text-[14px] font-bold text-[var(--ios-label)]">{'\u20B9'}{p.price * qty}</span>
                              <button onClick={() => addToCart(id)} className="w-6 h-6 rounded-full bg-[#34c75920] flex items-center justify-center"><Plus className="w-3 h-3 text-[#34c759]" /></button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-[12px] bg-[#34c75910] mb-4">
                      <span className="text-[14px] font-medium text-[var(--ios-label)]">Total</span>
                      <span className="text-[20px] font-bold text-[#34c759]">{'\u20B9'}{cartTotal}</span>
                    </div>
                    {bankConnected ? (
                      <button onClick={() => { setCart(new Map()); setShowPayModal(false); }} className="w-full py-3.5 rounded-[14px] bg-gradient-to-r from-[#007aff] to-[#0055d4] text-white text-[15px] font-semibold ios-press flex items-center justify-center gap-2">
                        <CreditCard className="w-5 h-5" />
                        Pay {'\u20B9'}{cartTotal}
                      </button>
                    ) : (
                      <button onClick={() => setShowBankConnect(true)} className="w-full py-3.5 rounded-[14px] bg-gradient-to-r from-[#5856d6] to-[#3634a3] text-white text-[15px] font-semibold ios-press flex items-center justify-center gap-2">
                        <Building2 className="w-5 h-5" />
                        Connect Bank Account to Pay
                      </button>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8">
                    <ShoppingCart className="w-12 h-12 text-[var(--ios-tertiary-label)] mx-auto mb-3" />
                    <p className="text-[15px] font-medium text-[var(--ios-secondary-label)]">Your cart is empty</p>
                    <p className="text-[12px] text-[var(--ios-tertiary-label)] mt-1">Add eco products from the Shop tab</p>
                    <button onClick={() => { setShowPayModal(false); setActiveTab('shop'); }} className="mt-4 px-6 py-2.5 rounded-[12px] bg-[#34c759] text-white text-[13px] font-semibold ios-press">
                      Browse Products
                    </button>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ═══ BANK CONNECT MODAL ═══ */}
        <AnimatePresence>
          {showBankConnect && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[110] bg-black/50 flex items-end justify-center" onClick={() => setShowBankConnect(false)}>
              <motion.div initial={{ y: 300 }} animate={{ y: 0 }} exit={{ y: 300 }} transition={{ type: 'spring', damping: 25 }} className="w-full max-w-[430px] bg-[var(--ios-card)] rounded-t-[24px] p-6" onClick={e => e.stopPropagation()}>
                <div className="w-10 h-1 rounded-full bg-[var(--ios-separator)] mx-auto mb-5" />
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-12 h-12 rounded-[14px] bg-[#5856d615] flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-[#5856d6]" />
                  </div>
                  <div>
                    <h3 className="text-[18px] font-bold text-[var(--ios-label)]">Connect Bank Account</h3>
                    <p className="text-[13px] text-[var(--ios-tertiary-label)]">Link your bank to make payments</p>
                  </div>
                </div>
                <div className="space-y-3 mb-5">
                  <div>
                    <label className="text-[12px] font-medium text-[var(--ios-secondary-label)] mb-1 block">Bank Name</label>
                    <select value={bankName} onChange={e => setBankName(e.target.value)} className="w-full px-4 py-3 rounded-[12px] bg-[var(--ios-bg)] text-[14px] text-[var(--ios-label)] outline-none border border-[var(--ios-separator)]">
                      <option value="">Select your bank</option>
                      <option value="SBI">State Bank of India</option>
                      <option value="HDFC">HDFC Bank</option>
                      <option value="ICICI">ICICI Bank</option>
                      <option value="Axis">Axis Bank</option>
                      <option value="Kotak">Kotak Mahindra Bank</option>
                      <option value="PNB">Punjab National Bank</option>
                      <option value="BOB">Bank of Baroda</option>
                      <option value="Canara">Canara Bank</option>
                      <option value="IndusInd">IndusInd Bank</option>
                      <option value="Yes">Yes Bank</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[12px] font-medium text-[var(--ios-secondary-label)] mb-1 block">Account Number</label>
                    <input type="text" value={bankAccount} onChange={e => setBankAccount(e.target.value.replace(/\D/g, ''))} placeholder="Enter account number" maxLength={18} className="w-full px-4 py-3 rounded-[12px] bg-[var(--ios-bg)] text-[14px] text-[var(--ios-label)] placeholder:text-[var(--ios-tertiary-label)] outline-none border border-[var(--ios-separator)]" />
                  </div>
                  <div>
                    <label className="text-[12px] font-medium text-[var(--ios-secondary-label)] mb-1 block">IFSC Code</label>
                    <input type="text" value={bankIfsc} onChange={e => setBankIfsc(e.target.value.toUpperCase())} placeholder="e.g. SBIN0001234" maxLength={11} className="w-full px-4 py-3 rounded-[12px] bg-[var(--ios-bg)] text-[14px] text-[var(--ios-label)] placeholder:text-[var(--ios-tertiary-label)] outline-none border border-[var(--ios-separator)] font-mono" />
                  </div>
                </div>
                <div className="p-3 rounded-[12px] bg-[#ff9f0a10] border border-[#ff9f0a30] mb-4 flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#ff9f0a] mt-0.5 shrink-0" />
                  <p className="text-[11px] text-[#ff9f0a]">Your bank details are encrypted and secured with 256-bit encryption.</p>
                </div>
                <button disabled={!bankName || bankAccount.length < 8 || bankIfsc.length < 11 || bankConnecting} onClick={() => { setBankConnecting(true); setTimeout(() => { setBankConnected(true); setBankConnecting(false); setShowBankConnect(false); }, 2000); }} className="w-full py-3.5 rounded-[14px] bg-gradient-to-r from-[#5856d6] to-[#3634a3] text-white text-[15px] font-semibold ios-press flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none">
                  {bankConnecting ? (<><Loader2 className="w-5 h-5 animate-spin" />Verifying...</>) : (<><Lock className="w-5 h-5" />Connect Securely</>)}
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ═══ BILLS MODAL ═══ */}
        <AnimatePresence>
          {showBillsModal && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-black/50 flex items-end justify-center" onClick={() => setShowBillsModal(false)}>
              <motion.div initial={{ y: 300 }} animate={{ y: 0 }} exit={{ y: 300 }} transition={{ type: 'spring', damping: 25 }} className="w-full max-w-[430px] bg-[var(--ios-card)] rounded-t-[24px] p-6" onClick={e => e.stopPropagation()}>
                <div className="w-10 h-1 rounded-full bg-[var(--ios-separator)] mx-auto mb-5" />
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-12 h-12 rounded-[14px] bg-[#ff9f0a15] flex items-center justify-center">
                    <Receipt className="w-6 h-6 text-[#ff9f0a]" />
                  </div>
                  <div>
                    <h3 className="text-[18px] font-bold text-[var(--ios-label)]">Cart Bill Summary</h3>
                    <p className="text-[13px] text-[var(--ios-tertiary-label)]">{cartCount} items</p>
                  </div>
                </div>
                {cartCount > 0 ? (
                  <>
                    <div className="space-y-2 mb-4">
                      {Array.from(cart.entries()).map(([id, qty]) => {
                        const p = ECO_PRODUCTS.find(x => x.id === id);
                        if (!p) return null;
                        return (
                          <div key={id} className="flex items-center justify-between py-2 border-b border-[var(--ios-separator)]">
                            <div className="flex items-center gap-2">
                              <span className="text-[18px]">{p.emoji}</span>
                              <div>
                                <p className="text-[13px] font-medium text-[var(--ios-label)]">{p.name}</p>
                                <p className="text-[11px] text-[var(--ios-tertiary-label)]">x{qty} @ {'\u20B9'}{p.price}</p>
                              </div>
                            </div>
                            <span className="text-[14px] font-semibold text-[var(--ios-label)]">{'\u20B9'}{p.price * qty}</span>
                          </div>
                        );
                      })}
                    </div>
                    <div className="space-y-2 p-4 rounded-[14px] bg-[var(--ios-bg)]">
                      <div className="flex justify-between text-[13px]">
                        <span className="text-[var(--ios-secondary-label)]">Subtotal</span>
                        <span className="text-[var(--ios-label)] font-medium">{'\u20B9'}{cartTotal}</span>
                      </div>
                      <div className="flex justify-between text-[13px]">
                        <span className="text-[var(--ios-secondary-label)]">Eco Discount (5%)</span>
                        <span className="text-[#34c759] font-medium">-{'\u20B9'}{Math.round(cartTotal * 0.05)}</span>
                      </div>
                      <div className="flex justify-between text-[13px]">
                        <span className="text-[var(--ios-secondary-label)]">Eco Points Earned</span>
                        <span className="text-[#ff9f0a] font-medium">+{Array.from(cart.entries()).reduce((s, [id, qty]) => { const p = ECO_PRODUCTS.find(x => x.id === id); return s + (p ? p.ecoPoints * qty : 0); }, 0)} pts</span>
                      </div>
                      <div className="h-px bg-[var(--ios-separator)] my-1" />
                      <div className="flex justify-between">
                        <span className="text-[15px] font-bold text-[var(--ios-label)]">Total</span>
                        <span className="text-[18px] font-bold text-[#34c759]">{'\u20B9'}{cartTotal - Math.round(cartTotal * 0.05)}</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <Receipt className="w-12 h-12 text-[var(--ios-tertiary-label)] mx-auto mb-3" />
                    <p className="text-[15px] font-medium text-[var(--ios-secondary-label)]">No bills yet</p>
                    <p className="text-[12px] text-[var(--ios-tertiary-label)] mt-1">Add items to cart to see your bill</p>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </motion.div>
    );
  }
