"""
Workouts Router — Phase 3: FITT-VP Adaptive Exercise Prescription
"""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
import json

from core.database import get_db
from core.security import get_current_active_user
from schemas.schemas import WorkoutPlanRequest, WorkoutPlanResponse
from services.ml_service import generate_workout_plan

router = APIRouter()


@router.post("/generate", response_model=WorkoutPlanResponse,
             summary="Generate adaptive workout plan using FITT-VP principle")
async def generate_workout(
    payload: WorkoutPlanRequest,
    current_user=Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Uses the FITT-VP principle (Frequency, Intensity, Time, Type, Volume, Progression)
    to prescribe age-appropriate exercises. Adapts for mobility level, medical conditions,
    and available equipment. Wheelchair-specific exercises provided when needed.
    """
    conditions = payload.conditions or []
    if not conditions and current_user.medical_history:
        try:
            conditions = json.loads(current_user.medical_history)
        except Exception:
            pass

    plan = generate_workout_plan(
        conditions=conditions,
        fitness_level=payload.fitness_level,
        mobility_level=current_user.mobility_level or "self_reliant",
        duration_minutes=payload.duration_minutes,
        available_equipment=payload.available_equipment or [],
    )
    return plan
