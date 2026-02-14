'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { AuthScreen } from '@/components/auth/AuthScreen';
import { OnboardingForm } from '@/components/onboarding/OnboardingForm';
import { AppShell } from '@/components/layout/AppShell';
import { FloatingLeaves } from '@/components/ui/LeafDecorations';
import { DashboardView } from '@/components/views/DashboardView';
import { InsightsView } from '@/components/views/InsightsView';
import { ActivitiesView } from '@/components/views/ActivitiesView';
import { CommunityView } from '@/components/views/CommunityView';
import { LearnView } from '@/components/views/LearnView';
import { ProfileView } from '@/components/views/ProfileView';
import { ScanView } from '@/components/views/ScanView';
import { EcoSpaceView } from '@/components/views/EcoSpaceView';
import { GreenFinanceView } from '@/components/views/GreenFinanceView';
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

  // Check if user is already logged in via cookie
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            setAuthUser(data.user);
          }
        }
      } catch {
        // Not authenticated
      } finally {
        setAuthChecking(false);
      }
    }
    checkAuth();
  }, []);

  // Initialize store once authenticated
  useEffect(() => {
    if (authUser) {
      initialize();
    }
  }, [authUser, initialize]);

  // Loading state while checking auth
  if (authChecking) {
    return (
      <main className="min-h-screen bg-[#f0f7f0] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#2d8a4e] animate-spin" />
      </main>
    );
  }

  // Not authenticated — show login/signup
  if (!authUser) {
    return <AuthScreen onAuthenticated={(u) => setAuthUser(u)} />;
  }

  // Authenticated but not onboarded — show onboarding
  if (!hasOnboarded || !user) {
    return (
      <main className="min-h-screen bg-[#f0f7f0] text-[#1a2e1a] leaf-bg-pattern">
        <FloatingLeaves />
        <OnboardingForm />
      </main>
    );
  }

  // Fully authenticated + onboarded — show app
  return (
    <AppShell>
      <AnimatePresence mode="wait">
          {currentView === 'dashboard' && <DashboardView key="dashboard" />}
          {currentView === 'scan' && <ScanView key="scan" />}
          {currentView === 'ecospace' && <EcoSpaceView key="ecospace" />}
          {currentView === 'greenfinance' && <GreenFinanceView key="greenfinance" />}
          {currentView === 'insights' && <InsightsView key="insights" />}
          {currentView === 'activities' && <ActivitiesView key="activities" />}
          {currentView === 'community' && <CommunityView key="community" />}
          {currentView === 'learn' && <LearnView key="learn" />}
          {currentView === 'leaderboard' && <LeaderboardLeaderboardView key="leaderboard" leaderboard={leaderboard} />}
          {currentView === 'profile' && <ProfileView key="profile" />}
        </AnimatePresence>
    </AppShell>
  );
}

function LeaderboardLeaderboardView({ leaderboard }: { leaderboard: ReturnType<typeof useStore>['leaderboard'] }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col">
      <p className="text-[14px] text-[#5e7a5e] mb-4">Weekly ranking by 7-day rolling IQ</p>
      <LeaderboardList users={leaderboard} />
    </motion.div>
  );
}
