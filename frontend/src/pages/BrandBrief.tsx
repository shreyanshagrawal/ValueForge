import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  FileDown, FileText, Clock, AlertTriangle, CheckCircle2, TrendingUp,
  ShieldAlert, Download, Eye, ChevronDown, ChevronUp, AlertOctagon, Star
} from "lucide-react";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import DesignBrandBriefPreview from "./design/BrandBriefPreview";

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────
interface BriefSection {
  id: string;
  number: string;
  title: string;
  icon: React.ElementType;
  accentColor: string;
}

const SECTIONS: BriefSection[] = [
  { id: "overview",       number: "01", title: "Product Overview",                    icon: Eye,          accentColor: "text-primary-600 bg-primary-50 border-primary-200" },
  { id: "failures",       number: "02", title: "Failure Simulation Results",           icon: AlertTriangle,accentColor: "text-red-600 bg-red-50 border-red-200" },
  { id: "value_props",    number: "03", title: "Top 3 Value Propositions",             icon: Star,         accentColor: "text-emerald-600 bg-emerald-50 border-emerald-200" },
  { id: "avoid",          number: "04", title: "Claims to Avoid",                      icon: ShieldAlert,  accentColor: "text-orange-600 bg-orange-50 border-orange-200" },
  { id: "claim_territory",number: "05", title: "Authentic Claim Territory Map",        icon: CheckCircle2, accentColor: "text-violet-600 bg-violet-50 border-violet-200" },
  { id: "trend_window",   number: "06", title: "Trend Window & First Mover Deadlines", icon: Clock,        accentColor: "text-amber-600 bg-amber-50 border-amber-200" },
  { id: "competitive",    number: "07", title: "Competitive Landscape Summary",        icon: TrendingUp,   accentColor: "text-blue-600 bg-blue-50 border-blue-200" },
  { id: "risk_flags",     number: "08", title: "Risk Flags",                           icon: AlertOctagon, accentColor: "text-rose-600 bg-rose-50 border-rose-200" },
];

// ─────────────────────────────────────────────
// SECTION CONTENT COMPONENTS
// ─────────────────────────────────────────────
function SectionOverview() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[
        { label: "Product Name", value: "VitaBoost Pro" },
        { label: "Category", value: "Energy Drinks" },
        { label: "Target Persona", value: "Fitness Millennial" },
        { label: "Price Tier", value: "Mid-Premium" },
      ].map(item => (
        <div key={item.label} className="bg-brand-light rounded-xl p-4">
          <span className="block text-xs text-brand-muted font-semibold uppercase tracking-widest mb-1">{item.label}</span>
          <span className="font-bold text-brand-black">{item.value}</span>
        </div>
      ))}
    </div>
  );
}

