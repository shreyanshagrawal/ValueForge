import time
from sqlalchemy.orm import Session
from models.models import FailureCase
from services.gemini_client import get_embedding

def generate_and_store_failure_embeddings(db_session: Session):
    cases = db_session.query(FailureCase).filter(FailureCase.embedding == None).all()
    
    if not cases:
        print("All failure cases already have embeddings.")
        return
        
    print(f"Generating embeddings for {len(cases)} failure cases...")
    
    for i, case in enumerate(cases):
        text_representation = f"{case.positioning_used} {case.failure_summary} {' '.join(case.claim_codes_used or [])}"
        
        try:
            vector = get_embedding(text_representation)
            if vector:
                case.embedding = vector
                print(f"[{i+1}/{len(cases)}] Generated embedding for {case.product_name}")
            else:
                print(f"[{i+1}/{len(cases)}] Failed to generate embedding for {case.product_name}")
        except Exception as e:
            print(f"[{i+1}/{len(cases)}] Error generating embedding for {case.product_name}: {e}")
            
        time.sleep(1.5) # respect rate limits
        
    db_session.commit()
    print("Finished generating failure embeddings.")
