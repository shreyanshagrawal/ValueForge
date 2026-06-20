import os
import sys
from dotenv import load_dotenv

# Ensure we can import from services when running as a script
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from services.nlp_extractor import extract_claim_signals

def main():
    load_dotenv()
    
    all_claims = [
        "high_protein", "no_sugar", "high_fibre", "immunity_boosting", 
        "confidence", "empowerment", "calm", "community", 
        "on_the_go", "single_serve", "ready_to_mix", 
        "collagen", "ashwagandha", "turmeric", "whey_protein", "plant_protein", 
        "fitness", "wellness", "sustainable", "vegan", 
        "recovery_focused", "science_backed", "performance", 
        "trusted_brand", "fortified", "wholesome", 
        "natural", "clinically_tested", "doctor_recommended", "gut_health"
    ]

    test_sentences = [
        "A high protein recovery drink for athletes that tastes natural.",
        "A wholesome, single serve snack that boosts your immunity.",
        "We are making a no sugar vegan energy bar for your fitness journey."
    ]

    print("--- NLP Claim Extraction Tests ---")
    for sentence in test_sentences:
        print(f"\nText: \"{sentence}\"")
        result = extract_claim_signals(sentence, all_claims)
        print(f"Extracted Claims: {result}")

if __name__ == "__main__":
    main()
