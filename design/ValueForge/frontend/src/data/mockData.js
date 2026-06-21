// Centralised mock data used across ValueForge pages
export const PROJECT = {
  brand: "Aurelia",
  product: "Plant-based Protein Yogurt",
  category: "Functional Dairy Alternatives",
  region: "North America",
  targetTier: "Premium",
  submittedBy: "Marcus Chen · Senior Brand Manager",
  scanId: "VF-2026-04812",
};

export const SCAN_STAGES = [
  {
    key: "pending",
    label: "Queued",
    sub: "Validating concept inputs",
    detail: "Concept payload received. Allocating compute and warming model caches.",
    durationMs: 1400,
  },
  {
    key: "scanning",
    label: "Scanning Market",
    sub: "Indexing 61B signals across 24 countries",
    detail: "Crawling SKU launches, retailer assortments, and trend velocity windows.",
    durationMs: 3200,
  },
  {
    key: "scoring",
    label: "Scoring Territory",
    sub: "Computing CDS, CRS & BPS dimensions",
    detail: "Synthesising authentic claim territory and risk-flag thresholds.",
    durationMs: 2400,
  },
  {
    key: "ai_processing",
    label: "AI Processing",
    sub: "Running Arya consumer & failure models",
    detail: "Embedding claims, ranking against the failure library, scoring brand permission.",
    durationMs: 3600,
  },
  {
    key: "complete",
    label: "Ready",
    sub: "Brand brief assembled",
    detail: "Your ValueForge results are ready to review.",
    durationMs: 600,
  },
];

export const SCAN_TELEMETRY = [
  { label: "Signals scanned", end: 61482390 },
  { label: "Concepts compared", end: 5127 },
  { label: "Failure patterns matched", end: 43 },
  { label: "Whitespace cells mapped", end: 18 },
];

// Misalignment Risk Flags (FR-14)
// Trigger when: TierCDS > 60 OR CRS < 40 OR BPS < 40
export const CLAIMS = [
  {
    id: "c-01",
    text: "Doctor-recommended for gut health",
    tierCDS: 78,
    crs: 32,
    bps: 28,
    triggers: ["TierCDS", "CRS", "BPS"],
    suggested: "Clinically-studied probiotic blend",
    reason: "Tier saturation high; consumer relevance weak vs. premium yogurts; brand has no clinical heritage.",
  },
  {
    id: "c-02",
    text: "Ancient grains, modern strength",
    tierCDS: 42,
    crs: 64,
    bps: 71,
    triggers: [],
    suggested: null,
    reason: null,
  },
  {
    id: "c-03",
    text: "Zero sugar — guilt-free indulgence",
    tierCDS: 71,
    crs: 48,
    bps: 58,
    triggers: ["TierCDS"],
    suggested: "Naturally sweetened with monk fruit",
    reason: "‘Zero sugar’ category is over-saturated in premium dairy tier (CDS = 71).",
  },
  {
    id: "c-04",
    text: "Boosts immunity in 7 days",
    tierCDS: 52,
    crs: 38,
    bps: 33,
    triggers: ["CRS", "BPS"],
    suggested: "Daily immunity support",
    reason: "Specific time claims trip regulatory radar; brand permission is low for medical promises.",
  },
  {
    id: "c-05",
    text: "Crafted by farmers, finished by chefs",
    tierCDS: 28,
    crs: 72,
    bps: 81,
    triggers: [],
    suggested: null,
    reason: null,
  },
  {
    id: "c-06",
    text: "Detoxifies your body naturally",
    tierCDS: 64,
    crs: 36,
    bps: 22,
    triggers: ["TierCDS", "CRS", "BPS"],
    suggested: "Supports natural digestive balance",
    reason: "‘Detox’ language fails consumer trust scoring and is outside brand’s wellness permission.",
  },
  {
    id: "c-07",
    text: "Slow-cultured, never rushed",
    tierCDS: 36,
    crs: 68,
    bps: 74,
    triggers: [],
    suggested: null,
    reason: null,
  },
  {
    id: "c-08",
    text: "More protein than Greek yogurt",
    tierCDS: 81,
    crs: 55,
    bps: 62,
    triggers: ["TierCDS"],
    suggested: "12g of complete plant protein",
    reason: "Direct competitor comparison saturates the tier (CDS = 81); shift to absolute claim.",
  },
];

