# ValueForge — Feature & Functionality Spec
**For the UI Team | Version 2.0**

This document describes every screen, every button, every data field, and every interaction in the application. Design decisions are entirely up to you.

---

## Application Flow Overview

ValueForge is a linear wizard. The user fills out a form, submits it, and is taken through 4 result screens in order. A persistent navigation bar appears on all 4 result screens.

```
Home (Input Form)
  ↓ (after scan completes)
Step 1: Failure Dashboard      /scan/:scanId/failures
  ↓
Step 2: Whitespace Grid        /scan/:scanId/grid
  ↓
Step 3: Authentic Territory    /scan/:scanId/territory
  ↓
Step 4: Value Propositions     /scan/:scanId/propositions
```

---

## Global: Stepper Navigation Bar

**Appears on:** All 4 result screens.

**Purpose:** Lets the user know which step they're on and navigate between steps freely.

**Contents:**
- 4 numbered links:
  1. Failures → `/scan/:scanId/failures`
  2. Whitespace Grid → `/scan/:scanId/grid`
  3. Authentic Territory → `/scan/:scanId/territory`
  4. Propositions → `/scan/:scanId/propositions`
- The current active step is visually distinguishable from the others.
- All steps are clickable links (free backward and forward navigation).
- A badge on the right side showing either **"Live Market Data"** or **"Demo Dataset"** depending on the `data_source` field returned from `GET /api/v1/scans/:scanId`.

---

## Screen 1: Input Form
**Route:** `/`

**API calls on load:**
- `GET /api/v1/reference/categories` — populates the Category dropdown
- `GET /api/v1/reference/personas` — populates the Target Persona dropdown
- `GET /api/v1/scans` — populates the Recent Scans list

---

### Form: New Idea Scan

**Buttons at the top of the form:**
- **"Example 1"** button — fills the entire form with preset demo data (Premium Snack Foods scenario).
- **"Example 2"** button — fills the entire form with preset demo data (Ultra-Premium Energy Drink scenario).

**Form Fields:**

| Field Name | Input Type | Required | Notes |
|---|---|---|---|
| Product Name | Text input | Yes | — |
| Category | Dropdown | Yes | Options loaded from API. Submits `category_code`. |
| Target Persona | Dropdown | Yes | Options loaded from API. Submits `persona_code`. |
| Primary Benefit Idea | Textarea | Yes | Max 200 characters. |
| Key Ingredient | Text input | No | — |
| Target Price Tier | Dropdown | Yes | Static options: Mass, Mid, Premium, Ultra-Premium |
| Use Live Data | Checkbox | No | Disabled unless Category = "Protein Bars". |

**Submit button:** "Run Analysis"

---

### Form: Loading / Processing State

After the form is submitted, the form is replaced by a loading state. The backend processes the scan asynchronously and the frontend polls `GET /api/v1/scans/:scanId` every 1.5 seconds.

