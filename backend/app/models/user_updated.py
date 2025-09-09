from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import enum

class SubscriptionTier(enum.Enum):
    FREE = "free"
    BASIC = "basic"
    PRO = "pro"

class User(Base):
    __tablename__ = "user_profiles"  # Changed to match Supabase table name
    
    # Changed from Integer to String to match Supabase UUID
    id = Column(String, primary_key=True, index=True)  # UUID from Supabase auth.users
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=True)  # Optional since Supabase handles auth
    full_name = Column(String, nullable=False)
    company = Column(String, nullable=True)
    
    # Subscription info
    subscription_tier = Column(Enum(SubscriptionTier), default=SubscriptionTier.FREE)
    monthly_analyses = Column(Integer, default=0)
    subscription_active = Column(Boolean, default=True)
    
    # Legacy Stripe fields (will be removed after migration)
    stripe_customer_id = Column(String, nullable=True)
    
    # Paddle billing fields
    paddle_subscription_id = Column(String, nullable=True, index=True)
    paddle_plan_id = Column(String, nullable=True)
    paddle_checkout_id = Column(String, nullable=True)
    
    # Account status
    is_active = Column(Boolean, default=True)
    email_verified = Column(Boolean, default=False)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships (these were missing in the original model)
    analyses = relationship("AdAnalysis", back_populates="user", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<User(email='{self.email}', subscription='{self.subscription_tier.value}')>"
    
    def get_analysis_limit(self):
        """Get the monthly analysis limit based on subscription tier"""
        limits = {
            SubscriptionTier.FREE: 5,
            SubscriptionTier.BASIC: 100,
            SubscriptionTier.PRO: 500
        }
        return limits.get(self.subscription_tier, 0)
    
    def can_analyze(self):
        """Check if user can perform another analysis this month"""
        return self.monthly_analyses < self.get_analysis_limit()
    
    def increment_analysis_count(self):
        """Increment the monthly analysis count"""
        self.monthly_analyses += 1
