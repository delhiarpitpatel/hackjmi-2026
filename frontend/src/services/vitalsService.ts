// src/services/vitalsService.ts

import apiClient from './apiClient';
import { VitalReading, VitalHistory } from '../types/api';

export async function logVital(reading: Omit<VitalReading, 'id' | 'timestamp'>): Promise<VitalReading> {
  try {
    const res = await apiClient.post<VitalReading>('/vitals', reading);
    return res.data;
  } catch (err) {
    console.error('logVital error', err);
    throw err;
  }
}

export async function getVitalsHistory(): Promise<VitalHistory> {
  try {
    const res = await apiClient.get<VitalHistory>('/vitals');
    return res.data;
  } catch (err) {
    console.error('getVitalsHistory error', err);
    throw err;
  }
}

export async function getLatestVital(): Promise<VitalReading> {
  try {
    const res = await apiClient.get<VitalReading>('/vitals/latest');
    return res.data;
  } catch (err) {
    console.error('getLatestVital error', err);
    throw err;
  }
}
