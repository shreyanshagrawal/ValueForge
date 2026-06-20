import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from db import SessionLocal, Base, engine
from main import app
from schemas.scan_schemas import ScanCreateRequest
from routers.scans import create_scan, generate_brief

def test_brief():
    db = SessionLocal()
    # 1. Create a scan
    req = ScanCreateRequest(
        product_name="Test Product",
        category_code="protein_bars",
        persona_code="fitness_millennial",
        primary_benefit_idea="A high protein bar for recovery after workout",
        key_ingredient="whey",
        target_price_tier="premium"
    )
    scan = create_scan(req, db)
    print(f"Created scan: {scan.id}")
    
    # 2. Generate brief
    res = generate_brief(scan.id, db)
    print(f"Brief generation result: {res}")
    
    db.close()

if __name__ == "__main__":
    test_brief()
