from sqlalchemy import Column, Integer, String, Float, Text, JSON, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class AdAnalysis(Base):
    __tablename__ = "ad_analyses"
    
    id = Column(String, primary_key=True, index=True)  # UUID
    user_id = Column(String, ForeignKey("user_profiles.id"), nullable=False)  # Changed to match user_profiles
    
    # Ad content
    headline = Column(String, nullable=False)
    body_text = Column(Text, nullable=False)
    cta = Column(String, nullable=False)
    platform = Column(String, nullable=False)
    target_audience = Column(String, nullable=True)
    industry = Column(String, nullable=True)
    
    # Scores
    overall_score = Column(Float, nullable=False)
    clarity_score = Column(Float, nullable=False)
    persuasion_score = Column(Float, nullable=False)
    emotion_score = Column(Float, nullable=False)
    cta_strength_score = Column(Float, nullable=False)
    platform_fit_score = Column(Float, nullable=False)
    
    # Detailed analysis data (stored as JSON)
    analysis_data = Column(JSON, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="analyses")
    competitor_benchmarks = relationship("CompetitorBenchmark", back_populates="analysis", cascade="all, delete-orphan")
    generated_alternatives = relationship("AdGeneration", back_populates="analysis", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<AdAnalysis(id='{self.id}', score={self.overall_score}, platform='{self.platform}')>"
    
    def to_dict(self):
        """Convert analysis to dictionary for API responses"""
        return {
            "id": self.id,
            "user_id": self.user_id,
            "headline": self.headline,
            "body_text": self.body_text,
            "cta": self.cta,
            "platform": self.platform,
            "target_audience": self.target_audience,
            "industry": self.industry,
            "scores": {
                "overall_score": self.overall_score,
                "clarity_score": self.clarity_score,
                "persuasion_score": self.persuasion_score,
                "emotion_score": self.emotion_score,
                "cta_strength_score": self.cta_strength_score,
                "platform_fit_score": self.platform_fit_score
            },
            "analysis_data": self.analysis_data,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }

class CompetitorBenchmark(Base):
    __tablename__ = "competitor_benchmarks"
    
    id = Column(Integer, primary_key=True, index=True)
    analysis_id = Column(String, ForeignKey("ad_analyses.id"), nullable=False)
    
    # Competitor ad content
    competitor_headline = Column(String, nullable=False)
    competitor_body_text = Column(Text, nullable=False)
    competitor_cta = Column(String, nullable=False)
    competitor_platform = Column(String, nullable=False)
    source_url = Column(String, nullable=True)
    
    # Competitor scores
    competitor_overall_score = Column(Float, nullable=False)
    competitor_clarity_score = Column(Float, nullable=False)
    competitor_emotion_score = Column(Float, nullable=False)
    competitor_cta_score = Column(Float, nullable=False)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationship
    analysis = relationship("AdAnalysis", back_populates="competitor_benchmarks")
    
    def __repr__(self):
        return f"<CompetitorBenchmark(id={self.id}, score={self.competitor_overall_score})>"

class AdGeneration(Base):
    __tablename__ = "ad_generations"
    
    id = Column(Integer, primary_key=True, index=True)
    analysis_id = Column(String, ForeignKey("ad_analyses.id"), nullable=False)
    
    # Generated content
    variant_type = Column(String, nullable=False)  # persuasive, emotional, stats_heavy, etc.
    generated_headline = Column(String, nullable=False)
    generated_body_text = Column(Text, nullable=False)
    generated_cta = Column(String, nullable=False)
    improvement_reason = Column(Text, nullable=True)
    
    # Performance prediction
    predicted_score = Column(Float, nullable=True)
    
    # User feedback
    user_rating = Column(Integer, nullable=True)  # 1-5 stars
    user_selected = Column(Boolean, default=False)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationship
    analysis = relationship("AdAnalysis", back_populates="generated_alternatives")
    
    def __repr__(self):
        return f"<AdGeneration(id={self.id}, variant='{self.variant_type}', score={self.predicted_score})>"
    
    def to_dict(self):
        """Convert generation to dictionary for API responses"""
        return {
            "id": self.id,
            "analysis_id": self.analysis_id,
            "variant_type": self.variant_type,
            "generated_headline": self.generated_headline,
            "generated_body_text": self.generated_body_text,
            "generated_cta": self.generated_cta,
            "improvement_reason": self.improvement_reason,
            "predicted_score": self.predicted_score,
            "user_rating": self.user_rating,
            "user_selected": self.user_selected,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }
