// src/services/userService.ts

import apiClient from './apiClient';
import { User } from '../types/api';

export async function getProfile(): Promise<User> {
  try {
    const res = await apiClient.get<User>('/users/me');
    return res.data;
  } catch (err) {
    console.error('getProfile error', err);
    throw err;
  }
}

export async function updateProfile(payload: Partial<User>): Promise<User> {
  try {
    const res = await apiClient.patch<User>('/users/me', payload);
    return res.data;
  } catch (err) {
    console.error('updateProfile error', err);
    throw err;
  }
}

export async function deactivateAccount(): Promise<void> {
  try {
    await apiClient.delete('/users/me');
  } catch (err) {
    console.error('deactivateAccount error', err);
    throw err;
  }
}
