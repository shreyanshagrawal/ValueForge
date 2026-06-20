def generate_misalignment_flags(extracted_claim_signals: list[str], claim_scores: list[dict]) -> list[dict]:
    flags = []
    
    # Precompute a replacement candidate
    # "highest-FOS claim from claim_scores that IS classified as "true_whitespace" or "conditional" and isn't already in extracted_claim_signals"
    replacement_candidate = None
    for cs in claim_scores:
        if cs["claim_code"] not in extracted_claim_signals:
            if cs["whitespace_classification"] in ["true_whitespace", "conditional"]:
                replacement_candidate = cs["claim_code"]
                break # Since claim_scores is sorted by FOS descending, the first one found is the highest FOS
                
    for claim_code in extracted_claim_signals:
        # Find the claim score for this claim
        cs = next((score for score in claim_scores if score["claim_code"] == claim_code), None)
        if not cs:
            continue
            
        reasons = []
        if cs["tier_cds_score"] > 60:
            reasons.append("too_crowded_at_tier")
        if cs["crs_score"] < 40:
            reasons.append("poor_consumer_response")
        if cs["bps_score"] < 40:
            reasons.append("brand_permission_gap")
            
        if reasons:
            flag_reason = "+".join(reasons)
            
            explanation_parts = []
            if "too_crowded_at_tier" in reasons:
                explanation_parts.append("This claim is highly crowded in the current market tier.")
            if "poor_consumer_response" in reasons:
                explanation_parts.append("Consumer response to this claim is historically poor.")
            if "brand_permission_gap" in reasons:
                explanation_parts.append("Your brand lacks credibility to own this claim.")
                
            explanation = " ".join(explanation_parts)
            
            flags.append({
                "flagged_claim_code": claim_code,
                "flag_reason": flag_reason,
                "tier_cds_at_flag": cs["tier_cds_score"],
                "crs_at_flag": cs["crs_score"],
                "bps_at_flag": cs["bps_score"],
                "suggested_replacement_code": replacement_candidate,
                "explanation": explanation
            })
            
    return flags
