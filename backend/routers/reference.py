from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Optional
from db import get_db
from models.models import Persona, ProductCategory, Claim
from schemas.schemas import PersonaResponse, ProductCategoryResponse, ClaimResponse

router = APIRouter()

@router.get("/personas", response_model=List[PersonaResponse])
def get_personas(db: Session = Depends(get_db)):
    return db.query(Persona).all()

@router.get("/categories", response_model=List[ProductCategoryResponse])
def get_categories(db: Session = Depends(get_db)):
    return db.query(ProductCategory).all()

@router.get("/claims", response_model=List[ClaimResponse])
def get_claims(claim_type: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Claim)
    if claim_type:
        query = query.filter(Claim.claim_type == claim_type)
    return query.all()
