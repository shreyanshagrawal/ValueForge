# ValueForge — UI Specification for Redesign
**Version 1.0 | Prepared for UI Team**

> **Context for the AI generating this UI:**  
> ValueForge is a B2B SaaS tool for CPG brand strategists and product managers. Think McKinsey slide-deck meets Bloomberg terminal — the aesthetic should feel authoritative, data-dense, and premium. The target user is a senior brand manager or product innovation lead at an FMCG company. They are comfortable reading data-heavy dashboards. The current prototype uses a dark-navy glassmorphism design that works well for demos, but the UI team should feel free to evolve the visual language while keeping the **analytical and trustworthy** tone. This is not a consumer app.

---

## Design System Principles

- **Tone:** Strategic, analytical, premium. Not playful.
- **Color Priority:** A multi-tier semantic color system is core to the product. These colors are *functional*, not decorative:
  - **Green (`#10b981`):** "True Whitespace" — the holy grail, a confirmed opportunity.
  - **Yellow (`#eab308`):** "Conditional" — opportunity exists, but with risks.
  - **Orange (`#f97316`):** "Brand Whitespace" — market is open but the brand may lack permission.
  - **Red (`#ef4444`):** "Contested" — saturated, avoid.
  - **Gray (`#64748b`):** "Consumer Whitespace" — consumer interest exists but market is low.
- **Typography:** Use a professional sans-serif (Inter, DM Sans, or similar). No display fonts.
- **Data visualization:** The product is *built around* charts and data grids. These must be pixel-perfect and readable, not decorative.

---

## Application Structure

The application is a **multi-step linear wizard** after initial form submission. A persistent `Stepper` navigation bar appears on every result screen.

### URL/Route Map
```
/                           → Input Form (start a new scan)
/scan/:scanId/failures      → Step 1: Historical Failure Dashboard
/scan/:scanId/grid          → Step 2: Whitespace Opportunities Map (matrix grid)
/scan/:scanId/territory     → Step 3: Authentic Claim Territory (radar chart)
/scan/:scanId/propositions  → Step 4: AI Value Proposition Cards (final output)
```

### Global Navigation / Header
- **Logo/Name:** "ValueForge" in the top-left.
- **The header should be minimal.** The primary navigation is the in-page `Stepper` within scan flows, not a sidebar.
- A "New Scan" / "Home" button should always be accessible (top-right or in nav bar).
- **No sidebar navigation.** The flow is strictly linear.

---

## Component 1: Stepper Bar

**Purpose:** Persistent "you are here" indicator that appears at the top of every scan result page. Also tells the user if they're viewing live or demo data.

**Appears on:** All 4 result screens (Failures, Grid, Territory, Propositions).

**Data it needs:**
- `scanId` (from route params) — used to fetch the scan's `data_source` field.
- Current route path — to determine the active step.

**What to render:**
1. A horizontal list of 4 named steps, numbered 1–4:
   - `1. Failures` → `/scan/:scanId/failures`
   - `2. Whitespace Grid` → `/scan/:scanId/grid`
   - `3. Authentic Territory` → `/scan/:scanId/territory`
   - `4. Propositions` → `/scan/:scanId/propositions`
2. The active step should be visually distinct (bolder, accent color, highlighted background).
3. Past steps should be clickable links (so users can navigate backwards freely).
4. A **data source badge** floated to the right:
   - If `scan.data_source === 'live'`: Show a green badge labeled "Live Market Data".
   - Else: Show an orange badge labeled "Demo Dataset".

---

## Screen 1: Input Form (Home)
**Route:** `/`

**Layout:** Two-column grid on desktop (form panel 2/3 width, recent scans sidebar 1/3 width).

### Panel A: New Idea Scan Form

**Header area:**
- Title: "New Idea Scan"
- Subtitle: "Define your product concept to analyze competitive white space."
- Top-right: Two "Load Example" buttons ("Example 1", "Example 2") with a flask/beaker icon. These pre-fill the entire form with demo data for presentation purposes.

