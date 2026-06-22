import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useParams } from "react-router-dom";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, ResponsiveContainer, Tooltip
} from "recharts";
import { Info, Star, TrendingUp, AlertCircle, Sparkles } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { api } from "../lib/api";
import DesignAuthenticClaimTerritory from "./design/AuthenticClaimTerritory";
import StepperNav from "../components/StepperNav";

// ─── DATA ───────────────────────────────────────
const fallbackClaims = [
  {
    id: 1,
    name: "Clean-Energy Hydration",
    marketScore: 88,
    consumerScore: 78,
    brandScore: 82,
    fos: 86,
    inOverlap: true,
    subclaims: ["clean_label", "sustained_energy"],
    color: "#10B981", // Emerald
  },
  {
    id: 2,
    name: "Recovery Refueling",
    marketScore: 72,
    consumerScore: 81,
    brandScore: 60,
    fos: 74,
    inOverlap: true,
    subclaims: ["clinically_proven", "zero_sugar"],
    color: "#10B981", // Emerald
  },
  {
    id: 3,
    name: "High Protein Immunity",
    marketScore: 25,
    consumerScore: 36,
    brandScore: 35,
    fos: 38,
    inOverlap: false,
    subclaims: ["high_protein", "immunity_support"],
    color: "#EF4444", // Red
  },
  {
    id: 4,
    name: "Adaptogen Focus",
    marketScore: 80,
    consumerScore: 62,
    brandScore: 55,
    fos: 64,
    inOverlap: false,
    subclaims: ["adaptogen", "cognitive_clarity"],
    color: "#F43F5E", // Rose
  },
];

function buildRadarData(claim: (typeof fallbackClaims)[0]) {
  return [
    { axis: "Market\n(Tier-CDS)", value: claim.marketScore, fullMark: 100 },
    { axis: "Consumer\n(CRS)", value: claim.consumerScore, fullMark: 100 },
    { axis: "Brand\n(BPS)", value: claim.brandScore, fullMark: 100 },
  ];
}

const THRESHOLD = 55;

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/90 backdrop-blur-xl border border-white/50 p-4 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] min-w-[150px]">
        <p className="font-extrabold text-[#1E1B4B] text-[15px] mb-1">{payload[0]?.name}</p>
        <p className="text-[13px] font-bold text-[#8B4CFF] uppercase tracking-wider">
          Score: <span className="text-[18px]">{payload[0]?.value}</span>
        </p>
      </div>
    );
  }
  return null;
};

