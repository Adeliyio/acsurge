"""
Brand Voice Engine Tool - Ensures copy consistency with established brand voice guidelines
Analyzes tone consistency, adjusts vocabulary, and maintains brand personality traits
"""

import time
import re
from typing import Dict, Any, List, Optional, Tuple
from ..core import ToolRunner, ToolInput, ToolOutput, ToolConfig, ToolType
from ..exceptions import ToolValidationError


class BrandVoiceEngineToolRunner(ToolRunner):
    """
    Brand Voice Engine Tool
    
    Ensures copy consistency with established brand voice:
    - Analyzes tone consistency against brand samples
    - Adjusts vocabulary to match brand lexicon
    - Maintains personality traits across all copy
    - Ensures messaging hierarchy alignment
    - Preserves brand-specific phrases/terminology
    - Provides brand-aligned copy variations with consistency scoring
    """
    
    def __init__(self, config: ToolConfig):
        super().__init__(config)
        
        # Brand voice dimensions and characteristics
        self.voice_dimensions = {
            'tone': {
                'professional': {
                    'indicators': ['expertise', 'industry', 'solution', 'optimize', 'strategic', 'results'],
                    'avoid': ['casual', 'slang', 'humor', 'informal'],
                    'sentence_style': 'formal',
                    'vocabulary_level': 'sophisticated'
                },
                'casual': {
                    'indicators': ['hey', 'awesome', 'cool', 'great', 'easy', 'simple', 'fun'],
                    'avoid': ['furthermore', 'utilize', 'implement', 'synergistic'],
                    'sentence_style': 'conversational',
                    'vocabulary_level': 'accessible'
                },
                'authoritative': {
                    'indicators': ['proven', 'expert', 'leading', 'industry standard', 'certified', 'trusted'],
                    'avoid': ['maybe', 'might', 'could', 'possibly', 'uncertain'],
                    'sentence_style': 'declarative',
                    'vocabulary_level': 'confident'
                },
                'friendly': {
                    'indicators': ['welcome', 'help', 'support', 'together', 'community', 'care'],
                    'avoid': ['corporate', 'enterprise', 'leverage', 'synergies'],
                    'sentence_style': 'warm',
                    'vocabulary_level': 'approachable'
                },
                'innovative': {
                    'indicators': ['cutting-edge', 'breakthrough', 'revolutionary', 'next-generation', 'advanced'],
                    'avoid': ['traditional', 'standard', 'conventional', 'basic'],
                    'sentence_style': 'forward-thinking',
                    'vocabulary_level': 'tech-savvy'
                }
            },
            'personality_traits': {
                'confident': {
                    'expressions': ['we know', 'guaranteed', 'proven', 'definitely', 'absolutely'],
                    'avoid_expressions': ['we think', 'maybe', 'hopefully', 'try to']
                },
                'empathetic': {
                    'expressions': ['understand', 'we know how you feel', 'we get it', 'you deserve'],
                    'avoid_expressions': ['deal with it', 'obviously', 'simply', 'just']
                },
                'playful': {
                    'expressions': ['let\'s', 'fun', 'exciting', 'amazing journey', 'love'],
                    'avoid_expressions': ['serious', 'formal', 'corporate', 'business-critical']
                },
                'trustworthy': {
                    'expressions': ['transparent', 'honest', 'reliable', 'secure', 'protected'],
                    'avoid_expressions': ['secret', 'hidden agenda', 'too good to be true']
                },
                'ambitious': {
                    'expressions': ['achieve', 'dominate', 'leader', 'pioneer', 'breakthrough'],
                    'avoid_expressions': ['settle for', 'adequate', 'satisfactory', 'good enough']
                }
            }
        }
        
        # Brand lexicon categories
        self.brand_lexicon_categories = {
            'action_words': {
                'professional': ['optimize', 'implement', 'execute', 'deliver', 'achieve'],
                'casual': ['get', 'grab', 'snag', 'rock', 'nail'],
                'authoritative': ['command', 'master', 'dominate', 'lead', 'control'],
                'friendly': ['help', 'support', 'guide', 'assist', 'care'],
                'innovative': ['revolutionize', 'transform', 'disrupt', 'pioneer', 'innovate']
            },
            'descriptive_words': {
                'professional': ['sophisticated', 'comprehensive', 'strategic', 'systematic'],
                'casual': ['awesome', 'cool', 'amazing', 'fantastic', 'great'],
                'authoritative': ['industry-leading', 'premium', 'superior', 'unmatched'],
                'friendly': ['welcoming', 'supportive', 'caring', 'helpful', 'warm'],
                'innovative': ['cutting-edge', 'next-gen', 'revolutionary', 'breakthrough']
            },
            'transition_words': {
                'professional': ['furthermore', 'consequently', 'therefore', 'additionally'],
                'casual': ['plus', 'and', 'also', 'so', 'then'],
                'authoritative': ['clearly', 'obviously', 'undoubtedly', 'certainly'],
                'friendly': ['and hey', 'plus', 'what\'s more', 'on top of that'],
                'innovative': ['next', 'beyond that', 'taking it further', 'evolving']
            }
        }
        
        # Messaging hierarchy frameworks
        self.messaging_hierarchy = {
            'primary_message': {
                'weight': 1.0,
                'positioning': 'headline',
                'characteristics': ['core_value_prop', 'main_benefit', 'unique_differentiator']
            },
            'supporting_message': {
                'weight': 0.7,
                'positioning': 'body_text',
                'characteristics': ['supporting_benefits', 'proof_points', 'features']
            },
            'call_to_action': {
                'weight': 0.9,
                'positioning': 'cta',
                'characteristics': ['action_oriented', 'clear_direction', 'value_reinforcement']
            }
        }
        
        # Brand-specific phrase patterns
        self.brand_phrase_patterns = {
            'signature_phrases': [
                'your {solution} partner',
                'unlock your {potential}',
                'experience the {brand} difference',
                'powered by {technology}',
                'trusted by {audience}'
            ],
            'value_propositions': [
                'the {superlative} way to {outcome}',
                '{adjective} {solution} for {audience}',
                'transform your {area} with {solution}'
            ],
            'proof_statements': [
                '{number}+ {audience} trust {brand}',
                'proven results in {timeframe}',
                '{percentage} success rate'
            ]
        }
    
    async def run(self, input_data: ToolInput) -> ToolOutput:
        """Analyze and align copy with brand voice guidelines"""
        start_time = time.time()
        
        try:
            # Extract copy and brand information
            copy_data = {
                'headline': input_data.headline,
                'body_text': input_data.body_text,
                'cta': input_data.cta
            }
            
            # Extract brand voice parameters (in practice, from brand guidelines)
            brand_voice_profile = self._extract_brand_voice_profile(input_data)
            brand_samples = self._extract_brand_samples(input_data)
            brand_lexicon = self._extract_brand_lexicon(input_data, brand_voice_profile)
            
            # Analyze current copy against brand voice
            tone_analysis = self._analyze_tone_consistency(copy_data, brand_voice_profile, brand_samples)
            vocabulary_analysis = self._analyze_vocabulary_alignment(copy_data, brand_lexicon)
            personality_analysis = self._analyze_personality_consistency(copy_data, brand_voice_profile)
            hierarchy_analysis = self._analyze_messaging_hierarchy(copy_data, brand_voice_profile)
            phrase_analysis = self._analyze_brand_phrases(copy_data, brand_voice_profile)
            
            # Generate brand-aligned variations
            aligned_variations = self._generate_brand_aligned_variations(
                copy_data, brand_voice_profile, tone_analysis, vocabulary_analysis
            )
            
            # Calculate brand voice scores
            tone_consistency = self._calculate_tone_consistency_score(tone_analysis)
            vocabulary_alignment = self._calculate_vocabulary_alignment_score(vocabulary_analysis)
            personality_consistency = self._calculate_personality_consistency_score(personality_analysis)
            hierarchy_alignment = self._calculate_hierarchy_alignment_score(hierarchy_analysis)
            phrase_integration = self._calculate_phrase_integration_score(phrase_analysis)
            
            # Prepare scores
            scores = {
                'tone_consistency_score': tone_consistency,
                'vocabulary_alignment_score': vocabulary_alignment,
                'personality_consistency_score': personality_consistency,
                'hierarchy_alignment_score': hierarchy_alignment,
                'phrase_integration_score': phrase_integration,
                'overall_brand_voice_score': (tone_consistency + vocabulary_alignment + personality_consistency + hierarchy_alignment + phrase_integration) / 5
            }
            
            # Generate brand voice recommendations
            recommendations = self._generate_brand_voice_recommendations(
                tone_analysis, vocabulary_analysis, personality_analysis, 
                hierarchy_analysis, phrase_analysis, brand_voice_profile
            )
            
            # Detailed insights
            insights = {
                'brand_voice_analysis': {
                    'target_brand_profile': brand_voice_profile,
                    'tone_alignment': tone_analysis,
                    'vocabulary_gaps': vocabulary_analysis.get('gaps', []),
                    'personality_traits_expressed': personality_analysis.get('traits_found', []),
                    'messaging_hierarchy_score': hierarchy_analysis.get('hierarchy_score', 0)
                },
                'consistency_metrics': {
                    'tone_deviation': tone_analysis.get('deviation_score', 0),
                    'vocabulary_match_rate': vocabulary_analysis.get('match_percentage', 0),
                    'brand_phrase_usage': phrase_analysis.get('usage_count', 0),
                    'off_brand_elements': self._identify_off_brand_elements(tone_analysis, vocabulary_analysis)
                },
                'optimization_opportunities': {
                    'tone_adjustments': self._identify_tone_adjustments(tone_analysis, brand_voice_profile),
                    'vocabulary_enhancements': self._identify_vocabulary_enhancements(vocabulary_analysis, brand_lexicon),
                    'personality_reinforcement': self._identify_personality_opportunities(personality_analysis, brand_voice_profile),
                    'phrase_integration_opportunities': self._identify_phrase_opportunities(phrase_analysis, brand_voice_profile)
                }
            }
            
            execution_time = time.time() - start_time
            
            return ToolOutput(
                tool_name=self.name,
                tool_type=self.tool_type,
                success=True,
                scores=scores,
                insights=insights,
                recommendations=recommendations,
                variations=aligned_variations,
                execution_time=execution_time,
                request_id=input_data.request_id,
                confidence_score=self._calculate_confidence(insights, brand_voice_profile)
            )
            
        except Exception as e:
            execution_time = time.time() - start_time
            
            return ToolOutput(
                tool_name=self.name,
                tool_type=self.tool_type,
                success=False,
                execution_time=execution_time,
                request_id=input_data.request_id,
                error_message=f"Brand voice analysis failed: {str(e)}"
            )
    
    def _extract_brand_voice_profile(self, input_data: ToolInput) -> Dict[str, Any]:
        """Extract brand voice profile from input data"""
        # In practice, this would parse from input_data.additional_data or brand guidelines
        return {
            'primary_tone': 'professional',
            'secondary_tone': 'authoritative',
            'personality_traits': ['confident', 'trustworthy', 'innovative'],
            'target_audience': 'business_professionals',
            'industry_context': input_data.industry or 'technology',
            'brand_values': ['innovation', 'reliability', 'excellence'],
            'voice_attributes': {
                'formality_level': 'semi_formal',
                'technical_complexity': 'moderate',
                'emotional_expressiveness': 'moderate',
                'humor_usage': 'minimal'
            }
        }
    
    def _extract_brand_samples(self, input_data: ToolInput) -> List[str]:
        """Extract brand voice samples for reference"""
        # In practice, these would come from brand guidelines or previous approved copy
        return [
            "Transform your business with innovative solutions that deliver proven results.",
            "Our expert team provides comprehensive support for your strategic initiatives.",
            "Experience the reliability and performance that industry leaders trust."
        ]
    
    def _extract_brand_lexicon(self, input_data: ToolInput, brand_profile: Dict) -> Dict[str, List[str]]:
        """Extract brand-specific lexicon based on voice profile"""
        primary_tone = brand_profile['primary_tone']
        
        return {
            'preferred_words': self.brand_lexicon_categories['action_words'].get(primary_tone, []),
            'descriptive_words': self.brand_lexicon_categories['descriptive_words'].get(primary_tone, []),
            'transition_words': self.brand_lexicon_categories['transition_words'].get(primary_tone, []),
            'brand_specific_terms': ['solution', 'platform', 'innovation', 'excellence', 'expertise'],
            'avoid_words': self.voice_dimensions['tone'].get(primary_tone, {}).get('avoid', [])
        }
    
    def _analyze_tone_consistency(self, copy_data: Dict[str, str], brand_profile: Dict, 
                                 brand_samples: List[str]) -> Dict[str, Any]:
        """Analyze tone consistency against brand profile"""
        full_text = f"{copy_data['headline']} {copy_data['body_text']} {copy_data['cta']}".lower()
        primary_tone = brand_profile['primary_tone']
        tone_config = self.voice_dimensions['tone'].get(primary_tone, {})
        
        # Check for tone indicators
        positive_indicators = tone_config.get('indicators', [])
        negative_indicators = tone_config.get('avoid', [])
        
        positive_matches = [ind for ind in positive_indicators if ind in full_text]
        negative_matches = [ind for ind in negative_indicators if ind in full_text]
        
        # Calculate tone score
        positive_score = len(positive_matches) * 10
        negative_penalty = len(negative_matches) * 15
        base_tone_score = max(0, 70 + positive_score - negative_penalty)
        
        # Analyze consistency across copy sections
        section_scores = {}
        for section, text in copy_data.items():
            section_positive = sum(1 for ind in positive_indicators if ind in text.lower())
            section_negative = sum(1 for ind in negative_indicators if ind in text.lower())
            section_scores[section] = max(0, 70 + (section_positive * 10) - (section_negative * 15))
        
        return {
            'overall_tone_score': base_tone_score,
            'section_scores': section_scores,
            'positive_indicators_found': positive_matches,
            'negative_indicators_found': negative_matches,
            'tone_consistency': self._calculate_section_consistency(section_scores),
            'deviation_score': max(section_scores.values()) - min(section_scores.values()) if section_scores else 0
        }
    
    def _analyze_vocabulary_alignment(self, copy_data: Dict[str, str], brand_lexicon: Dict) -> Dict[str, Any]:
        """Analyze vocabulary alignment with brand lexicon"""
        full_text = f"{copy_data['headline']} {copy_data['body_text']} {copy_data['cta']}".lower()
        
        # Check preferred words usage
        preferred_words = brand_lexicon.get('preferred_words', [])
        descriptive_words = brand_lexicon.get('descriptive_words', [])
        brand_terms = brand_lexicon.get('brand_specific_terms', [])
        avoid_words = brand_lexicon.get('avoid_words', [])
        
        preferred_matches = [word for word in preferred_words if word in full_text]
        descriptive_matches = [word for word in descriptive_words if word in full_text]
        brand_term_matches = [word for word in brand_terms if word in full_text]
        avoid_word_matches = [word for word in avoid_words if word in full_text]
        
        # Calculate vocabulary alignment score
        total_preferred = len(preferred_words) + len(descriptive_words) + len(brand_terms)
        total_matches = len(preferred_matches) + len(descriptive_matches) + len(brand_term_matches)
        
        match_percentage = (total_matches / total_preferred * 100) if total_preferred > 0 else 0
        avoid_penalty = len(avoid_word_matches) * 10
        
        alignment_score = max(0, min(100, match_percentage * 0.7 + 30 - avoid_penalty))
        
        return {
            'alignment_score': alignment_score,
            'match_percentage': match_percentage,
            'preferred_words_used': preferred_matches,
            'descriptive_words_used': descriptive_matches,
            'brand_terms_used': brand_term_matches,
            'avoid_words_found': avoid_word_matches,
            'gaps': self._identify_vocabulary_gaps(preferred_words, descriptive_words, full_text),
            'suggestions': self._suggest_vocabulary_improvements(full_text, brand_lexicon)
        }
    
    def _analyze_personality_consistency(self, copy_data: Dict[str, str], brand_profile: Dict) -> Dict[str, Any]:
        """Analyze personality trait consistency"""
        full_text = f"{copy_data['headline']} {copy_data['body_text']} {copy_data['cta']}".lower()
        personality_traits = brand_profile.get('personality_traits', [])
        
        traits_analysis = {}
        traits_found = []
        
        for trait in personality_traits:
            trait_config = self.voice_dimensions['personality_traits'].get(trait, {})
            expressions = trait_config.get('expressions', [])
            avoid_expressions = trait_config.get('avoid_expressions', [])
            
            positive_matches = [exp for exp in expressions if exp in full_text]
            negative_matches = [exp for exp in avoid_expressions if exp in full_text]
            
            trait_score = len(positive_matches) * 20 - len(negative_matches) * 25
            trait_score = max(0, min(100, trait_score + 50))  # Base 50 + adjustments
            
            traits_analysis[trait] = {
                'score': trait_score,
                'positive_matches': positive_matches,
                'negative_matches': negative_matches,
                'present': len(positive_matches) > 0
            }
            
            if len(positive_matches) > 0:
                traits_found.append(trait)
        
        # Calculate overall personality consistency
        trait_scores = [data['score'] for data in traits_analysis.values()]
        avg_trait_score = sum(trait_scores) / len(trait_scores) if trait_scores else 0
        
        return {
            'overall_personality_score': avg_trait_score,
            'traits_analysis': traits_analysis,
            'traits_found': traits_found,
            'traits_missing': [t for t in personality_traits if t not in traits_found],
            'personality_strength': 'strong' if len(traits_found) >= len(personality_traits) * 0.7 else 'moderate' if len(traits_found) >= len(personality_traits) * 0.4 else 'weak'
        }
    
    def _analyze_messaging_hierarchy(self, copy_data: Dict[str, str], brand_profile: Dict) -> Dict[str, Any]:
        """Analyze messaging hierarchy alignment"""
        hierarchy_scores = {}
        
        for section, text in copy_data.items():
            expected_characteristics = []
            
            if section == 'headline':
                expected_characteristics = self.messaging_hierarchy['primary_message']['characteristics']
            elif section == 'body_text':
                expected_characteristics = self.messaging_hierarchy['supporting_message']['characteristics']
            elif section == 'cta':
                expected_characteristics = self.messaging_hierarchy['call_to_action']['characteristics']
            
            # Simple characteristic matching
            characteristic_indicators = {
                'core_value_prop': ['unique', 'only', 'exclusive', 'special'],
                'main_benefit': ['benefit', 'advantage', 'value', 'result'],
                'unique_differentiator': ['unlike', 'different', 'unlike others', 'only we'],
                'supporting_benefits': ['also', 'plus', 'additionally', 'furthermore'],
                'proof_points': ['proven', 'evidence', 'data', 'results'],
                'features': ['includes', 'features', 'offers', 'provides'],
                'action_oriented': ['get', 'start', 'begin', 'try', 'buy'],
                'clear_direction': ['now', 'today', 'here', 'click'],
                'value_reinforcement': ['value', 'benefit', 'advantage', 'worth']
            }
            
            text_lower = text.lower()
            characteristic_matches = 0
            
            for characteristic in expected_characteristics:
                indicators = characteristic_indicators.get(characteristic, [])
                if any(indicator in text_lower for indicator in indicators):
                    characteristic_matches += 1
            
            section_score = (characteristic_matches / len(expected_characteristics)) * 100 if expected_characteristics else 100
            hierarchy_scores[section] = section_score
        
        overall_hierarchy_score = sum(hierarchy_scores.values()) / len(hierarchy_scores) if hierarchy_scores else 0
        
        return {
            'hierarchy_score': overall_hierarchy_score,
            'section_scores': hierarchy_scores,
            'alignment_quality': 'excellent' if overall_hierarchy_score >= 80 else 'good' if overall_hierarchy_score >= 60 else 'needs_improvement'
        }
    
    def _analyze_brand_phrases(self, copy_data: Dict[str, str], brand_profile: Dict) -> Dict[str, Any]:
        """Analyze usage of brand-specific phrases"""
        full_text = f"{copy_data['headline']} {copy_data['body_text']} {copy_data['cta']}"
        
        # Look for signature phrase patterns
        signature_matches = []
        for pattern in self.brand_phrase_patterns['signature_phrases']:
            # Simple pattern matching (in practice, would use more sophisticated NLP)
            base_pattern = pattern.split('{')[0].strip()
            if base_pattern and base_pattern in full_text.lower():
                signature_matches.append(pattern)
        
        # Count brand-specific terminology
        brand_terms = brand_profile.get('brand_specific_terms', [])
        brand_term_usage = sum(1 for term in brand_terms if term.lower() in full_text.lower())
        
        return {
            'usage_count': len(signature_matches) + brand_term_usage,
            'signature_phrases_found': signature_matches,
            'brand_term_usage': brand_term_usage,
            'phrase_integration_score': min(100, (len(signature_matches) + brand_term_usage) * 25)
        }
    
    def _generate_brand_aligned_variations(self, copy_data: Dict[str, str], brand_profile: Dict,
                                          tone_analysis: Dict, vocabulary_analysis: Dict) -> List[Dict[str, Any]]:
        """Generate brand-aligned copy variations"""
        variations = []
        primary_tone = brand_profile['primary_tone']
        
        # Variation 1: Tone-optimized
        tone_optimized = self._create_tone_optimized_variation(copy_data, brand_profile, tone_analysis)
        variations.append({
            'id': 'tone_optimized',
            'type': 'brand_tone_alignment',
            'headline': tone_optimized['headline'],
            'body_text': tone_optimized['body_text'],
            'cta': tone_optimized['cta'],
            'optimization_focus': f'Optimized for {primary_tone} tone',
            'brand_alignment_score': self._estimate_variation_alignment(tone_optimized, brand_profile)
        })
        
        # Variation 2: Vocabulary-enhanced
        vocabulary_enhanced = self._create_vocabulary_enhanced_variation(copy_data, brand_profile, vocabulary_analysis)
        variations.append({
            'id': 'vocabulary_enhanced',
            'type': 'brand_vocabulary_alignment',
            'headline': vocabulary_enhanced['headline'],
            'body_text': vocabulary_enhanced['body_text'],
            'cta': vocabulary_enhanced['cta'],
            'optimization_focus': 'Enhanced with brand lexicon',
            'brand_alignment_score': self._estimate_variation_alignment(vocabulary_enhanced, brand_profile)
        })
        
        # Variation 3: Personality-infused
        personality_infused = self._create_personality_infused_variation(copy_data, brand_profile)
        variations.append({
            'id': 'personality_infused',
            'type': 'brand_personality_alignment',
            'headline': personality_infused['headline'],
            'body_text': personality_infused['body_text'],
            'cta': personality_infused['cta'],
            'optimization_focus': 'Infused with brand personality traits',
            'brand_alignment_score': self._estimate_variation_alignment(personality_infused, brand_profile)
        })
        
        return variations
    
    def _create_tone_optimized_variation(self, copy_data: Dict[str, str], brand_profile: Dict,
                                        tone_analysis: Dict) -> Dict[str, str]:
        """Create tone-optimized variation"""
        primary_tone = brand_profile['primary_tone']
        tone_config = self.voice_dimensions['tone'].get(primary_tone, {})
        
        # Replace avoid words with preferred indicators
        optimized_copy = {}
        avoid_words = tone_analysis.get('negative_indicators_found', [])
        tone_indicators = tone_config.get('indicators', [])
        
        for section, text in copy_data.items():
            optimized_text = text
            
            # Replace avoid words
            for avoid_word in avoid_words:
                if avoid_word in optimized_text.lower() and tone_indicators:
                    replacement = tone_indicators[0]  # Use first preferred indicator
                    optimized_text = optimized_text.replace(avoid_word, replacement)
            
            # Add tone-appropriate language
            if primary_tone == 'professional' and section == 'body_text':
                optimized_text = f"Our comprehensive solution {optimized_text.lower()}"
            elif primary_tone == 'casual' and section == 'headline':
                optimized_text = f"Hey! {optimized_text}"
            
            optimized_copy[section] = optimized_text
        
        return optimized_copy
    
    def _create_vocabulary_enhanced_variation(self, copy_data: Dict[str, str], brand_profile: Dict,
                                            vocabulary_analysis: Dict) -> Dict[str, str]:
        """Create vocabulary-enhanced variation"""
        enhanced_copy = {}
        gaps = vocabulary_analysis.get('gaps', [])
        suggestions = vocabulary_analysis.get('suggestions', [])
        
        for section, text in copy_data.items():
            enhanced_text = text
            
            # Apply vocabulary suggestions
            for suggestion in suggestions[:2]:  # Apply top 2 suggestions
                if 'replace' in suggestion:
                    old_word = suggestion['replace']
                    new_word = suggestion['with']
                    enhanced_text = enhanced_text.replace(old_word, new_word)
            
            # Add brand terms if missing
            if section == 'body_text' and 'solution' not in enhanced_text.lower():
                enhanced_text = enhanced_text + " Our innovative solution delivers exceptional results."
            
            enhanced_copy[section] = enhanced_text
        
        return enhanced_copy
    
    def _create_personality_infused_variation(self, copy_data: Dict[str, str], brand_profile: Dict) -> Dict[str, str]:
        """Create personality-infused variation"""
        personality_traits = brand_profile.get('personality_traits', [])
        infused_copy = {}
        
        for section, text in copy_data.items():
            infused_text = text
            
            # Infuse personality traits
            if 'confident' in personality_traits:
                if section == 'headline':
                    infused_text = f"Guaranteed: {infused_text}"
                elif section == 'cta':
                    infused_text = f"Get Guaranteed {infused_text}"
            
            if 'trustworthy' in personality_traits and section == 'body_text':
                infused_text = f"With complete transparency, {infused_text.lower()}"
            
            if 'innovative' in personality_traits and 'innovative' not in infused_text.lower():
                infused_text = infused_text.replace('solution', 'innovative solution')
            
            infused_copy[section] = infused_text
        
        return infused_copy
    
    def _calculate_section_consistency(self, section_scores: Dict[str, float]) -> str:
        """Calculate consistency across sections"""
        if not section_scores:
            return 'unknown'
        
        scores = list(section_scores.values())
        score_range = max(scores) - min(scores)
        
        if score_range <= 10:
            return 'very_consistent'
        elif score_range <= 20:
            return 'consistent'
        elif score_range <= 30:
            return 'moderately_consistent'
        else:
            return 'inconsistent'
    
    def _identify_vocabulary_gaps(self, preferred_words: List[str], descriptive_words: List[str], 
                                 text: str) -> List[str]:
        """Identify vocabulary gaps"""
        gaps = []
        all_preferred = preferred_words + descriptive_words
        
        for word in all_preferred[:5]:  # Check top 5 preferred words
            if word not in text:
                gaps.append(word)
        
        return gaps
    
    def _suggest_vocabulary_improvements(self, text: str, brand_lexicon: Dict) -> List[Dict[str, str]]:
        """Suggest vocabulary improvements"""
        suggestions = []
        avoid_words = brand_lexicon.get('avoid_words', [])
        preferred_words = brand_lexicon.get('preferred_words', [])
        
        for avoid_word in avoid_words:
            if avoid_word in text.lower() and preferred_words:
                suggestions.append({
                    'replace': avoid_word,
                    'with': preferred_words[0],
                    'reason': 'Better aligns with brand tone'
                })
        
        return suggestions[:3]  # Return top 3 suggestions
    
    def _calculate_tone_consistency_score(self, tone_analysis: Dict) -> float:
        """Calculate tone consistency score"""
        return tone_analysis.get('overall_tone_score', 0)
    
    def _calculate_vocabulary_alignment_score(self, vocabulary_analysis: Dict) -> float:
        """Calculate vocabulary alignment score"""
        return vocabulary_analysis.get('alignment_score', 0)
    
    def _calculate_personality_consistency_score(self, personality_analysis: Dict) -> float:
        """Calculate personality consistency score"""
        return personality_analysis.get('overall_personality_score', 0)
    
    def _calculate_hierarchy_alignment_score(self, hierarchy_analysis: Dict) -> float:
        """Calculate hierarchy alignment score"""
        return hierarchy_analysis.get('hierarchy_score', 0)
    
    def _calculate_phrase_integration_score(self, phrase_analysis: Dict) -> float:
        """Calculate phrase integration score"""
        return phrase_analysis.get('phrase_integration_score', 0)
    
    def _estimate_variation_alignment(self, variation_copy: Dict[str, str], brand_profile: Dict) -> float:
        """Estimate brand alignment score for variation"""
        # Simple estimation based on brand terms and tone indicators
        full_text = f"{variation_copy.get('headline', '')} {variation_copy.get('body_text', '')} {variation_copy.get('cta', '')}".lower()
        
        primary_tone = brand_profile['primary_tone']
        tone_indicators = self.voice_dimensions['tone'].get(primary_tone, {}).get('indicators', [])
        
        indicator_matches = sum(1 for indicator in tone_indicators if indicator in full_text)
        
        # Estimate based on indicator presence
        estimated_score = min(100, 60 + (indicator_matches * 10))
        return estimated_score
    
    def _identify_off_brand_elements(self, tone_analysis: Dict, vocabulary_analysis: Dict) -> List[str]:
        """Identify off-brand elements"""
        off_brand = []
        
        # From tone analysis
        off_brand.extend(tone_analysis.get('negative_indicators_found', []))
        
        # From vocabulary analysis
        off_brand.extend(vocabulary_analysis.get('avoid_words_found', []))
        
        return list(set(off_brand))  # Remove duplicates
    
    def _identify_tone_adjustments(self, tone_analysis: Dict, brand_profile: Dict) -> List[str]:
        """Identify tone adjustment opportunities"""
        adjustments = []
        primary_tone = brand_profile['primary_tone']
        
        if tone_analysis.get('overall_tone_score', 0) < 70:
            adjustments.append(f"Strengthen {primary_tone} tone throughout copy")
        
        if tone_analysis.get('deviation_score', 0) > 20:
            adjustments.append("Improve tone consistency across sections")
        
        negative_indicators = tone_analysis.get('negative_indicators_found', [])
        if negative_indicators:
            adjustments.append(f"Remove off-brand language: {', '.join(negative_indicators[:2])}")
        
        return adjustments
    
    def _identify_vocabulary_enhancements(self, vocabulary_analysis: Dict, brand_lexicon: Dict) -> List[str]:
        """Identify vocabulary enhancement opportunities"""
        enhancements = []
        
        gaps = vocabulary_analysis.get('gaps', [])
        if gaps:
            enhancements.append(f"Incorporate brand vocabulary: {', '.join(gaps[:3])}")
        
        if vocabulary_analysis.get('match_percentage', 0) < 50:
            enhancements.append("Increase usage of brand-preferred terminology")
        
        suggestions = vocabulary_analysis.get('suggestions', [])
        if suggestions:
            enhancements.append("Replace off-brand words with brand-aligned alternatives")
        
        return enhancements
    
    def _identify_personality_opportunities(self, personality_analysis: Dict, brand_profile: Dict) -> List[str]:
        """Identify personality reinforcement opportunities"""
        opportunities = []
        
        missing_traits = personality_analysis.get('traits_missing', [])
        if missing_traits:
            opportunities.append(f"Strengthen {missing_traits[0]} personality trait expression")
        
        if personality_analysis.get('personality_strength') == 'weak':
            opportunities.append("Infuse more brand personality throughout copy")
        
        return opportunities
    
    def _identify_phrase_opportunities(self, phrase_analysis: Dict, brand_profile: Dict) -> List[str]:
        """Identify brand phrase integration opportunities"""
        opportunities = []
        
        if phrase_analysis.get('usage_count', 0) < 2:
            opportunities.append("Integrate more brand-specific phrases and terminology")
        
        if not phrase_analysis.get('signature_phrases_found'):
            opportunities.append("Add signature brand phrases for stronger recognition")
        
        return opportunities
    
    def _generate_brand_voice_recommendations(self, tone_analysis: Dict, vocabulary_analysis: Dict,
                                            personality_analysis: Dict, hierarchy_analysis: Dict,
                                            phrase_analysis: Dict, brand_profile: Dict) -> List[str]:
        """Generate comprehensive brand voice recommendations"""
        recommendations = []
        
        # Tone recommendations
        if tone_analysis.get('overall_tone_score', 0) < 70:
            primary_tone = brand_profile['primary_tone']
            recommendations.append(f"Align copy more closely with {primary_tone} brand tone")
        
        # Vocabulary recommendations
        if vocabulary_analysis.get('alignment_score', 0) < 60:
            recommendations.append("Incorporate more brand-preferred vocabulary and terminology")
        
        # Personality recommendations
        if personality_analysis.get('personality_strength') != 'strong':
            traits = brand_profile.get('personality_traits', [])
            if traits:
                recommendations.append(f"Strengthen {traits[0]} personality trait expression")
        
        # Hierarchy recommendations
        if hierarchy_analysis.get('hierarchy_score', 0) < 70:
            recommendations.append("Improve messaging hierarchy alignment across copy sections")
        
        # Phrase integration recommendations
        if phrase_analysis.get('usage_count', 0) < 2:
            recommendations.append("Integrate signature brand phrases for stronger brand recognition")
        
        # Consistency recommendations
        if tone_analysis.get('tone_consistency') == 'inconsistent':
            recommendations.append("Maintain consistent brand voice across all copy sections")
        
        return recommendations[:6]  # Limit to top 6
    
    def _calculate_confidence(self, insights: Dict, brand_profile: Dict) -> float:
        """Calculate confidence in brand voice analysis"""
        confidence_factors = []
        
        # Brand profile completeness
        if brand_profile.get('personality_traits') and brand_profile.get('primary_tone'):
            confidence_factors.append(90)
        else:
            confidence_factors.append(70)
        
        # Analysis depth
        brand_analysis = insights.get('brand_voice_analysis', {})
        if brand_analysis.get('tone_alignment') and brand_analysis.get('vocabulary_gaps') is not None:
            confidence_factors.append(85)
        else:
            confidence_factors.append(75)
        
        # Optimization opportunity identification
        optimization_opps = insights.get('optimization_opportunities', {})
        if len(optimization_opps) >= 3:
            confidence_factors.append(90)
        else:
            confidence_factors.append(80)
        
        return sum(confidence_factors) / len(confidence_factors)
    
    def validate_input(self, input_data: ToolInput) -> bool:
        """Validate input data for brand voice analysis"""
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
                f"Missing required fields for brand voice analysis: {missing_fields}",
                missing_fields
            )
        
        return True
    
    def get_output_scores(self) -> List[str]:
        """Get list of scores this tool outputs"""
        return [
            'tone_consistency_score', 'vocabulary_alignment_score',
            'personality_consistency_score', 'hierarchy_alignment_score',
            'phrase_integration_score', 'overall_brand_voice_score'
        ]
    
    @classmethod
    def default_config(cls) -> ToolConfig:
        """Get default configuration for this tool"""
        return ToolConfig(
            name="brand_voice_engine",
            tool_type=ToolType.OPTIMIZER,
            timeout=25.0,
            parameters={
                'analyze_tone_consistency': True,
                'vocabulary_alignment': True,
                'personality_trait_analysis': True,
                'generate_brand_variations': True
            }
        )