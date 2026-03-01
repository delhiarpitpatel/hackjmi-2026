import { api, setToken } from "./client";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api/v1";

// ── Response Types ─────────────────────────────────────────────────────────────

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

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

export interface MealItem {
  name: string;
  quantity: string;
  calories: number;
  protein_g?: number;
  carbs_g?: number;
  fat_g?: number;
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

export interface WorkoutExercise {
  name: string;
  duration_minutes: number;
  reps?: number;
  sets?: number;
  instructions: string;
  modifications?: string;
}

export interface WorkoutPlanResponse {
  date: string;
  fitness_level: string;
  total_duration_minutes: number;
  exercises: WorkoutExercise[];
  fitt_vp_notes: string;
  generated_by: string;
}

export interface MedicationResponse {
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

export interface RiskScoreResponse {
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
}

export interface ChatMessageResponse {
  session_id: string;
  message_id: string;
  role: string;
  content: string;
  timestamp: string;
}

export interface SOSResponse {
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

export interface EmergencyContactResponse {
  id: string;
  name: string;
  relation: string;
  phone: string;
  is_primary: boolean;
  notify_on_sos: boolean;
}

export interface TravelMatchResponse {
  user_id: string;
  full_name: string;
  mobility_level: string;
  preferred_destinations: string[] | null;
  preferred_travel_months: number[] | null;
  budget_per_day: number | null;
  companions_needed: number;
  match_score: number;
}

// ── Auth ───────────────────────────────────────────────────────────────────────

export async function register(
  fullName: string,
  phone: string,
  password: string,
  language = "en",
): Promise<TokenResponse> {
  const res = await api.post<TokenResponse>("/auth/register", {
    full_name: fullName,
    phone,
    password,
    language,
  });
  setToken(res.access_token);
  return res;
}

export async function login(
  phone: string,
  password: string,
): Promise<TokenResponse> {
  // OAuth2 requires form encoding, not JSON
  const form = new URLSearchParams();
  form.append("username", phone);
  form.append("password", password);

  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: form,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Login failed" }));
    throw new Error(err.detail ?? "Login failed");
  }

  const data: TokenResponse = await res.json();
  setToken(data.access_token);
  return data;
}

export async function refreshToken(
  refreshTkn: string,
): Promise<TokenResponse> {
  const res = await api.post<TokenResponse>("/auth/refresh", {
    refresh_token: refreshTkn,
  });
  setToken(res.access_token);
  return res;
}

export const aadhaarVerify = (
  aadhaarNumber: string,
  faceImageB64: string,
) =>
  api.post<{ verified: boolean; confidence: number; biometric_enrolled: boolean }>(
    "/auth/aadhaar-verify",
    { aadhaar_number: aadhaarNumber, face_image_b64: faceImageB64 },
  );

// ── User ───────────────────────────────────────────────────────────────────────

export const getMe = () =>
  api.get<UserResponse>("/users/me");

export const updateMe = (data: Partial<{
  full_name: string;
  email: string;
  mobility_level: string;
  preferences: { font_size: number; high_contrast: boolean; voice_enabled: boolean };
}>) => api.patch<UserResponse>("/users/me", data);

// ── Vitals ─────────────────────────────────────────────────────────────────────

export const getLatestVital = () =>
  api.get<VitalResponse>("/vitals/latest");

export const getVitals = (limit = 20) =>
  api.get<VitalResponse[]>(`/vitals?limit=${limit}`);

export const logVital = (data: {
  heart_rate?: number;
  systolic_bp?: number;
  diastolic_bp?: number;
  glucose_level?: number;
  spo2?: number;
  weight_kg?: number;
  steps?: number;
  sleep_hours?: number;
  temperature_c?: number;
  source?: string;
}) => api.post<VitalResponse>("/vitals", data);

// ── Diet ───────────────────────────────────────────────────────────────────────

export const getMealPlan = (date: string) =>
  api.get<MealPlanResponse[]>(`/diet/${date}`);

export const generateMealPlan = (data: {
  date: string;
  conditions?: string[];
  calorie_target?: number;
  dietary_preferences?: string[];
}) => api.post<MealPlanResponse[]>("/diet/generate", data);

// ── Workouts ───────────────────────────────────────────────────────────────────

export const generateWorkout = (data: {
  conditions?: string[];
  fitness_level?: string;
  available_equipment?: string[];
  duration_minutes?: number;
}) => api.post<WorkoutPlanResponse>("/workouts/generate", data);

// ── Medications ────────────────────────────────────────────────────────────────

export const getMedications = () =>
  api.get<MedicationResponse[]>("/medications");

export const addMedication = (data: {
  name: string;
  dosage: string;
  frequency: string;
  times?: string[];
  with_food?: boolean;
  prescribing_doctor?: string;
  notes?: string;
}) => api.post<MedicationResponse>("/medications", data);

export const deleteMedication = (id: string) =>
  api.delete<null>(`/medications/${id}`);

// ── Risk Prediction ────────────────────────────────────────────────────────────

export const predictRisk = (riskType: "fall" | "cardiac" | "diabetic") =>
  api.post<RiskScoreResponse>("/risk/predict", { risk_type: riskType });

export const getRiskHistory = (riskType?: string) =>
  api.get<RiskScoreResponse[]>(
    `/risk/history${riskType ? `?risk_type=${riskType}` : ""}`,
  );

// ── Chat ───────────────────────────────────────────────────────────────────────

export const sendChatMessage = (
  message: string,
  sessionId: string | null = null,
) =>
  api.post<ChatMessageResponse>("/chat/message", {
    message,
    session_id: sessionId,
  });

export const getChatHistory = (sessionId: string) =>
  api.get<{ session_id: string; messages: ChatMessageResponse[] }>(
    `/chat/sessions/${sessionId}/history`,
  );

// ── Emergency SOS ──────────────────────────────────────────────────────────────

export const triggerSOS = (
  triggerMethod: "button" | "voice" | "fall_detection" | "auto",
  latitude?: number,
  longitude?: number,
  address?: string,
) =>
  api.post<SOSResponse>("/emergency/trigger", {
    trigger_method: triggerMethod,
    latitude,
    longitude,
    address,
  });

export const getSOSHistory = () =>
  api.get<SOSResponse[]>("/emergency/history");

export const getEmergencyContacts = () =>
  api.get<EmergencyContactResponse[]>("/emergency/contacts");

export const addEmergencyContact = (data: {
  name: string;
  relation: string;
  phone: string;
  is_primary?: boolean;
  notify_on_sos?: boolean;
}) => api.post<EmergencyContactResponse>("/emergency/contacts", data);

export const deleteEmergencyContact = (id: string) =>
  api.delete<null>(`/emergency/contacts/${id}`);

// ── Travel ─────────────────────────────────────────────────────────────────────

export const getTravelMatches = () =>
  api.get<TravelMatchResponse[]>("/travel/matches");

export const createTravelProfile = (data: {
  mobility_level: string;
  preferred_destinations?: string[];
  preferred_travel_months?: number[];
  budget_per_day?: number;
  companions_needed?: number;
  medical_requirements?: string;
  is_discoverable?: boolean;
}) => api.post<{ id: string; message: string }>("/travel/profile", data);
