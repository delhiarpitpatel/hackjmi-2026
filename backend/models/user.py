"""
SQLAlchemy ORM Models for CareCompanion.
Sensitive health fields use EncryptedString (AES-256).
"""
from datetime import datetime, timezone
from typing import Optional
import uuid

from sqlalchemy import (
    Column, String, Float, Integer, Boolean,
    DateTime, ForeignKey, Text, Enum, JSON
)
from sqlalchemy.orm import relationship
import enum

from core.database import Base, EncryptedString


def now_utc():
    return datetime.now(timezone.utc)


def new_uuid():
    return str(uuid.uuid4())


# ── Enums ─────────────────────────────────────────────────────────────────────

class GenderEnum(str, enum.Enum):
    male = "male"
    female = "female"
    other = "other"

class MobilityLevel(str, enum.Enum):
    self_reliant = "self_reliant"
    assisted = "assisted"
    wheelchair = "wheelchair"

class SOSStatus(str, enum.Enum):
    pending = "pending"
    dispatched = "dispatched"
    resolved = "resolved"
    cancelled = "cancelled"

class MealType(str, enum.Enum):
    breakfast = "breakfast"
    lunch = "lunch"
    dinner = "dinner"
    snack = "snack"

class RiskType(str, enum.Enum):
    fall = "fall"
    cardiac = "cardiac"
    diabetic = "diabetic"


# ── User (Phase 1 & 2) ────────────────────────────────────────────────────────

class User(Base):
    __tablename__ = "users"

    id              = Column(String, primary_key=True, default=new_uuid)
    full_name       = Column(String(150), nullable=False)
    phone           = Column(String(15), unique=True, nullable=False, index=True)
    email           = Column(String(200), unique=True, nullable=True)
    hashed_password = Column(String, nullable=False)
    date_of_birth   = Column(String(10), nullable=True)           # YYYY-MM-DD
    gender          = Column(Enum(GenderEnum), nullable=True)
    language        = Column(String(10), default="en")
    mobility_level  = Column(Enum(MobilityLevel), default=MobilityLevel.self_reliant)

    # Encrypted sensitive fields (HIPAA/GDPR)
    aadhaar_number  = Column(EncryptedString, nullable=True)
    medical_history = Column(EncryptedString, nullable=True)      # JSON string
    allergies       = Column(EncryptedString, nullable=True)

    # UPI / biometric
    upi_id          = Column(String(100), nullable=True)
    biometric_enrolled = Column(Boolean, default=False)

    # Accessibility preferences (Phase 1)
    font_size       = Column(Integer, default=18)                 # 16–18pt baseline
    high_contrast   = Column(Boolean, default=False)
    voice_enabled   = Column(Boolean, default=True)

    is_active       = Column(Boolean, default=True)
    created_at      = Column(DateTime(timezone=True), default=now_utc)
    updated_at      = Column(DateTime(timezone=True), default=now_utc, onupdate=now_utc)

    # Relationships
    vitals          = relationship("Vital", back_populates="user", cascade="all, delete")
    medications     = relationship("Medication", back_populates="user", cascade="all, delete")
    meal_plans      = relationship("MealPlan", back_populates="user", cascade="all, delete")
    risk_scores     = relationship("RiskScore", back_populates="user", cascade="all, delete")
    emergency_contacts = relationship("EmergencyContact", back_populates="user", cascade="all, delete")
    sos_events      = relationship("SOSEvent", back_populates="user", cascade="all, delete")
    chat_sessions   = relationship("ChatSession", back_populates="user", cascade="all, delete")
    travel_profiles = relationship("TravelProfile", back_populates="user", uselist=False)
    wearable_tokens = relationship("WearableToken", back_populates="user", cascade="all, delete")


# ── Vitals (Phase 3) ──────────────────────────────────────────────────────────

