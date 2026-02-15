'use client';

/**
 * Opens an external URL safely across Web and Capacitor (Android).
 *
 * On Capacitor (Android WebView), `target="_blank"` links either
 * fail silently or get blocked. This utility uses the Capacitor
 * Browser plugin when available, falling back to `window.open()`.
 */
export async function openExternalUrl(url: string): Promise<void> {
  try {
    // Try Capacitor Browser plugin first (works on native)
    const { Browser } = await import('@capacitor/browser');
    await Browser.open({ url, windowName: '_system' });
    return;
  } catch {
    // Fallback: plain window.open (works on web)
  }

  // Fallback for web or if Capacitor Browser is unavailable
  if (typeof window !== 'undefined') {
    window.open(url, '_system') || window.open(url, '_blank');
  }
}
