'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';
import {
  ChevronRight, ChevronLeft, Flame, Target, Zap, Droplets, BatteryCharging,
  Footprints, Leaf, Calendar, CheckCircle, Train, TrendingUp,
  Sparkles, Play, Square, MapPin, Timer, X, Trophy
} from 'lucide-react';
import { User } from '@/types';
import { useExtensionStore } from '@/store/useExtensionStore';

/* ─── Activities State (shared with ActivitiesView) ─── */
const ACTIVITIES_KEY = 'lumeiq_activities_state';

interface ActivitiesState {
  pillarE: number; pillarS: number; pillarEc: number;
  greenCredits: number; totalCarbonSaved: number;
  purchaseCount: number; transitCount: number; verificationCount: number;
  ecoPoints: number; verifiedImpacts: VerifiedImpact[];
  transitLogs: TransitLogEntry[]; redeemedCoupons: string[];
}

interface VerifiedImpact {
  id: string; type: 'purchase' | 'transit' | 'photo';
  pillar: 'E' | 'S' | 'Ec'; description: string;
  carbonSaved: number; points: number; date: string; verified: boolean;
}

interface TransitLogEntry {
  id: string; from: string; to: string; mode: string;
  distanceKm: number; carbonEmitted: number; carbonSaved: number;
  moneySaved: number; date: string;
}

function defaultActivitiesState(): ActivitiesState {
  return {
    pillarE: 20, pillarS: 15, pillarEc: 10,
    greenCredits: 0, totalCarbonSaved: 0,
    purchaseCount: 0, transitCount: 0, verificationCount: 0,
    ecoPoints: 0, verifiedImpacts: [], transitLogs: [], redeemedCoupons: [],
  };
}

function loadActivitiesState(): ActivitiesState {
  if (typeof window === 'undefined') return defaultActivitiesState();
  const raw = localStorage.getItem(ACTIVITIES_KEY);
  return raw ? { ...defaultActivitiesState(), ...JSON.parse(raw) } : defaultActivitiesState();
}

/* ─── Eco Calendar Helpers ─── */
const DAILY_CHALLENGES = [
  { title: 'Meatless Monday', description: 'Skip meat today and try a plant-based meal', icon: '🥬', pillar: 'Environmental', points: 12, carbonSaved: 2500, color: '#30d158' },
  { title: 'Walk to Work', description: 'Ditch the car and walk or cycle to your destination', icon: '🚶', pillar: 'Environmental', points: 15, carbonSaved: 3200, color: '#30d158' },
  { title: 'Donate Day', description: 'Donate unused clothes or items to a local charity', icon: '🤝', pillar: 'Social', points: 10, carbonSaved: 800, color: '#007aff' },
  { title: 'No Plastic', description: 'Avoid all single-use plastic for the entire day', icon: '♻️', pillar: 'Environmental', points: 14, carbonSaved: 1200, color: '#30d158' },
  { title: 'Local Shop', description: 'Buy groceries from a local or farmers market', icon: '🏪', pillar: 'Economic', points: 8, carbonSaved: 600, color: '#ff9f0a' },
  { title: 'Energy Saver', description: 'Turn off all standby appliances and save power', icon: '💡', pillar: 'Environmental', points: 10, carbonSaved: 1800, color: '#30d158' },
  { title: 'Community Clean', description: 'Pick up litter in your neighbourhood for 15 mins', icon: '🧹', pillar: 'Social', points: 12, carbonSaved: 400, color: '#007aff' },
  { title: 'Metro Day', description: 'Use public transit for all your trips today', icon: '🚇', pillar: 'Environmental', points: 18, carbonSaved: 4100, color: '#30d158' },
  { title: 'Thrift Find', description: 'Visit a thrift store or buy something second-hand', icon: '👕', pillar: 'Economic', points: 10, carbonSaved: 2000, color: '#ff9f0a' },
  { title: 'Water Watch', description: 'Take a 5-min shower and track your water usage', icon: '💧', pillar: 'Environmental', points: 8, carbonSaved: 900, color: '#30d158' },
  { title: 'Teach Green', description: 'Share one eco tip with a friend or on social media', icon: '📢', pillar: 'Social', points: 6, carbonSaved: 200, color: '#007aff' },
  { title: 'Refill Day', description: 'Use a reusable bottle and cup for all drinks', icon: '🫗', pillar: 'Environmental', points: 10, carbonSaved: 500, color: '#30d158' },
  { title: 'Budget Green', description: 'Track your spending and identify one eco swap', icon: '📊', pillar: 'Economic', points: 8, carbonSaved: 700, color: '#ff9f0a' },
  { title: 'Plant Something', description: 'Plant a herb, seed, or tend to a houseplant', icon: '🌱', pillar: 'Environmental', points: 12, carbonSaved: 300, color: '#30d158' },
  { title: 'Volunteer Hour', description: 'Spend 1 hour volunteering for a local cause', icon: '🙌', pillar: 'Social', points: 15, carbonSaved: 0, color: '#007aff' },
  { title: 'Cycle Sprint', description: 'Cycle instead of driving for at least one trip', icon: '🚴', pillar: 'Environmental', points: 16, carbonSaved: 3500, color: '#30d158' },
  { title: 'Repair Cafe', description: 'Fix something broken instead of replacing it', icon: '🔧', pillar: 'Economic', points: 12, carbonSaved: 1500, color: '#ff9f0a' },
  { title: 'Digital Detox', description: 'Reduce screen time by 2 hours to save energy', icon: '📵', pillar: 'Environmental', points: 8, carbonSaved: 400, color: '#30d158' },
  { title: 'Meal Prep', description: 'Cook in bulk to reduce food waste this week', icon: '🍱', pillar: 'Environmental', points: 10, carbonSaved: 1100, color: '#30d158' },
  { title: 'Support Local', description: 'Buy from a small local business today', icon: '🏠', pillar: 'Economic', points: 10, carbonSaved: 500, color: '#ff9f0a' },
  { title: 'Car Pool', description: 'Share a ride with a colleague or neighbour', icon: '🚗', pillar: 'Social', points: 14, carbonSaved: 2800, color: '#007aff' },
  { title: 'Zero Waste', description: 'Try to produce zero landfill waste today', icon: '🗑️', pillar: 'Environmental', points: 18, carbonSaved: 2200, color: '#30d158' },
  { title: 'Eco Review', description: 'Scan 3 products and check their sustainability score', icon: '📱', pillar: 'Economic', points: 10, carbonSaved: 600, color: '#ff9f0a' },
  { title: 'Nature Walk', description: 'Spend 30 minutes outdoors appreciating nature', icon: '🌳', pillar: 'Social', points: 6, carbonSaved: 100, color: '#007aff' },
  { title: 'Compost Start', description: 'Start composting food scraps or add to existing', icon: '🪱', pillar: 'Environmental', points: 14, carbonSaved: 1600, color: '#30d158' },
  { title: 'Eco Gift', description: 'Give someone a sustainable or handmade gift', icon: '🎁', pillar: 'Social', points: 8, carbonSaved: 400, color: '#007aff' },
  { title: 'Green Finance', description: 'Review your investments for ESG alignment', icon: '💚', pillar: 'Economic', points: 10, carbonSaved: 0, color: '#ff9f0a' },
  { title: 'Air Dry', description: 'Air dry clothes instead of using a dryer', icon: '👔', pillar: 'Environmental', points: 8, carbonSaved: 2300, color: '#30d158' },
  { title: 'Kindness Act', description: 'Do one random act of kindness for a stranger', icon: '💛', pillar: 'Social', points: 10, carbonSaved: 0, color: '#007aff' },
  { title: 'Upcycle', description: 'Turn something old into something new and useful', icon: '🎨', pillar: 'Economic', points: 12, carbonSaved: 1000, color: '#ff9f0a' },
  { title: 'Reflect & Plan', description: 'Review your month and set next month eco goals', icon: '📝', pillar: 'Social', points: 8, carbonSaved: 0, color: '#007aff' },
];

