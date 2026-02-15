# LumeIQ Extension Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                        ANDROID APK (Capacitor)                      │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │                     Next.js Static Export                       ││
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐││
│  │  │  Auth Layer  │  │  Onboarding │  │      AppShell           │││
│  │  │  (existing)  │  │  (existing) │  │  ┌─────────────────┐   │││
│  │  └──────────────┘  └─────────────┘  │  │   Tab Router     │   │││
│  │                                      │  │  Summary | Scan  │   │││
│  │                                      │  │  Routes|Rewards  │   │││
│  │                                      │  │  Profile         │   │││
│  │                                      │  └─────────────────┘   │││
│  │                                      └───────────────────────┘││
│  │  ┌───────────────────────────────────────────────────────────┐ ││
│  │  │                    Views Layer                             │ ││
│  │  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌─────────────┐ │ ││
│  │  │  │Dashboard │ │ScanView  │ │TransitV  │ │CouponsView  │ │ ││
│  │  │  │(extended)│ │(extended)│ │  (NEW)   │ │   (NEW)     │ │ ││
│  │  │  └────┬─────┘ └────┬─────┘ └────┬─────┘ └──────┬──────┘ │ ││
│  │  │       │             │             │              │        │ ││
│  │  │  ┌────▼─────────────▼─────────────▼──────────────▼──────┐ │ ││
│  │  │  │              Event Dispatcher                         │ │ ││
│  │  │  │  (Central bus for all IQ-modifying actions)           │ │ ││
│  │  │  └───────────────────┬───────────────────────────────────┘ │ ││
│  │  │                      │                                     │ ││
│  │  │  ┌───────────────────▼───────────────────────────────────┐ │ ││
│  │  │  │              Store Layer                               │ │ ││
│  │  │  │  ┌─────────────────────┐  ┌─────────────────────────┐ │ │ ││
│  │  │  │  │  useStore (existing)│  │ useExtensionStore (NEW) │ │ │ ││
│  │  │  │  │  - User, IQ, Rings  │  │ - Coupons, Purchases   │ │ │ ││
│  │  │  │  │  - Modes, Views    │  │ - Transit, Trust Score  │ │ │ ││
│  │  │  │  │  - Daily Logs      │  │ - Photos, Fraud Flags   │ │ │ ││
│  │  │  │  └─────────┬──────────┘  └──────────┬───────────────┘ │ │ ││
│  │  │  └────────────┼────────────────────────┼─────────────────┘ │ ││
│  │  │               │                        │                   │ ││
│  │  │  ┌────────────▼────────────────────────▼─────────────────┐ │ ││
│  │  │  │            localStorage (Primary)                      │ │ ││
│  │  │  │  greenledger_user | lumeiq_companies | lumeiq_routes  │ │ ││
│  │  │  │  lumeiq_purchases | lumeiq_photos | lumeiq_events     │ │ ││
│  │  │  │  lumeiq_sync_queue | lumeiq_fraud_flags               │ │ ││
│  │  │  └───────────────────────┬───────────────────────────────┘ │ ││
│  │  │                          │ (online only)                   │ ││
│  │  │  ┌───────────────────────▼───────────────────────────────┐ │ ││
│  │  │  │            Supabase (Optional Cloud Sync)              │ │ ││
│  │  │  └───────────────────────────────────────────────────────┘ │ ││
│  │  └───────────────────────────────────────────────────────────┘ ││
│  └─────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────┘
```

---

## Database Schema (localStorage Tables)

### Existing Tables (UNCHANGED)
| Table | Key | Fields |
|-------|-----|--------|
| `greenledger_user` | single | id, baseline, IQ, tier, rings, dailyLogs[], photoGallery[], isDemo |
| `lumeiq_users` | array | id, email, name, passwordHash, createdAt |
| `lumeiq_session` | single | id, email, name |

### New Tables

#### `lumeiq_companies` — Mock Sustainable Companies
| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique company ID |
| name | string | Company name |
| logoPlaceholder | string | Emoji icon |
| category | enum | food, fashion, transport, energy, lifestyle |
| description | string | Company description |
| sustainabilityWeight | number | 0.5–2.0 multiplier for IQ calculation |
| barcodePrefix | string? | For matching scanned barcodes |

#### `lumeiq_promotions` — Promotional Offers
| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique promo ID |
| companyId | string | FK → companies |
| title | string | Promotion title |
| type | enum | percentage, flat, freebie, cashback |
| value | number | Discount value |
| minIQRequired | number | IQ threshold to unlock |
| validFrom/validUntil | string | ISO date range |
| maxRedemptions | number | Max uses per user |

#### `lumeiq_coupons` — Generated Coupon Codes
| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique coupon ID |
| promotionId | string | FK → promotions |
| companyId | string | FK → companies |
| code | string | Alphanumeric coupon code |
| minIQRequired | number | IQ threshold |
| expiresAt | string | Expiry date |

#### `lumeiq_coupon_redemptions` — Redemption Log
| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique redemption ID |
| couponId | string | FK → coupons |
| userId | string | FK → users |
| redeemedAt | string | ISO timestamp |
| iqAtRedemption | number | User's IQ at time of redemption |

#### `lumeiq_scanned_products` — Products Scanned
| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique product scan ID |
| barcode | string | Product barcode |
| name, brand, category | string | Product metadata |
| ecoScore | number | 0–100 |
| sustainableCompanyId | string? | FK → companies (if matched) |
| isSustainable | boolean | true if eco-friendly |
| scannedAt | string | ISO timestamp |

#### `lumeiq_purchases` — Purchase Confirmations
| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique purchase ID |
| scannedProductId | string | FK → scanned_products |
| userId | string | FK → users |
| confirmed | boolean | User confirmed purchase |
| receiptPhotoId | string? | FK → receipt_photos |
| trustScore | number | 0.0–1.0 at time of purchase |
| impactIncrement | number | IQ points earned |
| cooldownExpiry | string | When this product can be re-scanned |

#### `lumeiq_receipt_photos` — Receipt Images
| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique photo ID |
| userId | string | FK → users |
| dataUrl | string | Base64 compressed JPEG |
| sizeBytes | number | Image size |
| verified | boolean | AI verification result (placeholder) |
| manualOverride | boolean | Admin override flag |
| linkedPurchaseId | string? | FK → purchases |
| syncedToBackend | boolean | Cloud sync status |

#### `lumeiq_route_history` — Transit Route Log
| Field | Type | Description |
|-------|------|-------------|
| comparison | object | RouteComparison with all options |
| confirmation | object | Selected mode, carbon saved, IQ bonus |

#### `lumeiq_emission_logs` — Carbon Emission Records
| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique log ID |
| userId | string | FK → users |
| date | string | Date |
| mode | enum | car, bike, metro, bus, walk, cycle |
| distanceKm | number | Route distance |
| emissionGrams | number | CO₂ emitted |
| carbonSavedGrams | number | CO₂ saved vs car |

#### `lumeiq_device_registry` — Device Fingerprints
| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique device ID |
| userId | string | FK → users |
| deviceFingerprint | string | Generated hardware fingerprint |
| platform | string | android, ios, web |
| trusted | boolean | No multi-account detected |

#### `lumeiq_fraud_flags` — Fraud Detection Alerts
| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique flag ID |
| userId | string | FK → users |
| type | enum | multi_account, rapid_scan, duplicate_receipt, suspicious_pattern |
| severity | enum | low, medium, high |
| description | string | Human-readable explanation |
| resolved | boolean | Whether flag was cleared |

#### `lumeiq_trust_scores` — Trust Score History
| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique score ID |
| userId | string | FK → users |
| score | number | 0.0–1.0 |
| factors | object | { receiptProvided, accountAge, consistencyScore, fraudFlagCount, deviceTrusted } |

#### `lumeiq_impact_events` — Event Log
| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique event ID |
| type | enum | scan_purchase, route_confirm, mode_activate, receipt_upload, coupon_redeem |
| userId | string | FK → users |
| payload | object | { iqDelta, ringChanges, source, metadata } |
| processed | boolean | Whether event was applied |

#### `lumeiq_sync_queue` — Offline Sync Queue
| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique queue item ID |
| action | enum | create, update, delete |
| table | string | Target table name |
| data | object | Payload to sync |
| synced | boolean | Whether synced to backend |
| retryCount | number | Number of failed attempts (max 5) |

---

## Scoring Formulas

### 1. Impact Quotient (IQ) — Existing, UNCHANGED
```
BPI = Σ(ringChange × weight) / Σ(weight)
  weights: { circularity: 0.35, consumption: 0.35, mobility: 0.30 }

