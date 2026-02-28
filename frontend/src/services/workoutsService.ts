// src/services/workoutsService.ts

import apiClient from './apiClient';
import { WorkoutPlan } from '../types/api';

export async function generateWorkoutPlan(payload: any): Promise<WorkoutPlan> {
  try {
    const res = await apiClient.post<WorkoutPlan>('/workouts/generate', payload);
    return res.data;
  } catch (err) {
    console.error('generateWorkoutPlan error', err);
    throw err;
  }
}
