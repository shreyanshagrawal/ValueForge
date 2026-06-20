import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from db import SessionLocal
from schemas.scan_schemas import ScanCreateRequest
from routers.scans import create_scan, generate_brief

def test_brief2():
    db = SessionLocal()
    # 1. Create another scan
    req = ScanCreateRequest(
        product_name="Energy Boost V2",
        category_code="energy_drinks",
        persona_code="budget_parent",
        primary_benefit_idea="A cheap energy drink for busy parents",
        key_ingredient="caffeine",
        target_price_tier="mass"
    )
    scan = create_scan(req, db)
    print(f"Created scan 2: {scan.id}")
    
    # 2. Generate brief
    res = generate_brief(scan.id, db)
    print(f"Brief generation result 2: {res}")
    
    db.close()

if __name__ == "__main__":
    test_brief2()
