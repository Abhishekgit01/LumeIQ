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

### 🧠 LumeIQ AI Skills
Integrated intelligent agents capable of handling complex multimodal tasks:

#### 🗣️ Voice & Audio
- **ASR (Automatic Speech Recognition):** High-accuracy voice-to-text.
- **TTS (Text-to-Speech):** Natural sounding voice synthesis.
- **Podcast Generator:** Turn content into engaging audio episodes.

#### 👁️ Vision & Video
- **VLM (Vision Language Model):** Analyze and understand images.
- **Video Understanding:** Extract insights from video content.
- **Image & Video Generation:** Create media from text prompts.

#### 📄 Document Intelligence
- **Office Suite Support:** Process, read, and generate **DOCX**, **PPTX**, **XLSX**, and **PDF** files with high precision.
- **Web Reader & Search:** Real-time web browsing and content summarization.

#### 💰 Financial Intelligence
- **Green Finance:** Track and analyze sustainable investments.
- **Market Data:** Real-time stock quotes, indices, and crypto data.
- **Portfolio Analysis:** Deep dive into financial health and impact.

---

## 🛠️ Tech Stack

- **Frontend:** Next.js 15 (App Router), React, TypeScript
- **Styling:** Tailwind CSS, Shadcn UI, Framer Motion
- **Mobile:** Capacitor (Android)
- **Backend Services:** Supabase (PostgreSQL), Prisma
- **AI/ML Modules:** Custom Python/Node.js skills (ASR, TTS, LLM, etc.)

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
│   └── store/           # State management
├── skills/              # AI Capabilities
│   ├── ASR/             # Speech Recognition
│   ├── finance/         # Financial Data API
│   ├── LLM/             # Large Language Models
│   ├── PDF/             # PDF Processing
│   └── ...              # Other skills (Vision, Office, Web)
├── mini-services/       # Microservices
└── public/              # Static assets
```

---

## 🧠 How It Works (Sustainability Core)

### Impact Quotient (IQ) Formula
```
IQ_new = IQ_current + ((100 - IQ_current) × (1 - exp(-k × BPI)))
```
*Your score increases based on positive actions, capped daily to encourage consistency.*

### Tier System
| IQ Range | Tier | Status |
|----------|------|--------|
| 0-39 | Foundation | Starting Journey |
| 40-59 | Aware | Conscious Impact |
| 60-74 | Aligned | Living Sustainably |
| 75-90 | Progressive | Leading Example |
| 90+ | Vanguard | Sustainability Champion |

---

## 📜 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---
Built with 💚 for a sustainable future.