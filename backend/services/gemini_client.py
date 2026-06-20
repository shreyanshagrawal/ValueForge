import os
import logging
import time
import json
import google.generativeai as genai
from typing import Optional, Dict, Any
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Gemini SDK
api_key = os.getenv("GEMINI_API_KEY")
if api_key and api_key != "your_key_here":
    genai.configure(api_key=api_key)
else:
    logger.warning("GEMINI_API_KEY is not set or is still the placeholder. Please set it in .env")

LAST_CALL_TIME = 0.0
RATE_LIMIT_DELAY = 1.5  # Seconds to wait between calls

def _wait_for_rate_limit():
    global LAST_CALL_TIME
    now = time.time()
    elapsed = now - LAST_CALL_TIME
    if elapsed < RATE_LIMIT_DELAY:
        time.sleep(RATE_LIMIT_DELAY - elapsed)
    LAST_CALL_TIME = time.time()

def generate_text(prompt: str, model: str = "gemini-2.5-flash") -> str:
    """
    Wraps a simple text generation call with basic error handling and rate-limit delay.
    """
    _wait_for_rate_limit()
    try:
        gen_model = genai.GenerativeModel(model)
        response = gen_model.generate_content(prompt)
        return response.text
    except Exception as e:
        error_str = str(e)
        if "429" in error_str or "Quota" in error_str:
            logger.warning(f"⚠️ GEMINI RATE LIMIT HIT (429): {e}")
        else:
            logger.error(f"Error generating text from Gemini API: {e}")
        return "Error: Unable to generate text at this time."

def get_embedding(text: str) -> list[float]:
    """
    Uses the text-embedding-004 model to return an embedding vector, with rate-limit delay.
    """
    _wait_for_rate_limit()
    try:
        result = genai.embed_content(
            model="models/gemini-embedding-2",
            content=text,
            task_type="retrieval_document",
        )
        return result['embedding']
    except Exception as e:
        error_str = str(e)
        if "429" in error_str or "Quota" in error_str:
            logger.warning(f"⚠️ GEMINI RATE LIMIT HIT (429): {e}")
        else:
            logger.error(f"Error getting embedding from Gemini API: {e}")
        return None

def predict_trend_velocity(claim_code: str) -> Optional[Dict[str, Any]]:
    prompt = f"""
    Act as a CPG (Consumer Packaged Goods) market analyst. 
    Predict the current market trend for the product claim / ingredient '{claim_code}'.
    Is it 'rising', 'peaking', or 'declining'? 
    Estimate a realistic Month-over-Month growth percentage (e.g. 15.5 for rising, 2.0 for peaking, -5.0 for declining).
    
    Return EXACTLY this JSON format and nothing else:
    {{"trend_direction": "rising|peaking|declining", "trend_velocity_score": float}}
    """
    text = generate_text(prompt)
    if not text or "Error" in text:
        return None
        
    try:
        # Clean up any potential markdown formatting
        text = text.replace("```json", "").replace("```", "").strip()
        data = json.loads(text)
        
        direction = data.get("trend_direction", "peaking").lower()
        if direction not in ["rising", "peaking", "declining"]:
            direction = "peaking"
            
        velocity = float(data.get("trend_velocity_score", 0.0))
        return {
            "trend_direction": direction,
            "trend_velocity_score": velocity
        }
    except Exception as e:
        logger.warning(f"Failed to parse trend velocity JSON: {e}")
        return None
