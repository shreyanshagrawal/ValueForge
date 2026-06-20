def compute_intent_adjusted_score(persona, claim_code: str) -> dict:
    """
    Computes the Persona Intent Engine score based on psychographic reasoning.
    """
    responds_to = persona.responds_to_claims or []
    avoids = persona.avoids_claims or []
    
    if claim_code in responds_to:
        intent_score = 85.0 # Base 75 + 10 boost
        reasoning = f"Strong signal — '{claim_code}' aligns with {persona.display_name}'s '{persona.psychographic_driver}' driver."
    elif claim_code in avoids:
        intent_score = 15.0 # Base 25 - 10 penalty
        reasoning = f"Negative signal — '{claim_code}' conflicts with {persona.display_name}'s preferences."
    else:
        intent_score = 50.0
        reasoning = f"No strong signal — claim is neutral for {persona.display_name}'s psychographic driver."
        
    return {
        "intent_score": intent_score,
        "reasoning": reasoning
    }
