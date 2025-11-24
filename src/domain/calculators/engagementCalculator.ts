export interface DailyEngagementData {
  date: string;
  activeUsers: number;
  totalUsers: number;
  engagementPercentage: number;
}

export interface EngagementAccumulator {
  dailyEngagement: Map<string, Set<number>>;
  allUniqueUsers: Set<number>;
}

export function createEngagementAccumulator(): EngagementAccumulator {
  return {
    dailyEngagement: new Map(),
    allUniqueUsers: new Set(),
  };
}

export function accumulateEngagement(
  accumulator: EngagementAccumulator,
  date: string,
  userId: number
): void {
  accumulator.allUniqueUsers.add(userId);

  if (!accumulator.dailyEngagement.has(date)) {
    accumulator.dailyEngagement.set(date, new Set());
  }
  accumulator.dailyEngagement.get(date)!.add(userId);
}

export function computeEngagementData(
  accumulator: EngagementAccumulator
): DailyEngagementData[] {
  const totalUsers = accumulator.allUniqueUsers.size;

  return Array.from(accumulator.dailyEngagement.entries())
    .map(([date, activeUsersSet]) => ({
      date,
      activeUsers: activeUsersSet.size,
      totalUsers,
      engagementPercentage: totalUsers > 0
        ? Math.round((activeUsersSet.size / totalUsers) * 100 * 100) / 100
        : 0
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}
