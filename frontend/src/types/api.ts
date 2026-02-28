// src/types/api.ts

// User-related types
export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
  // accessibility preferences, etc.
  preferences?: Record<string, any>;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn?: number;
}

// Vitals
export interface VitalReading {
  id: string;
  userId: string;
  type: 'blood_sugar' | 'blood_pressure' | 'heart_rate' | string;
  value: number | string;
  unit: string;
  timestamp: string;
}

export interface VitalHistory {
  readings: VitalReading[];
}

// Wearables
export interface WearableProvider {
  id: string;
  name: string;
}

export interface ConnectedWearable {
  id: string;
  providerId: string;
  deviceName: string;
  connectedAt: string;
}

// Diet
export interface MealPlan {
  date: string; // ISO date string
  meals: Array<{
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    items: string[];
    calories?: number;
  }>;
}

// Workouts
export interface WorkoutPlan {
  id: string;
  generatedAt: string;
  exercises: Array<{
    name: string;
    durationMinutes?: number;
    sets?: number;
    reps?: number;
    notes?: string;
  }>;
}

// Medications (not explicitly asked but allied)
export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
}

// Risk prediction
export interface RiskPrediction {
  id: string;
  userId: string;
  type: 'fall' | 'cardiac' | 'diabetic' | string;
  score: number; // 0-1 or percentage
  generatedAt: string;
}

// Chat
export interface ChatMessage {
  id: string;
  sessionId: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
}

export interface ChatSession {
  id: string;
  createdAt: string;
  updatedAt: string;
}

// Emergency
export interface EmergencyContact {
  id: string;
  userId: string;
  name: string;
  phone: string;
  relation?: string;
}

export interface EmergencyEvent {
  id: string;
  userId: string;
  status: 'triggered' | 'resolved' | 'cancelled';
  triggeredAt: string;
  resolvedAt?: string;
}
