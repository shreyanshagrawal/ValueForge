import json
import logging
from services.gemini_client import generate_text

logger = logging.getLogger(__name__)

def extract_claim_signals(benefit_idea_text: str, all_claims: list[str]) -> list[str]:
    """
    Takes a free-text benefit idea and a list of known claim_codes, and returns 
    which claim_codes are mentioned or strongly implied in the text.
    """
    prompt = f"""
    You are an expert brand strategist. Given a free-text product benefit idea from a brand manager, 
    and a specific list of valid claim codes, your task is to extract which of those claim codes 
    are explicitly mentioned or strongly implied by the idea.

    Benefit Idea: "{benefit_idea_text}"

    Valid Claim Codes: {all_claims}

    Return ONLY a raw JSON array of strings (the matching claim codes). 
    Do not include any other text, explanation, or markdown formatting (like ```json).
    If none match, return an empty array [].
    """
    
    response_text = generate_text(prompt)
    
    # Defensively parse the response
    cleaned_response = response_text.strip()
    if cleaned_response.startswith("```json"):
        cleaned_response = cleaned_response[7:]
    elif cleaned_response.startswith("```"):
        cleaned_response = cleaned_response[3:]
    if cleaned_response.endswith("```"):
        cleaned_response = cleaned_response[:-3]
        
    cleaned_response = cleaned_response.strip()
    
    try:
        extracted = json.loads(cleaned_response)
        if isinstance(extracted, list):
            # Ensure we only return claims that actually exist in the list
            valid_extracted = [c for c in extracted if c in all_claims]
            return valid_extracted
    except json.JSONDecodeError as e:
        logger.warning(f"Failed to parse Gemini response as JSON. Falling back to keyword matching. Error: {e}\nResponse was: {response_text}")
    
    # Fallback to simple keyword/substring matching
    fallback_matches = set()
    text_lower = benefit_idea_text.lower()
    for claim in all_claims:
        # Check both the exact code and a clean display label approximation
        label = claim.replace("_", " ").lower()
        if claim.lower() in text_lower or label in text_lower:
            fallback_matches.add(claim)
            
    return list(fallback_matches)
