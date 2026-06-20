import requests
import json

payload = {
    "product_name": "Q",
    "category_code": "unknown_cat",
    "persona_code": "unknown_persona",
    "primary_benefit_idea": "fast",
    "key_ingredient": "",
    "target_price_tier": "mass",
    "use_live_data": False
}

print("Submitting minimal payload...")
try:
    res = requests.post("http://localhost:8000/api/v1/scans", json=payload)
    print(f"Status Code: {res.status_code}")
    print(json.dumps(res.json(), indent=2))
except Exception as e:
    print(f"Exception occurred: {e}")