**Form fields (render in this order):**

| Field | Type | Notes |
|-------|------|-------|
| Product Name | Text input | Required. Placeholder: "e.g. MegaWhey Pro" |
| Category | Dropdown | Populated dynamically from `GET /api/v1/reference/categories`. Displays `display_name`, submits `category_code`. |
| Target Persona | Dropdown | Populated dynamically from `GET /api/v1/reference/personas`. Displays `display_name`, submits `persona_code`. |
| Primary Benefit Idea | Textarea (3 rows) | Required. Max 200 chars. Placeholder: "A high protein bar for serious athletes". Show a live character count or helper text. |
| Key Ingredient | Text input | Optional. Placeholder: "e.g. Ashwagandha". |
| Target Price Tier | Dropdown | Static options: `mass`, `mid`, `premium`, `ultra_premium`. Display as "Mass", "Mid", "Premium", "Ultra-Premium". |
| Use Live Data | Checkbox | Disabled unless `category_code === 'protein_bars'`. Label: "Use live market data (protein bars only, experimental)". Helper text: "Fetches real current listings instead of the demo dataset." |

**Submit button:** "Run Analysis" — right-aligned, primary CTA.

**Loading state (after submit):**
When the form is submitted, replace the form with a full-panel loading state. The scan takes 30–90 seconds. The UI polls the backend every 1.5s and shows a live progress bar + status message:
- `pending` → "Initializing scan..." (10% bar)
- `extracting_claims` → "Scanning competitive landscape..." (30% bar)
- `scoring_claims` → "Computing market & consumer scores..." (50% bar)
- `matching_failures` → "Matching against failure patterns..." (70% bar)
- `generating_vps` → "Generating recommendations..." (90% bar)
- `complete` → "Scan complete! Redirecting..." (100% bar, then auto-navigate to `/failures`)

### Panel B: Recent Scans Sidebar

**Data:** `GET /api/v1/scans` — returns an array of previous scan objects.

Each scan item shows:
- `product_name` (bold)
- `category_code` • `target_price_tier` (secondary, smaller)
- `status` — colored green if `complete`, gray otherwise.

Each item is a clickable link to `/scan/:id/failures`. Empty state: "No recent scans found."

---

## Screen 2: Failure Dashboard
**Route:** `/scan/:scanId/failures`

**Data source:** `GET /api/v1/scans/:scanId/failure-risks`

Returns an array of `FailureMatch` objects. Each has:
- `id`
- `similarity_score` (number, 0–100)
- `failure_case` (nested object):
  - `product_name` (string)
  - `failure_reason_type` (snake_case string, e.g., `"permission_gap"`)
  - `positioning_used` (string)
  - `failure_summary` (string)
  - `lesson_learned` (string)

**Layout:**
- Page header: Shield/warning icon + "Historical Failure Risks" heading.
- Subtitle: "Before exploring white space, review past market failures that share similar positioning and claims to your concept."
- A vertical list of failure cards (see below).
- A sticky/fixed acknowledgement footer bar at the bottom.

**Failure Card design:**
Each card should feel like a serious warning document, not a generic list item. Design notes:
- Red left border stripe (4px).
- Very subtle red gradient wash on the left side of the card.
- Header row: `failure_case.product_name` in red/danger color, floated right: a "XX% pattern match" badge in red.
- Below: A category tag showing `failure_reason_type` formatted as human-readable (replace underscores with spaces, uppercase).
- Two labelled paragraphs: **"Positioning Used:"** `failure_case.positioning_used` and **"Summary:"** `failure_case.failure_summary`.
- A "Lesson Learned" callout block with a left border and italic text.

**Empty state:** A centered panel: "No strong historical failure patterns detected for this concept."

**Acknowledgement Footer Bar:**
This is a critical UX pattern — the user **must** check a checkbox before they can proceed. This is intentional design (the "Crash First" philosophy).
- Checkbox + label: "I understand these market risks and want to see my opportunities."
- "Continue to Whitespace Map →" primary CTA button — **disabled until checkbox is checked**.