IQΔ = (100 − currentIQ) × (1 − e^(−k × BPI))
  k = { FND: 0.12, Aware: 0.07, Aligned: 0.035, Progressive: 0.035, Vanguard: 0.035 }

Cap: IQΔ ≤ 6 per day
Verification boost: IQΔ × 1.15 if verified
```

### 2. Purchase Impact Increment (NEW)
```
ImpactIncrement = BaseScanValue × TrustScore × SustainabilityWeight × FraudMultiplier

BaseScanValue = 8 (fixed base points)
TrustScore = 0.0–1.0 (from fraud detection module)
SustainabilityWeight = company.sustainabilityWeight (0.5–2.0)
FraudMultiplier = 0.3–1.0 (reduced if fraud flags exist)

Ring allocation:
  consumption += ImpactIncrement
  circularity += ImpactIncrement × 0.3 (if sustainable product)
```

### 3. Trust Score (NEW)
```
TrustScore = BaseScore × DeviceFactor × ConsistencyFactor × FraudPenalty + ReceiptBoost

BaseScore = 0.7
DeviceFactor = 1.0 (trusted) or 0.7 (untrusted)
ConsistencyFactor = min(1.0, accountAgeDays / 30)
FraudPenalty = 0.8^(unresolvedFlagCount)
ReceiptBoost = +0.15 if receipt verified

