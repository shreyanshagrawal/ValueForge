import React, { useEffect, useMemo, useState } from "react";
import { BRAND_BRIEF, PROJECT } from "@/data/mockData";
import { FileText, Download, ListTree, Printer, Copy, CheckCircle2, Clock, Link2 } from "lucide-react";

const Toc = ({ sections, activeId, onJump }) => (
  <nav className="sticky top-[152px] space-y-1" data-testid="brief-toc">
    <div className="flex items-center gap-2 mb-3">
      <ListTree size={14} style={{ color: '#7C3AED' }} />
      <span className="overline" style={{ color: '#7C3AED' }}>On this page</span>
    </div>
    {sections.map((s, i) => {
      const active = activeId === s.id;
      return (
        <button key={s.id}
          onClick={() => onJump(s.id)}
          data-testid={`toc-${s.id}`}
          className={`w-full text-left px-3 py-2.5 rounded-md text-[13px] transition-all flex items-start gap-2
            ${active ? "text-ink font-semibold" : "text-body hover:text-ink hover:bg-tint"}`}
          style={active ? { background: 'rgba(124, 58, 237, 0.08)' } : {}}>
          <span className={`shrink-0 w-5 h-5 rounded-full text-[10px] font-extrabold inline-flex items-center justify-center mt-px`}
            style={active ? { background: '#7C3AED', color: '#FFFFFF' } : { background: 'rgba(124, 58, 237, 0.05)', color: '#8A7CA8' }}>{i + 1}</span>
          <span className="leading-snug">{s.title.replace(/^\d+\.\s*/, "")}</span>
        </button>
      );
    })}
  </nav>
);

const SectionCard = ({ s, index, onActivate }) => (
  <article
    id={s.id}
    data-testid={`brief-section-${s.id}`}
    onMouseEnter={onActivate}
    className="group scroll-mt-[170px] rounded-2xl border border-line bg-surface backdrop-blur-[16px] p-7 sm:p-9 card-hover shadow-sm"
  >
    <div className="flex items-start justify-between gap-4">
      <div className="flex items-center gap-3">
        <span className="w-9 h-9 rounded-lg font-extrabold inline-flex items-center justify-center" style={{ background: 'rgba(124, 58, 237, 0.12)', color: '#7C3AED' }}>
          {String(index + 1).padStart(2, "0")}
        </span>
        <span className="overline text-mute">Section</span>
      </div>
      <FileText size={16} className="text-mute opacity-60 transition-colors" style={{}} onMouseEnter={e => e.currentTarget.style.color = '#7C3AED'} onMouseLeave={e => e.currentTarget.style.color = ''} />
    </div>
    <h2 className="mt-4 text-[26px] sm:text-[28px] font-extrabold leading-tight text-ink">
      {s.title.replace(/^\d+\.\s*/, "")}
    </h2>
    <p className="mt-3 text-[15px] text-body leading-[1.75] max-w-[78ch] whitespace-pre-line">{s.body}</p>
  </article>
);