---

## Screen 3: Whitespace Opportunities Map (The Grid)
**Route:** `/scan/:scanId/grid`

**Data source:** `GET /api/v1/scans/:scanId/whitespace`

Returns: `{ grid: [...ClaimScore objects] }`. Each `ClaimScore` has:
- `need_category` (one of: "Energy", "Recovery", "Immunity", "Taste", "Convenience", "Sustainability")
- `coverage_bucket` (one of: "Underserved", "Moderate", "Saturated")
- `whitespace_classification` (one of: `true_whitespace`, `conditional`, `brand_whitespace`, `contested`, `consumer_whitespace`)
- `bps_score` (number, 0–100) — Brand Permission Score
- `fos_score` (number, 0–100) — Final Opportunity Score
- `claim_code` (string)
- `trend_direction` (one of: `rising`, `peaking`, `declining`)
- `trend_velocity_score` (number)

**This screen is the product's most data-dense view.** The core is a **6×3 matrix grid**:
- **Rows (Y-axis):** 6 Need Categories: Energy, Recovery, Immunity, Taste, Convenience, Sustainability.
- **Columns (X-axis):** 3 Coverage Buckets: Underserved, Moderate, Saturated.

**Grid cell rendering logic (critical):**
1. Group all `ClaimScore` objects by their `need_category` + `coverage_bucket` to find which claims fall in each cell.
2. **Cell background color:** The dominant `whitespace_classification` among that cell's claims determines the color (use the 5-color semantic system defined above). Empty cells have a dashed border, no fill.
3. **Cell opacity:** Map the average `bps_score` of that cell's claims to an opacity value between `0.3` and `1.0`. Higher Brand Permission = more opaque/vibrant. This visually encodes "your brand's credibility to win this space."
4. **Cell content:** Display the count of claims in that cell as a number in white text. Empty cells show nothing.
5. **On hover:** Scale up slightly (`scale(1.02)`) with a smooth transition.
6. **On click:** Expand a panel below the grid showing the individual claims inside that cell (see Expanded Cell Panel).

**Grid Legend:**
A horizontal row of 5 color swatches with labels must appear above the grid: True Whitespace (green), Conditional (yellow), Brand Whitespace (orange), Contested (red), Empty (dashed).

**Expanded Cell Panel (appears when a cell is clicked):**
- Slides in below the grid.
- Title: "{Category} Claims in {Bucket} Market" with an X close button.
- A responsive card grid of individual claim mini-cards. Each mini-card shows:
  - Claim name (formatted, capitalize, replace underscores with spaces).
  - Trend icon: TrendingUp (green) if rising, TrendingDown (red) if declining, Minus (yellow) if peaking.
  - "Final Opportunity Score:" → `fos_score`
  - "Brand Permission:" → `bps_score`
  - A classification badge in the appropriate color.

**Footer CTA:** "Continue to Value Propositions →" right-aligned.

> **Note:** The grid currently skips the "Authentic Territory" page in its CTA. It should navigate to `/scan/:scanId/territory`.

---

## Screen 4: Authentic Claim Territory (Radar Chart)
**Route:** `/scan/:scanId/territory`

**Data source:** `GET /api/v1/scans/:scanId/authentic-territory`

Returns an array of claim objects, each with:
- `claim_code` (string)
- `market_openness` (number, 0–100)
- `crs_score` (number, 0–100) — Consumer Response Score
- `bps_score` (number, 0–100) — Brand Permission Score
- `is_authentic_territory` (boolean) — `true` if this claim passes all 3 threshold tests.

**Layout:** Two-column grid (radar chart on the left ~60%, description panel on the right ~40%).

