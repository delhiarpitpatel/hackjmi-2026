// ── Auth ──────────────────────────────────────────────────────────────────────
export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

// ── User ──────────────────────────────────────────────────────────────────────
export interface UserResponse {
  id: string;
  full_name: string;
  phone: string;
  email: string | null;
  date_of_birth: string | null;
  gender: string | null;
  language: string;
  mobility_level: string;
  biometric_enrolled: boolean;
  font_size: number;
  high_contrast: boolean;
  voice_enabled: boolean;
  is_active: boolean;
  created_at: string;
}

// ── Vitals ────────────────────────────────────────────────────────────────────
export interface VitalResponse {
  id: string;
  user_id: string;
  recorded_at: string;
  source: string;
  heart_rate: string | null;
  systolic_bp: string | null;
  diastolic_bp: string | null;
  glucose_level: string | null;
  spo2: string | null;
  weight_kg: string | null;
  steps: string | null;
  sleep_hours: string | null;
  temperature_c: string | null;
}

// ── Chat ──────────────────────────────────────────────────────────────────────
export interface ChatMessage {
  id: string;
  session_id: string;
  message_id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  // legacy fields used in ChatView
  sender?: string;
  text?: string;
}

export interface ChatHistoryResponse {
  session_id: string;
  messages: ChatMessage[];
}

// ── Diet ──────────────────────────────────────────────────────────────────────
export interface MealItem {
  name: string;
  quantity: string;
  calories: number;
  protein_g?: number;
  carbs_g?: number;
  fat_g?: number;
  sodium_mg?: number;
}

export interface MealPlanResponse {
  id: string;
  user_id: string;
  date: string;
  meal_type: string;
  items: MealItem[];
  total_calories: number | null;
  total_protein_g: number | null;
  total_carbs_g: number | null;
  total_fat_g: number | null;
  sodium_mg: number | null;
  generated_by: string;
  created_at: string;
}

// Legacy shape used in DietView/DietContainer
export interface MealPlan {
  meals: { mealType: string; items: string[] }[];
}

// ── Medications ───────────────────────────────────────────────────────────────
export interface Medication {
  id: string;
  user_id: string;
  name: string;
  dosage: string;
  frequency: string;
  times: string[] | null;
  with_food: boolean;
  is_active: boolean;
  created_at: string;
}

// ── Risk ──────────────────────────────────────────────────────────────────────
export interface RiskPrediction {
  id: string;
  user_id: string;
  risk_type: string;
  score: number;
  risk_level: string;
  model_used: string;
  model_version: string;
  prediction_window_days: number;
  feature_snapshot: Record<string, unknown> | null;
  computed_at: string;
  // legacy fields
  type?: string;
}

// ── Emergency ─────────────────────────────────────────────────────────────────
export interface EmergencyEvent {
  id: string;
  user_id: string;
  trigger_method: string;
  latitude: number | null;
  longitude: number | null;
  status: string;
  police_notified: boolean;
  family_notified: boolean;
  dispatch_ref: string | null;
  triggered_at: string;
  resolved_at: string | null;
}

export interface EmergencyContact {
  id: string;
  name: string;
  relation: string;
  phone: string;
  is_primary: boolean;
  notify_on_sos: boolean;
}

// ── Workouts ──────────────────────────────────────────────────────────────────
export interface WorkoutExercise {
  name: string;
  duration_minutes: number;
  reps?: number;
  sets?: number;
  instructions: string;
  modifications?: string;
}

export interface WorkoutPlan {
  date: string;
  fitness_level: string;
  total_duration_minutes: number;
  exercises: WorkoutExercise[];
  fitt_vp_notes: string;
  generated_by: string;
}

// ── Users (legacy shape used in UsersView) ────────────────────────────────────
export interface User {
  id: string;
  name: string;          // mapped from full_name
  full_name: string;
  phone: string;
  email: string | null;
  mobility_level: string;
  biometric_enrolled: boolean;
  language: string;
}

// ── Wearables ─────────────────────────────────────────────────────────────────
export interface WearableProvider {
  id: string;
  name: string;
}

export interface ConnectedWearable {
  id: string;
  provider: string;
  deviceName: string;    // mapped from provider for display
  connected_at: string;
  expires_at: string | null;
}
