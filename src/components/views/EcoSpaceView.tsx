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
import { RouteMapView } from './RouteMapView';

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

/* ─── Real Bengaluru Eco Places ─── */
const ECO_PLACES: EcoPlace[] = [
  { id: 'p1', name: 'Cubbon Park', category: 'Park', rating: 95, tags: ['Urban Forest', 'Heritage Trees', '6000+ Trees', 'Free Entry'], coords: [12.9763, 77.5929], address: 'Kasturba Rd, Ambedkar Veedhi, Bengaluru 560001', image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop', hours: '6:00 AM – 6:00 PM', description: 'Iconic 300-acre green lung of Bengaluru with over 6000 trees, century-old heritage trees, bandstand, and multiple walking trails. One of the oldest parks in the city, dating back to 1870.', upvotes: 1245, reviews: [{ user: 'Meera J.', text: 'Best morning walk spot in the city. Fresh air and beautiful heritage trees everywhere!', date: '2026-02-13', rating: 5 }, { user: 'Karthik R.', text: 'Perfect for cycling early morning. The Attara Kacheri building backdrop is gorgeous.', date: '2026-02-08', rating: 5 }] },
  { id: 'p2', name: 'Lalbagh Botanical Garden', category: 'Park', rating: 96, tags: ['Botanical Heritage', 'Lake', 'Glass House', '1000+ Species'], coords: [12.9507, 77.5848], address: 'Mavalli, Bengaluru 560004', image: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=400&h=300&fit=crop', hours: '6:00 AM – 7:00 PM', description: 'Historic 240-acre botanical garden established in 1760 by Hyder Ali. Home to the iconic Glass House, a lake, and over 1000 species of flora including rare plants from Persia, Afghanistan, and France.', upvotes: 1567, reviews: [{ user: 'Arjun T.', text: 'A biodiversity treasure right in the heart of the city. The flower show is a must-visit!', date: '2026-02-12', rating: 5 }, { user: 'Divya N.', text: 'The century-old trees are magnificent. Great for nature photography.', date: '2026-02-05', rating: 5 }] },
  { id: 'p3', name: 'Sankey Tank', category: 'Park', rating: 88, tags: ['Lake Walk', 'Bird Watching', 'Jogging Track', 'Free Entry'], coords: [12.9920, 77.5730], address: 'Sadashivanagar, Bengaluru 560080', image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop', hours: '5:00 AM – 8:00 PM', description: 'Beautiful 37-acre lake built in 1882, surrounded by a well-maintained jogging and walking track. Popular spot for morning walkers, birdwatchers, and fitness enthusiasts in north Bengaluru.', upvotes: 678, reviews: [{ user: 'Sneha M.', text: 'Love the jogging track around the lake. Peaceful and well-maintained!', date: '2026-02-10', rating: 4 }, { user: 'Rahul K.', text: 'Great bird watching spot. Spotted kingfishers and herons here!', date: '2026-01-28', rating: 5 }] },
  { id: 'p4', name: 'Carrots - Healthy Kitchen', category: 'Restaurant', rating: 90, tags: ['100% Vegetarian', 'Organic Ingredients', 'Millet Menu', 'No Plastic'], coords: [12.9352, 77.6133], address: '#36, Church St, Haridevpur, Shanthala Nagar, Bengaluru 560001', image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop', hours: '11:00 AM – 10:00 PM', description: 'Popular healthy restaurant in Bangalore serving organic, farm-to-table vegetarian food. Known for millet-based dishes, fresh salads, cold-pressed juices, and zero-plastic policy. Multiple branches across the city.', upvotes: 856, reviews: [{ user: 'Priya S.', text: 'The millet dosa is incredible! Love their commitment to healthy, organic food.', date: '2026-02-11', rating: 5 }, { user: 'Arun V.', text: 'Finally a restaurant that serves genuinely healthy food. The quinoa bowl is my favorite.', date: '2026-02-06', rating: 4 }] },
  { id: 'p5', name: 'Green Theory', category: 'Restaurant', rating: 85, tags: ['Plant-Based Menu', 'Craft Cocktails', 'Eco-Interiors', 'Rooftop'], coords: [12.9610, 77.6387], address: '1st Floor, No. 14/1, 27th Main Rd, HSR Layout Sector 1, Bengaluru 560102', image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=300&fit=crop', hours: '12:00 PM – 11:30 PM', description: 'Trendy plant-based restaurant and bar in HSR Layout. Known for innovative vegan dishes like jackfruit biryani, mushroom steaks, and plant-based desserts. Eco-friendly interiors with reclaimed wood and live plants.', upvotes: 623, reviews: [{ user: 'Nikhil B.', text: 'Jackfruit biryani is insane! The vegan desserts are surprisingly good too.', date: '2026-02-10', rating: 4 }, { user: 'Tanya G.', text: 'Great ambience with live plants everywhere. The mushroom steak blew my mind.', date: '2026-02-03', rating: 5 }] },
  { id: 'p6', name: 'Third Wave Coffee', category: 'Café', rating: 87, tags: ['Specialty Coffee', 'Sustainable Sourcing', 'No Single-Use Plastic'], coords: [12.9784, 77.6408], address: '100 Feet Road, Indiranagar, Bengaluru 560038', image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&h=300&fit=crop', hours: '7:00 AM – 11:00 PM', description: 'Bengaluru-born specialty coffee chain known for ethically sourced beans from Chikmagalur and Coorg estates. Committed to sustainable practices with no single-use plastics, compostable cups, and direct farmer partnerships.', upvotes: 934, reviews: [{ user: 'Ananya M.', text: 'Best coffee in Bangalore! Love that they source directly from local farms.', date: '2026-02-12', rating: 5 }, { user: 'Dev P.', text: 'The Indiranagar outlet has great vibes. Their cold brew is legendary.', date: '2026-02-07', rating: 4 }] },
  { id: 'p7', name: 'Organic World', category: 'Store', rating: 82, tags: ['Certified Organic', 'Local Produce', 'Chemical-Free', 'Bulk Refills'], coords: [12.9698, 77.7500], address: 'ITPL Main Rd, Whitefield, Bengaluru 560066', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=300&fit=crop', hours: '8:00 AM – 9:00 PM', description: 'Certified organic grocery store chain in Bengaluru selling locally sourced, chemical-free fruits, vegetables, grains, and dairy. Offers bulk refill stations for oils and grains to reduce packaging waste.', upvotes: 445, reviews: [{ user: 'Kavya P.', text: 'The vegetables are genuinely organic. You can taste the difference! A bit pricey but worth it.', date: '2026-02-07', rating: 4 }, { user: 'Suresh N.', text: 'Great range of millets and organic staples. The refill station is a fantastic idea.', date: '2026-01-30', rating: 4 }] },
  { id: 'p8', name: 'Sunday Soul Sante', category: 'Market', rating: 86, tags: ['Handmade Goods', 'Local Artisans', 'Sustainable Fashion', 'Live Music'], coords: [12.9850, 77.5533], address: 'Jayamahal Palace Grounds, Bengaluru 560006', image: 'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?w=400&h=300&fit=crop', hours: '10 AM – 10 PM (Sundays only)', description: 'Bengaluru\'s most popular flea market held every Sunday at Palace Grounds. Features 200+ stalls of handmade crafts, sustainable fashion, organic food, vintage items, and local art. Promotes eco-friendly shopping and supports local artisans.', upvotes: 1123, reviews: [{ user: 'Aditi K.', text: 'Amazing handcrafted products! I found beautiful upcycled jewelry and organic skincare.', date: '2026-02-09', rating: 5 }, { user: 'Rohan S.', text: 'The best Sunday plan in Bangalore. Great food, music, and eco-friendly shopping!', date: '2026-02-02', rating: 5 }] },
  { id: 'p9', name: 'Bangalore Bamboo Nest', category: 'Café', rating: 84, tags: ['Bamboo Architecture', 'Organic Menu', 'Rainwater Harvesting'], coords: [12.9270, 77.6320], address: '80 Feet Road, Koramangala, Bengaluru 560034', image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=300&fit=crop', hours: '8:00 AM – 10:00 PM', description: 'Eco-café built primarily with bamboo and reclaimed materials. Features an organic menu, rainwater harvesting system, and composting of all food waste. Solar panels supplement 40% of electricity needs.', upvotes: 389, reviews: [{ user: 'Isha L.', text: 'The bamboo interiors create such a calming vibe. Their organic chai is perfect!', date: '2026-02-08', rating: 4 }, { user: 'Varun M.', text: 'Great concept - love that they compost all their waste. Food is delicious too.', date: '2026-01-25', rating: 4 }] },
  { id: 'p10', name: 'WeWork Galaxy', category: 'Co-Working', rating: 89, tags: ['Green Building', 'Paperless Office', 'EV Charging', 'Energy Efficient'], coords: [12.9692, 77.6118], address: '43, Residency Rd, Ashok Nagar, Bengaluru 560025', image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop', hours: '6:00 AM – 11:00 PM', description: 'LEED Gold certified co-working space with extensive sustainability practices. Features energy-efficient lighting, EV charging stations, paperless operations, water recycling, and indoor air purification with live plants throughout.', upvotes: 567, reviews: [{ user: 'Vikram D.', text: 'Fantastic workspace. Love the green initiatives and the EV charging is a huge plus!', date: '2026-02-11', rating: 5 }, { user: 'Preethi R.', text: 'Best co-working in Bangalore. The indoor plants and natural lighting make a real difference.', date: '2026-02-04', rating: 4 }] },
  { id: 'p11', name: 'Bannerghatta Biological Park', category: 'Park', rating: 91, tags: ['Wildlife', 'Safari', 'Butterfly Park', 'Conservation'], coords: [12.8005, 77.5773], address: 'Bannerghatta Main Rd, Bengaluru 560083', image: 'https://images.unsplash.com/photo-1474511320723-9a56873571b7?w=400&h=300&fit=crop', hours: '9:30 AM – 5:00 PM (Closed Tuesdays)', description: 'Sprawling 731-hectare biological park featuring a zoo, safari, butterfly park, and rescue center. Major conservation center for endangered species. The butterfly park is India\'s first and largest with over 20 species.', upvotes: 987, reviews: [{ user: 'Amitha S.', text: 'The butterfly park is magical! Kids absolutely loved the safari too.', date: '2026-02-09', rating: 5 }, { user: 'Ganesh R.', text: 'Great conservation work happening here. The lion safari is thrilling!', date: '2026-01-22', rating: 4 }] },
  { id: 'p12', name: 'Bare Necessities', category: 'Store', rating: 83, tags: ['Zero Waste', 'Handmade', 'Plastic-Free', 'Refills'], coords: [12.9356, 77.6140], address: 'Koramangala 4th Block, Bengaluru 560034', image: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=400&h=300&fit=crop', hours: '10:00 AM – 7:00 PM', description: 'India\'s first zero-waste personal care brand, founded in Bengaluru. Sells handmade, plastic-free soaps, shampoo bars, deodorants, and household cleaners. All products are biodegradable and come in compostable packaging.', upvotes: 534, reviews: [{ user: 'Meghana K.', text: 'Their shampoo bars are amazing! No plastic waste and my hair has never been better.', date: '2026-02-06', rating: 5 }, { user: 'Swati D.', text: 'Love this brand! The dish soap bar works incredibly well. True zero-waste living.', date: '2026-01-18', rating: 5 }] },
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
    const [showStations, setShowStations] = useState(false);

    const filteredEv = useMemo(() => {
      if (evFilter === 'all') return BESCOM_EV_STATIONS;
      return BESCOM_EV_STATIONS.filter(s => s.types.some(t => t.includes(evFilter)));
    }, [evFilter]);

    const layers: { key: TransitLayer; icon: React.ReactNode; label: string; count: number; color: string; sub: string }[] = [
      { key: 'metro', icon: <Train className="w-4 h-4" />, label: 'Namma Metro', count: 68, color: '#7c3aed', sub: 'Purple + Green + Yellow Lines' },
      { key: 'bus', icon: <Bus className="w-4 h-4" />, label: 'BMTC Bus', count: 18, color: '#14b8a6', sub: 'TTMCs & Major Hubs' },
      { key: 'ev', icon: <Zap className="w-4 h-4" />, label: 'BESCOM EV', count: BESCOM_STATS.totalLocations, color: '#2563eb', sub: `${BESCOM_STATS.totalChargers} chargers` },
      { key: 'bike', icon: <Bike className="w-4 h-4" />, label: 'Cycle/Bike', count: CYCLE_STATIONS.length, color: '#f97316', sub: 'Yulu, Bounce, Pedl' },
    ];

    return (
      <div className="flex flex-col gap-4">
        {/* ═══ REAL ROUTE PLANNER (Google Maps) ═══ */}
        <div className="card-surface overflow-hidden rounded-[16px]">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-[#2d8a4e]/10">
            <div className="w-8 h-8 rounded-[10px] bg-gradient-to-br from-[#4285f4] to-[#34a853] flex items-center justify-center">
              <Route className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-[15px] font-bold text-[#1a2e1a]">Route Planner</h3>
              <p className="text-[11px] text-[#5e7a5e]">Real routes, live GPS tracking, CO₂ calculation</p>
            </div>
          </div>
          <RouteMapView />
        </div>

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

        {/* Station Details per Layer */}
        <button onClick={() => setShowStations(!showStations)}
          className="flex items-center justify-between w-full p-3 rounded-[12px] bg-[#e8f5e8] text-[#2d8a4e] text-[13px] font-semibold">
          <span className="flex items-center gap-2">
            {layers.find(l => l.key === activeLayer)?.icon}
            {layers.find(l => l.key === activeLayer)?.label} Stations
          </span>
          {showStations ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        <AnimatePresence>
          {showStations && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
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
                  <div className="space-y-1.5">
                    {METRO_STATIONS.map(s => (
                      <div key={s.id} className="card-inset px-3 py-2.5 rounded-[10px] flex items-center gap-3">
                        <span className="w-7 h-7 rounded-[8px] flex items-center justify-center text-[11px] font-bold flex-shrink-0 text-white"
                          style={{ backgroundColor: s.line === 'purple' ? '#7c3aed' : s.line === 'green' ? '#16a34a' : '#eab308' }}>M</span>
                        <div className="min-w-0 flex-1">
                          <p className="text-[12px] font-semibold text-[#1a2e1a] truncate">{s.name}</p>
                          <p className="text-[10px] text-[#5e7a5e]">{s.detail}</p>
                        </div>
                        <a href={`https://www.google.com/maps/search/${encodeURIComponent(s.name + ' Metro Bengaluru')}`} target="_blank" rel="noopener noreferrer"
                          className="p-1.5 rounded-full bg-purple-50 text-purple-600 flex-shrink-0"><ExternalLink className="w-3.5 h-3.5" /></a>
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
                <div className="space-y-3">
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
                </div>
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
            <a href={`https://www.google.com/maps/dir/?api=1&destination=${place.coords[0]},${place.coords[1]}`} target="_blank" rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()} className="flex items-center gap-1 text-[11px] text-[#2d8a4e] font-medium ml-auto">
              <Navigation className="w-3.5 h-3.5" /> Navigate
            </a>
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
      {/* Google Maps Actions */}
      <div className="card-inset p-3 rounded-[12px] mb-4 space-y-2">
        <a href={`https://www.google.com/maps/dir/?api=1&destination=${place.coords[0]},${place.coords[1]}&destination_place_id=${encodeURIComponent(place.name + ' ' + place.address)}`} target="_blank" rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2 py-3 rounded-[12px] bg-[#2d8a4e] text-white text-[13px] font-semibold shadow-md shadow-[#2d8a4e]/20">
          <Navigation className="w-4 h-4" /> Navigate to {place.name}
        </a>
        <div className="flex gap-2">
          <a href={`https://www.google.com/maps/search/${encodeURIComponent(place.name + ' ' + place.address)}`} target="_blank" rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-[10px] bg-blue-50 text-blue-700 text-[12px] font-semibold">
            <MapPin className="w-3.5 h-3.5" /> View on Maps
          </a>
          <a href={`https://www.google.com/maps/search/${encodeURIComponent(place.name + ' Bengaluru')}#reviews`} target="_blank" rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-[10px] bg-amber-50 text-amber-700 text-[12px] font-semibold">
            <Star className="w-3.5 h-3.5" /> Google Reviews
          </a>
        </div>
      </div>
      <div className="flex gap-2 mb-4">
        <button onClick={onUpvote} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-[12px] bg-[#e8f5e8] text-[#2d8a4e] text-[13px] font-semibold"><ThumbsUp className="w-4 h-4" /> Upvote ({place.upvotes})</button>
        <a href={`https://www.google.com/maps/place/${place.coords[0]},${place.coords[1]}`} target="_blank" rel="noopener noreferrer"
          className="px-4 py-2.5 rounded-[12px] bg-[#f0f7f0] text-[#5e7a5e] text-[13px] font-semibold flex items-center gap-1.5">
          <ExternalLink className="w-4 h-4" /> Share Location
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
  const [activeTab, setActiveTab] = useState<'explore' | 'transit'>('explore');

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
            <MapIcon className="w-4 h-4" /> Transit & Routes
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'transit' ? (
          <motion.div key="transit" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <TransitMapTab />
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
