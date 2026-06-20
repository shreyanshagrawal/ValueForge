# ValueForge — 100 Antigravity Build Prompts

**Stack:** FastAPI + SQLite (backend) · React + Vite (frontend) · Google Gemini free tier (`gemini-1.5-flash` or `gemini-2.0-flash` for generation, `text-embedding-004` for embeddings) · zero paid APIs.

**Scope cut from the full PRD:** Core 3-Dimension Engine (Tier-CDS, CRS, BPS, FOS) + 4 screens (Input Form → Failure Dashboard → Whitespace Grid → Value Proposition Cards) + Brand Brief PDF export. No microservices, no Redis/Celery/S3 — single backend service, SQLite, synchronous processing (small enough dataset that async isn't needed for a hackathon demo).

**How to use this:** Paste prompts into Antigravity **one at a time, in order**. Don't skip ahead — later prompts assume earlier files exist. After every 5 prompts there's a **🔲 CHECKPOINT** — stop, run the app, verify the listed outcomes before continuing. If a checkpoint fails, tell Antigravity what's broken before moving to the next batch.

Get a free Gemini API key first at https://aistudio.google.com/app/apikey before starting Prompt 6.

---

## BATCH 1: Project Architecture & Scaffolding (Prompts 1-5)

**1.**
```
I'm building "ValueForge" — an AI-powered brand positioning intelligence tool. Here's the concept: a brand manager enters a product idea (name, category, target persona, benefit idea, price tier), and the system tells them whether their positioning claim is genuine market whitespace by scoring it on 3 dimensions: Market (is the claim crowded among competitors at this price tier?), Consumer (will people actually respond to it?), and Brand (does this brand have credibility to own this claim?).

Set up the project as a monorepo with two folders:
- /backend — Python FastAPI app
- /frontend — React app scaffolded with Vite (JavaScript, not TypeScript, to keep things simple)

Initialize backend with a virtual environment and a requirements.txt including: fastapi, uvicorn, sqlalchemy, pydantic, python-dotenv, google-generativeai, numpy, scikit-learn. Initialize frontend with Vite's React template. Create a root README.md explaining the project, the 3-dimension model, and how to run both servers locally. Do not write business logic yet — this prompt is scaffolding only.
```

**2.**
```
In /backend, create the folder structure:
- main.py (FastAPI app entrypoint)
- /models (SQLAlchemy models)
- /schemas (Pydantic request/response schemas)
- /routers (API route modules)
- /services (business logic: scoring engine, gemini client, failure matcher, product recommender)
- /data (seed data JSON files)
- /db.py (SQLAlchemy engine + session setup using SQLite, file-based at ./valueforge.db)
- .env.example with a placeholder GEMINI_API_KEY=your_key_here

Set up main.py with FastAPI app, CORS middleware allowing the Vite dev server origin (http://localhost:5173), and a health check route GET /api/health that returns {"status": "ok"}. Wire db.py to create all tables on startup if they don't exist.
```

**3.**
```
Create the SQLAlchemy models in /backend/models for a simplified schema (simplified from a larger enterprise spec — we only need what powers the working prototype):

- Persona: id, code, display_name, age_range, psychographic_driver, price_sensitivity, responds_to_claims (JSON list of claim codes), avoids_claims (JSON list)
- ProductCategory: id, code, display_name
- Claim: id, claim_code, display_label, claim_type (functional/emotional/format/ingredient/lifestyle)
- CompetitorProduct: id, product_name, category_code, price_tier (mass/mid/premium/ultra_premium), claim_codes (JSON list), brand_name
- ScanSession: id, product_name, category_code, persona_code, primary_benefit_idea, key_ingredient, target_price_tier, status, created_at
- ClaimScore: id, scan_id (FK), claim_code, tier_cds_score, cds_zone, crs_believability, crs_relevance, crs_fatigue_inverse, crs_trigger_alignment, crs_score, bps_score, fos_score, whitespace_classification
- FailureCase: id, product_name, category_code, positioning_used, claim_codes_used (JSON), failure_reason_type, failure_summary, lesson_learned, embedding (JSON list of floats, nullable)
- ValueProposition: id, scan_id (FK), rank, claim_code, headline, hero_ingredients (JSON), recommended_format, packaging_direction, price_band_min, price_band_max, channel_fit (JSON)

Use UUID strings as primary keys (generated with Python's uuid4, stored as String). Add appropriate ForeignKey relationships between ScanSession, ClaimScore, and ValueProposition.
```

**4.**
```
Create /backend/data/seed_data.py with hardcoded mock data — this is our offline dataset standing in for the live "Ai Palette API" the full enterprise version would use. Generate:

1. 4 personas: fitness_millennial (Achievement driver, low price sensitivity, responds to recovery_focused/high_protein/science_backed/performance, avoids budget_price/artificial/heavy_calorie), budget_parent (Security driver, very high price sensitivity, responds to trusted_brand/fortified/wholesome/value_pack/family_size, avoids niche_ingredient/trend_driven/premium_only), urban_health_seeker (Belonging driver, low-medium price sensitivity, responds to natural/sustainable/gut_health/ayurvedic/clean_label, avoids mass_market/artificial), senior_wellness_user (Comfort driver, medium price sensitivity, responds to clinically_tested/doctor_recommended/easy_to_digest/familiar, avoids high_stimulant/unfamiliar_ingredient)

2. 5 product categories: energy_drinks, protein_bars, functional_beverages, snack_foods, supplements

3. ~30 claims covering all 5 claim types from the taxonomy (functional: high_protein, no_sugar, high_fibre, immunity_boosting; emotional: confidence, empowerment, calm, community; format: on_the_go, single_serve, ready_to_mix; ingredient: collagen, ashwagandha, turmeric, whey_protein, plant_protein; lifestyle: fitness, wellness, sustainable, vegan; plus recovery_focused, science_backed, performance, trusted_brand, fortified, wholesome, natural, clinically_tested, doctor_recommended, gut_health)

4. 120 mock CompetitorProduct entries distributed realistically across the 5 categories and 4 price tiers, each with 2-4 randomly but plausibly assigned claim_codes and a brand_name (invent realistic-sounding FMCG brand names). Write a Python script using the `random` module with a fixed seed (42) so output is reproducible, and have it insert all this data into the SQLite DB via a function `seed_database()` callable from main.py on first run (check if Persona table is empty before seeding, so it doesn't duplicate on every restart).
```

**5.**
```
Create a /backend/routers/health.py and /backend/routers/reference.py. Reference router should expose:
- GET /api/v1/personas — returns all personas
- GET /api/v1/categories — returns all product categories
- GET /api/v1/claims — returns all claims, optionally filterable by ?claim_type=

Wire both routers into main.py. Run the backend server and confirm http://localhost:8000/api/v1/personas returns the 4 seeded personas as JSON, and http://localhost:8000/docs shows the interactive Swagger UI with these endpoints listed.
```

---

🔲 **CHECKPOINT 1 — verify before continuing:**
- [ ] `/backend` and `/frontend` folders exist with correct structure
- [ ] Running `uvicorn main:app --reload` starts without errors
- [ ] `valueforge.db` file is created and seeded automatically on first run
- [ ] `http://localhost:8000/api/v1/personas` returns 4 personas
- [ ] `http://localhost:8000/api/v1/categories` returns 5 categories
- [ ] `http://localhost:8000/docs` shows Swagger UI with health, personas, categories, claims endpoints

---

## BATCH 2: Core Scoring Engine — Tier-CDS & Market Dimension (Prompts 6-10)

**6.**
```
Create /backend/.env from .env.example and add my real Gemini API key (I'll paste it in). Create /backend/services/gemini_client.py that initializes the google-generativeai SDK using the key from .env via python-dotenv. Add two functions:
- generate_text(prompt: str, model="gemini-1.5-flash") -> str — wraps a simple text generation call with basic error handling (catch and log API errors, return a fallback string rather than crashing)
- get_embedding(text: str) -> list[float] — uses the text-embedding-004 model via genai.embed_content to return an embedding vector, with the same error-handling pattern (return None on failure)

Write a small standalone test script /backend/test_gemini.py that calls both functions with sample input and prints the results, so I can confirm the API key works before we build anything on top of it.
```

**7.**
```
Create /backend/services/scoring_engine.py. Implement the Tier-Adjusted Claim Density Score (Tier-CDS), the Market Dimension of our 3-dimension model:

TierCDS = (products_using_claim_at_target_tier / total_products_at_target_tier) × 100

Write a function `compute_tier_cds(db_session, claim_code: str, category_code: str, target_price_tier: str) -> dict` that:
1. Queries CompetitorProduct for all products in that category_code and target_price_tier
2. Counts how many have claim_code in their claim_codes JSON list
3. Computes the percentage
4. Classifies into zone: "green" if <30, "yellow" if 31-60, "red" if >60
5. Returns {"tier_cds_score": float, "cds_zone": str, "product_count_at_tier": int, "total_products_at_tier": int}

Handle the edge case where total_products_at_tier is 0 (return tier_cds_score=0, zone="green", with a note that there's insufficient data — don't divide by zero).
```

**8.**
```
Write unit tests in /backend/tests/test_scoring_engine.py for compute_tier_cds using pytest. Add pytest and pytest-asyncio (if needed) to requirements.txt. Create a test fixture that seeds a temporary in-memory SQLite DB with a small known set of competitor products (e.g. 10 products, 4 with claim "high_protein" at "premium" tier out of 6 total premium products — expected TierCDS = 66.67, zone "red"). Write at least 3 test cases: one that lands in green zone, one yellow, one red, and one edge case with zero products at that tier. Run the tests and confirm all pass.
```

**9.**
```
Create /backend/services/intent_engine.py implementing the Persona Intent Engine (3-layer psychographic reasoning, simplified from the full spec for this prototype). Write a function `compute_intent_adjusted_score(persona, claim_code: str) -> dict` that:
1. Checks if claim_code is in persona.responds_to_claims — if yes, base score = 75, plus a boost
2. Checks if claim_code is in persona.avoids_claims — if yes, base score = 25, with a penalty
3. If neither, base score = 50 (neutral)
4. Returns {"intent_score": float (0-100), "reasoning": str} where reasoning is a short human-readable explanation like "Recovery-focused aligns with Fitness Millennial's Achievement driver" or "No strong signal — claim is neutral for this persona's psychographic driver"

This intent_score will later feed into the Trigger Alignment filter of our Consumer Response Score. Write 2-3 quick pytest tests confirming responds_to_claims and avoids_claims produce correctly differentiated scores.
```

**10.**
```
Create /backend/services/brand_permission.py implementing a simplified Brand Permission Score (BPS) — the Brand Dimension. Since we don't have real brand history data, simulate it with three deterministic-but-varied sub-scores derived from inputs we DO have:

BPS = CategoryTenureScore×0.30 + ExistingClaimAlignmentScore×0.40 + ConsumerAssociationScore×0.30

Write `compute_bps(category_code: str, claim_code: str, key_ingredient: str | None) -> dict` that:
1. CategoryTenureScore: derive a pseudo-random-but-stable score 40-90 using a hash of category_code (so it's consistent across calls, not truly random) — represents "how long has this hypothetical brand been in this category"
2. ExistingClaimAlignmentScore: if key_ingredient is provided and semantically related to claim_code (use simple keyword matching for now, e.g. "collagen" relates to "recovery_focused"), score 70-90; otherwise 40-60
3. ConsumerAssociationScore: similar hash-based pseudo-stable score 35-85 based on claim_code
4. Compute weighted BPS, classify verdict: "cannot_own" if <40, "credible" if 40-69, "strong_fit" if 70-100
5. Return {"bps_score": float, "bps_verdict": str, "category_tenure_score": float, "existing_claim_alignment": float, "consumer_association_score": float}

Add a clear code comment explaining this is a simplified heuristic standing in for the full brand-equity-data version described in the PRD, since we don't have real brand history in this prototype.
```

---

🔲 **CHECKPOINT 2 — verify before continuing:**
- [ ] Gemini API key works — `test_gemini.py` successfully returns generated text AND an embedding vector
- [ ] `compute_tier_cds` correctly classifies green/yellow/red zones
- [ ] All pytest tests in `test_scoring_engine.py` pass
- [ ] `compute_intent_adjusted_score` returns different scores for responds_to_claims vs avoids_claims vs neutral
- [ ] `compute_bps` returns a 0-100 score with correct verdict thresholds

---

## BATCH 3: Consumer Response Score & Final Opportunity Score (Prompts 11-15)

**11.**
```
Extend /backend/services/scoring_engine.py with the Consumer Response Score (CRS) — the Consumer Dimension, made of 4 filters:

CRS = Believability×0.25 + Relevance×0.30 + FatigueInverse×0.25 + TriggerAlignment×0.20

Write `compute_crs(claim_code: str, category_code: str, intent_score: float, tier_cds_score: float) -> dict` that derives each filter from data we actually have (no real review-scraping in this prototype):

1. Believability (0-100): higher when tier_cds_score is moderate (a totally unclaimed claim is less believable; a wildly overused one is also less believable) — use a simple curve, e.g. peaks around tier_cds 20-40, penalize both extremes
2. Relevance (0-100): use a static lookup table mapping claim_code to a baseline relevance score (you decide reasonable values 40-90 per claim, functional/ingredient claims generally score higher relevance than vague emotional ones)
3. FatigueInverse (0-100): 100 minus a pseudo-stable hash-based "media frequency" score per claim_code (reuse the hash approach from BPS for consistency) — represents how overexposed the claim is
4. TriggerAlignment (0-100): this IS the intent_score passed in directly from the Intent Engine

Compute weighted CRS, return {"crs_score": float, "crs_believability": float, "crs_relevance": float, "crs_fatigue_inverse": float, "crs_trigger_alignment": float}. Add a code comment explaining Believability and Relevance are heuristic stand-ins for the full version's review-sentiment and trend-API data sources.
```

**12.**
```
Now implement the Final Opportunity Score (FOS) and Whitespace Classification in scoring_engine.py:

FOS = (100 - TierCDS)×0.35 + CRS×0.40 + BPS×0.25

Write `compute_fos_and_classification(tier_cds_score: float, crs_score: float, bps_score: float) -> dict` that:
1. Computes fos_score using the formula above
2. Classifies whitespace using these rules in priority order:
   - "true_whitespace": tier_cds_score < 30 AND crs_score > 60 AND bps_score > 60
   - "brand_whitespace": tier_cds_score < 30 AND bps_score < 40
   - "consumer_whitespace": tier_cds_score < 30 AND bps_score > 60 AND crs_score < 40
   - "conditional": at least two of (tier_cds_score < 50, crs_score > 50, bps_score > 40) are true
   - "contested": tier_cds_score > 60 (default/fallback if nothing else matches)
3. Returns {"fos_score": float, "whitespace_classification": str}

Write pytest tests covering at least one example landing in each of the 5 classifications, using hand-picked input values that should deterministically produce each outcome.
```

**13.**
```
Create /backend/services/orchestrator.py with a function `run_full_scan(db_session, scan_session) -> list[dict]` that ties together everything built so far into one pipeline. For a given ScanSession (which has category_code, persona_code, target_price_tier, key_ingredient):

1. Fetch the persona object
2. Get all distinct claim_codes that appear anywhere in CompetitorProduct.claim_codes for that category (these are the "candidate claims" worth evaluating)
3. For each candidate claim: compute_tier_cds, compute_intent_adjusted_score, compute_bps, compute_crs, compute_fos_and_classification — chain them together correctly (intent_score feeds into CRS, tier_cds feeds into both CRS and FOS, etc.)
4. Save each claim's full score breakdown as a ClaimScore row linked to the scan_id
5. Return the list of all computed claim scores sorted by fos_score descending

Make sure all the function signatures from previous prompts are called correctly — adjust earlier functions' parameter names now if there are mismatches, but flag clearly in your response what you changed and why.
```

**14.**
```
Create /backend/routers/scans.py with:
- POST /api/v1/scans — accepts a ScanCreateRequest (product_name, category_code, persona_code, primary_benefit_idea, key_ingredient (optional), target_price_tier), creates a ScanSession row with status="pending", immediately calls run_full_scan synchronously (no async job queue needed at this scale — just call it inline and update status to "complete" when done, or "failed" with error details if an exception occurs), and returns the scan_id plus status
- GET /api/v1/scans/{scan_id} — returns the ScanSession details and status
- GET /api/v1/scans/{scan_id}/claims — returns all ClaimScore rows for that scan, sorted by fos_score descending, including which whitespace_classification each falls into

Create the corresponding Pydantic schemas in /backend/schemas/scan_schemas.py. Wire the router into main.py. Test via Swagger UI: POST a scan for category "protein_bars", persona "fitness_millennial", target_price_tier "premium", confirm it returns complete with real-looking scores, then GET the claims and confirm you see a ranked list with varied whitespace classifications (not all claims landing in the same bucket).
```

---

🔲 **CHECKPOINT 3 — verify before continuing:**
- [ ] `compute_crs` returns all 4 sub-filter scores plus combined crs_score
- [ ] All 5 whitespace classification test cases pass
- [ ] POST `/api/v1/scans` successfully creates a scan and runs the full pipeline without errors
- [ ] GET `/api/v1/scans/{id}/claims` shows a ranked list of claims with FOS scores and at least 2-3 different whitespace classifications represented (not a monoculture — if everything lands in "contested," tell Antigravity to adjust the seed data distribution or scoring thresholds)
- [ ] Try this for at least 2 different category/persona/tier combinations to sanity-check variety

---

## BATCH 4: NLP Claim Extraction & Misalignment Flags (Prompts 15-20)

**15.**
```
Create /backend/services/nlp_extractor.py with a function `extract_claim_signals(benefit_idea_text: str, all_claims: list[str]) -> list[str]` that takes the brand manager's free-text benefit idea (e.g. "a high protein recovery drink for athletes that tastes natural") and the full list of known claim_codes, and returns which claim_codes are mentioned or strongly implied in the text.

For this prototype, implement it using Gemini: write a structured prompt asking gemini-1.5-flash to return ONLY a JSON array of matching claim_codes from the provided list, given the free text. Use the generate_text function from gemini_client.py. Parse the response defensively — strip markdown code fences if present, handle JSON parse failures by falling back to simple keyword/substring matching against claim display labels. Write a quick manual test calling this with 2-3 example sentences and print the results to confirm it's extracting sensible claims.
```

**16.**
```
Update the ScanSession model and POST /api/v1/scans endpoint: after creating the scan, call extract_claim_signals on primary_benefit_idea and store the result in a new column extracted_claim_signals (JSON list) on ScanSession. Add this column via a simple migration approach (since we're using SQLite for a prototype, just delete the old valueforge.db file and let it regenerate with the new schema — confirm this is acceptable for a hackathon prototype and note it in a code comment).
```

**17.**
```
Create /backend/services/misalignment_engine.py with `generate_misalignment_flags(extracted_claim_signals: list[str], claim_scores: list[dict]) -> list[dict]`. For each claim_code in extracted_claim_signals (these are claims the brand manager's OWN idea touches on), look up its computed score from claim_scores and flag it if ANY of:
- tier_cds_score > 60 (too crowded)
- crs_score < 40 (poor consumer response)
- bps_score < 40 (brand permission gap)

For each flag, determine flag_reason (could be multiple reasons combined, e.g. "too_crowded_at_tier+poor_consumer_response"), and find a suggested replacement: the highest-FOS claim from claim_scores that IS classified as "true_whitespace" or "conditional" and isn't already in extracted_claim_signals. Return a list of dicts: {"flagged_claim_code": str, "flag_reason": str, "tier_cds_at_flag": float, "crs_at_flag": float, "bps_at_flag": float, "suggested_replacement_code": str | None, "explanation": str (a short human-readable sentence explaining why this claim is risky)}.
```

**18.**
```
Wire generate_misalignment_flags into the orchestrator's run_full_scan pipeline — after all ClaimScores are computed, run misalignment detection on the scan's extracted_claim_signals and store results. Add a new MisalignmentFlag model (id, scan_id FK, flagged_claim_code, flag_reason, tier_cds_at_flag, crs_at_flag, bps_at_flag, suggested_replacement_code, explanation) and persist the flags to the DB. Add GET /api/v1/scans/{scan_id}/misalignment-flags returning all flags for a scan. Test it with a benefit idea that deliberately mentions a claim you know is in "contested" territory for that category/tier (check your data first) and confirm a flag is correctly generated with a sensible replacement suggestion.
```

**19.**
```
Create /backend/services/failure_cases_seed.py — generate at least 25 mock FailureCase entries (a smaller but representative version of the PRD's 500+ case library, sized appropriately for a hackathon prototype) covering all 5 categories and varied failure_reason_types (taste_mismatch, claim_not_believed, price_value_disconnect, persona_wrong, market_not_ready, brand_permission_gap). Each needs a plausible anonymized product_name, positioning_used (1-2 sentence description), claim_codes_used (JSON list from our existing claim taxonomy), failure_summary, and lesson_learned. Write these as realistic FMCG case studies — invent believable scenarios. Insert into the FailureCase table via the same seed-on-startup pattern as seed_data.py (check if table is empty first).
```

**20.**
```
Create /backend/services/failure_embeddings.py with a function `generate_and_store_failure_embeddings(db_session)` that, for every FailureCase row where embedding is null, builds a text representation (concatenate positioning_used + failure_summary + claim_codes_used joined as text) and calls get_embedding from gemini_client.py to generate and store the embedding vector as a JSON list in the embedding column. Call this once on app startup after failure case seeding (it will make ~25 API calls — add a small delay between calls if needed to respect free tier rate limits, and log progress to console). Run the app and confirm all 25 failure cases get embeddings populated (spot check a few rows in the DB).
```

---

🔲 **CHECKPOINT 4 — verify before continuing:**
- [ ] `extract_claim_signals` correctly pulls relevant claim_codes from a sample free-text benefit idea
- [ ] Scans now store `extracted_claim_signals` 
- [ ] Misalignment flags are generated and stored when a scan's idea touches a risky claim, with a sensible suggested replacement
- [ ] GET `/api/v1/scans/{id}/misalignment-flags` returns correctly
- [ ] 25 FailureCase rows exist in the DB across all 5 categories and 6 failure reason types
- [ ] All FailureCase rows have non-null embedding vectors after startup (check DB directly or add a quick debug print)

---

## BATCH 5: Failure Dashboard — Semantic Matching (Prompts 21-25)

**21.**
```
Create /backend/services/failure_matcher.py with `find_matching_failures(db_session, scan_session, top_n=3) -> list[dict]`. This implements semantic similarity search using scikit-learn's cosine_similarity (no pgvector needed at this scale — we have ~25 cases, brute-force comparison is instant):

1. Build a query text from the scan: product_name + category_code + primary_benefit_idea + extracted_claim_signals joined
2. Get its embedding via get_embedding from gemini_client.py
3. Fetch all FailureCase rows that have a non-null embedding, in the SAME category_code as the scan if possible (fall back to all categories if fewer than 3 matches in-category)
4. Compute cosine similarity between the query embedding and each failure case's embedding using sklearn.metrics.pairwise.cosine_similarity
5. Return the top_n highest-similarity cases as dicts including a similarity_score field, sorted descending

Handle the case where embedding generation fails (Gemini API error) by falling back to simple keyword overlap between extracted_claim_signals and each failure case's claim_codes_used as a similarity proxy.
```

**22.**
```
Wire find_matching_failures into the orchestrator pipeline — after a scan completes, automatically run failure matching and store results. Create a FailureMatch model (id, scan_id FK, failure_case_id FK, similarity_score, rank) to persist the top 3 matches per scan. Add GET /api/v1/scans/{scan_id}/failure-risks returning the full FailureCase details (not just IDs) joined with similarity_score for that scan's top 3 matches.
```

**23.**
```
Now begin the frontend. In /frontend, install axios and react-router-dom. Set up a basic router in App.jsx with 4 routes matching our prioritized screens: "/" (Input Form), "/scan/:scanId/failures" (Failure Dashboard), "/scan/:scanId/grid" (Whitespace Grid), "/scan/:scanId/propositions" (Value Proposition Cards). Create a shared /frontend/src/api/client.js with an axios instance pointed at http://localhost:8000/api/v1, and create placeholder page components for all 4 routes that just render their name for now, so routing can be verified end-to-end before building real UI.
```

**24.**
```
Read the frontend-design skill before doing this. Build out the real Input Form page (the "/" route) as the FR-09 Idea Input Form: fields for Product Name (text), Category (dropdown populated from GET /api/v1/categories), Target Persona (dropdown from GET /api/v1/personas, showing display_name), Primary Benefit Idea (textarea, with helper text "Describe your product idea in a sentence or two — we'll extract the claims"), Key Ingredient (optional text input), Target Price Tier (dropdown: Mass / Mid / Premium / Ultra-Premium). On submit, POST to /api/v1/scans, show a loading state while the scan runs (it's synchronous so this may take a few seconds due to Gemini calls — show a spinner with a message like "Analyzing competitive landscape..."), and on success navigate to /scan/{scanId}/failures. Apply thoughtful visual design — this is a B2B SaaS positioning tool, so aim for a clean, confident, data-product aesthetic (not generic Bootstrap-looking forms).
```

**25.**
```
Build the Failure Dashboard page (the "/scan/:scanId/failures" route) implementing FR-10's design principle: "show where you will crash before showing where to go." On mount, fetch GET /api/v1/scans/{scanId}/failure-risks and display the top 3 matched historical failure cases as full-width cards, each showing: product_name, the matched positioning_used, failure_reason_type as a tag, failure_summary, lesson_learned, and the similarity_score as a small "X% pattern match" indicator. Require the user to click an explicit "I understand the risks — show me my opportunities" button before a "Continue to Whitespace Map" button becomes enabled, matching the PRD's requirement that users must acknowledge failure risk before seeing recommendations. Style failure cards with a serious, cautionary visual tone (not alarmist, but clearly distinct from the positive framing of later screens).
```

---

🔲 **CHECKPOINT 5 — verify before continuing:**
- [ ] `find_matching_failures` returns 3 ranked failure cases with similarity scores for a test scan
- [ ] GET `/api/v1/scans/{id}/failure-risks` returns full case details, not just IDs
- [ ] Frontend routing works — all 4 placeholder pages are reachable
- [ ] Input Form successfully submits and creates a real scan, navigating to the Failure Dashboard
- [ ] Failure Dashboard displays 3 real failure cases fetched from the backend, with the acknowledgment gate working before "Continue" unlocks

---

## BATCH 6: Whitespace Grid Visualization (Prompts 26-30)

**26.**
```
Create /backend/routers/whitespace.py with GET /api/v1/scans/{scan_id}/whitespace returning data shaped for FR-12's grid: group all ClaimScore rows for the scan by a "need_category" (map each claim_code to one of: Energy, Recovery, Immunity, Taste, Convenience, Sustainability — you decide reasonable mappings based on claim semantics, e.g. high_protein/recovery_focused→Recovery, immunity_boosting→Immunity, natural/sustainable→Sustainability, on_the_go/single_serve→Convenience, confidence/empowerment→Energy as a loose fit, etc., and put leftover/ambiguous claims into whichever category fits best) and by market coverage bucket (Underserved if tier_cds<30, Moderate if 30-60, Saturated if >60). Return a structure like {"grid": [{"need_category": str, "coverage_bucket": str, "claims": [{"claim_code", "fos_score", "bps_score", "whitespace_classification"}]}]} so the frontend can render cells.
```

**27.**
```
Add a claim-to-need-category mapping table to seed_data.py (a simple dict, e.g. NEED_CATEGORY_MAP = {"high_protein": "Recovery", ...}) covering all ~30 seeded claims explicitly rather than leaving it to runtime guessing — move the logic from the whitespace router into this static lookup so it's consistent and testable. Update the whitespace router to import and use this mapping. Write a quick pytest confirming every claim_code in the seed data has a mapping (no claim should silently fall through to a default/unmapped state).
```

**28.**
```
Build the Whitespace Grid page (the "/scan/:scanId/grid" route) implementing FR-12: a 6-row (need categories) × 3-column (Underserved/Moderate/Saturated) grid. Fetch GET /api/v1/scans/{scanId}/whitespace and render each cell colored by the dominant whitespace_classification of claims in that cell (green=true_whitespace, yellow=conditional, orange=brand_whitespace, red=contested, gray=consumer_whitespace or empty), with cell opacity reflecting average bps_score in that cell (higher BPS = more opaque, per the PRD's "3D information on a 2D grid" design). Clicking a cell should expand/show the specific claims inside it with their FOS scores. Add a legend explaining the color/opacity encoding. Use the visualize or a custom SVG/CSS grid — your judgment on implementation, but it must be genuinely interactive (clickable cells), not a static image.
```

**29.**
```
Add a "Continue to Value Propositions" button at the bottom of the Whitespace Grid page that navigates to /scan/:scanId/propositions. Also add simple breadcrumb/stepper navigation visible across all 3 result screens (Failures → Whitespace Grid → Value Propositions) so the user always knows where they are in the flow and can navigate back. Implement this as a shared component used by all three result pages.
```

**30.**
```
Go back and test the full pipeline end-to-end manually: submit a new scan via the Input Form for a different persona/category/tier combo than you've tested before, walk through Failure Dashboard, confirm the acknowledgment gate, proceed to the Whitespace Grid, and confirm cells render with sensible color variety (not all one color) and clicking cells reveals claim details. Fix any bugs found in this walkthrough before proceeding — report what you found and fixed.
```

---

🔲 **CHECKPOINT 6 — verify before continuing:**
- [ ] GET `/api/v1/scans/{id}/whitespace` returns a populated grid structure
- [ ] Every seeded claim has a need_category mapping (pytest confirms this)
- [ ] Whitespace Grid page renders a 6×3 grid with varied cell colors and visible opacity differences
- [ ] Clicking a grid cell expands to show individual claim details
- [ ] Full flow Input Form → Failure Dashboard → Whitespace Grid works without errors on a fresh scan
- [ ] Stepper/breadcrumb navigation is visible and functional across all result screens

---

## BATCH 7: Product Recommendation Engine (Prompts 31-35)

**31.**
```
Create /backend/data/ingredient_mappings.py implementing a simplified version of FR-13's Section C (ingredient recommendations) and the TRD's ingredient_claim_mappings table. Build a static lookup dict mapping (claim_code, psychographic_driver) tuples to {"hero_ingredients": [list of 1-2 ingredients], "rationale": str}. Cover combinations for all 4 personas' driver types crossed with the claims most relevant to each (you don't need every possible combination — focus on realistic, sensible pairings, e.g. (recovery_focused, achievement) → collagen_peptides + electrolyte_blend with rationale about performance recovery). Include a sensible fallback for combinations not explicitly mapped (generic ingredient suggestion based on claim_type).
```

**32.**
```
Create /backend/data/format_mappings.py implementing FR-13's Section D (format & packaging). Build a static lookup mapping (persona_code, price_tier) to {"recommended_format": str, "packaging_direction": str, "rationale": str} — e.g. (fitness_millennial, premium) → single_serve_stick_pack with packaging_direction describing matte finish, minimalist label. Cover all 4 personas × all 4 price tiers (16 combinations) with distinct, plausible format/packaging recommendations appropriate to each persona's psychographic driver and price positioning.
```

**33.**
```
Create /backend/services/price_architecture.py with `recommend_price_band(db_session, category_code: str, target_price_tier: str, claim_code: str) -> dict`. Using the actual seeded CompetitorProduct data: define rough price-per-serve ranges for each tier (Mass <₹60, Mid ₹60-120, Premium ₹120-180, Ultra-Premium ₹180+ — these are illustrative since we don't have real per-product prices, so generate a plausible price for each mock competitor product if one doesn't exist yet, deterministically based on its tier using a hash so it's consistent). Return a recommended {"price_band_min": float, "price_band_max": float, "rationale": str} positioned within the target tier's range, narrowed based on how crowded the tier is (if very crowded, recommend price at the upper end to signal premium differentiation; if open, recommend mid-range of the tier).
```

**34.**
```
Create /backend/services/vp_generator.py implementing FR-13's full Value Proposition Card generation. Write `generate_value_propositions(db_session, scan_session, claim_scores: list[dict], top_n=3) -> list[dict]`:

1. Take the top_n claims by fos_score that are classified as "true_whitespace" or "conditional" (prioritize true_whitespace first; if fewer than top_n true_whitespace claims exist, fill remaining slots with best-scoring conditional claims)
2. For each, look up ingredient recommendation (ingredient_mappings.py), format recommendation (format_mappings.py), price band (price_architecture.py)
3. Generate an AI headline using Gemini: prompt it with the claim, persona's psychographic driver, and whitespace classification, asking for a short punchy positioning headline (under 12 words) plus 2 supporting sub-claims, returned as structured JSON
4. Determine channel_fit: a simple static mapping from persona_code to top 2 marketing channels (e.g. fitness_millennial → Instagram, fitness influencer partnerships)
5. Assemble and return the full VP dict matching all 7 PRD sections (A through G): headline+subclaims, score breakdown, ingredients, format/packaging, price band, first_mover_window (just return a plausible static estimate like "6-9 months" for now since real trend velocity data isn't available), channel_fit

Persist these to the ValueProposition table linked to scan_id with correct rank ordering.
```

**35.**
```
Wire generate_value_propositions into the orchestrator pipeline so it runs automatically as the final step of run_full_scan. Add GET /api/v1/scans/{scan_id}/value-propositions returning all VP cards for a scan, fully populated. Test via Swagger UI on an existing scan and confirm you get back 3 VP cards each with a real Gemini-generated headline, ingredient recommendations, format/packaging direction, and a price band — not placeholder/null values anywhere.
```

---

🔲 **CHECKPOINT 7 — verify before continuing:**
- [ ] Ingredient and format mapping lookups return sensible, non-generic recommendations
- [ ] Price architecture returns a price band within the correct tier range
- [ ] `generate_value_propositions` produces 3 full VP dicts with all 7 sections populated
- [ ] AI-generated headlines are real Gemini output (not fallback text) — spot check 2-3 different scans
- [ ] GET `/api/v1/scans/{id}/value-propositions` returns complete data with no nulls in critical fields

---

## BATCH 8: Value Proposition Cards UI (Prompts 36-40)

**36.**
```
Read the frontend-design skill again before this prompt. Build the Value Proposition Cards page (the "/scan/:scanId/propositions" route) implementing FR-13's full card layout. Fetch GET /api/v1/scans/{scanId}/value-propositions and render 3 cards (or fewer if fewer were generated) side-by-side on desktop, stacking on mobile. Each card needs all 7 sections clearly delineated:
- A: Headline (large, prominent) + sub-claims (smaller, supporting)
- B: Score badges — FOS as a prominent number/badge, small visual bars for the 4 CRS sub-filters, BPS indicator, Tier-CDS zone color chip
- C: Hero ingredients with rationale
- D: Format & packaging direction
- E: Price band (formatted as a ₹ range)
- F: First mover window estimate
- G: Channel fit tags

Rank-order the cards 1/2/3 with a visible rank badge. Give the highest-ranked card subtle visual emphasis (e.g. slightly larger, accent border) without making lower-ranked cards feel diminished.
```

**37.**
```
Add a misalignment flags section to the Value Proposition Cards page — fetch GET /api/v1/scans/{scanId}/misalignment-flags and display them as a collapsible "Claims to Avoid" panel above or beside the VP cards, implementing FR-14. Each flag should show the flagged claim, which dimension(s) failed (crowding/consumer response/brand permission) with a clear icon or tag per failure type, the explanation text, and the suggested replacement claim (which should ideally already appear as one of the VP cards above — consider linking/highlighting that connection visually).
```

**38.**
```
Add a "Download Brand Brief" button to the top of the Value Proposition Cards page (we'll wire the actual export in a later batch — for now just add the button as a UI placeholder with an onClick that does nothing yet, or shows a "coming soon" toast, so we can verify the page layout is complete before building backend export logic).
```

**39.**
```
Polish the full end-to-end visual consistency across all 4 pages (Input Form, Failure Dashboard, Whitespace Grid, VP Cards). Establish a consistent design system: define a shared color palette (suggest something like a deep navy/teal primary with the whitespace classification colors — green/yellow/orange/red/gray — used consistently everywhere they appear), consistent typography scale, consistent spacing/card styling, and a shared Header component showing "ValueForge" branding plus the stepper navigation. Extract repeated styles into a shared CSS file or Tailwind config (your choice of styling approach, but be consistent — don't mix raw inline styles with a CSS framework inconsistently across pages).
```

**40.**
```
Do a full manual QA pass: submit 3 different scans (vary persona, category, and price tier each time) and walk each one through all 4 screens. Note any layout breaks, console errors, slow/hanging requests, or visually broken states (especially check what happens with edge cases — a scan where very few claims qualify as true_whitespace, or where misalignment flags list is empty). Fix all issues found and report a summary of what was broken and how you fixed it.
```

---

🔲 **CHECKPOINT 8 — verify before continuing:**
- [ ] VP Cards page renders all 7 sections per card for 3 different test scans
- [ ] Misalignment flags panel displays correctly, including the empty-state (no flags) case
- [ ] Visual design is consistent across all 4 pages — same color meanings, same typography, same header/nav
- [ ] No console errors during a full click-through of the entire flow
- [ ] Edge cases (few/no true_whitespace claims, empty flags) don't break the UI

---

## BATCH 9: Brand Brief PDF Export (Prompts 41-45)

**41.**
```
Add weasyprint and jinja2 to /backend/requirements.txt. Note: WeasyPrint requires some system-level dependencies (Pango, cairo) — if installation fails in this environment, fall back to using a pure-Python alternative like xhtml2pdf or reportlab instead, and tell me which one you ended up using and why. Create /backend/templates/brand_brief.html as a Jinja2 template implementing FR-16's brief structure with sections for: 1. Product Overview, 2. Failure Simulation Results, 3. Top 3 Value Propositions with full product design directions, 4. Claims to Avoid with Reasons, 5. Trend Window summary, 6. Competitive Landscape Summary (basic stats: how many competitors scanned, tier distribution), 7. Risk Flags. Style it as a clean printable document (not a webpage) — appropriate fonts, page-friendly spacing, a cover section with the product name and date.
```

**42.**
```
Create /backend/services/brief_generator.py with `generate_brief_pdf(db_session, scan_id: str) -> str` (returns a file path) that gathers all the data needed for the template (scan details, claim scores, failure matches, value propositions, misalignment flags, basic competitor stats for that category/tier) renders the Jinja2 template with this data, converts to PDF, and saves it to /backend/generated_briefs/{scan_id}.pdf (create this folder, add it to .gitignore). Add POST /api/v1/scans/{scan_id}/brief that triggers generation and returns {"status": "ready", "download_url": "/api/v1/scans/{scan_id}/brief/download"}, and GET /api/v1/scans/{scan_id}/brief/download that serves the generated PDF file as a FileResponse with appropriate filename.
```

**43.**
```
Test brief generation directly via Swagger UI on an existing completed scan: POST to generate, then GET to download, and open the resulting PDF to confirm all 7 sections render with real data (not placeholder text) and the layout doesn't have obvious overflow/rendering bugs. Fix any template issues found.
```

**44.**
```
Wire the frontend's "Download Brand Brief" button (placeholder from Prompt 38) to actually work: on click, POST to /api/v1/scans/{scanId}/brief, show a brief loading state, then trigger a download of the PDF (either by navigating to the download URL or using a blob download approach) once ready. Handle and surface errors gracefully (e.g. a toast notification if generation fails) rather than failing silently.
```

**45.**
```
Do a final full-flow test: fresh scan from the Input Form all the way through to downloading a real PDF brand brief, for 2 different scan configurations. Confirm both PDFs open correctly and contain accurate, scan-specific data (not data leaked from a previous scan, not duplicated/cached content). Fix any state-leakage bugs found.
```

---

🔲 **CHECKPOINT 9 — verify before continuing:**
- [ ] PDF generation works (note which library ended up being used if WeasyPrint had install issues)
- [ ] Generated PDF contains all 7 sections with real, scan-specific data
- [ ] Frontend "Download Brand Brief" button successfully triggers a real download
- [ ] Two different scans produce two genuinely different PDFs (no data bleed between scans)

---

## BATCH 10: Demo-Flex Live Scrape Feature (Prompts 46-50)

**46.**
```
Now let's add the optional "demo flex" feature: a live web-data path for ONE category, as an alternative to the seed dataset, to show the system can work with real-world signal. Add requests and beautifulsoup4 to requirements.txt. Create /backend/services/live_scan.py with a function `fetch_live_competitor_claims(category_code: str) -> list[dict]` that performs a simple, respectful web search (use a basic approach like fetching a small number of public product listing pages or search result snippets — NOT aggressive scraping of e-commerce sites which may violate terms of service) for real products in the "protein_bars" category specifically, and extracts plausible claim keywords from product titles/descriptions using basic keyword matching against our existing claim taxonomy.

Be conservative here: this should be a clearly-labeled "experimental/demo" feature, request at most 10-15 real product listings, include reasonable delays between requests, and have a robust fallback to the seed dataset if the live fetch fails or returns too little data. Add a code comment flagging that for a real production version this would be replaced by a proper licensed data API, not scraping.
```

**47.**
```
Add a `use_live_data: bool = False` field to the ScanCreateRequest schema. When true AND category_code == "protein_bars", the orchestrator's run_full_scan should call fetch_live_competitor_claims and temporarily supplement/use that data instead of (or blended with) the seeded CompetitorProduct rows for Tier-CDS computation specifically for this scan — without permanently modifying the seed dataset in the DB. Implement this as a parameter passed through the scoring functions rather than a DB write, so it's scan-scoped. Add a `data_source: str` field to ScanSession ("seed" or "live") so the frontend can show which mode was used.
```

**48.**
```
Add a toggle/checkbox on the Input Form: "Use live market data (protein bars only, experimental)" — disabled/grayed out unless category is set to protein_bars, with a small tooltip or helper text explaining it fetches real current listings instead of the demo dataset. Wire it to the use_live_data field in the scan creation request.
```

**49.**
```
Add a visible badge on the Failure Dashboard, Whitespace Grid, and VP Cards pages showing "Demo Dataset" or "Live Market Data" depending on scan.data_source, so it's always clear to a viewer (e.g. hackathon judges) which mode produced the results they're looking at.
```

**50.**
```
Test the live data path end-to-end: submit a scan for protein_bars with the live data toggle on, confirm it either successfully pulls real listings and shows "Live Market Data," or gracefully falls back to seed data with a console log explaining why (e.g. network error, insufficient results) while still completing the scan successfully rather than crashing.
```

---

🔲 **CHECKPOINT 10 — verify before continuing:**
- [ ] Live data fetch works for protein_bars OR fails gracefully with a clean fallback (no crash either way)
- [ ] `data_source` is correctly recorded per scan
- [ ] Frontend toggle correctly enables only for protein_bars
- [ ] Data source badge displays correctly across all result screens
- [ ] A full scan using live data still produces valid scores and a valid VP card output

---

## BATCH 11: Authentic Claim Territory View (Bonus Differentiator) (Prompts 51-55)

**51.**
```
Implement FR-15's Authentic Claim Territory Validator as a bonus visualization, since it's the PRD's clearest articulation of the 3-dimension model's payoff. Create GET /api/v1/scans/{scan_id}/authentic-territory returning, for the top 8-10 claims by FOS, a structure suitable for a 3-axis radar/Venn visualization: {"claim_code", "tier_cds_score" (inverted to "market_openness" = 100-tier_cds for intuitive radar reading), "crs_score", "bps_score", "is_authentic_territory": bool (true only if classified as true_whitespace)}.
```

**52.**
```
Add a 5th route to the frontend: "/scan/:scanId/territory" — an "Authentic Claim Territory" page. Read the visualize:read_me tool for the "chart" module before building. Render a radar/spider chart with 3 axes (Market Openness, Consumer Response, Brand Permission) plotting each of the top claims as an overlaid shape, with claims marked is_authentic_territory=true visually emphasized (e.g. filled/highlighted) versus others shown as faint outlines. Add this as an optional 4th step in the stepper navigation, positioned between Whitespace Grid and VP Cards.
```

**53.**
```
Add a brief textual explanation panel beside the radar chart explaining the concept in plain language: "Authentic Claim Territory is where all three dimensions align — the market has room, consumers want it, and your brand can credibly claim it. Claims highlighted below are the ONLY claims your brand can both find AND win." List the claims that qualify as a simple ranked list beneath the chart for clarity (since radar charts can be visually busy with many overlapping shapes).
```

**54.**
```
Add this new page's data into the Brand Brief PDF as a new section (renumber appropriately) — a simple table version of the same data (claim, market openness, CRS, BPS, qualifies as authentic territory yes/no) since PDFs render tables more reliably than complex charts in this kind of export pipeline.
```

**55.**
```
Full QA pass on this new feature: test on 2-3 scans with different score distributions (some with multiple true_whitespace claims, at least one with zero/very few) and confirm the radar chart and explanation panel handle both cases gracefully (don't show a broken/empty chart when there are 0 qualifying claims — show a clear message instead).
```

---

🔲 **CHECKPOINT 11 — verify before continuing:**
- [ ] GET `/api/v1/scans/{id}/authentic-territory` returns correctly shaped data
- [ ] Radar chart renders and correctly distinguishes authentic-territory claims from others
- [ ] Explanation panel and ranked list display correctly
- [ ] Brand Brief PDF includes the new section
- [ ] Zero-qualifying-claims edge case is handled gracefully, not broken

---

## BATCH 12: Trend Velocity (Simplified) (Prompts 56-60)

**56.**
```
Implement a simplified version of FR-08 (Trend Velocity Engine) since we don't have real time-series trend data. Create /backend/data/trend_seed.py with a static lookup assigning each claim_code a trend_direction ("rising"/"peaking"/"declining") and a trend_velocity_score (a plausible MoM % growth number) — invent these deterministically but with realistic variety (most claims peaking, some rising, a few declining, weighted to feel authentic e.g. newer-sounding claims like "gut_health" or "ashwagandha" rising, generic ones like "wholesome" peaking, dated-feeling ones declining).
```

**57.**
```
Wire trend_direction and trend_velocity_score into the ClaimScore computation in orchestrator.py — add these as columns on ClaimScore, populate from the static lookup during run_full_scan. For claims where trend_direction is "rising" AND tier_cds_score < 30, compute a first_mover_window_months estimate: a simple formula like `months = max(1, round(30 - tier_cds_score) / (trend_velocity_score / 10))` (tune constants so outputs land in a believable 2-18 month range) — for all other claims, return null since the window concept only applies to rising+open claims.
```

**58.**
```
Update generate_value_propositions in vp_generator.py to use the REAL computed first_mover_window_months from ClaimScore instead of the static placeholder string from Prompt 34. If null (claim isn't rising+open), display "Not time-sensitive" or similar instead of a number on the VP card.
```

**59.**
```
Add trend_direction as a small visual indicator (up/flat/down arrow icon, or similar) next to claims on the Whitespace Grid cells (when expanded) and on VP Cards' Section F, so trend context is visible wherever claim-level data appears.
```

**60.**
```
Re-test the full flow once more end-to-end to confirm trend data flows correctly through scoring → VP generation → frontend display → PDF export, without breaking anything built in earlier batches. Fix any regressions.
```

---

🔲 **CHECKPOINT 12 — verify before continuing:**
- [ ] Trend direction/velocity populated on all ClaimScores
- [ ] First mover window correctly computed only for rising+open claims, null otherwise
- [ ] VP Cards show real computed windows, not the old placeholder
- [ ] Trend indicators visible on Whitespace Grid and VP Cards
- [ ] No regressions in the rest of the flow

---

## BATCH 13: Error Handling & Resilience (Prompts 61-65)

**61.**
```
Audit every Gemini API call across the codebase (gemini_client.py usage in nlp_extractor.py, failure_matcher.py, vp_generator.py, failure_embeddings.py). For each, confirm there's a sensible fallback if the call fails (rate limit, network error, malformed response) so a single Gemini hiccup never crashes an entire scan. Where fallbacks are missing or weak, add them now (e.g. keyword-based extraction instead of AI extraction, a templated headline instead of an AI-generated one). Log all fallback usages clearly to console so it's easy to tell during a demo if something silently degraded.
```

**62.**
```
Add a global exception handler in main.py that catches unhandled errors in any route and returns a clean JSON error response ({"error": str, "detail": str}) instead of a raw 500 stack trace, while still logging the full traceback server-side for debugging. Test this by temporarily breaking something on purpose (e.g. querying a nonexistent scan_id) and confirming the frontend receives a clean error rather than a confusing crash.
```

**63.**
```
Add frontend error handling: wrap all API calls in try/catch, and for each of the 4-5 main pages, show a clear error state (not a blank screen or console-only error) if a fetch fails — e.g. "We couldn't load this scan. [Retry button]". Specifically handle the case of navigating directly to a scan results URL for a scan_id that doesn't exist or hasn't finished processing yet.
```

**64.**
```
Add basic input validation on the Input Form: required fields enforced before submit, a reasonable max length on the Primary Benefit Idea textarea, and disable the submit button while a scan is already in progress to prevent duplicate submissions if a user double-clicks.
```

**65.**
```
Run a deliberate stress-test pass: try submitting the form with minimal/edge-case inputs (very short benefit idea, no key_ingredient, an unusual category+persona combination), and confirm the system degrades gracefully everywhere rather than crashing. Document any remaining rough edges you couldn't fully fix and why (so I know what to expect in a live demo).
```

---

🔲 **CHECKPOINT 13 — verify before continuing:**
- [ ] Gemini failures no longer crash scans — confirm by temporarily using an invalid API key and checking a scan still completes via fallbacks
- [ ] Backend returns clean JSON errors, not raw stack traces, on bad requests
- [ ] Frontend shows readable error states instead of blank screens or silent failures
- [ ] Form validation prevents obviously bad submissions
- [ ] You have a written list of any known remaining edge-case rough spots

---

## BATCH 14: Seed Data Quality & Realism Pass (Prompts 66-70)

**66.**
```
Review the current seed data distribution: query and print a summary (count of products per category × price tier, count of claims per category, frequency distribution of each claim across tiers). Identify if any category/tier combination has too few products (under ~15) to produce meaningful Tier-CDS variety, or if claim distribution is too uniform (everything landing in the same CDS zone). Report findings.
```

**67.**
```
Based on the previous prompt's findings, rebalance seed_data.py: ensure every category has at least 20 products per price tier (80+ per category, 400+ total if needed — feel free to expand beyond the original 120 if it improves demo quality), and deliberately engineer claim distributions so each category has a healthy mix: some claims clearly saturated (appear in >60% of products at a tier), some clearly open (<20%), and most in between — this makes the whitespace classifications and grid visualization much more compelling in a live demo than near-uniform random distribution.
```

**68.**
```
Re-run the seed (delete valueforge.db and restart) and re-verify via the /api/v1/scans/{id}/claims endpoint that a fresh scan now shows good variety across all 5 whitespace classifications for at least 2-3 different category/persona/tier combinations. Tune further if any combination still looks flat or unrealistic.
```

**69.**
```
Add 2-3 more failure cases per category (bringing the total toward 35-40) specifically crafted to closely match claim combinations that NOW appear in the rebalanced "contested" or "red zone" territory, so the Failure Dashboard's semantic matching has strong, relevant matches to surface during a demo rather than weak/loose matches.
```

**70.**
```
Re-generate embeddings for any newly added failure cases (re-run generate_and_store_failure_embeddings, confirming it skips cases that already have embeddings and only processes new ones). Test failure matching again on a scan whose benefit idea closely mirrors one of the new failure cases, and confirm it surfaces as a top match with a high similarity score.
```

---

🔲 **CHECKPOINT 14 — verify before continuing:**
- [ ] Seed data summary shows healthy variety, not flat/uniform distributions
- [ ] Rebalanced data produces visibly varied whitespace classifications across multiple test scans
- [ ] Failure case library expanded to 35-40 cases with good category coverage
- [ ] New failure cases correctly get embeddings without re-processing old ones
- [ ] A deliberately-matched test scan surfaces the right failure case as a strong match

---

## BATCH 15: Demo Polish & Loading States (Prompts 71-75)

**71.**
```
Improve the scan submission loading experience: since a synchronous scan involving multiple Gemini calls can take 5-15 seconds, replace the simple spinner from Prompt 24 with a staged progress indicator showing the actual pipeline steps happening server-side (e.g. "Scanning competitive landscape..." → "Computing market & consumer scores..." → "Checking brand permission..." → "Matching against failure patterns..." → "Generating recommendations..."). Since this is still a synchronous call, simulate the staged feel client-side with timed step transitions roughly matched to typical completion time, OR (better, if time allows) have the backend expose incremental status via the existing status field on ScanSession with a few more granular states, and have the frontend poll every 1-2 seconds to show real progress. Use your judgment on which approach fits better given what's already built.
```

**72.**
```
Add subtle animations/transitions for the score reveal moments — when FOS scores, whitespace classifications, and VP cards first appear, add a brief, tasteful entrance animation (fade/slide-in) rather than having content snap into existence. Keep this restrained — this is a B2B analytical tool, not a consumer app, so animations should feel confident and smooth, not playful or bouncy.
```

**73.**
```
Add a simple "Recent Scans" list/dashboard accessible from the Input Form page (e.g. a sidebar or section below the form) showing the last 5-10 scans created (product_name, category, persona, created_at, status) with links to jump directly back into their results — implement GET /api/v1/scans (list endpoint, sorted by created_at descending, limit 10) to support this. This makes live demos much smoother since you can quickly revisit a previously-generated good example without re-running the pipeline.
```

**74.**
```
Add a one-click "Load Example" button on the Input Form that pre-fills the form with a hand-picked, demo-friendly example (a combination you've verified produces good variety across whitespace classifications and a strong failure match) so a live demo never depends on typing things live or risking a flat/boring result. Hardcode 2-3 such "known good" example combinations as quick-select options.
```

**75.**
```
Do a full top-to-bottom demo dry run as if presenting to judges: from a cold start (fresh DB or existing one, your choice), click "Load Example," submit, walk through all 5 screens (Failures, Grid, Territory, VP Cards) in order, download the PDF brief, and time the whole thing. Report the total time and flag anything that feels slow, confusing, or visually rough in a live presentation context.
```

---

🔲 **CHECKPOINT 15 — verify before continuing:**
- [ ] Scan loading experience feels informative, not like a frozen screen
- [ ] Score/card reveal animations are smooth and professional, not distracting
- [ ] Recent Scans list works and allows quick navigation back to past results
- [ ] "Load Example" quick-fill works for at least 2 hardcoded scenarios
- [ ] You have a timed, full dry-run demo report with no major rough edges remaining

---

## BATCH 16: README, Setup Docs & Submission Prep (Prompts 76-80)

**76.**
```
Rewrite the root README.md into a hackathon-submission-quality document: project name and one-line pitch, the problem (Differentiation Blind Spot) in 2-3 sentences, how ValueForge solves it (the 3-Dimension Whitespace Model explained simply with the Market/Consumer/Brand framing), a screenshot placeholder section (I'll add real screenshots later), full local setup instructions (clone, backend venv + pip install + .env setup with Gemini key, frontend npm install, how to run both servers), and an honest "What's simplified for this prototype vs the full PRD vision" section listing: seed dataset instead of live Ai Palette API, heuristic BPS instead of real brand equity data, Gemini free tier instead of GPT-4o, SQLite instead of Postgres+Redis, synchronous processing instead of Celery async workers, smaller failure case library (35-40 vs 500+).
```

**77.**
```
Create a SETUP.md with more granular step-by-step instructions specifically for someone unfamiliar with the codebase setting it up fresh on their machine in under 5 minutes — exact commands, expected output at each step, common troubleshooting (e.g. "if you see a CORS error, check X", "if Gemini calls fail, check your API key in .env and confirm you haven't hit free tier rate limits").
```

**78.**
```
Create an ARCHITECTURE.md documenting the actual system as built (not the original PRD's enterprise architecture): a simple diagram or clear text description of the request flow (Frontend → FastAPI → SQLite, with Gemini as an external dependency for 3 specific operations), a description of each scoring formula as actually implemented (Tier-CDS, CRS, BPS, FOS) with their real weights, and the whitespace classification rules. This should let a judge or future contributor understand the system without reading all the code.
```

**79.**
```
Go through the codebase and add docstrings to every function in /backend/services/ that doesn't already have one, explaining what it does, its parameters, and what it returns — prioritize the scoring engine files since those are the conceptual core a judge is most likely to scrutinize.
```

**80.**
```
Create a .gitignore covering: node_modules, __pycache__, .env, valueforge.db, generated_briefs/, .venv or venv/, and any other environment-specific files. Double check no API keys or secrets are committed anywhere in the repo (search for "GEMINI" and "api_key" across all files to confirm nothing's hardcoded outside of .env).
```

---

🔲 **CHECKPOINT 16 — verify before continuing:**
- [ ] README.md is submission-quality and honestly documents prototype simplifications
- [ ] SETUP.md would let a stranger get the app running in under 5 minutes
- [ ] ARCHITECTURE.md accurately describes the real built system
- [ ] Key service files have clear docstrings
- [ ] No secrets are committed; .gitignore is correct

---

## BATCH 17: Lightweight Testing & Validation (Prompts 81-85)

**81.**
```
Review all existing pytest tests across the backend (scoring_engine, intent_engine, whitespace mapping) and confirm they all still pass after all the changes made in later batches — formulas and thresholds may have shifted since Prompt 12. Fix any now-failing tests by either correcting the test or correcting a regression, and tell me which it was in each case.
```

**82.**
```
Add integration-style tests in /backend/tests/test_full_pipeline.py that spin up a test client (FastAPI's TestClient), submit a real scan via POST /api/v1/scans against the seeded test data, and assert: the response has status complete, claims list is non-empty with valid score ranges (0-100) on every dimension, at least one misalignment-flag-eligible scenario works correctly, failure-risks returns exactly 3 matches, and value-propositions returns at least 1 card with non-null headline. This is the test most likely to catch a regression from any future change.
```

**83.**
```
Add a few frontend smoke tests if time allows (using Vitest + React Testing Library, already compatible with Vite) — at minimum, confirm the Input Form renders all required fields and that submitting with empty required fields shows validation feedback rather than submitting. This is optional/best-effort given hackathon time constraints — use your judgment on how deep to go here versus prioritizing the remaining prompts.
```

**84.**
```
Manually verify all formula implementations one more time against the PRD's stated formulas by reading back the relevant scoring_engine.py code alongside this checklist: Tier-CDS = (count/total)×100 ✓, CRS = Believability×0.25 + Relevance×0.30 + FatigueInverse×0.25 + TriggerAlignment×0.20 ✓, BPS = CategoryTenure×0.30 + ClaimAlignment×0.40 + ConsumerAssoc×0.30 ✓, FOS = (100-TierCDS)×0.35 + CRS×0.40 + BPS×0.25 ✓. Confirm weights sum to 1.0 in each weighted formula and report any discrepancy found versus what's actually coded.
```

**85.**
```
Run the full pytest suite one final time and paste the full output/summary so I can see a clean pass (or understand exactly what's still failing and why).
```

---

🔲 **CHECKPOINT 17 — verify before continuing:**
- [ ] All existing unit tests pass
- [ ] New integration test covers the full pipeline and passes
- [ ] Formula weight-sum audit confirms no drift from PRD specification (or discrepancies are clearly reported)
- [ ] Full test suite output is clean

---

## BATCH 18: Security & Config Sanity (Prompts 86-90)

**86.**
```
Review CORS configuration in main.py — confirm it's currently scoped to the Vite dev server origin only (not wildcard "*"), which is correct for local dev but should be noted as needing adjustment for any future deployment. Add a comment flagging this.
```

**87.**
```
Confirm the Gemini API key is only ever read server-side from .env via python-dotenv and is never exposed in any API response, frontend bundle, or client-side code. Search the frontend codebase to confirm no API key or secret ever appears there (it shouldn't, since all Gemini calls happen backend-side, but verify this explicitly).
```

**88.**
```
Add basic rate-limit-awareness for Gemini free tier: implement a simple in-memory counter or short delay between consecutive Gemini calls within a single scan's pipeline (since one scan now makes several Gemini calls: NLP extraction, embedding, up to 3 VP headline generations) to reduce risk of hitting free-tier rate limits during a single scan, especially important if running back-to-back demo scans. Log a warning to console if a Gemini call returns a rate-limit-specific error so it's diagnosable during a live demo.
```

**89.**
```
Do a basic SQL-injection sanity check: confirm all database queries go through SQLAlchemy's ORM/parameterized query patterns rather than any raw string-formatted SQL anywhere in the codebase. Search specifically for any f-string or .format() or % string interpolation feeding directly into a raw SQL execute call, and fix any found (there likely aren't any if SQLAlchemy ORM was used consistently, but confirm explicitly).
```

**90.**
```
Add basic request size/length limits on the Primary Benefit Idea field server-side too (not just frontend, since frontend validation can be bypassed) — reject (with a clean 400 error) any primary_benefit_idea over a reasonable length (e.g. 1000 characters) in the Pydantic schema for ScanCreateRequest using a Field constraint.
```

---

🔲 **CHECKPOINT 18 — verify before continuing:**
- [ ] CORS is correctly scoped, with a comment about production considerations
- [ ] No secrets leak into frontend code or API responses anywhere
- [ ] Gemini calls have basic rate-limit resilience and clear logging on rate-limit errors
- [ ] No raw/unparameterized SQL exists anywhere in the codebase
- [ ] Server-side input length validation is enforced, not just client-side

---

## BATCH 19: Final Feature Completeness Review (Prompts 91-95)

**91.**
```
Go through the original PRD's 16 Functional Requirements (FR-01 through FR-16) one by one and tell me, for each, whether it's: fully implemented, partially implemented (and what's missing), or intentionally cut from this prototype's scope (and why, per our earlier scoping decisions). Present this as a clear table. This is a status report, not a coding prompt — don't change any code in this step.
```

**92.**
```
Based on the gap report from the previous prompt, pick the single highest-impact partially-implemented or missing feature that's still realistically buildable given everything else already in place, and implement it now. Explain your choice before starting.
```

**93.**
```
Review the Non-Functional Requirements table from PRD section 1.6 (performance, scalability, security, availability) and report which are meaningfully testable/applicable at hackathon-prototype scale (e.g. "page load < 3 seconds" is testable; "500 concurrent sessions" is not meaningfully testable without infrastructure we don't have) — and confirm the applicable ones are actually being met (e.g. time an actual scan + page load).
```

**94.**
```
Create a short DEMO_SCRIPT.md — a literal minute-by-minute talk track for presenting this to hackathon judges in under 5 minutes: what to say when introducing the problem, which "Load Example" preset to use, what to point out on each of the 4-5 screens, and a strong closing line connecting back to the PRD's core differentiator (the Failure Dashboard shown before recommendations, and the 3-Dimension Authentic Claim Territory concept). Keep this tight and practiced-sounding, not a feature list read-aloud.
```

**95.**
```
Take a final pass reviewing everything end to end as if you were a skeptical hackathon judge: is the core "3-dimension reasoning" claim actually demonstrated clearly on screen, or does it feel hidden in the backend? If the reasoning isn't visually obvious enough anywhere in the UI, propose and implement one small addition (e.g. an "explain this score" tooltip/expandable section on VP cards showing the FOS formula broken down with this claim's actual numbers plugged in) that makes the reasoning chain feel transparent and impressive rather than a black box.
```

---

🔲 **CHECKPOINT 19 — verify before continuing:**
- [x] You have a clear FR-by-FR completeness report
- [x] The highest-impact gap identified has been addressed
- [x] Applicable NFRs have been verified against real measurements
- [x] DEMO_SCRIPT.md exists and is genuinely presentable
- [x] The 3-dimension reasoning is now visually transparent somewhere in the UI, not just a backend calculation

---

## BATCH 20: Final Submission Package (Prompts 96-100)

**96. [DONE]**
```
Take screenshots (or guide me on which screens to screenshot myself) of all 5 main screens (Input Form, Failure Dashboard, Whitespace Grid, Authentic Territory, VP Cards) using a "Load Example" preset for consistent, clean demo data, and tell me exactly where to save them in the repo (e.g. /docs/screenshots/) and how to reference them in the README.
```

**97. [DONE]**
```
Double-check that a completely fresh clone of this repo (simulate by checking what files are tracked vs gitignored) plus following only the SETUP.md instructions would actually result in a working app, with no undocumented manual steps (e.g. a seed script that needs to be run manually but isn't mentioned, or an environment variable not listed in .env.example). Fix any gaps found in the documentation or add any missing automatic setup steps.
```

**98. [DONE]**
```
Create a one-page PITCH.md suitable for a hackathon submission form's "project description" field: project name, tagline, the problem in 2 sentences, the solution in 3-4 sentences emphasizing the 3-Dimension Whitespace Model as the key innovation, the tech stack used (be honest: FastAPI, React, SQLite, Google Gemini free tier), and what makes this distinctive versus a generic "AI content generator" (the Failure Dashboard shown before recommendations, and Brand Permission as a first-class dimension most positioning tools ignore).
```

**99. [DONE]**
```
Run one final complete smoke test of the entire application from a totally cold state (stop both servers, delete the DB, restart everything fresh per SETUP.md instructions exactly as written) and walk through the full demo flow one more time end to end. Report explicitly: did everything work with zero manual intervention beyond what SETUP.md documents? If anything required an undocumented fix, document it now.
```

**100.**
```
Give me a final summary of the entire project as built: what ValueForge does, the full tech stack, every screen and what it shows, every backend scoring formula as actually implemented, what was simplified from the original enterprise PRD and why, and a short list of "if I had another week" next steps (e.g. real Postgres+pgvector at scale, async job queue, real brand equity data integration, expanded failure library). This is my final reference document for understanding exactly what got built — don't write any more code in this step, just report.
```

---

🔲 **FINAL CHECKPOINT — submission ready:**
- [ ] Fresh-clone test passes with zero undocumented manual steps
- [ ] Screenshots captured and referenced in README
- [ ] PITCH.md is submission-ready
- [ ] You have a complete, accurate final summary of the built system
- [ ] You've personally clicked through the entire demo flow at least once start to finish without errors

---

## Notes on using these prompts

- **Don't paste batches all at once.** Antigravity (like most agentic coding tools) does better with one focused task at a time. Paste one numbered prompt, let it finish, glance at what it did, then move to the next.
- **The checkpoints are not optional.** If you skip verifying and a foundational piece (e.g. the scoring engine in Batch 2-3) is subtly wrong, every later batch builds on a broken foundation and gets harder to fix the further you go.
- **If something fails a checkpoint**, don't just move to the next prompt — paste a message back into Antigravity describing exactly what's wrong (e.g. "All claims are landing in 'contested' — the FOS formula or thresholds seem off, can you debug?") before continuing.
- **Gemini free tier rate limits** are real — if you hit them during heavy testing in Batches 11+, just wait a minute or reduce test frequency; the fallback logic from Batch 13 should keep the app functional either way.
- **Everything here uses only free tools**: Google Gemini's free tier (`gemini-1.5-flash`/`gemini-2.0-flash` + `text-embedding-004`), SQLite, and open-source Python/JS libraries. No OpenAI, no Anthropic API, no paid infrastructure anywhere.
