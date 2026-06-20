import requests

def run_checkpoint():
    print("--- CHECKPOINT 7 TEST: Product Recommendation Engine ---")
    
    payload = {
        "product_name": "Zenith Ultra", 
        "category_code": "energy_drinks", 
        "persona_code": "fitness_millennial", 
        "primary_benefit_idea": "A clean, natural energy boost that powers your hardest workouts", 
        "target_price_tier": "ultra-premium"
    }
    
    print(f"Submitting scan via POST /api/v1/scans: {payload['product_name']}...")
    res = requests.post("http://localhost:8000/api/v1/scans", json=payload)
    scan = res.json()
    
    if "id" in scan:
        print(f"Scan created successfully! ID: {scan['id']}")
        
        print(f"\nFetching VP cards via GET /api/v1/scans/{scan['id']}/value-propositions...")
        vps = requests.get(f"http://localhost:8000/api/v1/scans/{scan['id']}/value-propositions").json()
        
        print(f"Found {len(vps)} value proposition cards.")
        for vp in vps:
            print(f"\n[Rank {vp['rank']}] {vp['whitespace_classification'].upper()}")
            print(f"Headline: {vp['headline']}")
            print(f"Subclaims: 1. {vp['subclaim_1']} | 2. {vp['subclaim_2']}")
            print(f"Ingredients: {vp['hero_ingredients']}")
            print(f"Format: {vp['recommended_format']}")
            print(f"Price Band: ₹{vp['price_band_min']} - ₹{vp['price_band_max']}")
            print(f"Channels: {vp['channel_fit']}")
            
            # Check for nulls
            assert vp['headline'], "Headline is null or empty"
            assert len(vp['hero_ingredients']) > 0, "No ingredients"
            assert vp['price_band_min'] > 0, "Price band invalid"
            
        print("\nCheckpoint 7 Backend verification complete!")

if __name__ == "__main__":
    run_checkpoint()
