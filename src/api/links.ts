import client from './client';

type ApiResponse<T> = { data: T };

export const linksApi = {
  createInvite: async (athleteId: string, relationship: 'parent' | 'coach'): Promise<{ code: string; expiresAt: string }> => {
    const { data } = await client.post<ApiResponse<{ code: string; expiresAt: string }>>(
      `/athletes/${athleteId}/invites`,
      { relationship },
    );
    return data.data;
  },

  redeemInvite: async (code: string): Promise<{ linked: boolean }> => {
    const { data } = await client.post<ApiResponse<{ linked: boolean }>>('/invites/redeem', { code });
    return data.data;
  },
};
