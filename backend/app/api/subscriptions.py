from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.core.database import get_db
from app.services.subscription_service import SubscriptionService
from app.services.auth_service import AuthService
from app.api.auth import oauth2_scheme

router = APIRouter()

class SubscriptionPlan(BaseModel):
    tier: str  # free, basic, pro
    price: int
    features: List[str]
    monthly_analysis_limit: int

class SubscriptionUpdate(BaseModel):
    tier: str
    payment_method_id: Optional[str] = None

@router.get("/plans")
async def get_subscription_plans():
    """Get available subscription plans"""
    return {
        "plans": [
            {
                "tier": "free",
                "price": 0,
                "monthly_analysis_limit": 5,
                "features": [
                    "5 ad analyses per month",
                    "Basic scoring",
                    "Limited alternatives"
                ]
            },
            {
                "tier": "basic",
                "price": 49,
                "monthly_analysis_limit": 100,
                "features": [
                    "100 ad analyses per month",
                    "Full AI analysis",
                    "Unlimited alternatives",
                    "Competitor benchmarking",
                    "PDF reports"
                ]
            },
            {
                "tier": "pro",
                "price": 99,
                "monthly_analysis_limit": 500,
                "features": [
                    "500 ad analyses per month",
                    "Premium AI models",
                    "Advanced competitor analysis",
                    "White-label reports",
                    "API access",
                    "Priority support"
                ]
            }
        ]
    }

@router.get("/current")
async def get_current_subscription(
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme)
):
    """Get user's current subscription details"""
    auth_service = AuthService(db)
    user = auth_service.get_current_user(token)
    
    if not user:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    subscription_service = SubscriptionService(db)
    subscription = subscription_service.get_user_subscription(user.id)
    
    return subscription

@router.post("/upgrade")
async def upgrade_subscription(
    subscription_data: SubscriptionUpdate,
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme)
):
    """Upgrade user subscription"""
    auth_service = AuthService(db)
    user = auth_service.get_current_user(token)
    
    if not user:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    subscription_service = SubscriptionService(db)
    result = await subscription_service.upgrade_subscription(
        user.id, 
        subscription_data.tier,
        subscription_data.payment_method_id
    )
    
    return result

@router.post("/cancel")
async def cancel_subscription(
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme)
):
    """Cancel user subscription"""
    auth_service = AuthService(db)
    user = auth_service.get_current_user(token)
    
    if not user:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    subscription_service = SubscriptionService(db)
    result = await subscription_service.cancel_subscription(user.id)
    
    return result
