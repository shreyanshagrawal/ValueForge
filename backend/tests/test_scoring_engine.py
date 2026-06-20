import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models.models import Base, CompetitorProduct, Persona
from services.scoring_engine import compute_tier_cds, compute_crs, compute_fos_and_classification
from services.intent_engine import compute_intent_adjusted_score

# Test Database Setup
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="function")
def db_session():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    
    # Seed mock data
    products = [
        # Premium tier, 6 total, 4 with high_protein (66.67% -> red)
        CompetitorProduct(category_code="protein_bars", price_tier="premium", claim_codes=["high_protein", "clean_label"]),
        CompetitorProduct(category_code="protein_bars", price_tier="premium", claim_codes=["high_protein", "vegan"]),
        CompetitorProduct(category_code="protein_bars", price_tier="premium", claim_codes=["high_protein"]),
        CompetitorProduct(category_code="protein_bars", price_tier="premium", claim_codes=["high_protein", "energy"]),
        CompetitorProduct(category_code="protein_bars", price_tier="premium", claim_codes=["vegan"]),
        CompetitorProduct(category_code="protein_bars", price_tier="premium", claim_codes=["clean_label"]),
        
        # Mid tier, 3 total, 1 with high_protein (33.33% -> yellow)
        CompetitorProduct(category_code="protein_bars", price_tier="mid", claim_codes=["high_protein"]),
        CompetitorProduct(category_code="protein_bars", price_tier="mid", claim_codes=["energy"]),
        CompetitorProduct(category_code="protein_bars", price_tier="mid", claim_codes=["vegan"]),
        
        # Mass tier, 5 total, 1 with high_protein (20.00% -> green)
        CompetitorProduct(category_code="protein_bars", price_tier="mass", claim_codes=["high_protein"]),
        CompetitorProduct(category_code="protein_bars", price_tier="mass", claim_codes=["sugar_free"]),
        CompetitorProduct(category_code="protein_bars", price_tier="mass", claim_codes=["sugar_free"]),
        CompetitorProduct(category_code="protein_bars", price_tier="mass", claim_codes=["energy"]),
        CompetitorProduct(category_code="protein_bars", price_tier="mass", claim_codes=["energy"])
    ]
    db.add_all(products)
    db.commit()
    
    yield db
    
    db.close()
    Base.metadata.drop_all(bind=engine)

def test_compute_tier_cds_red(db_session):
    result = compute_tier_cds(db_session, "high_protein", "protein_bars", "premium")
    assert result["total_products_at_tier"] == 6
    assert result["product_count_at_tier"] == 4
    assert round(result["tier_cds_score"], 2) == 66.67
    assert result["cds_zone"] == "red"

def test_compute_tier_cds_yellow(db_session):
    result = compute_tier_cds(db_session, "high_protein", "protein_bars", "mid")
    assert result["total_products_at_tier"] == 3
    assert result["product_count_at_tier"] == 1
    assert round(result["tier_cds_score"], 2) == 33.33
    assert result["cds_zone"] == "yellow"

def test_compute_tier_cds_green(db_session):
    result = compute_tier_cds(db_session, "high_protein", "protein_bars", "mass")
    assert result["total_products_at_tier"] == 5
    assert result["product_count_at_tier"] == 1
    assert round(result["tier_cds_score"], 2) == 20.00
    assert result["cds_zone"] == "green"

def test_compute_tier_cds_zero_edge_case(db_session):
    result = compute_tier_cds(db_session, "high_protein", "protein_bars", "ultra_premium")
    assert result["total_products_at_tier"] == 0
    assert result["product_count_at_tier"] == 0
    assert result["tier_cds_score"] == 0.0
    assert result["cds_zone"] == "green"
    assert "Insufficient data" in result["note"]

def test_compute_intent_adjusted_score_responds():
    persona = Persona(
        display_name="Fitness Millennial",
        psychographic_driver="Achievement",
        responds_to_claims=["recovery_focused", "high_protein"],
        avoids_claims=["budget_price"]
    )
    result = compute_intent_adjusted_score(persona, "high_protein")
    assert result["intent_score"] == 85.0
    assert "Strong signal" in result["reasoning"]

def test_compute_intent_adjusted_score_avoids():
    persona = Persona(
        display_name="Fitness Millennial",
        psychographic_driver="Achievement",
        responds_to_claims=["recovery_focused", "high_protein"],
        avoids_claims=["budget_price"]
    )
    result = compute_intent_adjusted_score(persona, "budget_price")
    assert result["intent_score"] == 15.0
    assert "Negative signal" in result["reasoning"]

def test_compute_intent_adjusted_score_neutral():
    persona = Persona(
        display_name="Fitness Millennial",
        psychographic_driver="Achievement",
        responds_to_claims=["recovery_focused", "high_protein"],
        avoids_claims=["budget_price"]
    )
    result = compute_intent_adjusted_score(persona, "sustainable")
    assert result["intent_score"] == 50.0
    assert "No strong signal" in result["reasoning"]

def test_compute_crs():
    # tier_cds=30 should give peak believability (95)
    # "high_protein" should give relevance 85
    # fatigue inverse based on hash
    result = compute_crs(claim_code="high_protein", category_code="protein_bars", intent_score=85.0, tier_cds_score=30.0)
    assert result["crs_believability"] == 95.0
    assert result["crs_relevance"] == 85.0
    assert result["crs_trigger_alignment"] == 85.0
    assert "crs_score" in result

def test_compute_fos_true_whitespace():
    res = compute_fos_and_classification(tier_cds_score=20.0, crs_score=70.0, bps_score=80.0)
    assert res["whitespace_classification"] == "true_whitespace"

def test_compute_fos_brand_whitespace():
    res = compute_fos_and_classification(tier_cds_score=20.0, crs_score=80.0, bps_score=30.0)
    assert res["whitespace_classification"] == "brand_whitespace"

def test_compute_fos_consumer_whitespace():
    res = compute_fos_and_classification(tier_cds_score=20.0, crs_score=30.0, bps_score=70.0)
    assert res["whitespace_classification"] == "consumer_whitespace"

def test_compute_fos_conditional():
    # tier < 50, bps > 40, but crs < 50
    res = compute_fos_and_classification(tier_cds_score=40.0, crs_score=40.0, bps_score=50.0)
    assert res["whitespace_classification"] == "conditional"

def test_compute_fos_contested():
    res = compute_fos_and_classification(tier_cds_score=70.0, crs_score=40.0, bps_score=30.0)
    assert res["whitespace_classification"] == "contested"
