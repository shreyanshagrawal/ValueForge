import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertOctagon, AlertTriangle, Package, Tag, Clock, Megaphone,
  Beaker, TrendingUp, TrendingDown, FileDown, ChevronDown, ChevronUp, Info
} from "lucide-react";
import { Card, CardHeader, CardContent } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../lib/api";
import StepperNav from "../components/StepperNav";

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────
interface CrsFilter {
  label: string;
  score: number;
}

interface MisalignmentFlag {
  dimension: "TierCDS" | "CRS" | "BPS";
  value: number;
  threshold: number;
  suggestion: string;
}

interface VP {
  id: number;
  whitespace: "True Whitespace" | "Conditional Whitespace" | "Contested";
  // Section A
  headline: string;
  subclaims: string[];
  // Section B — Scores
  fos: number;
  tierCds: number;
  crs: number;
  crsFilters: CrsFilter[];
  bps: number;
  trend: "up" | "down" | "stable";
  // Section C — Ingredient
  ingredients: string;
  ingredientRationale: string;
  // Section D — Format & Packaging
  format: string;
  packaging: string;
  // Section E — Price
  price: string;
  tier: string;
  // Section F — Window
  window: number; // months
  // Section G — Channels
  channels: string[];
  // Misalignment Flags
  flags: MisalignmentFlag[];
}

// ─────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────
const fallbackVps: VP[] = [
  {
    id: 1,
    whitespace: "True Whitespace",
    headline: "The Clean-Energy Hydration Solution",
    subclaims: ["clean_label", "sustained_energy", "electrolyte_balance"],
    fos: 86,
    tierCds: 12,
    crs: 78,
    crsFilters: [
      { label: "Relevance", score: 82 },
      { label: "Believability", score: 79 },
      { label: "Differentiation", score: 88 },
      { label: "Emotional Resonance", score: 63 },
    ],
    bps: 82,
    trend: "up",
    ingredients: "Natural Caffeine (Green Tea Extract) + Coconut Water Powder",
    ingredientRationale: "Green Tea Caffeine aligns with 'clean energy' claim believability for the Fitness Millennial. Coconut Water adds electrolyte credibility without synthetic additives.",
    format: "Single-serve effervescent tablet",
    packaging: "Minimalist aluminum tube, matte finish, bold primary colour accent — signals premium, eco-conscious.",
    price: "₹120–150 per serve",
    tier: "Mid-Premium",
    window: 11,
    channels: ["Fitness Influencers (Instagram Reels)", "Specialty Pharmacy Endcaps"],
    flags: [],
  },
  {
    id: 2,
    whitespace: "Conditional Whitespace",
    headline: "Science-Backed Recovery Refueling",
    subclaims: ["clinically_proven", "muscle_recovery", "zero_sugar"],
    fos: 74,
    tierCds: 28,
    crs: 81,
    crsFilters: [
      { label: "Relevance", score: 87 },
      { label: "Believability", score: 75 },
      { label: "Differentiation", score: 70 },
      { label: "Emotional Resonance", score: 91 },
    ],
    bps: 60,
    trend: "up",
    ingredients: "BCAA Blend (2:1:1 ratio) + Tart Cherry Extract",
    ingredientRationale: "BCAA 2:1:1 is the clinical gold standard for muscle recovery. Tart Cherry adds natural anti-inflammatory evidence, boosting claim believability for the 'Achievement' driver persona.",
    format: "Ready-to-drink (RTD) 250ml can",
    packaging: "Sleek silver/black can, clinical typography, structured label hierarchy — science brand cue.",
    price: "₹140–180 per serve",
    tier: "Premium",
    window: 7,
    channels: ["Premium Gym Chain Partnerships", "Targeted YouTube Pre-rolls (Fitness Content)"],
    flags: [],
  },
  {
    id: 3,
    whitespace: "Contested",
    headline: "High Protein Immunity Booster",
    subclaims: ["high_protein", "immunity_support", "natural_ingredients"],
    fos: 38,
    tierCds: 75,
    crs: 36,
    crsFilters: [
      { label: "Relevance", score: 60 },
      { label: "Believability", score: 30 },
      { label: "Differentiation", score: 22 },
      { label: "Emotional Resonance", score: 32 },
    ],
    bps: 35,
    trend: "down",
    ingredients: "Whey Protein Isolate + Vitamin C + Zinc",
    ingredientRationale: "Common combination; offers little differentiation. Whey Isolate is strongly tied to the 'Fitness' category and does not extend naturally into immunity.",
    format: "Protein bar / 60g",
    packaging: "Standard foil wrapper, green accents — undifferentiated in this SKU format.",
    price: "₹80–100 per serve",
    tier: "Mass Market",
    window: 2,
    channels: ["Modern Trade (Supermarket Shelves)", "Amazon Listings"],
    flags: [
      { dimension: "TierCDS", value: 75, threshold: 60, suggestion: "Pivot to 'Clean Energy' positioning (TierCDS: 12) for this price tier." },
      { dimension: "CRS", value: 36, threshold: 40, suggestion: "Switch persona target to 'Urban Health Seeker' for better resonance." },
      { dimension: "BPS", value: 35, threshold: 40, suggestion: "Your brand lacks equity in immunity. Focus on Recovery or Energy where BPS > 80." },
    ],
  },
];

