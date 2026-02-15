'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, Navigation, Car, Train, Bus, Bike, Footprints, Leaf,
  ChevronRight, ArrowRight, CheckCircle, BarChart3, Route,
  TrendingDown, Sparkles, Clock, Zap, History
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useExtensionStore } from '@/store/useExtensionStore';
import { POPULAR_ROUTES, getRouteHistory } from '@/lib/transitCarbon';
import { EMISSION_FACTORS, TransportMode } from '@/types/extensions';
import { CardLeaves, SmallLeaf } from '@/components/ui/LeafDecorations';

/* ─── Mode Icons ─── */
const MODE_ICONS: Record<TransportMode, React.ReactNode> = {
  car: <Car className="w-4 h-4" />,
  bike: <Bike className="w-4 h-4" />,
  metro: <Train className="w-4 h-4" />,
  bus: <Bus className="w-4 h-4" />,
  walk: <Footprints className="w-4 h-4" />,
  cycle: <Bike className="w-4 h-4" />,
};

const MODE_COLORS: Record<TransportMode, string> = {
  car: '#ff453a',
  bike: '#ff9f0a',
  metro: '#30d158',
  bus: '#007aff',
  walk: '#5ac8fa',
  cycle: '#34c759',
};

export function TransitView() {
  const { user } = useStore();
  const {
    currentRoute,
    lastRouteConfirmation,
    totalCarbonSaved,
    totalEcoRoutes,
    initialized,
    initializeExtensions,
    calculateRoute,
    confirmEcoRoute,
    clearRoute,
  } = useExtensionStore();

  const [tab, setTab] = useState<'calculate' | 'history' | 'stats'>('calculate');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [distance, setDistance] = useState('');
  const [confirmedMode, setConfirmedMode] = useState<TransportMode | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // Initialize
  useEffect(() => {
    if (user && !initialized) {
      initializeExtensions(user.id, user.IQ, user.createdAt);
    }
  }, [user, initialized, initializeExtensions]);

  const routeHistory = useMemo(() => getRouteHistory().slice(-10).reverse(), [lastRouteConfirmation]);

  const handleCalculate = () => {
    const dist = parseFloat(distance);
    if (!start.trim() || !end.trim() || isNaN(dist) || dist <= 0) return;
    calculateRoute(start.trim(), end.trim(), dist);
    setConfirmedMode(null);
    setShowSuccess(false);
  };

  const handleQuickRoute = (route: typeof POPULAR_ROUTES[0]) => {
    setStart(route.start);
    setEnd(route.end);
    setDistance(route.distanceKm.toString());
    calculateRoute(route.start, route.end, route.distanceKm);
    setConfirmedMode(null);
    setShowSuccess(false);
  };

  const handleConfirmRoute = (mode: TransportMode) => {
    if (!user || !currentRoute) return;
    const confirmation = confirmEcoRoute(user.id, mode, user.IQ, user.rings);
    if (confirmation) {
      setConfirmedMode(mode);
      setShowSuccess(true);

      // Trigger IQ update in main store via activateMode-like flow
      // The event dispatcher handles this
      if (mode !== 'car') {
        const { activateMode } = useStore.getState();
        activateMode('transit', false); // Use existing transit mode
      }

      setTimeout(() => setShowSuccess(false), 4000);
    }
  };

  const handleReset = () => {
    setStart('');
    setEnd('');
    setDistance('');
    clearRoute();
    setConfirmedMode(null);
    setShowSuccess(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col gap-5"
    >
      {/* ═══ Hero ═══ */}
      <div className="card-surface p-6 relative overflow-hidden">
        <CardLeaves variant="a" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-[16px] bg-gradient-to-br from-[#007aff] to-[#5ac8fa] flex items-center justify-center">
              <Route className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-[22px] font-bold text-[var(--ios-label)] tracking-[-0.02em]">Eco Routes</h2>
              <p className="text-[13px] text-[var(--ios-secondary-label)]">
                Compare routes, save carbon, boost your IQ
              </p>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="mt-4 flex gap-3">
            <div className="flex-1 p-3 rounded-[12px] bg-[var(--ios-bg)] text-center">
              <p className="text-[20px] font-bold text-[#30d158]">
                {totalCarbonSaved >= 1000
                  ? `${(totalCarbonSaved / 1000).toFixed(1)}kg`
                  : `${totalCarbonSaved}g`}
              </p>
              <p className="text-[10px] text-[var(--ios-tertiary-label)] mt-0.5">CO₂ Saved</p>
            </div>
            <div className="flex-1 p-3 rounded-[12px] bg-[var(--ios-bg)] text-center">
              <p className="text-[20px] font-bold text-[var(--ios-blue)]">{totalEcoRoutes}</p>
              <p className="text-[10px] text-[var(--ios-tertiary-label)] mt-0.5">Eco Routes</p>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ Tabs ═══ */}
      <div className="flex gap-2 p-1 rounded-[12px] bg-[var(--ios-card)]">
        {([
          { id: 'calculate' as const, label: 'Calculate', icon: Navigation },
          { id: 'history' as const, label: 'History', icon: History },
          { id: 'stats' as const, label: 'Stats', icon: BarChart3 },
        ]).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-[10px] text-[13px] font-medium transition-all ${
              tab === id
                ? 'bg-[var(--ios-blue)] text-white shadow-sm'
                : 'text-[var(--ios-secondary-label)] ios-press'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* ═══ Content ═══ */}
      <AnimatePresence mode="wait">
        {tab === 'calculate' && (
          <motion.div
            key="calculate"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col gap-4"
          >
            {/* Input Form */}
            <div className="card-surface p-4">
              <div className="flex flex-col gap-3">
                <div>
                  <label className="text-[12px] font-medium text-[var(--ios-secondary-label)] mb-1 block">Start Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#30d158]" />
                    <input
                      value={start}
                      onChange={(e) => setStart(e.target.value)}
                      placeholder="e.g. Koramangala"
                      className="w-full pl-9 pr-3 py-2.5 rounded-[10px] bg-[var(--ios-bg)] text-[14px] text-[var(--ios-label)] placeholder:text-[var(--ios-tertiary-label)] border border-[var(--ios-separator)] focus:border-[var(--ios-blue)] focus:outline-none transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[12px] font-medium text-[var(--ios-secondary-label)] mb-1 block">Destination</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#ff453a]" />
                    <input
                      value={end}
                      onChange={(e) => setEnd(e.target.value)}
                      placeholder="e.g. Electronic City"
                      className="w-full pl-9 pr-3 py-2.5 rounded-[10px] bg-[var(--ios-bg)] text-[14px] text-[var(--ios-label)] placeholder:text-[var(--ios-tertiary-label)] border border-[var(--ios-separator)] focus:border-[var(--ios-blue)] focus:outline-none transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[12px] font-medium text-[var(--ios-secondary-label)] mb-1 block">Distance (km)</label>
                  <input
                    value={distance}
                    onChange={(e) => setDistance(e.target.value)}
                    type="number"
                    placeholder="Enter distance in km"
                    min="0.1"
                    step="0.1"
                    className="w-full px-3 py-2.5 rounded-[10px] bg-[var(--ios-bg)] text-[14px] text-[var(--ios-label)] placeholder:text-[var(--ios-tertiary-label)] border border-[var(--ios-separator)] focus:border-[var(--ios-blue)] focus:outline-none transition-colors"
                  />
                </div>
                <button
                  onClick={handleCalculate}
                  disabled={!start.trim() || !end.trim() || !distance.trim()}
                  className="w-full py-3 rounded-[12px] bg-[var(--ios-blue)] text-white text-[15px] font-semibold ios-press active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none transition-all"
                >
                  Calculate Routes
                </button>
              </div>
            </div>

            {/* Quick Routes */}
            {!currentRoute && (
              <div>
                <p className="text-[13px] font-medium text-[var(--ios-secondary-label)] mb-2 px-1">Popular Routes (Bengaluru)</p>
                <div className="grid grid-cols-2 gap-2">
                  {POPULAR_ROUTES.map((route, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleQuickRoute(route)}
                      className="card-surface p-3 text-left ios-press"
                    >
                      <p className="text-[12px] font-medium text-[var(--ios-label)] truncate">{route.start}</p>
                      <p className="text-[10px] text-[var(--ios-tertiary-label)]">→ {route.end}</p>
                      <p className="text-[10px] text-[var(--ios-blue)] mt-1">{route.distanceKm} km</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Route Comparison */}
            {currentRoute && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col gap-3"
              >
                <div className="flex items-center justify-between px-1">
                  <p className="text-[14px] font-semibold text-[var(--ios-label)]">
                    {currentRoute.request.startLocation} → {currentRoute.request.endLocation}
                  </p>
                  <button onClick={handleReset} className="text-[12px] text-[var(--ios-blue)] ios-press">
                    New Route
                  </button>
                </div>

                {/* Carbon Comparison Visual */}
                <div className="card-surface p-4">
                  <p className="text-[12px] font-medium text-[var(--ios-secondary-label)] mb-3">Carbon Emissions Comparison</p>
                  {currentRoute.options.map((option) => {
                    const isSelected = confirmedMode === option.mode;
                    const isCar = option.mode === 'car';
                    const savingsPercent = isCar ? 0 :
                      Math.round(((currentRoute.carEmission - option.emissionGrams) / currentRoute.carEmission) * 100);
                    const barWidth = currentRoute.carEmission > 0
                      ? Math.max(5, (option.emissionGrams / currentRoute.carEmission) * 100)
                      : 5;

                    return (
                      <div key={option.mode} className="mb-3 last:mb-0">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-6 h-6 rounded-[6px] flex items-center justify-center"
                              style={{ backgroundColor: `${MODE_COLORS[option.mode]}15`, color: MODE_COLORS[option.mode] }}
                            >
                              {MODE_ICONS[option.mode]}
                            </div>
                            <span className="text-[13px] font-medium text-[var(--ios-label)]">{option.label}</span>
                            {isSelected && <CheckCircle className="w-3.5 h-3.5 text-[#30d158]" />}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] text-[var(--ios-tertiary-label)]">
                              {option.durationMinutes} min
                            </span>
                            <span className="text-[12px] font-mono font-semibold" style={{ color: MODE_COLORS[option.mode] }}>
                              {option.emissionGrams >= 1000
                                ? `${(option.emissionGrams / 1000).toFixed(1)}kg`
                                : `${option.emissionGrams}g`}
                            </span>
                          </div>
                        </div>
                        <div className="w-full h-2 bg-[var(--ios-separator)] rounded-full overflow-hidden">
                          <motion.div
                            className="h-full rounded-full"
                            style={{ backgroundColor: MODE_COLORS[option.mode] }}
                            initial={{ width: 0 }}
                            animate={{ width: `${barWidth}%` }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                          />
                        </div>
                        {!isCar && savingsPercent > 0 && (
                          <div className="flex items-center gap-1 mt-1">
                            <TrendingDown className="w-3 h-3 text-[#30d158]" />
                            <span className="text-[10px] text-[#30d158] font-medium">
                              {savingsPercent}% less CO₂ than car
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Choose Eco Route Buttons */}
                {!confirmedMode && (
                  <div className="card-surface p-4">
                    <p className="text-[13px] font-semibold text-[var(--ios-label)] mb-3">Choose Your Route</p>
                    <div className="flex flex-col gap-2">
                      {currentRoute.options
                        .filter(o => o.mode !== 'car')
                        .map((option) => {
                          const saved = currentRoute.carEmission - option.emissionGrams;
                          const iqBonus = Math.round(saved * 0.005 * 100) / 100;

                          return (
                            <button
                              key={option.mode}
                              onClick={() => handleConfirmRoute(option.mode)}
                              className="flex items-center justify-between p-3 rounded-[12px] bg-[var(--ios-bg)] border border-[var(--ios-separator)] ios-press active:scale-[0.98] transition-all"
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-[18px]">{option.icon}</span>
                                <div className="text-left">
                                  <p className="text-[13px] font-medium text-[var(--ios-label)]">{option.label}</p>
                                  <p className="text-[11px] text-[var(--ios-tertiary-label)]">
                                    Save {saved}g CO₂ · +{iqBonus} IQ
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#30d158]/10">
                                <Leaf className="w-3 h-3 text-[#30d158]" />
                                <span className="text-[11px] font-semibold text-[#30d158]">Eco</span>
                              </div>
                            </button>
                          );
                        })}
                    </div>
                  </div>
                )}

                {/* Success State */}
                {showSuccess && lastRouteConfirmation && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="card-surface p-5 text-center border-2 border-[#30d158]/30"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', damping: 10, delay: 0.2 }}
                    >
                      <CheckCircle className="w-12 h-12 text-[#30d158] mx-auto mb-3" />
                    </motion.div>
                    <p className="text-[18px] font-bold text-[var(--ios-label)]">Eco Route Chosen!</p>
                    <p className="text-[14px] text-[#30d158] font-semibold mt-1">
                      {lastRouteConfirmation.carbonSavedGrams >= 1000
                        ? `${(lastRouteConfirmation.carbonSavedGrams / 1000).toFixed(1)}kg`
                        : `${lastRouteConfirmation.carbonSavedGrams}g`} CO₂ saved
                    </p>
                    <p className="text-[13px] text-[var(--ios-secondary-label)] mt-1">
                      +{lastRouteConfirmation.impactBonus.toFixed(2)} IQ bonus applied
                    </p>
                    <div className="mt-3 flex items-center justify-center gap-2 px-3 py-2 rounded-[8px] bg-[#30d158]/10">
                      <Sparkles className="w-4 h-4 text-[#30d158]" />
                      <span className="text-[12px] text-[#30d158] font-medium">
                        Impact Quotient updating...
                      </span>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </motion.div>
        )}

        {tab === 'history' && (
          <motion.div
            key="history"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col gap-3"
          >
            {routeHistory.length === 0 ? (
              <div className="card-surface p-8 text-center">
                <Route className="w-10 h-10 text-[var(--ios-tertiary-label)] mx-auto mb-3" />
                <p className="text-[15px] font-medium text-[var(--ios-label)]">No routes yet</p>
                <p className="text-[13px] text-[var(--ios-secondary-label)] mt-1">
                  Calculate and confirm an eco route to see it here
                </p>
              </div>
            ) : (
              routeHistory.map((item, idx) => (
                <div key={idx} className="card-surface p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[16px]">
                        {MODE_ICONS[item.confirmation.selectedMode] || '🚗'}
                      </span>
                      <div>
                        <p className="text-[13px] font-medium text-[var(--ios-label)]">
                          {item.comparison.request.startLocation} → {item.comparison.request.endLocation}
                        </p>
                        <p className="text-[11px] text-[var(--ios-tertiary-label)]">
                          {item.comparison.request.distanceKm}km · {new Date(item.confirmation.confirmedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[13px] font-semibold text-[#30d158]">
                        -{item.confirmation.carbonSavedGrams}g CO₂
                      </p>
                      <p className="text-[10px] text-[var(--ios-blue)]">
                        +{item.confirmation.impactBonus.toFixed(2)} IQ
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </motion.div>
        )}

        {tab === 'stats' && (
          <motion.div
            key="stats"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col gap-4"
          >
            {/* Emission Constants Reference */}
            <div className="card-surface p-4">
              <p className="text-[13px] font-semibold text-[var(--ios-label)] mb-3">Emission Factors (g CO₂/km)</p>
              <div className="flex flex-col gap-2">
                {(Object.entries(EMISSION_FACTORS) as [TransportMode, number][]).map(([mode, emission]) => (
                  <div key={mode} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded-[6px] flex items-center justify-center"
                        style={{ backgroundColor: `${MODE_COLORS[mode]}15`, color: MODE_COLORS[mode] }}
                      >
                        {MODE_ICONS[mode]}
                      </div>
                      <span className="text-[13px] text-[var(--ios-label)] capitalize">{mode}</span>
                    </div>
                    <span
                      className="text-[13px] font-mono font-semibold"
                      style={{ color: MODE_COLORS[mode] }}
                    >
                      {emission}g
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Formulae */}
            <div className="card-surface p-4">
              <p className="text-[13px] font-semibold text-[var(--ios-label)] mb-2">How It Works</p>
              <div className="flex flex-col gap-2 text-[12px] text-[var(--ios-secondary-label)]">
                <p><strong>CarbonSaved</strong> = CarEmission − SelectedModeEmission</p>
                <p><strong>ImpactBonus</strong> = CarbonSaved × 0.005</p>
                <p><strong>Example:</strong> 10km metro vs car = (1200 − 350) × 0.005 = +4.25 IQ</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
