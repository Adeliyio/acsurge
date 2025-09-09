from fastapi import FastAPI, HTTPException, UploadFile, File, Form, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.httpsredirect import HTTPSRedirectMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import uvicorn
from datetime import datetime
import json
import os
import tempfile

# Launch-ready FastAPI app without problematic dependencies
app = FastAPI(
    title="AdCopySurge API",
    description="AI-powered ad copy analysis and optimization platform",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# CORS middleware - Production ready
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://adcopysurge.com",
        "https://www.adcopysurge.com", 
        "https://app.adcopysurge.com",
        "https://adcopysurge.netlify.app",
        "https://main--adcopysurge.netlify.app",  # Netlify deploy previews
        "http://localhost:3000",  # Local development
        "http://127.0.0.1:3000"   # Local development
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH"],
    allow_headers=[
        "Content-Type", 
        "Authorization", 
        "X-Requested-With", 
        "X-Request-ID",
        "Accept",
        "Origin",
        "User-Agent"
    ],
)

# Security middleware - only enable in production
if os.getenv("ENVIRONMENT", "development") == "production":
    # Force HTTPS in production
    app.add_middleware(HTTPSRedirectMiddleware)
    
    # Only allow trusted hosts
    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=[
            "api.adcopysurge.com",
            "adcopysurge.com",
            "www.adcopysurge.com",
            "localhost",  # For health checks
            "127.0.0.1"   # For health checks
        ]
    )

# Security headers middleware
@app.middleware("http")
async def security_headers(request: Request, call_next):
    response = await call_next(request)
    
    # Security headers
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Server"] = "AdCopySurge-API"  # Hide server details
    
    # HSTS in production
    if os.getenv("ENVIRONMENT", "development") == "production":
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    
    return response

# Pydantic models for API
class AdInput(BaseModel):
    headline: str
    body_text: str
    cta: str
    platform: str = "facebook"
    target_audience: Optional[str] = None
    industry: Optional[str] = None

class AdScore(BaseModel):
    overall_score: float
    clarity_score: float
    persuasion_score: float
    emotion_score: float
    cta_strength: float
    platform_fit_score: float

class AdAlternative(BaseModel):
    variant_type: str
    headline: str
    body_text: str
    cta: str
    improvement_reason: str

class AdAnalysisResponse(BaseModel):
    analysis_id: str
    scores: AdScore
    feedback: str
    alternatives: List[AdAlternative]
    quick_wins: List[str]

# New models for multi-input system
class ParseRequest(BaseModel):
    text: str
    platform: str = "facebook"
    user_id: Optional[str] = None

class GenerateRequest(BaseModel):
    platform: str = "facebook"
    productService: str
    valueProposition: str
    targetAudience: Optional[str] = None
    tone: str = "professional"
    industry: Optional[str] = None
    keyBenefits: Optional[str] = None
    numVariations: int = 3
    includeEmojis: bool = False
    includeUrgency: bool = True
    includeStats: bool = False
    user_id: Optional[str] = None

class ParsedAdsResponse(BaseModel):
    ads: List[Dict[str, Any]]
    count: int
    warning: Optional[str] = None
    error: Optional[str] = None

class BatchAnalysisRequest(BaseModel):
    ads: List[AdInput]
    competitor_ads: Optional[List[AdInput]] = []
    user_id: Optional[str] = None

class BatchAnalysisResponse(BaseModel):
    analysis_ids: List[str]
    success_count: int
    total_count: int
    results: List[AdAnalysisResponse]
    warning: Optional[str] = None

# Import working analyzers
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from app.services.readability_analyzer import ReadabilityAnalyzer
from app.services.cta_analyzer import CTAAnalyzer
from app.utils.text_parser import parse_ad_copy_from_text
from app.utils.file_extract import extract_text_from_file, is_supported_file

# Initialize analyzers
readability_analyzer = ReadabilityAnalyzer()
cta_analyzer = CTAAnalyzer()

