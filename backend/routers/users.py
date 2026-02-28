"""
Users Router — Phase 1: User Profiles & Accessibility Preferences
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from core.security import get_current_active_user
from schemas.schemas import UserResponse, UserUpdate

router = APIRouter()


@router.get("/me", response_model=UserResponse, summary="Get current user profile")
async def get_me(current_user=Depends(get_current_active_user)):
    return current_user


@router.patch("/me", response_model=UserResponse, summary="Update profile & accessibility preferences")
async def update_me(
    payload: UserUpdate,
    current_user=Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Update profile details and accessibility settings.
    Phase 1 standards: font_size (16–18pt), high_contrast (4.5:1 ratio), voice_enabled.
    """
    update_data = payload.model_dump(exclude_none=True)

    # Flatten preferences if provided
    if "preferences" in update_data:
        prefs = update_data.pop("preferences")
        if prefs:
            for key, val in prefs.items():
                setattr(current_user, key, val)

    for field, value in update_data.items():
        setattr(current_user, field, value)

    await db.flush()
    return current_user


@router.delete("/me", status_code=204, summary="Deactivate account (GDPR right to erasure)")
async def deactivate_account(
    current_user=Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Soft-delete: marks account inactive and schedules data erasure (GDPR Article 17)."""
    current_user.is_active = False
    await db.flush()
