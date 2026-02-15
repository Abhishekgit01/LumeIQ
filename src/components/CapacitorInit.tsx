'use client';

import { useEffect } from 'react';

export function CapacitorInit() {
  useEffect(() => {
    // Ensure Capacitor bridge is initialized on native
    if (typeof window !== 'undefined' && (window as any).Capacitor) {
      console.log('[CapacitorInit] Running on native platform:', (window as any).Capacitor.getPlatform());
    }
  }, []);

  return null;
}