function SectionFailures() {
  const items = [
    { name: "High Protein Enriched Snack", reason: "claim_not_believed", lesson: "Consumers distrusted the claim without texture reformulation." },
    { name: "Premium Vegan Energy Bite",   reason: "price_value_disconnect", lesson: "No clinical proof at ultra-premium tier." },
    { name: "Natural Focus Bar",           reason: "brand_permission_gap", lesson: "Zero brand equity in cognitive health." },
  ];
  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className="flex items-start gap-3 p-3 bg-red-50 border border-red-100 rounded-lg">
          <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-sm text-brand-black">{item.name}</p>
            <p className="text-xs text-red-600 font-semibold mt-0.5">#{item.reason}</p>
            <p className="text-xs text-brand-muted mt-0.5">{item.lesson}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function SectionValueProps() {
  const vps = [
    { rank: 1, name: "Clean-Energy Hydration Solution",  fos: 86, ws: "True Whitespace",    color: "emerald" },
    { rank: 2, name: "Science-Backed Recovery Refueling", fos: 74, ws: "Conditional",        color: "amber" },
    { rank: 3, name: "High Protein Immunity Booster",     fos: 38, ws: "Contested",           color: "red" },
  ];
  const colorMap: Record<string, string> = {
    emerald: "bg-emerald-50 border-emerald-200 text-emerald-700",
    amber:   "bg-amber-50 border-amber-200 text-amber-700",
    red:     "bg-red-50 border-red-200 text-red-600",
  };
  return (
    <div className="space-y-3">
      {vps.map(vp => (
        <div key={vp.rank} className={`flex items-center gap-3 p-3 rounded-xl border ${colorMap[vp.color]}`}>
          <div className="w-8 h-8 rounded-full bg-white/60 font-black text-sm flex items-center justify-center shrink-0 shadow-sm">
            #{vp.rank}
          </div>
          <div className="flex-grow">
            <p className="font-bold text-sm">{vp.name}</p>
            <p className="text-[10px] font-semibold uppercase tracking-wider opacity-70 mt-0.5">{vp.ws}</p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black">{vp.fos}</span>
            <span className="block text-[9px] font-bold uppercase tracking-widest opacity-60">FOS</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function SectionAvoid() {
  const claims = [
    { claim: "High Protein + Immunity",    reason: "TierCDS 75 — Highly Saturated at Mid tier",     flag: "TierCDS" },
    { claim: "Exotic Superfoods",          reason: "BPS 20 — Brand has zero permission in this space", flag: "BPS" },
    { claim: "Carbon-Neutral Packaging",   reason: "BPS 18 — Greenwashing risk; no brand equity",    flag: "BPS" },
  ];
  const flagColors: Record<string, string> = {
    TierCDS: "bg-orange-100 text-orange-700",
    CRS: "bg-red-100 text-red-700",
    BPS: "bg-rose-100 text-rose-700",
  };
  return (
    <div className="space-y-3">
      {claims.map((item, i) => (
        <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
          <ShieldAlert className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
          <div className="flex-grow">
            <div className="flex items-center gap-2 mb-1">
              <p className="font-bold text-sm text-brand-black">{item.claim}</p>
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide ${flagColors[item.flag]}`}>{item.flag}</span>
            </div>
            <p className="text-xs text-brand-muted">{item.reason}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function SectionClaimTerritory() {
  const claims = [
    { name: "Clean-Energy Hydration", market: 88, consumer: 78, brand: 82, inZone: true },
    { name: "Recovery Refueling",     market: 72, consumer: 81, brand: 60, inZone: true },
    { name: "High Protein Immunity",  market: 25, consumer: 36, brand: 35, inZone: false },
  ];
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-4 gap-2 text-[10px] font-bold uppercase tracking-widest text-brand-muted pb-2 border-b border-gray-100">
        <span>Claim</span><span className="text-center">Market</span><span className="text-center">Consumer</span><span className="text-center">Brand</span>
      </div>
      {claims.map((c, i) => (
        <div key={i} className={`grid grid-cols-4 gap-2 items-center p-2.5 rounded-lg ${c.inZone ? "bg-emerald-50 border border-emerald-100" : "bg-gray-50 border border-gray-100 opacity-70"}`}>
          <div>
            <p className="text-xs font-bold text-brand-black leading-tight">{c.name}</p>
            <span className={`text-[9px] font-bold ${c.inZone ? "text-emerald-600" : "text-red-500"}`}>{c.inZone ? "✓ In Zone" : "✗ Outside"}</span>
          </div>
          {[c.market, c.consumer, c.brand].map((v, j) => (
            <div key={j} className="text-center">
              <span className={`font-black text-sm ${v >= 55 ? "text-emerald-600" : "text-red-500"}`}>{v}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function SectionTrendWindow() {
  const items = [
    { claim: "Clean-Energy Hydration", months: 11, urgency: "high" },
    { claim: "Recovery Refueling",     months: 7,  urgency: "medium" },
    { claim: "High Protein Immunity",  months: 2,  urgency: "critical" },
  ];
  const urgencyConfig: Record<string, { color: string; label: string }> = {
    high: { color: "text-emerald-600 bg-emerald-50 border-emerald-200", label: "Act within 6 months" },
    medium: { color: "text-amber-600 bg-amber-50 border-amber-200", label: "Act within 3 months" },
    critical: { color: "text-red-600 bg-red-50 border-red-200", label: "Window nearly closed" },
  };
  return (
    <div className="space-y-3">
      {items.map((item, i) => {
        const cfg = urgencyConfig[item.urgency];
        return (
          <div key={i} className={`flex items-center justify-between p-3 rounded-xl border ${cfg.color}`}>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 shrink-0" />
              <div>
                <p className="font-bold text-sm">{item.claim}</p>
                <p className="text-[10px] font-semibold opacity-70">{cfg.label}</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black">{item.months}</span>
              <span className="block text-[9px] font-bold uppercase opacity-60">months</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function SectionCompetitive() {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total Competitors Scanned",     value: "47",   color: "text-primary-600" },
          { label: "True Whitespace Opportunities", value: "6",    color: "text-emerald-600" },
          { label: "Contested Zones Identified",    value: "12",   color: "text-red-600" },
        ].map(s => (
          <div key={s.label} className="bg-brand-light rounded-xl p-4 text-center">
            <span className={`text-3xl font-black ${s.color} block mb-1`}>{s.value}</span>
            <span className="text-[10px] font-semibold text-brand-muted uppercase tracking-wider">{s.label}</span>
          </div>
        ))}
      </div>
      <div className="p-4 bg-brand-light rounded-xl border border-gray-200">
        <p className="text-sm text-brand-body leading-relaxed">
          Market analysis covers <strong>47 active SKUs</strong> across 8 sub-categories at the Mid-Premium price tier. The <strong>Clean-Energy Hydration</strong> territory shows the highest growth velocity (+400% YoY) with only 3 direct competitors — all positioned at the Ultra-Premium tier, leaving Mid-Premium fully open.
        </p>
      </div>
    </div>
  );
}

function SectionRiskFlags() {
  const flags = [
    { type: "TierCDS", claim: "High Protein Immunity", value: 75, threshold: 60, severity: "critical" },
    { type: "CRS",     claim: "High Protein Immunity", value: 36, threshold: 40, severity: "high" },
    { type: "BPS",     claim: "High Protein Immunity", value: 35, threshold: 40, severity: "high" },
    { type: "BPS",     claim: "Carbon-Neutral Pack",   value: 18, threshold: 40, severity: "critical" },
  ];
  const severityColor: Record<string, string> = {
    critical: "bg-red-50 border-red-200 text-red-700",
    high:     "bg-orange-50 border-orange-200 text-orange-700",
  };
  return (
    <div className="space-y-2">
      {flags.map((flag, i) => (
        <div key={i} className={`flex items-start gap-3 p-3 rounded-lg border ${severityColor[flag.severity]}`}>
          <AlertOctagon className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="font-bold text-sm">{flag.type}</span>
              <span className="text-[9px] font-bold uppercase bg-white/50 px-1.5 py-0.5 rounded">{flag.severity.toUpperCase()}</span>
            </div>
            <p className="text-xs opacity-80">
              <span className="font-semibold">{flag.claim}</span> — scored {flag.value}, threshold is {flag.threshold}.
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

const SECTION_CONTENT: Record<string, React.ComponentType> = {
  overview:        SectionOverview,
  failures:        SectionFailures,
  value_props:     SectionValueProps,
  avoid:           SectionAvoid,
  claim_territory: SectionClaimTerritory,
  trend_window:    SectionTrendWindow,
  competitive:     SectionCompetitive,
  risk_flags:      SectionRiskFlags,
};

// ─────────────────────────────────────────────
// EXPORT MODAL
// ─────────────────────────────────────────────
function ExportModal({ onClose }: { onClose: () => void }) {
  const [exporting, setExporting] = useState<"pdf" | "docx" | null>(null);
  const [done, setDone] = useState<"pdf" | "docx" | null>(null);

  const handleExport = (type: "pdf" | "docx") => {
    setExporting(type);
    setTimeout(() => {
      setExporting(null);
      setDone(type);
    }, 2000);
  };

  return (
    <motion.div
      className="fixed inset-0 bg-brand-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-50 text-primary-600 mb-4">
            <FileDown className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-brand-black">Export Brand Brief</h2>
          <p className="text-brand-muted mt-2 text-sm">Download link is valid for <strong>15 minutes</strong> via a signed S3 URL.</p>
        </div>

        <div className="space-y-3">
          {/* PDF */}
          <button
            onClick={() => handleExport("pdf")}
            disabled={!!exporting}
            className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-primary-600 bg-primary-50 hover:bg-primary-100 transition-all group"
          >
            <div className="w-10 h-10 rounded-lg bg-primary-600 text-white flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <FileDown className="w-5 h-5" />
            </div>
            <div className="text-left flex-grow">
              <p className="font-bold text-brand-black">Download PDF</p>
              <p className="text-xs text-brand-muted">Primary format — print-ready, fully branded</p>
            </div>
            {done === "pdf" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            ) : exporting === "pdf" ? (
              <div className="w-5 h-5 border-2 border-primary-300 border-t-primary-600 rounded-full animate-spin" />
            ) : (
              <Download className="w-5 h-5 text-primary-600" />
            )}
          </button>

          {/* DOCX */}
          <button
            onClick={() => handleExport("docx")}
            disabled={!!exporting}
            className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-gray-200 bg-gray-50 hover:bg-gray-100 transition-all group"
          >
            <div className="w-10 h-10 rounded-lg bg-gray-200 text-gray-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
            <div className="text-left flex-grow">
              <p className="font-bold text-brand-black">Download DOCX</p>
              <p className="text-xs text-brand-muted">Secondary format — editable in Microsoft Word</p>
            </div>
            {done === "docx" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            ) : exporting === "docx" ? (
              <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
            ) : (
              <Download className="w-5 h-5 text-gray-500" />
            )}
          </button>
        </div>

        <button onClick={onClose} className="w-full mt-6 text-sm text-brand-muted hover:text-brand-black transition-colors font-medium">
          Cancel
        </button>
      </motion.div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────
export default function BrandBrief() {
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(["value_props"]));
  const [showExport, setShowExport] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  if (showPreview) {
    return (
      <div className="fixed inset-0 z-[100] bg-[#0C0A18] overflow-y-auto w-full h-full">
        <div className="fixed top-8 right-8 z-[200]">
          <button 
            onClick={() => setShowPreview(false)}
            className="px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-full text-sm font-bold shadow-lg transition-all"
          >
            ✕ Close Print Preview
          </button>
        </div>
        <DesignBrandBriefPreview />
      </div>
    );
  }

  const toggle = (id: string) => {
    setOpenSections(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div className="min-h-[calc(100vh-70px)] bg-[#F8F4FF] p-4 md:p-8 pb-32 font-sans selection:bg-[#8B4CFF] selection:text-white relative overflow-hidden">
      {/* ── Dynamic Background Grid ── */}
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
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#8B4CFF]/10 blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full bg-[#10B981]/10 blur-[120px] pointer-events-none z-0" />

      <motion.div 
        className="max-w-5xl mx-auto space-y-8 relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Navigation Tabs */}
        <div className="flex border-b border-[#E8DFF5] overflow-x-auto hide-scrollbar">
          <Link to="/value-props" className="px-6 py-4 font-bold text-[#7D7098] hover:text-[#8B4CFF] transition-colors whitespace-nowrap text-[16px]">Value Propositions</Link>
          <Link to="/competitive-map" className="px-6 py-4 font-bold text-[#7D7098] hover:text-[#8B4CFF] transition-colors whitespace-nowrap text-[16px]">Competitive Map</Link>
          <Link to="/whitespace-grid" className="px-6 py-4 font-bold text-[#7D7098] hover:text-[#8B4CFF] transition-colors whitespace-nowrap text-[16px]">Whitespace Grid</Link>
          <Link to="/authentic-claim" className="px-6 py-4 font-bold text-[#7D7098] hover:text-[#8B4CFF] transition-colors whitespace-nowrap text-[16px]">Authentic Claim Territory</Link>
          <div className="relative px-6 py-4 font-bold text-[#8B4CFF] whitespace-nowrap text-[16px]">
            Brand Brief
            <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-6 right-6 h-[4px] bg-[#8B4CFF] rounded-t-[4px]" />
          </div>
        </div>

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="inline-flex items-center gap-2 mb-3">
              <Badge variant="outline" className="bg-white/50 backdrop-blur-sm border-[#8B4CFF]/30 text-[#8B4CFF] px-3 py-1 font-bold">FR-16</Badge>
              <span className="text-[13px] font-bold text-[#7D7098] uppercase tracking-[0.15em]">In-App Preview</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-[#1E1B4B] tracking-tight mb-3">Brand Brief</h1>
            <p className="text-[#645C8F] text-lg max-w-3xl leading-relaxed">Complete strategic output — 8 sections covering everything your team needs to launch.</p>
          </div>
          <div className="flex gap-3 shrink-0">
            <Button size="lg" className="bg-transparent border-2 border-primary-200 text-primary-700 hover:bg-primary-50 gap-2" onClick={() => setShowExport(true)}>
              <FileDown className="w-5 h-5" />
              Export Brief
            </Button>
            <Button size="lg" className="gap-2 shadow-lg bg-gradient-to-r from-[#8B4CFF] to-[#6D28D9] text-white border-none" onClick={() => setShowPreview(true)}>
              <Eye className="w-5 h-5" />
              Generate PDF (Preview)
            </Button>
          </div>
        </div>

        {/* Cover Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="relative bg-gradient-to-br from-primary-700 via-primary-800 to-primary-900 rounded-2xl p-8 text-white overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent-500/10 rounded-full translate-y-24 -translate-x-24 blur-3xl" />
            <div className="relative z-10">
              <p className="text-primary-200 text-xs font-bold uppercase tracking-[0.2em] mb-3">Ai Palette — ValueForge™</p>
              <h2 className="text-3xl font-black mb-2">Brand Intelligence Brief</h2>
              <p className="text-primary-200 mb-6">VitaBoost Pro · Energy Drinks · Fitness Millennial · Mid-Premium</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "FOS Leader", value: "86" },
                  { label: "Whitespace Opps", value: "6" },
                  { label: "Risk Flags", value: "4" },
                  { label: "First Mover", value: "11mo" },
                ].map(s => (
                  <div key={s.label} className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                    <span className="block text-2xl font-black text-white">{s.value}</span>
                    <span className="block text-[10px] text-primary-200 font-semibold uppercase tracking-wider mt-0.5">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Accordion Sections */}
        <div className="space-y-3">
          {SECTIONS.map((section, idx) => {
            const isOpen = openSections.has(section.id);
            const ContentComponent = SECTION_CONTENT[section.id];
            const Icon = section.icon;

            return (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + idx * 0.05 }}
              >
                <Card className="overflow-hidden hover:scale-100">
                  {/* Section Header (clickable) */}
                  <button
                    onClick={() => toggle(section.id)}
                    className="w-full flex items-center gap-4 p-5 text-left hover:bg-brand-light/50 transition-colors"
                  >
                    <div className={`p-2.5 rounded-xl border ${section.accentColor} shrink-0`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-grow">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-brand-muted uppercase tracking-widest">{section.number}</span>
                        <h3 className="font-bold text-brand-black">{section.title}</h3>
                      </div>
                    </div>
                    <div className="shrink-0 text-brand-muted">
                      {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                  </button>

                  {/* Section Content (animated expand) */}
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-5 border-t border-brand-light">
                          <div className="pt-4">
                            <ContentComponent />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom Export CTA */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="text-center">
          <p className="text-sm text-brand-muted mb-4">Download link valid for <span className="font-bold text-brand-black">15 minutes</span> · Signed S3 URL</p>
          <div className="flex gap-3 justify-center">
            <Button size="lg" className="gap-2" onClick={() => setShowExport(true)}>
              <FileDown className="w-4 h-4" /> Download PDF
            </Button>
            <Button size="lg" variant="secondary" className="gap-2" onClick={() => setShowExport(true)}>
              <FileText className="w-4 h-4" /> Download DOCX
            </Button>
          </div>
        </motion.div>
      </motion.div>

      {/* Export Modal */}
      <AnimatePresence>
        {showExport && <ExportModal onClose={() => setShowExport(false)} />}
      </AnimatePresence>
    </div>
  );
}
