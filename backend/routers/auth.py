"""
Authentication Router — Phase 2: Biometric Security & Identity
Endpoints: register, login, biometric login, Aadhaar verify, refresh, UPI payment
"""
from fastapi import APIRouter, Depends, HTTPException, status, Form
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime, timezone
import uuid

from core.database import get_db
from core.security import (
    hash_password, verify_password,
    create_access_token, create_refresh_token, decode_token,
    verify_biometric_token, verify_aadhaar_face,
    get_current_active_user,
)
from core.config import settings
from models.user import User
from schemas.schemas import (
    RegisterRequest, LoginRequest, BiometricLoginRequest,
    AadhaarVerifyRequest, TokenResponse, RefreshRequest,
    UPIPaymentRequest, UPIPaymentResponse,
)

router = APIRouter()


@router.post("/register", response_model=TokenResponse, status_code=201,
             summary="Register a new user (Phase 1 + 2)")
async def register(payload: RegisterRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.phone == payload.phone))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Phone number already registered")

    user = User(
        id=str(uuid.uuid4()),
        full_name=payload.full_name,
        phone=payload.phone,
        email=payload.email,
        hashed_password=hash_password(payload.password),
        date_of_birth=payload.date_of_birth,
        gender=payload.gender,
        language=payload.language,
    )
    db.add(user)
    await db.flush()

    return TokenResponse(
        access_token=create_access_token(user.id),
        refresh_token=create_refresh_token(user.id),
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )


@router.post("/login", response_model=TokenResponse,
             summary="Login with phone + password")
async def login(
    db: AsyncSession = Depends(get_db),
    form_data: OAuth2PasswordRequestForm = Depends(),
):
    """
    Accepts OAuth2 form fields so Swagger Authorize works directly.
    Use your phone number as the username field.
    Also accepts JSON via the /login-json alias if needed.
    """
    result = await db.execute(select(User).where(User.phone == form_data.username))
    user = result.scalar_one_or_none()

    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is inactive")

    return TokenResponse(
        access_token=create_access_token(user.id),
        refresh_token=create_refresh_token(user.id),
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )


@router.post("/login-json", response_model=TokenResponse,
             summary="Login with JSON body (phone + password)")
async def login_json(payload: LoginRequest, db: AsyncSession = Depends(get_db)):
    """JSON body alternative for non-Swagger clients."""
    result = await db.execute(select(User).where(User.phone == payload.phone))
    user = result.scalar_one_or_none()

    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is inactive")

    return TokenResponse(
        access_token=create_access_token(user.id),
        refresh_token=create_refresh_token(user.id),
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )


@router.post("/biometric-login", response_model=TokenResponse,
             summary="Login via device biometric (Face ID / Fingerprint) — Phase 2")
async def biometric_login(
    payload: BiometricLoginRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Validates a signed biometric assertion from the device's native SDK
    (NPCI on-device biometric stack). Supports payments up to ₹5,000.
    """
    result = await db.execute(select(User).where(User.id == payload.user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if not user.biometric_enrolled:
        raise HTTPException(status_code=403, detail="Biometric not enrolled for this account")

    verified = await verify_biometric_token(payload.biometric_token, payload.user_id)
    if not verified:
        raise HTTPException(status_code=401, detail="Biometric verification failed")

    return TokenResponse(
        access_token=create_access_token(user.id, extra={"biometric": True}),
        refresh_token=create_refresh_token(user.id),
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )


@router.post("/aadhaar-verify",
             summary="Verify identity via Aadhaar FaceRD — Phase 2")
async def aadhaar_verify(
    payload: AadhaarVerifyRequest,
    current_user=Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Calls UIDAI FaceRD API to verify Aadhaar-based facial recognition.
    Used for initial setup, PIN resets, or high-value transactions.
    Eliminates need for OTPs or complex passwords.
    """
    result = await verify_aadhaar_face(payload.aadhaar_number, payload.face_image_b64)

    if not result.get("verified"):
        raise HTTPException(status_code=401, detail="Aadhaar face verification failed")

    current_user.aadhaar_number = payload.aadhaar_number
    current_user.biometric_enrolled = True
    await db.flush()

    return {
        "verified": True,
        "confidence": result.get("confidence"),
        "biometric_enrolled": True,
        "message": "Aadhaar verification successful. Biometric login enabled.",
    }


@router.post("/refresh", response_model=TokenResponse,
             summary="Refresh access token")
async def refresh_token(payload: RefreshRequest):
    data = decode_token(payload.refresh_token)
    if data.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    return TokenResponse(
        access_token=create_access_token(data["sub"]),
        refresh_token=create_refresh_token(data["sub"]),
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )


@router.post("/upi/pay", response_model=UPIPaymentResponse,
             summary="UPI biometric payment (max ₹5,000) — Phase 2")
async def upi_pay(
    payload: UPIPaymentRequest,
    current_user=Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Authorize a UPI payment using on-device biometric authentication.
    NPCI allows biometric UPI up to ₹5,000 without a PIN.
    """
    if payload.amount > settings.UPI_MAX_AMOUNT:
        raise HTTPException(
            status_code=400,
            detail=f"Biometric UPI limit is ₹{settings.UPI_MAX_AMOUNT}. Use PIN for higher amounts.",
        )

    if not current_user.biometric_enrolled:
        raise HTTPException(status_code=403, detail="Biometric not enrolled. Complete Aadhaar verification first.")

    verified = await verify_biometric_token(payload.biometric_token, current_user.id)
    if not verified:
        raise HTTPException(status_code=401, detail="Biometric authentication failed")

    # In production: call NPCI / bank UPI SDK here
    import uuid as _uuid
    return UPIPaymentResponse(
        transaction_id=f"TXN{_uuid.uuid4().hex[:12].upper()}",
        status="SUCCESS",
        amount=payload.amount,
        recipient_upi_id=payload.recipient_upi_id,
        timestamp=datetime.now(timezone.utc),
    )


@router.get("/dev/biometric-token",
            summary="[DEV ONLY] Generate a test biometric token for a user",
            tags=["Dev Helpers"])
async def dev_generate_biometric_token(
    current_user=Depends(get_current_active_user),
):
    """
    Development helper — generates a valid biometric token for the current user.
    Use the returned token to test the /biometric-login endpoint.

    THIS ENDPOINT SHOULD BE DISABLED IN PRODUCTION.
    In production, the biometric token is generated by the device's
    native Secure Enclave / TEE via the NPCI SDK.
    """
    if not settings.DEBUG:
        raise HTTPException(
            status_code=403,
            detail="This endpoint is only available in DEBUG mode. Set DEBUG=True in .env to use it.",
        )

    from datetime import timedelta, timezone as tz
    from jose import jwt as _jwt

    token = _jwt.encode(
        {
            "sub": current_user.id,
            "type": "biometric",
            "exp": datetime.now(timezone.utc) + timedelta(minutes=10),
        },
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM,
    )

    return {
        "user_id": current_user.id,
        "biometric_token": token,
        "expires_in_minutes": 10,
        "instructions": "Pass both fields directly into POST /api/v1/auth/biometric-login",
        "warning": "Dev only — never expose this endpoint in production",
    }
