# Simplified format mappings for FR-13 Section D

# Map (persona_code, price_tier) -> dict
FORMAT_MAPPINGS = {
    # Fitness Millennial
    ("fitness_millennial", "mass"): {
        "recommended_format": "bulk_powder_tub",
        "packaging_direction": "Bright, bold typography. Large tub emphasizing high serving count and value.",
        "rationale": "Appeals to heavy users who prioritize cost-per-serving over premium aesthetics."
    },
    ("fitness_millennial", "mid"): {
        "recommended_format": "resealable_pouch",
        "packaging_direction": "Matte black finish with metallic accents. Clear callouts of macros.",
        "rationale": "Balances perceived quality with practicality; pouches signal modern, no-nonsense nutrition."
    },
    ("fitness_millennial", "premium"): {
        "recommended_format": "single_serve_stick_pack",
        "packaging_direction": "Sleek, minimalist carton. Soft-touch matte finish with embossed logo.",
        "rationale": "High convenience factor for gym bags, with packaging that feels like a premium lifestyle accessory."
    },
    ("fitness_millennial", "ultra-premium"): {
        "recommended_format": "ready_to_drink_aluminum_bottle",
        "packaging_direction": "Brushed aluminum bottle with minimal, screen-printed text. Extremely clean.",
        "rationale": "Maximum convenience and ultimate premium signaling. Appeals to status-conscious achievers."
    },
    
    # Busy Parent
    ("busy_parent", "mass"): {
        "recommended_format": "value_size_gummies",
        "packaging_direction": "Friendly, approachable jar with clear 'family size' value callouts and bright colors.",
        "rationale": "Prioritizes high quantity, approachability, and ease of consumption for the whole family."
    },
    ("busy_parent", "mid"): {
        "recommended_format": "gummies_or_chews",
        "packaging_direction": "Clean, soft pastel colors. Transparent window to see the product. Focus on 'no artificial colors'.",
        "rationale": "Signals safety and quality while remaining highly convenient."
    },
    ("busy_parent", "premium"): {
        "recommended_format": "liquid_drops_or_spray",
        "packaging_direction": "Amber glass bottle with high-quality dropper. Minimalist, clinical-but-friendly label.",
        "rationale": "Feels potent, pure, and highly effective—justifying a higher price point for peace of mind."
    },
    ("busy_parent", "ultra-premium"): {
        "recommended_format": "daily_personalized_sachets",
        "packaging_direction": "Premium dispenser box. Each daily sachet is elegantly branded.",
        "rationale": "Removes all cognitive load. The ultimate luxury is having everything pre-portioned."
    },

    # Wellness Boomer
    ("wellness_boomer", "mass"): {
        "recommended_format": "large_tablet_bottle",
        "packaging_direction": "Traditional supplement bottle. Very large, high-contrast font for readability.",
        "rationale": "Familiar format that feels like a standard, reliable daily routine."
    },
    ("wellness_boomer", "mid"): {
        "recommended_format": "easy_swallow_capsules",
        "packaging_direction": "Clean white bottle with silver accents. Emphasis on 'gentle on stomach' and 'easy to swallow'.",
        "rationale": "Addresses physical friction points of supplement taking while looking reputable."
    },
    ("wellness_boomer", "premium"): {
        "recommended_format": "effervescent_tablets",
        "packaging_direction": "Sleek aluminum tube. Botanical illustrations signaling natural ingredients.",
        "rationale": "Transforms taking supplements into a pleasant, hydrating ritual."
    },
    ("wellness_boomer", "ultra-premium"): {
        "recommended_format": "liquid_elixir_shots",
        "packaging_direction": "Heavy glass vials arranged in a presentation box. Gold foil details.",
        "rationale": "Feels like a potent, high-end tonic. Signals maximum bioavailability."
    },

    # Gen Z
    ("gen_z_lifestyle", "mass"): {
        "recommended_format": "canned_sparkling_drink",
        "packaging_direction": "Vibrant, abstract, 'Y2K' inspired graphics. Highly photogenic.",
        "rationale": "Accessible, immediately shareable on social media, and fits a casual lifestyle."
    },
    ("gen_z_lifestyle", "mid"): {
        "recommended_format": "functional_candy_bites",
        "packaging_direction": "Holographic pouch. Playful, irreverent tone of voice on the back.",
        "rationale": "Blurs the line between snacking and supplements. Highly aesthetic."
    },
    ("gen_z_lifestyle", "premium"): {
        "recommended_format": "sublingual_strips",
        "packaging_direction": "Ultra-thin, pocket-sized metal tin. Extremely minimalist design.",
        "rationale": "Novel delivery mechanism with a high 'cool factor' that feels futuristic."
    },
    ("gen_z_lifestyle", "ultra-premium"): {
        "recommended_format": "aesthetic_glass_bottle_powder",
        "packaging_direction": "Frosted glass jar with a bamboo or brushed metal lid. Looks like high-end skincare.",
        "rationale": "Designed to sit permanently on a kitchen counter for 'get ready with me' videos."
    }
}

def get_format_recommendation(persona_code: str, price_tier: str) -> dict:
    key = (persona_code, price_tier)
    if key in FORMAT_MAPPINGS:
        return FORMAT_MAPPINGS[key]
        
    # Fallback
    return {
        "recommended_format": "premium_capsules",
        "packaging_direction": "Clean, minimalist bottle with a focus on ingredient transparency.",
        "rationale": "A versatile, universally accepted format that balances convenience and perceived efficacy."
    }
