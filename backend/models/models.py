import uuid
from sqlalchemy import Column, String, JSON, Integer, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from db import Base

def generate_uuid():
    return str(uuid.uuid4())

class Persona(Base):
    __tablename__ = "personas"
    id = Column(String, primary_key=True, default=generate_uuid)
    code = Column(String, unique=True, index=True)
    display_name = Column(String)
    age_range = Column(String)
    psychographic_driver = Column(String)
    price_sensitivity = Column(String)
    responds_to_claims = Column(JSON)
    avoids_claims = Column(JSON)

class ProductCategory(Base):
    __tablename__ = "product_categories"
    id = Column(String, primary_key=True, default=generate_uuid)
    code = Column(String, unique=True, index=True)
    display_name = Column(String)

class Claim(Base):
    __tablename__ = "claims"
    id = Column(String, primary_key=True, default=generate_uuid)
    claim_code = Column(String, unique=True, index=True)
    display_label = Column(String)
    claim_type = Column(String)

class CompetitorProduct(Base):
    __tablename__ = "competitor_products"
    id = Column(String, primary_key=True, default=generate_uuid)
    product_name = Column(String)
    category_code = Column(String, index=True)
    price_tier = Column(String)
    claim_codes = Column(JSON)
    brand_name = Column(String)

class ScanSession(Base):
    __tablename__ = "scan_sessions"
    id = Column(String, primary_key=True, default=generate_uuid)
    product_name = Column(String)
    category_code = Column(String)
    persona_code = Column(String)
    primary_benefit_idea = Column(String)
    key_ingredient = Column(String)
    target_price_tier = Column(String)
    extracted_claim_signals = Column(JSON, nullable=True)
    status = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    claim_scores = relationship("ClaimScore", back_populates="scan")
    misalignment_flags = relationship("MisalignmentFlag", back_populates="scan")
    value_propositions = relationship("ValueProposition", back_populates="scan")
    failure_matches = relationship("FailureMatch", back_populates="scan")

class FailureMatch(Base):
    __tablename__ = "failure_matches"
    id = Column(String, primary_key=True, default=generate_uuid)
    scan_id = Column(String, ForeignKey("scan_sessions.id"))
    failure_case_id = Column(String, ForeignKey("failure_cases.id"))
    similarity_score = Column(Float)
    rank = Column(Integer)

    scan = relationship("ScanSession", back_populates="failure_matches")
    failure_case = relationship("FailureCase")



class MisalignmentFlag(Base):
    __tablename__ = "misalignment_flags"
    id = Column(String, primary_key=True, default=generate_uuid)
    scan_id = Column(String, ForeignKey("scan_sessions.id"))
    flagged_claim_code = Column(String)
    flag_reason = Column(String)
    tier_cds_at_flag = Column(Float)
    crs_at_flag = Column(Float)
    bps_at_flag = Column(Float)
    suggested_replacement_code = Column(String, nullable=True)
    explanation = Column(String)

    scan = relationship("ScanSession", back_populates="misalignment_flags")

class ClaimScore(Base):
    __tablename__ = "claim_scores"
    id = Column(String, primary_key=True, default=generate_uuid)
    scan_id = Column(String, ForeignKey("scan_sessions.id"))
    claim_code = Column(String)
    tier_cds_score = Column(Float)
    cds_zone = Column(String)
    crs_believability = Column(Float)
    crs_relevance = Column(Float)
    crs_fatigue_inverse = Column(Float)
    crs_trigger_alignment = Column(Float)
    crs_score = Column(Float)
    bps_score = Column(Float)
    fos_score = Column(Float)
    whitespace_classification = Column(String)

    scan = relationship("ScanSession", back_populates="claim_scores")

class FailureCase(Base):
    __tablename__ = "failure_cases"
    id = Column(String, primary_key=True, default=generate_uuid)
    product_name = Column(String)
    category_code = Column(String)
    positioning_used = Column(String)
    claim_codes_used = Column(JSON)
    failure_reason_type = Column(String)
    failure_summary = Column(String)
    lesson_learned = Column(String)
    embedding = Column(JSON, nullable=True)

class ValueProposition(Base):
    __tablename__ = "value_propositions"
    id = Column(String, primary_key=True, default=generate_uuid)
    scan_id = Column(String, ForeignKey("scan_sessions.id"))
    rank = Column(Integer)
    headline = Column(String)
    subclaim_1 = Column(String)
    subclaim_2 = Column(String)
    fos_score = Column(Float)
    bps_score = Column(Float)
    whitespace_classification = Column(String)
    hero_ingredients = Column(JSON)
    ingredient_rationale = Column(String)
    recommended_format = Column(String)
    packaging_direction = Column(String)
    price_band_min = Column(Float)
    price_band_max = Column(Float)
    first_mover_window = Column(String)
    channel_fit = Column(JSON)

    scan = relationship("ScanSession", back_populates="value_propositions")
