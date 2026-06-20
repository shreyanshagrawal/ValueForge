import requests
import json
import time

payload = {
    "product_name": "NaturaSnack",
    "category_code": "snack_foods",
    "persona_code": "urban_health_seeker",
    "primary_benefit_idea": "A natural, doctor recommended snack food with high fibre and high protein for wellness.",
    "key_ingredient": "Oats",
    "target_price_tier": "premium",
    "use_live_data": False
}

print("Starting scan...")
res = requests.post("http://localhost:8000/api/v1/scans", json=payload)
print(res.status_code, res.text)
scan = res.json()
print("Scan ID:", scan["id"])

print("Getting claims...")
res_claims = requests.get(f"http://localhost:8000/api/v1/scans/{scan['id']}/claims")
print("Claims summary:")
claims = res_claims.json()
for c in claims:
    print(f"  - {c['claim_code']} -> {c['whitespace_classification']}")

print("Getting failure risks...")
res_fails = requests.get(f"http://localhost:8000/api/v1/scans/{scan['id']}/failure-risks")
fails = res_fails.json()
print("Failure matches:")
for f in fails:
    print(f"  - {f['failure_case']['product_name']} ({f['failure_case']['failure_reason_type']}) - Score: {f['similarity_score']}")