export default function AuthenticClaimTerritory() {
  const { scanId } = useParams();
  
  const [claimsData, setClaimsData] = useState(fallbackClaims);
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    if (scanId) {
      api.getAuthenticTerritory(scanId)
        .then(res => setClaimsData(res.claims || res))
        .catch(err => console.error("Failed to fetch territory", err));
    }
  }, [scanId]);

  if (showAdvanced) {
    return (
      <div className="relative w-full">
        <div className="absolute top-8 right-8 z-50">
          <button 
            onClick={() => setShowAdvanced(false)}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full text-sm font-bold border border-white/20 transition-all backdrop-blur-md shadow-lg"
          >
            ← Back to Standard View
          </button>
        </div>
        <DesignAuthenticClaimTerritory />
      </div>
    );
  }

  const overlapClaims = claimsData.filter(c => c.inOverlap).sort((a, b) => b.fos - a.fos);
  const outsideClaims = claimsData.filter(c => !c.inOverlap).sort((a, b) => b.fos - a.fos);

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
        className="max-w-[1400px] mx-auto space-y-12 relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <StepperNav currentStep={3} />

        {/* Header */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-end">
          <div>
            <div className="inline-flex items-center gap-2 mb-3">
              <Badge variant="outline" className="bg-white/50 backdrop-blur-sm border-[#8B4CFF]/30 text-[#8B4CFF] px-3 py-1 font-bold">FR-15</Badge>
              <span className="text-[13px] font-bold text-[#7D7098] uppercase tracking-[0.15em]">3-Axis Radar View</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-[#1E1B4B] tracking-tight mb-3">Authentic Claim Territory</h1>
            <p className="text-[#645C8F] text-lg max-w-3xl leading-relaxed">
              Claims plotted against Market, Consumer, and Brand axes. The <span className="text-emerald-600 font-bold bg-emerald-100/50 px-2 py-0.5 rounded-md border border-emerald-200">overlap zone</span> (all 3 ≥ 55) is your brand's unique winning territory.
            </p>
          </div>
          <button 
            onClick={() => setShowAdvanced(true)}
            className="shrink-0 px-5 py-2.5 bg-gradient-to-r from-[#8B4CFF] to-[#6D28D9] text-white rounded-lg font-bold text-sm shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
          >
            View Advanced Venn & Radar Mode
          </button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* ─── LEFT: Visualizations ─── */}
          <div className="xl:col-span-2 space-y-10">
            
            {/* HERO SECTION: Overlap Claims (The Main Center) */}
            <div className="space-y-6">
              <motion.div 
                className="flex items-center gap-3 mb-2"
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
              >
                <div className="p-2 bg-emerald-100 rounded-xl"><Sparkles className="w-6 h-6 text-emerald-600" /></div>
                <h2 className="text-2xl font-extrabold text-[#1E1B4B] tracking-tight">Winning Claims (Overlap Zone)</h2>
              </motion.div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
                {overlapClaims.map((claim, idx) => (
                  <motion.div
                    key={claim.id}
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    whileHover={{ y: -5, scale: 1.02 }}
                    transition={{ delay: 0.3 + idx * 0.15, type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <Card className="h-full border-2 border-emerald-300 shadow-[0_20px_40px_rgba(16,185,129,0.15)] bg-white/90 backdrop-blur-xl rounded-3xl overflow-hidden relative group">
                      {/* Animated Glow Behind */}
                      <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                      
                      <CardHeader className="pb-4 pt-6 px-6 relative z-10 border-b border-emerald-100/50">
                        <div className="flex items-center justify-between mb-3">
                          <Badge className="bg-emerald-100 hover:bg-emerald-200 text-emerald-700 border-emerald-300 text-[11px] font-extrabold uppercase tracking-widest px-3 py-1 shadow-sm">
                            ✓ Verified Winner
                          </Badge>
                          <motion.span 
                            className="text-4xl font-black text-emerald-600 drop-shadow-md"
                            initial={{ scale: 0.5 }} animate={{ scale: 1 }} transition={{ delay: 0.5 + idx * 0.1, type: "spring" }}
                          >
                            {claim.fos}
                          </motion.span>
                        </div>
                        <CardTitle className="text-xl font-extrabold text-[#1E1B4B] leading-tight">{claim.name}</CardTitle>
                        <div className="flex flex-wrap gap-2 mt-3">
                          {claim.subclaims.map(s => (
                            <span key={s} className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-md uppercase tracking-wider">#{s}</span>
                          ))}
                        </div>
                      </CardHeader>
                      <CardContent className="pt-6 px-6 pb-6 relative z-10">
                        <div className="h-[250px] relative">
                          <ResponsiveContainer width="100%" height="100%">
                            <RadarChart data={buildRadarData(claim)} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
                              <PolarGrid stroke="rgba(16,185,129,0.2)" strokeDasharray="3 3" />
                              <PolarAngleAxis dataKey="axis" tick={{ fontSize: 12, fill: "#1E1B4B", fontWeight: 800 }} />
                              <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
                              <Radar
                                name="Threshold"
                                dataKey={() => THRESHOLD}
                                stroke="rgba(16,185,129,0.3)"
                                fill="rgba(16,185,129,0.05)"
                                strokeDasharray="4 4"
                                strokeWidth={2}
                              />
                              <Radar
                                name={claim.name}
                                dataKey="value"
                                stroke={claim.color}
                                fill={claim.color}
                                fillOpacity={0.6}
                                strokeWidth={3}
                                dot={{ fill: "#fff", r: 6, strokeWidth: 3, stroke: claim.color }}
                                activeDot={{ r: 8, strokeWidth: 0, fill: "#fff", filter: "drop-shadow(0px 0px 8px rgba(16,185,129,1))" }}
                              />
                              <Tooltip content={<CustomTooltip />} />
                            </RadarChart>
                          </ResponsiveContainer>
                        </div>

                        {/* Beautiful Score Pills */}
                        <div className="grid grid-cols-3 gap-3 mt-4">
                          {[
                            { label: "Market", value: claim.marketScore },
                            { label: "Consumer", value: claim.consumerScore },
                            { label: "Brand", value: claim.brandScore },
                          ].map((s) => (
                            <motion.div 
                              key={s.label} 
                              className="text-center bg-white border border-emerald-100 rounded-xl p-3 shadow-sm"
                              whileHover={{ y: -2, backgroundColor: "#ECFDF5" }}
                            >
                              <span className="block text-xl font-black text-emerald-600">{s.value}</span>
                              <span className="block text-[10px] text-emerald-800 font-bold uppercase tracking-widest mt-0.5">{s.label}</span>
                            </motion.div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* SECONDARY SECTION: Outside Zone (High Risk) */}
            <motion.div 
              className="pt-8 border-t border-[#E8DFF5]"
              initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            >
              <div className="flex items-center gap-2 mb-6">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <h3 className="text-lg font-bold text-red-600 uppercase tracking-widest">Outside Zone (High Risk)</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {outsideClaims.map((claim) => (
                  <Card key={claim.id} className="h-full border border-red-200 bg-red-50/40 rounded-2xl hover:shadow-[0_10px_25px_rgba(239,68,68,0.1)] transition-all duration-300">
                    <CardHeader className="pb-2 pt-4 px-5 border-b border-red-100/50">
                      <div className="flex items-center justify-between mb-1">
                        <Badge className="bg-red-100 text-red-700 border-red-200 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5">
                          ✗ High Risk
                        </Badge>
                        <span className="text-xl font-black text-red-500">{claim.fos}</span>
                      </div>
                      <CardTitle className="text-md font-bold text-[#1E1B4B]">{claim.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="px-5 pb-4 pt-3">
                      <div className="h-[150px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <RadarChart data={buildRadarData(claim)} margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                            <PolarGrid stroke="rgba(239,68,68,0.2)" />
                            <PolarAngleAxis dataKey="axis" tick={{ fontSize: 10, fill: "#9CA3AF", fontWeight: 700 }} />
                            <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
                            <Radar name="Threshold" dataKey={() => THRESHOLD} stroke="#D1D5DB" fill="transparent" strokeDasharray="3 3" />
                            <Radar name={claim.name} dataKey="value" stroke={claim.color} fill={claim.color} fillOpacity={0.3} strokeWidth={2} dot={{ r: 3, fill: claim.color, stroke: "#fff", strokeWidth: 1 }} />
                            <Tooltip content={<CustomTooltip />} />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>

          </div>

          {/* ─── RIGHT: Ranked Output List ─── */}
          <div className="space-y-6">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5, type: "spring" }}>
              <Card className="border-2 border-emerald-300 shadow-[0_15px_30px_rgba(16,185,129,0.1)] rounded-3xl overflow-hidden bg-white/80 backdrop-blur-xl">
                <CardHeader className="pb-4 border-b border-emerald-100 bg-gradient-to-br from-emerald-50 to-white pt-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-500/30">
                      <Star className="w-5 h-5" />
                    </div>
                    <CardTitle className="text-lg font-extrabold text-[#1E1B4B]">
                      Verified Claims ({overlapClaims.length})
                    </CardTitle>
                  </div>
                  <p className="text-[13px] font-medium text-emerald-800/80 leading-relaxed">
                    All 3 dimensions ≥ {THRESHOLD}. These are the <strong className="text-emerald-700">only</strong> claims your brand can authentically own and win.
                  </p>
                </CardHeader>
                <CardContent className="pt-5 space-y-4 px-5 pb-6">
                  {overlapClaims.map((c, i) => (
                    <motion.div 
                      key={c.id} 
                      className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-emerald-100 shadow-[0_5px_15px_rgba(16,185,129,0.08)] relative overflow-hidden group"
                      whileHover={{ scale: 1.02, x: 5 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    >
                      <div className="absolute inset-0 bg-emerald-50/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 font-black text-lg flex items-center justify-center shrink-0 border border-emerald-200 z-10">#{i + 1}</div>
                      <div className="flex-grow z-10">
                        <p className="font-extrabold text-[15px] text-[#1E1B4B] leading-snug mb-1">{c.name}</p>
                        <div className="flex items-center gap-1.5">
                          <TrendingUp className="w-4 h-4 text-emerald-500" />
                          <span className="text-[12px] font-bold text-gray-500 uppercase tracking-wider">Score <span className="text-emerald-600">{c.fos}</span></span>
                        </div>
                      </div>
                      <span className="text-2xl font-black text-emerald-500 z-10">{c.fos}</span>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.7 }}>
              <Card className="border border-red-200 bg-red-50/30 rounded-3xl transition-opacity duration-300">
                <CardHeader className="pb-3 border-b border-red-100/50 pt-5 px-5">
                  <CardTitle className="text-sm font-bold text-red-700 uppercase tracking-widest">High Risk ({outsideClaims.length})</CardTitle>
                  <p className="text-[12px] text-red-600/80 mt-2 font-medium">One or more dimensions below {THRESHOLD}.</p>
                </CardHeader>
                <CardContent className="pt-4 space-y-3 px-5 pb-5">
                  {outsideClaims.map(c => (
                    <div key={c.id} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-red-100 shadow-[0_4px_10px_rgba(239,68,68,0.05)]">
                      <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 font-black text-sm flex items-center justify-center shrink-0">✗</div>
                      <div className="flex-grow">
                        <p className="font-bold text-[13px] text-[#1E1B4B]">{c.name}</p>
                        <p className="text-[11px] font-semibold text-rose-500 uppercase tracking-wider mt-1">
                          {c.marketScore < THRESHOLD && "Market ↓ "}
                          {c.consumerScore < THRESHOLD && "Consumer ↓ "}
                          {c.brandScore < THRESHOLD && "Brand ↓"}
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}>
              <div className="flex items-start gap-4 bg-white/60 backdrop-blur-md border border-[#8B4CFF]/20 rounded-2xl p-5 shadow-sm">
                <div className="p-2 bg-[#8B4CFF]/10 text-[#8B4CFF] rounded-full shrink-0">
                  <Info className="w-5 h-5" />
                </div>
                <p className="text-[13px] text-[#645C8F] font-medium leading-relaxed pt-0.5">
                  The <strong className="text-[#8B4CFF]">dashed polygon</strong> on each radar is the 55-point threshold line. Claims where all 3 vertices extend beyond this ring are inside the Authentic Claim Territory.
                </p>
              </div>
            </motion.div>

          </div>
        </div>
      </motion.div>
    </div>
  );
}
