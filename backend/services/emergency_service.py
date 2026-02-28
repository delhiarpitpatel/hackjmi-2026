"""
Emergency Service — Phase 5: SOS Dispatch & Notifications

Handles:
- Multi-modal SOS triggering (button, voice, fall detection)
- Hyderabad HawkEye police dispatch API
- Twilio SMS to emergency contacts
- Health snapshot assembly for first responders
"""
import json
import httpx
from datetime import datetime, timezone
from typing import Optional

from core.config import settings


async def dispatch_to_hawkeye(
    user_name: str,
    phone: str,
    latitude: Optional[float],
    longitude: Optional[float],
    address: Optional[str],
    health_snapshot: dict,
) -> dict:
    """
    Notify Hyderabad HawkEye police dispatch system.
    Sends alert to nearest patrol vehicle and SHO.
    Returns dispatch reference number.
    """
    if not settings.HAWKEYE_API_KEY:
        # Stub response for development
        return {
            "dispatch_ref": f"HE-{datetime.now().strftime('%Y%m%d%H%M%S')}",
            "status": "dispatched",
            "eta_minutes": 8,
            "assigned_unit": "Patrol Unit 42",
            "sho_notified": True,
            "stub": True,
        }

    payload = {
        "incident_type": "MEDICAL_EMERGENCY",
        "caller_name": user_name,
        "caller_phone": phone,
        "location": {
            "latitude": latitude,
            "longitude": longitude,
            "address": address,
        },
        "health_info": {
            "summary": health_snapshot.get("summary", ""),
            "medications": health_snapshot.get("current_medications", []),
            "conditions": health_snapshot.get("medical_conditions", []),
            "vitals_last": health_snapshot.get("latest_vitals", {}),
        },
        "priority": "HIGH",
    }

    async with httpx.AsyncClient() as client:
        resp = await client.post(
            settings.HAWKEYE_API_URL,
            json=payload,
            headers={"x-api-key": settings.HAWKEYE_API_KEY},
            timeout=10.0,
        )
        resp.raise_for_status()
        return resp.json()


async def send_sms_alert(
    to_phone: str,
    user_name: str,
    latitude: Optional[float],
    longitude: Optional[float],
    address: Optional[str],
) -> bool:
    """Send SMS to emergency contact via Twilio."""
    maps_url = (
        f"https://maps.google.com/?q={latitude},{longitude}"
        if latitude and longitude else "Location unavailable"
    )
    location_str = address or maps_url

    message = (
        f"🚨 EMERGENCY ALERT\n"
        f"{user_name} has triggered an SOS alert.\n"
        f"📍 Location: {location_str}\n"
        f"Please respond immediately or call emergency services.\n"
        f"- CareCompanion App"
    )

    if not settings.TWILIO_ACCOUNT_SID:
        print(f"[STUB] SMS to {to_phone}: {message}")
        return True

    try:
        from twilio.rest import Client
        client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
        client.messages.create(
            body=message,
            from_=settings.TWILIO_FROM_NUMBER,
            to=to_phone,
        )
        return True
    except Exception as e:
        print(f"SMS failed to {to_phone}: {e}")
        return False


def build_health_snapshot(user, vitals_history: list, medications: list) -> dict:
    """
    Assemble a concise health snapshot for first responders.
    This is encrypted before storage (AES-256).
    """
    latest_vitals = {}
    if vitals_history:
        v = vitals_history[0]
        latest_vitals = {
            "heart_rate": v.heart_rate,
            "blood_pressure": f"{v.systolic_bp}/{v.diastolic_bp}" if v.systolic_bp else None,
            "glucose_level": v.glucose_level,
            "spo2": v.spo2,
            "recorded_at": v.recorded_at.isoformat() if v.recorded_at else None,
        }

    try:
        conditions = json.loads(user.medical_history) if user.medical_history else []
    except Exception:
        conditions = [user.medical_history] if user.medical_history else []

    try:
        allergies = json.loads(user.allergies) if user.allergies else []
    except Exception:
        allergies = [user.allergies] if user.allergies else []

    return {
        "patient_name": user.full_name,
        "phone": user.phone,
        "date_of_birth": user.date_of_birth,
        "gender": user.gender,
        "blood_group": None,
        "medical_conditions": conditions,
        "allergies": allergies,
        "current_medications": [
            {"name": m.name, "dosage": m.dosage, "frequency": m.frequency}
            for m in medications if m.is_active
        ],
        "latest_vitals": latest_vitals,
        "summary": f"Elderly patient {user.full_name}, DOB {user.date_of_birth}. "
                   f"Conditions: {', '.join(conditions) if conditions else 'None documented'}. "
                   f"Allergies: {', '.join(allergies) if allergies else 'None'}.",
        "generated_at": datetime.now(timezone.utc).isoformat(),
    }
