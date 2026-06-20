from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from db import get_db
from models.models import ClaimScore
from data.seed_data import NEED_CATEGORY_MAP

router = APIRouter()

@router.get("/{scan_id}/whitespace")
def get_whitespace_grid(scan_id: str, db: Session = Depends(get_db)):
    claims = db.query(ClaimScore).filter(ClaimScore.scan_id == scan_id).all()
    
    grid_dict = {}
    
    # Initialize all categories and buckets to ensure grid completeness
    categories = ["Energy", "Recovery", "Immunity", "Taste", "Convenience", "Sustainability"]
    buckets = ["Underserved", "Moderate", "Saturated"]
    
    for cat in categories:
        for buck in buckets:
            grid_dict[(cat, buck)] = []
            
    for claim in claims:
        need_cat = NEED_CATEGORY_MAP.get(claim.claim_code, "Sustainability")
        
        if claim.tier_cds_score < 30:
            bucket = "Underserved"
        elif claim.tier_cds_score <= 60:
            bucket = "Moderate"
        else:
            bucket = "Saturated"
            
        grid_dict[(need_cat, bucket)].append({
            "claim_code": claim.claim_code,
            "fos_score": claim.fos_score,
            "bps_score": claim.bps_score,
            "whitespace_classification": claim.whitespace_classification
        })
        
    grid_list = []
    for (cat, buck), claim_list in grid_dict.items():
        grid_list.append({
            "need_category": cat,
            "coverage_bucket": buck,
            "claims": claim_list
        })
        
    return {"grid": grid_list}