const ExportPanel = ({ onExport, exportState, countdown, formatTime }) => {
  return (
    <div className="rounded-2xl border border-line bg-surface backdrop-blur-[16px] p-6 shadow-sm" data-testid="export-panel">
      <span className="overline" style={{ color: '#7C3AED' }}>Export</span>
      <h3 className="text-[18px] font-bold text-ink mt-1">Ship the full brief</h3>
      <p className="text-[12px] text-body mt-1.5 leading-relaxed">
        Generates a signed S3 download link, valid for 15 minutes.
      </p>
      <div className="mt-5 space-y-2.5">
        <button
          onClick={() => onExport("pdf")}
          data-testid="export-pdf-btn"
          className="w-full flex items-center justify-between rounded-lg bg-brand hover:bg-brand-dark text-white px-4 py-3.5 transition-all shadow-sm hover:shadow-md font-bold font-sans"
        >
          <span className="flex items-center gap-2.5 text-white">
            <span className="w-9 h-9 rounded-md bg-white/15 text-white inline-flex items-center justify-center"><Download size={15} /></span>
            <span className="text-left">
              <span className="block text-[13.5px] font-bold uppercase tracking-[0.06em]">PDF</span>
              <span className="block text-[11px] text-white/80">Recommended · presentation-ready</span>
            </span>
          </span>
          <span className="text-[11px] text-white/80">~1.2 MB</span>
        </button>
        <button
          onClick={() => onExport("docx")}
          data-testid="export-docx-btn"
          className="w-full flex items-center justify-between rounded-lg border border-brand/20 hover:border-brand bg-white/40 px-4 py-3.5 transition-all shadow-sm hover:shadow-md"
        >
          <span className="flex items-center gap-2.5 text-brand">
            <span className="w-9 h-9 rounded-md bg-brand/10 text-brand inline-flex items-center justify-center"><Download size={15} /></span>
            <span className="text-left">
              <span className="block text-[13.5px] font-bold uppercase tracking-[0.06em]">DOCX</span>
              <span className="block text-[11px] text-body">Editable Word document</span>
            </span>
          </span>
          <span className="text-[11px] text-body">~340 KB</span>
        </button>
      </div>
      {exportState.state === "generating" && (
        <div className="mt-4 rounded-lg bg-teal-500/10 p-3 text-[12.5px] text-teal-700 flex items-center gap-2" data-testid="export-status-generating">
          <span className="w-2 h-2 rounded-full bg-teal animate-pulse" />
          Signing S3 URL · packaging {exportState.format?.toUpperCase()}…
        </div>
      )}
      {exportState.state === "ready" && (
        <div className="mt-4 rounded-lg border border-teal-500/20 bg-teal-500/10 p-3" data-testid="export-status-ready">
          <div className="flex items-center gap-2 text-teal-700 text-[12.5px] font-bold">
            <CheckCircle2 size={14} /> Download ready
          </div>
          <div className="flex items-center justify-between gap-2 mt-2">
            <code className="text-[11px] text-teal-800 truncate">{exportState.link}</code>
            <button
              onClick={() => navigator.clipboard?.writeText(exportState.link)}
              data-testid="export-copy-link"
              className="shrink-0 text-teal-700 hover:text-teal-900"
            >
              <Copy size={13} />
            </button>
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-teal-700">
            <Clock size={11} /> Link valid for {formatTime(countdown)}
          </div>
        </div>
      )}
      <button
        onClick={() => window.print()}
        data-testid="export-print-btn"
        className="mt-4 w-full inline-flex items-center justify-center gap-2 text-[12px] font-bold uppercase tracking-[0.1em] text-mute hover:text-brand py-2 border-t border-line pt-3"
      >
        <Printer size={13} /> Or print this view
      </button>
    </div>
  );
};

const triggerDownload = (filename, content, mime) => {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
};

