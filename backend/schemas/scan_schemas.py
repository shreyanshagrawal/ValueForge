from pydantic import BaseModel
from typing import Optional, List

class ScanCreateRequest(BaseModel):
    product_name: str
    category_code: str
    persona_code: str
    primary_benefit_idea: str
    key_ingredient: Optional[str] = None
    target_price_tier: str

class ScanSessionResponse(BaseModel):
    id: str
    product_name: str
    category_code: str
    persona_code: str
    primary_benefit_idea: str
    key_ingredient: Optional[str]
    target_price_tier: str
    extracted_claim_signals: Optional[List[str]] = None
    status: str

    class Config:
        from_attributes = True

class MisalignmentFlagResponse(BaseModel):
    id: str
    flagged_claim_code: str
    flag_reason: str
    tier_cds_at_flag: float
    crs_at_flag: float
    bps_at_flag: float
    suggested_replacement_code: Optional[str]
    explanation: str

    class Config:
        from_attributes = True

class ClaimScoreResponse(BaseModel):
    id: str
    claim_code: str
    tier_cds_score: float
    cds_zone: str
    crs_score: float
    bps_score: float
    fos_score: float
    whitespace_classification: str

    class Config:
        from_attributes = True

class FailureCaseResponse(BaseModel):
    id: str
    product_name: str
    category_code: str
    positioning_used: str
    claim_codes_used: List[str]
    failure_reason_type: str
    failure_summary: str
    lesson_learned: str

    class Config:
        from_attributes = True

class FailureMatchResponse(BaseModel):
    id: str
    similarity_score: float
    rank: int
    failure_case: FailureCaseResponse

    class Config:
        from_attributes = True
