import { apiClient } from '../api/client';
import { VitalResponse } from '../types/api';

export const getLatestVital = () =>
  apiClient.get<VitalResponse>('/vitals/latest');

export const getVitals = (limit = 20) =>
  apiClient.get<VitalResponse[]>(`/vitals?limit=${limit}`);

export const logVital = (data: {
  heart_rate?: number;
  systolic_bp?: number;
  diastolic_bp?: number;
  glucose_level?: number;
  spo2?: number;
  steps?: number;
  sleep_hours?: number;
  weight_kg?: number;
  source?: string;
}) => apiClient.post<VitalResponse>('/vitals', data);