function getDailyChallenge(day: number, month: number) {
  const index = ((day - 1) + month * 7) % DAILY_CHALLENGES.length;
  return DAILY_CHALLENGES[index];
}

type ImpactTier = 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
function getTier(iq: number): ImpactTier {
  if (iq >= 85) return 'Platinum';
  if (iq >= 70) return 'Gold';
  if (iq >= 50) return 'Silver';
  return 'Bronze';
}
const TIER_COLORS: Record<ImpactTier, string> = { Bronze: '#cd7f32', Silver: '#c0c0c0', Gold: '#ffd700', Platinum: '#e5e4e2' };

function calculateIQ(e: number, s: number, ec: number): number {
  const eNorm = Math.min(e, 100) / 100;
  const sNorm = Math.min(s, 100) / 100;
  const ecNorm = Math.min(ec, 100) / 100;
  return Math.round((0.4 * eNorm + 0.3 * sNorm + 0.3 * ecNorm) * 100);
}

/* ─── Activity Ring SVG (Apple Fitness style) ─── */
function ActivityRing({ value, max, color, size, strokeWidth = 8 }: {
  value: number; max: number; color: string; size: number; strokeWidth?: number;
}) {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const pct = max > 0 ? Math.min(value / max, 1) : 0;

  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={color} strokeWidth={strokeWidth} opacity={0.2} strokeLinecap="round" />
      <motion.circle cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: circ - pct * circ }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
      />
    </svg>
  );
}

function TripleRings({ rings }: { rings: { circularity: number; consumption: number; mobility: number } }) {
  const data = [
    { value: rings.circularity, color: '#ff375f', label: 'Circularity', icon: '→' },
    { value: rings.consumption, color: '#30d158', label: 'Consumption', icon: '»' },
    { value: rings.mobility, color: '#5ac8fa', label: 'Mobility', icon: '↑' },
  ];

  return (
    <div className="relative w-[160px] h-[160px] flex items-center justify-center">
      <div className="absolute"><ActivityRing value={data[0].value} max={100} color={data[0].color} size={160} strokeWidth={14} /></div>
      <div className="absolute"><ActivityRing value={data[1].value} max={100} color={data[1].color} size={124} strokeWidth={14} /></div>
      <div className="absolute"><ActivityRing value={data[2].value} max={100} color={data[2].color} size={88} strokeWidth={14} /></div>
      <div className="flex flex-col items-center gap-0 z-10">
        <span className="text-[10px] font-bold" style={{ color: data[0].color }}>→</span>
        <span className="text-[10px] font-bold" style={{ color: data[1].color }}>»</span>
        <span className="text-[10px] font-bold" style={{ color: data[2].color }}>↑</span>
      </div>
    </div>
  );
}

