import React, { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CLAIMS } from "@/data/mockData";
import { AlertTriangle, ShieldCheck, ChevronDown, ArrowRight, Filter, Sparkles } from "lucide-react";

const FLAG_REASON_LABELS = {
  too_crowded_at_tier: "Market too crowded at this price tier",
  poor_consumer_response: "Consumer response too weak",
  brand_permission_gap: "Brand lacks permission to own this claim",
};

const REASON_TO_DIM = {
  too_crowded_at_tier: "TierCDS",
  poor_consumer_response: "CRS",
  brand_permission_gap: "BPS",
};

function getFlagReasons(claim) {
  const reasons = [];
  if (claim.tierCDS > 60) reasons.push("too_crowded_at_tier");
  if (claim.crs < 40) reasons.push("poor_consumer_response");
  if (claim.bps < 40) reasons.push("brand_permission_gap");
  return reasons;
}

const dimMeta = {
  TierCDS: { label: "Tier CDS", desc: "Category saturation in selected tier", threshold: "> 60", direction: "high" },
  CRS:     { label: "CRS",      desc: "Consumer Relevance Score",              threshold: "< 40", direction: "low"  },
  BPS:     { label: "BPS",      desc: "Brand Permission Score",                threshold: "< 40", direction: "low"  },
};

