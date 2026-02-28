"""
Travel Router — Phase 4: Travel Partner Matching Algorithm
Pairs users by mobility level, shared itineraries, and budget compatibility.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
import uuid

from core.database import get_db
from core.security import get_current_active_user
from models.user import TravelProfile, User
from schemas.schemas import TravelProfileCreate, TravelMatchResponse

router = APIRouter()


def _compute_match_score(profile_a: TravelProfile, profile_b: TravelProfile) -> float:
    """
    Compute compatibility score (0.0–1.0) between two travel profiles.
    Factors: mobility match, destination overlap, month overlap, budget proximity.
    """
    score = 0.0

    # Mobility compatibility (40% weight)
    # Perfect: same level. Partial: self_reliant can travel with assisted.
    if profile_a.mobility_level == profile_b.mobility_level:
        score += 0.40
    elif set([profile_a.mobility_level, profile_b.mobility_level]) == {"self_reliant", "assisted"}:
        score += 0.25
    # wheelchair with non-wheelchair = low compatibility

    # Destination overlap (30% weight)
    dests_a = set(profile_a.preferred_destinations or [])
    dests_b = set(profile_b.preferred_destinations or [])
    if dests_a and dests_b:
        overlap = len(dests_a & dests_b) / max(len(dests_a | dests_b), 1)
        score += overlap * 0.30
    else:
        score += 0.15  # Partial credit if one has no preference

    # Month overlap (20% weight)
    months_a = set(profile_a.preferred_travel_months or [])
    months_b = set(profile_b.preferred_travel_months or [])
    if months_a and months_b:
        overlap = len(months_a & months_b) / max(len(months_a | months_b), 1)
        score += overlap * 0.20
    else:
        score += 0.10

    # Budget proximity (10% weight)
    if profile_a.budget_per_day and profile_b.budget_per_day:
        diff_ratio = abs(profile_a.budget_per_day - profile_b.budget_per_day) / max(profile_a.budget_per_day, profile_b.budget_per_day)
        score += (1 - diff_ratio) * 0.10
    else:
        score += 0.05

    return round(min(score, 1.0), 3)


@router.post("/profile", status_code=201,
             summary="Create or update travel profile for matching")
async def create_travel_profile(
    payload: TravelProfileCreate,
    current_user=Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(TravelProfile).where(TravelProfile.user_id == current_user.id)
    )
    existing = result.scalar_one_or_none()

    if existing:
        for field, value in payload.model_dump().items():
            setattr(existing, field, value)
        profile = existing
    else:
        profile = TravelProfile(
            id=str(uuid.uuid4()),
            user_id=current_user.id,
            **payload.model_dump(),
        )
        db.add(profile)

    await db.flush()
    return {"id": profile.id, "message": "Travel profile saved successfully"}


@router.get("/matches", response_model=List[TravelMatchResponse],
            summary="Find compatible travel companions")
async def find_matches(
    limit: int = 10,
    current_user=Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Matches users by mobility level (self-reliant vs. wheelchair-reliant)
    and shared itineraries/destinations. Returns ranked compatibility scores.
    """
    # Get current user's profile
    result = await db.execute(
        select(TravelProfile).where(TravelProfile.user_id == current_user.id)
    )
    my_profile = result.scalar_one_or_none()
    if not my_profile:
        raise HTTPException(status_code=404, detail="Create a travel profile first to find matches")

    # Get all discoverable profiles (excluding self)
    result = await db.execute(
        select(TravelProfile, User)
        .join(User, TravelProfile.user_id == User.id)
        .where(
            TravelProfile.is_discoverable == True,
            TravelProfile.user_id != current_user.id,
            User.is_active == True,
        )
    )
    candidates = result.all()

    matches = []
    for profile, user in candidates:
        match_score = _compute_match_score(my_profile, profile)
        if match_score > 0.2:  # Minimum threshold
            matches.append(TravelMatchResponse(
                user_id=user.id,
                full_name=user.full_name,
                mobility_level=profile.mobility_level,
                preferred_destinations=profile.preferred_destinations,
                preferred_travel_months=profile.preferred_travel_months,
                budget_per_day=profile.budget_per_day,
                companions_needed=profile.companions_needed,
                match_score=match_score,
            ))

    # Sort by match score descending
    matches.sort(key=lambda x: x.match_score, reverse=True)
    return matches[:limit]
