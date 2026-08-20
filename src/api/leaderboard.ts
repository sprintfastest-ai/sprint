import client from './client';

type ApiResponse<T> = { data: T };

export interface LeaderboardEntry {
  athleteId: string;
  displayName: string;
  consistencyRank: number;
  streakRank: number;
  pbImprovementRank: number;
  sessionsThisWeek: number;
  streakCount: number;
  pbImprovementCount: number;
  isSelf: boolean;
}

export interface LeaderboardResponse {
  ageGroup: string;
  weekStartDate: string;
  entries: LeaderboardEntry[];
}

export const leaderboardApi = {
  getMyLeaderboard: async (): Promise<LeaderboardResponse> => {
    const { data } = await client.get<ApiResponse<LeaderboardResponse>>('/athletes/leaderboard');
    return data.data;
  },
};
