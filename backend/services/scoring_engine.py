from sqlalchemy.orm import Session
from models.models import CompetitorProduct
from services.brand_permission import get_stable_hash_score

def compute_tier_cds(db_session: Session, claim_code: str, category_code: str, target_price_tier: str, live_data: list = None) -> dict:
    """
    Computes the Tier-Adjusted Claim Density Score (Tier-CDS), the Market Dimension of our 3-dimension model.
    """
    if live_data is not None:
        db_products = db_session.query(CompetitorProduct).filter(
            CompetitorProduct.category_code == category_code,
            CompetitorProduct.price_tier == target_price_tier
        ).all()
        db_list = [{"claim_codes": p.claim_codes} for p in db_products]
        live_list = [{"claim_codes": p.get("claim_codes", [])} for p in live_data if p.get("category_code") == category_code and p.get("price_tier") == target_price_tier]
        all_products = db_list + live_list
        total_products_at_tier = len(all_products)
    else:
        products_at_tier = db_session.query(CompetitorProduct).filter(
            CompetitorProduct.category_code == category_code,
            CompetitorProduct.price_tier == target_price_tier
        ).all()
        total_products_at_tier = len(products_at_tier)
        all_products = [{"claim_codes": p.claim_codes} for p in products_at_tier]
    
    if total_products_at_tier == 0:
        return {
            "tier_cds_score": 0.0,
            "cds_zone": "green",
            "product_count_at_tier": 0,
            "total_products_at_tier": 0,
            "note": "Insufficient data (0 products at this tier)"
        }
    
    products_using_claim = sum(
        1 for p in all_products 
        if p.get("claim_codes") and claim_code in p["claim_codes"]
    )
    
    tier_cds_score = (products_using_claim / total_products_at_tier) * 100
    
    if tier_cds_score < 30:
        cds_zone = "green"
    elif tier_cds_score <= 60:
        cds_zone = "yellow"
    else:
        cds_zone = "red"
        
    return {
        "tier_cds_score": round(tier_cds_score, 2),
        "cds_zone": cds_zone,
        "product_count_at_tier": products_using_claim,
        "total_products_at_tier": total_products_at_tier
    }

def compute_crs(claim_code: str, category_code: str, intent_score: float, tier_cds_score: float) -> dict:
    """
    Computes the Consumer Response Score (CRS) — the Consumer Dimension.
    Believability and Relevance are heuristic stand-ins for the full version's review-sentiment 
    and trend-API data sources.
    """
    # 1. Believability (0-100)
    # peaks around tier_cds 20-40, penalizes both extremes
    if tier_cds_score < 10:
        crs_believability = 50.0 + (tier_cds_score * 2) # 50 to 70
    elif 10 <= tier_cds_score <= 50:
        # peaks around 30 at 95.0
        distance_from_optimal = abs(tier_cds_score - 30.0)
        crs_believability = 95.0 - distance_from_optimal
    else:
        # > 50, decreases from ~75 down to 30
        crs_believability = max(30.0, 95.0 - (tier_cds_score - 30.0) * 1.5)
        
    crs_believability = round(min(100.0, max(0.0, crs_believability)), 2)
    
    # 2. Relevance (0-100) static lookup
    functional_ingredient = ["high_protein", "no_sugar", "high_fibre", "immunity_boosting", "collagen", "ashwagandha", "turmeric", "whey_protein", "plant_protein", "recovery_focused", "science_backed", "performance", "fortified", "natural", "clinically_tested", "gut_health"]
    format_lifestyle = ["on_the_go", "single_serve", "ready_to_mix", "fitness", "wellness", "sustainable", "vegan"]
    
    if claim_code in functional_ingredient:
        crs_relevance = 85.0
    elif claim_code in format_lifestyle:
        crs_relevance = 75.0
    else:
        crs_relevance = 60.0
        
    # 3. FatigueInverse (0-100)
    # 100 minus a pseudo-stable hash-based "media frequency" score per claim_code (10 to 60)
    media_frequency = get_stable_hash_score(claim_code, 10, 60)
    crs_fatigue_inverse = round(100.0 - media_frequency, 2)
    
    # 4. TriggerAlignment (0-100)
    crs_trigger_alignment = intent_score
    
    # Compute weighted CRS
    crs_score = (crs_believability * 0.25) + (crs_relevance * 0.30) + (crs_fatigue_inverse * 0.25) + (crs_trigger_alignment * 0.20)
    crs_score = round(crs_score, 2)
    
    return {
        "crs_score": crs_score,
        "crs_believability": crs_believability,
        "crs_relevance": crs_relevance,
        "crs_fatigue_inverse": crs_fatigue_inverse,
        "crs_trigger_alignment": crs_trigger_alignment
    }

def compute_fos_and_classification(tier_cds_score: float, crs_score: float, bps_score: float) -> dict:
    # 1. Compute fos_score
    fos_score = ((100.0 - tier_cds_score) * 0.35) + (crs_score * 0.40) + (bps_score * 0.25)
    fos_score = round(fos_score, 2)
    
    # 2. Classify whitespace
    if tier_cds_score < 30 and crs_score > 60 and bps_score > 60:
        classification = "true_whitespace"
    elif tier_cds_score < 30 and bps_score < 40:
        classification = "brand_whitespace"
    elif tier_cds_score < 30 and bps_score > 60 and crs_score < 40:
        classification = "consumer_whitespace"
    else:
        conditions_met = 0
        if tier_cds_score < 50: conditions_met += 1
        if crs_score > 50: conditions_met += 1
        if bps_score > 40: conditions_met += 1
        
        if conditions_met >= 2:
            classification = "conditional"
        elif tier_cds_score > 60:
            classification = "contested"
        else:
            classification = "contested" # Fallback if nothing matches
            
    return {
        "fos_score": fos_score,
        "whitespace_classification": classification
    }
