'use client';

import { useEffect, useState } from 'react';
import { LayoutDashboard, ScanLine, MapPin, Wallet, User, Sun, Moon, Gift, Route } from 'lucide-react';
import { ViewType } from '@/types';
import { useStore } from '@/store/useStore';

const VIEW_LABELS: Record<ViewType, string> = {
  onboarding: 'Welcome',
  dashboard: 'Summary',
  insights: 'Insights',
  activities: 'Activities',
  community: 'Community',
  learn: 'Learn',
  leaderboard: 'Leaderboard',
  profile: 'Profile',
  scan: 'Scan',
  ecospace: 'EcoSpace',
  greenfinance: 'Finance',
  coupons: 'Rewards',
  transit: 'Eco Routes',
};

const TABS: { view: ViewType; icon: typeof LayoutDashboard; label: string }[] = [
  { view: 'dashboard', icon: LayoutDashboard, label: 'Summary' },
  { view: 'scan', icon: ScanLine, label: 'Scan' },
  { view: 'transit', icon: Route, label: 'Routes' },
  { view: 'coupons', icon: Gift, label: 'Rewards' },
  { view: 'profile', icon: User, label: 'Profile' },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const { currentView, setView } = useStore();
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('lumeiq-theme');
    if (saved === 'dark') {
      setDark(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    setDark(d => {
      const next = !d;
      document.documentElement.classList.toggle('dark', next);
      localStorage.setItem('lumeiq-theme', next ? 'dark' : 'light');
      return next;
    });
  };

  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }).toUpperCase();

  return (
    <main className="min-h-screen bg-[var(--ios-bg)] text-[var(--ios-label)] flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[var(--ios-bg)]/80 backdrop-blur-xl safe-top">
        <div className="max-w-[430px] mx-auto w-full px-5 pt-2 pb-1">
          <p className="text-[11px] font-semibold tracking-wide text-[var(--ios-tertiary-label)]">{dateStr}</p>
          <div className="flex items-center justify-between">
            <h1 className="text-[34px] font-bold tracking-[-0.5px] text-[var(--ios-label)]">
              {VIEW_LABELS[currentView]}
            </h1>
            <button
              onClick={toggleTheme}
              className="w-9 h-9 rounded-full bg-[var(--ios-card)] flex items-center justify-center ios-press"
              style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}
            >
              {dark ? <Sun className="w-4 h-4 text-[var(--ios-orange)]" /> : <Moon className="w-4 h-4 text-[var(--ios-tertiary-label)]" />}
            </button>
          </div>
        </div>
        <div className="h-[0.5px] bg-[var(--ios-separator)]" />
      </header>

      {/* Page content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="mx-auto w-full max-w-[430px] px-4 pb-28 pt-3">
          {children}
        </div>
      </div>

      {/* iOS Bottom Tab Bar */}
      <nav className="fixed bottom-0 inset-x-0 z-50 bg-[var(--ios-card)]/80 backdrop-blur-xl border-t border-[var(--ios-separator)]">
        <div className="w-full max-w-[430px] mx-auto flex items-center justify-around py-1.5 pb-[calc(6px+env(safe-area-inset-bottom))]">
          {TABS.map(({ view, icon: Icon, label }) => {
            const active = currentView === view;
            return (
              <button
                key={view}
                onClick={() => setView(view)}
                className="flex flex-col items-center gap-0.5 px-3 py-1 ios-press min-w-[56px]"
              >
                <Icon
                  className="w-[22px] h-[22px] transition-colors"
                  style={{ color: active ? 'var(--ios-blue)' : 'var(--ios-tertiary-label)' }}
                  strokeWidth={active ? 2.2 : 1.8}
                />
                <span
                  className="text-[10px] font-medium transition-colors"
                  style={{ color: active ? 'var(--ios-blue)' : 'var(--ios-tertiary-label)' }}
                >
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </main>
  );
}
