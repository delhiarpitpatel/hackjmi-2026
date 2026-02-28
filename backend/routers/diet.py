"""
Diet Router — Phase 3: Personalized AI Meal Plans (Random Forest / K-Means)
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from typing import List
import uuid, json

from core.database import get_db
from core.security import get_current_active_user
from models.user import MealPlan, Medication
from schemas.schemas import DietGenerateRequest, MealPlanResponse
from services.ml_service import generate_meal_plan

router = APIRouter()

MEAL_TYPES = ["breakfast", "lunch", "dinner", "snack"]


@router.post("/generate", response_model=List[MealPlanResponse], status_code=201,
             summary="Generate full-day AI meal plan (Random Forest + K-Means)")
async def generate_daily_plan(
    payload: DietGenerateRequest,
    current_user=Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Generates personalized meal plans using dietary clustering (K-Means)
    and condition-aware recommendations (Random Forest).
    Accounts for diabetes, hypertension, and dietary preferences.
    """
    conditions = payload.conditions or []
    # Infer conditions from medical history if not provided
    if not conditions and current_user.medical_history:
        try:
            conditions = json.loads(current_user.medical_history)
        except Exception:
            pass

    created_plans = []
    for meal_type in MEAL_TYPES:
        meal_data = generate_meal_plan(
            meal_type=meal_type,
            conditions=conditions,
            calorie_target=payload.calorie_target,
            dietary_preferences=payload.dietary_preferences,
        )
        plan = MealPlan(
            id=str(uuid.uuid4()),
            user_id=current_user.id,
            date=payload.date,
            meal_type=meal_type,
            items=meal_data["items"],
            total_calories=meal_data["total_calories"],
            total_protein_g=meal_data["total_protein_g"],
            total_carbs_g=meal_data["total_carbs_g"],
            total_fat_g=meal_data["total_fat_g"],
            sodium_mg=meal_data["sodium_mg"],
            generated_by=meal_data["generated_by"],
        )
        db.add(plan)
        created_plans.append(plan)

    await db.flush()
    return created_plans


@router.get("/{date}", response_model=List[MealPlanResponse],
            summary="Get meal plans for a specific date")
async def get_meal_plan(
    date: str,
    current_user=Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(MealPlan).where(
            and_(MealPlan.user_id == current_user.id, MealPlan.date == date)
        )
    )
    plans = result.scalars().all()
    if not plans:
        raise HTTPException(status_code=404, detail=f"No meal plan found for {date}. Generate one first.")
    return plans
