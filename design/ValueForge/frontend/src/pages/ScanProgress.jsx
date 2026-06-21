import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SCAN_STAGES, SCAN_TELEMETRY, PROJECT } from "@/data/mockData";
import { Sparkles, Cpu, Database, Gauge, CheckCircle2, ArrowRight, RotateCw } from "lucide-react";

const STAGE_ICONS = {
  pending: Sparkles,
  scanning: Database,
  ai_processing: Cpu,
  scoring: Gauge,
  complete: CheckCircle2,
};

const useCountUp = (target, durationMs = 1600, start = false) => {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!start) return;
    const t0 = performance.now();
    let raf;
    const step = (t) => {
      const p = Math.min(1, (t - t0) / durationMs);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    let active = true;
    const startRaf = (t) => {
      if (active) step(t);
    };
    raf = requestAnimationFrame(startRaf);
    return () => {
      active = false;
      cancelAnimationFrame(raf);
    };
  }, [target, durationMs, start]);
  return val;
};

const fmt = (n) => n.toLocaleString();

const STAGE_LABELS = {
  pending: "Queued — waiting to start scan",
  scanning: "Scanning market & competitive data",
  scoring: "Computing Tier-CDS, CRS & BPS scores",
  ai_processing: "Generating AI recommendations",
  complete: "Scan complete",
  failed: "Scan failed",
};

const STATUS_TO_INDEX = {
  pending: 0,
  scanning: 1,
  scoring: 2,
  ai_processing: 3,
  complete: 4,
  failed: 4,
};

