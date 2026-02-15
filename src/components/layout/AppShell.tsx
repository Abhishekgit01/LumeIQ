'use client';

import { useEffect, useState } from 'react';
import { LayoutDashboard, ScanLine, MapPin, CreditCard, User, Sun, Moon, Gift, Route, TrendingUp, Leaf, Banknote, ShoppingBag } from 'lucide-react';
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
  impact: 'Impact',
  finance: 'Finance',
  marketplace: 'Marketplace',
};

const TABS: { view: ViewType; icon: typeof LayoutDashboard; label: string }[] = [
  { view: 'dashboard', icon: LayoutDashboard, label: 'Summary' },
  { view: 'activities', icon: Leaf, label: 'Activities' },
  { view: 'ecospace', icon: MapPin, label: 'EcoSpace' },
  { view: 'marketplace', icon: ShoppingBag, label: 'Marketplace' },
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
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setView('scan')}
                      className="w-9 h-9 rounded-full bg-[var(--ios-card)] flex items-center justify-center ios-press"
                      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}
                    >
                      <ScanLine className="w-4 h-4 text-[var(--ios-green)]" />
                    </button>
                    <button
                      onClick={toggleTheme}
                      className="w-9 h-9 rounded-full bg-[var(--ios-card)] flex items-center justify-center ios-press"
                      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}
                    >
                      {dark ? <Sun className="w-4 h-4 text-[var(--ios-orange)]" /> : <Moon className="w-4 h-4 text-[var(--ios-tertiary-label)]" />}
                    </button>
                  </div>
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
          <nav className="fixed bottom-0 inset-x-0 z-50 safe-bottom px-4 pb-1.5">
            <div
              className="w-full max-w-[430px] mx-auto rounded-[22px] flex items-center justify-around py-1.5 pb-[calc(6px+env(safe-area-inset-bottom))]"
              style={{
                background: dark
                  ? 'rgba(30, 30, 30, 0.65)'
                  : 'rgba(255, 255, 255, 0.55)',
                backdropFilter: 'blur(40px) saturate(180%)',
                WebkitBackdropFilter: 'blur(40px) saturate(180%)',
                boxShadow: dark
                  ? '0 0 0 0.5px rgba(255,255,255,0.08), 0 -1px 12px rgba(0,0,0,0.3)'
                  : '0 0 0 0.5px rgba(0,0,0,0.06), 0 -1px 12px rgba(0,0,0,0.06)',
              }}
            >
            {TABS.map(({ view, icon: Icon, label }) => {
              const active = currentView === view;
              return (
                <button
                  key={view}
                  onClick={() => setView(view)}
                  className="flex flex-col items-center gap-0.5 px-3 py-1 ios-press min-w-[52px]"
                >
                  <Icon
                    className="w-[22px] h-[22px] transition-colors"
                    style={{ color: active ? '#22c55e' : (dark ? '#9ca3af' : '#6b7280') }}
                    strokeWidth={active ? 2.2 : 1.6}
                  />
                  <span
                    className="text-[10px] font-semibold transition-colors"
                    style={{ color: active ? '#22c55e' : (dark ? '#9ca3af' : '#6b7280') }}
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
