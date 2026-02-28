// src/services/dietService.ts

import apiClient from './apiClient';
import { MealPlan } from '../types/api';

export async function generateMealPlan(payload: any): Promise<MealPlan> {
  try {
    const res = await apiClient.post<MealPlan>('/diet/generate', payload);
    return res.data;
  } catch (err) {
    console.error('generateMealPlan error', err);
    throw err;
  }
}

export async function getMealPlan(date: string): Promise<MealPlan> {
  try {
    const res = await apiClient.get<MealPlan>(`/diet/${date}`);
    return res.data;
  } catch (err) {
    console.error('getMealPlan error', err);
    throw err;
  }
}
