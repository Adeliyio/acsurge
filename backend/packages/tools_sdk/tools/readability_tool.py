"""
SDK-compatible wrapper for the Readability Analyzer tool
"""

import time
from typing import Dict, Any
from ..core import ToolRunner, ToolInput, ToolOutput, ToolConfig, ToolType
from ..exceptions import ToolValidationError, ToolExecutionError, ToolDependencyError

# Import the original analyzer
try:
    from app.services.readability_analyzer import ReadabilityAnalyzer
except ImportError:
    ReadabilityAnalyzer = None


class ReadabilityToolRunner(ToolRunner):
    """SDK-compatible wrapper for ReadabilityAnalyzer"""
    
    def __init__(self, config: ToolConfig):
        super().__init__(config)
        
        if ReadabilityAnalyzer is None:
            raise ToolDependencyError(
                self.name, 
                "ReadabilityAnalyzer service",
                "Ensure app.services.readability_analyzer is available"
            )
        
        self.analyzer = ReadabilityAnalyzer()
    
    async def run(self, input_data: ToolInput) -> ToolOutput:
        """Execute readability analysis"""
        start_time = time.time()
        
        try:
            # Combine text for analysis
            full_text = f"{input_data.headline} {input_data.body_text} {input_data.cta}"
            
            # Run clarity analysis
            clarity_result = self.analyzer.analyze_clarity(full_text)
            
            # Run power words analysis
            power_result = self.analyzer.analyze_power_words(full_text)
            
            # Map results to SDK format
            scores = {
                'clarity_score': clarity_result.get('clarity_score', 0),
                'flesch_reading_ease': clarity_result.get('flesch_reading_ease', 0),
                'power_score': power_result.get('power_score', 0)
            }
            
            insights = {
                'grade_level': clarity_result.get('grade_level', 0),
                'word_count': clarity_result.get('word_count', 0),
                'sentence_count': clarity_result.get('sentence_count', 0),
                'avg_words_per_sentence': clarity_result.get('avg_words_per_sentence', 0),
                'power_words_found': power_result.get('power_words_found', []),
                'power_word_density': power_result.get('power_word_density', 0)
            }
            
            recommendations = clarity_result.get('recommendations', [])
            
            # Add power word recommendations
            if power_result.get('power_word_count', 0) < 2:
                recommendations.append("Consider adding more power words to increase impact")
            elif power_result.get('power_word_count', 0) > 4:
                recommendations.append("Too many power words may reduce credibility - consider reducing")
            
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
                confidence_score=self._calculate_confidence(clarity_result, power_result)
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
        """Validate input data for readability analysis"""
        missing_fields = []
        
        if not input_data.headline.strip():
            missing_fields.append('headline')
        if not input_data.body_text.strip():
            missing_fields.append('body_text')
        if not input_data.cta.strip():
            missing_fields.append('cta')
        
        if missing_fields:
            raise ToolValidationError(
                self.name,
                f"Missing or empty required fields: {missing_fields}",
                missing_fields
            )
        
        return True
    
    def get_output_scores(self) -> list:
        """Get list of scores this tool outputs"""
        return ['clarity_score', 'flesch_reading_ease', 'power_score']
    
    def _calculate_confidence(self, clarity_result: Dict[str, Any], power_result: Dict[str, Any]) -> float:
        """Calculate confidence score for the analysis"""
        # Higher confidence for longer text with more words
        word_count = clarity_result.get('word_count', 0)
        
        if word_count >= 20:
            confidence = 95.0
        elif word_count >= 10:
            confidence = 85.0
        elif word_count >= 5:
            confidence = 75.0
        else:
            confidence = 65.0
        
        return confidence
    
    @classmethod
    def default_config(cls) -> ToolConfig:
        """Get default configuration for this tool"""
        return ToolConfig(
            name="readability_analyzer",
            tool_type=ToolType.ANALYZER,
            timeout=10.0,
            parameters={
                'min_text_length': 5,
                'target_grade_level': 8
            }
        )