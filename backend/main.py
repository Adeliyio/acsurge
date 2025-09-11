from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer
from fastapi.staticfiles import StaticFiles
from pathlib import Path
import uvicorn
from app.api import auth, ads, analytics, subscriptions, health
from app.core.config import settings
from app.core.database import engine, Base
from app.core.logging import setup_logging, get_logger

# Setup logging
setup_logging()
logger = get_logger(__name__)

# Create database tables (if engine is available)
if engine is not None:
    Base.metadata.create_all(bind=engine)
else:
    logger.warning("Database engine not available - skipping table creation")

app = FastAPI(
    title="AdCopySurge API",
    description="AI-powered ad copy analysis and optimization platform",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_HOSTS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health.router, tags=["monitoring"])  # Health checks at root level
app.include_router(auth.router, prefix="/api/auth", tags=["authentication"])
app.include_router(ads.router, prefix="/api/ads", tags=["ad-analysis"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["analytics"])
app.include_router(subscriptions.router, prefix="/api/subscriptions", tags=["subscriptions"])

@app.get("/")
async def root():
    return {"message": "AdCopySurge API is running", "version": "1.0.0"}

# Health endpoints now handled by health.router

# Serve React static files
static_files_path = Path(__file__).parent / "../frontend/build"
if static_files_path.exists():
    app.mount("/static", StaticFiles(directory=str(static_files_path)), name="static")
    
    # Serve favicon and manifest specifically
    @app.get("/favicon.ico")
    async def favicon():
        from fastapi.responses import FileResponse
        favicon_path = static_files_path / "favicon.ico"
        if favicon_path.exists():
            return FileResponse(favicon_path)
        else:
            raise HTTPException(status_code=404, detail="Favicon not found")
    
    @app.get("/manifest.json")
    async def manifest():
        from fastapi.responses import FileResponse
        manifest_path = static_files_path / "manifest.json"
        if manifest_path.exists():
            return FileResponse(manifest_path)
        else:
            raise HTTPException(status_code=404, detail="Manifest not found")

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG
    )
