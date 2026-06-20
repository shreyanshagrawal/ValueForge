import requests
import json

def run_checkpoint():
    print("--- CHECKPOINT 6 TEST: Whitespace Grid ---")
    
    # 1. Simulate Input Form Submission
    payload = {
        "product_name": "VitaBoost Focus", 
        "category_code": "energy_drinks", 
        "persona_code": "fitness_millennial", 
        "primary_benefit_idea": "A natural, science-backed pre-workout with no sugar", 
        "target_price_tier": "premium"
    }
    
    print(f"Submitting scan via POST /api/v1/scans: {payload['product_name']}...")
    res1 = requests.post("http://localhost:8000/api/v1/scans", json=payload)
    scan = res1.json()
    
    if "id" in scan:
        print(f"Scan created successfully! ID: {scan['id']}")
        print(f"Extracted Claim Signals: {scan.get('extracted_claim_signals')}")
        
        # 2. Fetch Whitespace Grid
        print(f"\nFetching whitespace grid via GET /api/v1/scans/{scan['id']}/whitespace...")
        grid_data = requests.get(f"http://localhost:8000/api/v1/scans/{scan['id']}/whitespace").json()
        
        if "grid" in grid_data:
            grid = grid_data["grid"]
            print(f"Retrieved grid with {len(grid)} cells.")
            
            populated_cells = [cell for cell in grid if len(cell["claims"]) > 0]
            print(f"Populated Cells: {len(populated_cells)}")
            
            for cell in populated_cells:
                print(f"\n[{cell['need_category']} | {cell['coverage_bucket']}] - {len(cell['claims'])} claims:")
                for claim in cell['claims']:
                    print(f"   -> {claim['claim_code']} (Class: {claim['whitespace_classification']}, FOS: {claim['fos_score']:.1f}, BPS: {claim['bps_score']:.1f})")
        else:
            print("ERROR: Invalid grid structure returned.")
            
        print("\nCheckpoint 6 Backend verification complete!")

if __name__ == "__main__":
    run_checkpoint()
