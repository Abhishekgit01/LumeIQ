# 🌿 LumeIQ

**LumeIQ** is a next-generation **AI-powered sustainability platform** that quantifies eco-friendly financial behavior and provides advanced intelligent assistants. Merging personal impact tracking with a suite of multimodal AI tools, LumeIQ helps users live greener while staying smarter.

![LumeIQ Android App](https://img.shields.io/badge/Platform-Android-green?style=for-the-badge&logo=android)
![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Capacitor](https://img.shields.io/badge/Capacitor-5.0-blue?style=for-the-badge&logo=capacitor)

---

## 🚀 Features

### 🌍 Green Intelligence (Sustainability Tracking)
LumeIQ calculates your **Impact Quotient (IQ)**—a personalized score (0-100) that tracks your environmental footprint based on financial behavior and lifestyle choices.
- **📊 Impact Quotient (IQ):** Real-time sustainability scoring.
- **⭕ Progress Rings:** Visualize Circularity, Consumption, and Mobility goals.
- **🏆 Leaderboards:** Compete with city-based rankings and peer comparisons.
- **📱 Mobile-First Design:** Apple Fitness-inspired UI with dark mode and smooth Framer Motion animations.

### 🔍 Smart Product Scanning (OpenFoodFacts Integration)
Scan barcodes to instantly retrieve comprehensive environmental and nutritional data:
- **🍎 Nutri-Score & Eco-Score:** Real-time fetching of product sustainability grades.
- **📦 Packaging Analysis:** Detailed breakdown of packaging materials and recyclability.
- **🌍 Carbon Footprint:** Estimate the CO2 impact of your groceries.
- **🧪 Additives & Allergens:** Instant alerts for harmful ingredients.
- **Data Source:** Powered by the open-source **OpenFoodFacts** database with over 3 million products.

---

## 🛠️ Tech Stack

- **Frontend:** Next.js 15 (App Router), React, TypeScript
- **Styling:** Tailwind CSS, Shadcn UI, Framer Motion
- **Mobile:** Capacitor (Android)
- **Data:** OpenFoodFacts API, Supabase (PostgreSQL), Prisma
- **State Management:** Zustand

---

## 🏁 Quick Start

### Prerequisites
- **Node.js** 18.x or higher
- **Bun** (recommended) or npm/yarn
- **Android Studio** (for building the APK)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Abhishekgit01/LumeIQ.git
   cd LumeIQ
   ```

2. **Install dependencies:**
   ```bash
   bun install
   # or
   npm install
   ```

3. **Set up Environment:**
   Copy `.env.example` to `.env` and fill in your API keys (Supabase, Google Cloud Vision, etc.):
   ```bash
   cp .env.example .env
   ```

4. **Run Web Development Server:**
   ```bash
   bun dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view the web app.

---

## 📱 Mobile Build (Android)

LumeIQ is optimized for Android devices.

1. **Build the web assets:**
   ```bash
   bun run build
   # or
   npm run build
   ```

2. **Sync with Capacitor:**
   ```bash
   npx cap sync
   ```

3. **Open in Android Studio:**
   ```bash
   npx cap open android
   ```
   *Connect your device and hit "Run" to install the APK.*

---

## 📂 Project Structure

```
LumeIQ/
├── android/             # Android native project files
├── src/
│   ├── app/             # Next.js App Router pages
│   ├── components/      # React components (Views, UI)
│   ├── lib/             # Utilities and helpers
│   └── store/           # State management (Zustand)
├── public/              # Static assets
├── capacitor.config.ts  # Android build config
└── package.json
```

---

## 🧠 How It Works (Sustainability Core)

### Impact Quotient (IQ) Formula

LumeIQ uses a logarithmic growth model to calculate your sustainability score, making it easier to improve early on but harder as you master green living.

```math
IQ_{new} = IQ_{current} + \left( (100 - IQ_{current}) \times (1 - e^{-k \times BPI}) \right)
```

- **BPI (Behavioral Progress Index):** Weighted average of your daily improvements in Mobility (30%), Consumption (35%), and Circularity (35%).
- **k (Decay Constant):** Difficulty factor that increases as you level up (0.12 → 0.035).
- **Daily Cap:** Maximum +6 IQ points per day to encourage consistency.
- **Verification Boost:** **+15% bonus** for actions verified with a photo.

### Tier System
| IQ Range | Tier | Difficulty (k) | Status |
| :--- | :--- | :--- | :--- |
| **0 - 39** | **Foundation** | 0.12 (Easiest) | Starting Journey |
| **40 - 59** | **Aware** | 0.07 | Conscious Impact |
| **60 - 74** | **Aligned** | 0.035 | Living Sustainably |
| **75 - 89** | **Progressive** | 0.035 | Leading Example |
| **90 - 100** | **Vanguard** | 0.035 (Hardest) | Sustainability Champion |

---

## 📜 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---
Built with 💚 for a sustainable future.