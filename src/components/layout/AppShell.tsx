'use client';

import { Leaf, LayoutDashboard, BarChart3, Activity, Users, BookOpen, Trophy, User, ScanLine, MapPin, Wallet } from 'lucide-react';
import { ViewType } from '@/types';
import { useStore } from '@/store/useStore';
import { SmallLeaf, TinyLeaf, LeafBranch, CardLeaves, FloatingLeaves } from '@/components/ui/LeafDecorations';

const VIEW_LABELS: Record<ViewType, string> = {
  onboarding: 'Welcome',
  dashboard: 'Dashboard',
  insights: 'Insights',
  activities: 'Activities',
  community: 'Community',
  learn: 'Learn',
  leaderboard: 'Leaderboard',
  profile: 'Profile',
  scan: 'Scan & Know',
  ecospace: 'EcoSpace',
  greenfinance: 'Green Finance',
};

const SIDEBAR_NAV: { view: ViewType; icon: React.ReactNode; label: string }[] = [
  { view: 'dashboard', icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard' },
  { view: 'scan', icon: <ScanLine className="w-5 h-5" />, label: 'Scan & Know' },
  { view: 'ecospace', icon: <MapPin className="w-5 h-5" />, label: 'EcoSpace' },
  { view: 'greenfinance', icon: <Wallet className="w-5 h-5" />, label: 'Green Finance' },
  { view: 'insights', icon: <BarChart3 className="w-5 h-5" />, label: 'Insights' },
  { view: 'activities', icon: <Activity className="w-5 h-5" />, label: 'Activities' },
  { view: 'community', icon: <Users className="w-5 h-5" />, label: 'Community' },
  { view: 'learn', icon: <BookOpen className="w-5 h-5" />, label: 'Learn' },
  { view: 'leaderboard', icon: <Trophy className="w-5 h-5" />, label: 'Leaderboard' },
  { view: 'profile', icon: <User className="w-5 h-5" />, label: 'Profile' },
];

const MOBILE_NAV: { view: ViewType; icon: React.ReactNode; label: string }[] = [
  { view: 'dashboard', icon: <LayoutDashboard className="w-[22px] h-[22px]" />, label: 'Home' },
  { view: 'scan', icon: <ScanLine className="w-[22px] h-[22px]" />, label: 'Scan' },
  { view: 'ecospace', icon: <MapPin className="w-[22px] h-[22px]" />, label: 'EcoSpace' },
  { view: 'greenfinance', icon: <Wallet className="w-[22px] h-[22px]" />, label: 'Finance' },
  { view: 'profile', icon: <User className="w-[22px] h-[22px]" />, label: 'Profile' },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const { currentView, setView, user, isDemoMode, toggleDemoMode } = useStore();

  return (
    <main className="min-h-screen bg-[#f0f7f0] text-[#1a2e1a] flex leaf-bg-pattern">
      <FloatingLeaves />

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-[260px] flex-col bg-white vine-border-right z-50">
        {/* Logo */}
        <div className="px-6 py-6 flex items-center gap-3 relative">
          <div className="w-10 h-10 rounded-[12px] bg-gradient-to-br from-[#2d8a4e] to-[#5cb85c] flex items-center justify-center">
            <Leaf className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-[16px] font-bold tracking-[-0.01em] text-[#1a2e1a]">LumeIQ</p>
            <p className="text-[11px] text-[#5e7a5e]">Impact Tracker</p>
          </div>
          <SmallLeaf className="absolute top-3 right-6 text-[#2d8a4e] rotate-[-30deg]" />
          <TinyLeaf className="absolute top-8 right-10 rotate-[40deg]" />
        </div>

        <div className="px-6 -mt-2 mb-2">
          <LeafBranch className="w-full h-[20px]" />
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {SIDEBAR_NAV.map((item) => (
            <button key={item.view} onClick={() => setView(item.view)} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-[12px] text-[15px] font-medium transition-all relative ${currentView === item.view ? 'bg-[#2d8a4e]/8 text-[#2d8a4e]' : 'text-[#5e7a5e] hover:bg-[#2d8a4e]/5 hover:text-[#1a2e1a]'}`}>
              {item.icon}
              {item.label}
              {currentView === item.view && <TinyLeaf className="absolute right-3 rotate-[25deg]" />}
            </button>
          ))}
        </nav>

        <div className="px-6 py-2">
          <LeafBranch className="w-full h-[20px]" />
        </div>

        {/* Sidebar user card */}
        {user && (
          <div className="px-4 pb-6">
            <div className="card-surface-sm p-3 flex items-center gap-3 relative">
              <CardLeaves variant="a" />
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#2d8a4e] to-[#5cb85c] flex items-center justify-center relative z-10">
                <span className="text-[13px] font-bold text-white">{Math.round(user.IQ)}</span>
              </div>
              <div className="flex-1 min-w-0 relative z-10">
                <p className="text-[13px] font-semibold text-[#1a2e1a] truncate">{user.baseline.city}</p>
                <p className="text-[11px] text-[#5e7a5e]">{user.tier} Tier</p>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen lg:ml-[260px] relative z-10">
        {/* Mobile Header */}
        <header className="lg:hidden sticky top-0 z-40 bg-[#f0f7f0]/90 backdrop-blur-md">
          <div className="flex items-center justify-between px-5 py-3">
            <div className="flex items-center gap-2">
              <span className="text-[20px] font-semibold tracking-[-0.02em]">
                {VIEW_LABELS[currentView]}
              </span>
              <Leaf className="w-4 h-4 text-[#2d8a4e]/25" />
            </div>
            <button onClick={toggleDemoMode} className={`text-[13px] font-medium px-3 py-1.5 rounded-full transition-all ${isDemoMode ? 'bg-[#2d8a4e]/10 text-[#2d8a4e] border border-[#2d8a4e]/20' : 'bg-[#1a2e1a]/5 text-[#5e7a5e] border border-[#1a2e1a]/8'}`}>
              {isDemoMode ? 'Demo On' : 'Demo'}
            </button>
          </div>
        </header>

        {/* Desktop Header */}
        <header className="hidden lg:flex sticky top-0 z-40 bg-[#f0f7f0]/90 backdrop-blur-md items-center justify-between px-8 py-4 border-b border-[#2d8a4e]/8">
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-[24px] font-bold tracking-[-0.02em]">{VIEW_LABELS[currentView]}</h1>
                <Leaf className="w-5 h-5 text-[#2d8a4e]/30" />
                <SmallLeaf className="text-[#5cb85c] rotate-[20deg]" size={10} />
              </div>
              <p className="text-[14px] text-[#5e7a5e] mt-0.5">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>
          <button onClick={toggleDemoMode} className={`text-[13px] font-medium px-4 py-2 rounded-full transition-all ${isDemoMode ? 'bg-[#2d8a4e]/10 text-[#2d8a4e] border border-[#2d8a4e]/20' : 'bg-[#1a2e1a]/5 text-[#5e7a5e] border border-[#1a2e1a]/8'}`}>
            {isDemoMode ? 'Demo Mode On' : 'Try Demo'}
          </button>
        </header>

        {/* Page content */}
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="mx-auto w-full max-w-[430px] lg:max-w-[1100px] px-5 lg:px-8 pb-28 lg:pb-10 pt-2 lg:pt-6">
            {children}
          </div>
        </div>

        {/* Mobile Bottom Nav */}
        <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/90 backdrop-blur-md border-t border-[#2d8a4e]/8">
          <div className="w-full max-w-[430px] mx-auto flex items-center justify-around py-2 pb-[calc(8px+env(safe-area-inset-bottom))]">
            {MOBILE_NAV.map((item) => (
              <button key={item.view} onClick={() => setView(item.view)} className={`flex flex-col items-center gap-0.5 px-4 py-1 transition-all relative ${currentView === item.view ? 'text-[#2d8a4e]' : 'text-[#5e7a5e]/50'}`}>
                {item.icon}
                <span className="text-[10px] font-medium">{item.label}</span>
                {currentView === item.view && <TinyLeaf className="absolute -top-1 -right-1 rotate-[30deg]" />}
              </button>
            ))}
          </div>
        </nav>
      </div>
    </main>
  );
}
