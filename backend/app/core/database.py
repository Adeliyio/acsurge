from sqlalchemy import create_engine
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
import os

# Create both sync and async engines for Railway compatibility
try:
    # Sync engine for compatibility with existing code
    sync_database_url = settings.DATABASE_URL
    if sync_database_url.startswith("postgresql://"):
        sync_database_url = sync_database_url.replace("postgresql://", "postgresql+psycopg2://", 1)
    
    engine = create_engine(
        sync_database_url,
        pool_pre_ping=True,  # Handle connection drops
        pool_recycle=3600,   # Recycle connections every hour
        echo=False  # Set to True for SQL logging in dev
    )
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    
    # Async engine for async endpoints (future-proofing)
    async_database_url = settings.DATABASE_URL
    if async_database_url.startswith("postgresql://"):
        async_database_url = async_database_url.replace("postgresql://", "postgresql+asyncpg://", 1)
    
    async_engine = create_async_engine(
        async_database_url,
        pool_pre_ping=True,
        pool_recycle=3600,
        echo=False
    )
    AsyncSessionLocal = async_sessionmaker(
        bind=async_engine,
        class_=AsyncSession,
        expire_on_commit=False
    )
    
except Exception as e:
    # In development without PostgreSQL, create dummy engines for imports
    if os.getenv("ENVIRONMENT", "development") == "development":
        print(f"⚠️ Database engine creation failed (expected in dev): {e}")
        engine = None
        async_engine = None
        SessionLocal = None
        AsyncSessionLocal = None
    else:
        # In production, this should not fail
        print(f"❌ Database connection failed in production: {e}")
        raise e

Base = declarative_base()

def get_db():
    if SessionLocal is None:
        raise RuntimeError("Database not available - ensure PostgreSQL is configured")
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
