from transformers import pipeline, AutoTokenizer, AutoModelForSequenceClassification
import torch
from typing import Dict, Any, List
import re

class EmotionAnalyzer:
    """Analyzes emotional content and sentiment in ad copy"""
    
    def __init__(self):
        # Initialize emotion classification model
        try:
            self.emotion_classifier = pipeline(
                "text-classification",
                model="j-hartmann/emotion-english-distilroberta-base",
                device=0 if torch.cuda.is_available() else -1
            )
        except Exception:
            # Fallback to basic sentiment
            self.emotion_classifier = pipeline("sentiment-analysis")
        
        # Emotion words mapping
        self.emotion_words = {
            'joy': ['happy', 'excited', 'thrilled', 'delighted', 'amazing', 'fantastic'],
            'fear': ['worried', 'concerned', 'afraid', 'risky', 'dangerous', 'problem'],
            'anger': ['frustrated', 'annoyed', 'hate', 'terrible', 'awful', 'worst'],
            'sadness': ['sad', 'disappointed', 'regret', 'sorry', 'unfortunate'],
            'surprise': ['incredible', 'unbelievable', 'shocking', 'stunning', 'wow'],
            'trust': ['trusted', 'reliable', 'proven', 'guaranteed', 'secure', 'safe'],
            'urgency': ['now', 'today', 'limited', 'hurry', 'deadline', 'expires', 'quick']
        }
    
    def analyze_emotion(self, text: str) -> Dict[str, Any]:
        """Analyze emotional content of text"""
        try:
            # Get emotion predictions
            emotions = self.emotion_classifier(text)
            
            # Analyze emotion words
            emotion_word_analysis = self._analyze_emotion_words(text)
            
            # Calculate emotional intensity
            intensity = self._calculate_emotional_intensity(text)
            
            # Generate emotion score (0-100)
            emotion_score = self._calculate_emotion_score(emotions, emotion_word_analysis, intensity)
            
            return {
                'emotion_score': emotion_score,
                'primary_emotion': emotions[0]['label'] if emotions else 'neutral',
                'emotion_confidence': emotions[0]['score'] if emotions else 0.5,
                'emotion_breakdown': emotion_word_analysis,
                'emotional_intensity': intensity,
                'recommendations': self._get_emotion_recommendations(emotions, emotion_word_analysis)
            }
        except Exception as e:
            # Fallback analysis
            return self._fallback_emotion_analysis(text)
    
    def _analyze_emotion_words(self, text: str) -> Dict[str, Any]:
        """Analyze presence of emotion-triggering words"""
        text_lower = text.lower()
        emotion_breakdown = {}
        
        for emotion, words in self.emotion_words.items():
            found_words = [word for word in words if word in text_lower]
            emotion_breakdown[emotion] = {
                'count': len(found_words),
                'words': found_words,
                'score': min(100, len(found_words) * 20)
            }
        
        return emotion_breakdown
    
    def _calculate_emotional_intensity(self, text: str) -> float:
        """Calculate overall emotional intensity"""
        # Count emotional indicators
        exclamation_marks = text.count('!')
        caps_words = len(re.findall(r'\b[A-Z]{2,}\b', text))
        
        # Emotional punctuation and formatting
        intensity_indicators = exclamation_marks + caps_words
        
        # Normalize to 0-100 scale
        intensity = min(100, intensity_indicators * 25)
        
        return intensity
    
    def _calculate_emotion_score(self, emotions: List[Dict], emotion_words: Dict, intensity: float) -> float:
        """Calculate overall emotion score"""
        base_score = 50  # Neutral baseline
        
        # Add score from AI model
        if emotions and len(emotions) > 0:
            confidence = emotions[0]['score']
            if emotions[0]['label'].lower() not in ['neutral', 'negative']:
                base_score += confidence * 30
        
        # Add score from emotion words
        total_emotion_words = sum(data['count'] for data in emotion_words.values())
        base_score += min(30, total_emotion_words * 5)
        
        # Add intensity bonus
        base_score += min(20, intensity * 0.2)
        
        return min(100, base_score)
    
    def _get_emotion_recommendations(self, emotions: List[Dict], emotion_words: Dict) -> List[str]:
        """Generate emotion improvement recommendations"""
        recommendations = []
        
        # Check if emotions are too weak
        total_emotion_words = sum(data['count'] for data in emotion_words.values())
        
        if total_emotion_words == 0:
            recommendations.append("Add emotional trigger words to create connection with your audience")
        
        if emotion_words['urgency']['count'] == 0:
            recommendations.append("Add urgency words like 'now', 'limited time', or 'today' to drive action")
        
        if emotion_words['trust']['count'] == 0:
            recommendations.append("Include trust indicators like 'proven', 'guaranteed', or 'trusted'")
        
        # Platform-specific recommendations
        recommendations.append("Consider A/B testing emotional vs. rational approaches")
        
        return recommendations
    
    def _fallback_emotion_analysis(self, text: str) -> Dict[str, Any]:
        """Fallback emotion analysis if AI model fails"""
        emotion_word_analysis = self._analyze_emotion_words(text)
        intensity = self._calculate_emotional_intensity(text)
        
        # Determine primary emotion from word analysis
        max_emotion = max(emotion_word_analysis.keys(), 
                         key=lambda x: emotion_word_analysis[x]['count'])
        
        return {
            'emotion_score': 60,  # Default score
            'primary_emotion': max_emotion,
            'emotion_confidence': 0.7,
            'emotion_breakdown': emotion_word_analysis,
            'emotional_intensity': intensity,
            'recommendations': self._get_emotion_recommendations([], emotion_word_analysis)
        }
