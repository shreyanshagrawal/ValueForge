import pytest
from data.seed_data import NEED_CATEGORY_MAP

def test_all_claims_mapped():
    base_claims = [
        "high_protein", "no_sugar", "high_fibre", "immunity_boosting", 
        "confidence", "empowerment", "calm", "community", 
        "on_the_go", "single_serve", "ready_to_mix", 
        "collagen", "ashwagandha", "turmeric", "whey_protein", "plant_protein", 
        "fitness", "wellness", "sustainable", "vegan", 
        "recovery_focused", "science_backed", "performance", 
        "trusted_brand", "fortified", "wholesome", 
        "natural", "clinically_tested", "doctor_recommended", "gut_health"
    ]
    
    unmapped = []
    for claim in base_claims:
        if claim not in NEED_CATEGORY_MAP:
            unmapped.append(claim)
            
    assert len(unmapped) == 0, f"The following claims are unmapped: {unmapped}"
