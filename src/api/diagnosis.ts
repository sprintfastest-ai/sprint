import client from './client';
import type { Diagnosis } from '@/types';

interface DiagnosisPayload {
  athleteId: string;
  timeTrial20m: number;
  timeTrial60m: number;
  timeTrial200m: number;
}

export const diagnosisApi = {
  runDiagnosis: async (payload: DiagnosisPayload): Promise<Diagnosis> => {
    const { data } = await client.post<Diagnosis>('/diagnosis', payload);
    return data;
  },

  getDiagnosisHistory: async (athleteId: string): Promise<Diagnosis[]> => {
    const { data } = await client.get<Diagnosis[]>(
      `/athletes/${athleteId}/diagnoses`,
    );
    return data;
  },
};