Decay: −0.05 per flag per week (floor: 0.1)
```

### 4. Fraud Impact Multiplier (NEW)
```
FraudMultiplier = Π(severityMultiplier) for each unresolved flag

Severity multipliers:
  low: 0.9
  medium: 0.7
  high: 0.5

Floor: 0.3 (never fully blocks IQ earning)
```

### 5. Carbon Saved (NEW)
```
CarbonSaved = (CarEmission − SelectedModeEmission)
  CarEmission = distanceKm × 120 g/km
  SelectedModeEmission = distanceKm × EMISSION_FACTORS[mode]

EMISSION_FACTORS:
  car: 120 g/km
  bike: 80 g/km (e-bike/motorbike)
  bus: 50 g/km
  metro: 35 g/km
  walk: 0 g/km
  cycle: 0 g/km

ImpactBonus = CarbonSaved × 0.005 (conversion factor)
Ring impact: mobility += min(ImpactBonus × 3, 15)
```

### 6. Coupon Eligibility (NEW)
```
Eligible = (userIQ ≥ coupon.minIQRequired) AND
           (redemptionCount < maxRedemptions) AND
           (now < expiresAt)

Coupons NEVER modify IQ — they are rewards unlocked BY IQ threshold.
```

---

## API Endpoints (Mock / Future Backend)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/route/calculate` | Calculate route options for start→end |
| POST | `/route/confirm` | Confirm eco route selection, update IQ |
| POST | `/scan/purchase` | Confirm product purchase |
| POST | `/scan/receipt` | Upload receipt photo |
| GET | `/coupons/available` | Get coupons for user's IQ level |
| POST | `/coupons/redeem` | Redeem a coupon |
| GET | `/companies` | List sustainable partner companies |
| POST | `/auth/device` | Register device fingerprint |
| GET | `/trust/score` | Get current trust score |
| GET | `/emissions/summary` | Get total carbon saved |

*Note: All currently run client-side via localStorage. Endpoints defined for future backend migration.*

---

## Android-Side Components

| Component | Type | Purpose |
|-----------|------|---------|
| `CouponsView.tsx` | View | Eco rewards: available/locked coupons, partner companies |
| `TransitView.tsx` | View | Route calculator, carbon comparison, eco route confirmation |
| `PurchasePrompt.tsx` | Sheet | Purchase confirmation overlay after product scan |
| `useExtensionStore.ts` | Store | Zustand store for all new feature state |
| `eventDispatcher.ts` | Lib | Central event bus for IQ-modifying actions |
| `transitCarbon.ts` | Lib | Deterministic emission calculation engine |
| `photoUpload.ts` | Lib | Image capture, compression, local caching |
| `fraudDetection.ts` | Lib | Device fingerprint, trust scoring, abuse prevention |
| `mockCompanies.ts` | Data | 5 sustainable companies with promotions and coupons |
| `extensions.ts` | Types | All new TypeScript interfaces and constants |

---

## Integration Notes

### What Changed (Existing Files)
1. **`types/index.ts`** — Added `'coupons' | 'transit'` to `ViewType`
2. **`app/page.tsx`** — Added `CouponsView` and `TransitView` route rendering
3. **`layout/AppShell.tsx`** — Updated tab bar: Routes and Rewards replace EcoSpace and Finance
4. **`views/DashboardView.tsx`** — Added Quick Actions grid with links to new features
5. **`views/ScanView.tsx`** — Integrated purchase confirmation flow after scan

### What Was NOT Changed
- `useStore.ts` — Original Zustand store untouched
- `calculations.ts` — IQ engine untouched
- `localAuth.ts` — Auth system untouched
- `storage.ts` — Storage layer untouched
- `sync.ts` — Cloud sync untouched
- All existing views and components work identically

