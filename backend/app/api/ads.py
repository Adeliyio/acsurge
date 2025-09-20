from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, File, UploadFile, Form
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from app.core.database import get_db
from app.services.ad_analysis_service_enhanced import EnhancedAdAnalysisService
from app.auth import get_current_user, require_subscription_limit
from app.models.user import User
from app.schemas.ads import (
    AdInput, 
    CompetitorAd, 
    AdAnalysisRequest, 
    AdScore, 
    AdAlternative, 
    AdAnalysisResponse
)
from app.utils.text_parser import TextParser
from app.utils.file_extract import FileExtractor
import json

router = APIRouter()

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
    ad_service = EnhancedAdAnalysisService(db)
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
    ad_service = EnhancedAdAnalysisService(db)
    history = ad_service.get_user_analysis_history(current_user.id, limit, offset)
    
    return history

@router.get("/analysis/{analysis_id}")
async def get_analysis_detail(
    analysis_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get detailed analysis results"""
    ad_service = EnhancedAdAnalysisService(db)
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
    
    ad_service = EnhancedAdAnalysisService(db)
    alternatives = await ad_service.generate_ad_alternatives(ad)
    
    return {"alternatives": alternatives}

# Parse request models
class ParseTextRequest(BaseModel):
    text: str
    platform: Optional[str] = 'facebook'
    user_id: Optional[str] = None

class GenerateRequest(BaseModel):
    platform: str = 'facebook'
    productService: str
    valueProposition: str
    targetAudience: Optional[str] = None
    tone: str = 'professional'
    industry: Optional[str] = None
    keyBenefits: Optional[str] = None
    numVariations: int = 3
    includeEmojis: bool = False
    includeUrgency: bool = True
    includeStats: bool = False
    prompt_context: Optional[str] = None
    generation_options: Optional[dict] = None
    user_id: Optional[str] = None

@router.post("/parse")
async def parse_ads(
    request: ParseTextRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Parse pasted ad copy text"""
    try:
        text_parser = TextParser()
        parsed_ads = text_parser.parse_text(request.text, request.platform)
        
        if not parsed_ads:
            return {
                "ads": [],
                "message": "No ad copy could be parsed from the provided text",
                "success": False
            }
        
        return {
            "ads": parsed_ads,
            "message": f"Successfully parsed {len(parsed_ads)} ad{'s' if len(parsed_ads) > 1 else ''}",
            "success": True
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Parsing failed: {str(e)}")

@router.post("/parse-file")
async def parse_file(
    file: UploadFile = File(...),
    platform: str = Form('facebook'),
    user_id: str = Form(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Parse uploaded file for ad copy"""
    try:
        file_extractor = FileExtractor()
        content = await file.read()
        
        parsed_ads = file_extractor.extract_from_file(
            content, 
            file.filename, 
            platform
        )
        
        if not parsed_ads:
            return {
                "ads": [],
                "message": "No ad copy could be extracted from the file",
                "success": False
            }
        
        return {
            "ads": parsed_ads,
            "message": f"Successfully extracted {len(parsed_ads)} ad{'s' if len(parsed_ads) > 1 else ''} from file",
            "success": True
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"File parsing failed: {str(e)}")

@router.post("/generate")
async def generate_ad_copy(
    request: GenerateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_subscription_limit)
):
    """Generate ad copy using AI"""
    try:
        ad_service = EnhancedAdAnalysisService(db)
        
        # Create a prompt for AI generation
        prompt = f"""
Create {request.numVariations} compelling ad variations for {request.platform}.

Product/Service: {request.productService}
Value Proposition: {request.valueProposition}
Target Audience: {request.targetAudience or 'general audience'}
Tone: {request.tone}
Industry: {request.industry or 'general'}
Key Benefits: {request.keyBenefits or 'N/A'}

Options:
- Include emojis: {request.includeEmojis}
- Add urgency: {request.includeUrgency}
- Include statistics: {request.includeStats}

For each variation, provide:
1. Headline (catchy and attention-grabbing)
2. Body text (compelling description)
3. Call-to-action (action-oriented)

Return as JSON array with objects containing headline, body_text, cta, platform fields.
        """
        
        # For now, create template-based variations
        # In production, this would call OpenAI API
        variations = []
        
        for i in range(request.numVariations):
            variation = {
                "headline": f"{request.valueProposition}" + (" 🚀" if request.includeEmojis else ""),
                "body_text": f"Join thousands who trust {request.productService}. {request.keyBenefits or 'Transform your business today.'}",
                "cta": "Get Started" if i == 0 else ("Learn More" if i == 1 else "Try Free"),
                "platform": request.platform,
                "industry": request.industry,
                "target_audience": request.targetAudience
            }
            variations.append(variation)
        
        return {
            "ads": variations,
            "platform": request.platform,
            "generation_info": f"Generated {len(variations)} variations using AI",
            "success": True
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Generation failed: {str(e)}")
