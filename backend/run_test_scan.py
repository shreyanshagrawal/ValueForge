import requests
import time

payload = {
    "product_name": "Zenith Energy",
    "category_code": "energy_drinks",
    "persona_code": "fitness_enthusiast",
    "primary_benefit_idea": "A plant-based, no sugar energy drink optimized for sustained performance and focus.",
    "key_ingredient": "Matcha",
    "target_price_tier": "ultra_premium",
    "use_live_data": False
}

print("Starting scan...")
res = requests.post("http://localhost:8000/api/v1/scans", json=payload)
print(res.status_code, res.text)
scan = res.json()
scan_id = scan["id"]
print("Scan ID:", scan_id)

while True:
    status_res = requests.get(f"http://localhost:8000/api/v1/scans/{scan_id}")
    status = status_res.json()["status"]
    print("Status:", status)
    if status == "complete" or status.startswith("failed"):
        break
    time.sleep(1.5)

print("Scan Finished!")

print("Getting failure risks...")
res_fails = requests.get(f"http://localhost:8000/api/v1/scans/{scan_id}/failure-risks")
fails = res_fails.json()
print("Failure matches:")
for f in fails:
    print(f"  - {f['failure_case']['product_name']} ({f['failure_case']['failure_reason_type']}) - Score: {f['similarity_score']}")

