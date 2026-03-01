import { apiClient } from '../api/client';
import { MealPlan, MealPlanResponse } from '../types/api';

// Convert backend response array → legacy MealPlan shape used in DietView
function toMealPlan(plans: MealPlanResponse[]): MealPlan {
  return {
    meals: plans.map(p => ({
      mealType: p.meal_type,
      items: p.items.map(i => `${i.name} (${i.quantity})`),
    })),
  };
}

export async function getMealPlan(date: string): Promise<MealPlan> {
  const data = await apiClient.get<MealPlanResponse[]>(`/diet/${date}`);
  return toMealPlan(data);
}

export async function generateMealPlan(
  date: string,
  conditions: string[] = [],
): Promise<MealPlan> {
  const data = await apiClient.post<MealPlanResponse[]>('/diet/generate', {
    date,
    conditions,
  });
  return toMealPlan(data);
}