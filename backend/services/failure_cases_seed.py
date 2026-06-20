from sqlalchemy.orm import Session
from models.models import FailureCase
import random

def seed_failure_cases(db: Session):
    if db.query(FailureCase).first():
        return # Already seeded

    # Seed 40 mock cases across 5 categories (8 per category)
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

    # Replicate the saturated claims logic from seed_data.py
    random.seed(42)
    cat_saturated_claims = {}
    for cat in categories:
        shuffled = list(base_claims)
        random.shuffle(shuffled)
        cat_saturated_claims[cat] = shuffled[:4] # these are the 4 saturated claims for this cat

    mock_cases = []
    
    # 8 cases per category = 40 total cases
    case_id = 1
    for cat in categories:
        saturated = cat_saturated_claims[cat]
        for i in range(8):
            reason = reasons[case_id % len(reasons)]
            
            # Make sure failure cases heavily feature the saturated claims
            num_claims = random.randint(1, 3)
            # Pick at least 1 saturated claim, maybe some others
            claims = [random.choice(saturated)]
            while len(claims) < num_claims:
                c = random.choice(base_claims)
                if c not in claims:
                    claims.append(c)
            
            mock_cases.append(
                FailureCase(
                    product_name=f"MockBrand {cat.replace('_', ' ').title()} V{case_id}",
                    category_code=cat,
                    positioning_used=f"Targeted at active users looking for {claims[0].replace('_', ' ')} with a focus on value.",
                    claim_codes_used=claims,
                    failure_reason_type=reason,
                    failure_summary=f"The product failed due to {reason.replace('_', ' ')}. Consumers didn't resonate with the claims vs actual delivery.",
                    lesson_learned=f"Ensure {reason.replace('_', ' ')} is addressed in product development and marketing alignment."
                )
            )
            case_id += 1
        
    db.add_all(mock_cases)
    db.commit()
    print("Seeded 40 mock FailureCase entries.")
