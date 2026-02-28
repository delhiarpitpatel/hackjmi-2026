// src/services/wearablesService.ts

import apiClient from './apiClient';
import { WearableProvider, ConnectedWearable } from '../types/api';

export async function getProviders(): Promise<WearableProvider[]> {
  try {
    const res = await apiClient.get<WearableProvider[]>('/wearables/providers');
    return res.data;
  } catch (err) {
    console.error('getProviders error', err);
    throw err;
  }
}

export async function connectWearable(payload: any): Promise<ConnectedWearable> {
  try {
    const res = await apiClient.post<ConnectedWearable>('/wearables/connect', payload);
    return res.data;
  } catch (err) {
    console.error('connectWearable error', err);
    throw err;
  }
}

export async function listWearables(): Promise<ConnectedWearable[]> {
  try {
    const res = await apiClient.get<ConnectedWearable[]>('/wearables');
    return res.data;
  } catch (err) {
    console.error('listWearables error', err);
    throw err;
  }
}

export async function disconnectWearable(id: string): Promise<void> {
  try {
    await apiClient.delete(`/wearables/${id}`);
  } catch (err) {
    console.error('disconnectWearable error', err);
    throw err;
  }
}
