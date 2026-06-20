from sqlalchemy.orm import Session
import json
from models.models import ScanSession, ClaimScore, ValueProposition, Persona
from data.ingredient_mappings import get_ingredient_recommendation
from data.format_mappings import get_format_recommendation
from services.price_architecture import recommend_price_band
from services.gemini_client import generate_text

def get_channel_fit(persona_code: str) -> list[str]:
    mapping = {
        "fitness_millennial": ["Instagram Reels", "Fitness Influencer Partnerships"],
        "wellness_boomer": ["Facebook Ads", "Pharmacy End-caps"],
        "busy_parent": ["Pinterest", "Mom-blog Sponsorships"],
        "gen_z_lifestyle": ["TikTok", "Twitch Integrations"]
    }
    return mapping.get(persona_code, ["Instagram", "Google Search Ads"])

def generate_value_propositions(db_session: Session, scan_session: ScanSession, claim_scores: list[ClaimScore], top_n: int = 3):
    # 1. Filter and sort claims
    true_ws = [c for c in claim_scores if c.whitespace_classification == "true_whitespace"]
    conditional = [c for c in claim_scores if c.whitespace_classification == "conditional"]
    
    true_ws.sort(key=lambda x: x.fos_score, reverse=True)
    conditional.sort(key=lambda x: x.fos_score, reverse=True)
    
    selected_claims = true_ws + conditional
    selected_claims = selected_claims[:top_n]
    
    # Get persona driver
    persona = db_session.query(Persona).filter(Persona.code == scan_session.persona_code).first()
    driver = persona.psychographic_driver if persona else "generic"
    
    for idx, claim in enumerate(selected_claims):
        # 2. Get recommendations
        ingredients = get_ingredient_recommendation(claim.claim_code, driver)
        format_rec = get_format_recommendation(scan_session.persona_code, scan_session.target_price_tier)
        price_band = recommend_price_band(db_session, scan_session.category_code, scan_session.target_price_tier, claim.tier_cds_score)
        
        # 3. Gemini generation
        prompt = f"""
        You are an expert FMCG brand copywriter.
        Product Concept: {scan_session.primary_benefit_idea}
        Target Persona Driver: {driver}
        Core Claim: {claim.claim_code}
        Whitespace Classification: {claim.whitespace_classification}
        
        Write a short, punchy product positioning headline (under 12 words) and exactly 2 supporting sub-claims (under 8 words each).
        Return ONLY valid JSON with keys: "headline", "subclaim_1", "subclaim_2".
        """
        
        gemini_response = generate_text(prompt)
        # Parse JSON
        try:
            clean_json = gemini_response.strip()
            if clean_json.startswith("```json"):
                clean_json = clean_json[7:]
            if clean_json.endswith("```"):
                clean_json = clean_json[:-3]
            copy_data = json.loads(clean_json.strip())
        except Exception as e:
            print("Failed to parse Gemini VP generation:", e)
            copy_data = {
                "headline": f"The Ultimate {claim.claim_code.replace('_', ' ').title()} Solution",
                "subclaim_1": "Backed by science.",
                "subclaim_2": "Designed for your lifestyle."
            }
            
        # 4. Channel fit
        channels = get_channel_fit(scan_session.persona_code)
        
        # 5. Assemble and save
        vp = ValueProposition(
            scan_id=scan_session.id,
            rank=idx + 1,
            headline=copy_data.get("headline", ""),
            subclaim_1=copy_data.get("subclaim_1", ""),
            subclaim_2=copy_data.get("subclaim_2", ""),
            fos_score=claim.fos_score,
            bps_score=claim.bps_score,
            whitespace_classification=claim.whitespace_classification,
            hero_ingredients=ingredients["hero_ingredients"],
            ingredient_rationale=ingredients["rationale"],
            recommended_format=format_rec["recommended_format"],
            packaging_direction=format_rec["packaging_direction"],
            price_band_min=price_band["price_band_min"],
            price_band_max=price_band["price_band_max"],
            first_mover_window="6-9 months",
            channel_fit=channels
        )
        db_session.add(vp)
        
    db_session.commit()