// Authentic Claim Territory (FR-15)
// Scores 0–100 on Market / Consumer / Brand dimensions
export const TERRITORY_CLAIMS = [
  { id: "t-01", text: "Ancient grains, modern strength", market: 22, consumer: 68, brand: 76, inside: true, rank: 1 },
  { id: "t-02", text: "Crafted by farmers, finished by chefs", market: 24, consumer: 78, brand: 82, inside: true, rank: 2 },
  { id: "t-03", text: "Slow-cultured, never rushed", market: 18, consumer: 74, brand: 80, inside: true, rank: 3 },
  { id: "t-04", text: "12g of complete plant protein", market: 28, consumer: 62, brand: 70, inside: true, rank: 4 },
  { id: "t-05", text: "Naturally sweetened with monk fruit", market: 26, consumer: 60, brand: 64, inside: true, rank: 5 },
  { id: "t-06", text: "Clinically-studied probiotic blend", market: 70, consumer: 56, brand: 38, inside: false, rank: null },
  { id: "t-07", text: "Doctor-recommended for gut health", market: 48, consumer: 28, brand: 22, inside: false, rank: null },
  { id: "t-08", text: "Detoxifies your body naturally", market: 32, consumer: 24, brand: 18, inside: false, rank: null },
];

// Brand Brief (FR-16) — 8 sections
export const BRAND_BRIEF = {
  generatedAt: "Feb 14, 2026 · 14:32 PST",
  sections: [
    {
      id: "overview",
      title: "1. Product Overview",
      body: "Aurelia is preparing to launch a premium plant-based protein yogurt for the North American market, targeting health-led millennials and Gen Z consumers willing to pay a premium for functional dairy alternatives. The concept blends a slow-cultured texture with 12g of complete plant protein and a clean ingredient panel positioned in the $5.49–$6.99 unit shelf-tier.",
    },
    {
      id: "failures",
      title: "2. Failure Simulation Results",
      body: "Out of 500+ historical launches in adjacent tiers, 4 critical failure patterns matched this concept. Top risks are (a) over-indexing on ‘zero sugar’ in a saturated tier, (b) clinical/medical claims without brand permission, and (c) pricing 18% above category index with insufficient differentiation. Acknowledge these patterns before scaling production volume.",
    },
    {
      id: "vps",
      title: "3. Top 3 Value Propositions with Product Design Directions",
      body: "1. Slow-cultured, never rushed — Emphasise craft heritage; positions Aurelia in the 'artisan-functional' whitespace.\n2. 12g of complete plant protein — Absolute, defensible, regulator-safe.\n3. Crafted by farmers, finished by chefs — Collaborative narrative pulls in foodservice halo and earned media.\n\nProduct Design Directions:\n- Ingredient: Premium pea-and-almond isolate blend for an ultra-smooth, chalk-free mouthfeel, plus active plant-based live cultures.\n- Format: 150g single-serve glass jars with a minimalist embossed wordmark and a recyclable kraft paper sleeve for premium tactile appeal.\n- Price: Positioned at $5.49–$6.99 (premium tier), aligning with a high-margin value story and clean label branding.",
    },
    {
      id: "avoid",
      title: "4. Claims to Avoid",
      body: "Avoid ‘doctor-recommended,’ ‘boosts immunity in 7 days,’ and ‘detoxifies your body naturally’ — all three trip CRS and BPS thresholds, and two cross regulatory lines for unsubstantiated benefit promises. ‘Zero sugar’ and ‘more protein than Greek yogurt’ remain technically truthful but burn category attention in an already-saturated tier.",
    },
    {
      id: "territory",
      title: "5. Authentic Claim Territory Map",
      body: "The authentic territory sits at the intersection of (Market: trend velocity in slow-craft functional), (Consumer: rising demand for transparent process narratives), and (Brand: Aurelia’s farm-to-table origin story). Five claims land inside the overlap zone — Aurelia should anchor messaging on craft + protein and orbit secondary claims around clean sweetening and culture provenance.",
    },
    {
      id: "trend",
      title: "6. Trend Window & First Mover Deadlines",
      body: "Slow-craft functional dairy has an estimated 14-month first-mover window before private label catches up. Recommended national rollout no later than Q3 2026 to capture the open territory; an 8-week regional pilot in the Pacific Northwest should precede national distribution.",
    },
    {
      id: "competitive",
      title: "7. Competitive Landscape Summary",
      body: "Two incumbents (Chobani, Siggi’s) own the dairy-protein tier; three challengers (Forager, Lavva, Kite Hill) compete on plant-based but skew indulgent rather than functional. No challenger currently occupies the ‘craft + protein’ intersection — this is Aurelia’s open lane.",
    },
    {
      id: "risks",
      title: "8. Risk Flags",
      body: "Three claims carry red flags requiring rewrites before pack-copy lock. One supply-chain risk: monk fruit sourcing concentration in a single region (Guangxi) exposes pricing volatility. Mitigation: dual-source by Q2 2026.",
    },
  ],
};
