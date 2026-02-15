import { supabase } from './supabase';
import { User, DailyLog } from '@/types';

// Sync user data to Supabase when online
export async function syncUserToCloud(user: User, email: string, passwordHash: string): Promise<boolean> {
  if (!supabase || !navigator.onLine) return false;

    try {
      // First check if user exists in cloud by email
      const { data: existing } = await supabase.from('users').select('id').eq('email', email).single();
      const cloudId = existing?.id || user.id;

      const payload = {
        id: cloudId,
        email,
        password_hash: passwordHash,
        baseline_commute_type: user.baseline.commuteType,
        baseline_clothing_frequency: user.baseline.clothingFrequency,
        baseline_diet_type: user.baseline.dietType,
        baseline_city: user.baseline.city,
        iq: user.IQ,
        tier: user.tier,
        ring_circularity: user.rings.circularity,
        ring_consumption: user.rings.consumption,
        ring_mobility: user.rings.mobility,
        photo_gallery: user.photoGallery,
        is_demo: user.isDemo,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from('users').upsert(payload, { onConflict: 'id' });

      if (error) { console.error('Sync user error:', error); return false; }

      // Sync daily logs
      if (user.dailyLogs.length > 0) {
        const logs = user.dailyLogs.map(log => ({
          user_id: cloudId,
          date: log.date,
          ring_change_circularity: log.ringChanges.circularity,
          ring_change_consumption: log.ringChanges.consumption,
          ring_change_mobility: log.ringChanges.mobility,
          iq_change: log.IQChange,
          modes: log.modes,
          verified: log.verified,
        }));

        const { error: logError } = await supabase.from('daily_logs').upsert(logs, {
          onConflict: 'user_id,date',
        });

        if (logError) console.error('Sync logs error:', logError);
      }

    return true;
  } catch (e) {
    console.error('Sync failed:', e);
    return false;
  }
}

// Pull user data from Supabase (for login on new device)
export async function pullUserFromCloud(email: string, passwordHash: string): Promise<User | null> {
  if (!supabase || !navigator.onLine) return null;

  try {
    const { data: row, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .eq('password_hash', passwordHash)
      .single();

    if (error || !row) return null;

    // Fetch daily logs
    const { data: logs } = await supabase
      .from('daily_logs')
      .select('*')
      .eq('user_id', row.id)
      .order('date', { ascending: true });

    const dailyLogs: DailyLog[] = (logs || []).map((l: Record<string, unknown>) => ({
      date: l.date as string,
      ringChanges: {
        circularity: l.ring_change_circularity as number,
        consumption: l.ring_change_consumption as number,
        mobility: l.ring_change_mobility as number,
      },
      IQChange: l.iq_change as number,
      modes: l.modes as string[],
      verified: l.verified as boolean,
    }));

    return {
      id: row.id,
      baseline: {
        commuteType: row.baseline_commute_type || '',
        clothingFrequency: row.baseline_clothing_frequency || '',
        dietType: row.baseline_diet_type || '',
        city: row.baseline_city || '',
      },
      IQ: row.iq,
      tier: row.tier,
      rings: {
        circularity: row.ring_circularity,
        consumption: row.ring_consumption,
        mobility: row.ring_mobility,
      },
      dailyLogs,
      createdAt: new Date(row.created_at),
      photoGallery: row.photo_gallery || [],
      isDemo: row.is_demo,
    };
  } catch (e) {
    console.error('Pull from cloud failed:', e);
    return null;
  }
}

// Background sync — call after any local save
export function scheduleSyncToCloud(user: User, email: string, passwordHash: string) {
  if (!navigator.onLine) {
    // Listen for when we come back online
    const handler = () => {
      syncUserToCloud(user, email, passwordHash);
      window.removeEventListener('online', handler);
    };
    window.addEventListener('online', handler);
    return;
  }
  // Fire and forget
  syncUserToCloud(user, email, passwordHash);
}
