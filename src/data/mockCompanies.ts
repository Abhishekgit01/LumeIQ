/**
 * LumeIQ Mock Companies, Promotions & Coupons
 * ─────────────────────────────────────────────
 * 5 sustainability-focused mock companies with promotions and coupons.
 * All data stored in localStorage for offline-first behavior.
 * Coupons unlock ONLY when IQ threshold is reached — never modify IQ directly.
 */

import {
  SustainableCompany,
  Promotion,
  Coupon,
  CouponRedemption,
} from '@/types/extensions';

// ─── Storage Keys ───
const COMPANIES_KEY = 'lumeiq_companies';
const PROMOTIONS_KEY = 'lumeiq_promotions';
const COUPONS_KEY = 'lumeiq_coupons';
const REDEMPTIONS_KEY = 'lumeiq_coupon_redemptions';

// ─── 5 Mock Sustainable Companies ───
export const MOCK_COMPANIES: SustainableCompany[] = [
  {
    id: 'terra-foods',
    name: 'Terra Organics',
    logoPlaceholder: '🌿',
    category: 'food',
    description: 'Farm-to-table organic food. Zero pesticides, 100% compostable packaging.',
    sustainabilityWeight: 1.8,
    barcodePrefix: '301',
  },
  {
    id: 'greenweave',
    name: 'GreenWeave',
    logoPlaceholder: '🧵',
    category: 'fashion',
    description: 'Sustainable fashion from recycled textiles. Fair trade certified.',
    sustainabilityWeight: 1.5,
    barcodePrefix: '544',
  },
  {
    id: 'voltride',
    name: 'VoltRide',
    logoPlaceholder: '⚡',
    category: 'transport',
    description: 'Electric micro-mobility solutions — e-bikes, e-scooters, shared EVs.',
    sustainabilityWeight: 1.6,
    barcodePrefix: '762',
  },
  {
    id: 'solarhome',
    name: 'SolarHome',
    logoPlaceholder: '☀️',
    category: 'energy',
    description: 'Affordable rooftop solar panels and home energy monitors.',
    sustainabilityWeight: 2.0,
    barcodePrefix: '316',
  },
  {
    id: 'ecobrew',
    name: 'EcoBrew',
    logoPlaceholder: '☕',
    category: 'lifestyle',
    description: 'Shade-grown coffee, refillable pods, carbon-neutral roasting.',
    sustainabilityWeight: 1.4,
    barcodePrefix: '890',
  },
];

// ─── Promotions ───
export const MOCK_PROMOTIONS: Promotion[] = [
  {
    id: 'promo-terra-1',
    companyId: 'terra-foods',
    title: '15% Off Organic Basket',
    description: 'Get 15% off your organic weekly basket when your IQ hits 50+',
    type: 'percentage',
    value: 15,
    minIQRequired: 50,
    validFrom: '2026-01-01',
    validUntil: '2026-12-31',
    maxRedemptions: 3,
    isActive: true,
  },
  {
    id: 'promo-greenweave-1',
    companyId: 'greenweave',
    title: 'Free Tote Bag',
    description: 'Unlock a free recycled tote bag at IQ 60+',
    type: 'freebie',
    value: 1,
    minIQRequired: 60,
    validFrom: '2026-01-01',
    validUntil: '2026-12-31',
    maxRedemptions: 1,
    isActive: true,
  },
  {
    id: 'promo-voltride-1',
    companyId: 'voltride',
    title: '₹50 E-Bike Credit',
    description: 'Earn ₹50 free ride credit at IQ 45+',
    type: 'flat',
    value: 50,
    minIQRequired: 45,
    validFrom: '2026-01-01',
    validUntil: '2026-12-31',
    maxRedemptions: 5,
    isActive: true,
  },
  {
    id: 'promo-solarhome-1',
    companyId: 'solarhome',
    title: '10% Solar Panel Discount',
    description: 'Sustainability leaders (IQ 75+) get 10% off installations',
    type: 'percentage',
    value: 10,
    minIQRequired: 75,
    validFrom: '2026-01-01',
    validUntil: '2026-12-31',
    maxRedemptions: 1,
    isActive: true,
  },
  {
    id: 'promo-ecobrew-1',
    companyId: 'ecobrew',
    title: 'Free Coffee Friday',
    description: 'Redeem a free artisan coffee every Friday at IQ 40+',
    type: 'freebie',
    value: 1,
    minIQRequired: 40,
    validFrom: '2026-01-01',
    validUntil: '2026-12-31',
    maxRedemptions: 10,
    isActive: true,
  },
  {
    id: 'promo-terra-2',
    companyId: 'terra-foods',
    title: '5% Cashback on Veggies',
    description: 'Progressive tier members (IQ 75+) get 5% cashback on fresh produce',
    type: 'cashback',
    value: 5,
    minIQRequired: 75,
    validFrom: '2026-01-01',
    validUntil: '2026-12-31',
    maxRedemptions: 10,
    isActive: true,
  },
  {
    id: 'promo-voltride-2',
    companyId: 'voltride',
    title: 'Free Ride Pass (1 Day)',
    description: 'Vanguard tier (IQ 90+) unlocks a full-day free ride pass',
    type: 'freebie',
    value: 1,
    minIQRequired: 90,
    validFrom: '2026-01-01',
    validUntil: '2026-12-31',
    maxRedemptions: 2,
    isActive: true,
  },
];

