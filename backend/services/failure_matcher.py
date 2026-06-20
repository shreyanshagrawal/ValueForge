import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from models.models import FailureCase
from services.gemini_client import get_embedding

def find_matching_failures(db_session, scan_session, top_n=3) -> list[dict]:
    # 1. Build query text
    claims_text = " ".join(scan_session.extracted_claim_signals or [])
    query_text = f"{scan_session.product_name} {scan_session.category_code} {scan_session.primary_benefit_idea} {claims_text}"
    
    # 2. Get embedding
    query_embedding = get_embedding(query_text)
    
    # 3. Fetch failure cases with embeddings
    # Prioritize same category
    all_cases = db_session.query(FailureCase).filter(FailureCase.embedding != None).all()
    same_category_cases = [c for c in all_cases if c.category_code == scan_session.category_code]
    
    candidate_cases = same_category_cases if len(same_category_cases) >= top_n else all_cases
    
    matches = []
    
    if query_embedding:
        # 4. Compute cosine similarity
        query_vec = np.array(query_embedding).reshape(1, -1)
        for case in candidate_cases:
            case_vec = np.array(case.embedding).reshape(1, -1)
            sim_score = cosine_similarity(query_vec, case_vec)[0][0]
            matches.append({
                "failure_case": case,
                "similarity_score": round(float(sim_score) * 100, 2)
            })
    else:
        # Fallback: simple keyword overlap
        scan_claims_set = set(scan_session.extracted_claim_signals or [])
        for case in candidate_cases:
            case_claims_set = set(case.claim_codes_used or [])
            overlap = scan_claims_set.intersection(case_claims_set)
            # pseudo similarity based on overlap count
            sim_score = min(100.0, len(overlap) * 20.0) 
            matches.append({
                "failure_case": case,
                "similarity_score": sim_score
            })
            
    # 5. Sort and return top_n
    matches.sort(key=lambda x: x["similarity_score"], reverse=True)
    return matches[:top_n]