@app.get("/")
async def root():
    return {
        "message": "AdCopySurge API is running", 
        "version": "1.0.0",
        "status": "MVP Ready"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.post("/api/ads/analyze", response_model=AdAnalysisResponse)
async def analyze_ad(ad_input: AdInput):
    """Analyze an ad and generate alternatives - MVP version"""
    try:
        # Combine ad text for analysis
        full_text = f"{ad_input.headline} {ad_input.body_text} {ad_input.cta}"
        
        # Run readability analysis
        clarity_analysis = readability_analyzer.analyze_clarity(full_text)
        power_analysis = readability_analyzer.analyze_power_words(full_text)
        
        # Run CTA analysis
        cta_analysis = cta_analyzer.analyze_cta(ad_input.cta, ad_input.platform)
        
        # Calculate platform fit (simplified)
        platform_fit_score = calculate_platform_fit(ad_input)
        
        # Calculate scores
        scores = AdScore(
            clarity_score=clarity_analysis['clarity_score'],
            persuasion_score=power_analysis.get('power_score', 50),
            emotion_score=calculate_emotion_score(full_text),  # Simplified
            cta_strength=cta_analysis['cta_strength_score'],
            platform_fit_score=platform_fit_score,
            overall_score=calculate_overall_score(
                clarity_analysis['clarity_score'],
                power_analysis.get('power_score', 50),
                calculate_emotion_score(full_text),
                cta_analysis['cta_strength_score'],
                platform_fit_score
            )
        )
        
        # Generate feedback
        feedback = generate_feedback(clarity_analysis, cta_analysis, scores)
        
        # Generate alternatives (template-based)
        alternatives = generate_template_alternatives(ad_input)
        
        # Generate quick wins
        quick_wins = []
        quick_wins.extend(clarity_analysis.get('recommendations', [])[:2])
        quick_wins.extend(cta_analysis.get('recommendations', [])[:1])
        
        return AdAnalysisResponse(
            analysis_id=f"analysis_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            scores=scores,
            feedback=feedback,
            alternatives=alternatives,
            quick_wins=quick_wins[:3]
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

def calculate_platform_fit(ad_input: AdInput) -> float:
    """Calculate platform fit score - simplified version"""
    score = 75  # Base score
    
    if ad_input.platform == "facebook":
        # Facebook prefers shorter, punchier content
        headline_words = len(ad_input.headline.split())
        if 3 <= headline_words <= 6:
            score += 15
        body_length = len(ad_input.body_text)
        if 50 <= body_length <= 125:
            score += 10
            
    elif ad_input.platform == "google":
        # Google prefers direct, keyword-rich content
        if len(ad_input.headline) <= 30:
            score += 20
        if len(ad_input.body_text) <= 90:
            score += 10
            
    elif ad_input.platform == "linkedin":
        # LinkedIn accepts longer, professional content
        professional_words = ['business', 'professional', 'industry', 'solution', 'enterprise']
        if any(word in ad_input.body_text.lower() for word in professional_words):
            score += 15
            
    return min(100, score)

def calculate_emotion_score(text: str) -> float:
    """Calculate emotion score using keyword detection"""
    emotion_keywords = {
        'excitement': ['amazing', 'incredible', 'awesome', 'fantastic', 'wow', 'breakthrough'],
        'urgency': ['now', 'today', 'limited', 'hurry', 'expires', 'soon', 'deadline'],
        'trust': ['proven', 'guaranteed', 'trusted', 'verified', 'secure', 'reliable'],
        'benefit': ['save', 'free', 'discount', 'bonus', 'exclusive', 'special']
    }
    
    text_lower = text.lower()
    emotion_count = 0
    
    for category, words in emotion_keywords.items():
        if any(word in text_lower for word in words):
            emotion_count += 1
    
    return min(100, emotion_count * 20 + 20)  # Base score of 20, up to 100

def calculate_overall_score(clarity: float, persuasion: float, emotion: float, cta: float, platform_fit: float) -> float:
    """Calculate weighted overall score"""
    weights = {
        'clarity': 0.2,
        'persuasion': 0.25,
        'emotion': 0.2,
        'cta': 0.25,
        'platform_fit': 0.1
    }
    
    overall = (
        clarity * weights['clarity'] +
        persuasion * weights['persuasion'] +
        emotion * weights['emotion'] +
        cta * weights['cta'] +
        platform_fit * weights['platform_fit']
    )
    
    return round(overall, 1)

def generate_feedback(clarity_analysis: dict, cta_analysis: dict, scores: AdScore) -> str:
    """Generate human-readable feedback"""
    feedback_parts = []
    
    if scores.overall_score >= 80:
        feedback_parts.append("Excellent ad copy! Your content is well-optimized.")
    elif scores.overall_score >= 60:
        feedback_parts.append("Good ad copy with room for improvement.")
    else:
        feedback_parts.append("Your ad copy needs optimization to improve performance.")
    
    if scores.clarity_score < 70:
        feedback_parts.append("Consider simplifying your language for better readability.")
    
    if scores.cta_strength < 70:
        feedback_parts.append("Your call-to-action could be stronger and more compelling.")
        
    if scores.emotion_score < 60:
        feedback_parts.append("Add more emotional triggers to connect with your audience.")
    
    return " ".join(feedback_parts)

def generate_template_alternatives(ad_input: AdInput) -> List[AdAlternative]:
    """Generate template-based alternatives"""
    alternatives = []
    
    # Persuasive variant
    alternatives.append(AdAlternative(
        variant_type="persuasive",
        headline=f"Proven: {ad_input.headline}",
        body_text=f"Join thousands who already discovered {ad_input.body_text.lower()}",
        cta="Get Started Now",
        improvement_reason="Added social proof and strong action language"
    ))
    
    # Emotional variant
    alternatives.append(AdAlternative(
        variant_type="emotional", 
        headline=f"Transform Your Business with {ad_input.headline}",
        body_text=f"Imagine the results: {ad_input.body_text}",
        cta="Claim Your Success",
        improvement_reason="Enhanced emotional appeal and aspiration"
    ))
    
    # Urgency variant
    alternatives.append(AdAlternative(
        variant_type="urgency",
        headline=f"{ad_input.headline} - Limited Time",
        body_text=f"Don't wait! {ad_input.body_text} Act fast - offer expires soon.",
        cta="Act Now",
        improvement_reason="Added urgency and scarcity to drive immediate action"
    ))
    
    return alternatives

# === NEW MULTI-INPUT ENDPOINTS ===

@app.post("/api/ads/parse", response_model=ParsedAdsResponse)
async def parse_ad_text(request: ParseRequest):
    """Parse pasted ad copy text into structured ad components"""
    try:
        result = parse_ad_copy_from_text(request.text, request.platform)
        
        return ParsedAdsResponse(
            ads=result['ads'],
            count=result.get('count', len(result['ads'])),
            warning=result.get('warning'),
            error=result.get('error')
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Parsing failed: {str(e)}")

@app.post("/api/ads/parse-file", response_model=ParsedAdsResponse)
async def parse_file_upload(file: UploadFile = File(...), platform: str = Form("facebook"), user_id: str = Form(None)):
    """Parse uploaded file and extract ad copy"""
    try:
        # Validate file type
        if not is_supported_file(file.filename):
            raise HTTPException(status_code=400, detail=f"Unsupported file type. File: {file.filename}")
        
        # Read file content
        file_content = await file.read()
        
        # Extract text from file
        extracted_text = extract_text_from_file(file.filename, file_content)
        
        if not extracted_text.strip():
            raise HTTPException(status_code=400, detail="No text could be extracted from the file")
        
        # Parse extracted text into ad components
        result = parse_ad_copy_from_text(extracted_text, platform)
        
        # Add file metadata to results
        for ad in result['ads']:
            ad['source_file'] = file.filename
            ad['source_type'] = 'file_upload'
        
        return ParsedAdsResponse(
            ads=result['ads'],
            count=result.get('count', len(result['ads'])),
            warning=result.get('warning'),
            error=result.get('error')
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"File processing failed: {str(e)}")

@app.post("/api/ads/generate", response_model=ParsedAdsResponse)
async def generate_ad_copy(request: GenerateRequest):
    """Generate ad copy variations using AI"""
    try:
        # Generate template-based alternatives for now
        # TODO: Integrate with OpenAI API when available
        
        generated_ads = []
        
        for i in range(request.numVariations):
            base_headline = f"Transform Your Business with {request.productService}"
            if i == 1:
                base_headline = f"Discover {request.productService} - {request.valueProposition}"
            elif i == 2:
                base_headline = f"Get Results with {request.productService}"
            
            # Add emojis if requested
            if request.includeEmojis:
                emoji_options = ['🚀', '✨', '💡', '🎯', '🔥', '⭐']
                base_headline = f"{emoji_options[i % len(emoji_options)]} {base_headline}"
            
            # Create body text
            body_parts = [request.valueProposition]
            if request.targetAudience:
                body_parts.append(f"Perfect for {request.targetAudience}.")
            if request.keyBenefits:
                body_parts.append(request.keyBenefits)
            
            # Add urgency if requested
            if request.includeUrgency and i == 0:
                body_parts.append("Limited time offer - act now!")
            
            # Add stats if requested
            if request.includeStats and i == 1:
                body_parts.append("Join 10,000+ satisfied customers who've seen 40% better results.")
            
            body_text = ' '.join(body_parts)
            
            # Create CTA based on tone
            cta_options = {
                'professional': 'Get Started Today',
                'casual': 'Try It Free!',
                'urgent': 'Act Now - Limited Time',
                'luxury': 'Experience Excellence',
                'playful': 'Let\'s Do This!',
                'authoritative': 'Start Your Success'
            }
            
            cta = cta_options.get(request.tone, 'Learn More')
            if request.includeUrgency and i == 0:
                cta = f"{cta} - Limited Time"
            
            generated_ad = {
                'headline': base_headline,
                'body_text': body_text,
                'cta': cta,
                'platform': request.platform,
                'industry': request.industry or '',
                'target_audience': request.targetAudience or '',
                'source_type': 'ai_generated',
                'generation_params': {
                    'tone': request.tone,
                    'variation_index': i,
                    'include_emojis': request.includeEmojis,
                    'include_urgency': request.includeUrgency,
                    'include_stats': request.includeStats
                }
            }
            
            generated_ads.append(generated_ad)
        
        return ParsedAdsResponse(
            ads=generated_ads,
            count=len(generated_ads),
            warning=None,
            error=None
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Generation failed: {str(e)}")

@app.post("/api/ads/analyze/batch", response_model=BatchAnalysisResponse)
async def analyze_ads_batch(request: BatchAnalysisRequest):
    """Analyze multiple ads in batch"""
    try:
        results = []
        analysis_ids = []
        success_count = 0
        
        for i, ad_input in enumerate(request.ads):
            try:
                # Use the existing single ad analysis logic
                full_text = f"{ad_input.headline} {ad_input.body_text} {ad_input.cta}"
                
                # Run readability analysis
                clarity_analysis = readability_analyzer.analyze_clarity(full_text)
                power_analysis = readability_analyzer.analyze_power_words(full_text)
                
                # Run CTA analysis
                cta_analysis = cta_analyzer.analyze_cta(ad_input.cta, ad_input.platform)
                
                # Calculate platform fit
                platform_fit_score = calculate_platform_fit(ad_input)
                
                # Calculate scores
                scores = AdScore(
                    clarity_score=clarity_analysis['clarity_score'],
                    persuasion_score=power_analysis.get('power_score', 50),
                    emotion_score=calculate_emotion_score(full_text),
                    cta_strength=cta_analysis['cta_strength_score'],
                    platform_fit_score=platform_fit_score,
                    overall_score=calculate_overall_score(
                        clarity_analysis['clarity_score'],
                        power_analysis.get('power_score', 50),
                        calculate_emotion_score(full_text),
                        cta_analysis['cta_strength_score'],
                        platform_fit_score
                    )
                )
                
                # Generate feedback
                feedback = generate_feedback(clarity_analysis, cta_analysis, scores)
                
                # Generate alternatives
                alternatives = generate_template_alternatives(ad_input)
                
                # Generate quick wins
                quick_wins = []
                quick_wins.extend(clarity_analysis.get('recommendations', [])[:2])
                quick_wins.extend(cta_analysis.get('recommendations', [])[:1])
                
                analysis_id = f"batch_analysis_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{i}"
                analysis_ids.append(analysis_id)
                
                result = AdAnalysisResponse(
                    analysis_id=analysis_id,
                    scores=scores,
                    feedback=feedback,
                    alternatives=alternatives,
                    quick_wins=quick_wins[:3]
                )
                
                results.append(result)
                success_count += 1
                
            except Exception as e:
                # Log error but continue with other ads
                print(f"Error analyzing ad {i}: {str(e)}")
                continue
        
        warning = None
        if success_count < len(request.ads):
            warning = f"Successfully analyzed {success_count} out of {len(request.ads)} ads"
        
        return BatchAnalysisResponse(
            analysis_ids=analysis_ids,
            success_count=success_count,
            total_count=len(request.ads),
            results=results,
            warning=warning
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Batch analysis failed: {str(e)}")

@app.get("/api/ads/tools/status")
async def get_tools_status():
    """Get status of all analysis tools"""
    return {
        "tools": {
            "ReadabilityAnalyzer": {"status": "✅ Fully Functional", "features": ["Flesch score", "Grade level", "Power words"]},
            "CTAAnalyzer": {"status": "✅ Fully Functional", "features": ["Strength scoring", "Platform optimization", "Suggestions"]},
            "PlatformOptimizer": {"status": "✅ Basic Version", "features": ["Platform-specific scoring", "Content length optimization"]},
            "EmotionAnalyzer": {"status": "✅ Keyword-based", "features": ["Emotion detection", "Keyword analysis"]},
            "AIGenerator": {"status": "✅ Template-based", "features": ["3 variant types", "Improvement reasons"]},
            "CompetitorAnalyzer": {"status": "⚠️ Planned", "features": ["Coming soon"]},
            "AnalyticsDashboard": {"status": "⚠️ Planned", "features": ["Coming soon"]},
            "PDFReports": {"status": "⚠️ Planned", "features": ["Coming soon"]},
            "SubscriptionManager": {"status": "✅ Logic Ready", "features": ["Tier validation", "Usage limits"]}
        },
        "overall_status": "MVP Ready - Core analysis functional",
        "launch_ready": True
    }

@app.get("/api/test")
async def test_endpoint():
    """Test endpoint to verify API is working"""
    return {
        "status": "success",
        "message": "AdCopySurge API is working correctly",
        "timestamp": datetime.now().isoformat(),
        "core_tools": ["ReadabilityAnalyzer", "CTAAnalyzer", "PlatformOptimizer", "EmotionAnalyzer", "AIGenerator"]
    }

if __name__ == "__main__":
    uvicorn.run(
        "main_launch_ready:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
