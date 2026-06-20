# Simplified ingredient mappings for FR-13 Section C

# Format: (claim_code, psychographic_driver) -> dict
INGREDIENT_MAPPINGS = {
    # Energy / Fitness Millennial
    ("performance", "achievement"): {
        "hero_ingredients": ["creatine_monohydrate", "citrulline_malate"],
        "rationale": "Clinically proven to enhance muscular endurance and explosive power, perfectly aligning with the achievement-driven mindset."
    },
    ("confidence", "achievement"): {
        "hero_ingredients": ["ashwagandha_ksm66", "l_theanine"],
        "rationale": "Reduces cortisol and provides calm, focused energy to tackle high-pressure goals."
    },
    
    # Recovery / Wellness Boomer
    ("recovery_focused", "vitality"): {
        "hero_ingredients": ["collagen_peptides", "curcumin_extract"],
        "rationale": "Supports joint health and reduces inflammation, essential for maintaining an active lifestyle."
    },
    ("joint_health", "vitality"): { # fallback if claim exists
        "hero_ingredients": ["glucosamine", "msm"],
        "rationale": "Targeted support for cartilage repair and joint mobility."
    },
    
    # Immunity / Busy Parent
    ("immunity_boosting", "security"): {
        "hero_ingredients": ["elderberry_extract", "zinc_picolinate"],
        "rationale": "Provides a robust defense against common pathogens, offering peace of mind for the whole family."
    },
    ("wellness", "security"): {
        "hero_ingredients": ["vitamin_d3", "probiotic_blend"],
        "rationale": "Foundational health support covering immune function and gut health."
    },
    
    # Convenience / Gen Z
    ("on_the_go", "social_status"): {
        "hero_ingredients": ["mct_oil_powder", "natural_caffeine"],
        "rationale": "Clean, fast-acting energy that fits easily into a fast-paced, highly social lifestyle."
    },
    ("vegan", "social_status"): {
        "hero_ingredients": ["pea_protein_isolate", "chia_seeds"],
        "rationale": "Plant-based, sustainable ingredients that resonate with environmentally conscious social circles."
    }
}

def get_ingredient_recommendation(claim_code: str, psychographic_driver: str) -> dict:
    key = (claim_code, psychographic_driver)
    if key in INGREDIENT_MAPPINGS:
        return INGREDIENT_MAPPINGS[key]
        
    # Generic fallbacks based on claim semantics
    if "protein" in claim_code or "recovery" in claim_code:
        return {
            "hero_ingredients": ["premium_whey_isolate" if "vegan" not in claim_code and "plant" not in claim_code else "pea_and_rice_protein_blend", "bcaa_complex"],
            "rationale": "High-quality amino acid profile tailored to support rapid muscle repair and growth."
        }
    elif "energy" in claim_code or "performance" in claim_code or "fitness" in claim_code:
        return {
            "hero_ingredients": ["natural_caffeine_from_green_tea", "b_vitamin_complex"],
            "rationale": "Provides sustained, jitter-free energy to support peak physical and mental output."
        }
    elif "immunity" in claim_code or "health" in claim_code or "wellness" in claim_code:
        return {
            "hero_ingredients": ["liposomal_vitamin_c", "zinc"],
            "rationale": "Essential micronutrients wrapped in high-absorption delivery systems for maximum efficacy."
        }
    else:
        return {
            "hero_ingredients": ["adaptogenic_mushroom_blend", "electrolytes"],
            "rationale": "A versatile blend addressing modern stressors while supporting overall systemic balance."
        }
