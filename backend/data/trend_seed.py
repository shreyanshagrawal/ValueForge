import hashlib

def get_trend_data(claim_code: str) -> dict:
    """
    Returns deterministic trend_direction ("rising", "peaking", "declining")
    and trend_velocity_score (MoM % growth) for a claim_code.
    """
    rising_claims = ["gut_health", "ashwagandha", "nootropic", "adaptogen", "plant_based", "clean_label", "immunity", "collagen", "maca"]
    declining_claims = ["low_fat", "diet", "artificial_sweeteners", "weight_loss", "low_calorie"]
    
    # Deterministic hash
    h = int(hashlib.md5(claim_code.encode()).hexdigest(), 16)
    
    if claim_code in rising_claims:
        direction = "rising"
        velocity = 15.0 + (h % 15)  # 15 to 30%
    elif claim_code in declining_claims:
        direction = "declining"
        velocity = -5.0 - (h % 10)  # -5 to -15%
    else:
        mod = h % 100
        if mod < 20:
            direction = "rising"
            velocity = 10.0 + (h % 20)
        elif mod < 85:
            direction = "peaking"
            velocity = 2.0 + (h % 8)
        else:
            direction = "declining"
            velocity = -2.0 - (h % 8)
            
    return {
        "trend_direction": direction,
        "trend_velocity_score": round(velocity, 1)
    }
