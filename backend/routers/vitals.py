"""
Vitals Router — Phase 3: Health Data Collection
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from typing import List, Optional
from datetime import datetime, date
import uuid

from core.database import get_db
from core.security import get_current_active_user
from models.user import Vital
from schemas.schemas import VitalCreate, VitalResponse

router = APIRouter()


@router.post("/", response_model=VitalResponse, status_code=201,
             summary="Log a vital reading (manual or wearable sync)")
async def create_vital(
    payload: VitalCreate,
    current_user=Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    vital = Vital(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        source=payload.source,
        heart_rate=str(payload.heart_rate) if payload.heart_rate is not None else None,
        systolic_bp=str(payload.systolic_bp) if payload.systolic_bp is not None else None,
        diastolic_bp=str(payload.diastolic_bp) if payload.diastolic_bp is not None else None,
        glucose_level=str(payload.glucose_level) if payload.glucose_level is not None else None,
        spo2=str(payload.spo2) if payload.spo2 is not None else None,
        weight_kg=str(payload.weight_kg) if payload.weight_kg is not None else None,
        steps=str(payload.steps) if payload.steps is not None else None,
        sleep_hours=str(payload.sleep_hours) if payload.sleep_hours is not None else None,
        temperature_c=str(payload.temperature_c) if payload.temperature_c is not None else None,
    )
    db.add(vital)
    await db.flush()
    return vital


@router.get("/", response_model=List[VitalResponse],
            summary="Get vital history")
async def get_vitals(
    limit: int = Query(20, ge=1, le=100),
    skip: int = Query(0, ge=0),
    current_user=Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Vital)
        .where(Vital.user_id == current_user.id)
        .order_by(desc(Vital.recorded_at))
        .offset(skip)
        .limit(limit)
    )
    return result.scalars().all()


@router.get("/latest", response_model=VitalResponse,
            summary="Get the most recent vital reading")
async def get_latest_vital(
    current_user=Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    from fastapi import HTTPException
    result = await db.execute(
        select(Vital)
        .where(Vital.user_id == current_user.id)
        .order_by(desc(Vital.recorded_at))
        .limit(1)
    )
    vital = result.scalar_one_or_none()
    if not vital:
        raise HTTPException(status_code=404, detail="No vitals recorded yet")
    return vital
