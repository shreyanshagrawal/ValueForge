import pytest
from fastapi.testclient import TestClient
from main import app
import time

client = TestClient(app)

def test_full_pipeline():
    # 1. Submit a scan via the API
    payload = {
        "product_name": "Test Integration Scan",
        "category_code": "protein_bars",
        "persona_code": "fitness_millennial",
        "primary_benefit_idea": "A zero-sugar drink for pure energy and focus.",
        "key_ingredient": "Caffeine",
        "target_price_tier": "premium",
        "use_live_data": False
    }
    
    response = client.post("/api/v1/scans", json=payload)
    assert response.status_code == 200
    scan_id = response.json()["id"]
    
    # 2. Poll the status endpoint until complete
    max_retries = 20
    status = "pending"
    for _ in range(max_retries):
        status_res = client.get(f"/api/v1/scans/{scan_id}")
        assert status_res.status_code == 200
        status = status_res.json()["status"]
        if status in ["complete", "failed"]:
            break
        time.sleep(1)
        
    assert status == "complete", f"Scan did not complete successfully. Status: {status}"
    
    # 3. Check claims scoring
    claims_res = client.get(f"/api/v1/scans/{scan_id}/claims")
    assert claims_res.status_code == 200
    claims = claims_res.json()
    assert len(claims) > 0, "No claims generated."
    
    for c in claims:
        # Check that score ranges are valid (0-100)
        assert 0 <= c["tier_cds_score"] <= 100
        assert 0 <= c["crs_score"] <= 100
        assert 0 <= c["bps_score"] <= 100
        assert 0 <= c["fos_score"] <= 100
        assert c["whitespace_classification"] in ["true_whitespace", "brand_whitespace", "consumer_whitespace", "conditional", "contested"]
        
    # 4. Check failure risks
    fails_res = client.get(f"/api/v1/scans/{scan_id}/failure-risks")
    assert fails_res.status_code == 200
    fails = fails_res.json()
    assert len(fails) == 3, "Failure-risks should return exactly 3 matches."
    
    # 5. Check value propositions
    vps_res = client.get(f"/api/v1/scans/{scan_id}/value-propositions")
    assert vps_res.status_code == 200
    vps = vps_res.json()
    assert len(vps) > 0, "No value propositions generated."
    
    for vp in vps:
        assert vp["headline"] is not None and len(vp["headline"]) > 0
        assert vp["fos_score"] is not None
        
    # 6. Check misalignments (may be empty, but should return a valid response)
    flags_res = client.get(f"/api/v1/scans/{scan_id}/misalignment-flags")
    assert flags_res.status_code == 200
    flags = flags_res.json()
    assert isinstance(flags, list)
