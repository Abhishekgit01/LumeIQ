import { create } from 'zustand';
import { User, ViewType, DailyLog, RingValues, TierLevel, LeaderboardUser, Baseline } from '@/types';
import { saveUser, loadUser, clearUser, addDailyLog, getTodayDate } from '@/lib/storage';
import { 
  getTierFromIQ, 
  calculateInitialIQ, 
  calculateInitialRings, 
  calculateNewIQ,
  applyImpactMode 
} from '@/lib/calculations';
import { createDemoUser, generateLeaderboard } from '@/lib/mockData';
import { scheduleSyncToCloud } from '@/lib/sync';
import { getSessionWithHash } from '@/lib/localAuth';

interface AppState {
  // User state
  user: User | null;
  isDemoMode: boolean;
  currentView: ViewType;
  leaderboard: LeaderboardUser[];
  
  // Onboarding
  hasOnboarded: boolean;
  
  // Actions
  initialize: () => void;
  completeOnboarding: (baseline: Baseline) => void;
  updateUser: (updates: Partial<User>) => void;
  activateMode: (modeId: string, verified?: boolean) => void;
  setView: (view: ViewType) => void;
  toggleDemoMode: () => void;
  resetUser: () => void;
}

const generateId = () => Math.random().toString(36).substring(2, 15);

function triggerSync(user: User) {
  const session = getSessionWithHash();
  if (session && !user.isDemo) {
    scheduleSyncToCloud(user, session.email, session.passwordHash);
  }
}

export const useStore = create<AppState>((set, get) => ({
  user: null,
  isDemoMode: false,
  currentView: 'onboarding',
  leaderboard: [],
  hasOnboarded: false,
  
  initialize: () => {
    const savedUser = loadUser();
    if (savedUser) {
      set({ 
        user: savedUser, 
        hasOnboarded: true, 
        currentView: 'dashboard',
        isDemoMode: savedUser.isDemo,
        leaderboard: generateLeaderboard(savedUser.baseline.city, savedUser.id)
      });
      triggerSync(savedUser);
    }
  },
  
  completeOnboarding: (baseline: Baseline) => {
    const initialIQ = calculateInitialIQ(baseline);
    const initialRings = calculateInitialRings(baseline);
    const initialTier = getTierFromIQ(initialIQ);
    
    const newUser: User = {
      id: generateId(),
      baseline,
      IQ: initialIQ,
      tier: initialTier,
      rings: initialRings,
      dailyLogs: [],
      createdAt: new Date(),
      photoGallery: [],
      isDemo: false
    };
    
    saveUser(newUser);
    triggerSync(newUser);
    
    set({ 
      user: newUser, 
      hasOnboarded: true, 
      currentView: 'dashboard',
      leaderboard: generateLeaderboard(baseline.city, newUser.id)
    });
  },
  
  updateUser: (updates: Partial<User>) => {
    const currentUser = get().user;
    if (!currentUser) return;
    
    const updatedUser = { ...currentUser, ...updates };
    if (updates.IQ !== undefined) {
      updatedUser.tier = getTierFromIQ(updates.IQ);
    }
    
    saveUser(updatedUser);
    triggerSync(updatedUser);
    set({ user: updatedUser });
  },
  
  activateMode: (modeId: string, verified: boolean = false) => {
    const { user, isDemoMode } = get();
    if (!user) return;
    
    const modes = [
      { id: 'plant-based', ring: 'consumption' as keyof RingValues, basePoints: 25, multiplier: 1.2 },
      { id: 'transit', ring: 'mobility' as keyof RingValues, basePoints: 25, multiplier: 1.3 },
      { id: 'thrift', ring: 'circularity' as keyof RingValues, basePoints: 30, multiplier: 1.15 },
      { id: 'repair', ring: 'circularity' as keyof RingValues, basePoints: 35, multiplier: 1.25 },
      { id: 'minimal', ring: 'circularity' as keyof RingValues, basePoints: 10, multiplier: 1.5 }
    ];
    
    const mode = modes.find(m => m.id === modeId);
    if (!mode) return;
    
    const newRings = applyImpactMode(
      mode.ring,
      mode.basePoints,
      mode.multiplier,
      user.rings,
      verified
    );
    
    const ringChanges: RingValues = {
      circularity: newRings.circularity - user.rings.circularity,
      consumption: newRings.consumption - user.rings.consumption,
      mobility: newRings.mobility - user.rings.mobility
    };
    
    const { newIQ, iqChange } = calculateNewIQ(user.IQ, ringChanges, user.rings, verified);
    const newTier = getTierFromIQ(newIQ);
    
    const today = getTodayDate();
    const log: DailyLog = {
      date: today,
      ringChanges,
      IQChange: iqChange,
      modes: [modeId],
      verified
    };
    
    const updatedUser = addDailyLog({ ...user }, log);
    updatedUser.IQ = newIQ;
    updatedUser.tier = newTier;
    updatedUser.rings = newRings;
    
    if (!isDemoMode) {
      saveUser(updatedUser);
      triggerSync(updatedUser);
    }
    
    set({ user: updatedUser });
  },
  
  setView: (view: ViewType) => {
    set({ currentView: view });
  },
  
  toggleDemoMode: () => {
    const { isDemoMode } = get();
    
    if (!isDemoMode) {
      const demoUser = createDemoUser();
      set({ 
        user: demoUser, 
        isDemoMode: true, 
        hasOnboarded: true,
        currentView: 'dashboard',
        leaderboard: generateLeaderboard(demoUser.baseline.city, demoUser.id)
      });
    } else {
      clearUser();
      set({ 
        user: null, 
        isDemoMode: false, 
        hasOnboarded: false,
        currentView: 'onboarding',
        leaderboard: []
      });
    }
  },
  
  resetUser: () => {
    clearUser();
    set({ 
      user: null, 
      isDemoMode: false, 
      hasOnboarded: false,
      currentView: 'onboarding',
      leaderboard: []
    });
  }
}));
