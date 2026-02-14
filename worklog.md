# GreenLedger Web Development Worklog

---
## Task ID: 1 - Main Development
### Work Task
Build a complete GreenLedger web application - a responsive web platform that quantifies and rewards sustainable financial behavior with Apple Fitness-like UI.

### Work Summary

#### Implemented Features:

1. **Core Infrastructure**
   - TypeScript types and interfaces for User, DailyLog, RingValues, ImpactMode, etc.
   - Zustand store for global state management with localStorage persistence
   - IQ calculation algorithm with tier-based k-values
   - Multiplier system for impact modes with verification boost

2. **Onboarding Flow**
   - 4-step progressive onboarding (Commute, Clothing, Diet, City)
   - Initial IQ calculation based on baseline inputs
   - Auto-redirect to dashboard after completion

3. **Dashboard View**
   - Three animated rings (Circularity - Green, Consumption - Yellow, Mobility - Blue)
   - Center IQ display with tier badge
   - Daily summary with ring progress
   - Impact mode activation buttons with photo verification modal

4. **Impact Modes**
   - Plant-Based Day (+25 Consumption, ×1.2)
   - Transit Day (+25 Mobility, ×1.3)
   - Thrift Hunt (+30 Circularity, ×1.15)
   - Repair Session (+35 Circularity, ×1.25)
   - Minimal Mode (+10 Circularity, ×1.5)
   - Photo verification for +15% boost

5. **Leaderboard View**
   - City-based top 10 users
   - Tier badges and percentile rankings
   - Highlight current user

6. **Profile View**
   - 30-day IQ history chart (Recharts)
   - Verified impact photo gallery
   - Baseline settings display
   - Profile reset option

7. **Demo Mode**
   - Toggle to switch to pre-seeded demo user
   - 60 days of logs with IQ ≈ 78 (Progressive tier)
   - Realistic mock data

#### File Structure:
```
src/
├── app/
│   ├── page.tsx (main single-page app)
│   ├── layout.tsx (root layout with dark theme)
│   └── globals.css (design system styles)
├── components/
│   ├── rings/
│   │   ├── AnimatedRing.tsx
│   │   └── RingGroup.tsx
│   ├── dashboard/
│   │   ├── IQDisplay.tsx
│   │   ├── DailySummary.tsx
│   │   └── ImpactModes.tsx
│   ├── leaderboard/
│   │   └── LeaderboardList.tsx
│   ├── profile/
│   │   ├── IQChart.tsx
│   │   └── PhotoGallery.tsx
│   └── onboarding/
│       └── OnboardingForm.tsx
├── lib/
│   ├── calculations.ts (IQ and multiplier logic)
│   ├── storage.ts (localStorage persistence)
│   └── mockData.ts (demo user data)
├── store/
│   └── useStore.ts (Zustand store)
└── types/
    └── index.ts (TypeScript types)
```

#### Design System:
- Background: #0a0a0a (deep black)
- Card: #1c1c1e (dark gray)
- Circularity Ring: #34c759 (Apple green)
- Consumption Ring: #ffcc00 (Apple yellow)
- Mobility Ring: #007aff (Apple blue)
- Accent: #30d158 (vibrant green)
- Text: #ffffff (primary), #8e8e93 (secondary)

#### Tier System:
- 0–39 → Foundation (FND)
- 40–59 → Aware
- 60–74 → Aligned
- 75–89 → Progressive
- 90–100 → Vanguard

#### Technical Notes:
- All views implemented within single `/` route using state-based view switching
- Framer Motion for animations with reduced motion support
- Responsive design for all device sizes
- Lint passes with no errors
