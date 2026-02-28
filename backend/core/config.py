"""
Core configuration using Pydantic BaseSettings.
Load from environment variables or .env file.
"""
from pydantic_settings import BaseSettings
from typing import List
from functools import lru_cache


class Settings(BaseSettings):
    # App
    APP_NAME: str = "CareCompanion"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False

    # Security
    SECRET_KEY: str = "CHANGE_ME_IN_PRODUCTION_use_openssl_rand_hex_32"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30

    # Biometric / UPI
    UPI_MAX_AMOUNT: float = 5000.0          # NPCI limit for biometric UPI auth
    UIDAI_API_URL: str = "https://api.uidai.gov.in/face-rd"  # Aadhaar FaceRD
    UIDAI_API_KEY: str = ""

    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./carecompanion.db"

    # Redis (for session caching & rate limiting)
    REDIS_URL: str = "redis://localhost:6379/0"

    # Wearables APIs
    THRYVE_API_KEY: str = ""
    THRYVE_BASE_URL: str = "https://api.und-gesund.de/v5"

    # Encryption (AES-256 for health data at rest)
    ENCRYPTION_KEY: str = "CHANGE_ME_32_BYTE_KEY_FOR_AES256"

    # Emergency / SOS
    HAWKEYE_API_URL: str = "https://hawkeye.hyd.gov.in/api/dispatch"
    HAWKEYE_API_KEY: str = ""
    TWILIO_ACCOUNT_SID: str = ""
    TWILIO_AUTH_TOKEN: str = ""
    TWILIO_FROM_NUMBER: str = ""

    # AI / LLM (on-device assumed; cloud fallback)
    LLM_PROVIDER: str = "local"              # "local" | "openai" | "anthropic"
    LLM_MODEL: str = "mistral-7b-instruct"
    OPENAI_API_KEY: str = ""

    # CORS
    ALLOWED_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:8080"]
    ALLOWED_HOSTS: List[str] = ["localhost", "127.0.0.1", "*"]

    # Rate Limiting
    RATE_LIMIT_REQUESTS: int = 100
    RATE_LIMIT_WINDOW: int = 60             # seconds

    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
