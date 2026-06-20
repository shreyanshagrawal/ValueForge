import hashlib
from sqlalchemy.orm import Session
from models.models import CompetitorProduct

def recommend_price_band(db_session: Session, category_code: str, target_price_tier: str, tier_cds_score: float) -> dict:
    """
    Deterministically computes a price band based on the target tier and market crowdedness.
    """
    # Define baseline per-serve boundaries for the tiers
    tier_bounds = {
        "mass": (20.0, 60.0),
        "mid": (60.0, 120.0),
        "premium": (120.0, 180.0),
        "ultra-premium": (180.0, 250.0)
    }
    
    # Fallback to mid if unknown
    bounds = tier_bounds.get(target_price_tier.lower(), (60.0, 120.0))
    min_bound, max_bound = bounds
    range_span = max_bound - min_bound
    
    # Use tier_cds_score (crowdedness) to position the price.
    # If CDS > 60 (crowded), we want to push the price to the higher end (premium differentiation).
    # If CDS < 30 (open), we can aim right in the middle or lower.
    
    if tier_cds_score > 60.0:
        # Crowded: position in the top 40% of the band
        band_center = min_bound + (range_span * 0.8)
        rationale = f"Given high competition in the {target_price_tier} tier, pricing at the upper end signals premium quality and differentiates from crowded lower-priced alternatives."
    elif tier_cds_score < 30.0:
        # Open: position in the middle
        band_center = min_bound + (range_span * 0.5)
        rationale = f"With low competition in the {target_price_tier} tier, a mid-range price captures maximum market share without triggering a race to the bottom."
    else:
        # Moderate: position slightly above middle
        band_center = min_bound + (range_span * 0.65)
        rationale = f"Moderate competition suggests a balanced approach; pricing slightly above the median establishes strong brand equity."
        
    # Create a +/- 10% band around the center
    band_min = round(band_center * 0.9, 2)
    band_max = round(band_center * 1.1, 2)
    
    # Ensure we don't bleed out of the absolute tier bounds
    band_min = max(min_bound, band_min)
    band_max = min(max_bound, band_max)
    
    return {
        "price_band_min": band_min,
        "price_band_max": band_max,
        "rationale": rationale
    }
