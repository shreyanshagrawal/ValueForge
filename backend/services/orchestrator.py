from sqlalchemy.orm import Session
from models.models import ScanSession, Persona, CompetitorProduct, ClaimScore, MisalignmentFlag, FailureMatch
from services.scoring_engine import compute_tier_cds, compute_crs, compute_fos_and_classification
from services.intent_engine import compute_intent_adjusted_score
from services.brand_permission import compute_bps
from services.misalignment_engine import generate_misalignment_flags
from services.failure_matcher import find_matching_failures

def run_full_scan(db_session: Session, scan_session: ScanSession) -> list[dict]:
    # 1. Fetch persona
    persona = db_session.query(Persona).filter(Persona.code == scan_session.persona_code).first()
    if not persona:
        raise ValueError(f"Persona '{scan_session.persona_code}' not found.")
        
    # 2. Get all distinct claim_codes that appear anywhere in CompetitorProduct.claim_codes for that category
    products_in_category = db_session.query(CompetitorProduct).filter(
        CompetitorProduct.category_code == scan_session.category_code
    ).all()
    
    candidate_claims = set()
    for p in products_in_category:
        if p.claim_codes:
            for claim in p.claim_codes:
                candidate_claims.add(claim)
                
    # 3. For each candidate claim:
    results = []
    for claim_code in candidate_claims:
        # tier_cds feeds into CRS and FOS
        tier_cds_res = compute_tier_cds(
            db_session=db_session, 
            claim_code=claim_code, 
            category_code=scan_session.category_code, 
            target_price_tier=scan_session.target_price_tier
        )
        tier_cds_score = tier_cds_res["tier_cds_score"]
        
        # intent_score feeds into CRS
        intent_res = compute_intent_adjusted_score(
            persona=persona, 
            claim_code=claim_code
        )
        intent_score = intent_res["intent_score"]
        
        # bps feeds into FOS
        bps_res = compute_bps(
            category_code=scan_session.category_code, 
            claim_code=claim_code, 
            key_ingredient=scan_session.key_ingredient
        )
        bps_score = bps_res["bps_score"]
        
        # crs feeds into FOS
        crs_res = compute_crs(
            claim_code=claim_code, 
            category_code=scan_session.category_code, 
            intent_score=intent_score, 
            tier_cds_score=tier_cds_score
        )
        crs_score = crs_res["crs_score"]
        
        # fos
        fos_res = compute_fos_and_classification(
            tier_cds_score=tier_cds_score, 
            crs_score=crs_score, 
            bps_score=bps_score
        )
        
        # 4. Save to ClaimScore
        cs = ClaimScore(
            scan_id=scan_session.id,
            claim_code=claim_code,
            tier_cds_score=tier_cds_score,
            cds_zone=tier_cds_res["cds_zone"],
            crs_believability=crs_res["crs_believability"],
            crs_relevance=crs_res["crs_relevance"],
            crs_fatigue_inverse=crs_res["crs_fatigue_inverse"],
            crs_trigger_alignment=crs_res["crs_trigger_alignment"],
            crs_score=crs_score,
            bps_score=bps_score,
            fos_score=fos_res["fos_score"],
            whitespace_classification=fos_res["whitespace_classification"]
        )
        db_session.add(cs)
        
        # Add to results list
        full_res = {
            "claim_code": claim_code,
            "tier_cds_score": tier_cds_score,
            "cds_zone": tier_cds_res["cds_zone"],
            "crs_score": crs_score,
            "bps_score": bps_score,
            "fos_score": fos_res["fos_score"],
            "whitespace_classification": fos_res["whitespace_classification"]
        }
        results.append(full_res)
        
    db_session.commit()
    
    # 5. Return sorted by fos_score descending
    results.sort(key=lambda x: x["fos_score"], reverse=True)
    
    # 6. Run misalignment engine
    if scan_session.extracted_claim_signals:
        flags = generate_misalignment_flags(scan_session.extracted_claim_signals, results)
        for flag in flags:
            mf = MisalignmentFlag(
                scan_id=scan_session.id,
                flagged_claim_code=flag["flagged_claim_code"],
                flag_reason=flag["flag_reason"],
                tier_cds_at_flag=flag["tier_cds_at_flag"],
                crs_at_flag=flag["crs_at_flag"],
                bps_at_flag=flag["bps_at_flag"],
                suggested_replacement_code=flag["suggested_replacement_code"],
                explanation=flag["explanation"]
            )
            db_session.add(mf)
        db_session.commit()
        
    # 7. Run Failure Matching
    matched_failures = find_matching_failures(db_session, scan_session)
    for idx, match in enumerate(matched_failures):
        fm = FailureMatch(
            scan_id=scan_session.id,
            failure_case_id=match["failure_case"].id,
            similarity_score=match["similarity_score"],
            rank=idx + 1
        )
        db_session.add(fm)
    db_session.commit()
        
    return results
