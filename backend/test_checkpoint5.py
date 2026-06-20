import requests

def run_checkpoint():
    print("--- CHECKPOINT 5 TEST: Semantic Failure Matching ---")
    
    # 1. Simulate Input Form Submission
    payload = {
        "product_name": "Zenith Energy Mix", 
        "category_code": "energy_drinks", 
        "persona_code": "fitness_millennial", 
        "primary_benefit_idea": "An energy drink that boosts confidence and provides calm energy", 
        "target_price_tier": "mass"
    }
    
    print(f"Submitting scan via POST /api/v1/scans: {payload['product_name']}...")
    res1 = requests.post("http://localhost:8000/api/v1/scans", json=payload)
    scan = res1.json()
    
    if "id" in scan:
        print(f"Scan created successfully! ID: {scan['id']}")
        print(f"Extracted Claim Signals: {scan.get('extracted_claim_signals')}")
        
        # 2. Fetch Failure Risks
        print(f"\nFetching failure risks via GET /api/v1/scans/{scan['id']}/failure-risks...")
        risks = requests.get(f"http://localhost:8000/api/v1/scans/{scan['id']}/failure-risks").json()
        
        print(f"Found {len(risks)} ranked failure risks.")
        for idx, risk in enumerate(risks):
            f = risk["failure_case"]
            print(f"\n[{idx+1}] Match: {risk['similarity_score']}% | Rank: {risk['rank']}")
            print(f"    Product: {f['product_name']}")
            print(f"    Reason: {f['failure_reason_type']}")
            print(f"    Lesson: {f['lesson_learned']}")
            print(f"    Positioning: {f['positioning_used']}")
            
        print("\nCheckpoint 5 Backend verification complete!")

if __name__ == "__main__":
    run_checkpoint()
