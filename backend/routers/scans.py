from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from db import get_db
from models.models import ScanSession, ClaimScore, Claim, MisalignmentFlag, FailureMatch
from schemas.scan_schemas import (
    ScanCreateRequest, 
    ScanSessionResponse, 
    ClaimScoreResponse, 
    MisalignmentFlagResponse, 
    FailureMatchResponse,
    ValuePropositionResponse
)
from services.orchestrator import run_full_scan
from services.nlp_extractor import extract_claim_signals
import traceback

router = APIRouter()

@router.post("", response_model=ScanSessionResponse)
def create_scan(request: ScanCreateRequest, db: Session = Depends(get_db)):
    scan_session = ScanSession(
        product_name=request.product_name,
        category_code=request.category_code,
        persona_code=request.persona_code,
        primary_benefit_idea=request.primary_benefit_idea,
        key_ingredient=request.key_ingredient,
        target_price_tier=request.target_price_tier,
        status="pending"
    )
    db.add(scan_session)
    db.commit()
    db.refresh(scan_session)
    
    try:
        # Extract claim signals
        all_claims = [c.claim_code for c in db.query(Claim).all()]
        extracted = extract_claim_signals(scan_session.primary_benefit_idea, all_claims)
        scan_session.extracted_claim_signals = extracted
        db.commit()
        
        run_full_scan(db, scan_session)
        scan_session.status = "complete"
    except Exception as e:
        scan_session.status = f"failed: {str(e)}"
        print(f"Error in run_full_scan: {traceback.format_exc()}")
        
    db.commit()
    db.refresh(scan_session)
    
    return scan_session

@router.get("/{scan_id}", response_model=ScanSessionResponse)
def get_scan(scan_id: str, db: Session = Depends(get_db)):
    scan = db.query(ScanSession).filter(ScanSession.id == scan_id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
    return scan

@router.get("/{scan_id}/claims", response_model=List[ClaimScoreResponse])
def get_scan_claims(scan_id: str, db: Session = Depends(get_db)):
    claims = db.query(ClaimScore).filter(ClaimScore.scan_id == scan_id).order_by(ClaimScore.fos_score.desc()).all()
    return claims

@router.get("/{scan_id}/misalignment-flags", response_model=List[MisalignmentFlagResponse])
def get_scan_flags(scan_id: str, db: Session = Depends(get_db)):
    flags = db.query(MisalignmentFlag).filter(MisalignmentFlag.scan_id == scan_id).all()
    return flags

@router.get("/{scan_id}/failure-risks", response_model=List[FailureMatchResponse])
def get_scan_failure_risks(scan_id: str, db: Session = Depends(get_db)):
    matches = db.query(FailureMatch).filter(FailureMatch.scan_id == scan_id).order_by(FailureMatch.rank.asc()).all()
    return matches

@router.get("/{scan_id}/value-propositions", response_model=List[ValuePropositionResponse])
def get_scan_vps(scan_id: str, db: Session = Depends(get_db)):
    from models.models import ValueProposition
    vps = db.query(ValueProposition).filter(ValueProposition.scan_id == scan_id).order_by(ValueProposition.rank.asc()).all()
    if not vps:
        raise HTTPException(status_code=404, detail="No value propositions found for this scan.")
    return vps
