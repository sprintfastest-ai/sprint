import client from './client';
import type { ChatMessage } from '@/types';

type ApiResponse<T> = { data: T };

export const chatApi = {
  sendMessage: async (content: string): Promise<ChatMessage> => {
    const { data } = await client.post<ApiResponse<ChatMessage>>('/chat/message', { content });
    return data.data;
  },

  getHistory: async (): Promise<ChatMessage[]> => {
    const { data } = await client.get<ApiResponse<ChatMessage[]>>('/chat/history');
    return data.data;
  },
};
