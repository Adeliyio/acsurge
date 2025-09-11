from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from app.core.database import get_db
from app.services.ad_analysis_service import AdAnalysisService
from app.auth import get_current_user, require_subscription_limit
from app.models.user import User

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
    current_user: User = Depends(require_subscription_limit)
):
    """Analyze an ad and generate alternatives"""
    # User is already authenticated and subscription limits checked
    
    # Perform ad analysis
    ad_service = AdAnalysisService(db)
    analysis = await ad_service.analyze_ad(
        user_id=current_user.id,
        ad=request.ad,
        competitor_ads=request.competitor_ads
    )
    
    return analysis

@router.get("/history", response_model=List[dict])
async def get_analysis_history(
    limit: int = 10,
    offset: int = 0,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get user's analysis history"""
    ad_service = AdAnalysisService(db)
    history = ad_service.get_user_analysis_history(current_user.id, limit, offset)
    
    return history

@router.get("/analysis/{analysis_id}")
async def get_analysis_detail(
    analysis_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get detailed analysis results"""
    ad_service = AdAnalysisService(db)
    analysis = ad_service.get_analysis_by_id(analysis_id, current_user.id)
    
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")
    
    return analysis

@router.post("/generate-alternatives")
async def generate_alternatives(
    ad: AdInput,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Generate alternative ad variations"""
    
    ad_service = AdAnalysisService(db)
    alternatives = await ad_service.generate_ad_alternatives(ad)
    
    return {"alternatives": alternatives}
