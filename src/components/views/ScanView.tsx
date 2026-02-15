'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Camera, CameraOff, Leaf, ChevronRight, RotateCcw, Sparkles,
  AlertTriangle, CheckCircle, XCircle, Clock, ShoppingBag, ArrowRight,
  Package, Droplets, Zap, Truck, Award, Info, Star, ChevronDown, ChevronUp,
  Recycle, Globe, Wheat, FlaskConical, Shield, Heart, Tag
} from 'lucide-react';
import { CardLeaves, SectionHeader, LeafDivider, SmallLeaf, TinyLeaf } from '@/components/ui/LeafDecorations';
import { useStore } from '@/store/useStore';
import { useExtensionStore } from '@/store/useExtensionStore';
import { PurchasePrompt } from '@/components/dashboard/PurchasePrompt';

/* ── Real API data types ── */
interface NutrientLevels {
  fat?: 'low' | 'moderate' | 'high';
  salt?: 'low' | 'moderate' | 'high';
  sugars?: 'low' | 'moderate' | 'high';
  'saturated-fat'?: 'low' | 'moderate' | 'high';
}

interface NutrimentData {
  energy_kcal_100g?: number;
  fat_100g?: number;
  saturated_fat_100g?: number;
  sugars_100g?: number;
  salt_100g?: number;
  proteins_100g?: number;
  fiber_100g?: number;
  carbohydrates_100g?: number;
  sodium_100g?: number;
  'nova-group'?: number;
  'nutrition-score-fr'?: number;
}

interface EcoscoreData {
  score?: number;
  grade?: string;
  adjustments?: {
    packaging?: { score?: number; value?: number };
    production_system?: { score?: number; value?: number };
    origins_of_ingredients?: { transportation_score?: number; value?: number };
    threatened_species?: { value?: number };
  };
  agribalyse?: {
    score?: number;
    ef_total?: number;
    co2_total?: number;
  };
  missing?: { labels?: number; origins?: number; packagings?: number };
}

interface ProductData {
  name: string;
  brand: string;
  barcode: string;
  image?: string;
  category: string;
  source: 'openfoodfacts' | 'fallback';
  // Real EcoScore data
  ecoScore: number;
  ecoGrade: string;
  nutriScore: string;
  nutriScoreValue: number;
  novaGroup: number;
  // Ingredients
  ingredientsText: string;
  ingredientsCount: number;
  allergens: string[];
  traces: string[];
  additives: string[];
  palmOil: boolean;
  // Nutrition
  nutrientLevels: NutrientLevels;
  nutriments: NutrimentData;
  // Packaging
  packaging: string[];
  packagingMaterials: string[];
  recyclable: boolean;
  // Origins & Production
  origins: string;
  manufacturingPlaces: string;
  countries: string[];
  stores: string[];
  // Certifications & Labels
  labels: string[];
  certifications: string[];
  // Environmental
  ecoscoreData: EcoscoreData;
  carbonFootprint?: number;
  // Misc
  quantity: string;
  servingSize: string;
  lastModified: string;
}

interface ScanLogEntry {
  product: ProductData;
  timestamp: Date;
}

/* ── Nutrient level indicator colors ── */
const NUTRIENT_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  low: { bg: 'bg-[#2d8a4e]/10', text: 'text-[#2d8a4e]', label: 'Low' },
  moderate: { bg: 'bg-[#c9a015]/10', text: 'text-[#c9a015]', label: 'Moderate' },
  high: { bg: 'bg-[#d94f4f]/10', text: 'text-[#d94f4f]', label: 'High' },
};

/* ── NutriScore grade colors ── */
const NUTRI_COLORS: Record<string, string> = {
  a: '#1E8F4E', b: '#60AC0E', c: '#FECB02', d: '#EE8100', e: '#E63E11',
};

/* ── Eco grade colors ── */
const ECO_GRADE_COLORS: Record<string, string> = {
  a: '#1E8F4E', b: '#60AC0E', c: '#FECB02', d: '#EE8100', e: '#E63E11',
};

/* ── NOVA group descriptions ── */
const NOVA_DESCRIPTIONS: Record<number, { label: string; color: string; desc: string }> = {
  1: { label: 'Unprocessed', color: '#1E8F4E', desc: 'Unprocessed or minimally processed foods' },
  2: { label: 'Processed Ingredients', color: '#60AC0E', desc: 'Processed culinary ingredients' },
  3: { label: 'Processed', color: '#EE8100', desc: 'Processed foods' },
  4: { label: 'Ultra-Processed', color: '#E63E11', desc: 'Ultra-processed food and drink products' },
};

/* ── Green alternatives (real-ish suggestions) ── */
const GREEN_ALTERNATIVES: Record<string, { name: string; reason: string; score: number }[]> = {
  default: [
    { name: 'Local Organic Alternative', reason: 'Locally produced with organic farming practices, reducing transport emissions by up to 60%', score: 82 },
    { name: 'Zero-Waste Brand', reason: 'Packaged in 100% compostable materials with carbon-neutral production', score: 88 },
    { name: 'Fair Trade Option', reason: 'Fair trade certified with transparent supply chain and renewable energy usage', score: 79 },
  ],
  spreads: [
    { name: 'Local Peanut Butter (Organic)', reason: 'No palm oil, glass jar packaging, locally sourced peanuts', score: 85 },
    { name: 'Sunflower Seed Butter', reason: 'Lower water footprint, recyclable packaging, no deforestation link', score: 82 },
  ],
  beverages: [
    { name: 'Filtered Tap Water', reason: 'Zero packaging waste, negligible carbon footprint', score: 98 },
    { name: 'Local Fruit Juice (Glass)', reason: 'Returnable glass bottles, locally sourced fruits, no added sugars', score: 80 },
  ],
  snacks: [
    { name: 'Homemade Trail Mix', reason: 'Buy in bulk, zero single-use packaging, control ingredients', score: 90 },
    { name: 'Local Bakery Cookies', reason: 'Short supply chain, minimal packaging, fresh ingredients', score: 78 },
  ],
  dairy: [
    { name: 'Oat Milk', reason: '80% lower emissions than dairy, minimal water usage, recyclable carton', score: 85 },
    { name: 'Local Farm Milk (Glass)', reason: 'Returnable glass bottles, grass-fed cows, short transport', score: 75 },
  ],
};