### Left: Radar Chart
- A **3-axis radar chart** with axes labeled: "Market Openness", "Consumer Response", "Brand Permission".
- All axes scale from 0–100.
- **One radar polygon per claim.** Each claim is plotted with its 3 dimension scores as the 3 axis values.
- Claims where `is_authentic_territory === true`: bright teal stroke (`#0d9488`), semi-transparent teal fill (opacity 0.5), bold stroke.
- Claims where `is_authentic_territory === false`: muted gray stroke, near-invisible fill (opacity 0.05).
- Tooltip on hover showing the claim's dimension scores.

**This chart is the product's conceptual centrepiece.** The visual goal is to show that "authentic territory" claims light up in the center of the radar while non-qualifying claims barely register.

### Right: Description Panels (stacked vertically)

**Panel 1: "What is this?"**
Static explainer text: "Authentic Claim Territory is where all three dimensions align — the market has room, consumers want it, and your brand can credibly claim it. Claims highlighted here are the ONLY claims your brand can both find AND win."

**Panel 2: "Qualifying Claims (N)"**
- Count of claims where `is_authentic_territory === true`.
- A bulleted list of their `claim_code` values (formatted: replace underscores with spaces, capitalize).
- Empty state: "No claims hit the threshold for true whitespace across all three dimensions."

**Footer CTA:** "Continue to Value Propositions →" right-aligned.

---

## Screen 5: AI Value Proposition Cards
**Route:** `/scan/:scanId/propositions`

**Data sources:**
- VP Cards: `GET /api/v1/scans/:scanId/value-propositions`
- Misalignment Flags: `GET /api/v1/scans/:scanId/misalignment-flags`

### VP Card data shape:
Each VP has these fields:
- `id`, `rank` (1 = top recommendation)
- `headline` (string) — the main positioning line
- `subclaim_1`, `subclaim_2` (strings) — supporting bullet points
- `whitespace_classification` (string)
- `fos_score` (number, 0–100)
- `tier_cds_score` (number) — Claim Density Score
- `cds_zone` (string: `green`, `yellow`, `red`)
- `crs_score` (number, 0–100) — Consumer Response Score
- `crs_believability` (number, 0–100)
- `crs_relevance` (number, 0–100)
- `crs_fatigue_inverse` (number, 0–100)
- `crs_trigger_alignment` (number, 0–100)
- `bps_score` (number, 0–100) — Brand Permission Score
- `hero_ingredients` (array of strings)
- `ingredient_rationale` (string)
- `recommended_format` (string)
- `packaging_direction` (string)
- `price_band_min`, `price_band_max` (numbers, in ₹)
- `trend_direction` (string: `rising`, `peaking`, `declining`)
- `trend_velocity_score` (number)
- `first_mover_window` (string — e.g., "12–18 months")
- `channel_fit` (array of strings — e.g., ["D2C", "Modern Trade"])

### Page Header:
- Title: "Product Value Propositions"
- Right side: "⬇ Download Brand Brief" button — triggers `POST /api/v1/scans/:scanId/brief`, then redirects to the PDF download URL.

### Misalignment Flags Accordion (above the VP cards):
A collapsible/accordion panel with a red/danger header showing "⚠️ Claims to Avoid (N)" where N is the count of flags. Clicking the header expands it.

Each flag shows:
- The `flagged_claim_code` in quotes and bold.
- A badge showing `flag_reason`.
- Explanation text.
- If `suggested_replacement_code` exists: "↳ Suggestion: Try '{code}' instead" in teal.

### VP Card Grid:
Cards in a responsive grid (`repeat(auto-fit, minmax(300px, 1fr))`). 

**Card anatomy (top to bottom):**
1. **Card Header (colored background):**
   - For `rank === 1`: Dark navy background, white text. This is the "hero" card.
   - For others: Light/neutral background.
   - Top row: Left = "Option N" badge in the classification color. Right = "FOS: XX.X" label.
   - Main headline in large text: `"{vp.headline}"` (with quotes).
   - Two bullet points: `subclaim_1`, `subclaim_2`.

