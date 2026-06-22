import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams } from "react-router-dom";
import { Sparkles, Target, Activity, ShieldCheck, HelpCircle, X } from "lucide-react";
import { Badge } from "../components/ui/Badge";
import { api } from "../lib/api";
import StepperNav from "../components/StepperNav";

type CellType = "true_whitespace" | "conditional" | "contested" | "brand_gap" | "consumer_whitespace";

interface GridCell {
  type: CellType;
  bps: number;
  label?: string;
  claims?: any[];
}

const ROWS = ["Energy", "Recovery", "Immunity", "Taste", "Convenience", "Sustainability"];
const COLS = ["Underserved", "Moderate", "Saturated"];

const fallbackGridData: GridCell[][] = [
  [
    { type: "true_whitespace", bps: 88, label: "Clean Energy\n(Caffeine-free)", claims: [{code: "CLAIM-1", bps: 88, trend: "up", classification: "true_whitespace"}] },
    { type: "conditional", bps: 62, label: "Sustained\nEnergy", claims: [] },
    { type: "contested", bps: 45, label: "High Caffeine\nBoost", claims: [] },
  ],
  [
    { type: "true_whitespace", bps: 91, label: "Collagen +\nElectrolytes", claims: [] },
    { type: "true_whitespace", bps: 78, label: "BCAA +\nTart Cherry", claims: [] },
    { type: "conditional", bps: 55, label: "Whey Protein\nRecovery", claims: [] },
  ],
  [
    { type: "conditional", bps: 70, label: "Adaptogens\n(Ashwagandha)", claims: [] },
    { type: "contested", bps: 38, label: "Vitamin C +\nZinc Fortified", claims: [] },
    { type: "contested", bps: 30, label: "Immunity\nShield", claims: [] },
  ],
  [
    { type: "brand_gap", bps: 25, label: "Exotic\nFlavours", claims: [] },
    { type: "conditional", bps: 60, label: "Reduced Sugar\nIndulgence", claims: [] },
    { type: "contested", bps: 50, label: "Classic\nFlavour Profile", claims: [] },
  ],
  [
    { type: "true_whitespace", bps: 82, label: "On-the-Go\nSingle Serve", claims: [] },
    { type: "conditional", bps: 65, label: "Multi-pack\nBundle", claims: [] },
    { type: "contested", bps: 42, label: "Ready-to-Drink\nCan", claims: [] },
  ],
  [
    { type: "true_whitespace", bps: 95, label: "Biodegradable\nPack", claims: [] },
    { type: "brand_gap", bps: 20, label: "Carbon-Neutral\nClaim", claims: [] },
    { type: "contested", bps: 35, label: "Recyclable\nPlastic", claims: [] },
  ],
];

const cellConfig: Record<CellType, { bg: string; text: string; label: string; glow: string; icon: React.FC<any> }> = {
  true_whitespace:     { bg: "linear-gradient(135deg, #10B981 0%, #059669 100%)", text: "white", label: "True Whitespace",     glow: "rgba(16, 185, 129, 0.4)",  icon: Sparkles    },
  conditional:         { bg: "linear-gradient(135deg, #FBBF24 0%, #D97706 100%)", text: "white", label: "Conditional",         glow: "rgba(251, 191, 36, 0.4)",  icon: HelpCircle  },
  contested:           { bg: "linear-gradient(135deg, #EF4444 0%, #DC2626 100%)", text: "white", label: "Contested",           glow: "rgba(239, 68, 68, 0.4)",   icon: Activity    },
  brand_gap:           { bg: "linear-gradient(135deg, #9CA3AF 0%, #6B7280 100%)", text: "white", label: "Brand Gap",           glow: "rgba(156, 163, 175, 0.4)", icon: ShieldCheck  },
  consumer_whitespace: { bg: "linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)", text: "white", label: "Consumer Whitespace", glow: "rgba(59, 130, 246, 0.4)",  icon: Target      },
};

