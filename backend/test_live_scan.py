import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from db import SessionLocal
from schemas.scan_schemas import ScanCreateRequest
from routers.scans import create_scan

def test_live_scan():
    db = SessionLocal()
    req = ScanCreateRequest(
        product_name="Live Data Protein Bar",
        category_code="protein_bars",
        persona_code="fitness_millennial",
        primary_benefit_idea="A high protein bar for athletes using real web data",
        key_ingredient="whey",
        target_price_tier="premium",
        use_live_data=True
    )
    
    print("Submitting live scan request...")
    scan = create_scan(req, db)
    print(f"Created scan ID: {scan.id}")
    print(f"Data source: {scan.data_source}")
    print(f"Status: {scan.status}")
    
    db.close()

if __name__ == "__main__":
    test_live_scan()
