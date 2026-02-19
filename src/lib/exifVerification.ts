import ExifReader from 'exifreader';

export interface ExifVerificationResult {
  isValid: boolean;
  isFresh: boolean;       // taken within last 5 minutes
  hasGPS: boolean;
  hasTimestamp: boolean;
  isFromCamera: boolean;  // has camera-specific EXIF (not screenshot/download)
  timestamp: Date | null;
  gps: { lat: number; lng: number } | null;
  warnings: string[];
  details: string;
}

// Max age for a "fresh" photo (5 minutes)
const MAX_PHOTO_AGE_MS = 5 * 60 * 1000;

function parseExifDate(dateStr: string): Date | null {
  // EXIF dates are formatted as "YYYY:MM:DD HH:MM:SS"
  try {
    const cleaned = dateStr.replace(/^(\d{4}):(\d{2}):(\d{2})/, '$1-$2-$3');
    const d = new Date(cleaned);
    return isNaN(d.getTime()) ? null : d;
  } catch {
    return null;
  }
}

function convertDMSToDD(
  degrees: number,
  minutes: number,
  seconds: number,
  direction: string
): number {
  let dd = degrees + minutes / 60 + seconds / 3600;
  if (direction === 'S' || direction === 'W') dd *= -1;
  return dd;
}

export async function verifyImageEXIF(file: File): Promise<ExifVerificationResult> {
  const warnings: string[] = [];
  let timestamp: Date | null = null;
  let gps: { lat: number; lng: number } | null = null;
  let isFresh = false;
  let hasGPS = false;
  let hasTimestamp = false;
  let isFromCamera = false;

  try {
    const arrayBuffer = await file.arrayBuffer();
    const tags = ExifReader.load(arrayBuffer, { expanded: true });

    // --- Check timestamp ---
    const exifData = tags.exif;
    if (exifData) {
      const dateOriginal = exifData.DateTimeOriginal?.description;
      const dateDigitized = exifData.DateTimeDigitized?.description;
      const dateTime = exifData.DateTime?.description;
      const dateStr = dateOriginal || dateDigitized || dateTime;

      if (dateStr) {
        timestamp = parseExifDate(dateStr);
        hasTimestamp = true;

        if (timestamp) {
          const ageMs = Date.now() - timestamp.getTime();
          isFresh = ageMs >= 0 && ageMs <= MAX_PHOTO_AGE_MS;
          if (!isFresh) {
            const ageMinutes = Math.round(ageMs / 60000);
            if (ageMs < 0) {
              warnings.push('Photo timestamp is in the future — possible manipulation');
            } else {
              warnings.push(`Photo is ${ageMinutes} minutes old (max allowed: 5 min)`);
            }
          }
        }
      } else {
        warnings.push('No timestamp found — photo may be a screenshot or downloaded image');
      }

      // --- Check camera info ---
      const make = exifData.Make?.description;
      const model = exifData.Model?.description;
      const software = exifData.Software?.description;
      if (make || model) {
        isFromCamera = true;
      } else if (software) {
        // Screenshots often have software like "Paint", "Snipping Tool", etc.
        const suspiciousSoftware = ['paint', 'snip', 'screenshot', 'photoshop', 'gimp', 'canva'];
        const sw = software.toLowerCase();
        if (suspiciousSoftware.some(s => sw.includes(s))) {
          warnings.push(`Suspicious software detected: ${software}`);
        }
      } else {
        warnings.push('No camera info — may not be from a real camera');
      }
    } else {
      warnings.push('No EXIF data found — likely a screenshot, download, or edited image');
    }

    // --- Check GPS ---
    const gpsData = tags.gps;
    if (gpsData && gpsData.Latitude !== undefined && gpsData.Longitude !== undefined) {
      hasGPS = true;
      gps = {
        lat: gpsData.Latitude,
        lng: gpsData.Longitude,
      };
    } else {
      warnings.push('No GPS location — cannot verify where photo was taken');
    }

  } catch (err) {
    warnings.push('Failed to read EXIF data — file may be corrupted or stripped');
  }

  const isValid = hasTimestamp && isFresh && isFromCamera;

  let details: string;
  if (isValid && hasGPS) {
    details = 'Photo verified: fresh capture from camera with location data';
  } else if (isValid) {
    details = 'Photo verified: fresh capture from camera (no GPS)';
  } else if (!hasTimestamp && !isFromCamera) {
    details = 'Rejected: No EXIF metadata — likely downloaded or screenshot';
  } else if (!isFresh) {
    details = 'Rejected: Photo is too old — must be taken within 5 minutes';
  } else if (!isFromCamera) {
    details = 'Rejected: No camera signature — may not be an original photo';
  } else {
    details = 'Verification inconclusive';
  }

    return {
      isValid,
      isFresh,
      hasGPS,
      hasTimestamp,
      isFromCamera,
      timestamp,
      gps,
      warnings,
      details,
    };
  }

/**
 * Simulated Google Cloud Vision API verification
 * Shows "analyzing..." for 5 seconds then reports API credits exhausted
 * Falls back to EXIF-based verification
 */
export type VisionApiStatus = 'analyzing' | 'credits_exhausted' | 'fallback_verifying' | 'passed' | 'failed';

export interface VisionApiProgress {
  status: VisionApiStatus;
  message: string;
  progress: number; // 0-100
  exifResult?: ExifVerificationResult;
}

export function simulateVisionApiVerification(
  file: File,
  onProgress: (update: VisionApiProgress) => void
): { cancel: () => void; result: Promise<VisionApiProgress> } {
  let cancelled = false;
  const timers: NodeJS.Timeout[] = [];

  const result = new Promise<VisionApiProgress>((resolve) => {
    // Phase 1: Analyzing with Vision API (0-5s)
    onProgress({ status: 'analyzing', message: 'Connecting to Google Cloud Vision AI...', progress: 5 });

    timers.push(setTimeout(() => {
      if (cancelled) return;
      onProgress({ status: 'analyzing', message: 'Uploading image to Google Cloud Vision AI...', progress: 20 });
    }, 800));

    timers.push(setTimeout(() => {
      if (cancelled) return;
      onProgress({ status: 'analyzing', message: 'Running object detection & label analysis...', progress: 45 });
    }, 2200));

    timers.push(setTimeout(() => {
      if (cancelled) return;
      onProgress({ status: 'analyzing', message: 'Processing Vision AI response...', progress: 65 });
    }, 3800));

    // Phase 2: Credits exhausted (5s)
    timers.push(setTimeout(() => {
      if (cancelled) return;
      onProgress({
        status: 'credits_exhausted',
        message: 'Google Cloud Vision API: 429 RESOURCE_EXHAUSTED — Free tier quota exceeded. Switching to device-level verification...',
        progress: 70,
      });
    }, 5000));

    // Phase 3: EXIF fallback (6s)
    timers.push(setTimeout(async () => {
      if (cancelled) return;
      onProgress({ status: 'fallback_verifying', message: 'Verifying photo EXIF metadata (timestamp, GPS, device)...', progress: 85 });

      const exifResult = await verifyImageEXIF(file);

      if (cancelled) return;

      const final: VisionApiProgress = exifResult.isValid
        ? {
            status: 'passed',
            message: 'Photo verified via device metadata. ' + exifResult.details,
            progress: 100,
            exifResult,
          }
        : {
            status: 'failed',
            message: exifResult.details,
            progress: 100,
            exifResult,
          };

      onProgress(final);
      resolve(final);
    }, 7000));
  });

  return {
    cancel: () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    },
    result,
  };
}
