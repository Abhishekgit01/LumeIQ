'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { IQChart } from '@/components/profile/IQChart';
import { 
  Download, ChevronRight, Trophy, Star, Flame, Bike, Train, Footprints, 
  TreePine, Recycle, ShoppingBag, Zap, Target, Award, Medal, Crown,
  Leaf, Timer, Camera, MapPin, X, ChevronDown, ChevronUp, Lock
} from 'lucide-react';
import { CardLeaves, TinyLeaf, SmallLeaf } from '@/components/ui/LeafDecorations';

const ACTIVITIES_KEY = 'lumeiq-activities-state';

interface VerifiedImpact {
  id: string;
  type: string;
  label: string;
  co2Saved: number;
  points: number;
  timestamp: string;
  pillar: string;
  from?: string;
  to?: string;
  duration?: number;
  confidence?: number;
}

interface ActivitiesState {
  verifiedImpacts: VerifiedImpact[];
  totalCO2Saved: number;
  ecoPoints: number;
  transitCount: number;
  pillarScores: { environmental: number; social: number; economic: number; governance: number };
}

// Achievement definitions
interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: typeof Trophy;
  iconBg: string;
  iconColor: string;
  category: 'activity' | 'streak' | 'impact' | 'explorer' | 'mastery';
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  requirement: number;
  unit: string;
  checkProgress: (data: AchievementData) => number;
}

interface AchievementData {
  totalActivities: number;
  totalCO2: number;
  ecoPoints: number;
  transitCount: number;
  bicycleCount: number;
  walkCount: number;
  jogCount: number;
  metroCount: number;
  boosterCount: number;
  streak: number;
  daysLogged: number;
  uniqueActivityTypes: number;
  totalDuration: number;
  pillarScores: { environmental: number; social: number; economic: number; governance: number };
}

