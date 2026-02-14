# 🌿 GreenLedger Web

A **sustainability tracking platform** that quantifies and rewards eco-friendly financial behavior. Built with Apple Fitness-inspired UI design.

![GreenLedger Preview](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css)

## 🎯 Features

- **📊 Impact Quotient (IQ)** - Personalized sustainability score (0-100)
- **⭕ Animated Rings** - Three progress rings (Circularity, Consumption, Mobility)
- **🎯 Impact Modes** - Track eco-friendly actions with multipliers
- **🏆 Leaderboard** - City-based rankings and percentiles
- **📈 Progress Tracking** - 30-day IQ history charts
- **🎨 Apple-Inspired UI** - Dark theme with smooth animations

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18.x or higher
- **Bun** (recommended) or npm/pnpm/yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/greenledger-web.git
cd greenledger-web

# Install dependencies
bun install
# OR with npm
npm install

# Start development server
bun run dev
# OR with npm
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
greenledger-web/
├── src/
│   ├── app/
│   │   ├── page.tsx          # Main single-page application
│   │   ├── layout.tsx        # Root layout with dark theme
│   │   └── globals.css       # Global styles & design tokens
│   ├── components/
│   │   ├── rings/            # Animated ring components
│   │   ├── dashboard/        # Dashboard widgets
│   │   ├── leaderboard/      # Leaderboard components
│   │   ├── profile/          # Profile & charts
│   │   ├── onboarding/       # Onboarding flow
│   │   └── ui/               # Reusable UI components
│   ├── lib/
│   │   ├── calculations.ts   # IQ & multiplier formulas
│   │   ├── storage.ts        # LocalStorage persistence
│   │   └── mockData.ts       # Demo user data
│   ├── store/
│   │   └── useStore.ts       # Zustand state management
│   └── types/
│       └── index.ts          # TypeScript definitions
├── public/                   # Static assets
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

## 🧠 How It Works

### Impact Quotient (IQ) Formula

```
IQ_new = IQ_current + ((100 - IQ_current) × (1 - exp(-k × BPI)))
```

- **BPI** = Weighted average of ring improvements vs baseline
- **k** = Tier-based constant (0.12 → 0.035)
- **Daily cap** = +6 IQ maximum

### Tier System

| IQ Range | Tier | Description |
|----------|------|-------------|
| 0-39 | Foundation (FND) | Starting your journey |
| 40-59 | Aware | Conscious of impact |
| 60-74 | Aligned | Living sustainably |
| 75-89 | Progressive | Leading by example |
| 90-100 | Vanguard | Sustainability champion |

### Impact Modes

| Mode | Ring | Points | Multiplier |
|------|------|--------|------------|
| 🥗 Plant-Based Day | Consumption | +25 | ×1.2 |
| 🚌 Transit Day | Mobility | +25 | ×1.3 |
| 👕 Thrift Hunt | Circularity | +30 | ×1.15 |
| 🔧 Repair Session | Circularity | +35 | ×1.25 |
| ✨ Minimal Mode | Circularity | +10 | ×1.5 |

**Photo Verification** = +15% boost on any mode

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| Next.js 15 | React framework with App Router |
| TypeScript | Type-safe development |
| Tailwind CSS | Utility-first styling |
| Framer Motion | Smooth animations |
| Zustand | State management |
| Lucide Icons | Beautiful icons |

## 📱 Screenshots

### Dashboard
The main dashboard shows your three animated rings and IQ score:
- 🟢 **Circularity** (Green) - Outer ring
- 🟡 **Consumption** (Yellow) - Middle ring
- 🔵 **Mobility** (Blue) - Inner ring

### Impact Modes
Activate sustainable actions to earn points and boost your IQ.

### Leaderboard
Compare your progress with others in your city.

## 🔧 Available Scripts

```bash
# Development server
bun run dev

# Build for production
bun run build

# Start production server
bun run start

# Lint code
bun run lint

# Type check
bun run type-check
```

## 📤 Upload to GitHub

### Option 1: New Repository

1. **Create a new repository** on [GitHub](https://github.com/new)
2. **Initialize Git** (if not already):
   ```bash
   git init
   git add .
   git commit -m "Initial commit: GreenLedger Web"
   ```
3. **Add remote and push**:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/greenledger-web.git
   git branch -M main
   git push -u origin main
   ```

### Option 2: Download First, Then Upload

1. **Download the project** as ZIP from your current workspace
2. **Extract** to your desired location
3. **Initialize Git**:
   ```bash
   cd greenledger-web
   git init
   git add .
   git commit -m "Initial commit: GreenLedger Web"
   ```
4. **Create repository on GitHub** and push:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/greenledger-web.git
   git branch -M main
   git push -u origin main
   ```

## 🚀 Deploy to Vercel

### One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/greenledger-web)

### Manual Deploy

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com)
3. Import your GitHub repository
4. Click **Deploy**

## 🎨 Design System

### Colors

| Token | Value | Usage |
|-------|-------|-------|
| Background | `#0a0a0a` | Main background |
| Card | `#1c1c1e` | Cards & panels |
| Accent | `#30d158` | Primary actions |
| Green Ring | `#34c759` | Circularity |
| Yellow Ring | `#ffcc00` | Consumption |
| Blue Ring | `#007aff` | Mobility |

### Typography

- **Display**: Bold, large headings
- **Body**: Regular, readable text
- **Numbers**: Tabular figures for data

## 🔮 Future Roadmap

- [ ] Firebase Authentication (Google/Email)
- [ ] Firestore database integration
- [ ] FinTech integration (bank/UPI)
- [ ] AI-powered eco coach
- [ ] Team challenges
- [ ] Blockchain proof layer

## 📄 License

MIT License - feel free to use for personal or commercial projects.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

Built with 💚 for a sustainable future.
