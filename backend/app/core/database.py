from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
import os

# Create engine with error handling for development environments
try:
    engine = create_engine(settings.DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
except Exception as e:
    # In development without PostgreSQL, create a dummy engine for imports
    if os.getenv("ENVIRONMENT", "development") == "development":
        print(f"⚠️ Database engine creation failed (expected in dev): {e}")
        engine = None
        SessionLocal = None
    else:
        # In production, this should not fail
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
