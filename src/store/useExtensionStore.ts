/**
 * LumeIQ Extension Store
 * ─────────────────────────────────────────────
 * Zustand store for all new modules. Works alongside existing useStore.
 * DOES NOT modify existing store — extends via composition.
 *
 * Manages: Coupons, Purchases, Transit, Trust, Photos
 */

import { create } from 'zustand';
import {
  Coupon,
  CouponRedemption,
  ScannedProduct,
  PurchaseConfirmation,
  RouteComparison,
  RouteConfirmation,
  TransportMode,
  EmissionLog,
  ReceiptPhoto,
  TrustScoreRecord,
} from '@/types/extensions';
import { RingValues } from '@/types';
import {
  getAvailableCoupons,
  getLockedCoupons,
  redeemCoupon,
  initializeMockData,
  matchCompanyByBarcode,
  getSustainabilityWeight,
  MOCK_COMPANIES,
} from '@/data/mockCompanies';
import {
  calculateRouteOptions,
  confirmRoute,
  calculateRouteRingImpact,
  getRouteHistory,
  getEmissionLogs,
  getTotalCarbonSaved,
  getTotalEcoRoutes,
} from '@/lib/transitCarbon';
import {
  compressImage,
  saveReceiptPhoto,
  getReceiptPhotos,
  verifyReceipt,
  getReceiptTrustBoost,
} from '@/lib/photoUpload';
import {
  calculateTrustScore,
  checkScanAllowed,
  recordScan,
  getFraudImpactMultiplier,
  registerDevice,
} from '@/lib/fraudDetection';
import {
  dispatchImpactEvent,
} from '@/lib/eventDispatcher';

// ─── Purchase Confirmation Storage ───
const PURCHASES_KEY = 'lumeiq_purchases';
const SCANNED_PRODUCTS_KEY = 'lumeiq_scanned_products';

function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// ─── Store Interface ───
interface ExtensionState {
  // Coupons
  availableCoupons: Coupon[];
  lockedCoupons: (Coupon & { iqNeeded: number })[];

  // Scan → Purchase
  lastScannedProduct: ScannedProduct | null;
  showPurchasePrompt: boolean;
  showReceiptUpload: boolean;
  purchaseHistory: PurchaseConfirmation[];

  // Transit
  currentRoute: RouteComparison | null;
  lastRouteConfirmation: RouteConfirmation | null;
  totalCarbonSaved: number;
  totalEcoRoutes: number;

  // Trust
  currentTrustScore: number;

  // Photos
  receiptPhotos: ReceiptPhoto[];

  // Initialization
  initialized: boolean;

  // Actions
  initializeExtensions: (userId: string, userIQ: number, createdAt: Date) => void;
  refreshCoupons: (userIQ: number) => void;
  redeemCoupon: (couponId: string, userId: string, currentIQ: number) => CouponRedemption | null;

  // Scan → Purchase actions
  handleProductScan: (barcode: string, name: string, brand: string, category: string, ecoScore: number, userId: string) => { allowed: boolean; product?: ScannedProduct; reason?: string };
  confirmPurchase: (userId: string, currentIQ: number, currentRings: RingValues) => PurchaseConfirmation | null;
  uploadReceipt: (userId: string, file: File | Blob, purchaseId?: string) => Promise<ReceiptPhoto | null>;
  dismissPurchasePrompt: () => void;
  dismissReceiptUpload: () => void;

  // Transit actions
  calculateRoute: (start: string, end: string, distanceKm: number) => RouteComparison;
  confirmEcoRoute: (userId: string, selectedMode: TransportMode, currentIQ: number, currentRings: RingValues) => RouteConfirmation | null;
  clearRoute: () => void;

  // Trust
  refreshTrustScore: (userId: string, createdAt: Date, receiptProvided?: boolean) => number;
}