const BrandBriefPreview = () => {
  const [activeId, setActiveId] = useState(BRAND_BRIEF.sections[0].id);
  const [exportState, setExportState] = useState({ state: "idle", format: null, link: null });
  const [countdown, setCountdown] = useState(900);

  useEffect(() => {
    if (exportState.state !== "ready") return;
    setCountdown(900);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setExportState({ state: "idle", format: null, link: null });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [exportState.state]);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const briefText = useMemo(() => {
    return `VALUEFORGE — BRAND BRIEF\n${PROJECT.brand} · ${PROJECT.product}\nScan ${PROJECT.scanId} · Generated ${BRAND_BRIEF.generatedAt}\n\n` +
      BRAND_BRIEF.sections.map((s) => `${s.title}\n${"-".repeat(s.title.length)}\n${s.body}\n`).join("\n");
  }, []);

  const onExport = (format) => {
    setExportState({ state: "generating", format, link: null });
    setTimeout(() => {
      const filename = `valueforge-brief-${PROJECT.scanId}.${format === "pdf" ? "txt" : "docx.txt"}`;
      const signed = `https://s3.aipalette.ai/briefs/${PROJECT.scanId}/${filename}?X-Sig=${Math.random().toString(36).slice(2, 10)}&expires=900`;
      triggerDownload(filename, briefText, "text/plain");
      setExportState({ state: "ready", format, link: signed });
    }, 1400);
  };

  const jumpTo = (id) => {
    setActiveId(id);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section className="max-w-[1280px] mx-auto px-6 lg:px-10 py-14" data-testid="page-brand-brief">
      {/* HERO */}
      <div className="rounded-2xl bg-gradient-to-br from-[#1A1A2E] via-[#2A1147] to-[#3B0F6A] text-white p-8 sm:p-10 relative overflow-hidden shadow-sm">
        <div className="absolute -top-24 -right-16 w-72 h-72 rounded-full bg-brand-500/30 blur-3xl" />
        <div className="absolute -bottom-24 -left-12 w-72 h-72 rounded-full bg-teal-500/20 blur-3xl" />
        <div className="relative grid lg:grid-cols-[1.4fr_0.8fr] gap-8 items-end">
          <div className="animate-fade-up">
            <span className="overline" style={{ color: '#C4B5FD' }}>FR-16 · Brand Brief Preview &amp; Export</span>
            <h1 className="mt-3 text-4xl sm:text-5xl lg:text-[56px] font-extrabold leading-[1.05] text-white">
              Your playbook, in 8 chapters.
            </h1>
            <p className="mt-4 max-w-[68ch] text-[14.5px] text-white/70 leading-relaxed">
              Everything ValueForge learned during this scan — failures, value propositions, claim territory, and risk flags — packaged into one shippable brief.
            </p>
            <div className="mt-5 flex flex-wrap gap-2 text-[12px]">
              <span className="px-3 py-1.5 rounded-full bg-white/10 border border-white/10 text-white/90 font-semibold">Scan {PROJECT.scanId}</span>
              <span className="px-3 py-1.5 rounded-full bg-white/10 border border-white/10 text-white/90 font-semibold">{PROJECT.brand} · {PROJECT.product}</span>
              <span className="px-3 py-1.5 rounded-full bg-white/10 border border-white/10 text-white/90 font-semibold">Generated {BRAND_BRIEF.generatedAt}</span>
              <span className="px-3 py-1.5 rounded-full font-semibold" style={{ background: 'rgba(196, 181, 253, 0.15)', color: '#C4B5FD', borderColor: 'rgba(196, 181, 253, 0.3)', border: '1px solid' }}>8 sections</span>
            </div>
          </div>
          <div className="rounded-xl bg-white/10 border border-white/10 p-5 animate-fade-up" style={{ animationDelay: '120ms' }}>
            <div className="flex items-center gap-2 text-white/90 text-[11px] uppercase tracking-[0.18em] font-bold">
              <Link2 size={12} className="text-[#3ECFB2]" /> Signed S3 URL · 15-min TTL
            </div>
            <button onClick={() => onExport("pdf")} data-testid="hero-export-pdf"
              className="mt-3 w-full inline-flex items-center justify-center gap-2 bg-[#F5A623] hover:bg-[#F5A623]/90 text-white font-bold uppercase text-[12.5px] tracking-[0.1em] py-3 rounded-md transition shadow-sm">
              <Download size={14} /> Export PDF
            </button>
            <button onClick={() => onExport("docx")} data-testid="hero-export-docx"
              className="mt-2 w-full inline-flex items-center justify-center gap-2 bg-white/10 border border-white/20 text-white font-bold uppercase text-[12.5px] tracking-[0.1em] py-3 rounded-md hover:bg-white/20 transition">
              Export DOCX
            </button>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="mt-10 grid lg:grid-cols-[220px_1fr_300px] gap-8 items-start">
        <div className="hidden lg:block">
          <Toc sections={BRAND_BRIEF.sections} activeId={activeId} onJump={jumpTo} />
        </div>
        <div className="space-y-5">
          {BRAND_BRIEF.sections.map((s, i) => (
            <SectionCard key={s.id} s={s} index={i} onActivate={() => setActiveId(s.id)} />
          ))}
          <div className="rounded-2xl border border-dashed border-brand/20 bg-brand/5 p-6 text-center">
            <span className="overline" style={{ color: '#7C3AED' }}>End of brief</span>
            <p className="text-[13.5px] text-body mt-2">
              Need a new scan? Adjust your concept inputs and re-run — Arya keeps improving every cycle.
            </p>
          </div>
        </div>
        <div className="space-y-5">
          <ExportPanel onExport={onExport} exportState={exportState} countdown={countdown} formatTime={formatTime} />
          <div className="rounded-2xl border border-line bg-surface backdrop-blur-[16px] p-6 shadow-sm">
            <span className="overline text-mute">Brief stats</span>
            <ul className="mt-3 space-y-2.5 text-[13px] text-body">
              <li className="flex items-center justify-between"><span>Sections</span><b className="text-ink">8</b></li>
              <li className="flex items-center justify-between"><span>Word count</span><b className="text-ink">~1,420</b></li>
              <li className="flex items-center justify-between"><span>Charts referenced</span><b className="text-ink">3</b></li>
              <li className="flex items-center justify-between"><span>Risk flags</span><b className="text-accent-red font-bold">3</b></li>
              <li className="flex items-center justify-between"><span>Claims in territory</span><b style={{ color: '#10B981' }}>5</b></li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BrandBriefPreview;