export default function WhitespaceGrid() {
  const { scanId } = useParams();
  
  const [hoveredCell, setHoveredCell] = useState<{ r: number; c: number } | null>(null);
  const [selectedCell, setSelectedCell] = useState<{ r: number; c: number; data: GridCell } | null>(null);
  const [gridData, setGridData] = useState<GridCell[][]>(fallbackGridData);

  useEffect(() => {
    if (scanId) {
      api.getWhitespace(scanId)
        .then(res => setGridData(res.grid))
        .catch(err => console.error("Failed to fetch grid, using fallback", err));
    }
  }, [scanId]);

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

        <StepperNav currentStep={2} />

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col md:flex-row justify-between items-start gap-6 relative z-10"
        >
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-3">
              <Badge variant="outline" className="bg-white/80 backdrop-blur-md border-[#7C3AED]/20 text-[#7C3AED] text-xs font-black uppercase tracking-widest px-3 py-1 shadow-sm">
                FR-12
              </Badge>
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#7C3AED]/70">3-Axis Matrix</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-[#1A1333] tracking-tight leading-tight mb-4">
              Whitespace <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7C3AED] to-[#C084FC]">Grid</span>
            </h1>
            <p className="text-lg text-gray-600 font-medium leading-relaxed">
              A multidimensional view of your category. The matrix reveals <strong className="text-[#1A1333]">Market Coverage</strong> across columns, <strong className="text-[#1A1333]">Whitespace Type</strong> by color, and your <strong className="text-[#1A1333]">Brand Fit (BPS)</strong> via opacity.
            </p>
          </div>
        </motion.div>

        {/* ── Floating Legend ── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-[0_10px_40px_rgba(124,58,237,0.08)] border border-[#7C3AED]/10 p-6 flex flex-wrap lg:flex-nowrap items-center gap-8 md:gap-12 relative z-20"
        >
          <div className="flex flex-wrap gap-6">
            {Object.entries(cellConfig).map(([key, cfg]) => {
              const Icon = cfg.icon;
              return (
                <div key={key} className="flex items-center gap-3 group">
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110" 
                    style={{ background: cfg.bg, boxShadow: `0 8px 20px ${cfg.glow}` }}
                  >
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-[#1A1333]">{cfg.label}</div>
                    <div className="text-[11px] text-gray-500 font-medium uppercase tracking-wider">{key.replace('_', ' ')}</div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="hidden lg:block w-px h-12 bg-gray-200" />

          {/* Opacity Legend */}
          <div className="flex items-center gap-4 flex-1">
            <div className="flex flex-col gap-1 w-full max-w-[200px]">
              <div className="flex justify-between text-[11px] font-bold text-[#1A1333] uppercase tracking-wider mb-1">
                <span>Low Fit (Faded)</span>
                <span>High Fit (Opaque)</span>
              </div>
              <div className="h-3 w-full rounded-full bg-gradient-to-r from-[#7C3AED]/20 to-[#7C3AED] relative overflow-hidden shadow-inner">
                <motion.div 
                  className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diagonal-stripes.png')] opacity-20"
                  animate={{ backgroundPosition: ["0px 0px", "20px 20px"] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Unique 3D Matrix View ── */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="relative mt-8"
        >
          {/* Subtle background mesh */}
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] pointer-events-none rounded-3xl" />

          <div className="grid grid-cols-[140px_1fr] md:grid-cols-[180px_1fr] gap-4 md:gap-8 relative z-10">
            
            {/* Top Left Empty Cell */}
            <div className="h-[60px]" />

            {/* Column Headers */}
            <div className="grid grid-cols-3 gap-4 md:gap-8">
              {COLS.map((col) => (
                <div key={col} className="h-[60px] flex flex-col items-center justify-end pb-4 border-b-2 border-[#7C3AED]/20 relative">
                  <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-[#7C3AED] text-center">{col}</span>
                  <span className="text-[10px] text-gray-400 font-medium absolute -bottom-7">Market Coverage</span>
                </div>
              ))}
            </div>

            {/* Rows & Cells */}
            {ROWS.map((row, rIdx) => (
              <React.Fragment key={row}>
                {/* Row Header */}
                <div className="flex items-center justify-end pr-6 border-r-2 border-[#7C3AED]/20 py-4 relative group">
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-0 bg-[#7C3AED] transition-all duration-300 group-hover:h-8 rounded-l-full" />
                  <span className="text-right text-sm md:text-lg font-black text-[#1A1333] tracking-tight group-hover:text-[#7C3AED] transition-colors">{row}</span>
                </div>

                {/* Cells Grid */}
                <div className="grid grid-cols-3 gap-4 md:gap-8 py-2 md:py-4">
                  {COLS.map((col, cIdx) => {
                    const cell = gridData[rIdx][cIdx];
                    const cfg = cellConfig[cell.type];
                    const isHovered = hoveredCell?.r === rIdx && hoveredCell?.c === cIdx;
                    
                    // Math for opacity dimension (0.2 to 1.0 based on BPS)
                    const normalizedOpacity = Math.max(0.2, cell.bps / 100);

                    // User Idea Highlight
                    const isIdea = rIdx === 0 && cIdx === 2;

                    return (
                      <motion.div
                        key={col}
                        onClick={() => setSelectedCell({ r: rIdx, c: cIdx, data: cell })}
                        onMouseEnter={() => setHoveredCell({ r: rIdx, c: cIdx })}
                        onMouseLeave={() => setHoveredCell(null)}
                        whileHover={{ scale: 1.05, y: -5 }}
                        className="relative rounded-[24px] overflow-hidden cursor-pointer"
                        style={{
                          background: "white",
                          boxShadow: isHovered 
                            ? `0 20px 40px ${cfg.glow}, 0 0 0 2px white inset` 
                            : `0 10px 30px rgba(0,0,0,0.05)`,
                        }}
                      >
                        {/* The dynamic colored background layer representing Opacity (Dimension 3) */}
                        <div 
                          className="absolute inset-0 transition-opacity duration-300"
                          style={{ 
                            background: cfg.bg, 
                            opacity: normalizedOpacity 
                          }} 
                        />
                        
                        {/* Optional animated gradient overlay for high BPS */}
                        {cell.bps > 80 && (
                          <motion.div 
                            className="absolute inset-0 opacity-30 mix-blend-overlay"
                            animate={{ 
                              backgroundPosition: ["0% 0%", "100% 100%"] 
                            }}
                            transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                            style={{ backgroundImage: "radial-gradient(circle at center, white 0%, transparent 50%)", backgroundSize: "200% 200%" }}
                          />
                        )}

                        {/* Content Container */}
                        <div className="relative p-5 md:p-6 h-full flex flex-col justify-between z-10">
                          {isIdea && (
                            <motion.div 
                              initial={{ y: -20, opacity: 0 }}
                              animate={{ y: 0, opacity: 1 }}
                              className="absolute -top-1 -right-1 bg-[#1A1333] text-white text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-bl-xl rounded-tr-[24px] shadow-lg flex items-center gap-1"
                            >
                              <Target className="w-3 h-3 text-[#7C3AED]" /> Your Idea
                            </motion.div>
                          )}

                          <div className="flex items-start justify-between gap-2 mb-8">
                            <h3 className={`text-base md:text-lg font-black leading-tight ${normalizedOpacity < 0.4 ? "text-gray-800" : "text-white"}`} style={{ textShadow: normalizedOpacity > 0.4 ? "0 2px 4px rgba(0,0,0,0.2)" : "none" }}>
                              {cell.label}
                            </h3>
                          </div>

                          <div className="mt-auto">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md ${normalizedOpacity < 0.4 ? "bg-black/5 text-black" : "bg-white/20 text-white"}`}>
                                  <cfg.icon className="w-4 h-4" />
                                </div>
                                <div className="flex flex-col">
                                  <span className={`text-[10px] font-bold uppercase tracking-widest ${normalizedOpacity < 0.4 ? "text-gray-500" : "text-white/80"}`}>
                                    Score
                                  </span>
                                  <span className={`text-xl font-black leading-none ${normalizedOpacity < 0.4 ? "text-gray-900" : "text-white"}`}>
                                    {cell.bps}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* BPS Progress Bar */}
                            <div className={`h-1.5 w-full rounded-full mt-3 overflow-hidden ${normalizedOpacity < 0.4 ? "bg-black/10" : "bg-black/20"}`}>
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${cell.bps}%` }}
                                transition={{ duration: 1, delay: 0.5 + (cIdx * 0.1) }}
                                className={`h-full rounded-full ${normalizedOpacity < 0.4 ? "bg-gray-800" : "bg-white"}`}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Hover State Tooltip overlay */}
                        <AnimatePresence>
                          {isHovered && (
                            <motion.div 
                              initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
                              animate={{ opacity: 1, backdropFilter: "blur(8px)" }}
                              exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
                              className="absolute inset-0 bg-[#1A1333]/90 p-6 flex flex-col justify-center items-center text-center z-20"
                            >
                              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-3">
                                <Target className="w-6 h-6 text-white" />
                              </div>
                              <span className="text-white font-black text-lg mb-1">{cell.bps} BPS</span>
                              <span className="text-white/70 text-xs font-medium uppercase tracking-widest">{cfg.label}</span>
                              <p className="text-white/50 text-[10px] mt-3 leading-relaxed max-w-[80%]">
                                {cell.bps >= 80 ? "Exceptional brand fit. High permission to play." : cell.bps >= 50 ? "Moderate brand fit. Requires strong marketing." : "Low brand fit. High risk of rejection."}
                              </p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
                </div>
              </React.Fragment>
            ))}
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {selectedCell && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A1333]/80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto relative shadow-2xl"
            >
              <button 
                onClick={() => setSelectedCell(null)}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500"
              >
                <X className="w-6 h-6" />
              </button>
              
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: cellConfig[selectedCell.data.type].bg, color: 'white' }}>
                  {React.createElement(cellConfig[selectedCell.data.type].icon, { className: "w-6 h-6" })}
                </div>
                <div>
                  <h2 className="text-2xl font-black text-[#1A1333] leading-tight">
                    {ROWS[selectedCell.r]} × {COLS[selectedCell.c]}
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline">{cellConfig[selectedCell.data.type].label}</Badge>
                    <span className="text-sm font-bold text-gray-500">BPS: {selectedCell.data.bps}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-bold text-gray-700 text-lg">Claims in this sector:</h3>
                {selectedCell.data.claims && selectedCell.data.claims.length > 0 ? (
                  <div className="grid gap-3">
                    {selectedCell.data.claims.map((claim, idx) => (
                      <div key={idx} className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex justify-between items-center">
                        <span className="font-bold text-[#1A1333] text-lg">{claim.code}</span>
                        <div className="flex items-center gap-4">
                          <div className="flex flex-col items-end">
                            <span className="text-[10px] uppercase text-gray-500 font-bold">Trend</span>
                            <span className="font-bold text-[#8B4CFF]">{claim.trend === 'up' ? '↗ Rising' : '→ Stable'}</span>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="text-[10px] uppercase text-gray-500 font-bold">BPS</span>
                            <span className="font-black text-gray-900">{claim.bps}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-500 italic p-4 bg-gray-50 rounded-xl">
                    No specific claims found in this sector.
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
