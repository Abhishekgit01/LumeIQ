/**
 * LumeIQ Event Dispatcher
 * ─────────────────────────────────────────────
 * Central event bus for all IQ-modifying actions.
 * All modules communicate through this dispatcher.
 * Impact Quotient is recalculated via a unified update function.
 *
 * DOES NOT modify existing IQ engine — extends via event-based updates.
 */

import {
  ImpactEvent,
  ImpactEventType,
  SyncQueueItem,
} from '@/types/extensions';
import { RingValues } from '@/types';

// ─── Event Listeners ───
type EventListener = (event: ImpactEvent) => void;

const listeners: Map<ImpactEventType, EventListener[]> = new Map();
const globalListeners: EventListener[] = [];

// ─── Storage Keys ───
const EVENT_LOG_KEY = 'lumeiq_impact_events';
const SYNC_QUEUE_KEY = 'lumeiq_sync_queue';

// ─── Generate ID ───
function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// ─── Subscribe to specific event type ───
export function onImpactEvent(type: ImpactEventType, listener: EventListener): () => void {
  const existing = listeners.get(type) || [];
  existing.push(listener);
  listeners.set(type, existing);

  return () => {
    const arr = listeners.get(type) || [];
    listeners.set(type, arr.filter(l => l !== listener));
  };
}

// ─── Subscribe to ALL events ───
export function onAnyImpactEvent(listener: EventListener): () => void {
  globalListeners.push(listener);
  return () => {
    const idx = globalListeners.indexOf(listener);
    if (idx >= 0) globalListeners.splice(idx, 1);
  };
}

// ─── Dispatch an impact event ───
export function dispatchImpactEvent(
  type: ImpactEventType,
  userId: string,
  payload: ImpactEvent['payload']
): ImpactEvent {
  const event: ImpactEvent = {
    id: generateId(),
    type,
    userId,
    timestamp: new Date().toISOString(),
    payload,
    processed: false,
  };

  // Persist event log
  persistEvent(event);

  // Add to sync queue
  addToSyncQueue('create', 'impact_events', event as unknown as Record<string, unknown>);

  // Notify type-specific listeners
  const typeListeners = listeners.get(type) || [];
  for (const listener of typeListeners) {
    try {
      listener(event);
    } catch (error) {
      console.error(`[EventDispatcher] Listener error for ${type}:`, error);
    }
  }

  // Notify global listeners
  for (const listener of globalListeners) {
    try {
      listener(event);
    } catch (error) {
      console.error(`[EventDispatcher] Global listener error:`, error);
    }
  }

  return event;
}

// ─── Persist event to localStorage ───
function persistEvent(event: ImpactEvent): void {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(EVENT_LOG_KEY);
    const events: ImpactEvent[] = raw ? JSON.parse(raw) : [];
    events.push(event);
    // Keep only last 500 events
    const trimmed = events.slice(-500);
    localStorage.setItem(EVENT_LOG_KEY, JSON.stringify(trimmed));
  } catch (error) {
    console.error('[EventDispatcher] Failed to persist event:', error);
  }
}

// ─── Get event history ───
export function getEventHistory(userId?: string, type?: ImpactEventType): ImpactEvent[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(EVENT_LOG_KEY);
    let events: ImpactEvent[] = raw ? JSON.parse(raw) : [];
    if (userId) events = events.filter(e => e.userId === userId);
    if (type) events = events.filter(e => e.type === type);
    return events;
  } catch {
    return [];
  }
}

// ─── Clear events ───
export function clearEventHistory(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(EVENT_LOG_KEY);
}

// ─── Sync Queue ───
export function addToSyncQueue(
  action: SyncQueueItem['action'],
  table: string,
  data: Record<string, unknown>
): void {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(SYNC_QUEUE_KEY);
    const queue: SyncQueueItem[] = raw ? JSON.parse(raw) : [];
    queue.push({
      id: generateId(),
      action,
      table,
      data,
      createdAt: new Date().toISOString(),
      synced: false,
      retryCount: 0,
    });
    // Keep only unsynced + last 200
    const trimmed = queue.filter(q => !q.synced).slice(-200);
    localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(trimmed));
  } catch (error) {
    console.error('[SyncQueue] Failed to add item:', error);
  }
}

// ─── Get pending sync items ───
export function getPendingSyncItems(): SyncQueueItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(SYNC_QUEUE_KEY);
    const queue: SyncQueueItem[] = raw ? JSON.parse(raw) : [];
    return queue.filter(q => !q.synced && q.retryCount < 5);
  } catch {
    return [];
  }
}

// ─── Mark synced ───
export function markSynced(itemId: string): void {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(SYNC_QUEUE_KEY);
    const queue: SyncQueueItem[] = raw ? JSON.parse(raw) : [];
    const item = queue.find(q => q.id === itemId);
    if (item) item.synced = true;
    localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
  } catch (error) {
    console.error('[SyncQueue] Failed to mark synced:', error);
  }
}

// ─── Process sync queue (call periodically) ───
export async function processSyncQueue(
  syncFn: (item: SyncQueueItem) => Promise<boolean>
): Promise<{ synced: number; failed: number }> {
  const pending = getPendingSyncItems();
  let synced = 0;
  let failed = 0;

  for (const item of pending) {
    try {
      const success = await syncFn(item);
      if (success) {
        markSynced(item.id);
        synced++;
      } else {
        incrementRetry(item.id);
        failed++;
      }
    } catch {
      incrementRetry(item.id);
      failed++;
    }
  }

  return { synced, failed };
}

function incrementRetry(itemId: string): void {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(SYNC_QUEUE_KEY);
    const queue: SyncQueueItem[] = raw ? JSON.parse(raw) : [];
    const item = queue.find(q => q.id === itemId);
    if (item) item.retryCount++;
    localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
  } catch {}
}

// ─── Unified IQ Update Calculator ───
// Aggregates all ring changes from an event and returns the delta
export function calculateEventIQDelta(
  ringChanges: RingValues,
  currentIQ: number,
  verified: boolean = false
): { iqDelta: number; newRingChanges: RingValues } {
  // Weight factors (same as existing engine)
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

  // Use tier-based K value
  const k = currentIQ >= 90 ? 0.035
    : currentIQ >= 75 ? 0.035
    : currentIQ >= 60 ? 0.035
    : currentIQ >= 40 ? 0.07
    : 0.12;

  let iqDelta = (100 - currentIQ) * (1 - Math.exp(-k * BPI));
  iqDelta = Math.min(iqDelta, 6); // Cap at +6

  if (verified) iqDelta *= 1.15;

  iqDelta = Math.round(iqDelta * 10) / 10;

  return { iqDelta, newRingChanges: ringChanges };
}
