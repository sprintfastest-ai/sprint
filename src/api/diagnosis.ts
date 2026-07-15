import client from './client';
import type { Diagnosis } from '@/types';

type ApiResponse<T> = { data: T };

interface DiagnosisPayload {
  athleteId: string;
  timeTrial20m: number;
  timeTrial60m: number;
  timeTrial200m: number;
  answers?: Record<string, unknown>;
}

export const diagnosisApi = {
  runDiagnosis: async (payload: DiagnosisPayload): Promise<Diagnosis> => {
    const { data } = await client.post<ApiResponse<Diagnosis>>('/athletes/diagnosis', payload, {
      timeout: 120_000, // Gemini can take 30-60s
    });
    return data.data;
  },

  getDiagnosisHistory: async (athleteId: string): Promise<Diagnosis[]> => {
    const { data } = await client.get<ApiResponse<Diagnosis[]>>(
      `/athletes/${athleteId}/diagnoses`,
    );
    return data.data;
  },
};
