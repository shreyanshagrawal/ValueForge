from sqlalchemy.orm import Session
from models.models import CompetitorProduct

def compute_tier_cds(db_session: Session, claim_code: str, category_code: str, target_price_tier: str) -> dict:
    """
    Computes the Tier-Adjusted Claim Density Score (Tier-CDS), the Market Dimension of our 3-dimension model.
    """
    products_at_tier = db_session.query(CompetitorProduct).filter(
        CompetitorProduct.category_code == category_code,
        CompetitorProduct.price_tier == target_price_tier
    ).all()

    total_products_at_tier = len(products_at_tier)
    
    if total_products_at_tier == 0:
        return {
            "tier_cds_score": 0.0,
            "cds_zone": "green",
            "product_count_at_tier": 0,
            "total_products_at_tier": 0,
            "note": "Insufficient data (0 products at this tier)"
        }
    
    products_using_claim = sum(
        1 for p in products_at_tier 
        if p.claim_codes and claim_code in p.claim_codes
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