class Vital(Base):
    __tablename__ = "vitals"

    id              = Column(String, primary_key=True, default=new_uuid)
    user_id         = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    recorded_at     = Column(DateTime(timezone=True), default=now_utc, index=True)
    source          = Column(String(50), default="manual")       # manual | wearable | cgm

    # Encrypted health values
    heart_rate      = Column(EncryptedString, nullable=True)     # bpm
    systolic_bp     = Column(EncryptedString, nullable=True)     # mmHg
    diastolic_bp    = Column(EncryptedString, nullable=True)
    glucose_level   = Column(EncryptedString, nullable=True)     # mg/dL
    spo2            = Column(EncryptedString, nullable=True)     # %
    weight_kg       = Column(EncryptedString, nullable=True)
    steps           = Column(EncryptedString, nullable=True)
    sleep_hours     = Column(EncryptedString, nullable=True)
    temperature_c   = Column(EncryptedString, nullable=True)

    user            = relationship("User", back_populates="vitals")


# ── Wearable Tokens (Phase 3) ─────────────────────────────────────────────────

class WearableToken(Base):
    __tablename__ = "wearable_tokens"

    id              = Column(String, primary_key=True, default=new_uuid)
    user_id         = Column(String, ForeignKey("users.id"), nullable=False)
    provider        = Column(String(50), nullable=False)         # thryve | vitalera | googlefit | apple_health
    access_token    = Column(EncryptedString, nullable=False)
    refresh_token   = Column(EncryptedString, nullable=True)
    expires_at      = Column(DateTime(timezone=True), nullable=True)
    connected_at    = Column(DateTime(timezone=True), default=now_utc)

    user            = relationship("User", back_populates="wearable_tokens")


# ── Medications (Phase 3) ─────────────────────────────────────────────────────

class Medication(Base):
    __tablename__ = "medications"

    id              = Column(String, primary_key=True, default=new_uuid)
    user_id         = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    name            = Column(String(200), nullable=False)
    dosage          = Column(String(100), nullable=False)        # e.g. "500mg"
    frequency       = Column(String(100), nullable=False)        # e.g. "twice daily"
    times           = Column(JSON, nullable=True)                # ["08:00", "20:00"]
    with_food       = Column(Boolean, default=True)
    prescribing_doctor = Column(String(150), nullable=True)
    start_date      = Column(String(10), nullable=True)
    end_date        = Column(String(10), nullable=True)
    notes           = Column(Text, nullable=True)
    is_active       = Column(Boolean, default=True)
    created_at      = Column(DateTime(timezone=True), default=now_utc)

    user            = relationship("User", back_populates="medications")


# ── Meal Plans (Phase 3) ──────────────────────────────────────────────────────

class MealPlan(Base):
    __tablename__ = "meal_plans"

    id              = Column(String, primary_key=True, default=new_uuid)
    user_id         = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    date            = Column(String(10), nullable=False)         # YYYY-MM-DD
    meal_type       = Column(Enum(MealType), nullable=False)
    items           = Column(JSON, nullable=False)               # [{"name": ..., "quantity": ..., "calories": ...}]
    total_calories  = Column(Float, nullable=True)
    total_protein_g = Column(Float, nullable=True)
    total_carbs_g   = Column(Float, nullable=True)
    total_fat_g     = Column(Float, nullable=True)
    sodium_mg       = Column(Float, nullable=True)
    generated_by    = Column(String(50), default="ml_model")    # ml_model | dietitian | manual
    notes           = Column(Text, nullable=True)
    created_at      = Column(DateTime(timezone=True), default=now_utc)

    user            = relationship("User", back_populates="meal_plans")


# ── Risk Scores (Phase 3) ─────────────────────────────────────────────────────

class RiskScore(Base):
    __tablename__ = "risk_scores"

    id              = Column(String, primary_key=True, default=new_uuid)
    user_id         = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    risk_type       = Column(Enum(RiskType), nullable=False)
    score           = Column(Float, nullable=False)              # 0.0 – 1.0
    risk_level      = Column(String(20), nullable=False)         # low | moderate | high
    model_used      = Column(String(100), nullable=False)        # XGBoost | StackingEnsemble
    model_version   = Column(String(20), default="1.0.0")
    prediction_window_days = Column(Integer, default=90)        # 3 months
    feature_snapshot = Column(JSON, nullable=True)              # features used for explainability
    computed_at     = Column(DateTime(timezone=True), default=now_utc, index=True)

    user            = relationship("User", back_populates="risk_scores")