/* ── Parse real OpenFoodFacts response ── */
function parseOpenFoodFactsProduct(data: any, barcode: string): ProductData {
  const p = data.product;

  // Parse EcoScore
  let ecoScore = 0;
  let ecoGrade = 'unknown';
  if (p.ecoscore_score !== undefined && p.ecoscore_score !== null) {
    ecoScore = p.ecoscore_score;
  } else if (p.ecoscore_grade && p.ecoscore_grade !== 'unknown' && p.ecoscore_grade !== 'not-applicable') {
    const gradeMap: Record<string, number> = { a: 90, b: 72, c: 55, d: 35, e: 15 };
    ecoScore = gradeMap[p.ecoscore_grade.toLowerCase()] || 0;
  }
  ecoGrade = p.ecoscore_grade || 'unknown';

  // Parse NutriScore
  let nutriScore = p.nutriscore_grade || p.nutrition_grades || 'unknown';
  let nutriScoreValue = p.nutriscore_score || p.nutriments?.['nutrition-score-fr'] || 0;

  // Parse NOVA group
  let novaGroup = p.nova_group || p.nutriments?.['nova-group'] || 0;

  // Parse allergens
  const allergens = (p.allergens_tags || []).map((a: string) => a.replace('en:', '').replace(/-/g, ' '));
  const traces = (p.traces_tags || []).map((t: string) => t.replace('en:', '').replace(/-/g, ' '));

  // Parse additives
  const additives = (p.additives_tags || []).map((a: string) => a.replace('en:', '').toUpperCase());

  // Parse packaging
  const packagingRaw = p.packaging || '';
  const packaging = packagingRaw ? packagingRaw.split(',').map((s: string) => s.trim()).filter(Boolean) : [];
  const packagingMaterials = (p.packaging_materials_tags || p.packaging_tags || [])
    .map((m: string) => m.replace('en:', '').replace(/-/g, ' '));

  // Check recyclability from packaging info
  const packagingLower = (packagingRaw + ' ' + packagingMaterials.join(' ')).toLowerCase();
  const recyclable = packagingLower.includes('recycl') || packagingLower.includes('glass') || packagingLower.includes('cardboard');

  // Parse labels/certifications
  const allLabels = (p.labels_tags || []).map((l: string) => l.replace('en:', '').replace(/-/g, ' '));
  const certKeywords = ['organic', 'fair trade', 'rainforest', 'utz', 'fsc', 'eu organic', 'bio', 'halal', 'kosher', 'vegan', 'vegetarian'];
  const certifications = allLabels.filter((l: string) => certKeywords.some(k => l.toLowerCase().includes(k)));
  const labels = allLabels.filter((l: string) => !certKeywords.some(k => l.toLowerCase().includes(k)));

  // Parse countries
  const countries = (p.countries_tags || []).map((c: string) => c.replace('en:', '').replace(/-/g, ' '));

  // Parse stores
  const stores = p.stores ? p.stores.split(',').map((s: string) => s.trim()).filter(Boolean) : [];

  // Parse ecoscore data
  const ecoscoreData: EcoscoreData = p.ecoscore_data || {};

  // Carbon footprint
  const carbonFootprint = p.ecoscore_data?.agribalyse?.co2_total || p.carbon_footprint_percent_of_known_ingredients || undefined;

  // Palm oil check
  const palmOil = p.ingredients_analysis_tags?.includes('en:palm-oil') ||
    (p.ingredients_text || '').toLowerCase().includes('palm oil') ||
    (p.ingredients_text || '').toLowerCase().includes('huile de palme');

  // Category
  const category = p.categories_tags?.[0]?.replace('en:', '').replace(/-/g, ' ') ||
    p.categories?.split(',')[0]?.trim() || 'Unknown';

  return {
    name: p.product_name || p.product_name_en || p.generic_name || 'Unknown Product',
    brand: p.brands || 'Unknown Brand',
    barcode,
    image: p.image_front_url || p.image_url || p.image_front_small_url,
    category,
    source: 'openfoodfacts',
    ecoScore,
    ecoGrade,
    nutriScore,
    nutriScoreValue,
    novaGroup,
    ingredientsText: p.ingredients_text || p.ingredients_text_en || '',
    ingredientsCount: p.ingredients_n || 0,
    allergens,
    traces,
    additives,
    palmOil,
    nutrientLevels: p.nutrient_levels || {},
    nutriments: p.nutriments || {},
    packaging,
    packagingMaterials,
    recyclable,
    origins: p.origins || '',
    manufacturingPlaces: p.manufacturing_places || '',
    countries,
    stores,
    labels,
    certifications,
    ecoscoreData,
    carbonFootprint,
    quantity: p.quantity || '',
    servingSize: p.serving_size || '',
    lastModified: p.last_modified_t ? new Date(p.last_modified_t * 1000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '',
  };
}

/* ── Main Component ── */
export function ScanView() {
  const [barcode, setBarcode] = useState('');
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState<ProductData | null>(null);
  const [error, setError] = useState('');
  const [scannerActive, setScannerActive] = useState(false);
  const [showAlternative, setShowAlternative] = useState(false);
  const [alternative, setAlternative] = useState<{ name: string; reason: string; score: number } | null>(null);
  const [scanHistory, setScanHistory] = useState<ScanLogEntry[]>([]);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    ingredients: false, nutrition: false, packaging: false, environmental: false, certifications: false
  });
  const scannerRef = useRef<HTMLDivElement>(null);
  const html5QrCodeRef = useRef<any>(null);

  // ─── Purchase Confirmation Integration ───
  const { user } = useStore();
  const { handleProductScan, lastScannedProduct, showPurchasePrompt } = useExtensionStore();
  const [purchaseIqGain, setPurchaseIqGain] = useState(0);
  const [scanNotice, setScanNotice] = useState<string | null>(null);

  const scoreColor = (score: number) =>
    score > 70 ? '#2d8a4e' : score >= 40 ? '#c9a015' : '#d94f4f';
  const scoreLabel = (score: number) =>
    score > 70 ? 'Excellent' : score >= 40 ? 'Moderate' : 'Poor';

  const toggleSection = (section: string) =>
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));

  const fetchProduct = useCallback(async (code: string) => {
    const trimmed = code.trim();
    if (!trimmed) return;

    setLoading(true);
    setError('');
    setProduct(null);
    setShowAlternative(false);
    setAlternative(null);
    setExpandedSections({ ingredients: false, nutrition: false, packaging: false, environmental: false, certifications: false });

    try {
      const res = await fetch(`https://world.openfoodfacts.org/api/v2/product/${trimmed}.json`);
      const data = await res.json();

      if (data.status === 1 && data.product) {
        const productData = parseOpenFoodFactsProduct(data, trimmed);
        setProduct(productData);
        setScanHistory(prev => [{ product: productData, timestamp: new Date() }, ...prev].slice(0, 15));

        // ─── Trigger purchase confirmation flow ───
        if (user) {
          const scanResult = handleProductScan(
            trimmed,
            productData.name,
            productData.brand,
            productData.category,
            productData.ecoScore,
            user.id
          );
          if (!scanResult.allowed && scanResult.reason) {
            setScanNotice(scanResult.reason);
            setTimeout(() => setScanNotice(null), 5000);
          } else {
            setScanNotice(null);
          }
        }

        setLoading(false);
        return;
      }

      setError(`Product not found in OpenFoodFacts database for barcode "${trimmed}". This is a real API — try scanning a packaged food/drink product. Popular test barcodes: 3017620422003 (Nutella), 5449000000996 (Coca-Cola), 7622210449283 (Oreo), 3168930010265 (Bonne Maman Jam).`);
    } catch (err) {
      setError('Network error — could not reach OpenFoodFacts API. Check your internet connection and try again.');
    }

    setLoading(false);
  }, []);

  const startScanner = useCallback(async () => {
    if (!scannerRef.current) return;
    setScannerActive(true);
    try {
      const { Html5Qrcode } = await import('html5-qrcode');
      const scanner = new Html5Qrcode('qr-reader');
      html5QrCodeRef.current = scanner;
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 150 } },
        (decodedText) => {
          setBarcode(decodedText);
          fetchProduct(decodedText);
          scanner.stop().catch(() => {});
          setScannerActive(false);
        },
        () => {}
      );
    } catch {
      setError('Camera access denied or not available. Please enter the barcode manually.');
      setScannerActive(false);
    }
  }, [fetchProduct]);

  const stopScanner = useCallback(async () => {
    if (html5QrCodeRef.current) {
      try { await html5QrCodeRef.current.stop(); } catch {}
      html5QrCodeRef.current = null;
    }
    setScannerActive(false);
  }, []);

  useEffect(() => {
    return () => { html5QrCodeRef.current?.stop().catch(() => {}); };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (barcode.trim()) fetchProduct(barcode);
  };

  const suggestAlternative = () => {
    setShowAlternative(true);
    const cat = product?.category?.toLowerCase() || '';
    let pool = GREEN_ALTERNATIVES.default;
    if (cat.includes('spread') || cat.includes('chocolate') || cat.includes('hazelnut')) pool = GREEN_ALTERNATIVES.spreads;
    else if (cat.includes('beverage') || cat.includes('drink') || cat.includes('water') || cat.includes('soda') || cat.includes('juice')) pool = GREEN_ALTERNATIVES.beverages;
    else if (cat.includes('snack') || cat.includes('biscuit') || cat.includes('cookie') || cat.includes('chip')) pool = GREEN_ALTERNATIVES.snacks;
    else if (cat.includes('dairy') || cat.includes('milk') || cat.includes('cheese') || cat.includes('yogurt')) pool = GREEN_ALTERNATIVES.dairy;
    setAlternative(pool[Math.floor(Math.random() * pool.length)]);
  };

  const reset = () => {
    setProduct(null);
    setBarcode('');
    setError('');
    setShowAlternative(false);
    setAlternative(null);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-5">
      {/* ═══ Hero Section ═══ */}
      <div className="card-surface p-6 lg:p-8 relative overflow-hidden">
        <CardLeaves variant="b" />
        <div className="absolute top-0 right-0 w-[200px] h-[200px] pointer-events-none z-0">
          <svg viewBox="0 0 200 200" fill="none" className="w-full h-full">
            <path d="M180 10 C180 10 200 50 190 90 C180 130 140 150 140 150 C140 150 150 110 160 70 C170 30 180 10 180 10Z" fill="#2d8a4e" opacity="0.04" />
            <path d="M160 0 C160 0 190 30 185 70 C180 110 150 130 150 130 C150 130 155 90 160 50 C165 20 160 0 160 0Z" fill="#5cb85c" opacity="0.03" />
          </svg>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-[16px] bg-gradient-to-br from-[#2d8a4e] to-[#5cb85c] flex items-center justify-center">
              <Search className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-[22px] lg:text-[28px] font-bold text-[#1a2e1a] tracking-[-0.02em]">Scan & Know</h2>
              <p className="text-[13px] text-[#5e7a5e]">Real product data from <span className="font-semibold text-[#2d8a4e]">OpenFoodFacts</span> — 3M+ products worldwide</p>
            </div>
            <SmallLeaf className="text-[#2d8a4e] rotate-[-15deg] ml-auto hidden lg:block" size={18} />
          </div>

          {/* Data source badge */}
          <div className="mt-3 mb-4 flex items-center gap-2 px-3 py-2 rounded-[10px] bg-[#2d8a4e]/5 border border-[#2d8a4e]/10 w-fit">
            <Globe className="w-3.5 h-3.5 text-[#2d8a4e]" />
            <span className="text-[12px] text-[#2d8a4e] font-medium">Powered by OpenFoodFacts — open-source food database</span>
            <Shield className="w-3 h-3 text-[#2d8a4e]/50" />
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit}>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#5e7a5e]/50" />
                <input
                  type="text"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  placeholder="Enter barcode (e.g. 3017620422003)"
                  className="w-full h-[52px] pl-12 pr-4 rounded-[16px] bg-[#f0f7f0] border border-[#2d8a4e]/10 text-[15px] text-[#1a2e1a] placeholder:text-[#5e7a5e]/40 focus:outline-none focus:border-[#2d8a4e]/30 focus:ring-2 focus:ring-[#2d8a4e]/10 transition-all"
                />
              </div>
              <motion.button
                type="submit"
                disabled={loading || !barcode.trim()}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="h-[52px] px-6 rounded-[16px] bg-gradient-to-r from-[#2d8a4e] to-[#3a9d5c] text-white font-semibold text-[15px] disabled:opacity-40 transition-all flex items-center gap-2 shrink-0"
              >
                {loading ? (
                  <motion.div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} />
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span className="hidden sm:inline">Search</span>
                  </>
                )}
              </motion.button>
            </div>
          </form>

          {/* Scanner toggle + Quick try */}
          <div className="mt-3 flex items-center gap-3">
            <button
              onClick={scannerActive ? stopScanner : startScanner}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-[12px] text-[14px] font-medium transition-all ${
                scannerActive
                  ? 'bg-[#d94f4f]/10 text-[#d94f4f] border border-[#d94f4f]/20'
                  : 'bg-[#2d8a4e]/8 text-[#2d8a4e] border border-[#2d8a4e]/15 hover:bg-[#2d8a4e]/12'
              }`}
            >
              {scannerActive ? <CameraOff className="w-4 h-4" /> : <Camera className="w-4 h-4" />}
              {scannerActive ? 'Stop Camera' : 'Scan with Camera'}
            </button>
            <span className="text-[12px] text-[#5e7a5e]/60">or enter barcode manually</span>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <span className="text-[12px] text-[#5e7a5e] self-center">Try real products:</span>
            {[
              { code: '3017620422003', label: 'Nutella' },
              { code: '5449000000996', label: 'Coca-Cola' },
              { code: '7622210449283', label: 'Oreo' },
              { code: '3168930010265', label: 'Bonne Maman' },
              { code: '3175680011534', label: 'Evian Water' },
              { code: '5000112546415', label: 'Coca-Cola UK' },
            ].map((item) => (
              <button
                key={item.code}
                onClick={() => { setBarcode(item.code); fetchProduct(item.code); }}
                className="text-[12px] px-3 py-1.5 rounded-full bg-[#2d8a4e]/6 text-[#2d8a4e] hover:bg-[#2d8a4e]/12 transition-all font-medium"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ═══ Scanner Viewport ═══ */}
      <AnimatePresence>
        {scannerActive && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="card-surface p-4 relative">
              <CardLeaves variant="a" />
              <p className="text-[13px] text-[#5e7a5e] mb-3 relative z-10 flex items-center gap-2">
                <Camera className="w-4 h-4 text-[#2d8a4e]" />
                Point your camera at a barcode
              </p>
              <div id="qr-reader" ref={scannerRef} className="w-full max-w-[400px] mx-auto rounded-[12px] overflow-hidden relative z-10" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ Error ═══ */}
      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="card-surface-sm p-4 border-[#d94f4f]/15 bg-[#d94f4f]/3">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-[#d94f4f] shrink-0 mt-0.5" />
              <div>
                <p className="text-[14px] text-[#1a2e1a] font-medium">Product not found</p>
                <p className="text-[13px] text-[#5e7a5e] mt-1">{error}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ Loading ═══ */}
      <AnimatePresence>
        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="card-surface p-8 flex flex-col items-center justify-center gap-4">
            <motion.div
              className="w-16 h-16 rounded-full border-4 border-[#2d8a4e]/15 border-t-[#2d8a4e]"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
            <div className="text-center">
              <p className="text-[16px] font-semibold text-[#1a2e1a]">Fetching from OpenFoodFacts...</p>
              <p className="text-[13px] text-[#5e7a5e] mt-1">Retrieving real product data, nutrition, and environmental scores</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ Product Result ═══ */}
      <AnimatePresence>
        {product && !loading && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex flex-col gap-4">

            {/* ── Header Card: Product Info + Scores ── */}
            <div className="card-surface p-5 lg:p-6 relative">
              <CardLeaves variant="c" />
              <div className="relative z-10">
                <button onClick={reset} className="absolute top-0 right-0 w-9 h-9 rounded-full bg-[#2d8a4e]/8 flex items-center justify-center hover:bg-[#2d8a4e]/15 transition-all z-20">
                  <RotateCcw className="w-4 h-4 text-[#5e7a5e]" />
                </button>

                <div className="flex flex-col lg:flex-row gap-5">
                  {/* Product image + info */}
                  <div className="flex items-start gap-4 flex-1">
                    {product.image ? (
                      <img src={product.image} alt={product.name} className="w-[80px] h-[80px] lg:w-[100px] lg:h-[100px] rounded-[16px] object-cover bg-[#f0f7f0] border border-[#2d8a4e]/8" />
                    ) : (
                      <div className="w-[80px] h-[80px] lg:w-[100px] lg:h-[100px] rounded-[16px] bg-gradient-to-br from-[#e8f5e8] to-[#d0ebd0] flex items-center justify-center border border-[#2d8a4e]/8">
                        <ShoppingBag className="w-8 h-8 text-[#2d8a4e]/30" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-[20px] lg:text-[24px] font-bold text-[#1a2e1a] tracking-[-0.01em] leading-tight">{product.name}</h3>
                      <p className="text-[14px] text-[#5e7a5e] mt-0.5">{product.brand}</p>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        <span className="text-[11px] px-2.5 py-1 rounded-full bg-[#2d8a4e]/8 text-[#2d8a4e] font-medium capitalize">{product.category}</span>
                        {product.quantity && <span className="text-[11px] px-2.5 py-1 rounded-full bg-[#1a2e1a]/5 text-[#5e7a5e]">{product.quantity}</span>}
                        <span className="text-[11px] px-2.5 py-1 rounded-full bg-[#1a2e1a]/5 text-[#5e7a5e] font-mono">{product.barcode}</span>
                        <span className="text-[11px] px-2.5 py-1 rounded-full bg-[#2d8a4e]/10 text-[#2d8a4e] font-medium flex items-center gap-1">
                          <Globe className="w-3 h-3" /> OpenFoodFacts
                        </span>
                      </div>
                      {product.palmOil && (
                        <div className="mt-2 flex items-center gap-1.5 text-[12px] text-[#d94f4f] font-medium">
                          <AlertTriangle className="w-3.5 h-3.5" /> Contains Palm Oil
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Score badges */}
                  <div className="flex lg:flex-col items-center justify-center gap-3 lg:min-w-[160px]">
                    <EcoScoreGauge score={product.ecoScore} grade={product.ecoGrade} />
                  </div>
                </div>

                {/* Score row: NutriScore + NOVA + EcoGrade */}
                <div className="grid grid-cols-3 gap-3 mt-5">
                  {/* Nutri-Score */}
                  <div className="card-surface-sm p-3 text-center">
                    <p className="text-[11px] text-[#5e7a5e] mb-1.5">Nutri-Score</p>
                    {product.nutriScore !== 'unknown' ? (
                      <div className="flex justify-center gap-0.5">
                        {['a', 'b', 'c', 'd', 'e'].map(g => (
                          <div
                            key={g}
                            className={`w-7 h-7 rounded-md flex items-center justify-center text-[11px] font-bold uppercase transition-all ${
                              g === product.nutriScore.toLowerCase()
                                ? 'text-white scale-110 shadow-sm'
                                : 'text-white/60 opacity-30'
                            }`}
                            style={{ backgroundColor: NUTRI_COLORS[g] }}
                          >
                            {g}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[13px] text-[#5e7a5e]/50 font-medium">N/A</p>
                    )}
                  </div>

                  {/* NOVA Group */}
                  <div className="card-surface-sm p-3 text-center">
                    <p className="text-[11px] text-[#5e7a5e] mb-1.5">NOVA Group</p>
                    {product.novaGroup > 0 ? (
                      <>
                        <p className="text-[22px] font-bold" style={{ color: NOVA_DESCRIPTIONS[product.novaGroup]?.color || '#5e7a5e' }}>
                          {product.novaGroup}
                        </p>
                        <p className="text-[10px] text-[#5e7a5e] mt-0.5">{NOVA_DESCRIPTIONS[product.novaGroup]?.label}</p>
                      </>
                    ) : (
                      <p className="text-[13px] text-[#5e7a5e]/50 font-medium">N/A</p>
                    )}
                  </div>

                  {/* Eco-Score Grade */}
                  <div className="card-surface-sm p-3 text-center">
                    <p className="text-[11px] text-[#5e7a5e] mb-1.5">Eco-Score</p>
                    {product.ecoGrade !== 'unknown' && product.ecoGrade !== 'not-applicable' ? (
                      <div className="flex justify-center gap-0.5">
                        {['a', 'b', 'c', 'd', 'e'].map(g => (
                          <div
                            key={g}
                            className={`w-7 h-7 rounded-md flex items-center justify-center text-[11px] font-bold uppercase transition-all ${
                              g === product.ecoGrade.toLowerCase()
                                ? 'text-white scale-110 shadow-sm'
                                : 'text-white/60 opacity-30'
                            }`}
                            style={{ backgroundColor: ECO_GRADE_COLORS[g] }}
                          >
                            {g}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[13px] text-[#5e7a5e]/50 font-medium">N/A</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* ── Ingredients Section ── */}
            <CollapsibleSection
              title="Ingredients"
              icon={<Wheat className="w-4 h-4" />}
              expanded={expandedSections.ingredients}
              onToggle={() => toggleSection('ingredients')}
              badge={product.ingredientsCount > 0 ? `${product.ingredientsCount} ingredients` : undefined}
              variant="a"
            >
              {product.ingredientsText ? (
                <p className="text-[13px] text-[#5e7a5e] leading-relaxed">{product.ingredientsText}</p>
              ) : (
                <p className="text-[13px] text-[#5e7a5e]/50 italic">Ingredients data not available for this product</p>
              )}

              {product.additives.length > 0 && (
                <div className="mt-3">
                  <p className="text-[12px] font-semibold text-[#1a2e1a] mb-1.5 flex items-center gap-1.5">
                    <FlaskConical className="w-3.5 h-3.5 text-[#c9a015]" /> Additives ({product.additives.length})
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {product.additives.slice(0, 10).map(a => (
                      <span key={a} className="text-[11px] px-2 py-0.5 rounded-full bg-[#c9a015]/8 text-[#c9a015] font-mono">{a}</span>
                    ))}
                    {product.additives.length > 10 && (
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#5e7a5e]/8 text-[#5e7a5e]">+{product.additives.length - 10} more</span>
                    )}
                  </div>
                </div>
              )}

              {product.allergens.length > 0 && (
                <div className="mt-3">
                  <p className="text-[12px] font-semibold text-[#1a2e1a] mb-1.5 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-[#d94f4f]" /> Allergens
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {product.allergens.map(a => (
                      <span key={a} className="text-[11px] px-2 py-0.5 rounded-full bg-[#d94f4f]/8 text-[#d94f4f] font-medium capitalize">{a}</span>
                    ))}
                  </div>
                </div>
              )}

              {product.traces.length > 0 && (
                <div className="mt-3">
                  <p className="text-[12px] font-semibold text-[#5e7a5e] mb-1.5">May contain traces of:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {product.traces.map(t => (
                      <span key={t} className="text-[11px] px-2 py-0.5 rounded-full bg-[#c9a015]/6 text-[#c9a015] capitalize">{t}</span>
                    ))}
                  </div>
                </div>
              )}
            </CollapsibleSection>

            {/* ── Nutrition Section ── */}
            <CollapsibleSection
              title="Nutrition Facts"
              icon={<Heart className="w-4 h-4" />}
              expanded={expandedSections.nutrition}
              onToggle={() => toggleSection('nutrition')}
              badge={product.servingSize ? `per ${product.servingSize}` : undefined}
              variant="b"
            >
              {/* Nutrient level indicators */}
              {Object.keys(product.nutrientLevels).length > 0 && (
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {Object.entries(product.nutrientLevels).map(([nutrient, level]) => {
                    const config = NUTRIENT_COLORS[level || 'moderate'];
                    const labels: Record<string, string> = { fat: 'Fat', salt: 'Salt', sugars: 'Sugars', 'saturated-fat': 'Saturated Fat' };
                    return (
                      <div key={nutrient} className={`flex items-center gap-2 px-3 py-2 rounded-[10px] ${config.bg}`}>
                        <div className={`w-2 h-2 rounded-full ${config.text === 'text-[#2d8a4e]' ? 'bg-[#2d8a4e]' : config.text === 'text-[#c9a015]' ? 'bg-[#c9a015]' : 'bg-[#d94f4f]'}`} />
                        <div className="flex-1">
                          <span className="text-[12px] text-[#1a2e1a] font-medium">{labels[nutrient] || nutrient}</span>
                        </div>
                        <span className={`text-[11px] font-semibold ${config.text}`}>{config.label}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Nutrition table */}
              <div className="border border-[#2d8a4e]/8 rounded-[12px] overflow-hidden">
                <div className="bg-[#f0f7f0] px-3 py-2 text-[11px] font-semibold text-[#5e7a5e] uppercase tracking-wider">
                  Per 100g
                </div>
                {[
                  { label: 'Energy', value: product.nutriments.energy_kcal_100g, unit: 'kcal' },
                  { label: 'Fat', value: product.nutriments.fat_100g, unit: 'g' },
                  { label: '  Saturated Fat', value: product.nutriments.saturated_fat_100g, unit: 'g' },
                  { label: 'Carbohydrates', value: product.nutriments.carbohydrates_100g, unit: 'g' },
                  { label: '  Sugars', value: product.nutriments.sugars_100g, unit: 'g' },
                  { label: 'Fiber', value: product.nutriments.fiber_100g, unit: 'g' },
                  { label: 'Proteins', value: product.nutriments.proteins_100g, unit: 'g' },
                  { label: 'Salt', value: product.nutriments.salt_100g, unit: 'g' },
                ].filter(row => row.value !== undefined && row.value !== null).map((row, i) => (
                  <div key={row.label} className={`flex justify-between px-3 py-2 text-[13px] ${i % 2 === 0 ? 'bg-white' : 'bg-[#f8fbf8]'} ${row.label.startsWith('  ') ? 'pl-6' : ''}`}>
                    <span className={`${row.label.startsWith('  ') ? 'text-[#5e7a5e]' : 'text-[#1a2e1a] font-medium'}`}>{row.label.trim()}</span>
                    <span className="text-[#1a2e1a] font-medium tabular-nums">{typeof row.value === 'number' ? row.value.toFixed(1) : row.value} {row.unit}</span>
                  </div>
                ))}
              </div>
            </CollapsibleSection>

            {/* ── Packaging Section ── */}
            <CollapsibleSection
              title="Packaging & Materials"
              icon={<Package className="w-4 h-4" />}
              expanded={expandedSections.packaging}
              onToggle={() => toggleSection('packaging')}
              badge={product.recyclable ? 'Recyclable' : undefined}
              badgeColor={product.recyclable ? 'green' : undefined}
              variant="c"
            >
              {product.packaging.length > 0 ? (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {product.packaging.map(p => (
                    <span key={p} className="text-[12px] px-3 py-1 rounded-full bg-[#2d8a4e]/6 text-[#2d8a4e] font-medium">{p}</span>
                  ))}
                </div>
              ) : (
                <p className="text-[13px] text-[#5e7a5e]/50 italic mb-3">Packaging details not available</p>
              )}

              {product.packagingMaterials.length > 0 && (
                <div>
                  <p className="text-[12px] font-semibold text-[#1a2e1a] mb-1.5">Materials:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {product.packagingMaterials.map(m => (
                      <span key={m} className="text-[11px] px-2 py-0.5 rounded-full bg-[#1a2e1a]/5 text-[#5e7a5e] capitalize">{m}</span>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-3 flex items-center gap-2">
                <Recycle className={`w-4 h-4 ${product.recyclable ? 'text-[#2d8a4e]' : 'text-[#5e7a5e]/30'}`} />
                <span className={`text-[13px] font-medium ${product.recyclable ? 'text-[#2d8a4e]' : 'text-[#5e7a5e]/50'}`}>
                  {product.recyclable ? 'Contains recyclable materials' : 'Recyclability not confirmed'}
                </span>
              </div>
            </CollapsibleSection>

            {/* ── Environmental Impact Section ── */}
            <CollapsibleSection
              title="Environmental Impact"
              icon={<Leaf className="w-4 h-4" />}
              expanded={expandedSections.environmental}
              onToggle={() => toggleSection('environmental')}
              variant="d"
            >
              {/* EcoScore breakdown */}
              {product.ecoscoreData?.adjustments && (
                <div className="space-y-3 mb-4">
                  {[
                    { label: 'Packaging Impact', value: product.ecoscoreData.adjustments.packaging?.value, icon: <Package className="w-3.5 h-3.5" /> },
                    { label: 'Production System', value: product.ecoscoreData.adjustments.production_system?.value, icon: <Zap className="w-3.5 h-3.5" /> },
                    { label: 'Transportation', value: product.ecoscoreData.adjustments.origins_of_ingredients?.value, icon: <Truck className="w-3.5 h-3.5" /> },
                    { label: 'Threatened Species', value: product.ecoscoreData.adjustments.threatened_species?.value, icon: <AlertTriangle className="w-3.5 h-3.5" /> },
                  ].filter(item => item.value !== undefined).map(item => (
                    <div key={item.label} className="flex items-center gap-3">
                      <div className={`w-7 h-7 rounded-[8px] flex items-center justify-center ${(item.value || 0) >= 0 ? 'bg-[#2d8a4e]/10 text-[#2d8a4e]' : 'bg-[#d94f4f]/10 text-[#d94f4f]'}`}>
                        {item.icon}
                      </div>
                      <div className="flex-1">
                        <span className="text-[13px] text-[#1a2e1a]">{item.label}</span>
                      </div>
                      <span className={`text-[14px] font-bold tabular-nums ${(item.value || 0) >= 0 ? 'text-[#2d8a4e]' : 'text-[#d94f4f]'}`}>
                        {(item.value || 0) > 0 ? '+' : ''}{item.value}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {product.carbonFootprint && (
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-[10px] bg-[#1a2e1a]/5 mb-3">
                  <Droplets className="w-4 h-4 text-[#5e7a5e]" />
                  <span className="text-[13px] text-[#1a2e1a] font-medium">Carbon Footprint: <span className="text-[#2d8a4e]">{product.carbonFootprint.toFixed(2)} kg CO₂</span></span>
                </div>
              )}

              {product.origins && (
                <div className="flex items-start gap-2 mt-2">
                  <Globe className="w-3.5 h-3.5 text-[#5e7a5e] mt-0.5" />
                  <div>
                    <span className="text-[12px] font-semibold text-[#1a2e1a]">Origins: </span>
                    <span className="text-[12px] text-[#5e7a5e]">{product.origins}</span>
                  </div>
                </div>
              )}

              {product.manufacturingPlaces && (
                <div className="flex items-start gap-2 mt-1.5">
                  <Zap className="w-3.5 h-3.5 text-[#5e7a5e] mt-0.5" />
                  <div>
                    <span className="text-[12px] font-semibold text-[#1a2e1a]">Made in: </span>
                    <span className="text-[12px] text-[#5e7a5e]">{product.manufacturingPlaces}</span>
                  </div>
                </div>
              )}

              {product.countries.length > 0 && (
                <div className="flex items-start gap-2 mt-1.5">
                  <Tag className="w-3.5 h-3.5 text-[#5e7a5e] mt-0.5" />
                  <div>
                    <span className="text-[12px] font-semibold text-[#1a2e1a]">Sold in: </span>
                    <span className="text-[12px] text-[#5e7a5e] capitalize">{product.countries.slice(0, 5).join(', ')}{product.countries.length > 5 ? ` +${product.countries.length - 5} more` : ''}</span>
                  </div>
                </div>
              )}
            </CollapsibleSection>

            {/* ── Certifications Section ── */}
            {(product.certifications.length > 0 || product.labels.length > 0) && (
              <CollapsibleSection
                title="Labels & Certifications"
                icon={<Award className="w-4 h-4" />}
                expanded={expandedSections.certifications}
                onToggle={() => toggleSection('certifications')}
                badge={`${product.certifications.length + product.labels.length} labels`}
                variant="a"
              >
                {product.certifications.length > 0 && (
                  <div className="mb-3">
                    <p className="text-[12px] font-semibold text-[#2d8a4e] mb-1.5 flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5" /> Certifications
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {product.certifications.map(c => (
                        <span key={c} className="text-[11px] px-2.5 py-1 rounded-full bg-[#2d8a4e]/10 text-[#2d8a4e] font-medium capitalize">{c}</span>
                      ))}
                    </div>
                  </div>
                )}
                {product.labels.length > 0 && (
                  <div>
                    <p className="text-[12px] font-semibold text-[#5e7a5e] mb-1.5 flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5" /> Labels
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {product.labels.map(l => (
                        <span key={l} className="text-[11px] px-2.5 py-1 rounded-full bg-[#1a2e1a]/5 text-[#5e7a5e] capitalize">{l}</span>
                      ))}
                    </div>
                  </div>
                )}
              </CollapsibleSection>
            )}

            {/* ── Suggest Greener Alternative ── */}
            <div className="card-surface p-5 relative">
              <CardLeaves variant="a" />
              <div className="relative z-10">
                {!showAlternative ? (
                  <motion.button onClick={suggestAlternative} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                    className="w-full flex items-center justify-between p-4 rounded-[14px] bg-gradient-to-r from-[#2d8a4e]/8 to-[#5cb85c]/8 border border-[#2d8a4e]/10 hover:border-[#2d8a4e]/20 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-[12px] bg-gradient-to-br from-[#2d8a4e] to-[#5cb85c] flex items-center justify-center">
                        <Leaf className="w-5 h-5 text-white" />
                      </div>
                      <div className="text-left">
                        <p className="text-[15px] font-semibold text-[#1a2e1a]">Suggest a Greener Alternative</p>
                        <p className="text-[12px] text-[#5e7a5e]">Find eco-friendly options based on this product category</p>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-[#2d8a4e]" />
                  </motion.button>
                ) : alternative ? (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                    <div className="flex items-center gap-2 mb-3">
                      <Leaf className="w-5 h-5 text-[#2d8a4e]" />
                      <span className="text-[15px] font-semibold text-[#1a2e1a]">Greener Alternative</span>
                    </div>
                    <div className="p-4 rounded-[14px] bg-[#2d8a4e]/5 border border-[#2d8a4e]/10">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-[16px] font-bold text-[#2d8a4e]">{alternative.name}</h4>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[20px] font-bold text-[#2d8a4e] tabular-nums">{alternative.score}</span>
                          <span className="text-[11px] text-[#5e7a5e]">/100</span>
                        </div>
                      </div>
                      <p className="text-[13px] text-[#5e7a5e] leading-relaxed">{alternative.reason}</p>
                      <div className="mt-3 flex items-center gap-2">
                        <div className="h-[6px] flex-1 rounded-full bg-[#2d8a4e]/10 overflow-hidden">
                          <motion.div className="h-full rounded-full bg-[#2d8a4e]" initial={{ width: 0 }} animate={{ width: `${alternative.score}%` }} transition={{ duration: 0.8 }} />
                        </div>
                        <span className="text-[12px] text-[#2d8a4e] font-semibold">
                          +{alternative.score - product.ecoScore} pts better
                        </span>
                      </div>
                    </div>
                    <button onClick={suggestAlternative} className="text-[13px] text-[#2d8a4e] font-medium hover:underline flex items-center gap-1">
                      <RotateCcw className="w-3 h-3" /> Try another suggestion
                    </button>
                  </motion.div>
                ) : null}
              </div>
            </div>

            {/* ── Data quality notice ── */}
            <div className="flex items-start gap-2 px-4 py-3 rounded-[12px] bg-[#2d8a4e]/4 border border-[#2d8a4e]/8">
              <Info className="w-4 h-4 text-[#2d8a4e] shrink-0 mt-0.5" />
              <div>
                <p className="text-[12px] text-[#5e7a5e] leading-relaxed">
                  All data sourced from <span className="font-semibold text-[#2d8a4e]">OpenFoodFacts</span>, a free, open-source database maintained by volunteers worldwide.
                  {product.lastModified && <> Last updated: {product.lastModified}.</>}
                  {product.stores.length > 0 && <> Available at: {product.stores.slice(0, 3).join(', ')}.</>}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ Scan History ═══ */}
      {scanHistory.length > 0 && (
        <>
          <LeafDivider />
          <div>
            <SectionHeader>Recent Scans</SectionHeader>
            <div className="card-surface overflow-hidden">
              <CardLeaves variant="b" />
              {scanHistory.map((entry, i) => (
                <button
                  key={entry.product.barcode + i}
                  onClick={() => {
                    setBarcode(entry.product.barcode);
                    setProduct(entry.product);
                    setShowAlternative(false);
                    setError('');
                    setExpandedSections({ ingredients: false, nutrition: false, packaging: false, environmental: false, certifications: false });
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 relative z-10 text-left hover:bg-[#2d8a4e]/3 transition-all ${
                    i < scanHistory.length - 1 ? 'border-b border-[#2d8a4e]/5' : ''
                  }`}
                >
                  <div className="w-10 h-10 rounded-[12px] flex items-center justify-center text-white font-bold text-[14px] tabular-nums"
                    style={{ backgroundColor: scoreColor(entry.product.ecoScore) }}
                  >
                    {entry.product.ecoScore}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-medium text-[#1a2e1a] truncate">{entry.product.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Clock className="w-3 h-3 text-[#5e7a5e]/40" />
                      <span className="text-[12px] text-[#5e7a5e]">{entry.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <span className="text-[11px] text-[#5e7a5e]/60">- {entry.product.brand}</span>
                      {entry.product.nutriScore !== 'unknown' && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded font-bold text-white uppercase" style={{ backgroundColor: NUTRI_COLORS[entry.product.nutriScore.toLowerCase()] || '#999' }}>
                          {entry.product.nutriScore}
                        </span>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#c8dfc8] shrink-0" />
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* ═══ How It Works (no product) ═══ */}
      {!product && !loading && !error && (
        <>
          <LeafDivider />
          <div>
            <SectionHeader>How it works</SectionHeader>
            <div className="lg:grid lg:grid-cols-3 gap-3 space-y-3 lg:space-y-0">
              {[
                { step: '1', title: 'Scan or Enter', desc: 'Use your camera to scan a barcode or type it in. Works with any packaged food product worldwide.', icon: <Camera className="w-5 h-5" /> },
                { step: '2', title: 'Real Data Analysis', desc: 'We fetch real Nutri-Score, Eco-Score, NOVA group, ingredients, allergens, and packaging data from OpenFoodFacts.', icon: <Leaf className="w-5 h-5" /> },
                { step: '3', title: 'Make Better Choices', desc: 'Compare environmental impact, check nutrition quality, and discover greener alternatives.', icon: <Sparkles className="w-5 h-5" /> },
              ].map((item, i) => (
                <div key={item.step} className="card-surface-sm p-4 relative">
                  <CardLeaves variant={(['a', 'b', 'c'] as const)[i]} />
                  <div className="relative z-10 flex items-start gap-3">
                    <div className="w-10 h-10 rounded-[12px] bg-gradient-to-br from-[#2d8a4e] to-[#5cb85c] flex items-center justify-center text-white shrink-0">
                      {item.icon}
                    </div>
                    <div>
                      <p className="text-[15px] font-semibold text-[#1a2e1a]">{item.title}</p>
                      <p className="text-[12px] text-[#5e7a5e] mt-0.5 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* What data we show */}
          <div>
            <SectionHeader>What you get for each product</SectionHeader>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                { icon: <Star className="w-4 h-4" />, title: 'Eco-Score', desc: 'A-E environmental grade' },
                { icon: <Heart className="w-4 h-4" />, title: 'Nutri-Score', desc: 'A-E nutrition grade' },
                { icon: <Zap className="w-4 h-4" />, title: 'NOVA Group', desc: 'Processing level (1-4)' },
                { icon: <Wheat className="w-4 h-4" />, title: 'Ingredients', desc: 'Full list + additives' },
                { icon: <Package className="w-4 h-4" />, title: 'Packaging', desc: 'Materials & recyclability' },
                { icon: <Globe className="w-4 h-4" />, title: 'Origins', desc: 'Where it\'s made & sold' },
              ].map(item => (
                <div key={item.title} className="card-surface-sm p-3 relative">
                  <div className="relative z-10 flex items-start gap-2.5">
                    <div className="w-8 h-8 rounded-[8px] bg-[#2d8a4e]/8 flex items-center justify-center text-[#2d8a4e] shrink-0">
                      {item.icon}
                    </div>
                    <div>
                      <p className="text-[13px] font-semibold text-[#1a2e1a]">{item.title}</p>
                      <p className="text-[11px] text-[#5e7a5e]">{item.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
      {/* ═══ Scan Rate Limit Notice ═══ */}
      <AnimatePresence>
        {scanNotice && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="fixed top-20 left-4 right-4 z-[90] max-w-[430px] mx-auto p-3 rounded-[12px] bg-[#ff9f0a]/10 border border-[#ff9f0a]/20 text-[13px] text-[#ff9f0a] font-medium text-center shadow-lg backdrop-blur-sm">
            {scanNotice}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ Purchase Confirmation Prompt ═══ */}
      {showPurchasePrompt && lastScannedProduct && (
        <PurchasePrompt
          product={lastScannedProduct}
          onDismiss={() => setScanNotice(null)}
          onPurchaseConfirmed={(iqDelta) => setPurchaseIqGain(iqDelta)}
        />
      )}

      {/* ═══ Purchase IQ Gain Toast ═══ */}
      <AnimatePresence>
        {purchaseIqGain > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            onAnimationComplete={() => setTimeout(() => setPurchaseIqGain(0), 3000)}
            className="fixed bottom-24 left-4 right-4 z-[90] max-w-[430px] mx-auto p-3 rounded-[12px] bg-[#30d158]/10 border border-[#30d158]/20 text-center shadow-lg backdrop-blur-sm">
            <span className="text-[14px] text-[#30d158] font-semibold">🌿 +{purchaseIqGain.toFixed(1)} IQ from sustainable purchase!</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ═══ Collapsible Section Component ═══ */
function CollapsibleSection({ title, icon, expanded, onToggle, badge, badgeColor, variant, children }: {
  title: string;
  icon: React.ReactNode;
  expanded: boolean;
  onToggle: () => void;
  badge?: string;
  badgeColor?: 'green' | 'yellow' | 'red';
  variant: 'a' | 'b' | 'c' | 'd';
  children: React.ReactNode;
}) {
  const colors = { green: 'bg-[#2d8a4e]/10 text-[#2d8a4e]', yellow: 'bg-[#c9a015]/10 text-[#c9a015]', red: 'bg-[#d94f4f]/10 text-[#d94f4f]' };
  return (
    <div className="card-surface overflow-hidden relative">
      <CardLeaves variant={variant} />
      <button onClick={onToggle} className="w-full flex items-center gap-3 p-4 relative z-10 hover:bg-[#2d8a4e]/2 transition-all">
        <div className="w-9 h-9 rounded-[10px] bg-[#2d8a4e]/8 flex items-center justify-center text-[#2d8a4e]">
          {icon}
        </div>
        <span className="text-[15px] font-semibold text-[#1a2e1a] flex-1 text-left">{title}</span>
        {badge && (
          <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${badgeColor ? colors[badgeColor] : 'bg-[#1a2e1a]/5 text-[#5e7a5e]'}`}>
            {badge}
          </span>
        )}
        {expanded ? <ChevronUp className="w-4 h-4 text-[#5e7a5e]" /> : <ChevronDown className="w-4 h-4 text-[#5e7a5e]" />}
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="px-4 pb-4 relative z-10 border-t border-[#2d8a4e]/5 pt-3">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══ EcoScore Circular Gauge ═══ */
function EcoScoreGauge({ score, grade }: { score: number; grade: string }) {
  const radius = 60;
  const stroke = 10;
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const color = score > 70 ? '#2d8a4e' : score >= 40 ? '#c9a015' : '#d94f4f';
  const label = score > 70 ? 'Excellent' : score >= 40 ? 'Moderate' : 'Poor';

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <svg width={radius * 2} height={radius * 2} className="-rotate-90">
          <circle cx={radius} cy={radius} r={normalizedRadius} fill="none" stroke="#2d8a4e" strokeWidth={stroke} opacity={0.08} />
          <motion.circle
            cx={radius} cy={radius} r={normalizedRadius} fill="none"
            stroke={color} strokeWidth={stroke} strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference - (score / 100) * circumference }}
            transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span className="text-[32px] font-bold tabular-nums leading-none" style={{ color }}
            initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3, duration: 0.5 }}
          >
            {score}
          </motion.span>
          <span className="text-[11px] text-[#5e7a5e] mt-1">out of 100</span>
        </div>
      </div>
      <div className="flex items-center gap-1.5 mt-2">
        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
        <span className="text-[13px] font-semibold" style={{ color }}>{label}</span>
      </div>
      {grade !== 'unknown' && grade !== 'not-applicable' && (
        <span className="text-[11px] text-[#5e7a5e]">Grade: <span className="font-bold uppercase" style={{ color: ECO_GRADE_COLORS[grade.toLowerCase()] || '#5e7a5e' }}>{grade}</span></span>
      )}
    </div>
  );
}
