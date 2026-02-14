import { User, DailyLog } from '@/types';

const STORAGE_KEY = 'greenledger_user';

export function saveUser(user: User): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  } catch (error) {
    console.error('Failed to save user data:', error);
  }
}

export function loadUser(): User | null {
  if (typeof window === 'undefined') return null;
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return null;
    
    const user = JSON.parse(data) as User;
    user.createdAt = new Date(user.createdAt);
    return user;
  } catch (error) {
    console.error('Failed to load user data:', error);
    return null;
  }
}

export function clearUser(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear user data:', error);
  }
}

export function addDailyLog(user: User, log: DailyLog): User {
  const existingLogIndex = user.dailyLogs.findIndex(l => l.date === log.date);
  
  if (existingLogIndex >= 0) {
    // Merge with existing log
    const existingLog = user.dailyLogs[existingLogIndex];
    user.dailyLogs[existingLogIndex] = {
      date: log.date,
      ringChanges: {
        circularity: existingLog.ringChanges.circularity + log.ringChanges.circularity,
        consumption: existingLog.ringChanges.consumption + log.ringChanges.consumption,
        mobility: existingLog.ringChanges.mobility + log.ringChanges.mobility
      },
      IQChange: existingLog.IQChange + log.IQChange,
      modes: [...new Set([...existingLog.modes, ...log.modes])],
      verified: existingLog.verified || log.verified
    };
  } else {
    user.dailyLogs.push(log);
  }
  
  return user;
}

export function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}

export function getLogsForDateRange(user: User, days: number): DailyLog[] {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return user.dailyLogs.filter(log => {
    const logDate = new Date(log.date);
    return logDate >= startDate && logDate <= endDate;
  });
}