const ScanProgress = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState("pending");
  const [stageProgress, setStageProgress] = useState(0); // 0..1 inside current stage
  const [done, setDone] = useState(false);
  const [scanTrigger, setScanTrigger] = useState(0);

  const stageIdx = STATUS_TO_INDEX[status] || 0;
  const currentStage = SCAN_STAGES[stageIdx];

  const overall = useMemo(() => {
    if (status === "complete" || status === "failed") return 100;
    return Math.min(100, Math.round(stageIdx * 25 + stageProgress * 25));
  }, [stageIdx, stageProgress, status]);

  // Polling with fallback simulation
  useEffect(() => {
    let currentStatus = "pending";
    const STAGE_ORDER = ["pending", "scanning", "scoring", "ai_processing", "complete"];

    const intervalId = setInterval(async () => {
      try {
        const res = await fetch(`/api/v1/scans/${PROJECT.scanId}`);
        if (!res.ok) {
          throw new Error("HTTP error " + res.status);
        }
        const data = await res.json();
        const nextStatus = data.status || "pending";
        setStatus(nextStatus);
        currentStatus = nextStatus;

        if (nextStatus === "complete" || nextStatus === "failed") {
          clearInterval(intervalId);
          setDone(true);
        }
      } catch (err) {
        // Fallback simulation: advance to next stage in STAGE_ORDER every 3 seconds
        const currIdx = STAGE_ORDER.indexOf(currentStatus);
        if (currIdx !== -1 && currIdx < STAGE_ORDER.length - 1) {
          const nextStatus = STAGE_ORDER[currIdx + 1];
          setStatus(nextStatus);
          currentStatus = nextStatus;
          if (nextStatus === "complete") {
            clearInterval(intervalId);
            setDone(true);
          }
        } else {
          clearInterval(intervalId);
          setDone(true);
        }
      }
    }, 3000); // Polling interval exactly 3000ms

    return () => {
      clearInterval(intervalId);
    };
  }, [scanTrigger]);

  // Smooth sub-progress bar animation
  useEffect(() => {
    if (status === "complete" || status === "failed") {
      setStageProgress(1);
      return;
    }

    setStageProgress(0);
    const start = performance.now();
    const duration = 3000; // 3 seconds per stage
    let rafId;

    const animate = (time) => {
      const elapsed = time - start;
      const progress = Math.min(1, elapsed / duration);
      setStageProgress(progress);
      if (progress < 1) {
        rafId = requestAnimationFrame(animate);
      }
    };

    rafId = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(rafId);
    };
  }, [status]);

  const restart = () => {
    setStatus("pending");
    setStageProgress(0);
    setDone(false);
    setScanTrigger((t) => t + 1);
  };

  return (
    <section className="relative" data-testid="page-scan-progress">
      <div className="relative max-w-[1280px] mx-auto px-6 lg:px-10 pt-14 pb-20">
        <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-10 items-start">
          {/* LEFT — progress */}
          <div className="animate-fade-up">
            <span className="overline" style={{ color: '#7C3AED' }}>FR-02 · Scan Pipeline</span>
            <h1 className="mt-3 text-4xl sm:text-5xl lg:text-[56px] font-extrabold leading-[1.05] text-ink">
              Forging your{" "}
              <span className="shimmer-text">authentic territory</span>
            </h1>
            <p className="mt-5 text-[15px] text-body leading-relaxed max-w-[58ch]">
              Arya is scanning {PROJECT.region.toLowerCase()} CPG signals, replaying 500+ failed launches against your concept, and computing CDS · CRS · BPS for every candidate claim. Sit tight — this usually wraps in under 45 seconds.
            </p>
            {/* meta row */}
            <div className="mt-6 flex flex-wrap gap-2 text-[12px]">
              <span className="px-3 py-1.5 rounded-full font-semibold tracking-wide" style={{ background: 'rgba(124, 58, 237, 0.08)', color: '#7C3AED', border: '1px solid rgba(124, 58, 237, 0.15)' }} data-testid="meta-scan-id">
                Scan {PROJECT.scanId}
              </span>
              <span className="px-3 py-1.5 rounded-full bg-surface/40 text-body font-semibold border border-line">{PROJECT.brand} · {PROJECT.product}</span>
              <span className="px-3 py-1.5 rounded-full bg-surface/40 text-body font-semibold border border-line">{PROJECT.targetTier} tier</span>
            </div>
            {/* Progress card */}
            <div className="mt-10 bg-surface backdrop-blur-[16px] rounded-2xl border border-line shadow-[0_30px_60px_-30px_rgba(124,58,237,0.06)] p-7 lg:p-9">
              <div className="flex items-end justify-between">
                <div>
                  <div className="overline text-mute">Overall progress</div>
                  <div className="mt-1 text-[44px] font-extrabold text-ink leading-none tabular-nums" data-testid="overall-progress">
                    {overall}<span style={{ color: '#7C3AED' }}>%</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="overline text-mute">Current stage</div>
                  <div className="mt-1 text-[15px] font-bold text-ink uppercase tracking-[0.06em]" data-testid="current-stage-label">
                    {STAGE_LABELS[status] || currentStage.label}
                  </div>
                </div>
              </div>
              {/* big bar */}
              <div className="mt-5 h-3 rounded-full overflow-hidden relative" style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)' }} data-testid="overall-progress-bar">
                <div
                  className={`h-full rounded-full transition-[width] duration-300 ${done ? "" : "progress-stripes"}`}
                  style={{
                    width: `${overall}%`,
                    background: "#10B981",
                  }}
                />
                {!done && (
                  <span
                    className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white shadow-[0_0_0_4px_rgba(16, 185, 129, 0.4)] transition-[left] duration-300"
                    style={{ left: `calc(${overall}% - 8px)` }}
                  />
                )}
              </div>
              {/* stage rail */}
              <div className="mt-8 space-y-3" data-testid="stage-list">
                {SCAN_STAGES.map((s, i) => {
                  const Icon = STAGE_ICONS[s.key] || Sparkles;
                  const state = i < stageIdx ? "done" : i === stageIdx ? "active" : "pending";
                  return (
                    <div key={s.key}
                      data-testid={`stage-row-${s.key}`}
                      className={`flex items-start gap-4 p-4 rounded-xl border transition-all
                        ${state === "active" ? "border-brand bg-white/40" : ""}
                        ${state === "done" ? "border-line bg-white/20" : ""}
                        ${state === "pending" ? "border-line/40 bg-white/5 opacity-50" : ""}`}
                      style={state === "active" ? { borderColor: '#7C3AED', background: 'rgba(124, 58, 237, 0.05)', backdropFilter: 'blur(8px)' } : {}}
                    >
                      <div className={`relative w-10 h-10 rounded-lg flex items-center justify-center shrink-0`}
                        style={state === "active" ? { background: '#7C3AED', color: '#FFFFFF' } : state === "done" ? { background: 'rgba(16, 185, 129, 0.12)', color: '#10B981' } : { background: 'rgba(124, 58, 237, 0.05)', color: '#8A7CA8' }}
                      >
                        <Icon size={18} />
                        {state === "active" && (
                          <span className="absolute inset-0 rounded-lg animate-pulse-ring" style={{ background: 'rgba(124, 58, 237, 0.35)' }} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline justify-between gap-3">
                          <span className={`text-[14px] font-bold uppercase tracking-[0.08em] ${state === "pending" ? "text-mute" : "text-ink"}`}>
                            {s.label}
                          </span>
                          <span className="text-[11px] uppercase tracking-[0.14em] text-mute">
                            {state === "done" ? "Complete" : state === "active" ? "Running" : "Queued"}
                          </span>
                        </div>
                        <p className={`text-[13px] mt-0.5 ${state === "pending" ? "text-mute" : "text-body"}`}>{STAGE_LABELS[s.key] || s.sub}</p>
                        {state === "active" && (
                          <div className="mt-3 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(124, 58, 237, 0.1)' }}>
                            <div className="h-full transition-[width] duration-200"
                              style={{ background: '#10B981', width: `${Math.round(stageProgress * 100)}%` }} />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            {/* live log */}
            <div className="mt-6 rounded-xl bg-[#1A1035] text-white/90 p-5 font-mono text-[12.5px] leading-relaxed shadow-lg" data-testid="live-log">
              <div className="flex items-center gap-2 text-white/40 uppercase tracking-[0.18em] text-[10px] mb-2">
                <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" /> arya.live
              </div>
              <div><span className="text-[#C4B5FD]">›</span> stage <span style={{ color: '#10B981' }}>{status}</span> — {currentStage.detail}</div>
              {stageIdx >= 1 && <div className="text-white/60">› indexing 61,482,390 signals across 24 markets…</div>}
              {stageIdx >= 2 && <div className="text-white/60">› running failure replay against 504 historical launches…</div>}
              {stageIdx >= 3 && <div className="text-white/60">› computing CDS / CRS / BPS for 8 candidate claims…</div>}
              {done && <div className="text-[#10B981]">› ✓ Ready. Brand brief assembled in 12.0s.</div>}
            </div>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <button
                className="btn-primary disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none"
                disabled={!done}
                onClick={() => navigate("/risk-flags")}
                data-testid="view-results-btn"
              >
                {done ? "View Results" : "Forging Brief…"} <ArrowRight size={14} />
              </button>
              <button className="btn-ghost" onClick={restart} data-testid="restart-scan-btn">
                <RotateCw size={14} /> Replay Scan
              </button>
              <span className="text-[12px] text-mute ml-auto">
                Polling every <span className="font-semibold text-ink">3s</span> · {fmt(SCAN_STAGES.length)} pipeline stages
              </span>
            </div>
          </div>
          {/* RIGHT — telemetry / animated panel */}
          <aside
            className="relative rounded-2xl overflow-hidden border border-white/10 p-7 lg:p-9 space-y-8 animate-fade-up bg-[#211F33] text-white"
            style={{
              boxShadow: '0 4px 24px rgba(33, 31, 51, 0.15)',
              animationDelay: '160ms'
            }}
            data-testid="telemetry-panel"
          >
            <div className="absolute -top-12 -right-12 w-56 h-56 rounded-full bg-brand-500/10 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />

            <div className="relative">
              <span className="overline" style={{ color: '#C4B5FD' }}>Live · Arya v4.6</span>
              <h3 className="mt-2 text-[22px] font-bold tracking-tight text-white">Inside the scan</h3>
              <p className="text-[13px] text-white/60 mt-1">Realtime telemetry from the ValueForge pipeline.</p>
              {/* orbital animation */}
              <div className="relative h-48 mt-5 flex items-center justify-center">
                <div className="w-32 h-32 rounded-full border border-brand/10 absolute" />
                <div className="w-44 h-44 rounded-full border border-brand/5 absolute" />
                <div className="w-56 h-56 rounded-full border border-brand/5 absolute" />
                <div className="w-16 h-16 rounded-2xl bg-brand/10 flex items-center justify-center animate-float-y border border-brand/20">
                  <Cpu size={26} className="text-brand" />
                </div>
                {/* orbiting dots */}
                {[0, 1, 2, 3].map((i) => (
                  <span key={i}
                    className="absolute w-2.5 h-2.5 rounded-full bg-brand"
                    style={{
                      animation: `orbit 6s linear infinite`,
                      animationDelay: `${i * -1.5}s`,
                      transformOrigin: 'center',
                    }}
                  />
                ))}
                <style>{`@keyframes orbit { from { transform: rotate(0) translateX(72px) rotate(0); } to { transform: rotate(360deg) translateX(72px) rotate(-360deg); } }`}</style>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-4">
                {SCAN_TELEMETRY.map((t) => (
                  <Telemetry key={t.label} label={t.label} target={t.end} start={stageIdx >= 1} />
                ))}
              </div>
            </div>

            <div className="border-t border-white/10" />

            <div className="relative">
              <span className="overline" style={{ color: '#C4B5FD' }}>What happens next</span>
              <ol className="mt-3 space-y-3 text-[13.5px] text-white/70">
                <li><b className="text-white">1.</b> Acknowledge failure patterns first — we surface risks before recommendations.</li>
                <li><b className="text-white">2.</b> Review red-flagged claims in <span className="font-semibold" style={{ color: '#10B981' }}>Misalignment Risk Flags</span>.</li>
                <li><b className="text-white">3.</b> Explore overlap zone in <span className="font-semibold" style={{ color: '#10B981' }}>Authentic Claim Territory</span>.</li>
                <li><b className="text-white">4.</b> Export the 8-section <span className="font-semibold" style={{ color: '#10B981' }}>Brand Brief</span>.</li>
              </ol>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
};

const Telemetry = ({ label, target, start }) => {
  const val = useCountUp(target, 1800, start);
  return (
    <div className="rounded-xl bg-white/5 border border-white/10 p-3.5">
      <div className="text-[10px] uppercase tracking-[0.16em] text-white/45 font-bold">{label}</div>
      <div className="text-[20px] font-extrabold mt-1 tabular-nums text-white">{fmt(val)}</div>
    </div>
  );
};

export default ScanProgress;
