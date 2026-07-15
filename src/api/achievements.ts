import client from './client';
import type { Achievement } from '@/types';

type ApiResponse<T> = { data: T };

export const achievementsApi = {
  getAchievements: async (athleteId: string): Promise<Achievement[]> => {
    const { data } = await client.get<ApiResponse<Achievement[]>>(
      `/athletes/${athleteId}/achievements`,
    );
    return data.data;
  },
};
