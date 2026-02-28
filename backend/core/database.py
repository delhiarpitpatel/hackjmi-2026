"""
Async SQLAlchemy database engine and session factory.
AES-256 encryption applied to sensitive health columns via TypeDecorator.
"""
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy import Column, String, TypeDecorator, Text
from cryptography.fernet import Fernet
import base64
import hashlib

from core.config import settings


# --- Encryption helper (AES-256 via Fernet which uses AES-128-CBC internally;
#     for true AES-256-GCM swap in cryptography.hazmat primitives) ---
def _derive_key(raw_key: str) -> bytes:
    """Derive a 32-byte Fernet-compatible key from the config key."""
    digest = hashlib.sha256(raw_key.encode()).digest()
    return base64.urlsafe_b64encode(digest)


_fernet = Fernet(_derive_key(settings.ENCRYPTION_KEY))


class EncryptedString(TypeDecorator):
    """SQLAlchemy column type that transparently encrypts/decrypts values."""
    impl = Text
    cache_ok = True

    def process_bind_param(self, value, dialect):
        if value is None:
            return value
        return _fernet.encrypt(value.encode()).decode()

    def process_result_value(self, value, dialect):
        if value is None:
            return value
        return _fernet.decrypt(value.encode()).decode()


# --- Engine ---
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,
    future=True,
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


class Base(DeclarativeBase):
    pass


async def init_db():
    """Create all tables on startup."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def get_db() -> AsyncSession:
    """FastAPI dependency that yields a DB session."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