// ── Pill ──────────────────────────────────────────────────────
const Pill = ({ tone = "neutral", children, ...rest }) => {
  const tones = {
    neutral: "bg-[#8B4CFF]/10 text-[#5B21B6] border border-[#8B4CFF]/20",
    danger:  "bg-red-50 text-red-700 border border-red-200",
    warn:    "bg-amber-50 text-amber-700 border border-amber-200",
    ok:      "bg-emerald-50 text-emerald-700 border border-emerald-200",
    brand:   "bg-[#8B4CFF]/10 text-[#7C3AED] border border-[#8B4CFF]/20",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] px-2.5 py-1 rounded-full ${tones[tone]}`}
      {...rest}
    >
      {children}
    </span>
  );
};

// ── DimBar ────────────────────────────────────────────────────
const DimBar = ({ name, value, failed }) => {
  const meta = dimMeta[name];
  const pct = Math.max(0, Math.min(100, value));
  const isLowMetric = meta.direction === "low";
  return (
    <div className="flex flex-col gap-1.5" data-testid={`dim-${name}`}>
      <div className="flex items-center justify-between">
        <span className={`text-[11.5px] font-bold uppercase tracking-[0.12em] ${failed ? "text-red-600" : "text-[#7D7098]"}`}>
          {meta.label}
        </span>
        <span className={`text-[12px] tabular-nums font-bold ${failed ? "text-red-600" : "text-[#1E1B4B]"}`}>
          {value}
        </span>
      </div>
      <div className="relative h-1.5 rounded-full bg-[#E8DFF5] overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            width: `${pct}%`,
            background: failed
              ? "linear-gradient(90deg,#EF4444,#7C3AED)"
              : "linear-gradient(90deg,#7C3AED,#10B981)",
          }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-px h-3 bg-[#1E1B4B]/30"
          style={{ left: `${isLowMetric ? 40 : 60}%` }}
          title={`Threshold ${meta.threshold}`}
        />
      </div>
      <span className="text-[10px] text-[#7D7098]">
        Threshold: <b className="text-[#1E1B4B]">{meta.threshold}</b> · {meta.desc}
      </span>
    </div>
  );
};

// ── ClaimCard ─────────────────────────────────────────────────
const ClaimCard = ({ c, expanded, onToggle }) => {
  const flagged = c.triggers.length > 0;
  return (
    <div
      data-testid={`claim-card-${c.id}`}
      className={`rounded-2xl border bg-white transition-all overflow-hidden
        ${flagged
          ? "border-red-200 shadow-[0_8px_30px_rgba(239,68,68,0.08)]"
          : "border-[#E8DFF5] shadow-[0_4px_20px_rgba(139,76,255,0.06)]"}
        ${expanded ? "ring-2 ring-[#8B4CFF]/20" : ""}
      `}
    >
      {/* top accent stripe */}
      {flagged && (
        <div className="h-1 w-full bg-gradient-to-r from-red-400 via-[#8B4CFF] to-red-400" />
      )}

      <button
        onClick={onToggle}
        className="w-full text-left p-6 sm:p-7 flex flex-col sm:flex-row sm:items-start sm:gap-6 gap-4 hover:bg-[#F8F4FF]/60 transition-colors"
        data-testid={`claim-toggle-${c.id}`}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            {flagged ? (
              <Pill tone="danger" data-testid={`claim-pill-${c.id}`}>
                <AlertTriangle size={11} /> {c.triggers.length} Risk Flag{c.triggers.length > 1 ? "s" : ""}
              </Pill>
            ) : (
              <Pill tone="ok" data-testid={`claim-pill-${c.id}`}>
                <ShieldCheck size={11} /> Aligned
              </Pill>
            )}
            {flagged && c.triggers.map((t) => (
              <Pill key={t} tone="danger" data-testid={`failed-dim-pill-${t}-${c.id}`}>
                {dimMeta[t].label} failed
              </Pill>
            ))}
          </div>
          <h3 className={`mt-3 text-[20px] sm:text-[22px] font-bold leading-snug ${flagged ? "text-[#1E1B4B]" : "text-[#2D2A5E]"}`}>
            "{c.text}"
          </h3>
        </div>
        <div className="flex sm:flex-col items-center sm:items-end gap-3 sm:gap-1 sm:min-w-[140px]">
          <ChevronDown size={18} className={`text-[#8B4CFF] transition-transform ${expanded ? "rotate-180" : ""}`} />
        </div>
      </button>

      <div className={`grid transition-all duration-300 ease-out ${expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
        <div className="overflow-hidden">
          <div className="px-6 sm:px-7 pb-7 border-t border-[#E8DFF5] pt-6 grid lg:grid-cols-[1.05fr_0.95fr] gap-7">
            <div className="space-y-5">
              <DimBar name="TierCDS" value={c.tierCDS} failed={c.triggers.includes("TierCDS")} />
              <DimBar name="CRS"     value={c.crs}     failed={c.triggers.includes("CRS")}     />
              <DimBar name="BPS"     value={c.bps}     failed={c.triggers.includes("BPS")}     />
            </div>
            <div className="space-y-4">
              {flagged ? (
                <div className="rounded-xl bg-red-50 border border-red-200 p-4">
                  <div className="text-[10px] font-black uppercase tracking-[0.16em] text-red-600 mb-1">Why it was flagged</div>
                  <ul className="mt-1.5 space-y-1.5 list-disc list-inside text-[13.5px] text-red-700 leading-relaxed">
                    {c.reasons.map((r) => (
                      <li key={r}>{FLAG_REASON_LABELS[r]}</li>
                    ))}
                  </ul>
                  {c.reason && (
                    <p className="mt-2.5 text-[12.5px] text-red-600/80 border-t border-red-200 pt-2">{c.reason}</p>
                  )}
                </div>
              ) : (
                <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4">
                  <div className="text-[10px] font-black uppercase tracking-[0.16em] text-emerald-700 mb-1">Status</div>
                  <p className="text-[13.5px] text-emerald-800 mt-1.5 leading-relaxed">
                    All three dimensions are within healthy thresholds. Safe to advance to pack-copy review.
                  </p>
                </div>
              )}
              {c.suggested && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                  <div className="flex items-center gap-2">
                    <Sparkles size={14} className="text-emerald-600" />
                    <span className="text-[10px] font-black uppercase tracking-[0.16em] text-emerald-600">
                      Suggested replacement · True Whitespace
                    </span>
                  </div>
                  <p className="mt-2 text-[15px] text-[#1E1B4B] font-semibold leading-snug">"{c.suggested}"</p>
                  <button className="mt-3 inline-flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-[0.1em] text-emerald-600">
                    Use this claim <ArrowRight size={12} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────
const MisalignmentRiskFlags = () => {
  const navigate = useNavigate();
  const { scanId } = useParams();
  const [openId, setOpenId] = useState(null);
  const [filter, setFilter] = useState("all");

  const claimsWithFlags = useMemo(() => {
    return CLAIMS.map((c) => {
      const reasons  = getFlagReasons(c);
      const triggers = reasons.map((r) => REASON_TO_DIM[r]);
      return { ...c, triggers, reasons };
    });
  }, []);

  const stats = useMemo(() => {
    const flagged   = claimsWithFlags.filter((c) => c.triggers.length > 0).length;
    const tierFails = claimsWithFlags.filter((c) => c.triggers.includes("TierCDS")).length;
    const crsFails  = claimsWithFlags.filter((c) => c.triggers.includes("CRS")).length;
    const bpsFails  = claimsWithFlags.filter((c) => c.triggers.includes("BPS")).length;
    return { flagged, safe: claimsWithFlags.length - flagged, total: claimsWithFlags.length, tierFails, crsFails, bpsFails };
  }, [claimsWithFlags]);

  const visible = useMemo(() => {
    if (filter === "flagged") return claimsWithFlags.filter((c) => c.triggers.length > 0);
    if (filter === "safe")    return claimsWithFlags.filter((c) => c.triggers.length === 0);
    return claimsWithFlags;
  }, [filter, claimsWithFlags]);

  return (
    <section
      className="w-full min-h-screen p-6 pt-16 pb-24 overflow-x-hidden relative"
      style={{ background: "#F8F4FF", fontFamily: "'Mulish', sans-serif" }}
      data-testid="page-risk-flags"
    >
      {/* Background grid — purple lines on white, matching Whitespace Grid */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(139,76,255,0.08) 1px, transparent 1px)," +
            "linear-gradient(90deg, rgba(139,76,255,0.08) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      {/* Subtle ambient glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#8B4CFF]/10 blur-[140px] pointer-events-none z-0" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full bg-[#10B981]/08 blur-[120px] pointer-events-none z-0" />

      {/* ── Content ── */}
      <div className="relative z-10 max-w-[1280px] mx-auto">

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 animate-fade-up">
          <div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-[#1E1B4B] leading-[1.05]">
              Show failures{" "}
              <span className="relative inline-block">
                <span className="relative z-10 text-[#8B4CFF]">first.</span>
                <span className="absolute left-0 right-0 bottom-1 h-3 bg-[#8B4CFF]/15 -z-0 rounded-sm" />
              </span>
            </h1>
            <p className="mt-4 max-w-[60ch] text-[15px] text-[#645C8F] leading-relaxed">
              We rank every candidate claim against three dimensions —{" "}
              <b className="text-[#1E1B4B]">Tier CDS</b>,{" "}
              <b className="text-[#1E1B4B]">CRS</b>, and the new{" "}
              <b className="text-[#1E1B4B]">Brand Permission Score (BPS)</b>.
              Anything red is a no-fly zone until you swap or strengthen.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 lg:gap-3 animate-fade-up" style={{ animationDelay: "120ms" }} data-testid="risk-stats">
            {[
              { label: "Total Claims", value: stats.total,   cls: "bg-white border border-[#E8DFF5] text-[#1E1B4B] shadow-sm"         },
              { label: "Flagged",      value: stats.flagged, cls: "bg-red-50 border border-red-200 text-red-700 shadow-sm"             },
              { label: "Aligned",      value: stats.safe,    cls: "bg-emerald-50 border border-emerald-200 text-emerald-700 shadow-sm" },
            ].map((s) => (
              <div key={s.label} className={`rounded-xl px-4 py-3 min-w-[100px] ${s.cls}`}>
                <div className="text-[10px] uppercase tracking-[0.16em] font-semibold opacity-60">{s.label}</div>
                <div className="text-[28px] font-extrabold leading-none mt-1 tabular-nums">{s.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Dimension Breakdown */}
        <div className="mt-10 grid sm:grid-cols-3 gap-4">
          {[
            { k: "TierCDS", n: stats.tierFails, color: "#7C3AED" },
            { k: "CRS",     n: stats.crsFails,  color: "#7C3AED" },
            { k: "BPS",     n: stats.bpsFails,  color: "#EF4444" },
          ].map((d) => (
            <div key={d.k} className="rounded-2xl border border-[#E8DFF5] bg-white shadow-sm p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-[0.16em] text-[#7D7098]">{dimMeta[d.k].label}</span>
                  <h3 className="mt-1 text-[15px] font-bold text-[#1E1B4B]">{dimMeta[d.k].desc}</h3>
                </div>
                <div className="text-[36px] font-extrabold tabular-nums" style={{ color: d.color }}>{d.n}</div>
              </div>
              <p className="mt-2 text-[12.5px] text-[#7D7098]">
                Threshold <b className="text-[#1E1B4B]">{dimMeta[d.k].threshold}</b> · {d.k === "BPS" ? "New first-class trigger" : "Standard trigger"}
              </p>
            </div>
          ))}
        </div>

        {/* Filter Row */}
        <div className="mt-12 flex flex-wrap items-center gap-2 lg:gap-3" data-testid="risk-filter">
          <Filter size={15} className="text-[#8B4CFF]" />
          <span className="text-[10px] font-black uppercase tracking-[0.16em] text-[#7D7098] mr-1">Filter</span>
          {[
            { k: "all",     label: "All Claims",   testId: "filter-all"     },
            { k: "flagged", label: "Flagged Only",  testId: "filter-flagged" },
            { k: "safe",    label: "Aligned Only",  testId: "filter-safe"    },
          ].map((f) => (
            <button
              key={f.k}
              onClick={() => setFilter(f.k)}
              data-testid={f.testId}
              className={`px-4 py-1.5 rounded-full text-[12px] font-bold uppercase tracking-[0.08em] transition-all border
                ${filter === f.k
                  ? "bg-[#8B4CFF] text-white border-[#8B4CFF] shadow-sm"
                  : "bg-white text-[#7D7098] border-[#E8DFF5] hover:border-[#8B4CFF]/40 hover:text-[#8B4CFF]"
                }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Claims List */}
        <div className="mt-6 space-y-4">
          {visible.map((c, i) => (
            <div key={c.id} className="animate-fade-up" style={{ animationDelay: `${i * 60}ms` }}>
              <ClaimCard
                c={c}
                expanded={openId === c.id}
                onToggle={() => setOpenId(openId === c.id ? null : c.id)}
              />
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white border border-[#E8DFF5] p-6 lg:p-8 shadow-sm">
          <div>
            <h3 className="text-[22px] font-bold text-[#1E1B4B]">
              {stats.flagged} claims need rework before pack-copy lock.
            </h3>
            <p className="text-[#645C8F] text-[13.5px] mt-1">
              Continue into the overlap zone to see which claims sit inside the Authentic Claim Territory.
            </p>
          </div>
          <button
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#8B4CFF] hover:bg-[#7C3AED] text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
            onClick={() => navigate(`/scan/${scanId || "demo"}/grid`)}
            data-testid="next-territory-btn"
          >
            Explore Claim Territory <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </section>
  );
};

export default MisalignmentRiskFlags;