// ─── Generate Coupons from Promotions ───
export const MOCK_COUPONS: Coupon[] = MOCK_PROMOTIONS.map((promo) => {
  const company = MOCK_COMPANIES.find(c => c.id === promo.companyId)!;
  return {
    id: `coupon-${promo.id}`,
    promotionId: promo.id,
    companyId: promo.companyId,
    code: `LUME-${promo.companyId.toUpperCase().slice(0, 4)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
    title: promo.title,
    description: promo.description,
    discountValue: promo.value,
    discountType: promo.type,
    minIQRequired: promo.minIQRequired,
    expiresAt: promo.validUntil,
    icon: company.logoPlaceholder,
  };
});

// ─── Initialize mock data in localStorage ───
export function initializeMockData(): void {
  if (typeof window === 'undefined') return;

  if (!localStorage.getItem(COMPANIES_KEY)) {
    localStorage.setItem(COMPANIES_KEY, JSON.stringify(MOCK_COMPANIES));
  }
  if (!localStorage.getItem(PROMOTIONS_KEY)) {
    localStorage.setItem(PROMOTIONS_KEY, JSON.stringify(MOCK_PROMOTIONS));
  }
  if (!localStorage.getItem(COUPONS_KEY)) {
    localStorage.setItem(COUPONS_KEY, JSON.stringify(MOCK_COUPONS));
  }
  if (!localStorage.getItem(REDEMPTIONS_KEY)) {
    localStorage.setItem(REDEMPTIONS_KEY, JSON.stringify([]));
  }
}

// ─── Company Operations ───
export function getCompanies(): SustainableCompany[] {
  if (typeof window === 'undefined') return MOCK_COMPANIES;
  const raw = localStorage.getItem(COMPANIES_KEY);
  return raw ? JSON.parse(raw) : MOCK_COMPANIES;
}

export function getCompanyById(id: string): SustainableCompany | undefined {
  return getCompanies().find(c => c.id === id);
}

export function matchCompanyByBarcode(barcode: string): SustainableCompany | null {
  return getCompanies().find(c => c.barcodePrefix && barcode.startsWith(c.barcodePrefix)) || null;
}

// ─── Coupon Operations ───
export function getCoupons(): Coupon[] {
  if (typeof window === 'undefined') return MOCK_COUPONS;
  const raw = localStorage.getItem(COUPONS_KEY);
  return raw ? JSON.parse(raw) : MOCK_COUPONS;
}

export function getAvailableCoupons(userIQ: number): Coupon[] {
  const coupons = getCoupons();
  const redemptions = getRedemptions();
  const now = new Date().toISOString();

  return coupons.filter(coupon => {
    // Check IQ threshold
    if (userIQ < coupon.minIQRequired) return false;

    // Check expiry
    if (coupon.expiresAt < now) return false;

    // Check redemption limit
    const promo = MOCK_PROMOTIONS.find(p => p.id === coupon.promotionId);
    if (promo) {
      const redemptionCount = redemptions.filter(r => r.couponId === coupon.id).length;
      if (redemptionCount >= promo.maxRedemptions) return false;
    }

    return true;
  });
}

export function getLockedCoupons(userIQ: number): (Coupon & { iqNeeded: number })[] {
  const coupons = getCoupons();
  const now = new Date().toISOString();

  return coupons
    .filter(coupon => userIQ < coupon.minIQRequired && coupon.expiresAt >= now)
    .map(coupon => ({ ...coupon, iqNeeded: coupon.minIQRequired - Math.round(userIQ) }));
}

// ─── Redemption Operations ───
export function getRedemptions(): CouponRedemption[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(REDEMPTIONS_KEY);
  return raw ? JSON.parse(raw) : [];
}

export function redeemCoupon(couponId: string, userId: string, currentIQ: number): CouponRedemption | null {
  const coupon = getCoupons().find(c => c.id === couponId);
  if (!coupon) return null;

  // Eligibility check
  if (currentIQ < coupon.minIQRequired) return null;

  // Check redemption limit
  const redemptions = getRedemptions();
  const promo = MOCK_PROMOTIONS.find(p => p.id === coupon.promotionId);
  if (promo) {
    const existing = redemptions.filter(r => r.couponId === couponId);
    if (existing.length >= promo.maxRedemptions) return null;
  }

  const redemption: CouponRedemption = {
    id: `redemption-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    couponId,
    userId,
    redeemedAt: new Date().toISOString(),
    iqAtRedemption: currentIQ,
  };

  redemptions.push(redemption);
  localStorage.setItem(REDEMPTIONS_KEY, JSON.stringify(redemptions));

  return redemption;
}

// ─── Eligibility Formula ───
// Eligibility = 1 if userIQ >= minIQRequired, else 0
// This is a hard threshold — no partial eligibility
export function checkEligibility(userIQ: number, minIQRequired: number): boolean {
  return userIQ >= minIQRequired;
}

// ─── Get company sustainability weight for scan multiplier ───
export function getSustainabilityWeight(companyId: string): number {
  const company = getCompanyById(companyId);
  return company?.sustainabilityWeight ?? 1.0;
}