const ACHIEVEMENTS: Achievement[] = [
  // Activity milestones
  { id: 'first-step', name: 'First Step', description: 'Complete your first activity', icon: Footprints, iconBg: 'from-emerald-400 to-green-500', iconColor: '#fff', category: 'activity', tier: 'bronze', requirement: 1, unit: 'activity', checkProgress: (d) => d.totalActivities },
  { id: 'getting-started', name: 'Getting Started', description: 'Complete 5 activities', icon: Zap, iconBg: 'from-blue-400 to-cyan-500', iconColor: '#fff', category: 'activity', tier: 'bronze', requirement: 5, unit: 'activities', checkProgress: (d) => d.totalActivities },
  { id: 'eco-warrior', name: 'Eco Warrior', description: 'Complete 25 activities', icon: Award, iconBg: 'from-violet-400 to-purple-500', iconColor: '#fff', category: 'activity', tier: 'silver', requirement: 25, unit: 'activities', checkProgress: (d) => d.totalActivities },
  { id: 'sustainability-hero', name: 'Sustainability Hero', description: 'Complete 100 activities', icon: Crown, iconBg: 'from-amber-400 to-orange-500', iconColor: '#fff', category: 'activity', tier: 'gold', requirement: 100, unit: 'activities', checkProgress: (d) => d.totalActivities },

  // Cycling
  { id: 'pedal-starter', name: 'Pedal Starter', description: 'Complete 1 bicycle commute', icon: Bike, iconBg: 'from-teal-400 to-emerald-500', iconColor: '#fff', category: 'activity', tier: 'bronze', requirement: 1, unit: 'ride', checkProgress: (d) => d.bicycleCount },
  { id: 'cycle-enthusiast', name: 'Cycle Enthusiast', description: 'Complete 10 bicycle commutes', icon: Bike, iconBg: 'from-teal-500 to-green-600', iconColor: '#fff', category: 'activity', tier: 'silver', requirement: 10, unit: 'rides', checkProgress: (d) => d.bicycleCount },
  { id: 'two-wheel-legend', name: 'Two-Wheel Legend', description: 'Complete 50 bicycle commutes', icon: Bike, iconBg: 'from-teal-600 to-emerald-700', iconColor: '#fff', category: 'activity', tier: 'gold', requirement: 50, unit: 'rides', checkProgress: (d) => d.bicycleCount },

  // Transit
  { id: 'commuter', name: 'Public Commuter', description: 'Take 1 metro/bus ride', icon: Train, iconBg: 'from-blue-400 to-indigo-500', iconColor: '#fff', category: 'activity', tier: 'bronze', requirement: 1, unit: 'ride', checkProgress: (d) => d.metroCount },
  { id: 'transit-regular', name: 'Transit Regular', description: 'Take 10 public transport rides', icon: Train, iconBg: 'from-blue-500 to-indigo-600', iconColor: '#fff', category: 'activity', tier: 'silver', requirement: 10, unit: 'rides', checkProgress: (d) => d.metroCount },

  // Walking & Jogging
  { id: 'walker', name: 'Nature Walker', description: 'Complete 5 walking sessions', icon: Footprints, iconBg: 'from-green-400 to-lime-500', iconColor: '#fff', category: 'activity', tier: 'bronze', requirement: 5, unit: 'walks', checkProgress: (d) => d.walkCount },
  { id: 'runner', name: 'Green Runner', description: 'Complete 5 jogging sessions', icon: Flame, iconBg: 'from-orange-400 to-red-500', iconColor: '#fff', category: 'activity', tier: 'bronze', requirement: 5, unit: 'jogs', checkProgress: (d) => d.jogCount },

  // CO2 Impact
  { id: 'carbon-saver', name: 'Carbon Saver', description: 'Save 1 kg of CO₂', icon: TreePine, iconBg: 'from-green-500 to-emerald-600', iconColor: '#fff', category: 'impact', tier: 'bronze', requirement: 1, unit: 'kg CO₂', checkProgress: (d) => d.totalCO2 },
  { id: 'carbon-crusher', name: 'Carbon Crusher', description: 'Save 10 kg of CO₂', icon: TreePine, iconBg: 'from-green-600 to-emerald-700', iconColor: '#fff', category: 'impact', tier: 'silver', requirement: 10, unit: 'kg CO₂', checkProgress: (d) => d.totalCO2 },
  { id: 'planet-protector', name: 'Planet Protector', description: 'Save 50 kg of CO₂', icon: TreePine, iconBg: 'from-green-700 to-emerald-800', iconColor: '#fff', category: 'impact', tier: 'gold', requirement: 50, unit: 'kg CO₂', checkProgress: (d) => d.totalCO2 },
  { id: 'climate-champion', name: 'Climate Champion', description: 'Save 200 kg of CO₂', icon: TreePine, iconBg: 'from-emerald-600 to-teal-700', iconColor: '#fff', category: 'impact', tier: 'platinum', requirement: 200, unit: 'kg CO₂', checkProgress: (d) => d.totalCO2 },

  // Points
  { id: 'point-collector', name: 'Point Collector', description: 'Earn 100 eco points', icon: Star, iconBg: 'from-yellow-400 to-amber-500', iconColor: '#fff', category: 'impact', tier: 'bronze', requirement: 100, unit: 'points', checkProgress: (d) => d.ecoPoints },
  { id: 'point-hoarder', name: 'Point Hoarder', description: 'Earn 500 eco points', icon: Star, iconBg: 'from-yellow-500 to-amber-600', iconColor: '#fff', category: 'impact', tier: 'silver', requirement: 500, unit: 'points', checkProgress: (d) => d.ecoPoints },
  { id: 'point-master', name: 'Point Master', description: 'Earn 2000 eco points', icon: Star, iconBg: 'from-amber-500 to-orange-600', iconColor: '#fff', category: 'impact', tier: 'gold', requirement: 2000, unit: 'points', checkProgress: (d) => d.ecoPoints },

  // Streak
  { id: 'streak-3', name: '3-Day Streak', description: 'Log activities 3 days in a row', icon: Flame, iconBg: 'from-orange-400 to-red-500', iconColor: '#fff', category: 'streak', tier: 'bronze', requirement: 3, unit: 'days', checkProgress: (d) => d.streak },
  { id: 'streak-7', name: 'Week Warrior', description: '7-day activity streak', icon: Flame, iconBg: 'from-orange-500 to-red-600', iconColor: '#fff', category: 'streak', tier: 'silver', requirement: 7, unit: 'days', checkProgress: (d) => d.streak },
  { id: 'streak-30', name: 'Monthly Master', description: '30-day activity streak', icon: Flame, iconBg: 'from-red-500 to-rose-600', iconColor: '#fff', category: 'streak', tier: 'gold', requirement: 30, unit: 'days', checkProgress: (d) => d.streak },

  // Explorer
  { id: 'diverse', name: 'Eco Explorer', description: 'Try 3 different activity types', icon: Target, iconBg: 'from-cyan-400 to-blue-500', iconColor: '#fff', category: 'explorer', tier: 'bronze', requirement: 3, unit: 'types', checkProgress: (d) => d.uniqueActivityTypes },
  { id: 'all-rounder', name: 'All-Rounder', description: 'Try all 4 activity types', icon: Medal, iconBg: 'from-indigo-400 to-purple-500', iconColor: '#fff', category: 'explorer', tier: 'silver', requirement: 4, unit: 'types', checkProgress: (d) => d.uniqueActivityTypes },

  // Duration mastery
  { id: 'endurance-1', name: 'Hour of Impact', description: 'Log 60 minutes of activities', icon: Timer, iconBg: 'from-pink-400 to-rose-500', iconColor: '#fff', category: 'mastery', tier: 'bronze', requirement: 60, unit: 'minutes', checkProgress: (d) => Math.floor(d.totalDuration / 60) },
  { id: 'endurance-5', name: 'Five Hour Club', description: 'Log 5 hours of activities', icon: Timer, iconBg: 'from-pink-500 to-rose-600', iconColor: '#fff', category: 'mastery', tier: 'silver', requirement: 300, unit: 'minutes', checkProgress: (d) => Math.floor(d.totalDuration / 60) },
  { id: 'endurance-20', name: 'Marathon Logger', description: 'Log 20 hours of activities', icon: Timer, iconBg: 'from-rose-500 to-red-600', iconColor: '#fff', category: 'mastery', tier: 'gold', requirement: 1200, unit: 'minutes', checkProgress: (d) => Math.floor(d.totalDuration / 60) },

  // Boosters
  { id: 'habit-former', name: 'Habit Former', description: 'Log 5 impact boosters', icon: Recycle, iconBg: 'from-lime-400 to-green-500', iconColor: '#fff', category: 'activity', tier: 'bronze', requirement: 5, unit: 'boosters', checkProgress: (d) => d.boosterCount },
  { id: 'habit-master', name: 'Habit Master', description: 'Log 25 impact boosters', icon: Recycle, iconBg: 'from-lime-500 to-green-600', iconColor: '#fff', category: 'activity', tier: 'silver', requirement: 25, unit: 'boosters', checkProgress: (d) => d.boosterCount },
];

