import requests
import time

def run_checkpoint():
    print("--- CHECKPOINT 4 TEST: Misalignment Flags ---")
    # "high_protein" in "protein_bars" premium tier is 66.67% (red zone -> too_crowded_at_tier)
    res1 = requests.post("http://localhost:8000/api/v1/scans", json={
        "product_name": "Mega Protein Bar", 
        "category_code": "protein_bars", 
        "persona_code": "fitness_millennial", 
        "primary_benefit_idea": "A high protein bar for serious athletes", 
        "target_price_tier": "premium"
    })
    scan = res1.json()
    print("POST /scans Response:", scan)
    
    if "id" in scan:
        print(f"\nExtracted Claim Signals: {scan.get('extracted_claim_signals')}")
        
        flags = requests.get(f"http://localhost:8000/api/v1/scans/{scan['id']}/misalignment-flags").json()
        print(f"\nMisalignment Flags Found: {len(flags)}")
        for f in flags:
            print(f"  - Claim: {f['flagged_claim_code']}")
            print(f"    Reason: {f['flag_reason']}")
            print(f"    Explanation: {f['explanation']}")
            print(f"    Suggested Replacement: {f['suggested_replacement_code']}")

if __name__ == "__main__":
    run_checkpoint()