**Status messages to display (mapped from the scan's `status` field):**

| `status` value | Message to show | Progress |
|---|---|---|
| `pending` | "Initializing scan..." | 10% |
| `extracting_claims` | "Scanning competitive landscape..." | 30% |
| `scoring_claims` | "Computing market & consumer scores..." | 50% |
| `matching_failures` | "Matching against failure patterns..." | 70% |
| `generating_vps` | "Generating recommendations..." | 90% |
| `complete` | "Scan complete! Redirecting..." | 100% |

When `status === 'complete'`, the user is automatically redirected to `/scan/:scanId/failures`.

If `status` starts with `'failed'`, show an error message and reset the form.

---

### Sidebar: Recent Scans

A list of previous scans loaded from `GET /api/v1/scans`.

Each item shows:
- `product_name`
- `category_code` and `target_price_tier`
- `status`

Each item is a clickable link to `/scan/:id/failures`.

Empty state: "No recent scans found."

---

## Screen 2: Failure Dashboard
**Route:** `/scan/:scanId/failures`

**API call:** `GET /api/v1/scans/:scanId/failure-risks`

Returns an array of failure match objects.

**Purpose of this screen:** Before showing any opportunities, the user must review historical product failures that have similar positioning to their concept. The user must explicitly acknowledge these risks before proceeding. This is an intentional gate.

---

### Failure Cards (one per returned item)

Each item in the response has:
- `similarity_score` — how closely it matches the user's concept (0–100)
- `failure_case.product_name` — name of the failed product
- `failure_case.failure_reason_type` — category of why it failed (e.g., `permission_gap`, `market_saturation`)
- `failure_case.positioning_used` — what claim/positioning it tried
- `failure_case.failure_summary` — brief explanation of what happened
- `failure_case.lesson_learned` — the key takeaway

Each card displays all of the above fields. The `similarity_score` is displayed as a percentage ("XX% pattern match").

Empty state: "No strong historical failure patterns detected for this concept."

---

### Acknowledgement Bar

A bar/section that contains:
- A **checkbox** with label: "I understand these market risks and want to see my opportunities."
- A **"Continue to Whitespace Map"** button — **this button is disabled until the checkbox is checked.**

---

## Screen 3: Whitespace Opportunities Map
**Route:** `/scan/:scanId/grid`

**API call:** `GET /api/v1/scans/:scanId/whitespace`

Returns: `{ grid: [...] }` — an array of scored claims.

**Purpose:** Shows a matrix of where market opportunities exist across need categories and market saturation levels.

---

### The Matrix Grid

A **6 × 3 grid** where:
- **Rows** = 6 Need Categories: Energy, Recovery, Immunity, Taste, Convenience, Sustainability
- **Columns** = 3 Coverage Buckets: Underserved, Moderate, Saturated

Each cell represents claims that fall in that category × bucket combination.

**Each cell displays:**
- The **count** of claims in that cell.
- A **color** indicating the dominant opportunity classification among that cell's claims:
  - `true_whitespace` — confirmed open opportunity
  - `conditional` — opportunity with conditions/risks
  - `brand_whitespace` — market open but brand credibility may be low
  - `contested` — saturated, avoid
  - `consumer_whitespace` — consumer interest but low market presence
- **Opacity** of the cell is proportional to the average Brand Permission Score (BPS) of claims in that cell. Higher BPS = more opaque. This visually encodes how credible the brand is in that space.
- Empty cells (no claims) are shown as empty/placeholder.

**Interactions:**
- **Clicking a cell** opens an expanded detail panel showing the individual claims in that cell.
- **Hovering a cell** gives a visual feedback (scale or highlight).

**Legend:** A key mapping each of the 5 classification types to their colors.

---

### Expanded Cell Panel (opens on cell click)

Shows when the user clicks a cell. Has a **close/dismiss button**.

Title: "{Category} Claims in {Bucket} Market"

A list/grid of mini-cards, one per claim in that cell. Each mini-card shows:
- Claim name (`claim_code` formatted as human-readable text)
- Trend indicator icon: rising / peaking / declining
- Final Opportunity Score (`fos_score`)
- Brand Permission Score (`bps_score`)
- Classification label (`whitespace_classification`)

---

### Navigation

**"Continue to Authentic Territory"** button → navigates to `/scan/:scanId/territory`

---

## Screen 4: Authentic Claim Territory
**Route:** `/scan/:scanId/territory`

**API call:** `GET /api/v1/scans/:scanId/authentic-territory`

Returns an array of claims, each with scores across 3 dimensions.

**Purpose:** Shows which claims satisfy all 3 scoring dimensions simultaneously — these are the claims the brand can both find and credibly win.

---

### Radar Chart

A **3-axis radar chart** (spider/web chart) with axes:
- Market Openness (0–100)
- Consumer Response (0–100)
- Brand Permission (0–100)

**One polygon per claim** is plotted. Claims where `is_authentic_territory === true` are visually prominent; claims where `is_authentic_territory === false` are visually subdued/faded.

Tooltip on hover shows the claim's name and its 3 axis scores.

---

### Description Panel (alongside the chart)

**Section 1: Explainer**
Static text: "Authentic Claim Territory is where all three dimensions align — the market has room, consumers want it, and your brand can credibly claim it. Claims highlighted here are the ONLY claims your brand can both find AND win."

**Section 2: Qualifying Claims List**
- Count of claims where `is_authentic_territory === true`.
- A list of those claim names (formatted as readable text).
- Empty state: "No claims hit the threshold for true whitespace across all three dimensions."

---

### Navigation

**"Continue to Value Propositions"** button → navigates to `/scan/:scanId/propositions`

---

## Screen 5: AI Value Proposition Cards
**Route:** `/scan/:scanId/propositions`

**API calls:**
- `GET /api/v1/scans/:scanId/value-propositions` — the recommended positioning options
- `GET /api/v1/scans/:scanId/misalignment-flags` — claims the brand should avoid

---

### Page Header

- Title: "Product Value Propositions"
- **"Download Brand Brief" button** — calls `POST /api/v1/scans/:scanId/brief`. While generating, show a loading state on the button ("Generating..."). On success, redirect the browser to the PDF download URL.

---

### Misalignment Flags Section (collapsible/accordion)

Header label: "⚠️ Claims to Avoid (N)" where N is the count of flags.

**Clicking the header toggles it open/closed.**

When expanded, each flag shows:
- `flagged_claim_code` — the claim name (in quotes)
- `flag_reason` — why it should be avoided (shown as a badge/tag)
- `explanation` — paragraph explaining the issue
- `suggested_replacement_code` — if present, show: "↳ Suggestion: Try '{code}' instead"

Empty state inside the expanded panel: "No critical misalignments detected."

---

### Value Proposition Cards (grid)

A responsive card grid — as many cards as the API returns (typically 3–5). Each card is ranked with `rank` (1 = top recommendation).

**Each card contains the following sections:**

#### Header Area
- **Rank label:** "Option 1", "Option 2", etc. (uses classification color as badge background)
- **FOS score:** "FOS: XX.X" (Final Opportunity Score, displayed prominently)
- **Headline:** `vp.headline` — the main positioning statement (in quotes)
- **Two supporting bullet points:** `subclaim_1` and `subclaim_2`

#### FOS Math Breakdown (collapsible)
A toggle/expand section labeled **"See FOS Math Breakdown"**.

When expanded, shows the weighted calculation with this card's actual numbers:
```
FOS = Market (35%) + Consumer (40%) + Brand (25%)

Market Openness  (100 − {tier_cds_score}) × 0.35  =  XX.X
Consumer Response (CRS {crs_score}) × 0.40         =  XX.X
Brand Permission  (BPS {bps_score}) × 0.25         =  XX.X
                                                    ───────
Final Opportunity Score (FOS)                       XX.X / 100
```

#### Score Details
- **Tier-CDS:** The claim density score value + zone label (`green` / `yellow` / `red`)
- **BPS:** Brand Permission Score value
- **CRS Sub-scores** — 4 individual scores shown as labelled progress bars (0–100):
  - Believability
  - Relevance
  - Fatigue Inverse
  - Intent Trigger Alignment

#### Hero Ingredients
- Tags for each ingredient in `hero_ingredients`
- `ingredient_rationale` — a paragraph explaining the ingredient recommendation

#### Format & Packaging
- `recommended_format` — the suggested product format
- `packaging_direction` — packaging/form factor guidance

#### Price Band & Trend Window
- **Price Band:** "₹{price_band_min} – ₹{price_band_max}"
- **Trend Window:** Trend direction indicator (rising / peaking / declining) + `first_mover_window` text (e.g., "12–18 months")

#### Channel Fit
- A list of tags/pills for each channel in `channel_fit` (e.g., "D2C", "Modern Trade", "Quick Commerce")

---

## Error States (all result screens)

If the API call for any result screen fails, show:
- Heading: "We couldn't load this scan."
- Sub-text: "The scan may not exist, or it hasn't finished processing yet."
- **"Retry"** button — reloads the page
- **"Start Over"** button — navigates to `/`

---

## Full API Reference

Base URL is set via environment variable `VITE_API_URL` (defaults to `http://localhost:8000/api/v1`).

| Method | Endpoint | Screen | Purpose |
|--------|----------|--------|---------|
| GET | `/reference/categories` | Input Form | Populate category dropdown |
| GET | `/reference/personas` | Input Form | Populate persona dropdown |
| GET | `/scans` | Input Form | Recent scans sidebar |
| POST | `/scans` | Input Form | Submit new scan |
| GET | `/scans/:id` | Stepper + Form | Poll scan status / data source badge |
| GET | `/scans/:id/failure-risks` | Failure Dashboard | Load failure cards |
| GET | `/scans/:id/whitespace` | Whitespace Grid | Load matrix data |
| GET | `/scans/:id/authentic-territory` | Authentic Territory | Load radar chart data |
| GET | `/scans/:id/value-propositions` | VP Cards | Load VP cards |
| GET | `/scans/:id/misalignment-flags` | VP Cards | Load flags accordion |
| POST | `/scans/:id/brief` | VP Cards | Generate + download PDF |

**PDF download:** The `POST /scans/:id/brief` response returns `{ status: 'ready', download_url: '/path/to/file.pdf' }`. Redirect `window.location.href` to `VITE_BACKEND_URL + download_url` (separate env var, defaults to `http://localhost:8000`).

---

## Notes

- All `claim_code` and `failure_reason_type` values are in `snake_case` from the API. Always display them as readable text (replace underscores with spaces, capitalize).
- All scores are 0–100. Display with 1 decimal place (e.g., `62.4`).
- The user can freely navigate between steps 1–4 using the Stepper links at any time.
- The checkbox acknowledgement on the Failure Dashboard is intentional — the Continue button must stay disabled until checked.
