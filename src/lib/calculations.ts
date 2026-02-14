import { TierLevel, RingValues, TIER_DEFINITIONS, Baseline, COMMUTE_TYPES, DIET_TYPES, CLOTHING_FREQUENCIES } from '@/types';

const TIER_K_VALUES: Record<TierLevel, number> = {
  FND: 0.12,
  Aware: 0.07,
  Aligned: 0.035,
  Progressive: 0.035,
  Vanguard: 0.035
};

export function getTierFromIQ(iq: number): TierLevel {
  for (const [tier, def] of Object.entries(TIER_DEFINITIONS)) {
    if (iq >= def.min && iq <= def.max) {
      return tier as TierLevel;
    }
  }
  return 'FND';
}

export function calculateInitialIQ(baseline: Baseline): number {
  const commuteImpact = COMMUTE_TYPES.find(c => c.value === baseline.commuteType)?.impact || 0;
  const dietImpact = DIET_TYPES.find(d => d.value === baseline.dietType)?.impact || 0;
  const clothingImpact = CLOTHING_FREQUENCIES.find(c => c.value === baseline.clothingFrequency)?.impact || 0;
  
  const totalImpact = commuteImpact + dietImpact + clothingImpact;
  const baseIQ = 40;
  const adjustedIQ = baseIQ + totalImpact;
  
  return Math.max(0, Math.min(100, adjustedIQ));
}

export function calculateInitialRings(baseline: Baseline): RingValues {
  const commuteImpact = COMMUTE_TYPES.find(c => c.value === baseline.commuteType)?.impact || 0;
  const dietImpact = DIET_TYPES.find(d => d.value === baseline.dietType)?.impact || 0;
  const clothingImpact = CLOTHING_FREQUENCIES.find(c => c.value === baseline.clothingFrequency)?.impact || 0;
  
  return {
    circularity: Math.max(0, Math.min(100, 30 + clothingImpact * 1.5)),
    consumption: Math.max(0, Math.min(100, 30 + dietImpact * 1.5)),
    mobility: Math.max(0, Math.min(100, 30 + commuteImpact * 1.5))
  };
}

export function calculateNewIQ(
  currentIQ: number,
  ringChanges: RingValues,
  currentRings: RingValues,
  verified: boolean = false
): { newIQ: number; iqChange: number } {
  const tier = getTierFromIQ(currentIQ);
  const k = TIER_K_VALUES[tier];
  
  // Calculate BPI - weighted average improvement
  const weights = { circularity: 0.35, consumption: 0.35, mobility: 0.30 };
  
  let totalImprovement = 0;
  let totalWeight = 0;
  
  for (const key of Object.keys(ringChanges) as Array<keyof RingValues>) {
    if (ringChanges[key] > 0) {
      totalImprovement += ringChanges[key] * weights[key];
      totalWeight += weights[key];
    }
  }
  
  const BPI = totalWeight > 0 ? totalImprovement / totalWeight : 0;
  
  // Apply IQ formula
  const baseIQChange = (100 - currentIQ) * (1 - Math.exp(-k * BPI));
  let iqChange = Math.min(baseIQChange, 6); // Cap at +6 per day
  
  // Apply verification boost
  if (verified) {
    iqChange *= 1.15;
  }
  
  iqChange = Math.round(iqChange * 10) / 10;
  const newIQ = Math.min(100, currentIQ + iqChange);
  
  return { newIQ, iqChange };
}

export function calculateTotalMultiplier(
  rarityFactor: number,
  sustainabilityWeight: number,
  consistencyFactor: number,
  verified: boolean
): number {
  const verificationBoost = verified ? 1.15 : 1;
  const total = rarityFactor * sustainabilityWeight * consistencyFactor * verificationBoost;
  return Math.min(total, 2.5);
}

export function applyImpactMode(
  ring: keyof RingValues,
  basePoints: number,
  multiplier: number,
  currentRings: RingValues,
  verified: boolean = false
): RingValues {
  const verificationBoost = verified ? 1.15 : 1;
  const actualPoints = basePoints * multiplier * verificationBoost;
  
  return {
    ...currentRings,
    [ring]: Math.min(100, currentRings[ring] + actualPoints)
  };
}

export function getPercentile(iq: number, city: string, leaderboard: Array<{ iq: number; city: string }>): number {
  const cityUsers = leaderboard.filter(u => u.city === city);
  if (cityUsers.length === 0) return 50;
  
  const belowCount = cityUsers.filter(u => u.iq < iq).length;
  return Math.round((belowCount / cityUsers.length) * 100);
}

export function formatIQ(iq: number): string {
  return Math.round(iq).toString();
}

export function getTierColor(tier: TierLevel): string {
  return TIER_DEFINITIONS[tier]?.color || '#8e8e93';
}

export function getTierLabel(tier: TierLevel): string {
  return TIER_DEFINITIONS[tier]?.label || 'Foundation';
}