/* ─── Suggested Activities ─── */
interface ActivityType {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  gradient: string;
  pillar: string;
  co2PerMin: number; // grams CO2 saved per minute
  pointsPerMin: number;
  hasDestination: boolean;
}

const SUGGESTED_ACTIVITIES: ActivityType[] = [
  {
    id: 'bicycle',
    title: 'Bicycle\nCommute',
    subtitle: 'Cycle to your destination & save CO₂',
    icon: '🚴',
    gradient: 'from-[#0d9488] to-[#14b8a6]',
    pillar: 'Environmental',
    co2PerMin: 150, // ~150g CO2 saved per min vs car
    pointsPerMin: 2,
    hasDestination: true,
  },
  {
    id: 'metro',
    title: 'Metro / Public\nTransport',
    subtitle: 'Take public transit & reduce emissions',
    icon: '🚇',
    gradient: 'from-[#0284c7] to-[#38bdf8]',
    pillar: 'Environmental',
    co2PerMin: 100,
    pointsPerMin: 1.5,
    hasDestination: true,
  },
  {
    id: 'walking',
    title: 'Walking / Step\nChallenge',
    subtitle: 'Walk more, drive less — zero emissions',
    icon: '🚶',
    gradient: 'from-[#16a34a] to-[#4ade80]',
    pillar: 'Environmental',
    co2PerMin: 120,
    pointsPerMin: 1.8,
    hasDestination: false,
  },
  {
    id: 'jogging',
    title: 'Jogging /\nRunning',
    subtitle: 'Eco-friendly fitness with real impact',
    icon: '🏃',
    gradient: 'from-[#ea580c] to-[#f59e0b]',
    pillar: 'Environmental + Economic',
    co2PerMin: 130,
    pointsPerMin: 2.2,
    hasDestination: false,
  },
];

interface ActiveSession {
  activity: ActivityType;
  from: string;
  to: string;
  startTime: number;
}

interface CompletedSession {
  activity: ActivityType;
  from: string;
  to: string;
  durationSec: number;
  co2Saved: number;
  points: number;
}