2. **Card Body (white/neutral background):**

   **Section A: FOS Math Breakdown (collapsible `<details>`/`<summary>`):**
   This is a key transparency feature. The summary toggle is: "🔍 See FOS Math Breakdown". When expanded, it shows the weighted calculation for this specific card's scores:
   ```
   FOS = Market (35%) + Consumer (40%) + Brand (25%)
   ────────────────────────────────────────────────
   Market Openness (100 - {tier_cds_score}) × 0.35  =  XX.X
   Consumer Response (CRS {crs_score}) × 0.40       =  XX.X  
   Brand Permission (BPS {bps_score}) × 0.25        =  XX.X
   ════════════════════════════════════════════════
   = Final Opportunity Score (FOS)                     XX.X / 100
   ```

   **Section B: Score Badges:**
   - `Tier-CDS`: Show score + zone pill (`green`/`yellow`/`red` colored).
   - `BPS Indicator`: Numeric score.
   - `CRS Sub-filters (XX.X)`: A 2×2 grid of 4 mini progress bars, each showing:
     - Believability: `crs_believability` / 100 (progress bar)
     - Relevance: `crs_relevance` / 100 (progress bar)
     - Fatigue Inv: `crs_fatigue_inverse` / 100 (progress bar)
     - Intent: `crs_trigger_alignment` / 100 (progress bar)

   **Section C: Hero Ingredients:**
   - Tags/chips for each ingredient in `hero_ingredients`.
   - `ingredient_rationale` text below.

   **Section D: Format & Packaging:**
   - `recommended_format` (formatted: replace underscores with spaces).
   - `packaging_direction` description.

   **Section E: Price Band & Trend Window (2-column):**
   - Left: "Price Band" label + "₹{min} - ₹{max}" in large teal text.
   - Right: "Trend Window" + trend icon (TrendingUp green / TrendingDown red / Minus yellow) + `first_mover_window` text.

   **Section F: Channel Fit:**
   - Outlined pill tags for each channel in `channel_fit`.

---

## API Reference Summary

All calls prefix with `VITE_API_URL` (env var, defaults to `http://localhost:8000/api/v1`).

| Method | Endpoint | Used In |
|--------|----------|---------|
| GET | `/reference/categories` | Input Form (populate dropdown) |
| GET | `/reference/personas` | Input Form (populate dropdown) |
| GET | `/scans` | Input Form (recent scans sidebar) |
| POST | `/scans` | Input Form (submit) |
| GET | `/scans/:id` | Stepper (data source badge) + Form polling |
| GET | `/scans/:id/failure-risks` | Failure Dashboard |
| GET | `/scans/:id/whitespace` | Whitespace Grid |
| GET | `/scans/:id/authentic-territory` | Authentic Territory |
| GET | `/scans/:id/value-propositions` | VP Cards |
| GET | `/scans/:id/misalignment-flags` | VP Cards (flags accordion) |
| POST | `/scans/:id/brief` | VP Cards (PDF download) |

---

## Error States

Every result screen (`/failures`, `/grid`, `/territory`, `/propositions`) must handle a failed data fetch. The error UI should show:
- A heading: "We couldn't load this scan."
- Reason: "The scan may not exist, or it hasn't finished processing yet."
- Two buttons: "Retry" (reload) and "Start Over" (navigate to `/`).

---

## Notes for the UI Team

1. **The Stepper should allow free backwards navigation** — users may want to revisit the Failure Dashboard after seeing the VP cards.
2. **The Whitespace Grid is intentionally not navigating to the Authentic Territory screen** in the current prototype. That should be fixed so the "Continue" CTA goes to `/territory`, not `/propositions`.
3. **All scores are on a 0–100 scale.** Display them with 1 decimal place (e.g., `62.4`).
4. **`claim_code` is always in `snake_case`.** Always display it formatted: replace `_` with spaces and capitalize for humans.
5. **The PDF download button** (`POST /scans/:id/brief`) is slow (~5s). Show a loading state while it generates. When the response comes back with `{ status: 'ready', download_url: '/path/to/file.pdf' }`, redirect `window.location.href` to `VITE_BACKEND_URL + download_url`.
