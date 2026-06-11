import client from './client';
import type { ChatMessage } from '@/types';

export const chatApi = {
  sendMessage: async (
    userId: string,
    content: string,
  ): Promise<ChatMessage> => {
    const { data } = await client.post<ChatMessage>('/chat/message', {
      userId,
      content,
    });
    return data;
  },

  getHistory: async (userId: string): Promise<ChatMessage[]> => {
    const { data } = await client.get<ChatMessage[]>(
      `/chat/history/${userId}`,
    );
    return data;
  },
};