const TIER_COLORS = {
  bronze: { bg: 'from-amber-600 to-yellow-700', text: '#92400e', badge: 'bg-amber-100 text-amber-700' },
  silver: { bg: 'from-gray-400 to-slate-500', text: '#475569', badge: 'bg-slate-100 text-slate-600' },
  gold: { bg: 'from-yellow-400 to-amber-500', text: '#92400e', badge: 'bg-yellow-100 text-yellow-700' },
  platinum: { bg: 'from-cyan-400 to-blue-500', text: '#0e7490', badge: 'bg-cyan-100 text-cyan-700' },
};

const CATEGORY_LABELS: Record<string, string> = {
  activity: 'Activity',
  streak: 'Streak',
  impact: 'Impact',
  explorer: 'Explorer',
  mastery: 'Mastery',
};

function computeAchievementData(activitiesState: ActivitiesState | null, user: any): AchievementData {
  const impacts = activitiesState?.verifiedImpacts || [];

  const bicycleCount = impacts.filter(i => i.type === 'bicycle').length;
  const metroCount = impacts.filter(i => i.type === 'metro').length;
  const walkCount = impacts.filter(i => i.type === 'walking').length;
  const jogCount = impacts.filter(i => i.type === 'jogging').length;
  const boosterCount = impacts.filter(i => ['reusable-bag', 'meatless-meal', 'composted', 'carpooled', 'no-plastic', 'cold-wash', 'air-dried', 'planted'].includes(i.type)).length;

  const uniqueTypes = new Set(impacts.map(i => {
    if (['bicycle', 'metro', 'walking', 'jogging'].includes(i.type)) return i.type;
    return 'booster';
  }));

  const totalDuration = impacts.reduce((sum, i) => sum + (i.duration || 0), 0);

  // Compute streak from impact dates
  const dates = [...new Set(impacts.map(i => i.timestamp.split('T')[0]))].sort().reverse();
  let streak = 0;
  if (dates.length > 0) {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    if (dates[0] === today || dates[0] === yesterday) {
      streak = 1;
      for (let i = 1; i < dates.length; i++) {
        const prev = new Date(dates[i - 1]);
        const curr = new Date(dates[i]);
        const diffDays = (prev.getTime() - curr.getTime()) / 86400000;
        if (diffDays === 1) streak++;
        else break;
      }
    }
  }

  return {
    totalActivities: impacts.length,
    totalCO2: activitiesState?.totalCO2Saved || 0,
    ecoPoints: activitiesState?.ecoPoints || 0,
    transitCount: activitiesState?.transitCount || 0,
    bicycleCount,
    metroCount,
    walkCount,
    jogCount,
    boosterCount,
    streak,
    daysLogged: user?.dailyLogs?.length || 0,
    uniqueActivityTypes: uniqueTypes.size,
    totalDuration,
    pillarScores: activitiesState?.pillarScores || { environmental: 0, social: 0, economic: 0, governance: 0 },
  };
}

