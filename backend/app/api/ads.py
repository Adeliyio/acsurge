from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from app.core.database import get_db
from app.services.ad_analysis_service import AdAnalysisService
from app.services.auth_service import AuthService
from app.api.auth import oauth2_scheme

router = APIRouter()

class AdInput(BaseModel):
    headline: str
    body_text: str
    cta: str
    platform: str = "facebook"  # facebook, google, linkedin, tiktok
    target_audience: Optional[str] = None
    industry: Optional[str] = None

class CompetitorAd(BaseModel):
    headline: str
    body_text: str
    cta: str
    platform: str
    source_url: Optional[str] = None

class AdAnalysisRequest(BaseModel):
    ad: AdInput
    competitor_ads: Optional[List[CompetitorAd]] = []

class AdScore(BaseModel):
    overall_score: float
    clarity_score: float
    persuasion_score: float
    emotion_score: float
    cta_strength: float
    platform_fit_score: float

class AdAlternative(BaseModel):
    variant_type: str  # persuasive, emotional, stats_heavy, platform_optimized
    headline: str
    body_text: str
    cta: str
    improvement_reason: str

class AdAnalysisResponse(BaseModel):
    analysis_id: str
    scores: AdScore
    feedback: str
    alternatives: List[AdAlternative]
    competitor_comparison: Optional[dict] = None
    quick_wins: List[str]

@router.post("/analyze", response_model=AdAnalysisResponse)
async def analyze_ad(
    request: AdAnalysisRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme)
):
    """Analyze an ad and generate alternatives"""
    # Get current user
    auth_service = AuthService(db)
    user = auth_service.get_current_user(token)
    
    if not user:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    # Check subscription limits
    if user.subscription_tier == "free" and user.monthly_analyses >= 5:
        raise HTTPException(
            status_code=403, 
            detail="Monthly analysis limit reached. Please upgrade your subscription."
        )
    
    # Perform ad analysis
    ad_service = AdAnalysisService(db)
    analysis = await ad_service.analyze_ad(
        user_id=user.id,
        ad=request.ad,
        competitor_ads=request.competitor_ads
    )
    
    return analysis

@router.get("/history", response_model=List[dict])
async def get_analysis_history(
    limit: int = 10,
    offset: int = 0,
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme)
):
    """Get user's analysis history"""
    auth_service = AuthService(db)
    user = auth_service.get_current_user(token)
    
    if not user:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    ad_service = AdAnalysisService(db)
    history = ad_service.get_user_analysis_history(user.id, limit, offset)
    
    return history

@router.get("/analysis/{analysis_id}")
async def get_analysis_detail(
    analysis_id: str,
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme)
):
    """Get detailed analysis results"""
    auth_service = AuthService(db)
    user = auth_service.get_current_user(token)
    
    if not user:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    ad_service = AdAnalysisService(db)
    analysis = ad_service.get_analysis_by_id(analysis_id, user.id)
    
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")
    
    return analysis

@router.post("/generate-alternatives")
async def generate_alternatives(
    ad: AdInput,
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme)
):
    """Generate alternative ad variations"""
    auth_service = AuthService(db)
    user = auth_service.get_current_user(token)
    
    if not user:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    ad_service = AdAnalysisService(db)
    alternatives = await ad_service.generate_ad_alternatives(ad)
    
    return {"alternatives": alternatives}
