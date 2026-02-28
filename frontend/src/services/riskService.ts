// src/services/riskService.ts

import apiClient from './apiClient';
import { RiskPrediction } from '../types/api';

export async function predictRisk(payload: any): Promise<RiskPrediction> {
  try {
    const res = await apiClient.post<RiskPrediction>('/risk/predict', payload);
    return res.data;
  } catch (err) {
    console.error('predictRisk error', err);
    throw err;
  }
}

export async function getRiskHistory(): Promise<RiskPrediction[]> {
  try {
    const res = await apiClient.get<RiskPrediction[]>('/risk/history');
    return res.data;
  } catch (err) {
    console.error('getRiskHistory error', err);
    throw err;
  }
}
