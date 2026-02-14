'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { BookOpen, Sun, Leaf, BatteryCharging, Droplets, Bike, Utensils, ChevronRight, CheckCircle2, Thermometer, CloudRain } from 'lucide-react';
import { CardLeaves, TinyLeaf, SmallLeaf, SectionHeader, LeafDivider } from '@/components/ui/LeafDecorations';

export function LearnView() {
  const { user } = useStore();
  if (!user) return null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-5">
      <EcoQuiz />
      <LeafDivider />
      <EcoTipsFeed />
      <SeasonalTips />
      <LeafDivider />
      <EcoReading />
      <MealPlanner />
      <WeatherImpact city={user.baseline.city} />
    </motion.div>
  );
}

/* ── Sub-components ── */

function EcoQuiz() {
  const [answered, setAnswered] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  return (
    <div className="card-surface p-5">
      <CardLeaves variant="b" />
      <div className="flex items-center gap-2 mb-1 relative z-10">
        <BookOpen className="w-5 h-5 text-[#2d8a4e]" />
        <h3 className="text-[17px] font-semibold text-[#1a2e1a]">Daily Eco Quiz</h3>
        <TinyLeaf className="rotate-[-10deg]" />
      </div>
      <p className="text-[12px] text-[#5e7a5e] mb-4 relative z-10">Test your sustainability knowledge</p>
      <p className="text-[15px] font-medium text-[#1a2e1a] mb-3 relative z-10">What percentage of ocean plastic comes from just 10 rivers?</p>
      <div className="space-y-2 relative z-10">
        {['About 30%', 'About 80%', 'About 50%', 'About 10%'].map((opt, i) => (
          <button key={i} onClick={() => { if (!answered) { setSelected(i); setAnswered(true); } }} disabled={answered}
            className={`w-full px-4 py-3 rounded-[12px] text-left text-[14px] font-medium transition-all border ${
              answered ? i === 1 ? 'bg-[#2d8a4e]/10 border-[#2d8a4e]/30 text-[#2d8a4e]' : i === selected && i !== 1 ? 'bg-[#d94f4f]/8 border-[#d94f4f]/20 text-[#d94f4f]' : 'bg-white border-[#2d8a4e]/8 text-[#5e7a5e]'
              : 'bg-white border-[#2d8a4e]/8 text-[#1a2e1a] hover:bg-[#2d8a4e]/5'}`}>
            {opt}
            {answered && i === 1 && <CheckCircle2 className="w-4 h-4 inline ml-2 text-[#2d8a4e]" />}
          </button>
        ))}
      </div>
      {answered && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[13px] text-[#5e7a5e] mt-3 leading-relaxed relative z-10">About 80% of ocean plastic flows from just 10 rivers, mostly in Asia and Africa.</motion.p>}
    </div>
  );
}

function EcoTipsFeed() {
  const tips = [
    { id: 1, category: 'Energy', tip: 'Switch to LED bulbs - they use 75% less energy.', icon: <BatteryCharging className="w-4 h-4" />, color: '#3a7d5c' },
    { id: 2, category: 'Water', tip: 'Fix dripping taps - a leak wastes 20,000L/year.', icon: <Droplets className="w-4 h-4" />, color: '#2d8a4e' },
    { id: 3, category: 'Transport', tip: 'Carpool once a week to cut emissions by 20%.', icon: <Bike className="w-4 h-4" />, color: '#5cb85c' },
    { id: 4, category: 'Food', tip: 'Composting can reduce household waste by 30%.', icon: <Leaf className="w-4 h-4" />, color: '#8fd18f' },
  ];

  return (
    <div>
      <SectionHeader>Eco Tips</SectionHeader>
      <div className="lg:grid lg:grid-cols-2 lg:gap-3 space-y-2 lg:space-y-0">
        {tips.map((t, i) => (
          <div key={t.id} className="card-surface-sm flex items-start gap-3 px-4 py-3.5 relative">
            <CardLeaves variant={(['a', 'b', 'c', 'd'] as const)[i % 4]} />
            <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 relative z-10" style={{ backgroundColor: `${t.color}15`, color: t.color }}>{t.icon}</div>
            <div className="flex-1 min-w-0 relative z-10">
              <p className="text-[11px] font-semibold uppercase tracking-[0.04em]" style={{ color: t.color }}>{t.category}</p>
              <p className="text-[14px] text-[#1a2e1a] mt-0.5 leading-relaxed">{t.tip}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SeasonalTips() {
  const month = new Date().getMonth();
  const season = month <= 1 || month === 11 ? 'Winter' : month <= 4 ? 'Spring' : month <= 7 ? 'Summer' : 'Autumn';
  const tipsMap: Record<string, string[]> = {
    Winter: ['Lower thermostat by 2F - save 5% on heating', 'Use draft stoppers on doors/windows', 'Embrace seasonal root vegetables'],
    Spring: ['Start a compost bin with spring scraps', 'Plant native flowers for pollinators', 'Air-dry clothes using spring breezes'],
    Summer: ['Use fans before AC - 80% less energy', 'Collect rainwater for garden use', 'Walk or bike for short errands'],
    Autumn: ['Rake leaves into mulch', 'Preserve summer harvest by canning', 'Seal windows before heating season'],
  };
  return (
    <div className="card-surface p-5">
      <CardLeaves variant="c" />
      <div className="flex items-center gap-2 mb-1 relative z-10">
        <Sun className="w-5 h-5 text-[#5cb85c]" />
        <h3 className="text-[17px] font-semibold text-[#1a2e1a]">{season} Green Tips</h3>
        <SmallLeaf className="text-[#2d8a4e] rotate-[15deg]" size={10} />
      </div>
      <p className="text-[12px] text-[#5e7a5e] mb-4 relative z-10">{season} sustainability suggestions</p>
      <div className="space-y-2 relative z-10">
        {tipsMap[season].map((tip, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-[#2d8a4e]/8 flex items-center justify-center shrink-0 mt-0.5">
              <Leaf className="w-3 h-3 text-[#2d8a4e]" />
            </div>
            <p className="text-[14px] text-[#1a2e1a] leading-relaxed">{tip}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function EcoReading() {
  const articles = [
    { title: 'How Regenerative Farming Heals the Soil', source: 'EcoWatch', mins: 5, emoji: '🌾' },
    { title: 'The Hidden Cost of Fast Fashion', source: 'GreenPeace', mins: 8, emoji: '👗' },
    { title: 'Urban Forests: Why Cities Need More Trees', source: 'Nature', mins: 6, emoji: '🏙️' },
    { title: 'Zero Waste Kitchen: A Beginner Guide', source: 'TreeHugger', mins: 4, emoji: '🍳' },
  ];
  return (
    <div>
      <SectionHeader icon={<BookOpen className="w-5 h-5 text-[#2d8a4e]/30" />}>Eco Reading</SectionHeader>
      <div className="lg:grid lg:grid-cols-2 lg:gap-3 space-y-2 lg:space-y-0">
        {articles.map((a, i) => (
          <div key={i} className="card-surface-sm flex items-center gap-3 px-4 py-3.5 relative">
            <CardLeaves variant={(['a', 'b', 'c', 'd'] as const)[i % 4]} />
            <span className="text-[24px] relative z-10">{a.emoji}</span>
            <div className="flex-1 min-w-0 relative z-10">
              <p className="text-[14px] font-medium text-[#1a2e1a] leading-snug">{a.title}</p>
              <p className="text-[11px] text-[#5e7a5e] mt-0.5">{a.source} - {a.mins} min read</p>
            </div>
            <ChevronRight className="w-4 h-4 text-[#c8dfc8] shrink-0 relative z-10" />
          </div>
        ))}
      </div>
    </div>
  );
}

function MealPlanner() {
  const meals = [
    { day: 'Mon', meal: 'Lentil Soup', type: 'Plant-based', co2: '0.3kg', emoji: '🥣' },
    { day: 'Tue', meal: 'Veggie Stir Fry', type: 'Plant-based', co2: '0.4kg', emoji: '🥘' },
    { day: 'Wed', meal: 'Mushroom Risotto', type: 'Vegetarian', co2: '0.6kg', emoji: '🍄' },
    { day: 'Thu', meal: 'Bean Tacos', type: 'Plant-based', co2: '0.3kg', emoji: '🌮' },
    { day: 'Fri', meal: 'Pasta Primavera', type: 'Vegetarian', co2: '0.5kg', emoji: '🍝' },
  ];
  return (
    <div>
      <SectionHeader icon={<Utensils className="w-5 h-5 text-[#2d8a4e]/30" />}>Eco Meal Planner</SectionHeader>
      <div className="card-surface p-5">
        <CardLeaves variant="a" />
        <p className="text-[12px] text-[#5e7a5e] mb-3 relative z-10">Low-carbon meal suggestions this week</p>
        <div className="space-y-2 relative z-10">
          {meals.map((m) => (
            <div key={m.day} className="flex items-center gap-3 py-2.5 border-b border-[#2d8a4e]/5 last:border-0">
              <span className="text-[11px] font-bold text-[#5e7a5e] w-8 uppercase">{m.day}</span>
              <span className="text-[20px]">{m.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-medium text-[#1a2e1a]">{m.meal}</p>
                <p className="text-[11px] text-[#2d8a4e]">{m.type}</p>
              </div>
              <span className="text-[12px] text-[#5e7a5e] tabular-nums">{m.co2} CO2</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function WeatherImpact({ city }: { city: string }) {
  const forecast = [
    { day: 'Today', temp: '18C', icon: <Sun className="w-5 h-5 text-[#5cb85c]" />, tip: 'Great day to bike instead of drive' },
    { day: 'Tomorrow', temp: '14C', icon: <CloudRain className="w-5 h-5 text-[#5e7a5e]" />, tip: 'Collect rainwater for plants' },
    { day: 'Saturday', temp: '20C', icon: <Sun className="w-5 h-5 text-[#5cb85c]" />, tip: 'Air-dry laundry outside' },
  ];
  return (
    <div>
      <SectionHeader icon={<Thermometer className="w-5 h-5 text-[#2d8a4e]/30" />}>Weather & Eco Tips</SectionHeader>
      <div className="lg:grid lg:grid-cols-3 lg:gap-3 space-y-2 lg:space-y-0">
        {forecast.map((f, i) => (
          <div key={f.day} className="card-surface p-4">
            <CardLeaves variant={(['a', 'b', 'c'] as const)[i % 3]} />
            <div className="flex items-center gap-3 mb-2 relative z-10">
              {f.icon}
              <div>
                <p className="text-[14px] font-semibold text-[#1a2e1a]">{f.day}</p>
                <p className="text-[20px] font-bold tabular-nums text-[#1a2e1a]">{f.temp}</p>
              </div>
            </div>
            <div className="flex items-start gap-2 mt-2 relative z-10">
              <Leaf className="w-3 h-3 text-[#2d8a4e] mt-0.5 shrink-0" />
              <p className="text-[13px] text-[#5e7a5e] leading-relaxed">{f.tip}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
