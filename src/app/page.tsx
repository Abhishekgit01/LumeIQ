'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { getSession, logout } from '@/lib/localAuth';
import { AuthScreen } from '@/components/auth/AuthScreen';
import { OnboardingForm } from '@/components/onboarding/OnboardingForm';
import { AppShell } from '@/components/layout/AppShell';
import { DashboardView } from '@/components/views/DashboardView';
import { InsightsView } from '@/components/views/InsightsView';
import { ActivitiesView } from '@/components/views/ActivitiesView';
import { CommunityView } from '@/components/views/CommunityView';
import { LearnView } from '@/components/views/LearnView';
import { ProfileView } from '@/components/views/ProfileView';
import { ScanView } from '@/components/views/ScanView';
import { EcoSpaceView } from '@/components/views/EcoSpaceView';
import { GreenFinanceView } from '@/components/views/GreenFinanceView';
import { CouponsView } from '@/components/views/CouponsView';
import { TransitView } from '@/components/views/TransitView';
import { LeaderboardList } from '@/components/leaderboard/LeaderboardList';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface AuthUser {
  id: string;
  email: string;
  name: string | null;
}

export default function Home() {
  const { user, currentView, hasOnboarded, leaderboard, initialize } = useStore();
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [authChecking, setAuthChecking] = useState(true);

  // Check localStorage session on mount
  useEffect(() => {
    const session = getSession();
    if (session) {
      setAuthUser(session);
    }
    setAuthChecking(false);
  }, []);

  // Initialize store once authenticated
  useEffect(() => {
    if (authUser) {
      initialize();
    }
  }, [authUser, initialize]);

  // Loading
  if (authChecking) {
    return (
      <main className="min-h-screen bg-[var(--ios-bg)] flex items-center justify-center safe-top safe-bottom">
        <Loader2 className="w-8 h-8 text-[var(--ios-blue)] animate-spin" />
      </main>
    );
  }

  // Not authenticated
  if (!authUser) {
    return <AuthScreen onAuthenticated={(u) => setAuthUser(u)} />;
  }

  // Authenticated but not onboarded
  if (!hasOnboarded || !user) {
    return (
      <main className="min-h-screen bg-[var(--ios-bg)] text-[var(--ios-label)] safe-top safe-bottom">
        <OnboardingForm />
      </main>
    );
  }

  // Fully authenticated + onboarded
  return (
    <AppShell>
      <AnimatePresence mode="wait">
        {currentView === 'dashboard' && <DashboardView key="dashboard" />}
        {currentView === 'scan' && <ScanView key="scan" />}
        {currentView === 'ecospace' && <EcoSpaceView key="ecospace" />}
        {currentView === 'greenfinance' && <GreenFinanceView key="greenfinance" />}
        {currentView === 'coupons' && <CouponsView key="coupons" />}
        {currentView === 'transit' && <TransitView key="transit" />}
        {currentView === 'insights' && <InsightsView key="insights" />}
        {currentView === 'activities' && <ActivitiesView key="activities" />}
        {currentView === 'community' && <CommunityView key="community" />}
        {currentView === 'learn' && <LearnView key="learn" />}
        {currentView === 'leaderboard' && <LeaderboardView key="leaderboard" leaderboard={leaderboard} />}
        {currentView === 'profile' && <ProfileView key="profile" />}
      </AnimatePresence>
    </AppShell>
  );
}

function LeaderboardView({ leaderboard }: { leaderboard: ReturnType<typeof useStore>['leaderboard'] }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col">
      <p className="text-[14px] text-[var(--ios-tertiary-label)] mb-4">Weekly ranking by 7-day rolling IQ</p>
      <LeaderboardList users={leaderboard} />
    </motion.div>
  );
}
