/**
 * LumeIQ Fraud Detection & Device Trust
 * ─────────────────────────────────────────────
 * Extends existing auth system WITHOUT modifying it.
 * Adds device fingerprinting, anomaly detection, and trust scoring.
 *
 * Trust Score: 0.0–1.0
 * Fraud flags reduce IQ multiplier
 */

import {
  DeviceRegistry,
  FraudFlag,
  TrustScoreRecord,
  ScannedProduct,
  SCAN_COOLDOWN_HOURS,
  MAX_SCANS_PER_DAY,
  DUPLICATE_WINDOW_HOURS,
} from '@/types/extensions';

// ─── Storage Keys ───
const DEVICE_REGISTRY_KEY = 'lumeiq_device_registry';
const FRAUD_FLAGS_KEY = 'lumeiq_fraud_flags';
const TRUST_SCORES_KEY = 'lumeiq_trust_scores';
const SCAN_LOG_KEY = 'lumeiq_scan_abuse_log';

function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// ─── Device Fingerprint Generation ───
export function generateDeviceFingerprint(): string {
  if (typeof window === 'undefined') return 'unknown';

  const components = [
    navigator.userAgent,
    navigator.language,
    screen.width + 'x' + screen.height,
    screen.colorDepth,
    new Date().getTimezoneOffset(),
    navigator.hardwareConcurrency || 0,
    navigator.maxTouchPoints || 0,
  ];

  // Simple hash of components
  let hash = 0;
  const str = components.join('|');
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }

  return `device_${Math.abs(hash).toString(36)}`;
}

// ─── Device Registry ───
export function registerDevice(userId: string): DeviceRegistry {
  const fingerprint = generateDeviceFingerprint();
  const registry = getDeviceRegistry();

  // Check if device already registered
  const existing = registry.find(d => d.deviceFingerprint === fingerprint && d.userId === userId);
  if (existing) {
    existing.lastSeenAt = new Date().toISOString();
    localStorage.setItem(DEVICE_REGISTRY_KEY, JSON.stringify(registry));
    return existing;
  }

  // Check for multi-account per device (anomaly)
  const deviceAccounts = registry.filter(d => d.deviceFingerprint === fingerprint);
  if (deviceAccounts.length > 0 && !deviceAccounts.some(d => d.userId === userId)) {
    // Another user already registered on this device
    createFraudFlag(userId, fingerprint, 'multi_account',
      'medium', `Device already has ${deviceAccounts.length} account(s) registered`);
  }

  const device: DeviceRegistry = {
    id: generateId(),
    userId,
    deviceFingerprint: fingerprint,
    platform: navigator.userAgent.includes('Android') ? 'android'
      : navigator.userAgent.includes('iPhone') ? 'ios' : 'web',
    registeredAt: new Date().toISOString(),
    lastSeenAt: new Date().toISOString(),
    trusted: deviceAccounts.length === 0, // trusted only if no other accounts
  };

  registry.push(device);
  localStorage.setItem(DEVICE_REGISTRY_KEY, JSON.stringify(registry));

  return device;
}

export function getDeviceRegistry(): DeviceRegistry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(DEVICE_REGISTRY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function isDeviceTrusted(userId: string): boolean {
  const fingerprint = generateDeviceFingerprint();
  const registry = getDeviceRegistry();
  const device = registry.find(d => d.deviceFingerprint === fingerprint && d.userId === userId);
  return device?.trusted ?? false;
}

// ─── Fraud Flags ───
export function createFraudFlag(
  userId: string,
  deviceFingerprint: string,
  type: FraudFlag['type'],
  severity: FraudFlag['severity'],
  description: string
): FraudFlag {
  const flag: FraudFlag = {
    id: generateId(),
    userId,
    deviceFingerprint,
    type,
    severity,
    description,
    flaggedAt: new Date().toISOString(),
    resolved: false,
  };

  const flags = getFraudFlags();
  flags.push(flag);
  localStorage.setItem(FRAUD_FLAGS_KEY, JSON.stringify(flags.slice(-100)));

  return flag;
}

export function getFraudFlags(userId?: string): FraudFlag[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(FRAUD_FLAGS_KEY);
    let flags: FraudFlag[] = raw ? JSON.parse(raw) : [];
    if (userId) flags = flags.filter(f => f.userId === userId);
    return flags;
  } catch {
    return [];
  }
}

export function getUnresolvedFraudFlags(userId: string): FraudFlag[] {
  return getFraudFlags(userId).filter(f => !f.resolved);
}

// ─── Trust Score Calculation ───
/**
 * TrustScore = BaseScore × DeviceFactor × ConsistencyFactor × FraudPenalty
 *
 * BaseScore: 0.7 (default)
 * DeviceFactor: 1.0 if trusted, 0.7 if untrusted
 * ConsistencyFactor: based on account age (max 1.0 at 30+ days)
 * FraudPenalty: 0.8^(unresolvedFlagCount)
 *
 * Receipt boost adds 0.15 on top
 */
