"""
Pydantic v2 schemas for request validation and response serialization.
"""
from pydantic import BaseModel, Field, field_validator, ConfigDict
from typing import Optional, List, Any, Dict
from datetime import datetime
from enum import Enum


# ── Enums ─────────────────────────────────────────────────────────────────────

class GenderEnum(str, Enum):
    male = "male"
    female = "female"
    other = "other"

class MobilityLevel(str, Enum):
    self_reliant = "self_reliant"
    assisted = "assisted"
    wheelchair = "wheelchair"

class SOSStatus(str, Enum):
    pending = "pending"
    dispatched = "dispatched"
    resolved = "resolved"
    cancelled = "cancelled"

class MealType(str, Enum):
    breakfast = "breakfast"
    lunch = "lunch"
    dinner = "dinner"
    snack = "snack"

class RiskType(str, Enum):
    fall = "fall"
    cardiac = "cardiac"
    diabetic = "diabetic"

class TriggerMethod(str, Enum):
    button = "button"
    voice = "voice"
    fall_detection = "fall_detection"
    auto = "auto"


# ── Auth ──────────────────────────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=150, example="Ramesh Kumar")
    phone: str = Field(..., pattern=r"^\+?[0-9]{10,15}$", example="+919876543210")
    password: str = Field(..., min_length=8, example="SecurePass@123")
    email: Optional[str] = Field(None, example="ramesh@email.com")
    date_of_birth: Optional[str] = Field(None, example="1952-03-15")
    gender: Optional[GenderEnum] = None
    language: str = Field("en", example="te")

class LoginRequest(BaseModel):
    phone: str
    password: str

class BiometricLoginRequest(BaseModel):
    user_id: str
    biometric_token: str = Field(..., description="Signed token from device biometric SDK (Face ID/Fingerprint)")

class AadhaarVerifyRequest(BaseModel):
    aadhaar_number: str = Field(..., pattern=r"^\d{12}$", example="123412341234")
    face_image_b64: str = Field(..., description="Base64-encoded selfie for UIDAI FaceRD")

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int

class RefreshRequest(BaseModel):
    refresh_token: str


# ── User ──────────────────────────────────────────────────────────────────────

class UserPreferences(BaseModel):
    font_size: int = Field(18, ge=14, le=32)
    high_contrast: bool = False
    voice_enabled: bool = True
    language: str = "en"

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[str] = None
    date_of_birth: Optional[str] = None
    gender: Optional[GenderEnum] = None
    mobility_level: Optional[MobilityLevel] = None
    upi_id: Optional[str] = None
    aadhaar_number: Optional[str] = None
    medical_history: Optional[str] = None
    allergies: Optional[str] = None
    preferences: Optional[UserPreferences] = None

class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    full_name: str
    phone: str
    email: Optional[str]
    date_of_birth: Optional[str]
    gender: Optional[str]
    language: str
    mobility_level: str
    biometric_enrolled: bool
    font_size: int
    high_contrast: bool
    voice_enabled: bool
    is_active: bool
    created_at: datetime


# ── Vitals ────────────────────────────────────────────────────────────────────

class VitalCreate(BaseModel):
    heart_rate: Optional[float] = Field(None, ge=20, le=300, example=72.0)
    systolic_bp: Optional[float] = Field(None, ge=50, le=300, example=118.0)
    diastolic_bp: Optional[float] = Field(None, ge=30, le=200, example=76.0)
    glucose_level: Optional[float] = Field(None, ge=30, le=800, example=104.0)
    spo2: Optional[float] = Field(None, ge=50, le=100, example=98.0)
    weight_kg: Optional[float] = Field(None, ge=20, le=300, example=68.5)
    steps: Optional[int] = Field(None, ge=0, example=4231)
    sleep_hours: Optional[float] = Field(None, ge=0, le=24, example=7.5)
    temperature_c: Optional[float] = Field(None, ge=30, le=45, example=36.7)
    source: str = Field("manual", example="wearable")

class VitalResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: str
    recorded_at: datetime
    source: str
    heart_rate: Optional[str]
    systolic_bp: Optional[str]
    diastolic_bp: Optional[str]
    glucose_level: Optional[str]
    spo2: Optional[str]
    weight_kg: Optional[str]
    steps: Optional[str]
    sleep_hours: Optional[str]
    temperature_c: Optional[str]


# ── Wearables ─────────────────────────────────────────────────────────────────

class WearableConnectRequest(BaseModel):
    provider: str = Field(..., example="thryve")
    access_token: str
    refresh_token: Optional[str] = None
    expires_at: Optional[datetime] = None

class WearableResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    provider: str
    connected_at: datetime
    expires_at: Optional[datetime]


# ── Medications ───────────────────────────────────────────────────────────────

class MedicationCreate(BaseModel):
    name: str = Field(..., example="Metformin")
    dosage: str = Field(..., example="500mg")
    frequency: str = Field(..., example="twice daily")
    times: Optional[List[str]] = Field(None, example=["08:00", "20:00"])
    with_food: bool = True
    prescribing_doctor: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    notes: Optional[str] = None

class MedicationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    user_id: str
    name: str
    dosage: str
    frequency: str
    times: Optional[List[str]]
    with_food: bool
    is_active: bool
    created_at: datetime


