"""
Wearables Router — Phase 3: Device Integration (Thryve/Vitalera, 500+ devices)
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
import uuid

from core.database import get_db
from core.security import get_current_active_user
from models.user import WearableToken
from schemas.schemas import WearableConnectRequest, WearableResponse

router = APIRouter()

SUPPORTED_PROVIDERS = ["thryve", "vitalera", "googlefit", "apple_health", "samsung_health", "fitbit", "garmin"]


@router.get("/providers", summary="List supported wearable providers")
async def list_providers():
    return {"providers": SUPPORTED_PROVIDERS, "total_devices_supported": 500}


@router.post("/connect", response_model=WearableResponse, status_code=201,
             summary="Connect a wearable device via OAuth token")
async def connect_wearable(
    payload: WearableConnectRequest,
    current_user=Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    if payload.provider not in SUPPORTED_PROVIDERS:
        raise HTTPException(status_code=400, detail=f"Unsupported provider. Choose from: {SUPPORTED_PROVIDERS}")

    token = WearableToken(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        provider=payload.provider,
        access_token=payload.access_token,
        refresh_token=payload.refresh_token,
        expires_at=payload.expires_at,
    )
    db.add(token)
    await db.flush()
    return token


@router.get("/", response_model=List[WearableResponse],
            summary="List connected wearable devices")
async def list_wearables(
    current_user=Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(WearableToken).where(WearableToken.user_id == current_user.id)
    )
    return result.scalars().all()


@router.delete("/{wearable_id}", status_code=204, summary="Disconnect a wearable")
async def disconnect_wearable(
    wearable_id: str,
    current_user=Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(WearableToken).where(
            WearableToken.id == wearable_id,
            WearableToken.user_id == current_user.id,
        )
    )
    token = result.scalar_one_or_none()
    if not token:
        raise HTTPException(status_code=404, detail="Wearable not found")
    await db.delete(token)
