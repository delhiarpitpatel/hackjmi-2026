import { apiClient } from '../api/client';
import { WorkoutPlan } from '../types/api';

export const generateWorkoutPlan = (data: {
  conditions?: string[];
  fitness_level?: string;
  available_equipment?: string[];
  duration_minutes?: number;
}) =>
  apiClient.post<WorkoutPlan>('/workouts/generate', {
    fitness_level: 'beginner',
    duration_minutes: 20,
    ...data,
  });
