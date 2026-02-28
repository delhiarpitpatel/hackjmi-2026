"""
Emergency Router — Phase 5: Multi-Modal SOS & Life-Safety System

Endpoints:
- POST /trigger  — Activate SOS (button / voice / fall detection)
- POST /contacts — Manage emergency contacts
- GET  /contacts — List emergency contacts
- PATCH /{id}   — Update SOS event status (resolve/cancel)
- GET  /history  — View SOS event history
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from datetime import datetime, timezone
from typing import List
import uuid, json

from core.database import get_db
from core.security import get_current_active_user
from models.user import SOSEvent, EmergencyContact, Vital, Medication
from schemas.schemas import (
    SOSCreateRequest, SOSUpdateRequest, SOSResponse,
    EmergencyContactCreate, EmergencyContactResponse,
)
from services.emergency_service import (
    dispatch_to_hawkeye, send_sms_alert, build_health_snapshot,
)

router = APIRouter()


@router.post("/trigger", response_model=SOSResponse, status_code=201,
             summary="🚨 Trigger SOS emergency alert (Phase 5)")
async def trigger_sos(
    payload: SOSCreateRequest,
    current_user=Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Multi-modal SOS activation:
    - **button**: Single hardware button press
    - **voice**: Voice command detection ("Help!")
    - **fall_detection**: Accelerometer-based automatic fall detection
    - **auto**: Timer-based or inactivity trigger

    On trigger:
    1. Assembles encrypted health snapshot (vitals + medications + history)
    2. Dispatches to nearest police patrol via Hyderabad HawkEye API
    3. Sends SMS to all emergency contacts with GPS location
    """
    # Fetch latest vitals
    vitals_result = await db.execute(
        select(Vital)
        .where(Vital.user_id == current_user.id)
        .order_by(desc(Vital.recorded_at))
        .limit(5)
    )
    vitals = vitals_result.scalars().all()

    # Fetch active medications
    meds_result = await db.execute(
        select(Medication).where(
            Medication.user_id == current_user.id,
            Medication.is_active == True,
        )
    )
    medications = meds_result.scalars().all()

    # Build health snapshot
    snapshot = build_health_snapshot(current_user, vitals, medications)

    # Create SOS event
    sos = SOSEvent(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        trigger_method=payload.trigger_method,
        latitude=payload.latitude,
        longitude=payload.longitude,
        address=payload.address,
        status="pending",
        health_snapshot=json.dumps(snapshot),
    )
    db.add(sos)
    await db.flush()

    # Dispatch to HawkEye (police)
    dispatch_result = await dispatch_to_hawkeye(
        user_name=current_user.full_name,
        phone=current_user.phone,
        latitude=payload.latitude,
        longitude=payload.longitude,
        address=payload.address,
        health_snapshot=snapshot,
    )
    sos.police_notified = True
    sos.dispatch_ref = dispatch_result.get("dispatch_ref")
    sos.status = "dispatched"

    # Notify emergency contacts via SMS
    contacts_result = await db.execute(
        select(EmergencyContact).where(
            EmergencyContact.user_id == current_user.id,
            EmergencyContact.notify_on_sos == True,
        )
    )
    contacts = contacts_result.scalars().all()

    for contact in contacts:
        await send_sms_alert(
            to_phone=contact.phone,
            user_name=current_user.full_name,
            latitude=payload.latitude,
            longitude=payload.longitude,
            address=payload.address,
        )

    if contacts:
        sos.family_notified = True

    await db.flush()
    return sos


@router.patch("/{sos_id}", response_model=SOSResponse,
              summary="Update SOS event status (resolve or cancel)")
async def update_sos(
    sos_id: str,
    payload: SOSUpdateRequest,
    current_user=Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(SOSEvent).where(
            SOSEvent.id == sos_id,
            SOSEvent.user_id == current_user.id,
        )
    )
    sos = result.scalar_one_or_none()
    if not sos:
        raise HTTPException(status_code=404, detail="SOS event not found")

    sos.status = payload.status
    if payload.notes:
        sos.notes = payload.notes
    if payload.status in ("resolved", "cancelled"):
        sos.resolved_at = datetime.now(timezone.utc)

    await db.flush()
    return sos


@router.get("/history", response_model=List[SOSResponse],
            summary="Get SOS event history")
async def sos_history(
    limit: int = 10,
    current_user=Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(SOSEvent)
        .where(SOSEvent.user_id == current_user.id)
        .order_by(desc(SOSEvent.triggered_at))
        .limit(limit)
    )
    return result.scalars().all()


# ── Emergency Contacts ────────────────────────────────────────────────────────

@router.post("/contacts", response_model=EmergencyContactResponse, status_code=201,
             summary="Add an emergency contact")
async def add_contact(
    payload: EmergencyContactCreate,
    current_user=Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    contact = EmergencyContact(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        **payload.model_dump(),
    )
    db.add(contact)
    await db.flush()
    return contact


@router.get("/contacts", response_model=List[EmergencyContactResponse],
            summary="List emergency contacts")
async def list_contacts(
    current_user=Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(EmergencyContact).where(EmergencyContact.user_id == current_user.id)
    )
    return result.scalars().all()


@router.delete("/contacts/{contact_id}", status_code=204,
               summary="Remove an emergency contact")
async def delete_contact(
    contact_id: str,
    current_user=Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(EmergencyContact).where(
            EmergencyContact.id == contact_id,
            EmergencyContact.user_id == current_user.id,
        )
    )
    contact = result.scalar_one_or_none()
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")
    await db.delete(contact)