# ── Emergency Contacts (Phase 5) ──────────────────────────────────────────────

class EmergencyContact(Base):
    __tablename__ = "emergency_contacts"

    id              = Column(String, primary_key=True, default=new_uuid)
    user_id         = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    name            = Column(String(150), nullable=False)
    relation        = Column(String(50), nullable=False)         # son | daughter | spouse | caregiver
    phone           = Column(String(15), nullable=False)
    is_primary      = Column(Boolean, default=False)
    notify_on_sos   = Column(Boolean, default=True)

    user            = relationship("User", back_populates="emergency_contacts")


# ── SOS Events (Phase 5) ──────────────────────────────────────────────────────

class SOSEvent(Base):
    __tablename__ = "sos_events"

    id              = Column(String, primary_key=True, default=new_uuid)
    user_id         = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    trigger_method  = Column(String(30), nullable=False)         # button | voice | fall_detection | auto
    latitude        = Column(Float, nullable=True)
    longitude       = Column(Float, nullable=True)
    address         = Column(Text, nullable=True)
    status          = Column(Enum(SOSStatus), default=SOSStatus.pending)

    # Encrypted health snapshot sent to responders
    health_snapshot = Column(EncryptedString, nullable=True)     # JSON with vitals + meds + history

    # Dispatch tracking
    police_notified = Column(Boolean, default=False)
    family_notified = Column(Boolean, default=False)
    dispatch_ref    = Column(String(100), nullable=True)         # HawkEye dispatch reference
    resolved_at     = Column(DateTime(timezone=True), nullable=True)
    notes           = Column(Text, nullable=True)
    triggered_at    = Column(DateTime(timezone=True), default=now_utc, index=True)

    user            = relationship("User", back_populates="sos_events")


# ── Chat (Phase 4) ────────────────────────────────────────────────────────────

class ChatSession(Base):
    __tablename__ = "chat_sessions"

    id              = Column(String, primary_key=True, default=new_uuid)
    user_id         = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    started_at      = Column(DateTime(timezone=True), default=now_utc)
    ended_at        = Column(DateTime(timezone=True), nullable=True)
    message_count   = Column(Integer, default=0)

    user            = relationship("User", back_populates="chat_sessions")
    messages        = relationship("ChatMessage", back_populates="session", cascade="all, delete")


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id              = Column(String, primary_key=True, default=new_uuid)
    session_id      = Column(String, ForeignKey("chat_sessions.id"), nullable=False, index=True)
    role            = Column(String(10), nullable=False)         # user | assistant
    content         = Column(EncryptedString, nullable=False)   # encrypted for privacy
    timestamp       = Column(DateTime(timezone=True), default=now_utc)

    session         = relationship("ChatSession", back_populates="messages")


# ── Travel Matching (Phase 4) ─────────────────────────────────────────────────

class TravelProfile(Base):
    __tablename__ = "travel_profiles"

    id              = Column(String, primary_key=True, default=new_uuid)
    user_id         = Column(String, ForeignKey("users.id"), nullable=False, unique=True)
    mobility_level  = Column(Enum(MobilityLevel), nullable=False)
    preferred_destinations = Column(JSON, nullable=True)        # ["Ooty", "Mysore", ...]
    preferred_travel_months = Column(JSON, nullable=True)       # [1, 2, 11, 12]
    budget_per_day  = Column(Float, nullable=True)
    companions_needed = Column(Integer, default=1)
    medical_requirements = Column(Text, nullable=True)
    is_discoverable = Column(Boolean, default=True)
    created_at      = Column(DateTime(timezone=True), default=now_utc)
    updated_at      = Column(DateTime(timezone=True), default=now_utc, onupdate=now_utc)

    user            = relationship("User", back_populates="travel_profiles")