// ─────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────
function ScoreBar({ label, score }: { label: string; score: number }) {
  const color = score >= 70 ? "#10B981" : score >= 50 ? "#FBBF24" : "#EF4444";
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-brand-muted font-medium">{label}</span>
        <span className="font-bold" style={{ color }}>{score}</span>
      </div>
      <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className="h-full rounded-full"
          style={{ background: color }}
        />
      </div>
    </div>
  );
}

function MisalignmentFlagCard({ flag }: { flag: MisalignmentFlag }) {
  const dimColors: Record<string, string> = {
    TierCDS: "bg-[#FFF8F0] border-[#FDBA74] text-[#C2410C]",
    CRS: "bg-[#FEF2F2] border-[#FECACA] text-[#B91C1C]",
    BPS: "bg-[#FFF1F2] border-[#FECDD3] text-[#BE123C]",
  };
  return (
    <div className={`rounded-xl border p-4 ${dimColors[flag.dimension]}`}>
      <div className="flex items-center gap-2.5 mb-2 font-bold text-[17px]">
        <AlertTriangle className="w-5 h-5 shrink-0" />
        {flag.dimension} too {flag.dimension === "TierCDS" ? "high" : "low"}: {flag.value} (threshold: {flag.threshold})
      </div>
      <p className="text-[15px] opacity-90 leading-relaxed pl-[30px]">
        <span className="font-bold">Suggested fix:</span> {flag.suggestion}
      </p>
    </div>
  );
}