export function ProfileView() {
  const { user, resetUser } = useStore();
  const [activitiesState, setActivitiesState] = useState<ActivitiesState | null>(null);
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showAllAchievements, setShowAllAchievements] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(ACTIVITIES_KEY);
      if (saved) setActivitiesState(JSON.parse(saved));
    } catch {}
  }, []);

  if (!user) return null;

  const achievementData = computeAchievementData(activitiesState, user);
  const unlockedIds = new Set<string>();
  const achievementProgress: Record<string, { current: number; pct: number }> = {};

  ACHIEVEMENTS.forEach(a => {
    const current = a.checkProgress(achievementData);
    const pct = Math.min(100, Math.round((current / a.requirement) * 100));
    achievementProgress[a.id] = { current, pct };
    if (current >= a.requirement) unlockedIds.add(a.id);
  });

  const totalUnlocked = unlockedIds.size;
  const totalAchievements = ACHIEVEMENTS.length;
  const overallPct = Math.round((totalUnlocked / totalAchievements) * 100);

  // Level system based on achievements
  const level = Math.max(1, Math.floor(totalUnlocked / 2) + 1);
  const levelProgress = totalUnlocked % 2 === 0 ? 0 : 50;
  const nextLevelNeeds = 2 - (totalUnlocked % 2);

  const filteredAchievements = categoryFilter === 'all' 
    ? ACHIEVEMENTS 
    : ACHIEVEMENTS.filter(a => a.category === categoryFilter);

  const displayedAchievements = showAllAchievements ? filteredAchievements : filteredAchievements.slice(0, 6);

  const recentUnlocks = ACHIEVEMENTS.filter(a => unlockedIds.has(a.id)).slice(0, 3);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-4">
      
      {/* Profile Card - Enhanced */}
      <div className="relative overflow-hidden rounded-[20px]" style={{ background: 'linear-gradient(135deg, #1a4a2e 0%, #2d8a4e 50%, #3ba55d 100%)' }}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 right-4 w-32 h-32 rounded-full border border-white/20" />
          <div className="absolute bottom-4 left-4 w-20 h-20 rounded-full border border-white/20" />
        </div>
        <div className="p-5 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-[64px] h-[64px] rounded-[20px] bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
              <span className="text-[26px] font-bold text-white tabular-nums">{Math.round(user.IQ)}</span>
            </div>
            <div className="flex-1">
              <h2 className="text-[20px] font-bold text-white">Impact Profile</h2>
              <p className="text-[13px] text-white/70">{user.baseline.city} - Since {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-[12px] font-semibold text-white bg-white/20 px-2.5 py-0.5 rounded-full">{user.tier}</span>
                <span className="text-[12px] text-white/60">Level {level}</span>
              </div>
            </div>
          </div>

          {/* Level progress */}
          <div className="mt-4 bg-white/10 rounded-[12px] p-3">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-[11px] font-medium text-white/80">Level {level}</span>
              <span className="text-[11px] text-white/60">{nextLevelNeeds} more badge{nextLevelNeeds !== 1 ? 's' : ''} to Level {level + 1}</span>
            </div>
            <div className="h-2 rounded-full bg-white/10 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${levelProgress}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="h-full rounded-full bg-gradient-to-r from-yellow-300 to-amber-400"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: 'CO₂ Saved', value: `${(achievementData.totalCO2).toFixed(1)}`, unit: 'kg', color: '#2d8a4e' },
          { label: 'Points', value: achievementData.ecoPoints.toString(), unit: '', color: '#f59e0b' },
          { label: 'Streak', value: achievementData.streak.toString(), unit: 'd', color: '#ef4444' },
          { label: 'Badges', value: `${totalUnlocked}`, unit: `/${totalAchievements}`, color: '#8b5cf6' },
        ].map((stat) => (
          <div key={stat.label} className="card-surface-sm p-3 text-center">
            <div className="text-[18px] font-bold tabular-nums" style={{ color: stat.color }}>
              {stat.value}<span className="text-[11px] font-normal text-[#5e7a5e]">{stat.unit}</span>
            </div>
            <div className="text-[10px] text-[#5e7a5e] mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Achievement Overview */}
      <div className="card-surface p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            <h3 className="text-[16px] font-semibold text-[#1a2e1a]">Achievements</h3>
          </div>
          <span className="text-[13px] font-medium text-[#2d8a4e]">{totalUnlocked}/{totalAchievements} Unlocked</span>
        </div>

        {/* Overall progress bar */}
        <div className="mb-4">
          <div className="h-3 rounded-full bg-[#f0f7f0] overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${overallPct}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full rounded-full bg-gradient-to-r from-[#2d8a4e] to-[#5cb85c]"
            />
          </div>
          <p className="text-[11px] text-[#5e7a5e] mt-1">{overallPct}% complete</p>
        </div>

        {/* Recently unlocked */}
        {recentUnlocks.length > 0 && (
          <div className="mb-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#5e7a5e] mb-2">Recently Unlocked</p>
            <div className="flex gap-3">
              {recentUnlocks.map((a) => {
                const Icon = a.icon;
                return (
                  <motion.button
                    key={a.id}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedAchievement(a)}
                    className="flex flex-col items-center gap-1.5 flex-1"
                  >
                    <div className={`w-12 h-12 rounded-[14px] bg-gradient-to-br ${a.iconBg} flex items-center justify-center shadow-lg`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-[10px] font-medium text-[#1a2e1a] text-center leading-tight">{a.name}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>
        )}

        {/* Category filter pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-2 mb-3 -mx-1 px-1 no-scrollbar">
          {['all', 'activity', 'impact', 'streak', 'explorer', 'mastery'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-full text-[11px] font-medium whitespace-nowrap transition-all ${
                categoryFilter === cat
                  ? 'bg-[#2d8a4e] text-white'
                  : 'bg-[#f0f7f0] text-[#5e7a5e]'
              }`}
            >
              {cat === 'all' ? 'All' : CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>

        {/* Achievement grid */}
        <div className="grid grid-cols-1 gap-2">
          {displayedAchievements.map((a) => {
            const Icon = a.icon;
            const unlocked = unlockedIds.has(a.id);
            const { current, pct } = achievementProgress[a.id];

            return (
              <motion.button
                key={a.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedAchievement(a)}
                className={`flex items-center gap-3 p-3 rounded-[14px] text-left transition-all ${
                  unlocked 
                    ? 'bg-gradient-to-r from-[#f0f9f0] to-[#e8f5e8] border border-[#2d8a4e]/20' 
                    : 'bg-[#fafafa] border border-[#e5e5e5]/60'
                }`}
              >
                <div className={`w-11 h-11 rounded-[12px] flex items-center justify-center flex-shrink-0 ${
                  unlocked 
                    ? `bg-gradient-to-br ${a.iconBg} shadow-md` 
                    : 'bg-gray-200'
                }`}>
                  {unlocked 
                    ? <Icon className="w-5 h-5 text-white" />
                    : <Lock className="w-4 h-4 text-gray-400" />
                  }
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-[13px] font-semibold ${unlocked ? 'text-[#1a2e1a]' : 'text-gray-500'}`}>
                      {a.name}
                    </span>
                    <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full ${TIER_COLORS[a.tier].badge}`}>
                      {a.tier}
                    </span>
                  </div>
                  <p className={`text-[11px] ${unlocked ? 'text-[#5e7a5e]' : 'text-gray-400'}`}>{a.description}</p>
                  {!unlocked && (
                    <div className="mt-1.5 flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full bg-gray-200 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[#2d8a4e] to-[#5cb85c] transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-gray-400 tabular-nums">{current}/{a.requirement}</span>
                    </div>
                  )}
                </div>

                {unlocked && (
                  <div className="flex-shrink-0">
                    <div className="w-6 h-6 rounded-full bg-[#2d8a4e] flex items-center justify-center">
                      <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Show more/less */}
        {filteredAchievements.length > 6 && (
          <button
            onClick={() => setShowAllAchievements(!showAllAchievements)}
            className="w-full mt-3 py-2 flex items-center justify-center gap-1 text-[13px] font-medium text-[#2d8a4e]"
          >
            {showAllAchievements ? 'Show Less' : `Show All (${filteredAchievements.length})`}
            {showAllAchievements ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* Pillar Scores */}
      <div className="card-surface p-4">
        <h3 className="text-[12px] font-semibold tracking-[0.04em] uppercase text-[#5e7a5e] mb-3">ESG Pillar Scores</h3>
        <div className="space-y-3">
          {[
            { label: 'Environmental', value: achievementData.pillarScores.environmental, color: '#2d8a4e', icon: '🌿' },
            { label: 'Social', value: achievementData.pillarScores.social, color: '#3b82f6', icon: '🤝' },
            { label: 'Economic', value: achievementData.pillarScores.economic, color: '#f59e0b', icon: '💰' },
            { label: 'Governance', value: achievementData.pillarScores.governance, color: '#8b5cf6', icon: '⚖️' },
          ].map((p) => (
            <div key={p.label}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[13px] text-[#1a2e1a] flex items-center gap-1.5">
                  <span className="text-[14px]">{p.icon}</span> {p.label}
                </span>
                <span className="text-[13px] font-semibold" style={{ color: p.color }}>{p.value}</span>
              </div>
              <div className="h-2 rounded-full bg-[#f0f7f0] overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, p.value)}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="h-full rounded-full"
                  style={{ background: p.color }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* IQ Chart */}
      <IQChart user={user} days={30} />

      {/* Baseline */}
      <div className="card-surface p-5">
        <CardLeaves variant="c" />
        <h3 className="text-[12px] font-semibold tracking-[0.04em] uppercase text-[#5e7a5e] mb-4 relative z-10">Baseline</h3>
        <div className="space-y-3.5 relative z-10">
          {[
            { label: 'Commute', value: user.baseline.commuteType },
            { label: 'Diet', value: user.baseline.dietType },
            { label: 'Shopping', value: user.baseline.clothingFrequency },
          ].map((item) => (
            <div key={item.label} className="flex justify-between items-center">
              <span className="text-[15px] text-[#5e7a5e]">{item.label}</span>
              <span className="text-[15px] font-medium capitalize text-[#1a2e1a]">{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Activity History Summary */}
      <div className="card-surface p-4">
        <h3 className="text-[12px] font-semibold tracking-[0.04em] uppercase text-[#5e7a5e] mb-3">Activity Breakdown</h3>
        <div className="grid grid-cols-2 gap-2">
          {[
            { icon: Bike, label: 'Cycling', count: achievementData.bicycleCount, color: '#0d9488' },
            { icon: Train, label: 'Transit', count: achievementData.metroCount, color: '#3b82f6' },
            { icon: Footprints, label: 'Walking', count: achievementData.walkCount, color: '#22c55e' },
            { icon: Flame, label: 'Jogging', count: achievementData.jogCount, color: '#f97316' },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="flex items-center gap-2.5 p-2.5 rounded-[12px] bg-[#fafafa]">
                <div className="w-9 h-9 rounded-[10px] flex items-center justify-center" style={{ background: `${item.color}15` }}>
                  <Icon className="w-4.5 h-4.5" style={{ color: item.color }} />
                </div>
                <div>
                  <span className="text-[16px] font-bold text-[#1a2e1a]">{item.count}</span>
                  <p className="text-[10px] text-[#5e7a5e]">{item.label}</p>
                </div>
              </div>
            );
          })}
        </div>
        {achievementData.totalDuration > 0 && (
          <div className="mt-3 pt-3 border-t border-[#e5e5e5]/50 flex items-center justify-between">
            <span className="text-[12px] text-[#5e7a5e]">Total Active Time</span>
            <span className="text-[14px] font-semibold text-[#1a2e1a]">
              {Math.floor(achievementData.totalDuration / 3600)}h {Math.floor((achievementData.totalDuration % 3600) / 60)}m
            </span>
          </div>
        )}
      </div>

      {/* Reports */}
      <div>
        <h3 className="text-[20px] font-semibold mb-3 text-[#1a2e1a]">Activities reports</h3>
        <div className="card-surface-sm flex items-center gap-3 px-4 py-3.5 relative">
          <CardLeaves variant="d" />
          <div className="w-10 h-10 rounded-[10px] bg-[#2d8a4e]/8 flex items-center justify-center relative z-10">
            <Download className="w-5 h-5 text-[#5e7a5e]" />
          </div>
          <div className="flex-1 relative z-10">
            <p className="text-[15px] font-medium text-[#1a2e1a]">Download full report</p>
            <p className="text-[12px] text-[#5e7a5e]">Updated {new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
          </div>
          <ChevronRight className="w-4 h-4 text-[#c8dfc8] relative z-10" />
        </div>
      </div>

      <button onClick={resetUser} className="w-full py-3.5 text-center text-[#d94f4f] hover:text-[#b83b3b] transition-colors text-[15px] font-medium rounded-[14px] bg-[#d94f4f]/5 border border-[#d94f4f]/10">
        Reset Profile
      </button>

      {/* Achievement Detail Modal */}
      <AnimatePresence>
        {selectedAchievement && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6"
            onClick={() => setSelectedAchievement(null)}
          >
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative bg-white rounded-[24px] p-6 w-full max-w-[320px] shadow-2xl"
            >
              <button onClick={() => setSelectedAchievement(null)} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                <X className="w-4 h-4 text-gray-500" />
              </button>

              {(() => {
                const a = selectedAchievement;
                const Icon = a.icon;
                const unlocked = unlockedIds.has(a.id);
                const { current, pct } = achievementProgress[a.id];

                return (
                  <div className="flex flex-col items-center text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', damping: 12 }}
                      className={`w-20 h-20 rounded-[24px] flex items-center justify-center mb-4 ${
                        unlocked ? `bg-gradient-to-br ${a.iconBg} shadow-xl` : 'bg-gray-200'
                      }`}
                    >
                      {unlocked ? <Icon className="w-10 h-10 text-white" /> : <Lock className="w-8 h-8 text-gray-400" />}
                    </motion.div>

                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full mb-2 ${TIER_COLORS[a.tier].badge}`}>
                      {a.tier}
                    </span>

                    <h3 className="text-[18px] font-bold text-[#1a2e1a] mb-1">{a.name}</h3>
                    <p className="text-[13px] text-[#5e7a5e] mb-4">{a.description}</p>

                    {unlocked ? (
                      <div className="w-full bg-[#f0f9f0] rounded-[14px] p-4">
                        <div className="flex items-center justify-center gap-2 text-[#2d8a4e]">
                          <Trophy className="w-5 h-5" />
                          <span className="text-[15px] font-semibold">Achievement Unlocked!</span>
                        </div>
                        <p className="text-[12px] text-[#5e7a5e] mt-1">{current} {a.unit} completed</p>
                      </div>
                    ) : (
                      <div className="w-full">
                        <div className="flex justify-between text-[12px] mb-1.5">
                          <span className="text-[#5e7a5e]">Progress</span>
                          <span className="font-medium text-[#1a2e1a]">{current}/{a.requirement} {a.unit}</span>
                        </div>
                        <div className="h-3 rounded-full bg-gray-100 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.6 }}
                            className="h-full rounded-full bg-gradient-to-r from-[#2d8a4e] to-[#5cb85c]"
                          />
                        </div>
                        <p className="text-[11px] text-[#5e7a5e] mt-2">
                          {a.requirement - current} more {a.unit} to unlock
                        </p>
                      </div>
                    )}
                  </div>
                );
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
