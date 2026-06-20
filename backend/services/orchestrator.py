from sqlalchemy.orm import Session
from models.models import ScanSession, Persona, CompetitorProduct, ClaimScore, MisalignmentFlag, FailureMatch
from services.scoring_engine import compute_tier_cds, compute_crs, compute_fos_and_classification
from services.intent_engine import compute_intent_adjusted_score
from services.brand_permission import compute_bps
from services.misalignment_engine import generate_misalignment_flags
from services.failure_matcher import find_matching_failures
from services.vp_generator import generate_value_propositions
import traceback
from db import SessionLocal
from models.models import Claim
from services.nlp_extractor import extract_claim_signals

def run_full_scan_background(scan_id: str):
    db_session = SessionLocal()
    try:
        scan_session = db_session.query(ScanSession).filter(ScanSession.id == scan_id).first()
        if not scan_session:
            return
        
        scan_session.status = "extracting_claims"
        db_session.commit()
        all_claims = [c.claim_code for c in db_session.query(Claim).all()]
        extracted = extract_claim_signals(scan_session.primary_benefit_idea, all_claims)
        scan_session.extracted_claim_signals = extracted
        db_session.commit()
        
        run_full_scan(db_session, scan_session)
        
    except Exception as e:
        scan_session.status = f"failed: {str(e)}"
        print(f"Error in run_full_scan_background: {traceback.format_exc()}")
        db_session.commit()
    finally:
        db_session.close()

def run_full_scan(db_session: Session, scan_session: ScanSession) -> list[dict]:
    scan_session.status = "scoring_claims"
    db_session.commit()
    # 1. Fetch persona
    persona = db_session.query(Persona).filter(Persona.code == scan_session.persona_code).first()
    if not persona:
        raise ValueError(f"Persona '{scan_session.persona_code}' not found.")
        
    live_data = None
    if scan_session.data_source == "live":
        from services.live_scan import fetch_live_competitor_claims
        from models.models import Claim
        all_claims = [c.claim_code for c in db_session.query(Claim).all()]
        live_data = fetch_live_competitor_claims(scan_session.category_code, all_claims)
        if not live_data:
            scan_session.data_source = "seed"
            
    # 2. Get all distinct claim_codes that appear anywhere in CompetitorProduct.claim_codes for that category
    products_in_category = db_session.query(CompetitorProduct).filter(
        CompetitorProduct.category_code == scan_session.category_code
    ).all()
    
    candidate_claims = set()
    for p in products_in_category:
        if p.claim_codes:
            for claim in p.claim_codes:
                candidate_claims.add(claim)
                
    if live_data:
        for p in live_data:
            if p.get("claim_codes"):
                for claim in p["claim_codes"]:
                    candidate_claims.add(claim)
                
    # 3. For each candidate claim:
    results = []
    for claim_code in candidate_claims:
        # tier_cds feeds into CRS and FOS
        tier_cds_res = compute_tier_cds(
            db_session=db_session, 
            claim_code=claim_code, 
            category_code=scan_session.category_code, 
            target_price_tier=scan_session.target_price_tier,
            live_data=live_data
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
        
        # Trend data
        from data.trend_seed import get_trend_data
        trend_data = get_trend_data(claim_code)
        
        first_mover_window = None
        if trend_data["trend_direction"] == "rising" and tier_cds_score < 30:
            val = round((30 - tier_cds_score) / (trend_data["trend_velocity_score"] / 10.0))
            first_mover_window = int(max(1, val))
        
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
            whitespace_classification=fos_res["whitespace_classification"],
            trend_direction=trend_data["trend_direction"],
            trend_velocity_score=trend_data["trend_velocity_score"],
            first_mover_window_months=first_mover_window
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
    scan_session.status = "matching_failures"
    db_session.commit()
    matched_failures = find_matching_failures(db_session, scan_session)
    for idx, match in enumerate(matched_failures):
        fm = FailureMatch(
            scan_id=scan_session.id,
            failure_case_id=match["failure_case"].id,
            similarity_score=match["similarity_score"],
            rank=idx + 1
        )
        db_session.add(fm)
        
    # 8. Generate Value Propositions
    scan_session.status = "generating_vps"
    db_session.commit()
    claim_scores = db_session.query(ClaimScore).filter(ClaimScore.scan_id == scan_session.id).all()
    generate_value_propositions(db_session, scan_session, claim_scores)
    
    # 9. Commit
    scan_session.status = "complete"
    db_session.commit()
        
    return results