function VPCard({ vp, index }: { vp: VP; index: number }) {
  const isContested = vp.whitespace === "Contested";
  
  const [fosMathOpen, setFosMathOpen] = useState(false);
  const wsColors: Record<string, string> = {
    "True Whitespace": "success",
    "Conditional Whitespace": "warning",
    "Contested": "danger",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.12, type: "spring", stiffness: 200, damping: 22 }}
    >
      <Card className={`flex flex-col h-full hover:scale-100 ${isContested ? "border-red-200 shadow-red-100/50" : ""}`}>
        {/* TOP STRIPE */}
        <div className={`h-1.5 w-full rounded-t-[10px] ${
          vp.whitespace === "True Whitespace"
            ? "bg-gradient-to-r from-emerald-400 to-emerald-600"
            : vp.whitespace === "Conditional Whitespace"
            ? "bg-gradient-to-r from-amber-400 to-yellow-500"
            : "bg-gradient-to-r from-red-400 to-red-600"
        }`} />

        {/* ─── SECTION A — HEADLINE ─── */}
        <CardHeader className="pb-4 border-b border-brand-light">
          <div className="flex justify-between items-start mb-3">
            <Badge variant={wsColors[vp.whitespace] as any} className="uppercase tracking-widest text-[10px] font-bold">
              {vp.whitespace}
            </Badge>
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-1">
                <span className="text-4xl font-black text-primary-600 tracking-tighter leading-none">{vp.fos}</span>
              </div>
              <span className="text-[9px] font-bold text-brand-muted uppercase tracking-widest mt-0.5">FOS Score</span>
            </div>
          </div>
          <div className="flex items-start gap-1">
            <span className="text-xs font-bold text-primary-600 uppercase tracking-wider shrink-0 mt-1">A</span>
            <h2 className="text-xl font-bold text-brand-black leading-snug">"{vp.headline}"</h2>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-2 mb-4">
            {vp.subclaims.map(c => (
              <Badge key={c} variant="outline" className="text-[10px] text-brand-muted/80">#{c}</Badge>
            ))}
          </div>

            {/* FOS Math Breakdown Toggle */}
          <div className="mt-2 border border-brand-light rounded-lg overflow-hidden">
            <button 
              className="w-full bg-gray-50 flex items-center justify-between p-3 text-xs font-bold text-gray-700 hover:bg-gray-100 transition-colors"
              onClick={() => setFosMathOpen(!fosMathOpen)}
            >
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-primary-600" />
                <span>See FOS Math Breakdown</span>
              </div>
              {fosMathOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            <AnimatePresence>
              {fosMathOpen && (
                <motion.div 
                  initial={{ height: 0 }}
                  animate={{ height: "auto" }}
                  exit={{ height: 0 }}
                  className="overflow-hidden"
                >
                  {/* Spec-defined formula: FOS = Market(35%) + Consumer(40%) + Brand(25%) */}
                  <div className="p-4 bg-white border-t border-brand-light space-y-2 text-xs font-mono text-gray-600">
                    <div className="text-[10px] text-brand-muted font-bold uppercase tracking-wider mb-2">FOS = Market (35%) + Consumer (40%) + Brand (25%)</div>
                    <div className="flex justify-between border-b pb-1.5">
                      <span>Market Openness  (100 − {vp.tierCds}) × 0.35</span>
                      <span className="font-bold text-gray-700">= {(((100 - vp.tierCds) * 0.35)).toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between border-b pb-1.5">
                      <span>Consumer Response (CRS {vp.crs}) × 0.40</span>
                      <span className="font-bold text-gray-700">= {(vp.crs * 0.40).toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between border-b pb-1.5">
                      <span>Brand Permission  (BPS {vp.bps}) × 0.25</span>
                      <span className="font-bold text-gray-700">= {(vp.bps * 0.25).toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between pt-1 text-sm text-brand-black">
                      <span className="font-black">Final Opportunity Score (FOS)</span>
                      <span className="font-black text-primary-600">{vp.fos} / 100</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </CardHeader>

        <CardContent className="pt-0 flex-grow space-y-0 divide-y divide-brand-light">

          {/* ─── SECTION B — OPPORTUNITY SCORES ─── */}
          <div className="py-5 space-y-4">
            <div className="flex items-center gap-1.5 mb-3">
              <span className="text-xs font-bold text-primary-600 uppercase tracking-wider">B</span>
              <span className="text-xs font-bold text-brand-black uppercase tracking-widest">Opportunity Scores</span>
            </div>
            {/* Tier-CDS + BPS + Trend Row */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-brand-light rounded-lg p-2.5 text-center">
                <span className="block text-[10px] text-brand-muted mb-1 font-semibold uppercase">Tier-CDS</span>
                <span className={`text-lg font-black ${vp.tierCds > 60 ? "text-red-500" : vp.tierCds > 30 ? "text-amber-500" : "text-emerald-600"}`}>{vp.tierCds}</span>
                <span className="block text-[9px] text-brand-muted mt-0.5">
                  {vp.tierCds < 30 ? "Open" : vp.tierCds < 60 ? "Moderate" : "Saturated"}
                </span>
              </div>
              <div className="bg-brand-light rounded-lg p-2.5 text-center">
                <span className="block text-[10px] text-brand-muted mb-1 font-semibold uppercase">BPS</span>
                <span className={`text-lg font-black ${vp.bps < 40 ? "text-red-500" : vp.bps < 60 ? "text-amber-500" : "text-emerald-600"}`}>{vp.bps}</span>
                <span className="block text-[9px] text-brand-muted mt-0.5">Brand Fit</span>
              </div>
              <div className="bg-brand-light rounded-lg p-2.5 text-center">
                <span className="block text-[10px] text-brand-muted mb-1 font-semibold uppercase">Trend</span>
                {vp.trend === "up"
                  ? <TrendingUp className="w-5 h-5 text-emerald-500 mx-auto" />
                  : <TrendingDown className="w-5 h-5 text-red-500 mx-auto" />
                }
                <span className="block text-[9px] text-brand-muted mt-0.5">{vp.trend === "up" ? "Growing" : "Declining"}</span>
              </div>
            </div>
            {/* CRS 4 Filter Bars */}
            <div>
              <div className="flex justify-between text-[10px] mb-2">
                <span className="font-bold text-brand-black uppercase tracking-wider">CRS (Consumer Response)</span>
                <span className="font-black text-primary-600">{vp.crs}/100</span>
              </div>
              <div className="space-y-2">
                {vp.crsFilters.map(f => <ScoreBar key={f.label} label={f.label} score={f.score} />)}
              </div>
            </div>
          </div>

          {/* ─── SECTION C — INGREDIENT ─── */}
          <div className="py-5">
            <div className="flex items-center gap-1.5 mb-3">
              <span className="text-xs font-bold text-primary-600 uppercase tracking-wider">C</span>
              <span className="text-xs font-bold text-brand-black uppercase tracking-widest">Hero Ingredients</span>
            </div>
            <div className="flex gap-3">
              <div className="p-2 bg-primary-50 text-primary-600 rounded-lg shrink-0"><Beaker className="w-4 h-4" /></div>
              <div>
                <p className="font-bold text-sm text-brand-black mb-1">{vp.ingredients}</p>
                <p className="text-xs text-brand-muted leading-relaxed">{vp.ingredientRationale}</p>
              </div>
            </div>
          </div>

          {/* ─── SECTION D — FORMAT & PACKAGING ─── */}
          <div className="py-5">
            <div className="flex items-center gap-1.5 mb-3">
              <span className="text-xs font-bold text-primary-600 uppercase tracking-wider">D</span>
              <span className="text-xs font-bold text-brand-black uppercase tracking-widest">Format & Packaging</span>
            </div>
            <div className="flex gap-3">
              <div className="p-2 bg-primary-50 text-primary-600 rounded-lg shrink-0"><Package className="w-4 h-4" /></div>
              <div>
                <p className="font-bold text-sm text-brand-black mb-0.5">{vp.format}</p>
                <p className="text-xs text-brand-muted leading-relaxed">{vp.packaging}</p>
              </div>
            </div>
          </div>

          {/* ─── SECTIONS E + F — PRICE + WINDOW ─── */}
          <div className="py-5 grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <span className="text-xs font-bold text-primary-600 uppercase tracking-wider">E</span>
                <span className="text-xs font-bold text-brand-black uppercase tracking-widest">Price</span>
              </div>
              <div className="flex gap-2 items-center">
                <div className="p-2 bg-primary-50 text-primary-600 rounded-lg shrink-0"><Tag className="w-4 h-4" /></div>
                <div>
                  <p className="font-bold text-sm text-brand-black">{vp.price}</p>
                  <p className="text-[10px] text-brand-muted">{vp.tier}</p>
                </div>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <span className="text-xs font-bold text-primary-600 uppercase tracking-wider">F</span>
                <span className="text-xs font-bold text-brand-black uppercase tracking-widest">First Mover Window</span>
              </div>
              <div className="flex gap-2 items-center">
                <div className={`p-2 rounded-lg shrink-0 ${vp.window <= 4 ? "bg-red-50 text-red-600" : vp.window <= 8 ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"}`}>
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <p className={`font-black text-lg leading-none ${vp.window <= 4 ? "text-red-600" : vp.window <= 8 ? "text-amber-600" : "text-emerald-600"}`}>
                    {vp.window}mo
                  </p>
                  <p className="text-[10px] text-brand-muted">before saturation</p>
                </div>
              </div>
            </div>
          </div>

          {/* ─── SECTION G — CHANNELS ─── */}
          <div className="py-5">
            <div className="flex items-center gap-1.5 mb-3">
              <span className="text-xs font-bold text-primary-600 uppercase tracking-wider">G</span>
              <span className="text-xs font-bold text-brand-black uppercase tracking-widest">Channel Fit</span>
            </div>
            <div className="space-y-2">
              {vp.channels.map((ch, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <div className="p-1.5 bg-primary-50 text-primary-600 rounded-md shrink-0"><Megaphone className="w-3.5 h-3.5" /></div>
                  <span className="text-sm text-brand-body font-medium">{ch}</span>
                </div>
              ))}
            </div>
          </div>

          {/* (Misalignment Flags moved to page-level accordion per UI Spec) */}

        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────
export default function ValueProps() {
  const { scanId } = useParams();
  const basePath = scanId ? `/scan/${scanId}` : "";
  const navigate = useNavigate();
  const [vpsData, setVpsData] = useState<VP[]>(fallbackVps);
  const [exporting, setExporting] = useState(false);
  const [pageFlagsOpen, setPageFlagsOpen] = useState(false);
  
  const flaggedCount = vpsData.reduce((sum, vp) => sum + vp.flags.length, 0);

  useEffect(() => {
    if (scanId) {
      api.getValuePropositions(scanId)
        .then(res => {
          const rawVps = res.propositions || res;
          if (!rawVps || rawVps.length === 0) {
            setVpsData(fallbackVps);
            return;
          }
          const formattedVps: VP[] = rawVps.map((item: any, i: number) => {
            if (item.subclaims && Array.isArray(item.subclaims)) return item;
            
            const wsClass = item.whitespace_classification === "true_whitespace" ? "True Whitespace" 
                          : item.whitespace_classification === "conditional" ? "Conditional Whitespace" 
                          : "Contested";
            
            return {
              id: item.id || i,
              whitespace: wsClass,
              headline: item.headline,
              subclaims: [item.subclaim_1, item.subclaim_2].filter(Boolean),
              fos: Math.round(item.fos_score || 0),
              tierCds: Math.round(item.tier_cds_score || 0),
              crs: Math.round(item.crs_score || 0),
              crsFilters: [
                { label: "Relevance", score: Math.round(item.crs_relevance || 0) },
                { label: "Believability", score: Math.round(item.crs_believability || 0) },
                { label: "Fatigue Inverse", score: Math.round(item.crs_fatigue_inverse || 0) },
                { label: "Trigger Alignment", score: Math.round(item.crs_trigger_alignment || 0) },
              ],
              bps: Math.round(item.bps_score || 0),
              trend: item.trend_direction || "stable",
              ingredients: Array.isArray(item.hero_ingredients) ? item.hero_ingredients.join(" + ") : (item.hero_ingredients || ""),
              ingredientRationale: item.ingredient_rationale || "",
              format: item.recommended_format || "",
              packaging: item.packaging_direction || "",
              price: `₹${item.price_band_min || 0}–${item.price_band_max || 0}`,
              tier: item.cds_zone === "saturated" ? "Mass Market" : "Premium",
              window: parseInt(item.first_mover_window) || 6,
              channels: item.channel_fit || [],
              flags: [] 
            };
          });
          setVpsData(formattedVps);
        })
        .catch(err => console.error("Failed to fetch VPs", err));
    }
  }, [scanId]);

  const handleExportBrief = async () => {
    if (!scanId) {
      navigate("/brand-brief"); // Fallback if no scanId
      return;
    }
    setExporting(true);
    try {
      const res = await api.generateBrief(scanId);
      if (res.url) {
        window.location.href = res.url;
      }
    } catch (err) {
      console.error("Failed to export brief", err);
      // Fallback
      navigate(`${basePath}/brand-brief`);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-70px)] bg-[#F8F4FF] p-4 md:p-8 pb-32 font-sans selection:bg-[#8B4CFF] selection:text-white relative overflow-hidden">
      {/* ── Dynamic Background Grid (1st Page Theme) ── */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(139,76,255,0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(139,76,255,0.06) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      />
      
      {/* Ambient glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#8B4CFF]/10 blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full bg-[#C084FC]/10 blur-[100px] pointer-events-none z-0" />

      <div className="max-w-[1400px] mx-auto space-y-12 relative z-10">

        <StepperNav currentStep={4} />

        {/* Misalignment Flags Accordion */}
        {flaggedCount > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl overflow-hidden shadow-sm">
            <button
              onClick={() => setPageFlagsOpen(!pageFlagsOpen)}
              className="w-full flex items-center justify-between p-4 md:p-5 hover:bg-red-100 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 text-red-600 rounded-full shrink-0">
                  <AlertOctagon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-red-800 font-bold text-base">⚠️ Claims to Avoid ({flaggedCount})</h3>
                </div>
              </div>
              {pageFlagsOpen ? <ChevronUp className="w-5 h-5 text-red-800" /> : <ChevronDown className="w-5 h-5 text-red-800" />}
            </button>
            <AnimatePresence>
              {pageFlagsOpen && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: "auto" }}
                  exit={{ height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-4 md:p-5 pt-0 border-t border-red-200/50">
                    <p className="text-red-700/80 text-sm mb-4">
                      Your original idea's <strong>"high protein"</strong> claim has a Tier-CDS of 75 (Highly Saturated), CRS of 36 (Below threshold), and BPS of 35 (Brand Permission Gap). See Card 3 for details. We recommend pivoting to the True Whitespace positions.
                    </p>
                    <div className="space-y-3">
                      {vpsData.flatMap(vp => vp.flags).map((flag, i) => (
                        <MisalignmentFlagCard key={i} flag={flag} />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="bg-white border-gray-200 text-xs">FR-13</Badge>
              <span className="text-xs font-bold uppercase tracking-widest text-brand-muted">Ranked by FOS</span>
            </div>
            <h1 className="text-3xl font-bold text-brand-black tracking-tight">Value Propositions</h1>
            <p className="text-brand-body mt-1">Each card is a complete product design brief — not just a message.</p>
          </div>
          <Button 
            disabled={exporting}
            className="shrink-0 gap-2 h-[48px] px-8 bg-transparent border-2 border-[#FFB64D] hover:bg-[#FFB64D]/10 text-[#FFB64D] disabled:opacity-50 disabled:cursor-not-allowed rounded-full font-bold uppercase tracking-widest transition-all duration-300" 
            onClick={handleExportBrief}
          >
            <FileDown className="w-5 h-5" />
            {exporting ? "Generating..." : "Export Brand Brief"}
          </Button>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {vpsData.map((vp, index) => (
            <VPCard key={vp.id} vp={vp} index={index} />
          ))}
        </div>

      </div>
    </div>
  );
}
