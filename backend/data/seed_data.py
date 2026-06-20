import random
from db import SessionLocal
from models.models import Persona, ProductCategory, Claim, CompetitorProduct

NEED_CATEGORY_MAP = {
    "high_protein": "Recovery",
    "no_sugar": "Convenience",  # Generic health mapped to convenience
    "high_fibre": "Recovery",
    "immunity_boosting": "Immunity",
    "confidence": "Energy",
    "empowerment": "Energy",
    "calm": "Recovery",
    "community": "Sustainability",
    "on_the_go": "Convenience",
    "single_serve": "Convenience",
    "ready_to_mix": "Convenience",
    "collagen": "Recovery",
    "ashwagandha": "Recovery",
    "turmeric": "Immunity",
    "whey_protein": "Recovery",
    "plant_protein": "Sustainability",
    "fitness": "Energy",
    "wellness": "Immunity",
    "sustainable": "Sustainability",
    "vegan": "Sustainability",
    "recovery_focused": "Recovery",
    "science_backed": "Energy",
    "performance": "Energy",
    "trusted_brand": "Sustainability",
    "fortified": "Immunity",
    "wholesome": "Recovery",
    "natural": "Taste",
    "clinically_tested": "Energy",
    "doctor_recommended": "Immunity",
    "gut_health": "Recovery"
}

def seed_database():
    db = SessionLocal()
    try:
        if db.query(Persona).first() is not None:
            return
        
        personas = [
            Persona(code="fitness_millennial", display_name="Fitness Millennial", age_range="25-35", psychographic_driver="Achievement", price_sensitivity="Low", responds_to_claims=["recovery_focused", "high_protein", "science_backed", "performance"], avoids_claims=["budget_price", "artificial", "heavy_calorie"]),
            Persona(code="budget_parent", display_name="Budget Parent", age_range="30-45", psychographic_driver="Security", price_sensitivity="Very High", responds_to_claims=["trusted_brand", "fortified", "wholesome", "value_pack", "family_size"], avoids_claims=["niche_ingredient", "trend_driven", "premium_only"]),
            Persona(code="urban_health_seeker", display_name="Urban Health Seeker", age_range="28-40", psychographic_driver="Belonging", price_sensitivity="Low-Medium", responds_to_claims=["natural", "sustainable", "gut_health", "ayurvedic", "clean_label"], avoids_claims=["mass_market", "artificial"]),
            Persona(code="senior_wellness_user", display_name="Senior Wellness User", age_range="60+", psychographic_driver="Comfort", price_sensitivity="Medium", responds_to_claims=["clinically_tested", "doctor_recommended", "easy_to_digest", "familiar"], avoids_claims=["high_stimulant", "unfamiliar_ingredient"])
        ]
        db.add_all(personas)

        categories = [
            ProductCategory(code="energy_drinks", display_name="Energy Drinks"),
            ProductCategory(code="protein_bars", display_name="Protein Bars"),
            ProductCategory(code="functional_beverages", display_name="Functional Beverages"),
            ProductCategory(code="snack_foods", display_name="Snack Foods"),
            ProductCategory(code="supplements", display_name="Supplements")
        ]
        db.add_all(categories)

        claims_data = [
            ("high_protein", "High Protein", "functional"),
            ("no_sugar", "No Sugar", "functional"),
            ("high_fibre", "High Fibre", "functional"),
            ("immunity_boosting", "Immunity Boosting", "functional"),
            ("confidence", "Confidence", "emotional"),
            ("empowerment", "Empowerment", "emotional"),
            ("calm", "Calm", "emotional"),
            ("community", "Community", "emotional"),
            ("on_the_go", "On-The-Go", "format"),
            ("single_serve", "Single Serve", "format"),
            ("ready_to_mix", "Ready to Mix", "format"),
            ("collagen", "Collagen", "ingredient"),
            ("ashwagandha", "Ashwagandha", "ingredient"),
            ("turmeric", "Turmeric", "ingredient"),
            ("whey_protein", "Whey Protein", "ingredient"),
            ("plant_protein", "Plant Protein", "ingredient"),
            ("fitness", "Fitness", "lifestyle"),
            ("wellness", "Wellness", "lifestyle"),
            ("sustainable", "Sustainable", "lifestyle"),
            ("vegan", "Vegan", "lifestyle"),
            ("recovery_focused", "Recovery Focused", "functional"),
            ("science_backed", "Science Backed", "functional"),
            ("performance", "Performance", "functional"),
            ("trusted_brand", "Trusted Brand", "emotional"),
            ("fortified", "Fortified", "functional"),
            ("wholesome", "Wholesome", "emotional"),
            ("natural", "Natural", "ingredient"),
            ("clinically_tested", "Clinically Tested", "functional"),
            ("doctor_recommended", "Doctor Recommended", "emotional"),
            ("gut_health", "Gut Health", "functional")
        ]
        claims = [Claim(claim_code=c[0], display_label=c[1], claim_type=c[2]) for c in claims_data]
        db.add_all(claims)
        
        random.seed(42)
        price_tiers = ["mass", "mid", "premium", "ultra_premium"]
        brands = ["VitaCorp", "NatureBest", "PeakFuel", "ZenFoods", "Optima", "PrimeBody", "WholeCore", "NextGen", "BioActive", "SimpleEats", "PowerCrunch", "PureJoy"]
        claim_codes = [c[0] for c in claims_data]
        category_codes = [c.code for c in categories]

        competitors = []
        for i in range(120):
            cat = random.choice(category_codes)
            tier = random.choice(price_tiers)
            brand = random.choice(brands)
            num_claims = random.randint(2, 4)
            p_claims = random.sample(claim_codes, num_claims)
            comp = CompetitorProduct(
                product_name=f"{brand} {cat.replace('_', ' ').title()} {i}",
                category_code=cat,
                price_tier=tier,
                brand_name=brand,
                claim_codes=p_claims
            )
            competitors.append(comp)
        
        db.add_all(competitors)
        db.commit()

    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
