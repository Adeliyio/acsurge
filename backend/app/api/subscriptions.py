from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from app.core.database import get_db
from app.services.subscription_service import SubscriptionService  # Legacy Stripe service
# from app.services.paddle_service import PaddleService  # Temporarily disabled
from app.services.auth_service import AuthService
from app.api.auth import oauth2_scheme
from app.core.logging import get_logger

logger = get_logger(__name__)

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
    
    # Use legacy service temporarily (will switch to Paddle after MVP)
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

# NEW PADDLE ENDPOINTS

@router.post("/paddle/checkout")
async def create_paddle_checkout(
    subscription_data: SubscriptionUpdate,
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme)
):
    """Create Paddle checkout link for subscription upgrade"""
    auth_service = AuthService(db)
    user = auth_service.get_current_user(token)
    
    if not user:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    paddle_service = PaddleService(db)
    
    # Map tier to Paddle plan ID (you'll need to configure these in Paddle dashboard)
    plan_mapping = {
        "basic": "basic_monthly",  # Replace with actual Paddle product ID
        "pro": "pro_monthly"      # Replace with actual Paddle product ID
    }
    
    plan_id = plan_mapping.get(subscription_data.tier)
    if not plan_id:
        raise HTTPException(status_code=400, detail="Invalid subscription tier")
    
    # Create pay link
    result = paddle_service.create_pay_link(
        plan_id=plan_id,
        user=user,
        success_redirect="http://localhost:3000/dashboard?success=true",
        cancel_redirect="http://localhost:3000/pricing"
    )
    
    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("error", "Failed to create checkout"))
    
    return {
        "checkout_url": result["pay_link"],
        "expires_at": result["expires_at"]
    }

@router.post("/paddle/webhook")
async def paddle_webhook(
    request: Request,
    db: Session = Depends(get_db)
):
    """Handle Paddle webhooks"""
    try:
        # Get raw body and headers
        body = await request.body()
        signature = request.headers.get("X-Paddle-Signature", "")
        
        paddle_service = PaddleService(db)
        
        # Verify webhook signature (optional but recommended)
        # if not paddle_service.verify_webhook(body, signature):
        #     raise HTTPException(status_code=401, detail="Invalid webhook signature")
        
        # Parse form data (Paddle sends form-encoded data)
        form_data = await request.form()
        webhook_data = dict(form_data)
        
        # Process the webhook
        result = paddle_service.process_webhook(webhook_data)
        
        if result.get("success"):
            return {"status": "ok"}
        else:
            logger.error(f"Webhook processing failed: {result}")
            return {"status": "error", "message": result.get("error")}
            
    except Exception as e:
        logger.error(f"Webhook error: {e}")
        raise HTTPException(status_code=500, detail="Webhook processing failed")

@router.post("/paddle/cancel")
async def cancel_paddle_subscription(
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme)
):
    """Cancel Paddle subscription"""
    auth_service = AuthService(db)
    user = auth_service.get_current_user(token)
    
    if not user:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    if not getattr(user, 'paddle_subscription_id', None):
        raise HTTPException(status_code=400, detail="No active subscription found")
    
    paddle_service = PaddleService(db)
    result = paddle_service.cancel_subscription(user.paddle_subscription_id)
    
    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("error", "Failed to cancel subscription"))
    
    return result