export function DashboardView() {
  const { user, setView } = useStore();
  const { totalCarbonSaved: extCarbonSaved, availableCoupons, initializeExtensions, initialized, totalEcoRoutes, purchaseHistory } = useExtensionStore();
  const [actState, setActState] = useState<ActivitiesState>(defaultActivitiesState());

  // Activity session state
  const [selectedActivity, setSelectedActivity] = useState<ActivityType | null>(null);
  const [sessionFrom, setSessionFrom] = useState('');
  const [sessionTo, setSessionTo] = useState('');
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(null);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [completedSession, setCompletedSession] = useState<CompletedSession | null>(null);

  // Eco Calendar state
  const now = new Date();
  const [calendarMonth, setCalendarMonth] = useState(now.getMonth());
  const [calendarYear, setCalendarYear] = useState(now.getFullYear());
  const [selectedDay, setSelectedDay] = useState<number | null>(now.getDate());

  const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(calendarYear, calendarMonth, 1).getDay();
  const monthName = new Date(calendarYear, calendarMonth).toLocaleString('en', { month: 'long', year: 'numeric' });
  const todayChallenge = selectedDay ? getDailyChallenge(selectedDay, calendarMonth) : null;

  if (!user) return null;

  // Initialize extensions on mount
  if (!initialized) {
    initializeExtensions(user.id, user.IQ, user.createdAt);
  }

  // Load activities state
  useEffect(() => {
    setActState(loadActivitiesState());
  }, []);

  // Timer tick
  useEffect(() => {
    if (!activeSession) return;
    const interval = setInterval(() => {
      setElapsedSec(Math.floor((Date.now() - activeSession.startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [activeSession]);

  // Start activity session
  const startSession = (activity: ActivityType) => {
    if (activity.hasDestination) {
      setSelectedActivity(activity);
      setSessionFrom('');
      setSessionTo('');
    } else {
      setActiveSession({ activity, from: '', to: '', startTime: Date.now() });
      setElapsedSec(0);
      setSelectedActivity(null);
    }
  };

  const startWithDestination = () => {
    if (!selectedActivity) return;
    setActiveSession({ activity: selectedActivity, from: sessionFrom, to: sessionTo, startTime: Date.now() });
    setElapsedSec(0);
    setSelectedActivity(null);
  };

  const stopSession = () => {
    if (!activeSession) return;
    const durationSec = Math.floor((Date.now() - activeSession.startTime) / 1000);
    const durationMin = durationSec / 60;
    const co2Saved = Math.round(activeSession.activity.co2PerMin * durationMin);
    const points = Math.round(activeSession.activity.pointsPerMin * durationMin);

    const completed: CompletedSession = {
      activity: activeSession.activity,
      from: activeSession.from,
      to: activeSession.to,
      durationSec,
      co2Saved,
      points,
    };
    setCompletedSession(completed);

    // Save to localStorage
    const state = loadActivitiesState();
    const impact: VerifiedImpact = {
      id: `session-${Date.now()}`,
      type: 'transit',
      pillar: 'E',
      description: `${activeSession.activity.title.replace('\n', ' ')}${activeSession.from ? ` — ${activeSession.from} to ${activeSession.to}` : ''}`,
      carbonSaved: co2Saved,
      points,
      date: new Date().toISOString(),
      verified: true,
    };
    state.verifiedImpacts.push(impact);
    state.totalCarbonSaved += co2Saved;
    state.ecoPoints += points;
    state.transitCount += 1;
    state.verificationCount += 1;
    state.pillarE = Math.min(100, state.pillarE + Math.round(points / 3));
    if (activeSession.activity.pillar.includes('Economic')) {
      state.pillarEc = Math.min(100, state.pillarEc + Math.round(points / 5));
    }
    localStorage.setItem(ACTIVITIES_KEY, JSON.stringify(state));
    setActState(state);

    setActiveSession(null);
    setElapsedSec(0);
  };

  const formatTime = (sec: number) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const iq = useMemo(() => calculateIQ(actState.pillarE, actState.pillarS, actState.pillarEc), [actState.pillarE, actState.pillarS, actState.pillarEc]);
  const tier = useMemo(() => getTier(iq), [iq]);

  // Compute real stats
  const streakDays = useMemo(() => {
    const logDates = new Set(user.dailyLogs.map(l => l.date));
    const impactDates = new Set(actState.verifiedImpacts.map(v => new Date(v.date).toISOString().slice(0, 10)));
    const allDates = new Set([...logDates, ...impactDates]);
    if (allDates.size === 0) return 0;
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      if (allDates.has(dateStr)) streak++;
      else break;
    }
    return streak;
  }, [user.dailyLogs, actState.verifiedImpacts]);

  const totalCO2Saved = useMemo(() => {
    const fromAct = actState.totalCarbonSaved;
    const fromExt = extCarbonSaved;
    return Math.max(fromAct, fromExt);
  }, [actState.totalCarbonSaved, extCarbonSaved]);

  const totalTrips = useMemo(() => {
    return Math.max(actState.transitCount, totalEcoRoutes);
  }, [actState.transitCount, totalEcoRoutes]);

  const prevMonth = () => {
    if (calendarMonth === 0) { setCalendarMonth(11); setCalendarYear(calendarYear - 1); }
    else setCalendarMonth(calendarMonth - 1);
    setSelectedDay(null);
  };
  const nextMonth = () => {
    if (calendarMonth === 11) { setCalendarMonth(0); setCalendarYear(calendarYear + 1); }
    else setCalendarMonth(calendarMonth + 1);
    setSelectedDay(null);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-4">
      {/* Activity Card - Apple Fitness style */}
      <section>
        <h2 className="text-[22px] font-bold text-[var(--ios-label)] mb-3">Activity</h2>
        <div className="ios-card p-5">
          <div className="flex items-center gap-6">
            <TripleRings rings={user.rings} />
            <div className="flex-1 space-y-4">
              <RingStat label="Circularity" value={Math.round(user.rings.circularity)} unit="/100" color="#ff375f" />
              <RingStat label="Consumption" value={Math.round(user.rings.consumption)} unit="/100" color="#30d158" />
              <RingStat label="Mobility" value={Math.round(user.rings.mobility)} unit="/100" color="#5ac8fa" />
            </div>
          </div>
          <div className="flex gap-4 mt-5 pt-4" style={{ borderTop: '0.5px solid var(--ios-separator)' }}>
            <div className="flex-1">
              <p className="text-[11px] text-[var(--ios-tertiary-label)]">Impact IQ</p>
              <p className="text-[22px] font-bold tabular-nums text-[var(--ios-label)]">{Math.round(user.IQ)}</p>
            </div>
            <div className="flex-1">
              <p className="text-[11px] text-[var(--ios-tertiary-label)]">Tier</p>
              <p className="text-[22px] font-bold text-[var(--ios-label)]">{user.tier}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Weekly Goals */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[22px] font-bold text-[var(--ios-label)]">Goals</h2>
          <span className="text-[15px] text-[var(--ios-blue)] font-medium">Show More</span>
        </div>
        <div className="space-y-2">
          {getGoals(user).map((goal, i) => (
            <GoalRow key={i} goal={goal} index={i} />
          ))}
        </div>
      </section>

          {/* Suggested Activities */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-[22px] font-bold text-[var(--ios-label)]">Suggested Activity</h2>
                <p className="text-[13px] text-[var(--ios-tertiary-label)]">Track your eco-friendly commutes</p>
              </div>
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[var(--ios-blue)]/10">
                <Timer className="w-3.5 h-3.5 text-[var(--ios-blue)]" />
                <span className="text-[12px] font-semibold text-[var(--ios-blue)]">Live Timer</span>
              </div>
            </div>

            <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 snap-x snap-mandatory scrollbar-none">
              {SUGGESTED_ACTIVITIES.map((activity, i) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  onClick={() => !activeSession && startSession(activity)}
                  className={`snap-start shrink-0 w-[280px] rounded-[20px] bg-gradient-to-br ${activity.gradient} p-5 relative overflow-hidden cursor-pointer ios-press ${activeSession ? 'opacity-50 pointer-events-none' : ''}`}
                  style={{ minHeight: '200px' }}
                >
                  <div className="flex items-center justify-between mb-6">
                    <span className="px-2.5 py-1 rounded-full bg-white/20 text-[11px] font-semibold text-white tracking-wide uppercase">
                      {activity.pillar}
                    </span>
                    <span className="text-[28px]">{activity.icon}</span>
                  </div>
                  <h3 className="text-[24px] font-bold text-white leading-tight whitespace-pre-line mb-3">
                    {activity.title}
                  </h3>
                  <div className="bg-white/20 backdrop-blur-sm rounded-[10px] px-3 py-2 mb-3">
                    <p className="text-[13px] text-white/90">{activity.subtitle}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <Leaf className="w-3.5 h-3.5 text-white/80" />
                      <span className="text-[13px] text-white/90 font-medium">
                        {activity.co2PerMin}g/min
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Play className="w-3.5 h-3.5 text-white/80" />
                      <span className="text-[14px] font-bold text-white">
                        Tap to Start
                      </span>
                    </div>
                  </div>
                  {activity.hasDestination && (
                    <div className="absolute top-3 right-3">
                      <MapPin className="w-4 h-4 text-white/40" />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </section>

        {/* ═══ Destination Input Modal ═══ */}
        <AnimatePresence>
          {selectedActivity && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm"
              onClick={() => setSelectedActivity(null)}
            >
              <motion.div
                initial={{ y: 300 }} animate={{ y: 0 }} exit={{ y: 300 }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                className="w-full max-w-[430px] bg-[var(--ios-card-bg)] rounded-t-[24px] p-6 pb-10"
                onClick={e => e.stopPropagation()}
              >
                <div className="w-10 h-1 rounded-full bg-[var(--ios-separator)] mx-auto mb-5" />
                <div className="flex items-center gap-3 mb-5">
                  <span className="text-[32px]">{selectedActivity.icon}</span>
                  <div>
                    <h3 className="text-[20px] font-bold text-[var(--ios-label)]">{selectedActivity.title.replace('\n', ' ')}</h3>
                    <p className="text-[13px] text-[var(--ios-tertiary-label)]">Add your destinations</p>
                  </div>
                </div>
                <div className="space-y-3 mb-6">
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[#30d158]" />
                    <input
                      type="text"
                      value={sessionFrom}
                      onChange={e => setSessionFrom(e.target.value)}
                      placeholder="From (e.g. Home, Office)"
                      className="w-full h-[48px] pl-11 pr-4 rounded-[14px] bg-[var(--ios-bg)] border border-[var(--ios-separator)] text-[15px] text-[var(--ios-label)] placeholder:text-[var(--ios-tertiary-label)] focus:outline-none focus:border-[var(--ios-blue)] transition-colors"
                    />
                  </div>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[var(--ios-red,#ff3b30)]" />
                    <input
                      type="text"
                      value={sessionTo}
                      onChange={e => setSessionTo(e.target.value)}
                      placeholder="To (e.g. Mall, Station)"
                      className="w-full h-[48px] pl-11 pr-4 rounded-[14px] bg-[var(--ios-bg)] border border-[var(--ios-separator)] text-[15px] text-[var(--ios-label)] placeholder:text-[var(--ios-tertiary-label)] focus:outline-none focus:border-[var(--ios-blue)] transition-colors"
                    />
                  </div>
                </div>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={startWithDestination}
                  disabled={!sessionFrom.trim() || !sessionTo.trim()}
                  className="w-full h-[52px] rounded-[16px] bg-[#30d158] text-white font-bold text-[17px] flex items-center justify-center gap-2 disabled:opacity-40 transition-opacity"
                >
                  <Play className="w-5 h-5" /> Start Activity
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ═══ Active Timer Overlay ═══ */}
        <AnimatePresence>
          {activeSession && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}
                className="w-[calc(100%-32px)] max-w-[380px] bg-[var(--ios-card-bg)] rounded-[28px] p-8 text-center relative overflow-hidden"
              >
                {/* Background gradient */}
                <div className={`absolute inset-0 opacity-10 bg-gradient-to-br ${activeSession.activity.gradient}`} />
                <div className="relative z-10">
                  <span className="text-[48px] mb-2 block">{activeSession.activity.icon}</span>
                  <h3 className="text-[20px] font-bold text-[var(--ios-label)] mb-1">
                    {activeSession.activity.title.replace('\n', ' ')}
                  </h3>
                  {activeSession.from && (
                    <p className="text-[13px] text-[var(--ios-tertiary-label)] mb-4">
                      {activeSession.from} → {activeSession.to}
                    </p>
                  )}
                  {!activeSession.from && <div className="mb-4" />}

                  {/* Timer */}
                  <div className="my-6">
                    <motion.p
                      className="text-[64px] font-bold tabular-nums text-[var(--ios-label)] leading-none tracking-tight"
                      key={elapsedSec}
                      initial={{ scale: 1.02 }}
                      animate={{ scale: 1 }}
                    >
                      {formatTime(elapsedSec)}
                    </motion.p>
                    <p className="text-[13px] text-[var(--ios-tertiary-label)] mt-2">
                      {elapsedSec > 0 ? 'Activity in progress...' : 'Timer started!'}
                    </p>
                  </div>

                  {/* Live stats */}
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="ios-card p-3">
                      <p className="text-[11px] text-[var(--ios-tertiary-label)]">CO₂ Saved</p>
                      <p className="text-[20px] font-bold text-[#30d158] tabular-nums">
                        {Math.round(activeSession.activity.co2PerMin * (elapsedSec / 60))}g
                      </p>
                    </div>
                    <div className="ios-card p-3">
                      <p className="text-[11px] text-[var(--ios-tertiary-label)]">Points</p>
                      <p className="text-[20px] font-bold text-[var(--ios-blue)] tabular-nums">
                        +{Math.round(activeSession.activity.pointsPerMin * (elapsedSec / 60))}
                      </p>
                    </div>
                  </div>

                  {/* Stop button */}
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={stopSession}
                    className="w-full h-[56px] rounded-[18px] bg-[var(--ios-red,#ff3b30)] text-white font-bold text-[18px] flex items-center justify-center gap-2.5 shadow-lg shadow-red-500/20"
                  >
                    <Square className="w-5 h-5 fill-current" /> Stop Activity
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ═══ Completion Summary Modal ═══ */}
        <AnimatePresence>
          {completedSession && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
              onClick={() => setCompletedSession(null)}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="w-[calc(100%-32px)] max-w-[380px] bg-[var(--ios-card-bg)] rounded-[28px] p-8 text-center"
                onClick={e => e.stopPropagation()}
              >
                <motion.div
                  initial={{ scale: 0 }} animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', damping: 15 }}
                >
                  <Trophy className="w-16 h-16 text-[#ffd700] mx-auto mb-3" />
                </motion.div>
                <h3 className="text-[24px] font-bold text-[var(--ios-label)] mb-1">Activity Complete!</h3>
                <p className="text-[15px] text-[var(--ios-tertiary-label)] mb-5">
                  {completedSession.activity.title.replace('\n', ' ')}
                  {completedSession.from ? ` — ${completedSession.from} to ${completedSession.to}` : ''}
                </p>

                <div className="grid grid-cols-3 gap-3 mb-6">
                  <div className="ios-card p-3">
                    <p className="text-[11px] text-[var(--ios-tertiary-label)]">Duration</p>
                    <p className="text-[18px] font-bold text-[var(--ios-label)] tabular-nums">{formatTime(completedSession.durationSec)}</p>
                  </div>
                  <div className="ios-card p-3">
                    <p className="text-[11px] text-[var(--ios-tertiary-label)]">CO₂ Saved</p>
                    <p className="text-[18px] font-bold text-[#30d158] tabular-nums">
                      {completedSession.co2Saved >= 1000 ? `${(completedSession.co2Saved / 1000).toFixed(1)}kg` : `${completedSession.co2Saved}g`}
                    </p>
                  </div>
                  <div className="ios-card p-3">
                    <p className="text-[11px] text-[var(--ios-tertiary-label)]">Points</p>
                    <p className="text-[18px] font-bold text-[var(--ios-blue)] tabular-nums">+{completedSession.points}</p>
                  </div>
                </div>

                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setCompletedSession(null)}
                  className="w-full h-[52px] rounded-[16px] bg-[#30d158] text-white font-bold text-[17px] flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" /> Done
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>



      {/* History */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[22px] font-bold text-[var(--ios-label)]">History</h2>
          <span className="text-[15px] text-[var(--ios-blue)] font-medium">Show More</span>
        </div>
        <div className="space-y-2">
          {user.dailyLogs.length === 0 && actState.verifiedImpacts.length === 0 ? (
            <div className="ios-card p-5 text-center">
              <Footprints className="w-8 h-8 text-[var(--ios-tertiary-label)] mx-auto mb-2" />
              <p className="text-[15px] text-[var(--ios-tertiary-label)]">No activity yet</p>
              <p className="text-[13px] text-[var(--ios-tertiary-label)] mt-1">Log your first eco action to see history</p>
            </div>
          ) : (
            <>
              {user.dailyLogs.slice(-3).reverse().map((log, i) => (
                <HistoryRow key={log.date + i} log={log} />
              ))}
              {actState.verifiedImpacts.slice(0, 2).map(impact => (
                <div key={impact.id} className="ios-card px-4 py-3.5 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-[18px]"
                    style={{ backgroundColor: impact.pillar === 'E' ? '#30d15815' : impact.pillar === 'S' ? '#007aff15' : '#ff9f0a15' }}>
                    {impact.type === 'purchase' ? '🛒' : impact.type === 'transit' ? '🚇' : '📸'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-semibold text-[var(--ios-label)] truncate">{impact.description}</p>
                    <p className="text-[13px] text-[var(--ios-tertiary-label)]">
                      {new Date(impact.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} · Verified
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[15px] font-bold tabular-nums text-[var(--eco-green)]">+{impact.points}</p>
                    <p className="text-[11px] text-[var(--ios-tertiary-label)]">IQ</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[var(--ios-tertiary-label)] flex-shrink-0" />
                </div>
              ))}
            </>
          )}
        </div>
      </section>

      {/* Stats - Real Data */}
      <section>
        <h2 className="text-[22px] font-bold text-[var(--ios-label)] mb-3">Stats</h2>
        <div className="grid grid-cols-2 gap-2">
          <QuickStat icon={<Flame className="w-5 h-5" />} label="Streak" value={`${streakDays}`} sub="days" color="var(--ios-orange)" />
          <QuickStat icon={<Target className="w-5 h-5" />} label="Best Ring" value={getBestRingLabel(user.rings)} sub="leading" color="var(--ios-green)" />
          <QuickStat
            icon={<Leaf className="w-5 h-5" />}
            label="CO₂ Saved"
            value={totalCO2Saved >= 1000 ? `${(totalCO2Saved / 1000).toFixed(1)}` : `${Math.round(totalCO2Saved)}`}
            sub={totalCO2Saved >= 1000 ? 'kg total' : 'g total'}
            color="var(--ios-green)"
          />
          <QuickStat icon={<Train className="w-5 h-5" />} label="Eco Trips" value={`${totalTrips}`} sub="logged" color="var(--ios-blue)" />
          <QuickStat icon={<Zap className="w-5 h-5" />} label="Eco Points" value={`${actState.ecoPoints}`} sub="earned" color="var(--ios-yellow)" />
          <QuickStat icon={<TrendingUp className="w-5 h-5" />} label="Verifications" value={`${actState.verificationCount}`} sub="proofs" color="var(--ios-purple, #5856d6)" />
        </div>
      </section>

      {/* Eco Calendar (from Activities) */}
      <section className="ios-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-[10px] bg-gradient-to-br from-[#30d158] to-[#34c759] flex items-center justify-center">
              <Calendar className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <h2 className="text-[17px] font-bold text-[var(--ios-label)]">Eco Calendar</h2>
              <p className="text-[11px] text-[var(--ios-tertiary-label)]">Daily challenges</p>
            </div>
          </div>
          <span className="text-[12px] font-medium px-2.5 py-1 rounded-full" style={{ backgroundColor: `${TIER_COLORS[tier]}20`, color: TIER_COLORS[tier] }}>
            {tier} Tier
          </span>
        </div>

        <div className="flex items-center justify-between mb-3">
          <button onClick={prevMonth} className="w-8 h-8 rounded-full bg-[var(--ios-bg)] flex items-center justify-center ios-press">
            <ChevronLeft className="w-4 h-4 text-[var(--ios-secondary-label)]" />
          </button>
          <span className="text-[15px] font-semibold text-[var(--ios-label)]">{monthName}</span>
          <button onClick={nextMonth} className="w-8 h-8 rounded-full bg-[var(--ios-bg)] flex items-center justify-center ios-press">
            <ChevronRight className="w-4 h-4 text-[var(--ios-secondary-label)]" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-1">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
            <div key={i} className="text-center text-[10px] font-semibold text-[var(--ios-tertiary-label)] py-1">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstDayOfWeek }).map((_, i) => <div key={`empty-${i}`} />)}
          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
            const challenge = getDailyChallenge(day, calendarMonth);
            const isToday = day === now.getDate() && calendarMonth === now.getMonth() && calendarYear === now.getFullYear();
            const isSelected = day === selectedDay;
            const isPast = new Date(calendarYear, calendarMonth, day) < new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const completed = isPast && (
              actState.verifiedImpacts.some(v => {
                const d = new Date(v.date);
                return d.getDate() === day && d.getMonth() === calendarMonth && d.getFullYear() === calendarYear;
              }) ||
              user.dailyLogs.some(l => {
                const d = new Date(l.date);
                return d.getDate() === day && d.getMonth() === calendarMonth && d.getFullYear() === calendarYear;
              })
            );

            return (
              <button key={day} onClick={() => setSelectedDay(isSelected ? null : day)}
                className={`relative aspect-square rounded-[10px] flex flex-col items-center justify-center transition-all ios-press ${
                  isSelected ? 'bg-[var(--ios-blue)] shadow-lg shadow-[var(--ios-blue)]/20'
                    : isToday ? 'bg-[var(--ios-blue)]/10 ring-1.5 ring-[var(--ios-blue)]'
                      : completed ? 'bg-[#30d158]/10' : 'bg-[var(--ios-bg)]'
                }`}>
                <span className={`text-[12px] font-semibold tabular-nums ${
                  isSelected ? 'text-white' : isToday ? 'text-[var(--ios-blue)]' : 'text-[var(--ios-label)]'
                }`}>{day}</span>
                <span className="text-[10px] leading-none mt-px">{challenge.icon}</span>
                {completed && !isSelected && (
                  <div className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-[#30d158]" />
                )}
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          {selectedDay && todayChallenge && (
            <motion.div key={selectedDay} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
              <div className="mt-4 p-4 rounded-[14px] border border-[var(--ios-separator)]" style={{ backgroundColor: `${todayChallenge.color}08` }}>
                <div className="flex items-start gap-3">
                  <span className="text-[28px]">{todayChallenge.icon}</span>
                  <div className="flex-1">
                    <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: todayChallenge.color }}>
                      {todayChallenge.pillar} Challenge
                    </p>
                    <p className="text-[15px] font-bold text-[var(--ios-label)] mt-0.5">{todayChallenge.title}</p>
                    <p className="text-[12px] text-[var(--ios-secondary-label)] mt-1">{todayChallenge.description}</p>
                    <div className="flex items-center gap-3 mt-2.5">
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: `${todayChallenge.color}15`, color: todayChallenge.color }}>
                        +{todayChallenge.points} pts
                      </span>
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-[#30d158]/10 text-[#30d158]">
                        {todayChallenge.carbonSaved}g CO₂ saved
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-3 gap-2 mt-4 pt-3" style={{ borderTop: '0.5px solid var(--ios-separator)' }}>
          <div className="text-center">
            <p className="text-[17px] font-bold text-[var(--ios-label)] tabular-nums">{iq}</p>
            <p className="text-[10px] text-[var(--ios-tertiary-label)]">Impact IQ</p>
          </div>
          <div className="text-center">
            <p className="text-[17px] font-bold text-[#30d158] tabular-nums">{actState.ecoPoints}</p>
            <p className="text-[10px] text-[var(--ios-tertiary-label)]">Eco Points</p>
          </div>
          <div className="text-center">
            <p className="text-[17px] font-bold text-[var(--ios-blue)] tabular-nums">{actState.greenCredits.toFixed(1)}</p>
            <p className="text-[10px] text-[var(--ios-tertiary-label)]">Green Credits</p>
          </div>
        </div>
      </section>

      <div className="h-4" />
    </motion.div>
  );
}

/* ─── Sub Components ─── */

function RingStat({ label, value, unit, color }: { label: string; value: number; unit: string; color: string }) {
  return (
    <div>
      <p className="text-[11px] font-medium" style={{ color }}>{label}</p>
      <p className="text-[20px] font-bold tabular-nums leading-tight" style={{ color }}>
        {value}<span className="text-[13px] font-semibold text-[var(--ios-tertiary-label)]">{unit}</span>
      </p>
    </div>
  );
}

function GoalRow({ goal, index }: { goal: { label: string; progress: number; target: number; icon: React.ReactNode; color: string }; index: number }) {
  const pct = Math.min(100, (goal.progress / goal.target) * 100);
  return (
    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.06 }}
      className="ios-card px-4 py-3.5 flex items-center gap-3">
      <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: `${goal.color}20`, color: goal.color }}>
        {goal.icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[15px] font-semibold text-[var(--ios-label)]">{goal.label}</p>
        <div className="flex items-center gap-2 mt-1">
          <div className="flex-1 h-[4px] rounded-full bg-[var(--ios-separator)]">
            <motion.div className="h-full rounded-full" style={{ background: goal.color }}
              initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8 }} />
          </div>
          <span className="text-[11px] tabular-nums font-medium text-[var(--ios-tertiary-label)]">{goal.progress}/{goal.target}</span>
        </div>
      </div>
      <ChevronRight className="w-4 h-4 text-[var(--ios-tertiary-label)] flex-shrink-0" />
    </motion.div>
  );
}

function HistoryRow({ log }: { log: { date: string; modes: string[]; IQChange: number; verified: boolean } }) {
  const modeIcons: Record<string, string> = { 'plant-based': '🥗', transit: '🚌', thrift: '👕', repair: '🔧', minimal: '✨' };
  const modeLabels: Record<string, string> = { 'plant-based': 'Plant-Based', transit: 'Transit', thrift: 'Thrift', repair: 'Repair', minimal: 'Minimal' };

  return (
    <div className="ios-card px-4 py-3.5 flex items-center gap-3">
      <div className="w-9 h-9 rounded-full bg-[var(--eco-green)]/10 flex items-center justify-center text-[18px]">
        {modeIcons[log.modes[0]] || '📋'}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[15px] font-semibold text-[var(--ios-label)]">
          {log.modes.map(m => modeLabels[m] || m).join(', ')}
        </p>
        <p className="text-[13px] text-[var(--ios-tertiary-label)]">
          {log.date} {log.verified && '· Verified'}
        </p>
      </div>
      <div className="text-right">
        <p className={`text-[15px] font-bold tabular-nums ${log.IQChange >= 0 ? 'text-[var(--eco-green)]' : 'text-[var(--ios-red)]'}`}>
          {log.IQChange >= 0 ? '+' : ''}{log.IQChange.toFixed(1)}
        </p>
        <p className="text-[11px] text-[var(--ios-tertiary-label)]">IQ</p>
      </div>
      <ChevronRight className="w-4 h-4 text-[var(--ios-tertiary-label)] flex-shrink-0" />
    </div>
  );
}

function QuickStat({ icon, label, value, sub, color }: { icon: React.ReactNode; label: string; value: string; sub: string; color: string }) {
  return (
    <div className="ios-card p-4">
      <div className="flex items-center gap-2 mb-2">
        <div style={{ color }}>{icon}</div>
        <span className="text-[13px] font-medium text-[var(--ios-tertiary-label)]">{label}</span>
      </div>
      <p className="text-[28px] font-bold tabular-nums leading-none text-[var(--ios-label)]">{value}</p>
      <p className="text-[13px] text-[var(--ios-tertiary-label)] mt-0.5">{sub}</p>
    </div>
  );
}

/* ─── Helpers ─── */

function getGoals(user: User) {
  return [
    { label: 'Close all rings 3x', progress: Math.min(3, user.dailyLogs.length), target: 3, icon: <Target className="w-4 h-4" />, color: '#ff375f' },
    { label: 'Log 5 impact modes', progress: Math.min(5, user.dailyLogs.reduce((sum, l) => sum + l.modes.length, 0)), target: 5, icon: <Zap className="w-4 h-4" />, color: '#30d158' },
    { label: 'Maintain 7-day streak', progress: Math.min(7, user.dailyLogs.length), target: 7, icon: <Flame className="w-4 h-4" />, color: '#ff9f0a' },
  ];
}

function getBestRingLabel(rings: { circularity: number; consumption: number; mobility: number }) {
  const entries: [string, number][] = [['Circ.', rings.circularity], ['Cons.', rings.consumption], ['Mob.', rings.mobility]];
  entries.sort((a, b) => b[1] - a[1]);
  return entries[0]?.[0] ?? 'Even';
}
