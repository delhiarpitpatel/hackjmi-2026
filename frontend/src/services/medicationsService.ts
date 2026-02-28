// src/services/medicationsService.ts

import apiClient from './apiClient';
import { Medication } from '../types/api';

export async function addMedication(payload: any): Promise<Medication> {
  try {
    const res = await apiClient.post<Medication>('/medications', payload);
    return res.data;
  } catch (err) {
    console.error('addMedication error', err);
    throw err;
  }
}

export async function listMedications(): Promise<Medication[]> {
  try {
    const res = await apiClient.get<Medication[]>('/medications');
    return res.data;
  } catch (err) {
    console.error('listMedications error', err);
    throw err;
  }
}

export async function removeMedication(id: string): Promise<void> {
  try {
    await apiClient.delete(`/medications/${id}`);
  } catch (err) {
    console.error('removeMedication error', err);
    throw err;
  }
}
