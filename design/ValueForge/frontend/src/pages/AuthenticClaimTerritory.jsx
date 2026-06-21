import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { TERRITORY_CLAIMS } from "@/data/mockData";
import { ArrowRight, Target, GitMerge, Radar as RadarIcon, Crown, Sparkles } from "lucide-react";
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Tooltip,
} from "recharts";

/* ============== Venn Diagram (3-circle) ============== */
const VennDiagram = ({ claims, hoveredId, setHoveredId }) => {
  // SVG size
  const W = 560, H = 460;
  // three circle centers forming triangle
  const r = 160;
  const cx = W / 2, cy = H / 2;
  const offset = 92;
  const circles = [
    { id: "market", cx: cx - offset, cy: cy - 28, color: "#10B981", label: "Market", sub: "trend velocity" },
    { id: "consumer", cx: cx + offset, cy: cy - 28, color: "#7C3AED", label: "Consumer", sub: "relevance" },
    { id: "brand", cx: cx, cy: cy + 88, color: "#EF4444", label: "Brand", sub: "permission" },
  ];
  // map a claim to a position based on (market, consumer, brand) weights
  // pos = weighted average of the three centers, normalised to overlap area
  const placed = useMemo(() => claims.map((c) => {
    const m = (100 - c.market) / 100;
    const k = c.consumer / 100;
    const b = c.brand / 100;
    const total = m + k + b || 1;
    const px = (circles[0].cx * m + circles[1].cx * k + circles[2].cx * b) / total;
    const py = (circles[0].cy * m + circles[1].cy * k + circles[2].cy * b) / total;
    // jitter slightly so multiple claims dont overlap
    const jitter = (n) => ((n * 37) % 23) - 11;
    return { ...c, x: px + jitter(c.id.charCodeAt(2)), y: py + jitter(c.id.charCodeAt(3)) };
  }), [claims]);

  return (
    <div className="relative w-full" data-testid="venn-diagram">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
        <defs>
          {circles.map((c) => (
            <radialGradient key={c.id} id={`g-${c.id}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={c.color} stopOpacity="0.32" />
              <stop offset="100%" stopColor={c.color} stopOpacity="0.10" />
            </radialGradient>
          ))}
          <pattern id="grain" width="3" height="3" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="0.5" fill="rgba(124,58,237,0.03)" />
          </pattern>
        </defs>
        {/* circles */}
        {circles.map((c) => (
          <g key={c.id}>
            <circle cx={c.cx} cy={c.cy} r={r} fill={`url(#g-${c.id})`} stroke={c.color} strokeOpacity="0.7" strokeWidth="1.5" />
            <text x={c.cx} y={c.cy + (c.id === "brand" ? r + 28 : -r - 14)} textAnchor="middle"
              className="uppercase" fontFamily="Inter" fontSize="11" fontWeight="700" letterSpacing="2" fill={c.color}>
              {c.label}
            </text>
            <text x={c.cx} y={c.cy + (c.id === "brand" ? r + 42 : -r)} textAnchor="middle"
              fontFamily="Inter" fontSize="10" fill="#5B4B8A">
              {c.sub}
            </text>
          </g>
        ))}
        {/* central overlap highlight */}
        <circle cx={cx} cy={cy + 12} r={52} fill="#7C3AED" fillOpacity="0.06" stroke="#7C3AED" strokeOpacity="0.4" strokeDasharray="4 4" />
        <text x={cx} y={cy + 6} textAnchor="middle" fontFamily="Plus Jakarta Sans" fontSize="11" fontWeight="700" letterSpacing="2" fill="#1A1035">
          AUTHENTIC
        </text>
        <text x={cx} y={cy + 22} textAnchor="middle" fontFamily="Plus Jakarta Sans" fontSize="11" fontWeight="700" letterSpacing="2" fill="#1A1035">
          TERRITORY
        </text>
        {/* claim dots */}
        {placed.map((p) => {
          const active = hoveredId === p.id;
          return (
            <g key={p.id}
              onMouseEnter={() => setHoveredId(p.id)}
              onMouseLeave={() => setHoveredId(null)}
              style={{ cursor: "pointer" }}
              data-testid={`venn-dot-${p.id}`}
            >
              {active && <circle cx={p.x} cy={p.y} r="14" fill="#10B981" fillOpacity="0.18" />}
              <circle cx={p.x} cy={p.y} r={p.inside ? 7 : 5}
                fill={p.inside ? "#10B981" : "#8A7CA8"}
                stroke="#fff" strokeWidth="2" />
              {p.inside && p.rank === 1 && (
                <circle cx={p.x} cy={p.y} r="11" fill="none" stroke="#7C3AED" strokeWidth="1.5" />
              )}
              {active && (
                <g>
                  <rect x={p.x + 12} y={p.y - 18} rx="6" ry="6" width={Math.min(280, p.text.length * 7.4 + 24)} height="34" fill="#1A1035" />
                  <text x={p.x + 22} y={p.y + 3} fontFamily="Inter" fontSize="12" fill="#fff">{p.text.length > 38 ? p.text.slice(0, 36) + "…" : p.text}</text>
                </g>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
};

/* ============== Radar Chart ============== */
const TerritoryRadar = ({ claim }) => {
  const data = claim ? [
    { axis: "Market", value: claim.market, full: 100 },
    { axis: "Consumer", value: claim.consumer, full: 100 },
    { axis: "Brand", value: claim.brand, full: 100 },
  ] : [
    { axis: "Market", value: 0, full: 100 },
    { axis: "Consumer", value: 0, full: 100 },
    { axis: "Brand", value: 0, full: 100 },
  ];

  return (
    <div className="w-full" data-testid="territory-radar" style={{ height: 420 }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} outerRadius="78%">
          <PolarGrid stroke="rgba(124, 58, 237, 0.15)" />
          <PolarAngleAxis dataKey="axis" tick={{ fill: "#1A1035", fontSize: 13, fontWeight: 700, letterSpacing: 1.5 }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: "#5B4B8A", fontSize: 10 }} stroke="rgba(124, 58, 237, 0.15)" />
          <Tooltip
            contentStyle={{ background: "rgba(255, 255, 255, 0.95)", border: "1px solid rgba(139, 76, 255, 0.15)", borderRadius: 8, color: "#1A1035", fontSize: 12 }}
            labelStyle={{ color: "#7C3AED", fontWeight: 700, letterSpacing: 1 }}
          />
          <Radar dataKey="value" stroke="#7C3AED" fill="#7C3AED" fillOpacity={0.2} strokeWidth={2.5} dot={{ r: 4, fill: "#7C3AED" }} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

const AuthenticClaimTerritory = () => {
  const navigate = useNavigate();
  const [view, setView] = useState("venn"); // venn | radar

  const processedClaims = useMemo(() => {
    const claims = TERRITORY_CLAIMS.map((c) => {
      const inside = c.market < 30 && c.consumer > 60 && c.brand > 60;
      const score = (100 - c.market) + c.consumer + c.brand;
      return { ...c, inside, score };
    });

    const insideSorted = claims.filter((c) => c.inside).sort((a, b) => b.score - a.score);
    const rankMap = {};
    insideSorted.forEach((c, idx) => {
      rankMap[c.id] = idx + 1;
    });

    return claims.map((c) => ({
      ...c,
      rank: rankMap[c.id] || null,
    }));
  }, []);

  const ranked = useMemo(() => processedClaims.filter((c) => c.inside).sort((a, b) => a.rank - b.rank), [processedClaims]);
  const outside = useMemo(() => processedClaims.filter((c) => !c.inside), [processedClaims]);

  const [selectedId, setSelectedId] = useState(() => {
    return ranked[0]?.id || processedClaims[0]?.id;
  });
  const [hoveredId, setHoveredId] = useState(null);
  const selected = processedClaims.find((c) => c.id === selectedId);

  return (
    <section className="max-w-[1280px] mx-auto px-6 lg:px-10 py-14" data-testid="page-claim-territory">
      <div className="grid lg:grid-cols-[1fr_auto] gap-6 items-end">
        <div className="animate-fade-up">
          <span className="overline" style={{color:'#7C3AED'}}>FR-15 · Authentic Claim Territory</span>
          <h1 className="mt-3 text-4xl sm:text-5xl font-extrabold leading-[1.05] text-ink">
            The overlap zone where you can <span style={{color:'#10B981'}}>find</span> <span className="text-mute">&amp;</span> <span className="text-brand">win</span>.
          </h1>
          <p className="mt-4 max-w-[64ch] text-[15px] text-body leading-relaxed">
            Each claim is plotted against the three dimensions that decide whether a launch lands. Claims inside the intersection earn the right to ship — everything outside is borrowed permission.
          </p>
        </div>
        {/* view toggle */}
        <div className="flex gap-1 p-1 rounded-full bg-tint border border-line w-fit" data-testid="view-toggle">
          {[
            { k: "venn", label: "Venn", icon: GitMerge, testId: "view-venn" },
            { k: "radar", label: "Radar", icon: RadarIcon, testId: "view-radar" },
          ].map((v) => {
            const Icon = v.icon;
            const active = view === v.k;
            return (
              <button key={v.k} onClick={() => setView(v.k)} data-testid={v.testId}
                className={`px-4 py-2 rounded-full text-[12px] font-bold uppercase tracking-[0.1em] inline-flex items-center gap-1.5 transition-all
                  ${active ? "bg-brand text-tint" : "text-body hover:text-brand"}`}>
                <Icon size={14} /> {v.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-10 grid lg:grid-cols-[1.25fr_0.95fr] gap-8 items-start">
        {/* VISUAL */}
        <div className="rounded-2xl border border-line bg-surface backdrop-blur-[16px] p-6 sm:p-8 shadow-[0_30px_60px_-30px_rgba(124,58,237,0.06)]">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="overline" style={{color:'#7C3AED'}}>Visualisation</div>
              <h3 className="text-[18px] font-bold text-ink">
                {view === "venn" ? "Market × Consumer × Brand overlap" : `Radar — “${selected?.text}”`}
              </h3>
            </div>
            <span className="text-[11px] uppercase tracking-[0.16em] px-2.5 py-1 rounded-full border border-teal/15" style={{color:'#059669', background:'rgba(16, 185, 129, 0.08)'}}>
              {ranked.length} inside territory
            </span>
          </div>
          {view === "venn" ? (
            <VennDiagram claims={processedClaims} hoveredId={hoveredId} setHoveredId={setHoveredId} />
          ) : (
            <TerritoryRadar claim={selected} />
          )}
          {/* legend */}
          <div className="mt-4 flex flex-wrap items-center gap-4 text-[12px] text-body" data-testid="venn-legend">
            <Legend dot="#10B981" label="Market dimension" />
            <Legend dot="#7C3AED" label="Consumer dimension" />
            <Legend dot="#EF4444" label="Brand dimension" />
            <span className="h-3 w-px bg-line" />
            <Legend dot="#10B981" label="Inside territory" ringed />
            <Legend dot="#8A7CA8" label="Outside" />
          </div>
        </div>

        {/* RANKED LIST */}
        <aside className="space-y-4" data-testid="ranked-list">
          <div className="rounded-2xl p-6 bg-surface backdrop-blur-[16px] border border-line shadow-sm">
            <div className="flex items-center gap-2 text-ink">
              <Target size={16} className="text-brand" />
              <span className="overline">Ranked claims in territory</span>
            </div>
            <p className="text-[13.5px] text-body mt-2">
              Hover a row to highlight on the {view === "venn" ? "Venn" : "radar"} chart. Click to select.
            </p>
          </div>
          {ranked.map((c) => {
            const active = selectedId === c.id;
            const isHover = hoveredId === c.id;
            return (
              <button
                key={c.id}
                onClick={() => { setSelectedId(c.id); setView("radar"); }}
                onMouseEnter={() => setHoveredId(c.id)}
                onMouseLeave={() => setHoveredId(null)}
                data-testid={`ranked-row-${c.id}`}
                className={`w-full text-left rounded-xl border p-4 transition-all
                  ${active || isHover ? "border-brand shadow-md" : "border-line bg-surface backdrop-blur-[8px]"}
                `}
                style={active || isHover ? {borderColor:'#7C3AED', background:'rgba(124, 58, 237, 0.05)'} : {}}>
                <div className="flex items-start gap-3">
                  <span className={`shrink-0 w-9 h-9 rounded-lg flex items-center justify-center font-extrabold text-[14px]`}
                    style={c.rank === 1 ? {background:'#7C3AED',color:'#FFFFFF'} : {background:'rgba(16, 185, 129, 0.12)',color:'#10B981'}}>
                    {c.rank === 1 ? <Crown size={15} /> : `#${c.rank}`}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-[14.5px] font-bold text-ink leading-snug"><Sparkles size={14} className="inline mr-1" style={{color:'#10B981'}} />“{c.text}”</div>
                    <div className="mt-2 grid grid-cols-3 gap-2 text-[10.5px]">
                      <Mini label="M" v={c.market} color="#10B981" />
                      <Mini label="C" v={c.consumer} color="#7C3AED" />
                      <Mini label="B" v={c.brand} color="#EF4444" />
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
          <details className="rounded-xl border p-4" style={{borderColor:'rgba(124, 58, 237, 0.2)', background:'rgba(124, 58, 237, 0.04)'}} data-testid="outside-claims">
            <summary className="cursor-pointer text-[12px] font-bold uppercase tracking-[0.12em] hover:text-brand" style={{color:'#7C3AED'}}>
              {outside.length} claims outside territory
            </summary>
            <ul className="mt-3 space-y-2">
              {outside.map((c) => (
                <li key={c.id} className="text-[13px] text-body flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-mute mt-2" />
                  <span>“{c.text}” <span className="text-mute">· M{c.market} C{c.consumer} B{c.brand}</span></span>
                </li>
              ))}
            </ul>
          </details>
        </aside>
      </div>

      <div className="mt-12 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-line bg-surface backdrop-blur-[16px] p-6 lg:p-8 card-hover shadow-sm">
        <div>
          <h3 className="text-[22px] font-bold text-ink">Ready to package this story?</h3>
          <p className="text-body text-[13.5px] mt-1">
            The Brand Brief stitches together failures, value propositions, and your territory map into one shippable document.
          </p>
        </div>
        <button className="btn-primary" onClick={() => navigate("/brand-brief")} data-testid="next-brief-btn">
          Open Brand Brief <ArrowRight size={14} />
        </button>
      </div>
    </section>
  );
};

const Legend = ({ dot, label, ringed }) => (
  <span className="inline-flex items-center gap-1.5">
    <span className="relative inline-flex">
      {ringed && <span className="absolute inset-0 -m-0.5 rounded-full border" style={{borderColor:'#7C3AED'}} />}
      <span className="w-2.5 h-2.5 rounded-full" style={{ background: dot }} />
    </span>
    {label}
  </span>
);

const Mini = ({ label, v, color }) => (
  <div className="rounded-md bg-tint border border-line px-2 py-1.5 flex items-center justify-between">
    <span className="text-mute font-bold tracking-[0.12em] uppercase">{label}</span>
    <span className="font-extrabold tabular-nums" style={{ color }}>{v}</span>
  </div>
);

export default AuthenticClaimTerritory;
