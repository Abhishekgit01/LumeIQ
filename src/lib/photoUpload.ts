/**
 * LumeIQ Photo Upload System
 * ─────────────────────────────────────────────
 * Android storage safe: captures, compresses, caches locally.
 * Syncs to backend when online. AI-verification placeholder.
 *
 * Size limit: 2MB compressed
 * Format: base64 JPEG
 */

import { ReceiptPhoto, MAX_RECEIPT_SIZE_BYTES } from '@/types/extensions';

const PHOTOS_KEY = 'lumeiq_receipt_photos';

function generateId(): string {
  return `photo_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// ─── Compress Image ───
export async function compressImage(
  file: File | Blob,
  maxWidth: number = 800,
  quality: number = 0.6
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;

        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);

        // Check size
        const sizeBytes = Math.round((dataUrl.length * 3) / 4);
        if (sizeBytes > MAX_RECEIPT_SIZE_BYTES) {
          // Re-compress with lower quality
          const lowerQuality = canvas.toDataURL('image/jpeg', 0.3);
          resolve(lowerQuality);
        } else {
          resolve(dataUrl);
        }
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

// ─── Capture from Camera (uses file input) ───
export function createCameraInput(): HTMLInputElement {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.capture = 'environment'; // rear camera
  return input;
}

// ─── Save Photo Locally ───
export function saveReceiptPhoto(
  userId: string,
  dataUrl: string,
  linkedPurchaseId?: string
): ReceiptPhoto {
  const sizeBytes = Math.round((dataUrl.length * 3) / 4);

  const photo: ReceiptPhoto = {
    id: generateId(),
    userId,
    dataUrl,
    sizeBytes,
    verified: false,       // AI verification placeholder — defaults to false
    manualOverride: false,
    linkedPurchaseId: linkedPurchaseId || null,
    capturedAt: new Date().toISOString(),
    syncedToBackend: false,
  };

  const photos = getReceiptPhotos();
  photos.push(photo);

  // Keep only last 30 photos to manage storage
  const trimmed = photos.slice(-30);
  localStorage.setItem(PHOTOS_KEY, JSON.stringify(trimmed));

  return photo;
}

// ─── Get Photos ───
export function getReceiptPhotos(userId?: string): ReceiptPhoto[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(PHOTOS_KEY);
    let photos: ReceiptPhoto[] = raw ? JSON.parse(raw) : [];
    if (userId) photos = photos.filter(p => p.userId === userId);
    return photos;
  } catch {
    return [];
  }
}

export function getPhotoById(photoId: string): ReceiptPhoto | undefined {
  return getReceiptPhotos().find(p => p.id === photoId);
}

// ─── AI Verification Placeholder ───
// In production, this would call a vision API to verify receipt authenticity
export function verifyReceipt(photoId: string): boolean {
  const photos = getReceiptPhotos();
  const photo = photos.find(p => p.id === photoId);
  if (!photo) return false;

  // Placeholder: always marks as verified (auto-approve for hackathon)
  // Real implementation would:
  // 1. Send image to vision API
  // 2. Check for receipt-like patterns (store name, items, prices, date)
  // 3. Cross-reference with scan data
  // 4. Return confidence score
  photo.verified = true;
  localStorage.setItem(PHOTOS_KEY, JSON.stringify(photos));

  return true;
}

// ─── Manual Override ───
export function setManualOverride(photoId: string, override: boolean): void {
  const photos = getReceiptPhotos();
  const photo = photos.find(p => p.id === photoId);
  if (photo) {
    photo.manualOverride = override;
    photo.verified = override;
    localStorage.setItem(PHOTOS_KEY, JSON.stringify(photos));
  }
}

// ─── Delete Photo ───
export function deleteReceiptPhoto(photoId: string): void {
  const photos = getReceiptPhotos().filter(p => p.id !== photoId);
  localStorage.setItem(PHOTOS_KEY, JSON.stringify(photos));
}

// ─── Mark as Synced ───
export function markPhotoSynced(photoId: string): void {
  const photos = getReceiptPhotos();
  const photo = photos.find(p => p.id === photoId);
  if (photo) {
    photo.syncedToBackend = true;
    localStorage.setItem(PHOTOS_KEY, JSON.stringify(photos));
  }
}

// ─── Trust Score Boost from Receipt ───
// Receipt presence increases trust score multiplier by 0.15
export function getReceiptTrustBoost(photoId: string): number {
  const photo = getPhotoById(photoId);
  if (!photo) return 0;
  if (photo.verified) return 0.15;
  if (photo.manualOverride) return 0.10;
  return 0.05; // Unverified receipt still adds some trust
}
