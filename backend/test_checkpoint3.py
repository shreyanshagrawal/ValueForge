import requests

def run_checkpoint():
    print("--- SCAN 1: Protein Bars, Fitness Millennial, Premium ---")
    res1 = requests.post("http://localhost:8000/api/v1/scans", json={
        "product_name": "Test Bar", 
        "category_code": "protein_bars", 
        "persona_code": "fitness_millennial", 
        "primary_benefit_idea": "recovery", 
        "target_price_tier": "premium"
    })
    scan1 = res1.json()
    print("POST /scans Response:", scan1)
    
    if "id" in scan1:
        claims1 = requests.get(f"http://localhost:8000/api/v1/scans/{scan1['id']}/claims").json()
        print(f"Total Claims Evaluated: {len(claims1)}")
        classifications = [c["whitespace_classification"] for c in claims1]
        print(f"Classifications breakdown: { {c: classifications.count(c) for c in set(classifications)} }")
        print("Top 3 Claims:")
        for c in claims1[:3]:
            print(f"  - {c['claim_code']}: FOS={c['fos_score']} ({c['whitespace_classification']})")

    print("\n--- SCAN 2: Functional Beverages, Budget Parent, Mass ---")
    res2 = requests.post("http://localhost:8000/api/v1/scans", json={
        "product_name": "Family Bev", 
        "category_code": "functional_beverages", 
        "persona_code": "budget_parent", 
        "primary_benefit_idea": "value", 
        "target_price_tier": "mass"
    })
    scan2 = res2.json()
    print("POST /scans Response:", scan2)
    
    if "id" in scan2:
        claims2 = requests.get(f"http://localhost:8000/api/v1/scans/{scan2['id']}/claims").json()
        print(f"Total Claims Evaluated: {len(claims2)}")
        classifications2 = [c["whitespace_classification"] for c in claims2]
        print(f"Classifications breakdown: { {c: classifications2.count(c) for c in set(classifications2)} }")
        print("Top 3 Claims:")
        for c in claims2[:3]:
            print(f"  - {c['claim_code']}: FOS={c['fos_score']} ({c['whitespace_classification']})")

if __name__ == "__main__":
    run_checkpoint()
