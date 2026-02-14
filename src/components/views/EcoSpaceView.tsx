'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, Search, Filter, Star, Heart, MessageCircle, Zap, Train, Bike, Bus,
  Leaf, ChevronDown, ChevronUp, X, Navigation, Clock, ThumbsUp, Send,
  Coffee, Utensils, Building2, TreePine, ShoppingBag, Sparkles, Route,
  ChevronRight, ArrowUpDown, Bookmark, Share2, Award, Map as MapIcon, Compass,
  Layers, TrendingUp, Globe, MapPinned, Flame, CloudSun, ExternalLink,
  BadgeCheck, Timer, Users, BarChart3, Car, Footprints, Trophy, Lightbulb,
  LocateFixed, ArrowRight, RefreshCw, History, Target, CircleDot
} from 'lucide-react';
import { CardLeaves, TinyLeaf, SectionHeader } from '@/components/ui/LeafDecorations';
import { BESCOM_EV_STATIONS, BESCOM_STATS, type BESCOMStation } from '@/data/bengaluru-ev-stations';

/* ─── Types ─── */
interface EcoPlace {
  id: string; name: string;
  category: 'Restaurant' | 'Café' | 'Co-Working' | 'Park' | 'Store' | 'Market';
  rating: number; tags: string[]; coords: [number, number]; address: string;
  image: string; hours: string; reviews: Review[]; upvotes: number; description: string;
}
interface Review { user: string; text: string; date: string; rating: number; }

/* ─── Real Namma Metro Stations ─── */
const METRO_STATIONS = [
  { id: 'mp01', name: 'Whitefield (Kadugodi)', coords: [12.99507, 77.75777] as [number, number], detail: 'Purple Line • Terminal', line: 'purple' },
  { id: 'mp02', name: 'Hopefarm Channasandra', coords: [12.9931, 77.7464] as [number, number], detail: 'Purple Line', line: 'purple' },
  { id: 'mp03', name: 'Kadugodi Tree Park', coords: [12.9892, 77.7345] as [number, number], detail: 'Purple Line', line: 'purple' },
  { id: 'mp14', name: 'Baiyappanahalli', coords: [12.9907, 77.6417] as [number, number], detail: 'Purple Line', line: 'purple' },
  { id: 'mp16', name: 'Indiranagar', coords: [12.9784, 77.6386] as [number, number], detail: 'Purple Line', line: 'purple' },
  { id: 'mp19', name: 'MG Road', coords: [12.9755, 77.6068] as [number, number], detail: 'Purple Line', line: 'purple' },
  { id: 'mp23', name: 'Kempegowda Majestic', coords: [12.9757, 77.5728] as [number, number], detail: 'Purple + Green Interchange', line: 'interchange' },
  { id: 'mp37', name: 'Challaghatta', coords: [12.89742, 77.46124] as [number, number], detail: 'Purple Line • Terminal', line: 'purple' },
  { id: 'mg01', name: 'Madavara (BIEC)', coords: [13.05739, 77.47140] as [number, number], detail: 'Green Line • Terminal', line: 'green' },
  { id: 'mg10', name: 'Yeshwanthpur', coords: [13.0230, 77.5500] as [number, number], detail: 'Green Line', line: 'green' },
  { id: 'mg23', name: 'RV Road', coords: [12.9220, 77.5800] as [number, number], detail: 'Green + Yellow Interchange', line: 'interchange' },
  { id: 'mg31', name: 'Silk Institute', coords: [12.86186, 77.53001] as [number, number], detail: 'Green Line • Terminal', line: 'green' },
];

const BUS_STOPS = [
  { id: 'b01', name: 'Kempegowda Bus Station (Majestic)', coords: [12.9767, 77.5713] as [number, number], detail: 'BMTC Main Hub • 200+ routes' },
  { id: 'b02', name: 'Shanthinagar TTMC', coords: [12.9560, 77.5950] as [number, number], detail: 'BMTC Hub' },
  { id: 'b04', name: 'Central Silk Board', coords: [12.9176, 77.6226] as [number, number], detail: 'Major Junction • 356C, 500C' },
  { id: 'b06', name: 'Electronic City (Wipro Gate)', coords: [12.8500, 77.6660] as [number, number], detail: 'IT Hub • 356C, KIA-8' },
  { id: 'b17', name: 'Hebbal Flyover', coords: [13.0358, 77.5970] as [number, number], detail: 'Northern Hub • KIA routes' },
];

const CYCLE_STATIONS = [
  { id: 'c01', name: 'Yulu Zone - Cubbon Park', detail: 'Yulu Miracle • 25 e-bikes • ₹10/30min' },
  { id: 'c02', name: 'Yulu Zone - Indiranagar', detail: 'Yulu Miracle • 20 e-bikes • ₹10/30min' },
  { id: 'c03', name: 'Yulu Zone - HSR Layout', detail: 'Yulu Miracle • 15 e-bikes • ₹10/30min' },
  { id: 'c04', name: 'Yulu Zone - Koramangala', detail: 'Yulu Miracle • 18 e-bikes • ₹10/30min' },
  { id: 'c05', name: 'Yulu Zone - MG Road', detail: 'Yulu Miracle • 30 e-bikes • ₹10/30min' },
  { id: 'c06', name: 'Yulu Zone - Lalbagh', detail: 'Yulu Miracle • 12 e-bikes • ₹10/30min' },
  { id: 'c07', name: 'Bounce Station - Marathahalli', detail: 'Bounce • 10 cycles • ₹5/15min' },
  { id: 'c08', name: 'Bounce Station - Whitefield', detail: 'Bounce • 12 cycles • ₹5/15min' },
  { id: 'c09', name: 'Pedl Station - Jayanagar', detail: 'Pedl (Zoomcar) • 8 cycles • ₹5/30min' },
  { id: 'c10', name: 'Trin Trin - Mysore Road', detail: 'Trin Trin PBS • 15 cycles • ₹5/30min' },
];

