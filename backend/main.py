"""
CareCompanion - Elderly App Backend
FastAPI Application Entry Point
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from contextlib import asynccontextmanager
import uvicorn

from core.config import settings
from core.database import init_db
from routers import (
    auth,
    users,
    vitals,
    diet,
    workouts,
    medications,
    risk_prediction,
    emergency,
    chat,
    wearables,
    travel,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events."""
    await init_db()
    yield


app = FastAPI(
    title="CareCompanion API",
    description="""
## CareCompanion — Elderly Health & Safety Platform

A comprehensive backend API for the CareCompanion elderly app, built across 6 phases:

- **Phase 1** – Accessibility & UX (user profiles, preferences)
- **Phase 2** – Biometric Security & Identity (JWT + biometric auth, UPI, Aadhaar)
- **Phase 3** – Personalized Health & Predictive Modeling (diet, workouts, ML risk scores)
- **Phase 4** – Conversational AI & Social Connectivity (chatbot, travel matching)
- **Phase 5** – Emergency Response (SOS, police dispatch, health snapshots)
- **Phase 6** – Pilot Testing & Optimization (feedback, model refinement)
    """,
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# --- Middleware ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(TrustedHostMiddleware, allowed_hosts=settings.ALLOWED_HOSTS)

# --- Routers ---
app.include_router(auth.router,            prefix="/api/v1/auth",        tags=["Phase 2 · Authentication"])
app.include_router(users.router,           prefix="/api/v1/users",       tags=["Phase 1 · User Profiles"])
app.include_router(vitals.router,          prefix="/api/v1/vitals",      tags=["Phase 3 · Vitals"])
app.include_router(wearables.router,       prefix="/api/v1/wearables",   tags=["Phase 3 · Wearables"])
app.include_router(diet.router,            prefix="/api/v1/diet",        tags=["Phase 3 · Diet"])
app.include_router(workouts.router,        prefix="/api/v1/workouts",    tags=["Phase 3 · Workouts"])
app.include_router(medications.router,     prefix="/api/v1/medications", tags=["Phase 3 · Medications"])
app.include_router(risk_prediction.router, prefix="/api/v1/risk",        tags=["Phase 3 · Risk Prediction"])
app.include_router(chat.router,            prefix="/api/v1/chat",        tags=["Phase 4 · AI Companion"])
app.include_router(travel.router,          prefix="/api/v1/travel",      tags=["Phase 4 · Travel Matching"])
app.include_router(emergency.router,       prefix="/api/v1/emergency",   tags=["Phase 5 · Emergency SOS"])


@app.get("/", tags=["Health Check"])
async def root():
    return {
        "app": "CareCompanion API",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
    }


@app.get("/health", tags=["Health Check"])
async def health_check():
    return {"status": "healthy"}


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
