/**
 * LumeIQ Transit Route & Carbon Estimation
 * ─────────────────────────────────────────────
 * Deterministic emission calculation using fixed constants.
 * Android-optimized: no external API needed, works fully offline.
 *
 * Emission Constants:
 *   Car:       120g CO₂/km
 *   Bike:       80g CO₂/km  (e-bike/motorbike)
 *   Metro:      35g CO₂/km  (per passenger)
 *   Bus:        50g CO₂/km  (per passenger)
 *   Walk/Cycle:  0g CO₂/km
 *
 * CarbonSaved = (CarEmission − SelectedModeEmission)
 * ImpactBonus = CarbonSaved × ConversionFactor (0.005 IQ/gram)
 */

import {
  TransportMode,
  RouteRequest,
  RouteOption,
  RouteComparison,
  RouteConfirmation,
  EmissionLog,
  EMISSION_FACTORS,
  CARBON_CONVERSION_FACTOR,
} from '@/types/extensions';

// ─── Storage Keys ───
const ROUTE_HISTORY_KEY = 'lumeiq_route_history';
const EMISSION_LOGS_KEY = 'lumeiq_emission_logs';

function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// ─── Speed estimates (km/h) for duration calculation ───
const SPEED_ESTIMATES: Record<TransportMode, number> = {
  car: 30,    // urban average
  bike: 25,   // motorbike
  metro: 35,  // including wait time
  bus: 20,    // including stops
  walk: 5,
  cycle: 15,
};

// ─── Mode Labels & Icons ───
const MODE_INFO: Record<TransportMode, { label: string; icon: string }> = {
  car: { label: 'Car (Baseline)', icon: '🚗' },
  bike: { label: 'E-Bike / Motorbike', icon: '🏍️' },
  metro: { label: 'Metro / Train', icon: '🚇' },
  bus: { label: 'Public Bus', icon: '🚌' },
  walk: { label: 'Walking', icon: '🚶' },
  cycle: { label: 'Bicycle', icon: '🚲' },
};

// ─── Calculate Route Options ───
export function calculateRouteOptions(request: RouteRequest): RouteComparison {
  const { distanceKm } = request;

  const modes: TransportMode[] = ['car', 'bike', 'metro', 'bus', 'cycle', 'walk'];
  const carEmission = distanceKm * EMISSION_FACTORS.car;

  const options: RouteOption[] = modes
    .filter(mode => {
      // Filter impractical options
      if (mode === 'walk' && distanceKm > 5) return false;
      if (mode === 'cycle' && distanceKm > 15) return false;
      return true;
    })
    .map(mode => ({
      mode,
      distanceKm,
      emissionGrams: Math.round(distanceKm * EMISSION_FACTORS[mode]),
      durationMinutes: Math.round((distanceKm / SPEED_ESTIMATES[mode]) * 60),
      label: MODE_INFO[mode].label,
      icon: MODE_INFO[mode].icon,
    }))
    .sort((a, b) => a.emissionGrams - b.emissionGrams);

  return {
    id: generateId(),
    request,
    options,
    carEmission: Math.round(carEmission),
    calculatedAt: new Date().toISOString(),
  };
}

// ─── Calculate Carbon Saved for a Selected Mode ───
export function calculateCarbonSaved(
  distanceKm: number,
  selectedMode: TransportMode
): { carbonSavedGrams: number; impactBonus: number } {
  const carEmission = distanceKm * EMISSION_FACTORS.car;
  const selectedEmission = distanceKm * EMISSION_FACTORS[selectedMode];
  const carbonSavedGrams = Math.max(0, Math.round(carEmission - selectedEmission));
  const impactBonus = Math.round(carbonSavedGrams * CARBON_CONVERSION_FACTOR * 100) / 100;

  return { carbonSavedGrams, impactBonus };
}

// ─── Confirm Route Selection ───
export function confirmRoute(
  routeComparison: RouteComparison,
  userId: string,
  selectedMode: TransportMode
): RouteConfirmation {
  const { carbonSavedGrams, impactBonus } = calculateCarbonSaved(
    routeComparison.request.distanceKm,
    selectedMode
  );

  const confirmation: RouteConfirmation = {
    id: generateId(),
    routeComparisonId: routeComparison.id,
    userId,
    selectedMode,
    carbonSavedGrams,
    impactBonus,
    confirmedAt: new Date().toISOString(),
  };

  // Persist to history
  saveRouteHistory(routeComparison, confirmation);
  saveEmissionLog(userId, routeComparison.request.distanceKm, selectedMode, carbonSavedGrams);

  return confirmation;
}

// ─── Route History ───
function saveRouteHistory(comparison: RouteComparison, confirmation: RouteConfirmation): void {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(ROUTE_HISTORY_KEY);
    const history = raw ? JSON.parse(raw) : [];
    history.push({ comparison, confirmation });
    localStorage.setItem(ROUTE_HISTORY_KEY, JSON.stringify(history.slice(-50)));
  } catch (error) {
    console.error('[Transit] Failed to save route history:', error);
  }
}

export function getRouteHistory(): Array<{ comparison: RouteComparison; confirmation: RouteConfirmation }> {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(ROUTE_HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// ─── Emission Logs ───
function saveEmissionLog(
  userId: string,
  distanceKm: number,
  mode: TransportMode,
  carbonSavedGrams: number
): void {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(EMISSION_LOGS_KEY);
    const logs: EmissionLog[] = raw ? JSON.parse(raw) : [];
    logs.push({
      id: generateId(),
      userId,
      date: new Date().toISOString().split('T')[0],
      mode,
      distanceKm,
      emissionGrams: Math.round(distanceKm * EMISSION_FACTORS[mode]),
      carbonSavedGrams,
    });
    localStorage.setItem(EMISSION_LOGS_KEY, JSON.stringify(logs.slice(-200)));
  } catch (error) {
    console.error('[Transit] Failed to save emission log:', error);
  }
}

export function getEmissionLogs(userId?: string): EmissionLog[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(EMISSION_LOGS_KEY);
    let logs: EmissionLog[] = raw ? JSON.parse(raw) : [];
    if (userId) logs = logs.filter(l => l.userId === userId);
    return logs;
  } catch {
    return [];
  }
}

// ─── Aggregate Stats ───
export function getTotalCarbonSaved(userId: string): number {
  const logs = getEmissionLogs(userId);
  return logs.reduce((total, log) => total + log.carbonSavedGrams, 0);
}

export function getTotalEcoRoutes(userId: string): number {
  const logs = getEmissionLogs(userId);
  return logs.filter(l => l.mode !== 'car').length;
}

// ─── IQ Ring Impact from Route (mobility ring) ───
export function calculateRouteRingImpact(impactBonus: number): {
  circularity: number;
  consumption: number;
  mobility: number;
} {
  return {
    circularity: 0,
    consumption: 0,
    mobility: Math.min(impactBonus * 3, 15), // Scale up for ring visibility, cap at 15
  };
}

// ─── Popular routes (mock data for Bengaluru) ───
export const POPULAR_ROUTES = [
  { start: 'Koramangala', end: 'Electronic City', distanceKm: 16 },
  { start: 'Indiranagar', end: 'Whitefield', distanceKm: 14 },
  { start: 'MG Road', end: 'HSR Layout', distanceKm: 10 },
  { start: 'Jayanagar', end: 'Marathahalli', distanceKm: 18 },
  { start: 'BTM Layout', end: 'Yelahanka', distanceKm: 25 },
  { start: 'Malleshwaram', end: 'Silk Board', distanceKm: 12 },
];
