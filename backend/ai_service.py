from openai import OpenAI, AsyncOpenAI
import logging
import asyncio
from typing import Dict, Optional
from config import Config
from database import db

logger = logging.getLogger(__name__)

class AIService:
    """OpenAI API integration for translation and moderation"""
    
    def __init__(self):
        if not Config.OPENAI_API_KEY:
            logger.warning("OpenAI API key not set. AI features will not work.")
            self.client = None
            self.async_client = None
        else:
            # Initialize OpenAI clients
            self.client = OpenAI(api_key=Config.OPENAI_API_KEY)
            self.async_client = AsyncOpenAI(api_key=Config.OPENAI_API_KEY)
    
    async def detect_language(self, text: str) -> str:
        """Detect the source language of text"""
        if not self.async_client:
            return 'en'
        
        try:
            # Simple language detection using OpenAI
            response = await self.async_client.chat.completions.create(
                model=Config.OPENAI_MODEL,
                messages=[
                    {"role": "system", "content": "You are a language detector. Respond with only the ISO 639-1 language code (e.g., 'en', 'es', 'fr')."},
                    {"role": "user", "content": f"Detect the language of this text and respond with only the ISO 639-1 code: {text}"}
                ],
                max_tokens=10,
                temperature=0
            )
            detected_lang = response.choices[0].message.content.strip().lower()
            return detected_lang[:2]  # Ensure it's a 2-character code
        except Exception as e:
            logger.error(f"Language detection failed: {e}")
            return 'en'  # Default to English
    
    async def translate_text(self, text: str, target_language: str, source_language: str = 'auto') -> str:
        """Translate text to target language"""
        if not self.async_client:
            return text
        
        try:
            # Check cache first
            if source_language != 'auto':
                cached = db.get_cached_translation(text, source_language, target_language)
                if cached:
                    logger.info(f"Using cached translation for {text[:50]}...")
                    return cached
            
            # Detect source language if auto
            if source_language == 'auto':
                source_language = await self.detect_language(text)
            
            # Check cache again with detected language
            cached = db.get_cached_translation(text, source_language, target_language)
            if cached:
                return cached
            
            # Translate using OpenAI
            response = await self.async_client.chat.completions.create(
                model=Config.OPENAI_MODEL,
                messages=[
                    {"role": "system", "content": f"You are a professional translator. Translate the following text from {source_language} to {target_language}. Only return the translated text, nothing else."},
                    {"role": "user", "content": text}
                ],
                max_tokens=500,
                temperature=0.3
            )
            
            translated_text = response.choices[0].message.content.strip()
            
            # Cache the translation
            db.cache_translation(text, source_language, target_language, translated_text)
            
            return translated_text
        except Exception as e:
            logger.error(f"Translation failed: {e}")
            return text  # Return original text on failure
    
    async def moderate_content(self, text: str) -> Dict:
        """Check message for toxic content using OpenAI Moderation API"""
        if not self.async_client:
            return {
                'is_flagged': False,
                'toxicity_score': 0.0,
                'categories': {},
                'flagged_categories': []
            }
        
        try:
            response = await self.async_client.moderations.create(input=text)
            result = response.results[0]
            
            # Extract category scores (handling both dict and object formats)
            if hasattr(result.category_scores, 'model_dump'):
                category_score_values = result.category_scores.model_dump()
            elif hasattr(result.category_scores, '__dict__'):
                category_score_values = result.category_scores.__dict__
            else:
                category_score_values = dict(result.category_scores) if result.category_scores else {}
            
            if hasattr(result.categories, 'model_dump'):
                category_scores = result.categories.model_dump()
            elif hasattr(result.categories, '__dict__'):
                category_scores = result.categories.__dict__
            else:
                category_scores = dict(result.categories) if result.categories else {}
            
            max_score = max(category_score_values.values()) if category_score_values else 0.0
            
            is_flagged = result.flagged or max_score >= Config.TOXICITY_THRESHOLD
            
            moderation_result = {
                'is_flagged': is_flagged,
                'toxicity_score': max_score,
                'categories': category_scores,
                'flagged_categories': [cat for cat, val in category_score_values.items() if val >= Config.TOXICITY_THRESHOLD]
            }
            
            return moderation_result
        except Exception as e:
            logger.error(f"Content moderation failed: {e}")
            # Return safe defaults on failure
            return {
                'is_flagged': False,
                'toxicity_score': 0.0,
                'categories': {},
                'flagged_categories': []
            }
    
    async def translate_for_users(self, text: str, source_language: str, target_languages: list) -> Dict[str, str]:
        """Translate text to multiple target languages"""
        translations = {}
        
        # Translate to each target language
        tasks = []
        for lang in target_languages:
            if lang != source_language:
                tasks.append(self.translate_text(text, lang, source_language))
            else:
                translations[lang] = text  # No translation needed
        
        # Execute translations in parallel
        if tasks:
            translated_texts = await asyncio.gather(*tasks, return_exceptions=True)
            lang_index = 0
            for lang in target_languages:
                if lang != source_language:
                    if isinstance(translated_texts[lang_index], Exception):
                        logger.error(f"Translation to {lang} failed: {translated_texts[lang_index]}")
                        translations[lang] = text  # Fallback to original
                    else:
                        translations[lang] = translated_texts[lang_index]
                    lang_index += 1
        
        return translations

# Global AI service instance
ai_service = AIService()

