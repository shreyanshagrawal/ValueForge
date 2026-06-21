import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  TierCDS: { label: "Tier CDS", desc: "Category saturation in selected tier", threshold: "> 60", direction: "high", color: "#7C3AED" },
  CRS: { label: "CRS", desc: "Consumer Relevance Score", threshold: "< 40", direction: "low", color: "#7C3AED" },
  BPS: { label: "BPS", desc: "Brand Permission Score", threshold: "< 40", direction: "low", color: "#EF4444" },
};

const Pill = ({ tone = "neutral", children, ...rest }) => {
  const tones = {
    neutral: "bg-surface/40 text-body border border-line",
    danger: "bg-red-500/10 text-red-700 border border-red-500/20",
    warn: "bg-brand/10 text-brand border border-brand/20",
    ok: "bg-teal-500/10 text-teal-600 border border-teal/20",
    brand: "bg-brand/10 text-brand border border-brand/20",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] px-2.5 py-1 rounded-full ${tones[tone]}`} {...rest}>
      {children}
    </span>
  );
};

const DimBar = ({ name, value, failed }) => {
  const meta = dimMeta[name];
  const pct = Math.max(0, Math.min(100, value));
  const isLowMetric = meta.direction === "low";
  return (
    <div className="flex flex-col gap-1.5" data-testid={`dim-${name}`}>
      <div className="flex items-center justify-between">
        <span className={`text-[11.5px] font-bold uppercase tracking-[0.12em] ${failed ? "text-accent-red" : "text-mute"}`}>{meta.label}</span>
        <span className={`text-[12px] tabular-nums font-bold ${failed ? "text-accent-red" : "text-ink"}`}>{value}</span>
      </div>
      <div className="relative h-1.5 rounded-full bg-line overflow-hidden">
        <div className="absolute inset-y-0 left-0 rounded-full"
          style={{
            width: `${pct}%`,
            background: failed
              ? "linear-gradient(90deg,#EF4444,#7C3AED)"
              : "linear-gradient(90deg,#7C3AED,#10B981)",
          }}
        />
        <div className="absolute top-1/2 -translate-y-1/2 w-px h-3 bg-ink/40"
          style={{ left: `${isLowMetric ? 40 : 60}%` }} title={`Threshold ${meta.threshold}`} />
      </div>
      <span className="text-[10px] text-mute">Threshold: <b className="text-ink">{meta.threshold}</b> · {meta.desc}</span>
    </div>
  );
};

const ClaimCard = ({ c, expanded, onToggle }) => {
  const flagged = c.triggers.length > 0;
  return (
    <div
      data-testid={`claim-card-${c.id}`}
      className={`rounded-2xl border bg-surface backdrop-blur-[16px] transition-all overflow-hidden
        ${flagged ? "border-red-500/20 shadow-[0_18px_46px_-22px_rgba(239,68,68,0.08)]" : "border-line"}
        ${expanded ? "ring-1 ring-brand/20" : ""}
      `}
    >
      {flagged && (
        <div className="h-1 w-full bg-gradient-to-r from-accent-red via-brand to-accent-red progress-stripes" />
      )}
      <button
        onClick={onToggle}
        className="w-full text-left p-6 sm:p-7 flex flex-col sm:flex-row sm:items-start sm:gap-6 gap-4"
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
          <h3 className={`mt-3 text-[20px] sm:text-[22px] font-bold leading-snug ${flagged ? "text-ink" : "text-ink/90"}`}>
            “{c.text}”
          </h3>
        </div>
        <div className="flex sm:flex-col items-center sm:items-end gap-3 sm:gap-1 sm:min-w-[140px]">
          <ChevronDown size={18} className={`text-mute transition-transform ${expanded ? "rotate-180" : ""}`} />
        </div>
      </button>
      <div
        className={`grid transition-all duration-300 ease-out ${expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
      >
        <div className="overflow-hidden">
          <div className="px-6 sm:px-7 pb-7 border-t border-line/60 pt-6 grid lg:grid-cols-[1.05fr_0.95fr] gap-7">
            <div className="space-y-5">
              <DimBar name="TierCDS" value={c.tierCDS} failed={c.triggers.includes("TierCDS")} />
              <DimBar name="CRS" value={c.crs} failed={c.triggers.includes("CRS")} />
              <DimBar name="BPS" value={c.bps} failed={c.triggers.includes("BPS")} />
            </div>
            <div className="space-y-4">
              {flagged ? (
                <div className="rounded-xl bg-red-500/5 border border-red-500/15 p-4">
                  <div className="overline" style={{color:'#C53030'}}>Why it was flagged</div>
                  <ul className="mt-1.5 space-y-1.5 list-disc list-inside text-[13.5px] text-red-800/90 leading-relaxed">
                    {c.reasons.map((r) => (
                      <li key={r}>{FLAG_REASON_LABELS[r]}</li>
                    ))}
                  </ul>
                  {c.reason && (
                    <p className="mt-2.5 text-[12.5px] text-red-700/80 border-t border-red-500/10 pt-2">{c.reason}</p>
                  )}
                </div>
              ) : (
                <div className="rounded-xl bg-teal-500/5 border border-teal-500/15 p-4">
                  <div className="overline text-teal-700">Status</div>
                  <p className="text-[13.5px] text-teal-800/90 mt-1.5 leading-relaxed">
                    All three dimensions are within healthy thresholds. Safe to advance to pack-copy review.
                  </p>
                </div>
              )}
              {c.suggested && (
                <div className="rounded-xl border p-4" style={{borderColor:'rgba(16, 185, 129, 0.2)', background:'rgba(16, 185, 129, 0.05)'}}>
                  <div className="flex items-center gap-2">
                    <Sparkles size={14} style={{color:'#059669'}} />
                    <span className="overline" style={{color:'#059669'}}>Suggested replacement · True Whitespace</span>
                  </div>
                  <p className="mt-2 text-[15px] text-ink font-semibold leading-snug">“{c.suggested}”</p>
                  <button className="mt-3 inline-flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-[0.1em]" style={{color:'#059669'}}>
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

const MisalignmentRiskFlags = () => {
  const navigate = useNavigate();
  const [openId, setOpenId] = useState(null);
  const [filter, setFilter] = useState("all"); // all | flagged | safe

  const claimsWithFlags = useMemo(() => {
    return CLAIMS.map((c) => {
      const reasons = getFlagReasons(c);
      const triggers = reasons.map((r) => REASON_TO_DIM[r]);
      return {
        ...c,
        triggers,
        reasons,
      };
    });
  }, []);

  const stats = useMemo(() => {
    const flagged = claimsWithFlags.filter((c) => c.triggers.length > 0).length;
    const tierFails = claimsWithFlags.filter((c) => c.triggers.includes("TierCDS")).length;
    const crsFails = claimsWithFlags.filter((c) => c.triggers.includes("CRS")).length;
    const bpsFails = claimsWithFlags.filter((c) => c.triggers.includes("BPS")).length;
    return { flagged, safe: claimsWithFlags.length - flagged, total: claimsWithFlags.length, tierFails, crsFails, bpsFails };
  }, [claimsWithFlags]);

  const visible = useMemo(() => {
    if (filter === "flagged") return claimsWithFlags.filter((c) => c.triggers.length > 0);
    if (filter === "safe") return claimsWithFlags.filter((c) => c.triggers.length === 0);
    return claimsWithFlags;
  }, [filter, claimsWithFlags]);

  return (
    <section className="max-w-[1280px] mx-auto px-6 lg:px-10 py-14" data-testid="page-risk-flags">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
        <div className="animate-fade-up">
          <span className="overline" style={{color:'#7C3AED'}}>FR-14 · Misalignment Risk Flags</span>
          <h1 className="mt-3 text-4xl sm:text-5xl font-extrabold text-ink leading-[1.05]">
            Show failures{" "}
            <span className="relative inline-block">
              <span className="relative z-10">first.</span>
              <span className="absolute left-0 right-0 bottom-1 h-3 bg-brand/20 -z-0 rounded-sm" />
            </span>
          </h1>
          <p className="mt-4 max-w-[60ch] text-[15px] text-body leading-relaxed">
            We rank every candidate claim against three dimensions — <b>Tier CDS</b>, <b>CRS</b>, and the new <b>Brand Permission Score (BPS)</b>. Anything red is a no-fly zone until you swap or strengthen.
          </p>
        </div>
        {/* legend */}
        <div className="grid grid-cols-3 gap-2 lg:gap-3 animate-fade-up" style={{ animationDelay: '120ms' }} data-testid="risk-stats">
          {[
            { label: "Total Claims", value: stats.total, tone: "bg-surface backdrop-blur-[8px] text-ink border border-line shadow-sm" },
            { label: "Flagged", value: stats.flagged, tone: "bg-red-500/10 text-red-700 border border-red-500/20 shadow-sm" },
            { label: "Aligned", value: stats.safe, tone: "bg-teal-500/10 text-teal-600 border border-teal/20 shadow-sm" },
          ].map((s) => (
            <div key={s.label} className={`rounded-xl px-4 py-3 min-w-[110px] ${s.tone}`}>
              <div className="text-[10px] uppercase tracking-[0.16em] font-semibold opacity-70">{s.label}</div>
              <div className="text-[28px] font-extrabold leading-none mt-1 tabular-nums">{s.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* dimension breakdown */}
      <div className="mt-10 grid sm:grid-cols-3 gap-4">
        {[
          { k: "TierCDS", n: stats.tierFails, color: "#7C3AED", bg: "bg-surface backdrop-blur-[8px]" },
          { k: "CRS", n: stats.crsFails, color: "#7C3AED", bg: "bg-surface backdrop-blur-[8px]" },
          { k: "BPS", n: stats.bpsFails, color: "#EF4444", bg: "bg-surface backdrop-blur-[8px]" },
        ].map((d) => (
          <div key={d.k} className={`rounded-2xl border border-line ${d.bg} p-5 card-hover`}>
            <div className="flex items-center justify-between">
              <div>
                <span className="overline text-mute">{dimMeta[d.k].label}</span>
                <h3 className="mt-1 text-[15px] font-bold text-ink">{dimMeta[d.k].desc}</h3>
              </div>
              <div className="text-[36px] font-extrabold tabular-nums" style={{ color: d.color }}>{d.n}</div>
            </div>
            <p className="mt-2 text-[12.5px] text-body">
              Threshold <b>{dimMeta[d.k].threshold}</b> · {d.k === "BPS" ? "New first-class trigger" : "Standard trigger"}
            </p>
          </div>
        ))}
      </div>

      {/* filter row */}
      <div className="mt-12 flex flex-wrap items-center gap-2 lg:gap-3" data-testid="risk-filter">
        <Filter size={15} className="text-mute" />
        <span className="overline text-mute mr-1">Filter</span>
        {[
          { k: "all", label: "All claims", testId: "filter-all" },
          { k: "flagged", label: "Flagged only", testId: "filter-flagged" },
          { k: "safe", label: "Aligned only", testId: "filter-safe" },
        ].map((f) => (
          <button
            key={f.k}
            onClick={() => setFilter(f.k)}
            data-testid={f.testId}
            className={`px-3.5 py-1.5 rounded-full text-[12px] font-semibold uppercase tracking-[0.08em] transition-all
              ${filter === f.k ? "bg-brand text-tint font-bold" : "bg-surface text-body hover:bg-brand/10 hover:text-brand"}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* claims list */}
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

      <div className="mt-12 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-surface backdrop-blur-[16px] border border-line p-6 lg:p-8 shadow-sm">
        <div>
          <h3 className="text-[22px] font-bold text-ink">{stats.flagged} claims need rework before pack-copy lock.</h3>
          <p className="text-body text-[13.5px] mt-1">
            Continue into the overlap zone to see which claims sit inside the Authentic Claim Territory.
          </p>
        </div>
        <button className="btn-primary" onClick={() => navigate("/claim-territory")} data-testid="next-territory-btn">
          Explore Claim Territory <ArrowRight size={14} />
        </button>
      </div>
    </section>
  );
};

export default MisalignmentRiskFlags;