# ── Diet ──────────────────────────────────────────────────────────────────────

class DietGenerateRequest(BaseModel):
    date: str = Field(..., example="2026-02-28")
    conditions: Optional[List[str]] = Field(None, example=["diabetes", "hypertension"])
    calorie_target: Optional[int] = Field(None, example=1500)
    dietary_preferences: Optional[List[str]] = Field(None, example=["vegetarian", "low-sodium"])

class MealItem(BaseModel):
    name: str
    quantity: str
    calories: float
    protein_g: Optional[float] = None
    carbs_g: Optional[float] = None
    fat_g: Optional[float] = None

class MealPlanResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    user_id: str
    date: str
    meal_type: str
    items: List[Any]
    total_calories: Optional[float]
    total_protein_g: Optional[float]
    total_carbs_g: Optional[float]
    total_fat_g: Optional[float]
    sodium_mg: Optional[float]
    generated_by: str
    created_at: datetime


# ── Workouts ──────────────────────────────────────────────────────────────────

class WorkoutPlanRequest(BaseModel):
    conditions: Optional[List[str]] = Field(None, example=["arthritis", "hypertension"])
    fitness_level: str = Field("beginner", example="beginner")  # beginner | moderate | active
    available_equipment: Optional[List[str]] = Field(None, example=["chair", "resistance_band"])
    duration_minutes: int = Field(20, ge=5, le=60)

class WorkoutExercise(BaseModel):
    name: str
    duration_minutes: int
    reps: Optional[int] = None
    sets: Optional[int] = None
    instructions: str
    modifications: Optional[str] = None   # for wheelchair / limited mobility

class WorkoutPlanResponse(BaseModel):
    date: str
    fitness_level: str
    total_duration_minutes: int
    exercises: List[WorkoutExercise]
    fitt_vp_notes: str
    generated_by: str = "ml_model"


# ── Risk Prediction ───────────────────────────────────────────────────────────

class RiskPredictionRequest(BaseModel):
    risk_type: RiskType = Field(..., example="fall")

class RiskScoreResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    user_id: str
    risk_type: str
    score: float
    risk_level: str
    model_used: str
    model_version: str
    prediction_window_days: int
    feature_snapshot: Optional[Dict[str, Any]]
    computed_at: datetime


# ── Emergency / SOS ───────────────────────────────────────────────────────────

class SOSCreateRequest(BaseModel):
    trigger_method: TriggerMethod = Field(..., example="button")
    latitude: Optional[float] = Field(None, example=17.3850)
    longitude: Optional[float] = Field(None, example=78.4867)
    address: Optional[str] = None

class SOSUpdateRequest(BaseModel):
    status: SOSStatus
    notes: Optional[str] = None

class SOSResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    user_id: str
    trigger_method: str
    latitude: Optional[float]
    longitude: Optional[float]
    status: str
    police_notified: bool
    family_notified: bool
    dispatch_ref: Optional[str]
    triggered_at: datetime
    resolved_at: Optional[datetime]

class EmergencyContactCreate(BaseModel):
    name: str
    relation: str = Field(..., example="son")
    phone: str = Field(..., pattern=r"^\+?[0-9]{10,15}$")
    is_primary: bool = False
    notify_on_sos: bool = True

class EmergencyContactResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    name: str
    relation: str
    phone: str
    is_primary: bool
    notify_on_sos: bool


# ── Chat ──────────────────────────────────────────────────────────────────────

class ChatMessageRequest(BaseModel):
    session_id: Optional[str] = None          # None = start new session
    message: str = Field(..., min_length=1, max_length=2000)

class ChatMessageResponse(BaseModel):
    session_id: str
    message_id: str
    role: str
    content: str
    timestamp: datetime

class ChatHistoryResponse(BaseModel):
    session_id: str
    messages: List[ChatMessageResponse]


# ── Travel ────────────────────────────────────────────────────────────────────

class TravelProfileCreate(BaseModel):
    mobility_level: MobilityLevel
    preferred_destinations: Optional[List[str]] = None
    preferred_travel_months: Optional[List[int]] = None
    budget_per_day: Optional[float] = None
    companions_needed: int = Field(1, ge=1, le=5)
    medical_requirements: Optional[str] = None
    is_discoverable: bool = True

class TravelMatchResponse(BaseModel):
    user_id: str
    full_name: str
    mobility_level: str
    preferred_destinations: Optional[List[str]]
    preferred_travel_months: Optional[List[int]]
    budget_per_day: Optional[float]
    companions_needed: int
    match_score: float = Field(..., description="Compatibility score 0.0–1.0")


# ── UPI Payment (Phase 2) ─────────────────────────────────────────────────────

class UPIPaymentRequest(BaseModel):
    recipient_upi_id: str = Field(..., example="pharmacist@upi")
    amount: float = Field(..., gt=0, le=5000, description="Max ₹5,000 for biometric UPI")
    description: str = Field(..., example="Medicines purchase")
    biometric_token: str = Field(..., description="Device biometric assertion token")

class UPIPaymentResponse(BaseModel):
    transaction_id: str
    status: str
    amount: float
    recipient_upi_id: str
    timestamp: datetime
