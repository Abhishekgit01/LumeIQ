/**
 * LumeIQ Extension Types
 * ─────────────────────────────────────────────
 * New types for: Mock Companies, Coupons, Purchase Confirmation,
 * Transit Routes, Carbon Estimation, Advanced Auth, Photo Upload
 *
 * DOES NOT modify existing types in index.ts
 */

// ─── Mock Companies ───
export interface SustainableCompany {
  id: string;
  name: string;
  logoPlaceholder: string; // emoji or icon identifier
  category: 'food' | 'fashion' | 'transport' | 'energy' | 'lifestyle';
  description: string;
  sustainabilityWeight: number; // 0.5–2.0 multiplier
  barcodePrefix?: string; // for matching scanned products
}

export interface Promotion {
  id: string;
  companyId: string;
  title: string;
  description: string;
  type: 'percentage' | 'flat' | 'freebie' | 'cashback';
  value: number; // percentage or flat amount
  minIQRequired: number; // IQ threshold to unlock
  validFrom: string; // ISO date
  validUntil: string; // ISO date
  maxRedemptions: number;
  isActive: boolean;
}

export interface Coupon {
  id: string;
  promotionId: string;
  companyId: string;
  code: string;
  title: string;
  description: string;
  discountValue: number;
  discountType: 'percentage' | 'flat' | 'freebie' | 'cashback';
  minIQRequired: number;
  expiresAt: string;
  icon: string;
}

export interface CouponRedemption {
  id: string;
  couponId: string;
  userId: string;
  redeemedAt: string;
  iqAtRedemption: number;
}

// ─── Scan → Purchase Confirmation ───
export interface ScannedProduct {
  id: string;
  barcode: string;
  name: string;
  brand: string;
  category: string;
  ecoScore: number;
  sustainableCompanyId: string | null;
  scannedAt: string;
  isSustainable: boolean;
}

export interface PurchaseConfirmation {
  id: string;
  scannedProductId: string;
  userId: string;
  confirmed: boolean;
  receiptPhotoId: string | null;
  trustScore: number;
  impactIncrement: number;
  confirmedAt: string;
  cooldownExpiry: string; // ISO datetime for rate limiting
}

export interface ReceiptImage {
  id: string;
  purchaseConfirmationId: string;
  dataUrl: string; // base64 compressed image
  verified: boolean;
  manualOverride: boolean;
  uploadedAt: string;
  sizeBytes: number;
}

export interface TrustScoreRecord {
  id: string;
  userId: string;
  score: number; // 0.0–1.0
  factors: {
    receiptProvided: boolean;
    accountAge: number; // days
    consistencyScore: number; // 0–1
    fraudFlagCount: number;
    deviceTrusted: boolean;
  };
  calculatedAt: string;
}

// ─── Transit Route + Carbon ───
export type TransportMode = 'car' | 'bike' | 'metro' | 'walk' | 'cycle' | 'bus';

export interface RouteRequest {
  startLocation: string;
  endLocation: string;
  distanceKm: number;
}

export interface RouteOption {
  mode: TransportMode;
  distanceKm: number;
  emissionGrams: number;
  durationMinutes: number;
  label: string;
  icon: string;
}

export interface RouteComparison {
  id: string;
  request: RouteRequest;
  options: RouteOption[];
  carEmission: number; // baseline car emission grams
  calculatedAt: string;
}

export interface RouteConfirmation {
  id: string;
  routeComparisonId: string;
  userId: string;
  selectedMode: TransportMode;
  carbonSavedGrams: number;
  impactBonus: number;
  confirmedAt: string;
}

export interface EmissionLog {
  id: string;
  userId: string;
  date: string;
  mode: TransportMode;
  distanceKm: number;
  emissionGrams: number;
  carbonSavedGrams: number;
}

// ─── Advanced Auth Extension ───
export interface DeviceRegistry {
  id: string;
  userId: string;
  deviceFingerprint: string;
  platform: string;
  registeredAt: string;
  lastSeenAt: string;
  trusted: boolean;
}

export interface FraudFlag {
  id: string;
  userId: string;
  deviceFingerprint: string;
  type: 'multi_account' | 'rapid_scan' | 'duplicate_receipt' | 'suspicious_pattern';
  severity: 'low' | 'medium' | 'high';
  description: string;
  flaggedAt: string;
  resolved: boolean;
}

export type UserRole = 'user' | 'corporate_admin';

export interface RolePermission {
  userId: string;
  role: UserRole;
  companyId?: string; // for corporate admins
  grantedAt: string;
}

// ─── Photo Upload ───
export interface ReceiptPhoto {
  id: string;
  userId: string;
  dataUrl: string; // compressed base64
  sizeBytes: number;
  verified: boolean;
  manualOverride: boolean;
  linkedPurchaseId: string | null;
  capturedAt: string;
  syncedToBackend: boolean;
}

// ─── Event System ───
export type ImpactEventType =
  | 'scan_purchase'
  | 'route_confirm'
  | 'mode_activate'
  | 'receipt_upload'
  | 'coupon_redeem';

export interface ImpactEvent {
  id: string;
  type: ImpactEventType;
  userId: string;
  timestamp: string;
  payload: {
    iqDelta: number;
    ringChanges: { circularity: number; consumption: number; mobility: number };
    source: string;
    metadata?: Record<string, unknown>;
  };
  processed: boolean;
}

// ─── Sync Queue ───
export interface SyncQueueItem {
  id: string;
  action: 'create' | 'update' | 'delete';
  table: string;
  data: Record<string, unknown>;
  createdAt: string;
  synced: boolean;
  retryCount: number;
}

// ─── Emission Constants ───
export const EMISSION_FACTORS: Record<TransportMode, number> = {
  car: 120,   // grams CO2 per km
  bike: 80,   // e-bike / motorbike
  metro: 35,  // per passenger km
  bus: 50,    // per passenger km
  walk: 0,
  cycle: 0,
};

export const CARBON_CONVERSION_FACTOR = 0.005; // IQ points per gram CO2 saved

// ─── Scan Abuse Prevention Constants ───
export const SCAN_COOLDOWN_HOURS = 4;       // hours before same product can be scanned again
export const MAX_SCANS_PER_DAY = 10;        // device-level daily limit
export const DUPLICATE_WINDOW_HOURS = 24;   // same-day repeat restriction
export const MAX_RECEIPT_SIZE_BYTES = 2 * 1024 * 1024; // 2MB compressed