export const useExtensionStore = create<ExtensionState>((set, get) => ({
  // Initial state
  availableCoupons: [],
  lockedCoupons: [],
  lastScannedProduct: null,
  showPurchasePrompt: false,
  showReceiptUpload: false,
  purchaseHistory: [],
  currentRoute: null,
  lastRouteConfirmation: null,
  totalCarbonSaved: 0,
  totalEcoRoutes: 0,
  currentTrustScore: 0.7,
  receiptPhotos: [],
  initialized: false,

  // ─── Initialize ───
  initializeExtensions: (userId: string, userIQ: number, createdAt: Date) => {
    if (get().initialized) return;

    // Initialize mock data
    initializeMockData();

    // Register device
    registerDevice(userId);

    // Load coupons
    const available = getAvailableCoupons(userIQ);
    const locked = getLockedCoupons(userIQ);

    // Load purchase history
    const rawPurchases = localStorage.getItem(PURCHASES_KEY);
    const purchaseHistory: PurchaseConfirmation[] = rawPurchases ? JSON.parse(rawPurchases) : [];

    // Load photos
    const photos = getReceiptPhotos(userId);

    // Load transit stats
    const totalCarbon = getTotalCarbonSaved(userId);
    const totalRoutes = getTotalEcoRoutes(userId);

    // Calculate trust
    const trustRecord = calculateTrustScore(userId, createdAt);

    set({
      availableCoupons: available,
      lockedCoupons: locked,
      purchaseHistory,
      receiptPhotos: photos,
      totalCarbonSaved: totalCarbon,
      totalEcoRoutes: totalRoutes,
      currentTrustScore: trustRecord.score,
      initialized: true,
    });
  },

  // ─── Coupons ───
  refreshCoupons: (userIQ: number) => {
    set({
      availableCoupons: getAvailableCoupons(userIQ),
      lockedCoupons: getLockedCoupons(userIQ),
    });
  },

  redeemCoupon: (couponId: string, userId: string, currentIQ: number) => {
    const redemption = redeemCoupon(couponId, userId, currentIQ);
    if (redemption) {
      // Dispatch event (coupon redemption does NOT change IQ)
      dispatchImpactEvent('coupon_redeem', userId, {
        iqDelta: 0,
        ringChanges: { circularity: 0, consumption: 0, mobility: 0 },
        source: 'coupon_redemption',
        metadata: { couponId, redemptionId: redemption.id },
      });

      // Refresh coupon lists
      const state = get();
      state.refreshCoupons(currentIQ);
    }
    return redemption;
  },

  // ─── Scan → Purchase ───
  handleProductScan: (barcode, name, brand, category, ecoScore, userId) => {
    // Check abuse prevention
    const scanCheck = checkScanAllowed(barcode, userId);
    if (!scanCheck.allowed) {
      return { allowed: false, reason: scanCheck.reason };
    }

    // Record scan for abuse tracking
    recordScan(barcode, userId);

    // Check if product belongs to sustainable company
    const company = matchCompanyByBarcode(barcode);

    const product: ScannedProduct = {
      id: generateId(),
      barcode,
      name,
      brand,
      category,
      ecoScore,
      sustainableCompanyId: company?.id || null,
      scannedAt: new Date().toISOString(),
      isSustainable: company !== null || ecoScore >= 60,
    };

    // Persist
    const rawProducts = localStorage.getItem(SCANNED_PRODUCTS_KEY);
    const products: ScannedProduct[] = rawProducts ? JSON.parse(rawProducts) : [];
    products.push(product);
    localStorage.setItem(SCANNED_PRODUCTS_KEY, JSON.stringify(products.slice(-100)));

    set({
      lastScannedProduct: product,
      showPurchasePrompt: true,
    });

    return { allowed: true, product };
  },

  confirmPurchase: (userId, currentIQ, currentRings) => {
    const { lastScannedProduct, currentTrustScore } = get();
    if (!lastScannedProduct) return null;

    // ─── ImpactIncrement Formula ───
    // ImpactIncrement = BaseScanValue × TrustScore × SustainabilityWeight
    // BaseScanValue: 8 (base points for scanning a product)
    // TrustScore: 0.0–1.0 (from fraud detection)
    // SustainabilityWeight: 0.5–2.0 (from company data)

    const baseScanValue = 8;
    const trustScore = currentTrustScore;
    const sustainabilityWeight = lastScannedProduct.sustainableCompanyId
      ? getSustainabilityWeight(lastScannedProduct.sustainableCompanyId)
      : (lastScannedProduct.ecoScore >= 60 ? 1.2 : 0.8);

    // Fraud multiplier
    const fraudMultiplier = getFraudImpactMultiplier(userId);

    const impactIncrement = Math.round(
      baseScanValue * trustScore * sustainabilityWeight * fraudMultiplier * 10
    ) / 10;

    // Apply to consumption ring
    const ringChanges: RingValues = {
      circularity: lastScannedProduct.isSustainable ? impactIncrement * 0.3 : 0,
      consumption: impactIncrement,
      mobility: 0,
    };

    const cooldownExpiry = new Date(Date.now() + 4 * 3600000).toISOString();

    const confirmation: PurchaseConfirmation = {
      id: generateId(),
      scannedProductId: lastScannedProduct.id,
      userId,
      confirmed: true,
      receiptPhotoId: null,
      trustScore,
      impactIncrement,
      confirmedAt: new Date().toISOString(),
      cooldownExpiry,
    };

    // Persist
    const rawPurchases = localStorage.getItem(PURCHASES_KEY);
    const purchases: PurchaseConfirmation[] = rawPurchases ? JSON.parse(rawPurchases) : [];
    purchases.push(confirmation);
    localStorage.setItem(PURCHASES_KEY, JSON.stringify(purchases.slice(-100)));

    // Dispatch impact event
    dispatchImpactEvent('scan_purchase', userId, {
      iqDelta: 0, // IQ delta calculated by the main store
      ringChanges,
      source: 'purchase_confirmation',
      metadata: {
        productId: lastScannedProduct.id,
        barcode: lastScannedProduct.barcode,
        sustainableCompanyId: lastScannedProduct.sustainableCompanyId,
        impactIncrement,
        trustScore,
      },
    });

    set({
      showPurchasePrompt: false,
      showReceiptUpload: true,
      purchaseHistory: [...get().purchaseHistory, confirmation],
    });

    return confirmation;
  },

  uploadReceipt: async (userId, file, purchaseId) => {
    try {
      const dataUrl = await compressImage(file);
      const photo = saveReceiptPhoto(userId, dataUrl, purchaseId);

      // Auto-verify (hackathon placeholder)
      verifyReceipt(photo.id);

      // Dispatch receipt event
      dispatchImpactEvent('receipt_upload', userId, {
        iqDelta: 0,
        ringChanges: { circularity: 0, consumption: 0, mobility: 0 },
        source: 'receipt_upload',
        metadata: { photoId: photo.id, verified: true },
      });

      set({
        receiptPhotos: [...get().receiptPhotos, photo],
        showReceiptUpload: false,
      });

      return photo;
    } catch (error) {
      console.error('[ExtensionStore] Failed to upload receipt:', error);
      return null;
    }
  },

  dismissPurchasePrompt: () => set({ showPurchasePrompt: false }),
  dismissReceiptUpload: () => set({ showReceiptUpload: false }),

  // ─── Transit ───
  calculateRoute: (start, end, distanceKm) => {
    const comparison = calculateRouteOptions({ startLocation: start, endLocation: end, distanceKm });
    set({ currentRoute: comparison });
    return comparison;
  },

  confirmEcoRoute: (userId, selectedMode, currentIQ, currentRings) => {
    const { currentRoute } = get();
    if (!currentRoute) return null;

    const confirmation = confirmRoute(currentRoute, userId, selectedMode);
    const ringImpact = calculateRouteRingImpact(confirmation.impactBonus);

    // Dispatch impact event
    dispatchImpactEvent('route_confirm', userId, {
      iqDelta: 0,
      ringChanges: ringImpact,
      source: 'eco_route',
      metadata: {
        mode: selectedMode,
        carbonSavedGrams: confirmation.carbonSavedGrams,
        distanceKm: currentRoute.request.distanceKm,
      },
    });

    set({
      lastRouteConfirmation: confirmation,
      totalCarbonSaved: get().totalCarbonSaved + confirmation.carbonSavedGrams,
      totalEcoRoutes: get().totalEcoRoutes + (selectedMode !== 'car' ? 1 : 0),
      currentRoute: null,
    });

    return confirmation;
  },

  clearRoute: () => set({ currentRoute: null, lastRouteConfirmation: null }),

  // ─── Trust ───
  refreshTrustScore: (userId, createdAt, receiptProvided = false) => {
    const record = calculateTrustScore(userId, createdAt, receiptProvided);
    set({ currentTrustScore: record.score });
    return record.score;
  },
}));
