import { apiClient } from '../api/client';
import { RiskPrediction } from '../types/api';

export const getRiskHistory = () =>
  apiClient.get<RiskPrediction[]>('/risk/history');

export const predictRisk = (riskType: 'fall' | 'cardiac' | 'diabetic') =>
  apiClient.post<RiskPrediction>('/risk/predict', { risk_type: riskType });