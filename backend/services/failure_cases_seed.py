from sqlalchemy.orm import Session
from models.models import FailureCase
import random

def seed_failure_cases(db: Session):
    if db.query(FailureCase).first():
        return # Already seeded

    # Generate 25 mock cases across 5 categories
    categories = ["energy_drinks", "protein_bars", "functional_beverages", "snack_foods", "supplements"]
    reasons = ["taste_mismatch", "claim_not_believed", "price_value_disconnect", "persona_wrong", "market_not_ready", "brand_permission_gap"]
    
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

    mock_cases = []
    
    for i in range(1, 26):
        category = categories[i % len(categories)]
        reason = reasons[i % len(reasons)]
        
        claims = random.sample(base_claims, k=random.randint(1, 3))
        
        mock_cases.append(
            FailureCase(
                product_name=f"MockBrand {category.replace('_', ' ').title()} V{i}",
                category_code=category,
                positioning_used=f"Targeted at active users looking for {claims[0].replace('_', ' ')} with a focus on value.",
                claim_codes_used=claims,
                failure_reason_type=reason,
                failure_summary=f"The product failed due to {reason.replace('_', ' ')}. Consumers didn't resonate with the claims vs actual delivery.",
                lesson_learned=f"Ensure {reason.replace('_', ' ')} is addressed in product development and marketing alignment."
            )
        )
        
    db.add_all(mock_cases)
    db.commit()
    print("Seeded 25 mock FailureCase entries.")
