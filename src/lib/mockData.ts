import { User, DailyLog, LeaderboardUser, TierLevel } from '@/types';

function getTierFromValue(iq: number): TierLevel {
  if (iq >= 90) return 'Vanguard';
  if (iq >= 75) return 'Progressive';
  if (iq >= 60) return 'Aligned';
  if (iq >= 40) return 'Aware';
  return 'FND';
}

export function createDemoUser(): User {
  return {
    id: 'demo-user-001',
    baseline: {
      commuteType: 'public',
      clothingFrequency: 'conscious',
      dietType: 'flexitarian',
      city: 'Bengaluru'
    },
    IQ: 0,
    tier: 'FND',
    rings: {
      circularity: 0,
      consumption: 0,
      mobility: 0
    },
    dailyLogs: [],
    createdAt: new Date(),
    photoGallery: [],
    isDemo: true
  };
}

export function generateLeaderboard(currentUserCity: string, currentUserId: string): LeaderboardUser[] {
  // No fake leaderboard data — only the current user
  return [{
    id: currentUserId,
    rank: 1,
    city: currentUserCity,
    IQ: 0,
    tier: 'FND',
    percentile: 0,
    isCurrentUser: true
  }];
}

export function getIQHistoryData(user: User, days: number = 30): Array<{ date: string; iq: number }> {
  const data: Array<{ date: string; iq: number }> = [];

  let currentIQ = user.IQ;
  const logsByDate = new Map(user.dailyLogs.map(l => [l.date, l]));

  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    const log = logsByDate.get(dateStr);
    if (log && i > 0) {
      currentIQ = Math.max(0, currentIQ - log.IQChange);
    }

    data.push({
      date: dateStr,
      iq: Math.round(currentIQ * 10) / 10
    });
  }

  return data.reverse();
}
