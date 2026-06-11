import client, { STORAGE_KEYS } from './client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { User } from '@/types';

interface LoginPayload {
  email: string;
  password: string;
}

interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

interface RegisterPayload extends LoginPayload {
  role: User['role'];
}

export const authApi = {
  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const { data } = await client.post<AuthResponse>('/auth/login', payload);
    await AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, data.accessToken);
    await AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, data.refreshToken);
    return data;
  },

  register: async (payload: RegisterPayload): Promise<AuthResponse> => {
    const { data } = await client.post<AuthResponse>(
      '/auth/register',
      payload,
    );
    await AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, data.accessToken);
    await AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, data.refreshToken);
    return data;
  },

  logout: async (): Promise<void> => {
    await client.post('/auth/logout');
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.ACCESS_TOKEN,
      STORAGE_KEYS.REFRESH_TOKEN,
    ]);
  },

  me: async (): Promise<User> => {
    const { data } = await client.get<User>('/auth/me');
    return data;
  },
};
