export interface Baseline {
  commuteType: string;
  clothingFrequency: string;
  dietType: string;
  city: string;
}

export interface RingValues {
  circularity: number;
  consumption: number;
  mobility: number;
}

export interface DailyLog {
  date: string;
  ringChanges: RingValues;
  IQChange: number;
  modes: string[];
  verified: boolean;
}

export interface User {
  id: string;
  baseline: Baseline;
  IQ: number;
  tier: TierLevel;
  rings: RingValues;
  dailyLogs: DailyLog[];
  createdAt: Date;
  photoGallery: string[];
  isDemo: boolean;
}

export type TierLevel = 'FND' | 'Aware' | 'Aligned' | 'Progressive' | 'Vanguard';

export interface ImpactMode {
  id: string;
  name: string;
  description: string;
  ring: keyof RingValues;
  basePoints: number;
  multiplier: number;
  icon: string;
}

export interface LeaderboardUser {
  id: string;
  rank: number;
  city: string;
  IQ: number;
  tier: TierLevel;
  percentile: number;
  isCurrentUser?: boolean;
}

export type ViewType = 'onboarding' | 'dashboard' | 'insights' | 'activities' | 'community' | 'learn' | 'leaderboard' | 'profile' | 'scan' | 'ecospace' | 'greenfinance' | 'coupons' | 'transit';

export const TIER_DEFINITIONS: Record<TierLevel, { min: number; max: number; label: string; color: string }> = {
  FND: { min: 0, max: 39, label: 'Foundation', color: '#8e8e93' },
  Aware: { min: 40, max: 59, label: 'Aware', color: '#ff9500' },
  Aligned: { min: 60, max: 74, label: 'Aligned', color: '#ffcc00' },
  Progressive: { min: 75, max: 89, label: 'Progressive', color: '#34c759' },
  Vanguard: { min: 90, max: 100, label: 'Vanguard', color: '#30d158' }
};

export const IMPACT_MODES: ImpactMode[] = [
  {
    id: 'plant-based',
    name: 'Plant-Based Day',
    description: 'No meat consumption today',
    ring: 'consumption',
    basePoints: 25,
    multiplier: 1.2,
    icon: '🥗'
  },
  {
    id: 'transit',
    name: 'Transit Day',
    description: 'Public transport only',
    ring: 'mobility',
    basePoints: 25,
    multiplier: 1.3,
    icon: '🚌'
  },
  {
    id: 'thrift',
    name: 'Thrift Hunt',
    description: 'Second-hand shopping',
    ring: 'circularity',
    basePoints: 30,
    multiplier: 1.15,
    icon: '👕'
  },
  {
    id: 'repair',
    name: 'Repair Session',
    description: 'Fixed instead of replaced',
    ring: 'circularity',
    basePoints: 35,
    multiplier: 1.25,
    icon: '🔧'
  },
  {
    id: 'minimal',
    name: 'Minimal Mode',
    description: 'Reduced consumption overall',
    ring: 'circularity',
    basePoints: 10,
    multiplier: 1.5,
    icon: '✨'
  }
];

export const COMMUTE_TYPES = [
  { value: 'car', label: 'Personal Car', impact: -20 },
  { value: 'hybrid', label: 'Hybrid Vehicle', impact: -10 },
  { value: 'electric', label: 'Electric Vehicle', impact: 0 },
  { value: 'public', label: 'Public Transit', impact: 15 },
  { value: 'bike', label: 'Bicycle', impact: 25 },
  { value: 'walk', label: 'Walking', impact: 30 }
];

export const DIET_TYPES = [
  { value: 'meat-heavy', label: 'Meat Heavy', impact: -20 },
  { value: 'average', label: 'Average Diet', impact: 0 },
  { value: 'vegetarian', label: 'Vegetarian', impact: 15 },
  { value: 'vegan', label: 'Vegan', impact: 25 },
  { value: 'flexitarian', label: 'Flexitarian', impact: 10 }
];

export const CLOTHING_FREQUENCIES = [
  { value: 'fast-fashion', label: 'Fast Fashion', impact: -15 },
  { value: 'average', label: 'Average Consumer', impact: 0 },
  { value: 'conscious', label: 'Conscious Buyer', impact: 10 },
  { value: 'minimalist', label: 'Minimalist', impact: 20 },
  { value: 'secondhand', label: 'Secondhand Only', impact: 25 }
];

export const CITIES = [
  'Bengaluru', 'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix',
  'San Francisco', 'Seattle', 'Denver', 'Boston', 'Miami',
  'Austin', 'Portland', 'Atlanta', 'Dallas', 'San Diego',
  'Mumbai', 'Delhi', 'Chennai', 'Hyderabad', 'Pune', 'Kolkata'
];
