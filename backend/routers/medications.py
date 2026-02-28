"""
Medications Router — Phase 3
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
import uuid

from core.database import get_db
from core.security import get_current_active_user
from models.user import Medication
from schemas.schemas import MedicationCreate, MedicationResponse

router = APIRouter()


@router.post("/", response_model=MedicationResponse, status_code=201,
             summary="Add a medication")
async def add_medication(
    payload: MedicationCreate,
    current_user=Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    med = Medication(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        **payload.model_dump(),
    )
    db.add(med)
    await db.flush()
    return med


@router.get("/", response_model=List[MedicationResponse],
            summary="List all medications")
async def list_medications(
    active_only: bool = True,
    current_user=Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    q = select(Medication).where(Medication.user_id == current_user.id)
    if active_only:
        q = q.where(Medication.is_active == True)
    result = await db.execute(q)
    return result.scalars().all()


@router.delete("/{med_id}", status_code=204, summary="Remove a medication")
async def delete_medication(
    med_id: str,
    current_user=Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Medication).where(Medication.id == med_id, Medication.user_id == current_user.id)
    )
    med = result.scalar_one_or_none()
    if not med:
        raise HTTPException(status_code=404, detail="Medication not found")
    med.is_active = False
    await db.flush()
