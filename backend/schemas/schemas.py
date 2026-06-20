from pydantic import BaseModel
from typing import List, Optional, Any
from datetime import datetime

class PersonaBase(BaseModel):
    code: str
    display_name: str
    age_range: str
    psychographic_driver: str
    price_sensitivity: str
    responds_to_claims: List[str]
    avoids_claims: List[str]

class PersonaResponse(PersonaBase):
    id: str

    class Config:
        from_attributes = True

class ProductCategoryBase(BaseModel):
    code: str
    display_name: str

class ProductCategoryResponse(ProductCategoryBase):
    id: str

    class Config:
        from_attributes = True

class ClaimBase(BaseModel):
    claim_code: str
    display_label: str
    claim_type: str

class ClaimResponse(ClaimBase):
    id: str

    class Config:
        from_attributes = True

class HealthResponse(BaseModel):
    status: str
