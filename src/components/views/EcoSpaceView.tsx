'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, Search, Filter, Star, Heart, Zap, Train, Bike, Bus,
  Leaf, ChevronDown, ChevronUp, X, Navigation, Clock, ThumbsUp, Send,
  Coffee, Utensils, Building2, TreePine, ShoppingBag, Route,
  ArrowUpDown, Bookmark, Share2, Award, Map as MapIcon, Compass,
  TrendingUp, Globe, MapPinned, Flame, CloudSun, ExternalLink,
  Timer, Car, Footprints, Trophy, Lightbulb, Sparkles,
  LocateFixed, BarChart3, Target, CircleDot, History, MessageCircle
} from 'lucide-react';
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
  { id: 'p1', name: 'GreenLeaf Café', category: 'Café', rating: 88, tags: ['Vegan Menu', 'Solar Powered', 'Compost Waste', 'Organic Coffee'], coords: [12.9716, 77.5946], address: 'MG Road, Bengaluru', image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&h=300&fit=crop', hours: '7:00 AM – 10:00 PM', description: 'Farm-to-table café with 100% organic menu and solar-powered kitchen.', upvotes: 234, reviews: [{ user: 'Priya S.', text: 'Love their zero-waste policy!', date: '2026-02-10', rating: 5 }] },
  { id: 'p2', name: 'The Bamboo Space', category: 'Co-Working', rating: 92, tags: ['Recycled Furniture', 'Paperless Billing', 'Rainwater Harvesting'], coords: [12.9750, 77.5980], address: 'Indiranagar, Bengaluru', image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop', hours: '6:00 AM – 11:00 PM', description: 'Co-working space built from reclaimed materials.', upvotes: 189, reviews: [{ user: 'Ananya M.', text: 'Paperless, green workspace!', date: '2026-02-12', rating: 5 }] },
  { id: 'p3', name: 'Terra Kitchen', category: 'Restaurant', rating: 85, tags: ['Locally Sourced', 'Zero Plastic', 'Organic Produce'], coords: [12.9352, 77.6245], address: 'Koramangala, Bengaluru', image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop', hours: '11:00 AM – 11:00 PM', description: 'Farm-fresh restaurant with zero plastic.', upvotes: 312, reviews: [{ user: 'Vikram D.', text: 'Banana-leaf meals are amazing!', date: '2026-02-11', rating: 5 }] },
  { id: 'p4', name: 'Cubbon Park', category: 'Park', rating: 95, tags: ['Urban Forest', 'Heritage Trees', 'Free Entry'], coords: [12.9763, 77.5929], address: 'Cubbon Park, Bengaluru', image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop', hours: '6:00 AM – 6:00 PM', description: '300-acre green lung with 6000+ trees.', upvotes: 567, reviews: [{ user: 'Meera J.', text: 'Best morning walk spot.', date: '2026-02-13', rating: 5 }] },
  { id: 'p5', name: 'EcoMart Organic Store', category: 'Store', rating: 78, tags: ['Package-Free', 'Local Products', 'Refill Station'], coords: [12.9698, 77.7500], address: 'Whitefield, Bengaluru', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=300&fit=crop', hours: '9:00 AM – 9:00 PM', description: 'Zero-waste grocery with refill stations.', upvotes: 145, reviews: [{ user: 'Kavya P.', text: 'Bring your own containers!', date: '2026-02-07', rating: 4 }] },
  { id: 'p6', name: 'Lalbagh Botanical Garden', category: 'Park', rating: 96, tags: ['Botanical Heritage', 'Lake', 'Glass House'], coords: [12.9507, 77.5848], address: 'Lalbagh, Bengaluru', image: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=400&h=300&fit=crop', hours: '6:00 AM – 7:00 PM', description: '240-acre botanical garden with 1000+ species.', upvotes: 678, reviews: [{ user: 'Arjun T.', text: 'Biodiversity treasure!', date: '2026-02-12', rating: 5 }] },
  { id: 'p7', name: 'Green Theory Restro', category: 'Restaurant', rating: 82, tags: ['Plant-Based Menu', 'Solar Water Heater'], coords: [12.9610, 77.6387], address: 'HSR Layout, Bengaluru', image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=300&fit=crop', hours: '12:00 PM – 11:30 PM', description: 'Trendy plant-based restaurant.', upvotes: 198, reviews: [{ user: 'Nikhil B.', text: 'Jackfruit biryani is insane!', date: '2026-02-10', rating: 4 }] },
  { id: 'p8', name: 'Sunday Soul Sante', category: 'Market', rating: 80, tags: ['Handmade Goods', 'Local Artisans', 'Sustainable Fashion'], coords: [12.9850, 77.5533], address: 'Palace Grounds, Bengaluru', image: 'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?w=400&h=300&fit=crop', hours: '10 AM – 10 PM (Sundays)', description: 'Weekly artisan market.', upvotes: 423, reviews: [{ user: 'Aditi K.', text: 'Amazing handcrafted products!', date: '2026-02-09', rating: 5 }] },
];

const CATEGORIES = ['All', 'Restaurant', 'Café', 'Co-Working', 'Park', 'Store', 'Market'] as const;
const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  'Restaurant': <Utensils className="w-4 h-4" />, 'Café': <Coffee className="w-4 h-4" />,
  'Co-Working': <Building2 className="w-4 h-4" />, 'Park': <TreePine className="w-4 h-4" />,
  'Store': <ShoppingBag className="w-4 h-4" />, 'Market': <ShoppingBag className="w-4 h-4" />,
};

function getScoreColor(score: number) {
  if (score >= 70) return { bg: 'bg-[#2d8a4e]/10', text: 'text-[#2d8a4e]', fill: '#2d8a4e' };
  if (score >= 40) return { bg: 'bg-amber-500/10', text: 'text-amber-600', fill: '#d97706' };
  return { bg: 'bg-red-500/10', text: 'text-red-600', fill: '#dc2626' };
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

/* ═══════════════════════════════════════════════
   TRANSIT MAP TAB (Google Maps embedded)
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
    { key: 'ev', icon: <Zap className="w-4 h-4" />, label: 'BESCOM EV', count: BESCOM_STATS.totalLocations, color: '#2563eb', sub: `${BESCOM_STATS.totalChargers} chargers` },
    { key: 'bike', icon: <Bike className="w-4 h-4" />, label: 'Cycle/Bike', count: CYCLE_STATIONS.length, color: '#f97316', sub: 'Yulu, Bounce, Pedl' },
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* Layer Toggle */}
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

      {/* EV Filters */}
      {activeLayer === 'ev' && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="flex flex-wrap gap-2 px-1">
          <span className="text-[11px] text-[#5e7a5e] font-semibold self-center mr-1">Filter:</span>
          {['all', 'CCS', 'GB/T', '10kW', '3.3kW'].map(f => (
            <button key={f} onClick={() => setEvFilter(f)}
              className={`px-3 py-1 rounded-full text-[11px] font-medium transition-all ${evFilter === f ? 'bg-blue-600 text-white' : 'bg-[#e8f5e8] text-[#5e7a5e]'}`}>
              {f === 'all' ? `All (${BESCOM_STATS.totalLocations})` : f === 'CCS' ? 'DC Fast' : f === 'GB/T' ? 'AC Fast' : f}
            </button>
          ))}
        </motion.div>
      )}

      {/* Google Maps */}
      <div className="relative rounded-[16px] overflow-hidden border border-[#2d8a4e]/15 shadow-lg" style={{ minHeight: 450 }}>
        <iframe src={googleMapSrc} className="w-full border-0" style={{ minHeight: 450 }} allowFullScreen loading="lazy"
          referrerPolicy="no-referrer-when-downgrade" title={`Bengaluru ${activeLayer} map`} />
        <div className="absolute top-3 left-3 z-10 flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-[10px] px-3 py-2 shadow-md">
          {layers.find(l => l.key === activeLayer)?.icon}
          <span className="text-[12px] font-semibold text-[#1a2e1a]">{layers.find(l => l.key === activeLayer)?.label}</span>
        </div>
        <a href={`https://www.google.com/maps/search/${GMAP_QUERIES[activeLayer]}`} target="_blank" rel="noopener noreferrer"
          className="absolute bottom-3 right-3 z-10 flex items-center gap-1.5 bg-white/90 backdrop-blur-sm rounded-[10px] px-3 py-2 shadow-md text-[12px] font-medium text-[#2d8a4e]">
          <ExternalLink className="w-3.5 h-3.5" /> Open in Maps
        </a>
      </div>

      {/* Station Details per Layer */}
      {activeLayer === 'metro' && (
        <div className="card-surface p-4">
          <div className="flex items-center gap-2 mb-3">
            <Train className="w-5 h-5 text-purple-600" />
            <h3 className="text-[15px] font-bold text-[#1a2e1a]">Namma Metro Network</h3>
          </div>
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[{ n: 37, l: 'Purple Line', c: '#7c3aed', s: 'Challaghatta ↔ Whitefield' },
              { n: 31, l: 'Green Line', c: '#16a34a', s: 'Silk Institute ↔ Madavara' },
              { n: 14, l: 'Yellow Line', c: '#eab308', s: 'RV Road ↔ Bommasandra' }].map(x => (
              <div key={x.l} className="card-inset p-3 rounded-[12px] text-center" style={{ borderLeft: `3px solid ${x.c}` }}>
                <p className="text-[20px] font-bold" style={{ color: x.c }}>{x.n}</p>
                <p className="text-[11px] text-[#5e7a5e]">{x.l}</p>
                <p className="text-[9px] text-[#5e7a5e]/50">{x.s}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeLayer === 'bus' && (
        <div className="card-surface p-4">
          <div className="flex items-center gap-2 mb-3"><Bus className="w-5 h-5 text-teal-600" /><h3 className="text-[15px] font-bold text-[#1a2e1a]">BMTC Bus Network</h3></div>
          <div className="space-y-1.5">
            {BUS_STOPS.map(s => (
              <div key={s.id} className="card-inset px-3 py-2.5 rounded-[10px] flex items-center gap-3">
                <span className="w-7 h-7 rounded-[8px] bg-teal-500 text-white flex items-center justify-center text-[11px] font-bold flex-shrink-0">B</span>
                <div className="min-w-0 flex-1">
                  <p className="text-[12px] font-semibold text-[#1a2e1a] truncate">{s.name}</p>
                  <p className="text-[10px] text-[#5e7a5e]">{s.detail}</p>
                </div>
                <a href={`https://www.google.com/maps/search/${encodeURIComponent(s.name + ' Bengaluru')}`} target="_blank" rel="noopener noreferrer"
                  className="p-1.5 rounded-full bg-teal-50 text-teal-600 flex-shrink-0"><ExternalLink className="w-3.5 h-3.5" /></a>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeLayer === 'ev' && (
        <>
          <div className="card-surface p-4">
            <div className="flex items-center gap-2 mb-3"><Zap className="w-5 h-5 text-blue-500" /><h3 className="text-[15px] font-bold text-[#1a2e1a]">BESCOM EV Network</h3></div>
            <div className="grid grid-cols-3 gap-3">
              <div className="card-inset p-3 rounded-[12px] text-center"><p className="text-[22px] font-bold text-blue-600">{BESCOM_STATS.totalLocations}</p><p className="text-[11px] text-[#5e7a5e]">Locations</p></div>
              <div className="card-inset p-3 rounded-[12px] text-center"><p className="text-[22px] font-bold text-[#2d8a4e]">{BESCOM_STATS.totalChargers}</p><p className="text-[11px] text-[#5e7a5e]">Chargers</p></div>
              <div className="card-inset p-3 rounded-[12px] text-center"><p className="text-[22px] font-bold text-purple-600">5</p><p className="text-[11px] text-[#5e7a5e]">Types</p></div>
            </div>
          </div>
          <button onClick={() => setShowStationList(!showStationList)}
            className="flex items-center justify-between w-full p-3 rounded-[12px] bg-blue-50 text-blue-700 text-[13px] font-semibold">
            <span className="flex items-center gap-2"><MapPinned className="w-4 h-4" /> All {filteredEv.length} Stations</span>
            {showStationList ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          <AnimatePresence>
            {showStationList && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                className="space-y-2 overflow-hidden">
                {filteredEv.map(s => (
                  <motion.div key={s.id} className={`card-surface-sm p-3 cursor-pointer ${selectedStation?.id === s.id ? 'ring-2 ring-blue-500/30' : ''}`}
                    onClick={() => setSelectedStation(selectedStation?.id === s.id ? null : s)}>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-[10px] bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center text-lg flex-shrink-0">⚡</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-semibold text-[#1a2e1a] truncate">{s.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-[#5e7a5e]">{s.location}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-600 font-medium">{s.totalChargers} charger{s.totalChargers > 1 ? 's' : ''}</span>
                        </div>
                      </div>
                      <a href={`https://www.google.com/maps/search/${encodeURIComponent(s.name + ' ' + s.location)}`} target="_blank" rel="noopener noreferrer"
                        className="p-1.5 rounded-full bg-blue-50 text-blue-600 flex-shrink-0" onClick={e => e.stopPropagation()}><ExternalLink className="w-3.5 h-3.5" /></a>
                    </div>
                    <AnimatePresence>
                      {selectedStation?.id === s.id && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                          className="mt-3 pt-3 border-t border-[#2d8a4e]/10 overflow-hidden">
                          <div className="flex flex-wrap gap-1.5 mb-2">
                            {s.types.map(t => <span key={t} className="text-[10px] px-2.5 py-1 rounded-full bg-[#e8f5e8] text-[#2d8a4e] font-medium">{t}</span>)}
                          </div>
                          <a href={`https://www.google.com/maps/dir/?api=1&destination=${s.coords[0]},${s.coords[1]}`} target="_blank" rel="noopener noreferrer"
                            className="mt-2 w-full flex items-center justify-center gap-2 py-2 rounded-[10px] bg-blue-600 text-white text-[12px] font-semibold">
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
        <div className="card-surface p-4">
          <div className="flex items-center gap-2 mb-3"><Bike className="w-5 h-5 text-orange-500" /><h3 className="text-[15px] font-bold text-[#1a2e1a]">Cycle & E-Bike Rental</h3></div>
          <div className="space-y-1.5">
            {CYCLE_STATIONS.map(s => (
              <div key={s.id} className="card-inset px-3 py-2.5 rounded-[10px] flex items-center gap-3">
                <span className="w-7 h-7 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm flex-shrink-0">🚲</span>
                <div className="min-w-0 flex-1">
                  <p className="text-[12px] font-semibold text-[#1a2e1a] truncate">{s.name}</p>
                  <p className="text-[10px] text-[#5e7a5e]">{s.detail}</p>
                </div>
                <a href={`https://www.google.com/maps/search/${encodeURIComponent(s.name + ' Bengaluru')}`} target="_blank" rel="noopener noreferrer"
                  className="p-1.5 rounded-full bg-orange-50 text-orange-600 flex-shrink-0"><ExternalLink className="w-3.5 h-3.5" /></a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   ECO ROUTE PLANNER TAB
   ═══════════════════════════════════════════════ */
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

function haversineDistance(a: [number, number], b: [number, number]): number {
  const R = 6371;
  const dLat = (b[0] - a[0]) * Math.PI / 180;
  const dLon = (b[1] - a[1]) * Math.PI / 180;
  const la = a[0] * Math.PI / 180;
  const lb = b[0] * Math.PI / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(la) * Math.cos(lb) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

interface RouteResult { mode: string; distance: number; time: number; co2: number; cost: number; ecoScore: number; }

function EcoRoutePlanner() {
  const [fromIdx, setFromIdx] = useState<number | null>(null);
  const [toIdx, setToIdx] = useState<number | null>(null);
  const [selectedModes, setSelectedModes] = useState<Set<string>>(new Set(['walk', 'cycle', 'metro', 'ev', 'car']));
  const [routes, setRoutes] = useState<RouteResult[]>([]);
  const [bestRoute, setBestRoute] = useState<RouteResult | null>(null);
  const [showCompare, setShowCompare] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);

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

  const pickRoute = (r: RouteResult) => setBestRoute(r);

  const detectLocation = () => {
    setDetectingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const uc: [number, number] = [pos.coords.latitude, pos.coords.longitude];
          let best = 0, bestDist = Infinity;
          ROUTE_LOCATIONS.forEach((loc, i) => { const d = haversineDistance(uc, loc.coords); if (d < bestDist) { best = i; bestDist = d; } });
          setFromIdx(best);
          setDetectingLocation(false);
        },
        () => { setFromIdx(0); setDetectingLocation(false); },
        { timeout: 5000 }
      );
    } else { setFromIdx(0); setDetectingLocation(false); }
  };

  const toggleMode = (mode: string) => {
    setSelectedModes(prev => {
      const next = new Set(prev);
      if (next.has(mode)) { if (next.size > 1) next.delete(mode); } else next.add(mode);
      return next;
    });
  };

  // Google Maps directions link for the selected route
  const getDirectionsUrl = () => {
    if (fromIdx === null || toIdx === null || !bestRoute) return '';
    const from = ROUTE_LOCATIONS[fromIdx];
    const to = ROUTE_LOCATIONS[toIdx];
    const travelMode = bestRoute.mode === 'walk' ? 'walking' : bestRoute.mode === 'cycle' ? 'bicycling' : bestRoute.mode === 'metro' || bestRoute.mode === 'car' ? 'driving' : 'transit';
    return `https://www.google.com/maps/dir/?api=1&origin=${from.coords[0]},${from.coords[1]}&destination=${to.coords[0]},${to.coords[1]}&travelmode=${travelMode}`;
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Route Input */}
      <div className="card-surface p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-[10px] bg-gradient-to-br from-emerald-500 to-cyan-400 flex items-center justify-center">
            <Route className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-[15px] font-bold text-[#1a2e1a]">Eco Route Planner</h3>
            <p className="text-[11px] text-[#5e7a5e]">Find the greenest way between any two places</p>
          </div>
        </div>

        {/* From / To */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#2d8a4e] flex items-center justify-center flex-shrink-0">
              <span className="text-[11px] font-bold text-white">A</span>
            </div>
            <select value={fromIdx ?? ''} onChange={e => setFromIdx(e.target.value === '' ? null : Number(e.target.value))}
              className="flex-1 text-[13px] px-3 py-2.5 rounded-[12px] bg-[#f0f7f0] border border-[#2d8a4e]/10 focus:outline-none appearance-none">
              <option value="">Select starting point...</option>
              {ROUTE_LOCATIONS.map((loc, i) => <option key={i} value={i}>{loc.name}</option>)}
            </select>
            <button onClick={detectLocation} disabled={detectingLocation}
              className="p-2.5 rounded-[12px] bg-[#e8f5e8] text-[#2d8a4e] disabled:opacity-50" title="Detect my location">
              <LocateFixed className={`w-4 h-4 ${detectingLocation ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
              <span className="text-[11px] font-bold text-white">B</span>
            </div>
            <select value={toIdx ?? ''} onChange={e => setToIdx(e.target.value === '' ? null : Number(e.target.value))}
              className="flex-1 text-[13px] px-3 py-2.5 rounded-[12px] bg-[#f0f7f0] border border-[#2d8a4e]/10 focus:outline-none appearance-none">
              <option value="">Select destination...</option>
              {ROUTE_LOCATIONS.map((loc, i) => <option key={i} value={i} disabled={i === fromIdx}>{loc.name}</option>)}
            </select>
            <button onClick={() => { const t = fromIdx; setFromIdx(toIdx); setToIdx(t); }}
              className="p-2.5 rounded-[12px] bg-[#e8f5e8] text-[#2d8a4e]" title="Swap">
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
                  selectedModes.has(mode) ? 'shadow-md' : 'opacity-40 border-transparent bg-gray-100'
                }`}
                style={selectedModes.has(mode) ? { borderColor: `${f.color}50`, background: `${f.color}12`, color: f.color } : {}}>
                {f.icon} {f.label}
                <span className="text-[9px] opacity-60">{f.co2PerKm}g/km</span>
              </button>
            ))}
          </div>
        </div>

        <button onClick={calculateRoutes} disabled={fromIdx === null || toIdx === null}
          className="w-full py-3 rounded-[14px] bg-gradient-to-r from-[#2d8a4e] to-[#5cb85c] text-white text-[14px] font-bold disabled:opacity-40 flex items-center justify-center gap-2">
          <Navigation className="w-4 h-4" /> Calculate Eco Routes
        </button>
      </div>

      {/* Route Comparison */}
      <AnimatePresence>
        {showCompare && routes.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="card-surface p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[15px] font-bold text-[#1a2e1a] flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#2d8a4e]" /> Route Comparison
              </h3>
              <span className="text-[10px] text-[#5e7a5e]">{ROUTE_LOCATIONS[fromIdx!].name} → {ROUTE_LOCATIONS[toIdx!].name}</span>
            </div>
            <div className="overflow-x-auto -mx-2">
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="text-[10px] text-[#5e7a5e] uppercase tracking-wider">
                    <th className="text-left py-2 px-2">Mode</th>
                    <th className="text-right py-2 px-2">Dist</th>
                    <th className="text-right py-2 px-2">Time</th>
                    <th className="text-right py-2 px-2">CO₂</th>
                    <th className="text-right py-2 px-2">Cost</th>
                    <th className="text-center py-2 px-2">Eco</th>
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
                            {f.icon}<span className="font-semibold">{f.label}</span>
                            {i === 0 && <span className="text-[8px] px-1.5 py-0.5 rounded bg-[#2d8a4e]/10 text-[#2d8a4e] font-bold">BEST</span>}
                          </div>
                        </td>
                        <td className="text-right py-2.5 px-2 text-[#1a2e1a] font-medium">{r.distance.toFixed(1)} km</td>
                        <td className="text-right py-2.5 px-2 text-[#1a2e1a]">{r.time < 60 ? `${Math.round(r.time)} min` : `${Math.floor(r.time / 60)}h ${Math.round(r.time % 60)}m`}</td>
                        <td className="text-right py-2.5 px-2">
                          <span className={`font-semibold ${r.co2 === 0 ? 'text-[#2d8a4e]' : r.co2 < 100 ? 'text-blue-600' : r.co2 < 500 ? 'text-amber-600' : 'text-red-600'}`}>{r.co2}g</span>
                        </td>
                        <td className="text-right py-2.5 px-2 text-[#1a2e1a]">₹{r.cost}</td>
                        <td className="text-center py-2.5 px-2"><EcoGauge score={r.ecoScore} size={36} /></td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Best Route Hero + Navigate Button */}
      <AnimatePresence>
        {bestRoute && fromIdx !== null && toIdx !== null && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
            className="card-surface p-5">
            <div className="flex items-center gap-4">
              <EcoGauge score={bestRoute.ecoScore} size={80} />
              <div className="flex-1">
                <p className="text-[11px] text-[#5e7a5e] uppercase tracking-wider font-semibold mb-1">Selected Route</p>
                <h3 className="text-[22px] font-bold text-[#1a2e1a] flex items-center gap-2">
                  {getScoreLabel(bestRoute.ecoScore)}
                  <span className="text-[13px] font-normal text-[#5e7a5e]">via {EMISSION_FACTORS[bestRoute.mode].label}</span>
                </h3>
                <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                  <span className="flex items-center gap-1 text-[12px] text-[#5e7a5e]"><Navigation className="w-3 h-3" /> {bestRoute.distance.toFixed(1)} km</span>
                  <span className="flex items-center gap-1 text-[12px] text-[#5e7a5e]"><Clock className="w-3 h-3" /> {Math.round(bestRoute.time)} min</span>
                  <span className="flex items-center gap-1 text-[12px] font-medium" style={{ color: EMISSION_FACTORS[bestRoute.mode].color }}>
                    <Leaf className="w-3 h-3" /> {bestRoute.co2}g CO₂
                  </span>
                </div>
              </div>
            </div>
            {/* EcoScore Bar */}
            <div className="mt-4 h-3 bg-[#e8f5e8] rounded-full overflow-hidden">
              <motion.div className="h-full rounded-full" style={{ background: `linear-gradient(90deg, #22c55e, ${getScoreColor(bestRoute.ecoScore).fill})` }}
                initial={{ width: 0 }} animate={{ width: `${bestRoute.ecoScore}%` }} transition={{ duration: 1 }} />
            </div>
            {/* Navigate in Google Maps */}
            <a href={getDirectionsUrl()} target="_blank" rel="noopener noreferrer"
              className="mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-[14px] bg-[#2d8a4e] text-white text-[14px] font-bold hover:bg-[#246e3f] transition-colors">
              <Navigation className="w-4 h-4" /> Navigate in Google Maps
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   EXPLORE TAB - Eco Places
   ═══════════════════════════════════════════════ */
function ExploreTab() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedPlace, setSelectedPlace] = useState<EcoPlace | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [places, setPlaces] = useState(ECO_PLACES);

  const filteredPlaces = useMemo(() => {
    let filtered = [...places];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(p => p.name.toLowerCase().includes(q) || p.tags.some(t => t.toLowerCase().includes(q)));
    }
    if (selectedCategory !== 'All') filtered = filtered.filter(p => p.category === selectedCategory);
    filtered.sort((a, b) => b.rating - a.rating);
    return filtered;
  }, [places, searchQuery, selectedCategory]);

  const toggleFav = (id: string) => setFavorites(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const handleUpvote = (id: string) => setPlaces(prev => prev.map(p => p.id === id ? { ...p, upvotes: p.upvotes + 1 } : p));
  const handleAddReview = (id: string, text: string) => setPlaces(prev => prev.map(p => p.id === id ? { ...p, reviews: [...p.reviews, { user: 'You', text, date: new Date().toISOString().split('T')[0], rating: 5 }] } : p));

  return (
    <div className="flex flex-col gap-4">
      {/* Search + Categories */}
      <div className="card-surface-sm p-4">
        <div className="flex gap-2 mb-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5e7a5e]" />
            <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search eco places..."
              className="w-full text-[13px] pl-9 pr-3 py-2.5 rounded-[12px] bg-[#f0f7f0] border border-[#2d8a4e]/10 focus:outline-none" />
          </div>
        </div>
        <div className="flex gap-1.5 overflow-x-auto scrollbar-thin pb-1">
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setSelectedCategory(cat)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium whitespace-nowrap transition-all ${selectedCategory === cat ? 'bg-[#2d8a4e] text-white' : 'bg-[#e8f5e8] text-[#5e7a5e]'}`}>
              {cat !== 'All' && CATEGORY_ICONS[cat]} {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Selected Place Detail */}
      <AnimatePresence>
        {selectedPlace && (
          <PlaceDetail key={selectedPlace.id} place={selectedPlace} onClose={() => setSelectedPlace(null)}
            onUpvote={() => handleUpvote(selectedPlace.id)} onAddReview={(text) => handleAddReview(selectedPlace.id, text)} />
        )}
      </AnimatePresence>

      {/* Places Grid */}
      <div>
        <h3 className="text-[15px] font-semibold text-[#1a2e1a] mb-3">Eco Spots ({filteredPlaces.length})</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredPlaces.map(place => (
            <PlaceCard key={place.id} place={place} isSelected={selectedPlace?.id === place.id}
              onSelect={() => setSelectedPlace(place)} onToggleFav={() => toggleFav(place.id)} isFav={favorites.has(place.id)} />
          ))}
        </div>
        {filteredPlaces.length === 0 && (
          <div className="card-surface-sm p-8 text-center">
            <MapPin className="w-8 h-8 text-[#5e7a5e]/30 mx-auto mb-2" />
            <p className="text-[14px] text-[#5e7a5e]">No places found</p>
            <button onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }} className="mt-2 text-[13px] text-[#2d8a4e] font-medium">Clear filters</button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Place Card ── */
function PlaceCard({ place, isSelected, onSelect, onToggleFav, isFav }: { place: EcoPlace; isSelected: boolean; onSelect: () => void; onToggleFav: () => void; isFav: boolean }) {
  return (
    <motion.div layout onClick={onSelect}
      className={`card-surface-sm p-4 cursor-pointer transition-all hover:shadow-md ${isSelected ? 'ring-2 ring-[#2d8a4e]/40' : ''}`}>
      <div className="flex gap-3">
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
                <span className="text-[11px] text-[#5e7a5e]">{place.address}</span>
              </div>
            </div>
            <EcoGauge score={place.rating} size={44} />
          </div>
          <div className="flex flex-wrap gap-1 mt-2">
            {place.tags.slice(0, 3).map(tag => <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-[#2d8a4e]/8 text-[#2d8a4e] font-medium">{tag}</span>)}
          </div>
          <div className="flex items-center gap-3 mt-2">
            <button onClick={(e) => { e.stopPropagation(); onToggleFav(); }} className={`flex items-center gap-1 text-[11px] ${isFav ? 'text-red-500' : 'text-[#5e7a5e]'}`}>
              <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-red-500' : ''}`} /> {isFav ? 'Saved' : 'Save'}
            </button>
            <span className="flex items-center gap-1 text-[11px] text-[#5e7a5e]"><ThumbsUp className="w-3.5 h-3.5" /> {place.upvotes}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ── Place Detail ── */
function PlaceDetail({ place, onClose, onUpvote, onAddReview }: { place: EcoPlace; onClose: () => void; onUpvote: () => void; onAddReview: (text: string) => void }) {
  const [reviewText, setReviewText] = useState('');
  const color = getScoreColor(place.rating);
  const nearestMetro = useMemo(() => {
    let best = { station: METRO_STATIONS[0], dist: Infinity };
    METRO_STATIONS.forEach(s => { const d = Math.sqrt(Math.pow(s.coords[0] - place.coords[0], 2) + Math.pow(s.coords[1] - place.coords[1], 2)); if (d < best.dist) best = { station: s, dist: d }; });
    return best;
  }, [place]);
  const distKm = (d: number) => (d * 111).toFixed(1);

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="card-surface p-5 relative">
      <button onClick={onClose} className="absolute top-4 right-4 z-20 p-1.5 rounded-full bg-[#1a2e1a]/5 hover:bg-[#1a2e1a]/10"><X className="w-4 h-4 text-[#5e7a5e]" /></button>
      <div className="w-full h-[180px] rounded-[14px] overflow-hidden mb-4 bg-[#e8f5e8]">
        <img src={place.image} alt={place.name} className="w-full h-full object-cover" loading="lazy" />
      </div>
      <div className="flex items-start gap-3 mb-3">
        <div className="flex-1">
          <h2 className="text-[18px] font-bold text-[#1a2e1a]">{place.name}</h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[13px] text-[#5e7a5e]">{place.category}</span>
            <MapPin className="w-3.5 h-3.5 text-[#5e7a5e]" />
            <span className="text-[12px] text-[#5e7a5e]">{place.address}</span>
          </div>
        </div>
        <EcoGauge score={place.rating} size={56} />
      </div>
      <p className="text-[13px] text-[#5e7a5e] leading-relaxed mb-3">{place.description}</p>
      <div className="flex items-center gap-2 mb-3 text-[12px] text-[#5e7a5e]"><Clock className="w-3.5 h-3.5" /> {place.hours}</div>
      <div className="card-inset p-3 rounded-[10px] mb-3">
        <p className="text-[11px] font-semibold text-[#1a2e1a] flex items-center gap-1.5"><Route className="w-3.5 h-3.5 text-[#2d8a4e]" /> Nearest Metro</p>
        <div className="flex items-center gap-2 text-[11px] mt-1">
          <span className="w-5 h-5 rounded bg-purple-100 text-purple-700 flex items-center justify-center text-[10px] font-bold">M</span>
          <span className="text-[#1a2e1a] font-medium">{nearestMetro.station.name}</span>
          <span className="text-[#5e7a5e]">~{distKm(nearestMetro.dist)} km</span>
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5 mb-4">
        {place.tags.map(tag => <span key={tag} className="text-[11px] px-2.5 py-1 rounded-full bg-[#2d8a4e]/8 text-[#2d8a4e] font-medium">{tag}</span>)}
      </div>
      <div className="flex gap-2 mb-4">
        <button onClick={onUpvote} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-[12px] bg-[#2d8a4e] text-white text-[13px] font-semibold"><ThumbsUp className="w-4 h-4" /> Upvote ({place.upvotes})</button>
        <a href={`https://www.google.com/maps/dir/?api=1&destination=${place.coords[0]},${place.coords[1]}`} target="_blank" rel="noopener noreferrer"
          className="px-4 py-2.5 rounded-[12px] bg-[#e8f5e8] text-[#2d8a4e] text-[13px] font-semibold flex items-center gap-1.5">
          <Navigation className="w-4 h-4" /> Directions
        </a>
      </div>
      {/* Reviews */}
      <div>
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
            className="flex-1 text-[13px] px-3 py-2 rounded-[10px] bg-[#f0f7f0] border border-[#2d8a4e]/10 focus:outline-none"
            onKeyDown={e => { if (e.key === 'Enter' && reviewText.trim()) { onAddReview(reviewText); setReviewText(''); } }} />
          <button onClick={() => { if (reviewText.trim()) { onAddReview(reviewText); setReviewText(''); } }}
            className="p-2 rounded-[10px] bg-[#2d8a4e] text-white"><Send className="w-4 h-4" /></button>
        </div>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════
   MAIN ECOSPACE VIEW
   ═══════════════════════════════════════════════ */
export function EcoSpaceView() {
  const [activeTab, setActiveTab] = useState<'explore' | 'transit' | 'route'>('explore');

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-4">
      {/* Hero */}
      <div className="card-surface p-5 relative overflow-hidden">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-[#2d8a4e] to-[#5cb85c] flex items-center justify-center"><MapPin className="w-5 h-5 text-white" /></div>
          <div>
            <h1 className="text-[20px] font-bold text-[#1a2e1a]">EcoSpace</h1>
            <p className="text-[12px] text-[#5e7a5e]">Eco places + {BESCOM_STATS.totalChargers} BESCOM EV chargers + transit</p>
          </div>
        </div>
        <div className="flex gap-2 mt-2">
          <button onClick={() => setActiveTab('explore')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-[12px] text-[12px] font-semibold transition-all ${activeTab === 'explore' ? 'bg-[#2d8a4e] text-white shadow-lg shadow-[#2d8a4e]/20' : 'bg-[#e8f5e8] text-[#2d8a4e]'}`}>
            <Compass className="w-4 h-4" /> Explore
          </button>
          <button onClick={() => setActiveTab('transit')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-[12px] text-[12px] font-semibold transition-all ${activeTab === 'transit' ? 'bg-[#1a2e1a] text-white shadow-lg' : 'bg-[#e8f5e8] text-[#1a2e1a]'}`}>
            <MapIcon className="w-4 h-4" /> Transit
          </button>
          <button onClick={() => setActiveTab('route')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-[12px] text-[12px] font-semibold transition-all ${activeTab === 'route' ? 'bg-gradient-to-r from-[#2d8a4e] to-[#5cb85c] text-white shadow-lg' : 'bg-[#e8f5e8] text-[#2d8a4e]'}`}>
            <Route className="w-4 h-4" /> Route Plan
          </button>
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
          <motion.div key="explore" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <ExploreTab />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