### Event-Driven Update Model
```
[User Action] → [Module Logic] → [dispatchImpactEvent()] → [Event Log]
                                                              ↓
                                        [useStore.activateMode() or updateUser()]
                                                              ↓
                                        [calculateNewIQ()] → [saveUser()] → [triggerSync()]
```

All IQ modifications flow through the existing `calculateNewIQ()` function. New modules never directly write to IQ — they dispatch events that trigger the existing update pipeline.

### Offline-First Design
- All data stored in localStorage first
- Sync queue accumulates changes when offline
- Background sync processes queue when connectivity returns
- Max retry: 5 attempts per queue item
- Graceful degradation: app fully functional offline

### No Circular Dependencies
```
types/extensions.ts ← (all modules import from here)
lib/eventDispatcher.ts ← (modules dispatch events)
lib/fraudDetection.ts ← (standalone, no store dependency)
lib/transitCarbon.ts ← (standalone, no store dependency)
lib/photoUpload.ts ← (standalone, no store dependency)
data/mockCompanies.ts ← (standalone data layer)
store/useExtensionStore.ts → imports from all libs above
views/* → imports from stores
```

---

## Fraud Mitigation Logic

### Scan Abuse Prevention
| Rule | Limit | Response |
|------|-------|----------|
| Daily scan limit | 10 scans/day | Blocked with message |
| Same product cooldown | 4 hours | Blocked with timer |
| Same-day repeat | 1 per product/day | Blocked |
| Rapid scanning | 5+ in 5 minutes | Fraud flag (low severity) |

### Device-Level Detection
| Signal | Detection | Action |
|--------|-----------|--------|
| Multi-account per device | >1 userId per fingerprint | Fraud flag (medium) |
| Rapid scanning pattern | 5+ scans in 5 minutes | Fraud flag (low) |
| Duplicate receipts | Same image hash | Fraud flag (medium) — placeholder |

### Impact on Scoring
- Each fraud flag reduces IQ earning multiplier
- Trust score decays over time if flags unresolved
- Minimum multiplier floor: 0.3 (never fully blocks user)

---

## Hackathon Demo Script

### Step-by-Step Flow (12 Steps)

| Step | Action | What Happens |
|------|--------|-------------|
| 1 | **User logs in** | Existing auth system — email + password via localStorage |
| 2 | **User scans sustainable product** | Enter barcode (e.g. 3017620422003). OpenFoodFacts API returns real product data. Purchase prompt appears. |
| 3 | **Confirms purchase** | Taps "Yes, I purchased". TrustScore × SustainabilityWeight calculated. Impact points shown. |
| 4 | **Uploads receipt** | Camera opens → photo compressed → saved locally. Receipt verified (auto-approve). |
| 5 | **Trust Score increases** | +15% trust boost from verified receipt. Shown in prompt. |
| 6 | **Impact Quotient updates** | Consumption ring fills. IQ number on dashboard updates live. Event logged. |
| 7 | **Coupon unlocks** | Navigate to Rewards tab. If IQ ≥ 40, "Free Coffee Friday" from EcoBrew unlocks. Copy code. |
| 8 | **User checks transit route** | Navigate to Routes tab. Enter "Koramangala → Electronic City, 16km" or tap popular route. |
| 9 | **Chooses eco route** | Carbon comparison shows all modes. User taps "Metro" — saves 1,360g CO₂. |
| 10 | **Carbon saved shown** | Success card: "1.4kg CO₂ saved! +6.80 IQ bonus applied" |
| 11 | **Impact Quotient updates live** | Dashboard mobility ring fills. IQ number increases. Streak calendar shows today. |
| 12 | **Corporate dashboard reflects** | Profile shows aggregate stats: total carbon saved, eco routes taken, coupons redeemed. |

### Demo Tips
- Use test barcode `3017620422003` (Nutella) for reliable scan
- Set initial baseline to get IQ ~40+ for coupon demo
- Use "Koramangala → Electronic City" quick route for transit demo
- All features work offline — no network needed except barcode scan

---

## 5 Mock Companies

| Company | Logo | Category | Weight | Min IQ | Promotion |
|---------|------|----------|--------|--------|-----------|
| Terra Organics | 🌿 | Food | 1.8x | 50 | 15% off organic basket |
| GreenWeave | 🧵 | Fashion | 1.5x | 60 | Free recycled tote bag |
| VoltRide | ⚡ | Transport | 1.6x | 45 | ₹50 e-bike credit |
| SolarHome | ☀️ | Energy | 2.0x | 75 | 10% solar panel discount |
| EcoBrew | ☕ | Lifestyle | 1.4x | 40 | Free coffee Friday |
