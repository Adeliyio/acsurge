from pydantic_settings import BaseSettings
from pydantic import Field
from typing import List, Optional
import os

class Settings(BaseSettings):
    # App settings
    APP_NAME: str = "AdCopySurge"
    VERSION: str = "1.0.0"
    DEBUG: bool = Field(default=True)  # Change to False in production
    HOST: str = "127.0.0.1"
    PORT: int = 8000
    
    # Security
    SECRET_KEY: str = "your-secret-key-change-this-in-production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    ALGORITHM: str = "HS256"
    
    # Database
    DATABASE_URL: str = "postgresql://localhost/adcopysurge"
    
    # CORS
    ALLOWED_HOSTS: List[str] = ["http://localhost:3000", "http://127.0.0.1:3000"]
    
    # AI APIs
    OPENAI_API_KEY: Optional[str] = None
    HUGGINGFACE_API_KEY: Optional[str] = None
    
    # Redis (for caching and background tasks)
    REDIS_URL: str = "redis://localhost:6379"
    
    # Email
    MAIL_USERNAME: Optional[str] = None
    MAIL_PASSWORD: Optional[str] = None
    MAIL_FROM: Optional[str] = None
    MAIL_PORT: int = 587
    MAIL_SERVER: str = "smtp.gmail.com"
    
    # Subscription pricing
    BASIC_PLAN_PRICE: int = 49  # $49/month
    PRO_PLAN_PRICE: int = 99    # $99/month
    
    # Stripe (Legacy - will be removed after Paddle migration)
    STRIPE_PUBLISHABLE_KEY: Optional[str] = None
    STRIPE_SECRET_KEY: Optional[str] = None
    STRIPE_WEBHOOK_SECRET: Optional[str] = None
    
    # Paddle Billing
    PADDLE_VENDOR_ID: Optional[str] = None
    PADDLE_AUTH_CODE: Optional[str] = None  # API Auth Code
    PADDLE_PUBLIC_KEY: Optional[str] = None  # For webhook signature verification
    PADDLE_ENVIRONMENT: str = "sandbox"  # sandbox or live
    PADDLE_API_URL: str = "https://sandbox-vendors.paddle.com/api"  # Will change to live URL in production
    
    # Environment
    NODE_ENV: str = "development"
    
    # Monitoring & Logging
    SENTRY_DSN: Optional[str] = None
    LOG_LEVEL: str = "info"
    
    # Feature Flags
    ENABLE_ANALYTICS: bool = True
    ENABLE_COMPETITOR_ANALYSIS: bool = True
    ENABLE_PDF_REPORTS: bool = True
    
    class Config:
        env_file = ".env"

settings = Settings()