/* ─── Bengaluru Eco Places ─── */
const ECO_PLACES: EcoPlace[] = [
  { id: 'p1', name: 'GreenLeaf Café', category: 'Café', rating: 88, tags: ['Vegan Menu', 'Solar Powered', 'Compost Waste', 'Organic Coffee'], coords: [12.9716, 77.5946], address: 'MG Road, Bengaluru', image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&h=300&fit=crop', hours: '7:00 AM – 10:00 PM', description: 'Farm-to-table café with 100% organic menu and solar-powered kitchen.', upvotes: 234, reviews: [{ user: 'Priya S.', text: 'Love their zero-waste policy! Amazing organic coffee.', date: '2026-02-10', rating: 5 }, { user: 'Rahul K.', text: 'Best sustainable café in Bengaluru.', date: '2026-02-08', rating: 5 }] },
  { id: 'p2', name: 'The Bamboo Space', category: 'Co-Working', rating: 92, tags: ['Recycled Furniture', 'Paperless Billing', 'Rainwater Harvesting', 'Green Roof'], coords: [12.9750, 77.5980], address: 'Indiranagar, Bengaluru', image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop', hours: '6:00 AM – 11:00 PM', description: 'Co-working space built entirely from reclaimed and sustainable materials.', upvotes: 189, reviews: [{ user: 'Ananya M.', text: 'Paperless, green, and super productive workspace!', date: '2026-02-12', rating: 5 }] },
  { id: 'p3', name: 'Terra Kitchen', category: 'Restaurant', rating: 85, tags: ['Locally Sourced', 'Zero Plastic', 'Organic Produce'], coords: [12.9352, 77.6245], address: 'Koramangala, Bengaluru', image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop', hours: '11:00 AM – 11:00 PM', description: 'Farm-fresh restaurant serving locally sourced meals with zero plastic.', upvotes: 312, reviews: [{ user: 'Vikram D.', text: 'Banana-leaf meals are a game changer!', date: '2026-02-11', rating: 5 }, { user: 'Sneha R.', text: 'Love the commitment to local farmers.', date: '2026-02-09', rating: 4 }] },
  { id: 'p4', name: 'Cubbon Park', category: 'Park', rating: 95, tags: ['Urban Forest', 'Heritage Trees', 'Free Entry', 'Walking Trails'], coords: [12.9763, 77.5929], address: 'Cubbon Park, Bengaluru', image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop', hours: '6:00 AM – 6:00 PM', description: '300-acre green lung with 6000+ trees and heritage walking trails.', upvotes: 567, reviews: [{ user: 'Meera J.', text: 'Best morning walk spot. Incredible air quality.', date: '2026-02-13', rating: 5 }] },
  { id: 'p5', name: 'EcoMart Organic Store', category: 'Store', rating: 78, tags: ['Package-Free', 'Local Products', 'Refill Station'], coords: [12.9698, 77.7500], address: 'Whitefield, Bengaluru', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=300&fit=crop', hours: '9:00 AM – 9:00 PM', description: 'Zero-waste grocery with refill stations and locally sourced produce.', upvotes: 145, reviews: [{ user: 'Kavya P.', text: 'Shop guilt-free! Bring your own containers.', date: '2026-02-07', rating: 4 }] },
  { id: 'p6', name: 'Lalbagh Botanical Garden', category: 'Park', rating: 96, tags: ['Botanical Heritage', 'Lake', 'Glass House', 'Rare Species'], coords: [12.9507, 77.5848], address: 'Lalbagh, Bengaluru', image: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=400&h=300&fit=crop', hours: '6:00 AM – 7:00 PM', description: '240-acre botanical garden with 1000+ plant species.', upvotes: 678, reviews: [{ user: 'Arjun T.', text: 'A biodiversity treasure in the heart of the city.', date: '2026-02-12', rating: 5 }] },
  { id: 'p7', name: 'Green Theory Restro', category: 'Restaurant', rating: 82, tags: ['Plant-Based Menu', 'Solar Water Heater', 'Eco Packaging'], coords: [12.9610, 77.6387], address: 'HSR Layout, Bengaluru', image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=300&fit=crop', hours: '12:00 PM – 11:30 PM', description: 'Trendy plant-based restaurant with solar-powered kitchen.', upvotes: 198, reviews: [{ user: 'Nikhil B.', text: 'Jackfruit biryani is insane. Fully plant-based!', date: '2026-02-10', rating: 4 }] },
  { id: 'p8', name: 'Sunday Soul Sante Market', category: 'Market', rating: 80, tags: ['Handmade Goods', 'Local Artisans', 'Sustainable Fashion'], coords: [12.9850, 77.5533], address: 'Palace Grounds, Bengaluru', image: 'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?w=400&h=300&fit=crop', hours: '10:00 AM – 10:00 PM (Sundays)', description: 'Weekly artisan market with sustainable fashion and upcycled goods.', upvotes: 423, reviews: [{ user: 'Aditi K.', text: 'Amazing handcrafted products!', date: '2026-02-09', rating: 5 }] },
  { id: 'p9', name: 'Brew & Bloom Café', category: 'Café', rating: 76, tags: ['Organic Tea', 'Indoor Plants', 'Biodegradable Cups'], coords: [12.9200, 77.6500], address: 'JP Nagar, Bengaluru', image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=300&fit=crop', hours: '8:00 AM – 9:00 PM', description: 'Cozy plant-filled café serving organic brews.', upvotes: 132, reviews: [{ user: 'Sanya L.', text: 'Feels like a greenhouse café!', date: '2026-02-11', rating: 4 }] },
  { id: 'p10', name: 'EcoHub Co-Work', category: 'Co-Working', rating: 87, tags: ['Solar Panels', 'EV Parking', 'Green Certified'], coords: [12.9560, 77.7010], address: 'Marathahalli, Bengaluru', image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&h=300&fit=crop', hours: '24/7', description: 'LEED-certified co-working with rooftop solar and EV charging.', upvotes: 210, reviews: [{ user: 'Karthik R.', text: '24/7 green workspace with EV charging!', date: '2026-02-13', rating: 5 }] },
];

const CATEGORIES = ['All', 'Restaurant', 'Café', 'Co-Working', 'Park', 'Store', 'Market'] as const;
const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  'Restaurant': <Utensils className="w-4 h-4" />, 'Café': <Coffee className="w-4 h-4" />,
  'Co-Working': <Building2 className="w-4 h-4" />, 'Park': <TreePine className="w-4 h-4" />,
  'Store': <ShoppingBag className="w-4 h-4" />, 'Market': <ShoppingBag className="w-4 h-4" />,
};

function getScoreColor(score: number) {
  if (score >= 70) return { bg: 'bg-[#2d8a4e]/10', text: 'text-[#2d8a4e]', ring: 'ring-[#2d8a4e]/20', fill: '#2d8a4e' };
  if (score >= 40) return { bg: 'bg-amber-500/10', text: 'text-amber-600', ring: 'ring-amber-500/20', fill: '#d97706' };
  return { bg: 'bg-red-500/10', text: 'text-red-600', ring: 'ring-red-500/20', fill: '#dc2626' };
}
function getScoreLabel(score: number) {
  if (score >= 90) return 'Excellent'; if (score >= 70) return 'Great';
  if (score >= 40) return 'Moderate'; return 'Needs Work';
}

function EcoGauge({ score, size = 64 }: { score: number; size?: number }) {
  const color = getScoreColor(score);
  const r = (size - 8) / 2; const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e8f5e8" strokeWidth={5} />
        <motion.circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color.fill} strokeWidth={5} strokeLinecap="round"
          strokeDasharray={circ} initial={{ strokeDashoffset: circ }} animate={{ strokeDashoffset: offset }} transition={{ duration: 1.2, ease: 'easeOut' }} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`font-bold ${color.text}`} style={{ fontSize: size > 50 ? 16 : 12 }}>{score}</span>
      </div>
    </div>
  );
}

/* ─── Real-time Suggestion Sources ─── */
interface SuggestionSource {
  name: string; icon: React.ReactNode; color: string; type: string;
}
const SOURCES: SuggestionSource[] = [
  { name: 'Google Maps', icon: <Globe className="w-3.5 h-3.5" />, color: '#4285f4', type: 'maps' },
  { name: 'Zomato', icon: <Flame className="w-3.5 h-3.5" />, color: '#e23744', type: 'food' },
  { name: 'OpenWeather', icon: <CloudSun className="w-3.5 h-3.5" />, color: '#f59e0b', type: 'weather' },
  { name: 'BESCOM', icon: <Zap className="w-3.5 h-3.5" />, color: '#2563eb', type: 'ev' },
  { name: 'BMTC', icon: <Bus className="w-3.5 h-3.5" />, color: '#14b8a6', type: 'transit' },
  { name: 'Namma Metro', icon: <Train className="w-3.5 h-3.5" />, color: '#7c3aed', type: 'transit' },
];

interface RealTimeSuggestion {
  id: string; title: string; description: string; category: string;
  sources: string[]; urgency: 'hot' | 'trending' | 'new' | 'seasonal';
  ecoScore: number; actionLabel: string; actionUrl?: string;
  icon: string; area: string; timeContext: string;
}

const REALTIME_SUGGESTIONS: RealTimeSuggestion[] = [
  {
    id: 'rt1', title: 'Cubbon Park Morning Walk', description: 'AQI is 42 (Good) right now. Perfect for a morning walk among 6000+ heritage trees. Grab a Yulu e-bike from Cubbon Park zone.',
    category: 'Activity', sources: ['OpenWeather', 'Google Maps', 'Namma Metro'], urgency: 'hot', ecoScore: 98,
    actionLabel: 'Navigate', icon: '🌳', area: 'Central Bengaluru', timeContext: 'Best: 6-9 AM',
  },
  {
    id: 'rt2', title: 'Terra Kitchen - Zero Waste Lunch', description: 'Trending on Zomato for banana-leaf meals. 312 upvotes from eco community. Take bus G-3 from Silk Board or auto from Koramangala.',
    category: 'Food', sources: ['Zomato', 'Google Maps', 'BMTC'], urgency: 'trending', ecoScore: 85,
    actionLabel: 'View Menu', icon: '🍽️', area: 'Koramangala', timeContext: '11 AM - 11 PM',
  },
  {
    id: 'rt3', title: 'BESCOM EV Charging - Indiranagar', description: '4 chargers available including DC fast (CCS/CHAdeMO). 2 slots likely free based on usage patterns. Nearest metro: Indiranagar (Purple Line).',
    category: 'EV Charging', sources: ['BESCOM', 'Namma Metro', 'Google Maps'], urgency: 'new', ecoScore: 95,
    actionLabel: 'Get Directions', icon: '⚡', area: 'Indiranagar', timeContext: '24/7 Available',
  },
  {
    id: 'rt4', title: 'Lalbagh Flower Show Season', description: 'Annual Republic Day flower show still on display. 1000+ species, stunning glass house. Green Line Lalbagh Metro station is 200m away.',
    category: 'Activity', sources: ['Google Maps', 'Namma Metro', 'OpenWeather'], urgency: 'seasonal', ecoScore: 96,
    actionLabel: 'Plan Visit', icon: '🌺', area: 'Lalbagh', timeContext: '6 AM - 7 PM',
  },
  {
    id: 'rt5', title: 'GreenLeaf Café - Organic Brunch', description: 'Solar-powered café on MG Road. Featured in "Sustainable Bengaluru" list. Purple Line MG Road Metro is a 2-min walk.',
    category: 'Food', sources: ['Zomato', 'Google Maps', 'Namma Metro'], urgency: 'trending', ecoScore: 88,
    actionLabel: 'Reserve Table', icon: '☕', area: 'MG Road', timeContext: '7 AM - 10 PM',
  },
  {
    id: 'rt6', title: 'Yulu E-bikes - Koramangala Zone', description: '18 e-bikes available right now. ₹10/30min. Perfect for last-mile connectivity from Silk Board metro (under construction).',
    category: 'Micro-Mobility', sources: ['Google Maps', 'BMTC'], urgency: 'hot', ecoScore: 92,
    actionLabel: 'Book Yulu', icon: '🚲', area: 'Koramangala', timeContext: 'Available Now',
  },
  {
    id: 'rt7', title: 'Sunday Soul Sante This Weekend', description: 'Bengaluru\'s biggest eco-market at Palace Grounds. Sustainable fashion, upcycled goods, local artisans. Take Vajra V-500C from Majestic.',
    category: 'Market', sources: ['Google Maps', 'BMTC'], urgency: 'seasonal', ecoScore: 80,
    actionLabel: 'View Details', icon: '🎨', area: 'Palace Grounds', timeContext: 'Sunday 10 AM - 10 PM',
  },
  {
    id: 'rt8', title: 'BESCOM HSR - 6 Chargers Available', description: 'HSR Layout station has GB/T, CCS, and 10kW chargers. Highest capacity station in South-East. Near HSR BDA Complex bus stop.',
    category: 'EV Charging', sources: ['BESCOM', 'BMTC', 'Google Maps'], urgency: 'new', ecoScore: 90,
    actionLabel: 'Navigate', icon: '🔋', area: 'HSR Layout', timeContext: '24/7 Available',
  },
  {
    id: 'rt9', title: 'The Bamboo Space Co-Working', description: 'Highest eco-rated workspace (92/100). Recycled furniture, rainwater harvesting, green roof. Walk from Indiranagar Metro.',
    category: 'Co-Working', sources: ['Google Maps', 'Namma Metro'], urgency: 'trending', ecoScore: 92,
    actionLabel: 'Book Desk', icon: '💻', area: 'Indiranagar', timeContext: '6 AM - 11 PM',
  },
  {
    id: 'rt10', title: 'BMTC Electric Bus Route 335E', description: 'New electric bus on Majestic-Whitefield route. Zero emissions, USB charging on board. Covers entire Purple Line corridor on road.',
    category: 'Transit', sources: ['BMTC', 'Google Maps'], urgency: 'new', ecoScore: 94,
    actionLabel: 'Track Bus', icon: '🚌', area: 'City-wide', timeContext: '5:30 AM - 11 PM',
  },
];

const URGENCY_STYLES: Record<string, { label: string; bg: string; text: string; }> = {
  hot: { label: 'HOT NOW', bg: 'bg-red-500/10', text: 'text-red-500' },
  trending: { label: 'TRENDING', bg: 'bg-orange-500/10', text: 'text-orange-500' },
  new: { label: 'NEW', bg: 'bg-blue-500/10', text: 'text-blue-500' },
  seasonal: { label: 'SEASONAL', bg: 'bg-purple-500/10', text: 'text-purple-500' },
};

/* ══════════════════════════════════════════════════════════════
   REAL-TIME SUGGESTIONS TAB (Explore Eco Places - No Map)
   ══════════════════════════════════════════════════════════════ */
function RealTimeSuggestionsSection({ suggestions, onSelectPlace, places }: {
  suggestions: RealTimeSuggestion[];
  onSelectPlace: (p: EcoPlace) => void;
  places: EcoPlace[];
}) {
  const [filterCategory, setFilterCategory] = useState('All');
  const categories = ['All', 'Food', 'Activity', 'EV Charging', 'Micro-Mobility', 'Market', 'Co-Working', 'Transit'];

  const filtered = filterCategory === 'All' ? suggestions : suggestions.filter(s => s.category === filterCategory);

  return (
    <div className="space-y-4">
      {/* Header + Source Badges */}
      <div className="card-surface p-4 relative">
        <CardLeaves variant="c" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-[10px] bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-[15px] font-bold text-[#1a2e1a]">Real-Time Eco Suggestions</h3>
              <p className="text-[11px] text-[#5e7a5e]">Powered by multiple live sources</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {SOURCES.map(s => (
              <span key={s.name} className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium border"
                style={{ borderColor: `${s.color}30`, color: s.color, background: `${s.color}08` }}>
                {s.icon} {s.name}
              </span>
            ))}
          </div>
          <div className="flex gap-1.5 overflow-x-auto scrollbar-thin pb-1">
            {categories.map(c => (
              <button key={c} onClick={() => setFilterCategory(c)}
                className={`px-3 py-1.5 rounded-full text-[11px] font-medium whitespace-nowrap transition-all ${filterCategory === c ? 'bg-[#2d8a4e] text-white' : 'bg-[#e8f5e8] text-[#5e7a5e] hover:bg-[#d4edd4]'}`}>
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Suggestion Cards */}
      <div className="space-y-3">
        {filtered.map((s, i) => {
          const urgStyle = URGENCY_STYLES[s.urgency];
          const matchingPlace = places.find(p => s.title.toLowerCase().includes(p.name.toLowerCase().split(' ')[0]));
          return (
            <motion.div key={s.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="card-surface-sm p-4 relative cursor-pointer hover:shadow-md transition-all group"
              onClick={() => matchingPlace && onSelectPlace(matchingPlace)}>
              <CardLeaves variant={i % 2 === 0 ? 'a' : 'b'} />
              <div className="relative z-10">
                <div className="flex items-start gap-3">
                  <div className="text-2xl flex-shrink-0 mt-0.5">{s.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${urgStyle.bg} ${urgStyle.text}`}>{urgStyle.label}</span>
                      <span className="text-[10px] text-[#5e7a5e]/60">{s.area}</span>
                      <span className="text-[10px] text-[#5e7a5e]/40">•</span>
                      <span className="text-[10px] text-[#5e7a5e]/60 flex items-center gap-0.5"><Timer className="w-3 h-3" />{s.timeContext}</span>
                    </div>
                    <h4 className="text-[14px] font-semibold text-[#1a2e1a] group-hover:text-[#2d8a4e] transition-colors">{s.title}</h4>
                    <p className="text-[12px] text-[#5e7a5e] mt-1 leading-relaxed">{s.description}</p>

                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      {s.sources.map(src => {
                        const srcData = SOURCES.find(ss => ss.name === src);
                        return srcData ? (
                          <span key={src} className="inline-flex items-center gap-0.5 text-[9px] font-medium px-1.5 py-0.5 rounded"
                            style={{ color: srcData.color, background: `${srcData.color}10` }}>
                            {srcData.icon} {src}
                          </span>
                        ) : null;
                      })}
                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-1 flex-shrink-0">
                    <EcoGauge score={s.ecoScore} size={44} />
                    <span className="text-[9px] text-[#5e7a5e]">Eco Score</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-3">
                  <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-[10px] bg-[#2d8a4e] text-white text-[12px] font-semibold hover:bg-[#246e3f] transition-colors">
                    <Navigation className="w-3.5 h-3.5" /> {s.actionLabel}
                  </button>
                  <button className="px-3 py-2 rounded-[10px] bg-[#e8f5e8] text-[#2d8a4e] hover:bg-[#d4edd4] transition-colors">
                    <Share2 className="w-3.5 h-3.5" />
                  </button>
                  <button className="px-3 py-2 rounded-[10px] bg-[#e8f5e8] text-[#2d8a4e] hover:bg-[#d4edd4] transition-colors">
                    <Bookmark className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   GOOGLE MAPS TRANSIT TAB
   ═══════════════════════════════════════════════ */
type TransitLayer = 'metro' | 'bus' | 'ev' | 'bike';

const GMAP_QUERIES: Record<TransitLayer, string> = {
  metro: 'Namma+Metro+stations+Bengaluru',
  bus: 'BMTC+bus+stops+Bengaluru',
  ev: 'EV+charging+stations+Bengaluru+BESCOM',
  bike: 'Yulu+bike+rental+Bengaluru',
};

function TransitMapTab() {
  const [activeLayer, setActiveLayer] = useState<TransitLayer>('metro');
  const [selectedStation, setSelectedStation] = useState<BESCOMStation | null>(null);
  const [evFilter, setEvFilter] = useState<string>('all');
  const [showStationList, setShowStationList] = useState(false);

  const filteredEv = useMemo(() => {
    if (evFilter === 'all') return BESCOM_EV_STATIONS;
    return BESCOM_EV_STATIONS.filter(s => s.types.some(t => t.includes(evFilter)));
  }, [evFilter]);

  const googleMapSrc = useMemo(() => {
    const q = GMAP_QUERIES[activeLayer];
    return `https://maps.google.com/maps?q=${q}&t=m&z=12&ie=UTF8&iwloc=&output=embed`;
  }, [activeLayer]);

  const layers: { key: TransitLayer; icon: React.ReactNode; label: string; count: number; color: string; sub: string }[] = [
    { key: 'metro', icon: <Train className="w-4 h-4" />, label: 'Namma Metro', count: 68, color: '#7c3aed', sub: 'Purple + Green + Yellow Lines' },
    { key: 'bus', icon: <Bus className="w-4 h-4" />, label: 'BMTC Bus', count: 18, color: '#14b8a6', sub: 'TTMCs & Major Hubs' },
    { key: 'ev', icon: <Zap className="w-4 h-4" />, label: 'BESCOM EV', count: BESCOM_STATS.totalLocations, color: '#2563eb', sub: `${BESCOM_STATS.totalChargers} chargers across city` },
    { key: 'bike', icon: <Bike className="w-4 h-4" />, label: 'Cycle/Bike', count: CYCLE_STATIONS.length, color: '#f97316', sub: 'Yulu, Bounce, Pedl, Trin Trin' },
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* Layer Toggle Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {layers.map((l, i) => (
          <motion.button key={l.key} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            onClick={() => setActiveLayer(l.key)}
            className={`p-3 rounded-[14px] text-center transition-all border-2 ${activeLayer === l.key ? 'shadow-lg' : 'hover:border-[#2d8a4e]/20'}`}
            style={{
              background: activeLayer === l.key ? `${l.color}12` : 'rgba(232,245,232,0.5)',
              borderColor: activeLayer === l.key ? `${l.color}40` : 'transparent',
            }}>
            <div className="flex items-center justify-center gap-1.5 mb-1" style={{ color: l.color }}>{l.icon}<span className="text-[20px] font-bold">{l.count}</span></div>
            <p className="text-[12px] font-semibold" style={{ color: activeLayer === l.key ? l.color : '#1a2e1a' }}>{l.label}</p>
            <p className="text-[9px] text-[#5e7a5e]/60 mt-0.5">{l.sub}</p>
          </motion.button>
        ))}
      </div>

      {/* EV Filter Chips */}
      {activeLayer === 'ev' && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="flex flex-wrap gap-2 px-1">
          <span className="text-[11px] text-[#5e7a5e] font-semibold self-center mr-1">Filter:</span>
          {['all', 'CCS', 'GB/T', '10kW', '3.3kW'].map(f => (
            <button key={f} onClick={() => setEvFilter(f)}
              className={`px-3 py-1 rounded-full text-[11px] font-medium transition-all ${evFilter === f ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'bg-[#e8f5e8] text-[#5e7a5e] hover:bg-[#d4edd4]'}`}>
              {f === 'all' ? `All (${BESCOM_STATS.totalLocations})` : f === 'CCS' ? 'DC Fast (CCS/CHAdeMO)' : f === 'GB/T' ? 'AC Fast (GB/T)' : f === '10kW' ? 'AC 10kW' : 'Slow 3.3kW'}
            </button>
          ))}
        </motion.div>
      )}

      {/* Google Maps Embed */}
      <div className="relative rounded-[16px] overflow-hidden border border-[#2d8a4e]/15 shadow-lg" style={{ minHeight: 500 }}>
        <iframe
          src={googleMapSrc}
          className="w-full border-0"
          style={{ minHeight: 500 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title={`Bengaluru ${activeLayer} map`}
        />
        {/* Layer Badge Overlay */}
        <div className="absolute top-3 left-3 z-10 flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-[10px] px-3 py-2 shadow-md border border-[#2d8a4e]/10">
          {layers.find(l => l.key === activeLayer)?.icon}
          <span className="text-[12px] font-semibold text-[#1a2e1a]">{layers.find(l => l.key === activeLayer)?.label}</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium" style={{
            background: `${layers.find(l => l.key === activeLayer)?.color}15`,
            color: layers.find(l => l.key === activeLayer)?.color,
          }}>{layers.find(l => l.key === activeLayer)?.count} points</span>
        </div>
        {/* Open in Google Maps */}
        <a href={`https://www.google.com/maps/search/${GMAP_QUERIES[activeLayer]}`} target="_blank" rel="noopener noreferrer"
          className="absolute bottom-3 right-3 z-10 flex items-center gap-1.5 bg-white/90 backdrop-blur-sm rounded-[10px] px-3 py-2 shadow-md border border-[#2d8a4e]/10 text-[12px] font-medium text-[#2d8a4e] hover:bg-white transition-colors">
          <ExternalLink className="w-3.5 h-3.5" /> Open in Google Maps
        </a>
      </div>

      {/* Station Lists per Layer */}
      {activeLayer === 'metro' && (
        <div className="card-surface p-4 relative">
          <CardLeaves variant="b" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <Train className="w-5 h-5 text-purple-600" />
              <h3 className="text-[15px] font-bold text-[#1a2e1a]">Namma Metro Network</h3>
            </div>
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="card-inset p-3 rounded-[12px] text-center border-l-3" style={{ borderLeft: '3px solid #7c3aed' }}>
                <p className="text-[20px] font-bold text-purple-600">37</p>
                <p className="text-[11px] text-[#5e7a5e]">Purple Line</p>
                <p className="text-[9px] text-[#5e7a5e]/50">Challaghatta ↔ Whitefield</p>
              </div>
              <div className="card-inset p-3 rounded-[12px] text-center" style={{ borderLeft: '3px solid #16a34a' }}>
                <p className="text-[20px] font-bold text-green-600">31</p>
                <p className="text-[11px] text-[#5e7a5e]">Green Line</p>
                <p className="text-[9px] text-[#5e7a5e]/50">Silk Institute ↔ Madavara</p>
              </div>
              <div className="card-inset p-3 rounded-[12px] text-center" style={{ borderLeft: '3px solid #eab308' }}>
                <p className="text-[20px] font-bold text-yellow-600">~14</p>
                <p className="text-[11px] text-[#5e7a5e]">Yellow Line</p>
                <p className="text-[9px] text-[#5e7a5e]/50">RV Road ↔ Bommasandra</p>
              </div>
            </div>
            <div className="space-y-1.5">
              <p className="text-[11px] font-semibold text-[#5e7a5e]">Key Interchange Stations:</p>
              {[
                { name: 'Kempegowda Majestic', lines: ['Purple', 'Green'], color: '#dc2626' },
                { name: 'RV Road', lines: ['Green', 'Yellow'], color: '#dc2626' },
              ].map(s => (
                <div key={s.name} className="card-inset px-3 py-2 rounded-[10px] flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ background: s.color }} />
                  <span className="text-[12px] font-medium text-[#1a2e1a]">{s.name}</span>
                  <div className="flex gap-1 ml-auto">
                    {s.lines.map(l => (
                      <span key={l} className="text-[9px] px-1.5 py-0.5 rounded-full font-medium"
                        style={{
                          background: l === 'Purple' ? '#7c3aed15' : l === 'Green' ? '#16a34a15' : '#eab30815',
                          color: l === 'Purple' ? '#7c3aed' : l === 'Green' ? '#16a34a' : '#eab308',
                        }}>{l}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeLayer === 'bus' && (
        <div className="card-surface p-4 relative">
          <CardLeaves variant="a" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <Bus className="w-5 h-5 text-teal-600" />
              <h3 className="text-[15px] font-bold text-[#1a2e1a]">BMTC Bus Network</h3>
            </div>
            <div className="space-y-1.5">
              {BUS_STOPS.map(s => (
                <div key={s.id} className="card-inset px-3 py-2.5 rounded-[10px] flex items-center gap-3">
                  <span className="w-7 h-7 rounded-[8px] bg-teal-500 text-white flex items-center justify-center text-[11px] font-bold flex-shrink-0">B</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[12px] font-semibold text-[#1a2e1a] truncate">{s.name}</p>
                    <p className="text-[10px] text-[#5e7a5e]">{s.detail}</p>
                  </div>
                  <a href={`https://www.google.com/maps/search/${encodeURIComponent(s.name + ' Bengaluru')}`} target="_blank" rel="noopener noreferrer"
                    className="p-1.5 rounded-full bg-teal-50 text-teal-600 hover:bg-teal-100 flex-shrink-0">
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeLayer === 'ev' && (
        <>
          {/* BESCOM Network Summary */}
          <div className="card-surface p-5 relative">
            <CardLeaves variant="c" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-5 h-5 text-blue-500" />
                <h3 className="text-[15px] font-bold text-[#1a2e1a]">BESCOM EV Network</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 font-semibold ml-auto">{BESCOM_STATS.totalChargers} Chargers</span>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="card-inset p-3 rounded-[12px] text-center">
                  <p className="text-[22px] font-bold text-blue-600">{BESCOM_STATS.totalLocations}</p>
                  <p className="text-[11px] text-[#5e7a5e]">Locations</p>
                </div>
                <div className="card-inset p-3 rounded-[12px] text-center">
                  <p className="text-[22px] font-bold text-[#2d8a4e]">{BESCOM_STATS.totalChargers}</p>
                  <p className="text-[11px] text-[#5e7a5e]">Total Chargers</p>
                </div>
                <div className="card-inset p-3 rounded-[12px] text-center">
                  <p className="text-[22px] font-bold text-purple-600">5</p>
                  <p className="text-[11px] text-[#5e7a5e]">Charger Types</p>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-[11px] font-semibold text-[#5e7a5e]">Charger Type Guide:</p>
                {Object.entries(BESCOM_STATS.chargerTypes).map(([type, desc]) => (
                  <div key={type} className="card-inset px-3 py-2 rounded-[10px]">
                    <p className="text-[11px] font-semibold text-[#1a2e1a]">{type}</p>
                    <p className="text-[10px] text-[#5e7a5e]">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* EV Station List Toggle */}
          <button onClick={() => setShowStationList(!showStationList)}
            className="flex items-center justify-between w-full p-3 rounded-[12px] bg-blue-50 text-blue-700 text-[13px] font-semibold hover:bg-blue-100 transition-colors">
            <span className="flex items-center gap-2"><MapPinned className="w-4 h-4" /> View All {filteredEv.length} BESCOM Stations</span>
            {showStationList ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          <AnimatePresence>
            {showStationList && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                className="space-y-2 overflow-hidden">
                {filteredEv.map(s => (
                  <motion.div key={s.id} className={`card-surface-sm p-3 cursor-pointer transition-all hover:shadow-md ${selectedStation?.id === s.id ? 'ring-2 ring-blue-500/30' : ''}`}
                    onClick={() => setSelectedStation(selectedStation?.id === s.id ? null : s)}>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-[10px] bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center text-lg flex-shrink-0">⚡</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-semibold text-[#1a2e1a] truncate">{s.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-[#5e7a5e]">{s.location}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-600 font-medium">{s.totalChargers} charger{s.totalChargers > 1 ? 's' : ''}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#e8f5e8] text-[#2d8a4e] font-medium">{s.area}</span>
                        </div>
                      </div>
                      <a href={`https://www.google.com/maps/search/${encodeURIComponent(s.name + ' ' + s.location)}`} target="_blank" rel="noopener noreferrer"
                        className="p-1.5 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 flex-shrink-0"
                        onClick={e => e.stopPropagation()}>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>

                    <AnimatePresence>
                      {selectedStation?.id === s.id && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                          className="mt-3 pt-3 border-t border-[#2d8a4e]/10 overflow-hidden">
                          <div className="flex flex-wrap gap-1.5 mb-2">
                            {s.types.map(t => (
                              <span key={t} className="text-[10px] px-2.5 py-1 rounded-full bg-[#e8f5e8] text-[#2d8a4e] font-medium">{t}</span>
                            ))}
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 max-h-[160px] overflow-y-auto">
                            {s.chargers.map(c => (
                              <div key={c.code} className="card-inset px-2 py-1.5 rounded-[8px] flex items-center justify-between">
                                <span className="text-[9px] font-mono text-[#5e7a5e]">{c.code}</span>
                                <span className={`text-[8px] px-1.5 py-0.5 rounded font-medium ${c.model.includes('CCS') ? 'bg-red-50 text-red-600' : c.model.includes('GB/T') ? 'bg-amber-50 text-amber-600' : c.model.includes('10kW') ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-600'}`}>{c.model}</span>
                              </div>
                            ))}
                          </div>
                          <a href={`https://www.google.com/maps/dir/?api=1&destination=${s.coords[0]},${s.coords[1]}`} target="_blank" rel="noopener noreferrer"
                            className="mt-2 w-full flex items-center justify-center gap-2 py-2 rounded-[10px] bg-blue-600 text-white text-[12px] font-semibold hover:bg-blue-700 transition-colors">
                            <Navigation className="w-3.5 h-3.5" /> Get Directions
                          </a>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}

      {activeLayer === 'bike' && (
        <div className="card-surface p-4 relative">
          <CardLeaves variant="d" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <Bike className="w-5 h-5 text-orange-500" />
              <h3 className="text-[15px] font-bold text-[#1a2e1a]">Cycle & E-Bike Rental</h3>
            </div>
            <div className="space-y-1.5">
              {CYCLE_STATIONS.map(s => (
                <div key={s.id} className="card-inset px-3 py-2.5 rounded-[10px] flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm flex-shrink-0">🚲</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[12px] font-semibold text-[#1a2e1a] truncate">{s.name}</p>
                    <p className="text-[10px] text-[#5e7a5e]">{s.detail}</p>
                  </div>
                  <a href={`https://www.google.com/maps/search/${encodeURIComponent(s.name + ' Bengaluru')}`} target="_blank" rel="noopener noreferrer"
                    className="p-1.5 rounded-full bg-orange-50 text-orange-600 hover:bg-orange-100 flex-shrink-0">
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Sub-components ─── */
function PlaceCard({ place, isSelected, onSelect, onToggleFav, isFav }: { place: EcoPlace; isSelected: boolean; onSelect: () => void; onToggleFav: () => void; isFav: boolean; }) {
  return (
    <motion.div layout onClick={onSelect} className={`card-surface-sm p-4 cursor-pointer transition-all hover:shadow-md relative ${isSelected ? 'ring-2 ring-[#2d8a4e]/40 shadow-md' : ''}`} whileHover={{ y: -2 }}>
      <CardLeaves variant="a" />
      <div className="flex gap-3 relative z-10">
        <div className="w-[72px] h-[72px] rounded-[12px] overflow-hidden flex-shrink-0 bg-[#e8f5e8]">
          <img src={place.image} alt={place.name} className="w-full h-full object-cover" loading="lazy" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="text-[14px] font-semibold text-[#1a2e1a] truncate">{place.name}</h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[#5e7a5e]">{CATEGORY_ICONS[place.category]}</span>
                <span className="text-[12px] text-[#5e7a5e]">{place.category}</span>
                <span className="text-[10px] text-[#5e7a5e]/40">•</span>
                <span className="text-[11px] text-[#5e7a5e]">{place.address}</span>
              </div>
            </div>
            <EcoGauge score={place.rating} size={44} />
          </div>
          <div className="flex flex-wrap gap-1 mt-2">
            {place.tags.slice(0, 3).map(tag => <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-[#2d8a4e]/8 text-[#2d8a4e] font-medium">{tag}</span>)}
          </div>
          <div className="flex items-center gap-3 mt-2">
            <button onClick={(e) => { e.stopPropagation(); onToggleFav(); }} className={`flex items-center gap-1 text-[11px] transition-colors ${isFav ? 'text-red-500' : 'text-[#5e7a5e] hover:text-red-400'}`}>
              <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-red-500' : ''}`} /> {isFav ? 'Saved' : 'Save'}
            </button>
            <span className="flex items-center gap-1 text-[11px] text-[#5e7a5e]"><ThumbsUp className="w-3.5 h-3.5" /> {place.upvotes}</span>
            <span className="flex items-center gap-1 text-[11px] text-[#5e7a5e]"><MessageCircle className="w-3.5 h-3.5" /> {place.reviews.length}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function PlaceDetail({ place, onClose, onUpvote, onAddReview }: { place: EcoPlace; onClose: () => void; onUpvote: () => void; onAddReview: (text: string) => void; }) {
  const [reviewText, setReviewText] = useState('');
  const color = getScoreColor(place.rating);
  const nearestMetro = useMemo(() => {
    let best = { station: METRO_STATIONS[0], dist: Infinity };
    METRO_STATIONS.forEach(s => { const d = Math.sqrt(Math.pow(s.coords[0] - place.coords[0], 2) + Math.pow(s.coords[1] - place.coords[1], 2)); if (d < best.dist) best = { station: s, dist: d }; });
    return best;
  }, [place]);
  const nearestBus = useMemo(() => {
    let best = { stop: BUS_STOPS[0], dist: Infinity };
    BUS_STOPS.forEach(s => { const d = Math.sqrt(Math.pow(s.coords[0] - place.coords[0], 2) + Math.pow(s.coords[1] - place.coords[1], 2)); if (d < best.dist) best = { stop: s, dist: d }; });
    return best;
  }, [place]);
  const distKm = (d: number) => (d * 111).toFixed(1);

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="card-surface p-5 relative">
      <CardLeaves variant="b" />
      <button onClick={onClose} className="absolute top-4 right-4 z-20 p-1.5 rounded-full bg-[#1a2e1a]/5 hover:bg-[#1a2e1a]/10"><X className="w-4 h-4 text-[#5e7a5e]" /></button>
      <div className="w-full h-[180px] rounded-[14px] overflow-hidden mb-4 bg-[#e8f5e8] relative">
        <img src={place.image} alt={place.name} className="w-full h-full object-cover" loading="lazy" />
        <div className="absolute bottom-3 left-3"><span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${color.bg} ${color.text} backdrop-blur-sm`}>{getScoreLabel(place.rating)}</span></div>
      </div>
      <div className="flex items-start gap-3 mb-3 relative z-10">
        <div className="flex-1">
          <h2 className="text-[18px] font-bold text-[#1a2e1a]">{place.name}</h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[#5e7a5e]">{CATEGORY_ICONS[place.category]}</span>
            <span className="text-[13px] text-[#5e7a5e]">{place.category}</span>
            <MapPin className="w-3.5 h-3.5 text-[#5e7a5e]" />
            <span className="text-[12px] text-[#5e7a5e]">{place.address}</span>
          </div>
        </div>
        <EcoGauge score={place.rating} size={56} />
      </div>
      <p className="text-[13px] text-[#5e7a5e] leading-relaxed mb-3 relative z-10">{place.description}</p>
      <div className="flex items-center gap-2 mb-3 text-[12px] text-[#5e7a5e]"><Clock className="w-3.5 h-3.5" /> {place.hours}</div>
      <div className="card-inset p-3 rounded-[10px] mb-3 space-y-2">
        <p className="text-[11px] font-semibold text-[#1a2e1a] flex items-center gap-1.5"><Route className="w-3.5 h-3.5 text-[#2d8a4e]" /> Nearest Transit</p>
        <div className="flex items-center gap-2 text-[11px]">
          <span className="w-5 h-5 rounded bg-purple-100 text-purple-700 flex items-center justify-center text-[10px] font-bold">M</span>
          <span className="text-[#1a2e1a] font-medium">{nearestMetro.station.name}</span>
          <span className="text-[#5e7a5e]">~{distKm(nearestMetro.dist)} km</span>
        </div>
        <div className="flex items-center gap-2 text-[11px]">
          <span className="w-5 h-5 rounded bg-teal-100 text-teal-700 flex items-center justify-center text-[10px] font-bold">B</span>
          <span className="text-[#1a2e1a] font-medium">{nearestBus.stop.name}</span>
          <span className="text-[#5e7a5e]">~{distKm(nearestBus.dist)} km</span>
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5 mb-4">
        {place.tags.map(tag => <span key={tag} className="text-[11px] px-2.5 py-1 rounded-full bg-[#2d8a4e]/8 text-[#2d8a4e] font-medium flex items-center gap-1"><Leaf className="w-3 h-3" /> {tag}</span>)}
      </div>
      <div className="flex gap-2 mb-4">
        <button onClick={onUpvote} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-[12px] bg-[#2d8a4e] text-white text-[13px] font-semibold hover:bg-[#246e3f] transition-colors"><ThumbsUp className="w-4 h-4" /> Upvote ({place.upvotes})</button>
        <button className="px-4 py-2.5 rounded-[12px] bg-[#e8f5e8] text-[#2d8a4e] text-[13px] font-semibold hover:bg-[#d4edd4] transition-colors"><Share2 className="w-4 h-4" /></button>
        <a href={`https://www.google.com/maps/dir/?api=1&destination=${place.coords[0]},${place.coords[1]}`} target="_blank" rel="noopener noreferrer"
          className="px-4 py-2.5 rounded-[12px] bg-[#e8f5e8] text-[#2d8a4e] text-[13px] font-semibold hover:bg-[#d4edd4] transition-colors flex items-center">
          <Navigation className="w-4 h-4" />
        </a>
      </div>
      <div className="relative z-10">
        <h3 className="text-[14px] font-semibold text-[#1a2e1a] mb-2 flex items-center gap-2"><MessageCircle className="w-4 h-4 text-[#2d8a4e]" /> Reviews ({place.reviews.length})</h3>
        <div className="space-y-2 mb-3">
          {place.reviews.slice(0, 3).map((r, i) => (
            <div key={i} className="card-inset p-3 rounded-[10px]">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[12px] font-semibold text-[#1a2e1a]">{r.user}</span>
                <div className="flex">{Array.from({ length: r.rating }).map((_, j) => <Star key={j} className="w-3 h-3 fill-amber-400 text-amber-400" />)}</div>
              </div>
              <p className="text-[12px] text-[#5e7a5e]">{r.text}</p>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input type="text" value={reviewText} onChange={e => setReviewText(e.target.value)} placeholder="Write a review..."
            className="flex-1 text-[13px] px-3 py-2 rounded-[10px] bg-[#f0f7f0] border border-[#2d8a4e]/10 focus:border-[#2d8a4e]/30 focus:outline-none"
            onKeyDown={e => { if (e.key === 'Enter' && reviewText.trim()) { onAddReview(reviewText); setReviewText(''); } }} />
          <button onClick={() => { if (reviewText.trim()) { onAddReview(reviewText); setReviewText(''); } }}
            className="p-2 rounded-[10px] bg-[#2d8a4e] text-white hover:bg-[#246e3f]"><Send className="w-4 h-4" /></button>
        </div>
      </div>
    </motion.div>
  );
}

function EcoDayPlanner({ places }: { places: EcoPlace[] }) {
  const plan = useMemo(() => {
    const m = places.find(p => p.category === 'Café') || places[0]; const mid = places.find(p => p.category === 'Park') || places[1];
    const l = places.find(p => p.category === 'Restaurant') || places[2]; const a = places.find(p => p.category === 'Co-Working') || places[3];
    return [{ time: '8:00 AM', act: 'Morning brew', place: m, tr: 'Purple Line → MG Road Metro' }, { time: '10:00 AM', act: 'Nature walk', place: mid, tr: 'Yulu e-bike from Cubbon Park' }, { time: '12:30 PM', act: 'Eco lunch', place: l, tr: 'BMTC G-3 from Silk Board' }, { time: '2:00 PM', act: 'Work session', place: a, tr: 'Purple Line → Indiranagar Metro' }];
  }, [places]);
  return (
    <div className="card-surface-sm p-4 relative">
      <CardLeaves variant="d" />
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-3"><Route className="w-4 h-4 text-[#2d8a4e]" /><h4 className="text-[14px] font-semibold text-[#1a2e1a]">Eco Day Planner</h4><TinyLeaf /></div>
        <p className="text-[11px] text-[#5e7a5e] mb-3">Green itinerary using Namma Metro & Yulu - Saves ~3.2 kg CO2</p>
        <div className="space-y-0">
          {plan.map((s, i) => (
            <div key={i} className="flex gap-3 relative">
              {i < plan.length - 1 && <div className="absolute left-[9px] top-[22px] bottom-0 w-[2px] bg-gradient-to-b from-[#2d8a4e]/30 to-[#5cb85c]/10" />}
              <div className="w-5 h-5 rounded-full bg-[#2d8a4e] flex items-center justify-center flex-shrink-0 mt-0.5 z-10"><span className="text-[9px] text-white font-bold">{i + 1}</span></div>
              <div className="flex-1 pb-4">
                <div className="flex items-center gap-2"><span className="text-[11px] font-semibold text-[#2d8a4e]">{s.time}</span><span className="text-[10px] text-[#5e7a5e]/40">•</span><span className="text-[11px] text-[#5e7a5e]">{s.act}</span></div>
                <p className="text-[12px] font-medium text-[#1a2e1a] mt-0.5">{s.place.name}</p>
                <span className="text-[10px] text-[#5e7a5e] bg-[#e8f5e8] px-2 py-0.5 rounded-full inline-block mt-1">{s.tr}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="card-inset p-3 rounded-[10px] flex items-center gap-2 mt-1"><Award className="w-4 h-4 text-[#2d8a4e]" /><span className="text-[11px] text-[#2d8a4e] font-medium">Complete this plan to earn +15 Green Points!</span></div>
      </div>
    </div>
  );
}

function CarbonSaved() {
  return (
    <div className="card-surface-sm p-4 relative">
      <CardLeaves variant="a" />
      <div className="flex items-center gap-2 mb-3 relative z-10"><Leaf className="w-4 h-4 text-[#2d8a4e]" /><h4 className="text-[14px] font-semibold text-[#1a2e1a]">Your Impact</h4></div>
      <div className="grid grid-cols-3 gap-2 relative z-10">
        {[{ v: '4.8 kg', s: 'CO2 saved', l: 'This Week' }, { v: '7', s: 'eco spots', l: 'Visited' }, { v: '120', s: 'earned', l: 'Green Points' }].map((s, i) => (
          <div key={i} className="card-inset p-2.5 rounded-[10px] text-center"><p className="text-[16px] font-bold text-[#2d8a4e]">{s.v}</p><p className="text-[10px] text-[#5e7a5e]">{s.s}</p><p className="text-[9px] text-[#5e7a5e]/50 mt-0.5">{s.l}</p></div>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   ECO ROUTE PLANNER TAB
   ══════════════════════════════════════════════════════════════ */

const ROUTE_LOCATIONS = [
  { name: 'Cubbon Park', coords: [12.976, 77.592] as [number, number] },
  { name: 'MG Road', coords: [12.973, 77.609] as [number, number] },
  { name: 'Indiranagar', coords: [12.979, 77.640] as [number, number] },
  { name: 'Koramangala', coords: [12.935, 77.624] as [number, number] },
  { name: 'HSR Layout', coords: [12.915, 77.640] as [number, number] },
  { name: 'Whitefield', coords: [12.970, 77.750] as [number, number] },
  { name: 'Electronic City', coords: [12.845, 77.662] as [number, number] },
  { name: 'Majestic', coords: [12.976, 77.572] as [number, number] },
  { name: 'Jayanagar', coords: [12.926, 77.584] as [number, number] },
  { name: 'Hebbal', coords: [13.036, 77.597] as [number, number] },
  { name: 'Yeshwanthpur', coords: [13.023, 77.550] as [number, number] },
  { name: 'Marathahalli', coords: [12.958, 77.701] as [number, number] },
  { name: 'Lalbagh', coords: [12.951, 77.585] as [number, number] },
  { name: 'BTM Layout', coords: [12.917, 77.610] as [number, number] },
  { name: 'JP Nagar', coords: [12.908, 77.585] as [number, number] },
  { name: 'Silk Board', coords: [12.918, 77.623] as [number, number] },
];

const EMISSION_FACTORS: Record<string, { co2PerKm: number; costPerKm: number; speedKmh: number; color: string; icon: React.ReactNode; label: string }> = {
  walk: { co2PerKm: 0, costPerKm: 0, speedKmh: 5, color: '#22c55e', icon: <Footprints className="w-4 h-4" />, label: 'Walk' },
  cycle: { co2PerKm: 5, costPerKm: 0.33, speedKmh: 15, color: '#84cc16', icon: <Bike className="w-4 h-4" />, label: 'Cycle' },
  metro: { co2PerKm: 30, costPerKm: 2.5, speedKmh: 35, color: '#3b82f6', icon: <Train className="w-4 h-4" />, label: 'Metro' },
  ev: { co2PerKm: 40, costPerKm: 3, speedKmh: 30, color: '#8b5cf6', icon: <Zap className="w-4 h-4" />, label: 'EV' },
  car: { co2PerKm: 120, costPerKm: 8, speedKmh: 25, color: '#ef4444', icon: <Car className="w-4 h-4" />, label: 'Car' },
};

const AI_TIPS = [
  { tip: 'Walking this route saves {co2}g CO₂ — enough to power an LED bulb for {days} days.', mode: 'walk' },
  { tip: 'Consider taking Namma Metro — 70% less carbon than driving this route.', mode: 'metro' },
  { tip: 'Cycling burns ~40 calories per km while producing near-zero emissions!', mode: 'cycle' },
  { tip: 'An EV on this route produces 67% less CO₂ than a petrol car.', mode: 'ev' },
  { tip: 'Walking 2km daily can reduce your annual carbon footprint by 320kg.', mode: 'walk' },
  { tip: 'Metro Line covers this corridor — save ₹{saved} vs driving!', mode: 'metro' },
  { tip: 'Yulu e-bikes are available near both locations for just ₹10/30min.', mode: 'cycle' },
  { tip: 'BESCOM has {chargers} EV chargers within 2km of your destination.', mode: 'ev' },
  { tip: 'Switching from car to metro for this commute saves {weekly}kg CO₂ per week.', mode: 'metro' },
  { tip: 'This walking route passes through green corridors with AQI under 50.', mode: 'walk' },
];

interface RouteResult {
  mode: string;
  distance: number;
  time: number;
  co2: number;
  cost: number;
  ecoScore: number;
}

interface RouteHistory {
  from: string;
  to: string;
  mode: string;
  co2Saved: number;
  date: string;
}

function haversineDistance(a: [number, number], b: [number, number]): number {
  const R = 6371;
  const dLat = (b[0] - a[0]) * Math.PI / 180;
  const dLon = (b[1] - a[1]) * Math.PI / 180;
  const la = a[0] * Math.PI / 180;
  const lb = b[0] * Math.PI / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(la) * Math.cos(lb) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function generateRoutePolyline(a: [number, number], b: [number, number], mode: string): [number, number][] {
  // Generate a slightly curved path between two points
  const points: [number, number][] = [];
  const steps = 20;
  const offset = mode === 'walk' ? 0.001 : mode === 'cycle' ? 0.0015 : mode === 'metro' ? 0.003 : mode === 'ev' ? 0.002 : 0.004;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const lat = a[0] + (b[0] - a[0]) * t;
    const lng = a[1] + (b[1] - a[1]) * t;
    const curve = Math.sin(t * Math.PI) * offset;
    points.push([lat + curve, lng - curve * 0.5]);
  }
  return points;
}

function EcoRoutePlanner() {
  const [fromIdx, setFromIdx] = useState<number | null>(null);
  const [toIdx, setToIdx] = useState<number | null>(null);
  const [selectedModes, setSelectedModes] = useState<Set<string>>(new Set(['walk', 'cycle', 'metro', 'ev', 'car']));
  const [routes, setRoutes] = useState<RouteResult[]>([]);
  const [bestRoute, setBestRoute] = useState<RouteResult | null>(null);
  const [showCompare, setShowCompare] = useState(false);
  const [routeHistory, setRouteHistory] = useState<RouteHistory[]>([]);
  const [weeklyLowCarbon, setWeeklyLowCarbon] = useState(0);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [userCoords, setUserCoords] = useState<[number, number] | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layersRef = useRef<L.LayerGroup | null>(null);
  const [L, setL] = useState<typeof import('leaflet') | null>(null);

  // Load leaflet dynamically
  useEffect(() => {
    Promise.all([
      import('leaflet'),
    ]).then(([leaflet]) => {
      setL(leaflet.default || leaflet);
    });
  }, []);

  // Initialize map
  useEffect(() => {
    if (!L || !mapContainerRef.current || mapRef.current) return;
    const map = L.map(mapContainerRef.current, {
      center: [12.9716, 77.5946],
      zoom: 12,
      zoomControl: true,
      attributionControl: false,
    });
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
    }).addTo(map);
    const layers = L.layerGroup().addTo(map);
    mapRef.current = map;
    layersRef.current = layers;

    // Add all location markers
    ROUTE_LOCATIONS.forEach((loc, i) => {
      const marker = L.circleMarker([loc.coords[0], loc.coords[1]], {
        radius: 6,
        color: '#2d8a4e',
        fillColor: '#2d8a4e',
        fillOpacity: 0.7,
        weight: 2,
      }).addTo(map);
      marker.bindTooltip(loc.name, { permanent: false, direction: 'top', offset: [0, -8], className: '' });
    });

    return () => { map.remove(); mapRef.current = null; layersRef.current = null; };
  }, [L]);

  // Update map markers & polylines when route changes
  useEffect(() => {
    if (!L || !mapRef.current || !layersRef.current) return;
    layersRef.current.clearLayers();

    if (fromIdx !== null) {
      const from = ROUTE_LOCATIONS[fromIdx];
      const icon = L.divIcon({
        html: '<div style="width:28px;height:28px;border-radius:50%;background:#2d8a4e;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;color:white;font-size:12px;font-weight:bold;">A</div>',
        iconSize: [28, 28],
        iconAnchor: [14, 14],
        className: '',
      });
      L.marker(from.coords, { icon }).addTo(layersRef.current);
    }
    if (toIdx !== null) {
      const to = ROUTE_LOCATIONS[toIdx];
      const icon = L.divIcon({
        html: '<div style="width:28px;height:28px;border-radius:50%;background:#ef4444;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;color:white;font-size:12px;font-weight:bold;">B</div>',
        iconSize: [28, 28],
        iconAnchor: [14, 14],
        className: '',
      });
      L.marker(to.coords, { icon }).addTo(layersRef.current);
    }

    if (fromIdx !== null && toIdx !== null && routes.length > 0) {
      const from = ROUTE_LOCATIONS[fromIdx];
      const to = ROUTE_LOCATIONS[toIdx];
      routes.forEach(r => {
        const factor = EMISSION_FACTORS[r.mode];
        const polyline = generateRoutePolyline(from.coords, to.coords, r.mode);
        const line = L.polyline(polyline as [number, number][], {
          color: factor.color,
          weight: r.mode === bestRoute?.mode ? 5 : 3,
          opacity: r.mode === bestRoute?.mode ? 0.9 : 0.5,
          dashArray: r.mode === 'walk' ? '8 6' : r.mode === 'cycle' ? '12 4' : undefined,
        }).addTo(layersRef.current!);
        line.bindTooltip(`${factor.label}: ${r.distance.toFixed(1)}km • ${r.co2}g CO₂`, {
          sticky: true,
          direction: 'top',
        });
      });
      // Fit bounds
      mapRef.current?.fitBounds([from.coords, to.coords], { padding: [60, 60] });
    }
  }, [L, fromIdx, toIdx, routes, bestRoute]);

  const calculateRoutes = useCallback(() => {
    if (fromIdx === null || toIdx === null) return;
    const from = ROUTE_LOCATIONS[fromIdx];
    const to = ROUTE_LOCATIONS[toIdx];
    const dist = haversineDistance(from.coords, to.coords);

    const results: RouteResult[] = [];
    selectedModes.forEach(mode => {
      const f = EMISSION_FACTORS[mode];
      const roadDist = dist * (mode === 'walk' ? 1.2 : mode === 'cycle' ? 1.15 : mode === 'metro' ? 1.1 : 1.3);
      const time = (roadDist / f.speedKmh) * 60;
      const co2 = Math.round(roadDist * f.co2PerKm);
      const cost = Math.round(roadDist * f.costPerKm);
      const ecoScore = Math.max(0, Math.min(100, Math.round(100 - (co2 / 2))));
      results.push({ mode, distance: roadDist, time, co2, cost, ecoScore });
    });

    results.sort((a, b) => a.ecoScore === b.ecoScore ? a.co2 - b.co2 : b.ecoScore - a.ecoScore);
    setRoutes(results);
    setBestRoute(results[0] || null);
    setShowCompare(true);
  }, [fromIdx, toIdx, selectedModes]);

  const pickRoute = (r: RouteResult) => {
    setBestRoute(r);
    const carRoute = routes.find(x => x.mode === 'car');
    const co2Saved = carRoute ? carRoute.co2 - r.co2 : 0;
    if (fromIdx !== null && toIdx !== null) {
      const entry: RouteHistory = {
        from: ROUTE_LOCATIONS[fromIdx].name,
        to: ROUTE_LOCATIONS[toIdx].name,
        mode: r.mode,
        co2Saved,
        date: new Date().toISOString().split('T')[0],
      };
      setRouteHistory(prev => [entry, ...prev].slice(0, 20));
      if (r.mode !== 'car') setWeeklyLowCarbon(prev => prev + 1);
    }
  };

  const detectLocation = () => {
    setDetectingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const uc: [number, number] = [pos.coords.latitude, pos.coords.longitude];
          setUserCoords(uc);
          // Find nearest location
          let best = 0;
          let bestDist = Infinity;
          ROUTE_LOCATIONS.forEach((loc, i) => {
            const d = haversineDistance(uc, loc.coords);
            if (d < bestDist) { best = i; bestDist = d; }
          });
          setFromIdx(best);
          setDetectingLocation(false);
        },
        () => {
          // Fallback to Cubbon Park
          setFromIdx(0);
          setDetectingLocation(false);
        },
        { timeout: 5000 }
      );
    } else {
      setFromIdx(0);
      setDetectingLocation(false);
    }
  };

  const toggleMode = (mode: string) => {
    setSelectedModes(prev => {
      const next = new Set(prev);
      if (next.has(mode)) { if (next.size > 1) next.delete(mode); }
      else next.add(mode);
      return next;
    });
  };

  const totalCo2Saved = routeHistory.reduce((sum, h) => sum + h.co2Saved, 0);
  const hasGreenBadge = weeklyLowCarbon >= 3;

  const currentTips = useMemo(() => {
    if (!bestRoute) return AI_TIPS.slice(0, 3);
    const dist = bestRoute.distance;
    const carCo2 = Math.round(dist * EMISSION_FACTORS.car.co2PerKm);
    const saved = carCo2 - bestRoute.co2;
    return AI_TIPS.filter(t => t.mode === bestRoute.mode || Math.random() > 0.5).slice(0, 3).map(t => ({
      ...t,
      tip: t.tip
        .replace('{co2}', String(saved))
        .replace('{days}', String(Math.round(saved / 400 * 3)))
        .replace('{saved}', String(Math.round(dist * (EMISSION_FACTORS.car.costPerKm - EMISSION_FACTORS.metro.costPerKm))))
        .replace('{chargers}', String(Math.min(8, Math.round(dist))))
        .replace('{weekly}', String(Math.round(saved * 5 / 1000 * 10) / 10)),
    }));
  }, [bestRoute]);

  return (
    <div className="flex flex-col gap-4">
      {/* Route Input Card */}
      <div className="card-surface p-5 relative">
        <CardLeaves variant="c" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-[10px] bg-gradient-to-br from-emerald-500 to-cyan-400 flex items-center justify-center">
              <Route className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-[15px] font-bold text-[#1a2e1a]">Eco Route Planner</h3>
              <p className="text-[11px] text-[#5e7a5e]">Find the greenest way between any two places</p>
            </div>
          </div>

          {/* From / To Inputs */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-[#2d8a4e] flex items-center justify-center flex-shrink-0">
                <span className="text-[11px] font-bold text-white">A</span>
              </div>
              <select value={fromIdx ?? ''} onChange={e => setFromIdx(e.target.value === '' ? null : Number(e.target.value))}
                className="flex-1 text-[13px] px-3 py-2.5 rounded-[12px] bg-[#f0f7f0] border border-[#2d8a4e]/10 focus:border-[#2d8a4e]/30 focus:outline-none appearance-none">
                <option value="">Select starting point...</option>
                {ROUTE_LOCATIONS.map((loc, i) => <option key={i} value={i}>{loc.name}</option>)}
              </select>
              <button onClick={detectLocation} disabled={detectingLocation}
                className="p-2.5 rounded-[12px] bg-[#e8f5e8] text-[#2d8a4e] hover:bg-[#d4edd4] transition-colors disabled:opacity-50"
                title="Detect my location">
                <LocateFixed className={`w-4 h-4 ${detectingLocation ? 'animate-spin' : ''}`} />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
                <span className="text-[11px] font-bold text-white">B</span>
              </div>
              <select value={toIdx ?? ''} onChange={e => setToIdx(e.target.value === '' ? null : Number(e.target.value))}
                className="flex-1 text-[13px] px-3 py-2.5 rounded-[12px] bg-[#f0f7f0] border border-[#2d8a4e]/10 focus:border-[#2d8a4e]/30 focus:outline-none appearance-none">
                <option value="">Select destination...</option>
                {ROUTE_LOCATIONS.map((loc, i) => <option key={i} value={i} disabled={i === fromIdx}>{loc.name}</option>)}
              </select>
              <button onClick={() => { const t = fromIdx; setFromIdx(toIdx); setToIdx(t); }}
                className="p-2.5 rounded-[12px] bg-[#e8f5e8] text-[#2d8a4e] hover:bg-[#d4edd4] transition-colors"
                title="Swap">
                <ArrowUpDown className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Transport Mode Filters */}
          <div className="mb-4">
            <p className="text-[11px] font-semibold text-[#5e7a5e] mb-2">Transport Modes</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(EMISSION_FACTORS).map(([mode, f]) => (
                <button key={mode} onClick={() => toggleMode(mode)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-[10px] text-[12px] font-medium transition-all border-2 ${
                    selectedModes.has(mode)
                      ? 'shadow-md'
                      : 'opacity-40 border-transparent bg-gray-100'
                  }`}
                  style={selectedModes.has(mode) ? {
                    borderColor: `${f.color}50`,
                    background: `${f.color}12`,
                    color: f.color,
                  } : {}}>
                  {f.icon} {f.label}
                  <span className="text-[9px] opacity-60">{f.co2PerKm}g/km</span>
                </button>
              ))}
            </div>
          </div>

          {/* Calculate Button */}
          <button onClick={calculateRoutes}
            disabled={fromIdx === null || toIdx === null}
            className="w-full py-3 rounded-[14px] bg-gradient-to-r from-[#2d8a4e] to-[#5cb85c] text-white text-[14px] font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-[#2d8a4e]/25 transition-all flex items-center justify-center gap-2">
            <Navigation className="w-4 h-4" /> Calculate Eco Routes
          </button>
        </div>
      </div>

      {/* Map */}
      <div className="relative rounded-[16px] overflow-hidden border border-[#2d8a4e]/15 shadow-lg" style={{ minHeight: 400 }}>
        <div ref={mapContainerRef} style={{ height: 400, width: '100%' }} />
        {/* Legend Overlay */}
        {routes.length > 0 && (
          <div className="absolute bottom-3 left-3 z-[1000] bg-white/95 backdrop-blur-sm rounded-[10px] px-3 py-2 shadow-md border border-[#2d8a4e]/10">
            <p className="text-[9px] font-bold text-[#5e7a5e] mb-1">ROUTE COLORS</p>
            <div className="space-y-0.5">
              {routes.map(r => (
                <div key={r.mode} className="flex items-center gap-1.5">
                  <div className="w-4 h-[3px] rounded-full" style={{ background: EMISSION_FACTORS[r.mode].color, opacity: r.mode === bestRoute?.mode ? 1 : 0.5 }} />
                  <span className="text-[10px]" style={{ color: EMISSION_FACTORS[r.mode].color, fontWeight: r.mode === bestRoute?.mode ? 700 : 400 }}>
                    {EMISSION_FACTORS[r.mode].label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Route Comparison Table */}
      <AnimatePresence>
        {showCompare && routes.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="card-surface p-5 relative">
            <CardLeaves variant="a" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[15px] font-bold text-[#1a2e1a] flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-[#2d8a4e]" /> Route Comparison
                </h3>
                <span className="text-[10px] text-[#5e7a5e]">{ROUTE_LOCATIONS[fromIdx!].name} → {ROUTE_LOCATIONS[toIdx!].name}</span>
              </div>

              {/* Table */}
              <div className="overflow-x-auto -mx-2">
                <table className="w-full text-[12px]">
                  <thead>
                    <tr className="text-[10px] text-[#5e7a5e] uppercase tracking-wider">
                      <th className="text-left py-2 px-2">Mode</th>
                      <th className="text-right py-2 px-2">Distance</th>
                      <th className="text-right py-2 px-2">Time</th>
                      <th className="text-right py-2 px-2">CO₂</th>
                      <th className="text-right py-2 px-2">Cost</th>
                      <th className="text-center py-2 px-2">Eco</th>
                      <th className="text-center py-2 px-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {routes.map((r, i) => {
                      const f = EMISSION_FACTORS[r.mode];
                      const isBest = r.mode === bestRoute?.mode;
                      return (
                        <motion.tr key={r.mode} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                          className={`border-t border-[#2d8a4e]/8 cursor-pointer transition-colors ${isBest ? 'bg-[#2d8a4e]/5' : 'hover:bg-[#f0f7f0]'}`}
                          onClick={() => pickRoute(r)}>
                          <td className="py-2.5 px-2">
                            <div className="flex items-center gap-1.5" style={{ color: f.color }}>
                              {f.icon}
                              <span className="font-semibold">{f.label}</span>
                              {i === 0 && <span className="text-[8px] px-1.5 py-0.5 rounded bg-[#2d8a4e]/10 text-[#2d8a4e] font-bold">BEST</span>}
                            </div>
                          </td>
                          <td className="text-right py-2.5 px-2 text-[#1a2e1a] font-medium">{r.distance.toFixed(1)} km</td>
                          <td className="text-right py-2.5 px-2 text-[#1a2e1a]">{r.time < 60 ? `${Math.round(r.time)} min` : `${Math.floor(r.time / 60)}h ${Math.round(r.time % 60)}m`}</td>
                          <td className="text-right py-2.5 px-2">
                            <span className={`font-semibold ${r.co2 === 0 ? 'text-[#2d8a4e]' : r.co2 < 100 ? 'text-blue-600' : r.co2 < 500 ? 'text-amber-600' : 'text-red-600'}`}>
                              {r.co2}g
                            </span>
                          </td>
                          <td className="text-right py-2.5 px-2 text-[#1a2e1a]">₹{r.cost}</td>
                          <td className="text-center py-2.5 px-2"><EcoGauge score={r.ecoScore} size={36} /></td>
                          <td className="text-center py-2.5 px-2">
                            <button className={`p-1.5 rounded-[8px] transition-all ${isBest ? 'bg-[#2d8a4e] text-white' : 'bg-[#e8f5e8] text-[#2d8a4e] hover:bg-[#d4edd4]'}`}>
                              <Target className="w-3 h-3" />
                            </button>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Best Route EcoScore Hero */}
      <AnimatePresence>
        {bestRoute && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
            className="card-surface p-5 relative">
            <CardLeaves variant="b" />
            <div className="relative z-10">
              <div className="flex items-center gap-4">
                <EcoGauge score={bestRoute.ecoScore} size={80} />
                <div className="flex-1">
                  <p className="text-[11px] text-[#5e7a5e] uppercase tracking-wider font-semibold mb-1">Selected Route EcoScore</p>
                  <h3 className="text-[22px] font-bold text-[#1a2e1a] flex items-center gap-2">
                    {getScoreLabel(bestRoute.ecoScore)}
                    <span className="text-[13px] font-normal text-[#5e7a5e]">via {EMISSION_FACTORS[bestRoute.mode].label}</span>
                  </h3>
                  <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                    <span className="flex items-center gap-1 text-[12px] text-[#5e7a5e]">
                      <Navigation className="w-3 h-3" /> {bestRoute.distance.toFixed(1)} km
                    </span>
                    <span className="flex items-center gap-1 text-[12px] text-[#5e7a5e]">
                      <Clock className="w-3 h-3" /> {Math.round(bestRoute.time)} min
                    </span>
                    <span className="flex items-center gap-1 text-[12px] font-medium" style={{ color: EMISSION_FACTORS[bestRoute.mode].color }}>
                      <Leaf className="w-3 h-3" /> {bestRoute.co2}g CO₂
                    </span>
                    <span className="flex items-center gap-1 text-[12px] text-[#5e7a5e]">
                      ₹{bestRoute.cost}
                    </span>
                  </div>
                </div>
              </div>

              {/* Animated EcoScore Bar */}
              <div className="mt-4 h-3 bg-[#e8f5e8] rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: `linear-gradient(90deg, #22c55e, ${getScoreColor(bestRoute.ecoScore).fill})` }}
                  initial={{ width: 0 }}
                  animate={{ width: `${bestRoute.ecoScore}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                />
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-[9px] text-[#5e7a5e]">0 (High Emission)</span>
                <span className="text-[9px] text-[#2d8a4e] font-semibold">100 (Zero Emission)</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Recommendations */}
      <AnimatePresence>
        {bestRoute && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="card-surface p-4 relative">
            <CardLeaves variant="d" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-[10px] bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center">
                  <Lightbulb className="w-3.5 h-3.5 text-white" />
                </div>
                <h3 className="text-[14px] font-bold text-[#1a2e1a]">AI Green Tips</h3>
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              </div>
              <div className="space-y-2">
                {currentTips.map((t, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                    className="card-inset px-3 py-2.5 rounded-[10px] flex items-start gap-2">
                    <span className="text-lg mt-0.5">💡</span>
                    <p className="text-[12px] text-[#1a2e1a] leading-relaxed">{t.tip}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* My Impact + Reward Badge */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="card-surface-sm p-4 relative">
          <CardLeaves variant="a" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <Leaf className="w-4 h-4 text-[#2d8a4e]" />
              <h4 className="text-[14px] font-semibold text-[#1a2e1a]">My Impact</h4>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="card-inset p-3 rounded-[10px] text-center">
                <p className="text-[18px] font-bold text-[#2d8a4e]">{(totalCo2Saved / 1000).toFixed(1)} kg</p>
                <p className="text-[10px] text-[#5e7a5e]">CO₂ Saved</p>
              </div>
              <div className="card-inset p-3 rounded-[10px] text-center">
                <p className="text-[18px] font-bold text-[#2d8a4e]">{routeHistory.length}</p>
                <p className="text-[10px] text-[#5e7a5e]">Routes Planned</p>
              </div>
              <div className="card-inset p-3 rounded-[10px] text-center">
                <p className="text-[18px] font-bold text-[#2d8a4e]">{weeklyLowCarbon}</p>
                <p className="text-[10px] text-[#5e7a5e]">Low-Carbon Trips</p>
              </div>
              <div className="card-inset p-3 rounded-[10px] text-center">
                <p className="text-[18px] font-bold text-[#2d8a4e]">₹{routeHistory.reduce((sum, h) => sum + Math.round(haversineDistance(ROUTE_LOCATIONS.find(l => l.name === h.from)?.coords || [0, 0], ROUTE_LOCATIONS.find(l => l.name === h.to)?.coords || [0, 0]) * 5), 0)}</p>
                <p className="text-[10px] text-[#5e7a5e]">Money Saved</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card-surface-sm p-4 relative">
          <CardLeaves variant="b" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <Trophy className="w-4 h-4 text-amber-500" />
              <h4 className="text-[14px] font-semibold text-[#1a2e1a]">Reward Badges</h4>
            </div>
            {hasGreenBadge ? (
              <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                className="card-inset p-4 rounded-[12px] text-center border-2 border-[#2d8a4e]/20">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center mx-auto mb-2 shadow-lg shadow-emerald-200">
                  <Award className="w-7 h-7 text-white" />
                </div>
                <p className="text-[14px] font-bold text-[#2d8a4e]">Green Commuter</p>
                <p className="text-[11px] text-[#5e7a5e] mt-1">3+ low-carbon routes this week!</p>
                <div className="flex items-center justify-center gap-1 mt-2">
                  {[1, 2, 3].map(i => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
              </motion.div>
            ) : (
              <div className="card-inset p-4 rounded-[12px] text-center">
                <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-2">
                  <Award className="w-7 h-7 text-gray-300" />
                </div>
                <p className="text-[13px] font-semibold text-[#5e7a5e]">Green Commuter Badge</p>
                <p className="text-[11px] text-[#5e7a5e]/60 mt-1">Pick {3 - weeklyLowCarbon} more low-carbon route{3 - weeklyLowCarbon !== 1 ? 's' : ''} to unlock!</p>
                <div className="w-full h-2 bg-gray-100 rounded-full mt-3 overflow-hidden">
                  <motion.div className="h-full bg-gradient-to-r from-emerald-400 to-green-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${(weeklyLowCarbon / 3) * 100}%` }}
                    transition={{ duration: 0.5 }} />
                </div>
                <p className="text-[9px] text-[#5e7a5e]/50 mt-1">{weeklyLowCarbon}/3 low-carbon trips</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Route History */}
      {routeHistory.length > 0 && (
        <div className="card-surface-sm p-4 relative">
          <CardLeaves variant="c" />
          <div className="relative z-10">
            <button onClick={() => setShowHistory(!showHistory)}
              className="w-full flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-[#2d8a4e]" />
                <h4 className="text-[14px] font-semibold text-[#1a2e1a]">Route History ({routeHistory.length})</h4>
              </div>
              {showHistory ? <ChevronUp className="w-4 h-4 text-[#5e7a5e]" /> : <ChevronDown className="w-4 h-4 text-[#5e7a5e]" />}
            </button>
            <AnimatePresence>
              {showHistory && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  className="mt-3 space-y-2 overflow-hidden">
                  {routeHistory.map((h, i) => (
                    <div key={i} className="card-inset px-3 py-2 rounded-[10px] flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: `${EMISSION_FACTORS[h.mode]?.color || '#999'}20`, color: EMISSION_FACTORS[h.mode]?.color || '#999' }}>
                        {EMISSION_FACTORS[h.mode]?.icon || <CircleDot className="w-3.5 h-3.5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-medium text-[#1a2e1a] truncate">{h.from} → {h.to}</p>
                        <p className="text-[10px] text-[#5e7a5e]">{h.date} • {EMISSION_FACTORS[h.mode]?.label || h.mode}</p>
                      </div>
                      {h.co2Saved > 0 && (
                        <span className="text-[11px] font-semibold text-[#2d8a4e] flex items-center gap-0.5">
                          <Leaf className="w-3 h-3" /> -{h.co2Saved}g
                        </span>
                      )}
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   MAIN ECOSPACE VIEW — Three Tabs: Explore + Transit Map + Route Planner
   ══════════════════════════════════════════════════════════════ */
export function EcoSpaceView() {
  const [activeTab, setActiveTab] = useState<'explore' | 'transit' | 'route'>('explore');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'rating' | 'nearby' | 'upvotes'>('rating');
  const [selectedPlace, setSelectedPlace] = useState<EcoPlace | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [places, setPlaces] = useState(ECO_PLACES);
  const [showFilters, setShowFilters] = useState(false);

  const filteredPlaces = useMemo(() => {
    let filtered = [...places];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(p => p.name.toLowerCase().includes(q) || p.address.toLowerCase().includes(q) || p.tags.some(t => t.toLowerCase().includes(q)));
    }
    if (selectedCategory !== 'All') filtered = filtered.filter(p => p.category === selectedCategory);
    if (sortBy === 'rating') filtered.sort((a, b) => b.rating - a.rating);
    else if (sortBy === 'upvotes') filtered.sort((a, b) => b.upvotes - a.upvotes);
    return filtered;
  }, [places, searchQuery, selectedCategory, sortBy]);

  const toggleFav = (id: string) => setFavorites(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const handleUpvote = (id: string) => setPlaces(prev => prev.map(p => p.id === id ? { ...p, upvotes: p.upvotes + 1 } : p));
  const handleAddReview = (id: string, text: string) => setPlaces(prev => prev.map(p => p.id === id ? { ...p, reviews: [...p.reviews, { user: 'You', text, date: new Date().toISOString().split('T')[0], rating: 5 }] } : p));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-4">
      {/* Hero */}
      <div className="card-surface p-5 relative overflow-hidden">
        <CardLeaves variant="b" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-[#2d8a4e] to-[#5cb85c] flex items-center justify-center"><MapPin className="w-5 h-5 text-white" /></div>
            <div>
              <h1 className="text-[20px] font-bold text-[#1a2e1a] flex items-center gap-2">EcoSpace <TinyLeaf className="rotate-[15deg]" /></h1>
              <p className="text-[12px] text-[#5e7a5e]">Bengaluru&apos;s sustainable places + {BESCOM_STATS.totalChargers} BESCOM EV chargers + real transit</p>
            </div>
          </div>
            <div className="flex gap-2 mt-2">
              <button onClick={() => setActiveTab('explore')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-[12px] text-[12px] font-semibold transition-all ${activeTab === 'explore' ? 'bg-[#2d8a4e] text-white shadow-lg shadow-[#2d8a4e]/20' : 'bg-[#e8f5e8] text-[#2d8a4e] hover:bg-[#d4edd4]'}`}>
                <Compass className="w-4 h-4" /> Explore
              </button>
              <button onClick={() => setActiveTab('transit')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-[12px] text-[12px] font-semibold transition-all ${activeTab === 'transit' ? 'bg-[#1a2e1a] text-white shadow-lg shadow-[#1a2e1a]/20' : 'bg-[#e8f5e8] text-[#1a2e1a] hover:bg-[#d4edd4]'}`}>
                <MapIcon className="w-4 h-4" /> Transit
              </button>
              <button onClick={() => setActiveTab('route')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-[12px] text-[12px] font-semibold transition-all ${activeTab === 'route' ? 'bg-gradient-to-r from-[#2d8a4e] to-[#5cb85c] text-white shadow-lg shadow-[#2d8a4e]/20' : 'bg-[#e8f5e8] text-[#2d8a4e] hover:bg-[#d4edd4]'}`}>
                <Route className="w-4 h-4" /> Route Plan
              </button>
            </div>
        </div>
      </div>

      {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'transit' ? (
            <motion.div key="transit" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <TransitMapTab />
            </motion.div>
          ) : activeTab === 'route' ? (
            <motion.div key="route" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <EcoRoutePlanner />
            </motion.div>
          ) : (
          <motion.div key="explore" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex flex-col gap-4">
            {/* Real-Time Suggestions */}
            <RealTimeSuggestionsSection suggestions={REALTIME_SUGGESTIONS} onSelectPlace={setSelectedPlace} places={places} />

            {/* Carbon Impact */}
            <CarbonSaved />

            {/* Day Planner */}
            <EcoDayPlanner places={filteredPlaces.length ? filteredPlaces : ECO_PLACES} />

            {/* Search + Filters for Place Grid */}
            <div className="card-surface-sm p-4 relative">
              <CardLeaves variant="c" />
              <div className="relative z-10 space-y-3">
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5e7a5e]" />
                    <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search eco places, tags, areas..."
                      className="w-full text-[13px] pl-9 pr-3 py-2.5 rounded-[12px] bg-[#f0f7f0] border border-[#2d8a4e]/10 focus:border-[#2d8a4e]/30 focus:outline-none" />
                  </div>
                  <button onClick={() => setShowFilters(!showFilters)} className={`flex items-center gap-1.5 px-3 py-2.5 rounded-[12px] text-[12px] font-medium transition-all ${showFilters ? 'bg-[#2d8a4e] text-white' : 'bg-[#e8f5e8] text-[#2d8a4e]'}`}>
                    <Filter className="w-4 h-4" /> Filters {showFilters ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>
                </div>
                <div className="flex gap-1.5 overflow-x-auto scrollbar-thin pb-1">
                  {CATEGORIES.map(cat => (
                    <button key={cat} onClick={() => setSelectedCategory(cat)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium whitespace-nowrap transition-all ${selectedCategory === cat ? 'bg-[#2d8a4e] text-white' : 'bg-[#e8f5e8] text-[#5e7a5e] hover:bg-[#d4edd4]'}`}>
                      {cat !== 'All' && CATEGORY_ICONS[cat]} {cat}
                    </button>
                  ))}
                </div>
                <AnimatePresence>
                  {showFilters && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="pt-2 border-t border-[#2d8a4e]/8">
                        <p className="text-[11px] font-semibold text-[#5e7a5e] mb-1.5 flex items-center gap-1"><ArrowUpDown className="w-3 h-3" /> Sort By</p>
                        <div className="flex gap-1.5">
                          {([{ key: 'rating' as const, label: 'Most Sustainable' }, { key: 'upvotes' as const, label: 'Most Popular' }, { key: 'nearby' as const, label: 'Nearby' }]).map(s => (
                            <button key={s.key} onClick={() => setSortBy(s.key)} className={`px-3 py-1.5 rounded-full text-[11px] font-medium transition-all ${sortBy === s.key ? 'bg-[#2d8a4e] text-white' : 'bg-[#f0f7f0] text-[#5e7a5e]'}`}>{s.label}</button>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Selected Place Detail */}
            <AnimatePresence>
              {selectedPlace && (
                <PlaceDetail key={selectedPlace.id} place={selectedPlace} onClose={() => setSelectedPlace(null)} onUpvote={() => handleUpvote(selectedPlace.id)} onAddReview={(text) => handleAddReview(selectedPlace.id, text)} />
              )}
            </AnimatePresence>

            {/* Places Grid */}
            <div>
              <SectionHeader title={`Eco Spots (${filteredPlaces.length})`} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                {filteredPlaces.map(place => (
                  <PlaceCard key={place.id} place={place} isSelected={selectedPlace?.id === place.id} onSelect={() => setSelectedPlace(place)} onToggleFav={() => toggleFav(place.id)} isFav={favorites.has(place.id)} />
                ))}
              </div>
              {filteredPlaces.length === 0 && (
                <div className="card-surface-sm p-8 text-center">
                  <MapPin className="w-8 h-8 text-[#5e7a5e]/30 mx-auto mb-2" />
                  <p className="text-[14px] text-[#5e7a5e]">No places found matching your filters</p>
                  <button onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }} className="mt-2 text-[13px] text-[#2d8a4e] font-medium hover:underline">Clear filters</button>
                </div>
              )}
            </div>

            {favorites.size > 0 && (
              <div>
                <SectionHeader title={`Eco Wallet (${favorites.size} saved)`} />
                <div className="flex gap-3 overflow-x-auto scrollbar-thin pb-2 mt-3">
                  {ECO_PLACES.filter(p => favorites.has(p.id)).map(place => (
                    <div key={place.id} className="card-surface-sm p-3 min-w-[200px] flex-shrink-0 cursor-pointer hover:shadow-md relative" onClick={() => setSelectedPlace(place)}>
                      <div className="flex items-center gap-2 relative z-10">
                        <div className="w-10 h-10 rounded-[8px] overflow-hidden bg-[#e8f5e8]"><img src={place.image} alt="" className="w-full h-full object-cover" loading="lazy" /></div>
                        <div className="min-w-0"><p className="text-[12px] font-semibold text-[#1a2e1a] truncate">{place.name}</p><p className="text-[10px] text-[#5e7a5e]">Score: {place.rating}</p></div>
                        <Bookmark className="w-4 h-4 text-[#2d8a4e] fill-[#2d8a4e] flex-shrink-0 ml-auto" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
