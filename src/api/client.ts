import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const STORAGE_KEYS = {
  ACCESS_TOKEN: '@sprintfastest:access_token',
  REFRESH_TOKEN: '@sprintfastest:refresh_token',
} as const;

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ?? 'https://sprintfastest-api.onrender.com/api/v1';

const APP_VERSION = '1.0.0';

// Registered by RootNavigator — called when a forced sign-out occurs (refresh
// token expired / revoked) so the app can navigate back to the auth stack.
let _onSignOut: (() => void) | null = null;
export function setOnSignOut(cb: () => void): void {
  _onSignOut = cb;
}

const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60_000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'X-App-Version': APP_VERSION,
  },
});

client.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: string) => void;
  reject: (reason: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token as string);
    }
  });
  failedQueue = [];
};

client.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return client(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await AsyncStorage.getItem(
          STORAGE_KEYS.REFRESH_TOKEN,
        );
        if (!refreshToken) throw new Error('No refresh token stored');
        const response = await axios.post<{
          success: boolean;
          data: { accessToken: string; refreshToken: string };
        }>(`${API_BASE_URL}/auth/refresh`, { refreshToken });
        const { accessToken, refreshToken: newRefreshToken } = response.data.data;
        if (!accessToken) throw new Error('Refresh returned no access token');
        await AsyncStorage.multiSet([
          [STORAGE_KEYS.ACCESS_TOKEN, accessToken],
          [STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken],
        ]);
        processQueue(null, accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return client(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        await AsyncStorage.multiRemove([
          STORAGE_KEYS.ACCESS_TOKEN,
          STORAGE_KEYS.REFRESH_TOKEN,
        ]);
        _onSignOut?.();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default client;
