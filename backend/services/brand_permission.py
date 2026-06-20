import hashlib

def get_stable_hash_score(text: str, min_val: int, max_val: int) -> float:
    """Generates a stable pseudo-random score between min_val and max_val based on a string hash."""
    hash_object = hashlib.md5(text.encode())
    hash_int = int(hash_object.hexdigest()[:8], 16)
    # Map to 0.0 - 1.0 range
    normalized = hash_int / 0xFFFFFFFF
    return round(min_val + (normalized * (max_val - min_val)), 2)

def compute_bps(category_code: str, claim_code: str, key_ingredient: str | None = None) -> dict:
    """
    Computes a simplified Brand Permission Score (BPS) — the Brand Dimension.
    
    NOTE: This is a simplified heuristic standing in for the full brand-equity-data 
    version described in the PRD, since we don't have real brand history in this prototype.
    """
    # 1. CategoryTenureScore (40-90)
    category_tenure_score = get_stable_hash_score(category_code, 40, 90)
    
    # 2. ExistingClaimAlignmentScore (70-90 if semantically related, 40-60 otherwise)
    # Simple semantic keyword matching heuristic
    related_pairs = [
        ("collagen", "recovery_focused"),
        ("whey_protein", "high_protein"),
        ("ashwagandha", "calm"),
        ("ashwagandha", "wellness"),
        ("turmeric", "immunity_boosting")
    ]
    
    is_related = False
    if key_ingredient:
        for ing, claim in related_pairs:
            if key_ingredient.lower() == ing and claim_code == claim:
                is_related = True
                break
                
    if is_related:
        existing_claim_alignment = get_stable_hash_score(f"{key_ingredient}_{claim_code}", 70, 90)
    else:
        existing_claim_alignment = get_stable_hash_score(f"{key_ingredient}_{claim_code}", 40, 60)
        
    # 3. ConsumerAssociationScore (35-85)
    consumer_association_score = get_stable_hash_score(claim_code, 35, 85)
    
    # 4. Compute weighted BPS
    bps_score = (category_tenure_score * 0.30) + (existing_claim_alignment * 0.40) + (consumer_association_score * 0.30)
    bps_score = round(bps_score, 2)
    
    if bps_score < 40:
        bps_verdict = "cannot_own"
    elif bps_score <= 69:
        bps_verdict = "credible"
    else:
        bps_verdict = "strong_fit"
        
    return {
        "bps_score": bps_score,
        "bps_verdict": bps_verdict,
        "category_tenure_score": category_tenure_score,
        "existing_claim_alignment": existing_claim_alignment,
        "consumer_association_score": consumer_association_score
    }
