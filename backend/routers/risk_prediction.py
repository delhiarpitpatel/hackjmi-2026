"""
Risk Prediction Router — Phase 3: Predictive Modeling
- Fall Risk: XGBoost (Specificity=0.848, 3-month window)
- Cardiac Readmission: Stacking Ensemble (AUC=0.867)
- Diabetic Risk
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from typing import List
from datetime import date, timedelta
import uuid, json

from core.database import get_db
from core.security import get_current_active_user
from models.user import RiskScore, Vital, Medication
from schemas.schemas import RiskPredictionRequest, RiskScoreResponse, RiskType
from services.ml_service import (
    extract_fall_risk_features, extract_cardiac_features,
    predict_fall_risk, predict_cardiac_risk,
)

router = APIRouter()


def _user_profile_dict(user, medications):
    try:
        conditions = json.loads(user.medical_history) if user.medical_history else []
    except Exception:
        conditions = []

    age = 70  # Default; calculate from DOB in production
    if user.date_of_birth:
        try:
            from datetime import date as _date
            dob = _date.fromisoformat(user.date_of_birth)
            age = (_date.today() - dob).days // 365
        except Exception:
            pass

    return {
        "age": age,
        "bmi": 26.0,
        "conditions": conditions,
        "medication_count": len([m for m in medications if m.is_active]),
        "prior_falls": 0,
        "mobility_level": user.mobility_level or "self_reliant",
    }


def _vitals_as_dicts(vitals):
    result = []
    for v in vitals:
        result.append({
            "heart_rate": float(v.heart_rate) if v.heart_rate else None,
            "systolic_bp": float(v.systolic_bp) if v.systolic_bp else None,
            "diastolic_bp": float(v.diastolic_bp) if v.diastolic_bp else None,
            "glucose_level": float(v.glucose_level) if v.glucose_level else None,
            "spo2": float(v.spo2) if v.spo2 else None,
            "steps": int(v.steps) if v.steps else None,
            "sleep_hours": float(v.sleep_hours) if v.sleep_hours else None,
        })
    return result


@router.post("/predict", response_model=RiskScoreResponse, status_code=201,
             summary="Run ML risk prediction for fall, cardiac, or diabetic risk")
async def predict_risk(
    payload: RiskPredictionRequest,
    current_user=Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    # Fetch last 30 days of vitals
    vitals_result = await db.execute(
        select(Vital)
        .where(Vital.user_id == current_user.id)
        .order_by(desc(Vital.recorded_at))
        .limit(30)
    )
    vitals = vitals_result.scalars().all()
    vitals_dicts = _vitals_as_dicts(vitals)

    # Fetch medications
    meds_result = await db.execute(
        select(Medication).where(Medication.user_id == current_user.id)
    )
    medications = meds_result.scalars().all()
    user_profile = _user_profile_dict(current_user, medications)

    # Run appropriate model
    if payload.risk_type == RiskType.fall:
        features = extract_fall_risk_features(vitals_dicts, user_profile)
        prediction = predict_fall_risk(features)
    elif payload.risk_type == RiskType.cardiac:
        features = extract_cardiac_features(vitals_dicts, user_profile)
        prediction = predict_cardiac_risk(features)
    else:
        raise HTTPException(status_code=422, detail=f"Risk type '{payload.risk_type}' not yet supported")

    score_record = RiskScore(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        risk_type=payload.risk_type,
        score=prediction["score"],
        risk_level=prediction["risk_level"],
        model_used=prediction["model_used"],
        model_version=prediction["model_version"],
        prediction_window_days=prediction["prediction_window_days"],
        feature_snapshot=prediction.get("feature_snapshot"),
    )
    db.add(score_record)
    await db.flush()
    return score_record


@router.get("/history", response_model=List[RiskScoreResponse],
            summary="Get risk score history")
async def risk_history(
    risk_type: RiskType = None,
    limit: int = 10,
    current_user=Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    q = select(RiskScore).where(RiskScore.user_id == current_user.id).order_by(desc(RiskScore.computed_at)).limit(limit)
    if risk_type:
        q = q.where(RiskScore.risk_type == risk_type)
    result = await db.execute(q)
    return result.scalars().all()