export function calculateTrustScore(
  userId: string,
  accountCreatedAt: Date,
  receiptProvided: boolean = false
): TrustScoreRecord {
  const deviceTrusted = isDeviceTrusted(userId);
  const unresolvedFlags = getUnresolvedFraudFlags(userId);
  const accountAgeDays = Math.floor((Date.now() - accountCreatedAt.getTime()) / (86400000));

  // Factors
  const baseScore = 0.7;
  const deviceFactor = deviceTrusted ? 1.0 : 0.7;
  const consistencyScore = Math.min(1.0, accountAgeDays / 30);
  const fraudPenalty = Math.pow(0.8, unresolvedFlags.length);

  let score = baseScore * deviceFactor * consistencyScore * fraudPenalty;

  // Receipt boost
  if (receiptProvided) score = Math.min(1.0, score + 0.15);

  score = Math.round(score * 100) / 100;

  const record: TrustScoreRecord = {
    id: generateId(),
    userId,
    score: Math.max(0, Math.min(1.0, score)),
    factors: {
      receiptProvided,
      accountAge: accountAgeDays,
      consistencyScore,
      fraudFlagCount: unresolvedFlags.length,
      deviceTrusted,
    },
    calculatedAt: new Date().toISOString(),
  };

  // Persist
  saveTrustScore(record);

  return record;
}

function saveTrustScore(record: TrustScoreRecord): void {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(TRUST_SCORES_KEY);
    const scores: TrustScoreRecord[] = raw ? JSON.parse(raw) : [];
    scores.push(record);
    localStorage.setItem(TRUST_SCORES_KEY, JSON.stringify(scores.slice(-50)));
  } catch {}
}

export function getLatestTrustScore(userId: string): number {
  if (typeof window === 'undefined') return 0.7;
  try {
    const raw = localStorage.getItem(TRUST_SCORES_KEY);
    const scores: TrustScoreRecord[] = raw ? JSON.parse(raw) : [];
    const userScores = scores.filter(s => s.userId === userId);
    return userScores.length > 0 ? userScores[userScores.length - 1].score : 0.7;
  } catch {
    return 0.7;
  }
}

// ─── Trust Score Decay Logic ───
/**
 * Trust score decays by 0.05 per unresolved fraud flag per week.
 * Max decay: 0.3 (score never goes below 0.1 from decay alone)
 */
export function applyTrustDecay(currentScore: number, unresolvedFlagCount: number, weeksSinceLastFlag: number): number {
  const decayAmount = Math.min(0.3, 0.05 * unresolvedFlagCount * weeksSinceLastFlag);
  return Math.max(0.1, currentScore - decayAmount);
}

// ─── Impact Multiplier Reduction ───
/**
 * If fraud risk is detected, IQ multiplier is reduced:
 * - Low severity: 0.9x
 * - Medium severity: 0.7x
 * - High severity: 0.5x
 * - Multiple flags: cumulative (multiplicative)
 */
export function getFraudImpactMultiplier(userId: string): number {
  const flags = getUnresolvedFraudFlags(userId);
  if (flags.length === 0) return 1.0;

  const severityMultipliers = { low: 0.9, medium: 0.7, high: 0.5 };
  let multiplier = 1.0;

  for (const flag of flags) {
    multiplier *= severityMultipliers[flag.severity];
  }

  return Math.max(0.3, Math.round(multiplier * 100) / 100); // Floor at 0.3
}

// ─── Scan Abuse Prevention ───
interface ScanEntry {
  barcode: string;
  timestamp: string;
  userId: string;
}

function getScanLog(): ScanEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(SCAN_LOG_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function addScanEntry(barcode: string, userId: string): void {
  const log = getScanLog();
  log.push({ barcode, timestamp: new Date().toISOString(), userId });
  localStorage.setItem(SCAN_LOG_KEY, JSON.stringify(log.slice(-200)));
}

/**
 * Check if a scan is allowed (abuse prevention)
 * Returns { allowed: boolean, reason?: string }
 */
export function checkScanAllowed(
  barcode: string,
  userId: string
): { allowed: boolean; reason?: string } {
  const log = getScanLog();
  const now = Date.now();

  // 1) Daily scan limit
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayScans = log.filter(e =>
    e.userId === userId && new Date(e.timestamp).getTime() >= todayStart.getTime()
  );
  if (todayScans.length >= MAX_SCANS_PER_DAY) {
    return { allowed: false, reason: `Daily scan limit reached (${MAX_SCANS_PER_DAY}/day). Try again tomorrow.` };
  }

  // 2) Same product cooldown
  const productScans = log.filter(e =>
    e.barcode === barcode && e.userId === userId
  );
  if (productScans.length > 0) {
    const lastScan = new Date(productScans[productScans.length - 1].timestamp).getTime();
    const cooldownMs = SCAN_COOLDOWN_HOURS * 3600000;
    if (now - lastScan < cooldownMs) {
      const remaining = Math.ceil((cooldownMs - (now - lastScan)) / 60000);
      return { allowed: false, reason: `Same product cooldown: ${remaining} minutes remaining.` };
    }
  }

  // 3) Same-day repeat restriction
  const sameDayScans = productScans.filter(e =>
    new Date(e.timestamp).getTime() >= todayStart.getTime()
  );
  if (sameDayScans.length > 0) {
    return { allowed: false, reason: 'This product was already scanned today. Try again tomorrow.' };
  }

  return { allowed: true };
}

/**
 * Record a scan for abuse tracking
 */
export function recordScan(barcode: string, userId: string): void {
  addScanEntry(barcode, userId);

  // Check for rapid scanning pattern
  const log = getScanLog();
  const recentScans = log.filter(e =>
    e.userId === userId &&
    Date.now() - new Date(e.timestamp).getTime() < 300000 // last 5 minutes
  );

  if (recentScans.length >= 5) {
    createFraudFlag(
      userId,
      generateDeviceFingerprint(),
      'rapid_scan',
      'low',
      `Rapid scanning detected: ${recentScans.length} scans in 5 minutes`
    );
  }
}
