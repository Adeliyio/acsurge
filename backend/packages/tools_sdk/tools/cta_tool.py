"""
SDK-compatible wrapper for the CTA Analyzer tool
"""

import time
from typing import Dict, Any
from ..core import ToolRunner, ToolInput, ToolOutput, ToolConfig, ToolType
from ..exceptions import ToolValidationError, ToolDependencyError

# Import the original analyzer
try:
    from app.services.cta_analyzer import CTAAnalyzer
except ImportError:
    CTAAnalyzer = None


class CTAToolRunner(ToolRunner):
    """SDK-compatible wrapper for CTAAnalyzer"""
    
    def __init__(self, config: ToolConfig):
        super().__init__(config)
        
        if CTAAnalyzer is None:
            raise ToolDependencyError(
                self.name,
                "CTAAnalyzer service", 
                "Ensure app.services.cta_analyzer is available"
            )
        
        self.analyzer = CTAAnalyzer()
    
    async def run(self, input_data: ToolInput) -> ToolOutput:
        """Execute CTA analysis"""
        start_time = time.time()
        
        try:
            # Run CTA analysis
            result = self.analyzer.analyze_cta(input_data.cta, input_data.platform)
            
            # Map results to SDK format
            scores = {
                'cta_strength': result.get('cta_strength_score', 0),
                'platform_fit': result.get('platform_fit', 0)
            }
            
            insights = {
                'word_count': result.get('word_count', 0),
                'has_action_verb': result.get('has_action_verb', False),
                'has_urgency': result.get('has_urgency', False),
                'cta_category': self._categorize_cta_strength(result.get('cta_strength_score', 0)),
                'platform_analysis': {
                    'platform': input_data.platform,
                    'fit_score': result.get('platform_fit', 0),
                    'platform_specific_tips': self._get_platform_tips(input_data.platform)
                }
            }
            
            recommendations = result.get('recommendations', [])
            
            # Add SDK-specific recommendations
            if scores['cta_strength'] < 70:
                recommendations.append("CTA strength is below optimal - consider stronger action words")
            
            if scores['platform_fit'] < 80:
                recommendations.append(f"CTA could be better optimized for {input_data.platform} platform")
            
            execution_time = time.time() - start_time
            
            return ToolOutput(
                tool_name=self.name,
                tool_type=self.tool_type,
                success=True,
                scores=scores,
                insights=insights,
                recommendations=recommendations,
                execution_time=execution_time,
                request_id=input_data.request_id,
                confidence_score=self._calculate_confidence(result)
            )
            
        except Exception as e:
            execution_time = time.time() - start_time
            
            return ToolOutput(
                tool_name=self.name,
                tool_type=self.tool_type,
                success=False,
                execution_time=execution_time,
                request_id=input_data.request_id,
                error_message=str(e)
            )
    
    def validate_input(self, input_data: ToolInput) -> bool:
        """Validate input data for CTA analysis"""
        missing_fields = []
        
        if not input_data.cta.strip():
            missing_fields.append('cta')
        if not input_data.platform.strip():
            missing_fields.append('platform')
        
        if missing_fields:
            raise ToolValidationError(
                self.name,
                f"Missing or empty required fields: {missing_fields}",
                missing_fields
            )
        
        # Validate platform
        supported_platforms = ['facebook', 'google', 'linkedin', 'tiktok', 'instagram']
        if input_data.platform.lower() not in supported_platforms:
            raise ToolValidationError(
                self.name,
                f"Unsupported platform: {input_data.platform}. Supported: {supported_platforms}"
            )
        
        return True
    
    def get_output_scores(self) -> list:
        """Get list of scores this tool outputs"""
        return ['cta_strength', 'platform_fit']
    
    def get_supported_platforms(self) -> list:
        """Get list of supported platforms"""
        return ['facebook', 'google', 'linkedin', 'tiktok', 'instagram']
    
    def _categorize_cta_strength(self, score: float) -> str:
        """Categorize CTA strength based on score"""
        if score >= 90:
            return "excellent"
        elif score >= 80:
            return "strong"
        elif score >= 70:
            return "good"
        elif score >= 60:
            return "fair"
        else:
            return "weak"
    
    def _get_platform_tips(self, platform: str) -> list:
        """Get platform-specific CTA tips"""
        tips = {
            'facebook': [
                "Use emotional triggers",
                "Keep it short and punchy",
                "Consider emoji usage"
            ],
            'google': [
                "Be specific and direct",
                "Include value proposition",
                "Use action-oriented language"
            ],
            'linkedin': [
                "Professional tone works best",
                "Focus on business value",
                "Longer CTAs are acceptable"
            ],
            'tiktok': [
                "Keep it extremely short",
                "Use trendy language",
                "Create urgency"
            ],
            'instagram': [
                "Visual-first approach",
                "Use story-telling",
                "Include hashtag strategy"
            ]
        }
        
        return tips.get(platform.lower(), ["Use clear, action-oriented language"])
    
    def _calculate_confidence(self, result: Dict[str, Any]) -> float:
        """Calculate confidence score for the analysis"""
        # Higher confidence for CTAs that clearly match patterns
        strength_score = result.get('cta_strength_score', 0)
        has_action_verb = result.get('has_action_verb', False)
        
        if has_action_verb and strength_score > 70:
            confidence = 95.0
        elif has_action_verb or strength_score > 50:
            confidence = 85.0
        else:
            confidence = 75.0
        
        return confidence
    
    @classmethod
    def default_config(cls) -> ToolConfig:
        """Get default configuration for this tool"""
        return ToolConfig(
            name="cta_analyzer",
            tool_type=ToolType.ANALYZER,
            timeout=5.0,
            parameters={
                'min_strength_threshold': 70,
                'platform_fit_weight': 0.3
            }
        )