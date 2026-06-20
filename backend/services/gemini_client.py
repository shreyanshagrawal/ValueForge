import os
import logging
import time
import google.generativeai as genai
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
