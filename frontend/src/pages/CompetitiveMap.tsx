
import { motion } from "framer-motion";
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { Info, Maximize2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Link, useParams } from "react-router-dom";

// Sample Data
const data = [
  { id: "brand_idea", name: "Your Idea (High Protein Snack)", cds: 82, crs: 45, velocity: 120, type: "user_idea" },
  { id: 1, name: "Competitor A", cds: 20, crs: 85, velocity: 400, type: "true_whitespace" },
  { id: 2, name: "Competitor B", cds: 35, crs: 75, velocity: 250, type: "true_whitespace" },
  { id: 3, name: "Competitor C", cds: 60, crs: 65, velocity: 150, type: "conditional" },
  { id: 4, name: "Competitor D", cds: 45, crs: 50, velocity: 300, type: "brand_whitespace" },
  { id: 5, name: "Competitor E", cds: 85, crs: 80, velocity: 200, type: "contested" },
  { id: 6, name: "Competitor F", cds: 90, crs: 40, velocity: 100, type: "contested" },
  { id: 7, name: "Competitor G", cds: 10, crs: 55, velocity: 180, type: "brand_whitespace" },
];

const COLORS: Record<string, string> = {
  true_whitespace: "#10B981", // Emerald
  conditional: "#FBBF24", // Amber
  brand_whitespace: "#F97316", // Orange
  contested: "#EF4444", // Red
  user_idea: "#8B4CFF", // Vibrant Purple
};

// Custom shape to render either a glowing circle or a pulsating star
const CustomShape = (props: any) => {
  const { cx, cy, payload, node } = props;
  const size = node?.r || 10;
  
  if (payload.type === "user_idea") {
    const outerRadius = size * 1.8;
    const innerRadius = size * 0.8;
    const points = [];
    for (let i = 0; i < 10; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = (Math.PI * 2 * i) / 10 - Math.PI / 2;
      points.push(`${cx + radius * Math.cos(angle)},${cy + radius * Math.sin(angle)}`);
    }
    return (
      <g style={{ filter: 'drop-shadow(0px 0px 15px rgba(139,76,255,0.8))' }}>
        <motion.polygon 
          points={points.join(" ")} 
          fill={COLORS[payload.type]} 
          stroke="#fff" 
          strokeWidth={2.5}
          initial={{ scale: 0.8 }}
          animate={{ scale: [0.8, 1.1, 0.8] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          style={{ transformOrigin: `${cx}px ${cy}px` }}
        />
        {/* Pulsating aura */}
        <motion.circle
          cx={cx} cy={cy} r={outerRadius * 1.5}
          fill="none"
          stroke={COLORS[payload.type]}
          strokeWidth={2}
          initial={{ scale: 0.8, opacity: 0.8 }}
          animate={{ scale: 2, opacity: 0 }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeOut" }}
          style={{ transformOrigin: `${cx}px ${cy}px` }}
        />
      </g>
    );
  }

  // Render a Glassy Bubble
  return (
    <g style={{ filter: `drop-shadow(0px 4px 10px ${COLORS[payload.type]}80)` }}>
      <circle 
        cx={cx} cy={cy} r={size} 
        fill={COLORS[payload.type]} 
        fillOpacity={0.8} 
        stroke="rgba(255,255,255,0.9)" 
        strokeWidth={2} 
        className="transition-all duration-300 hover:fill-opacity-100 cursor-pointer"
      />
    </g>
  );
};

// Custom Tooltip (Glassmorphism)
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white/80 backdrop-blur-xl border border-white/40 p-5 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] min-w-[220px]">
        <div className="flex items-center gap-3 mb-3 pb-3 border-b border-gray-200/50">
          <div className="w-3 h-3 rounded-full shadow-inner" style={{ backgroundColor: COLORS[data.type] }} />
          <span className="font-extrabold text-[#1E1B4B] text-[15px] leading-tight">{data.name}</span>
        </div>
        <div className="space-y-2 text-sm text-[#4F46E5] font-medium">
          <div className="flex justify-between">
            <span>Tier-CDS:</span>
            <span className="font-bold text-[#1E1B4B]">{data.cds}</span>
          </div>
          <div className="flex justify-between">
            <span>CRS:</span>
            <span className="font-bold text-[#1E1B4B]">{data.crs}</span>
          </div>
          <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-100">
            <span className="text-xs text-gray-500 uppercase tracking-wider">Velocity</span>
            <span className="font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">+{data.velocity}%</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export default function CompetitiveMap() {
  const { scanId } = useParams();
  const basePath = scanId ? `/scan/${scanId}` : "";
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

      <motion.div 
        className="max-w-[1400px] mx-auto space-y-12 relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Navigation Tabs */}
        <div className="flex border-b border-[#E8DFF5] overflow-x-auto hide-scrollbar">
          <Link to={`${basePath}/value-props`} className="px-6 py-4 font-bold text-[#7D7098] hover:text-[#8B4CFF] transition-colors whitespace-nowrap text-[16px]">Value Propositions</Link>
          <div className="relative px-6 py-4 font-bold text-[#8B4CFF] whitespace-nowrap text-[16px]">
            Competitive Map
            <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-6 right-6 h-[4px] bg-[#8B4CFF] rounded-t-[4px]" />
          </div>
          <Link to={`${basePath}/grid`} className="px-6 py-4 font-bold text-[#7D7098] hover:text-[#8B4CFF] transition-colors whitespace-nowrap text-[16px]">Whitespace Grid</Link>
          <Link to={`${basePath}/territory`} className="px-6 py-4 font-bold text-[#7D7098] hover:text-[#8B4CFF] transition-colors whitespace-nowrap text-[16px]">Authentic Claim Territory</Link>
          <Link to={`${basePath}/brand-brief`} className="px-6 py-4 font-bold text-[#7D7098] hover:text-[#8B4CFF] transition-colors whitespace-nowrap text-[16px]">Brand Brief</Link>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <div className="inline-flex items-center gap-2 mb-3">
              <Badge variant="outline" className="bg-white/50 backdrop-blur-sm border-[#8B4CFF]/30 text-[#8B4CFF] px-3 py-1 font-bold">FR-11</Badge>
              <span className="text-[13px] font-bold text-[#7D7098] uppercase tracking-[0.15em]">Ai Palette Analysis</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-[#1E1B4B] tracking-tight mb-3">Competitive Map</h1>
            <p className="text-[#645C8F] text-lg max-w-2xl leading-relaxed">
              A comprehensive view of the market landscape. Find the <strong className="text-emerald-600">True Whitespace</strong> by looking for high Consumer Resonance and low Claim Density. Bubble size indicates trend velocity.
            </p>
          </div>
          <Button className="shrink-0 gap-2 h-[48px] px-8 bg-transparent border-2 border-[#8B4CFF] hover:bg-[#8B4CFF]/10 text-[#8B4CFF] rounded-full font-bold uppercase tracking-widest transition-all duration-300 shadow-[0_0_15px_rgba(139,76,255,0.1)]">
            <Maximize2 className="w-5 h-5" />
            Expand View
          </Button>
        </div>

        <Card className="shadow-[0_20px_50px_rgba(30,27,75,0.05)] border-0 overflow-hidden bg-white/70 backdrop-blur-2xl rounded-3xl relative">
          <CardHeader className="border-b border-[#E8DFF5] bg-white/40 pb-5 pt-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <CardTitle className="text-xl font-extrabold text-[#1E1B4B]">Whitespace Scatter Analysis</CardTitle>
            
            {/* Legend */}
            <div className="flex flex-wrap gap-4 text-[13px] font-bold text-[#645C8F] uppercase tracking-wider">
              <div className="flex items-center gap-2"><div className="w-3.5 h-3.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] border-2 border-white" /> True Whitespace</div>
              <div className="flex items-center gap-2"><div className="w-3.5 h-3.5 rounded-full bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.5)] border-2 border-white" /> Conditional</div>
              <div className="flex items-center gap-2"><div className="w-3.5 h-3.5 rounded-full bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)] border-2 border-white" /> Brand Whitespace</div>
              <div className="flex items-center gap-2"><div className="w-3.5 h-3.5 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)] border-2 border-white" /> Contested</div>
              <div className="flex items-center gap-2 ml-2 bg-[#8B4CFF]/10 px-3 py-1.5 rounded-full"><div className="w-4 h-4 text-[#8B4CFF] text-[18px] leading-none drop-shadow-[0_0_5px_rgba(139,76,255,0.5)]">★</div> <span className="text-[#8B4CFF]">Your Idea</span></div>
            </div>
          </CardHeader>
          <CardContent className="p-2 md:p-8 relative">
            
            <div className="h-[600px] w-full relative rounded-2xl overflow-hidden border border-white/50 bg-white/40 shadow-inner">
              
              {/* Contextual Background Quadrants (Modern Glass/Glow Design) */}
              <div className="absolute inset-0 pointer-events-none flex flex-col">
                <div className="flex w-full h-1/2">
                  <div className="w-1/2 h-full bg-gradient-to-br from-emerald-400/10 to-transparent relative">
                    <span className="absolute top-6 left-6 font-extrabold text-emerald-600/30 text-2xl uppercase tracking-[0.2em]">True Whitespace</span>
                  </div>
                  <div className="w-1/2 h-full bg-gradient-to-bl from-orange-400/10 to-transparent relative">
                    <span className="absolute top-6 right-6 font-extrabold text-orange-600/30 text-2xl uppercase tracking-[0.2em] text-right">Brand Whitespace</span>
                  </div>
                </div>
                <div className="flex w-full h-1/2">
                  <div className="w-1/2 h-full bg-gradient-to-tr from-amber-400/10 to-transparent relative">
                    <span className="absolute bottom-12 left-6 font-extrabold text-amber-600/30 text-2xl uppercase tracking-[0.2em]">Conditional</span>
                  </div>
                  <div className="w-1/2 h-full bg-gradient-to-tl from-red-400/10 to-transparent relative">
                    <span className="absolute bottom-12 right-6 font-extrabold text-red-600/30 text-2xl uppercase tracking-[0.2em] text-right">Contested</span>
                  </div>
                </div>
              </div>

              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 40, right: 40, bottom: 60, left: 40 }}>
                  <CartesianGrid strokeDasharray="4 4" stroke="rgba(139,76,255,0.15)" vertical={false} />
                  <XAxis 
                    type="number" 
                    dataKey="cds" 
                    name="Tier-CDS" 
                    domain={[0, 100]} 
                    tickFormatter={(tick) => `${tick}`}
                    tick={{ fill: '#7D7098', fontWeight: 600, fontSize: 12 }}
                    tickLine={false}
                    axisLine={{ stroke: 'rgba(139,76,255,0.2)', strokeWidth: 2 }}
                    label={{ value: 'Tier-Adjusted Claim Density (Fresh → Saturated)', position: 'bottom', offset: 25, className: 'text-[13px] font-bold fill-[#645C8F] uppercase tracking-widest' }}
                  />
                  <YAxis 
                    type="number" 
                    dataKey="crs" 
                    name="CRS" 
                    domain={[0, 100]} 
                    tick={{ fill: '#7D7098', fontWeight: 600, fontSize: 12 }}
                    tickLine={false}
                    axisLine={{ stroke: 'rgba(139,76,255,0.2)', strokeWidth: 2 }}
                    label={{ value: 'Consumer Resonance Score (Low → High)', angle: -90, position: 'insideLeft', offset: -10, className: 'text-[13px] font-bold fill-[#645C8F] uppercase tracking-widest' }}
                  />
                  <ZAxis 
                    type="number" 
                    dataKey="velocity" 
                    range={[200, 1500]} // Larger bubbles for visual impact
                    name="Trend Velocity" 
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3', stroke: 'rgba(139,76,255,0.3)', strokeWidth: 2 }} />
                  
                  {/* Glowing Quadrant Crosshairs */}
                  <ReferenceLine x={50} stroke="rgba(139,76,255,0.3)" strokeWidth={2} strokeDasharray="5 5" />
                  <ReferenceLine y={50} stroke="rgba(139,76,255,0.3)" strokeWidth={2} strokeDasharray="5 5" />

                  <Scatter name="Market Data" data={data} shape={<CustomShape />} animationDuration={1500} />
                </ScatterChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-8 flex bg-gradient-to-r from-red-50 to-white p-5 rounded-2xl border border-red-100 shadow-sm items-start gap-4">
              <div className="p-2 bg-red-100 rounded-full shrink-0">
                <Info className="w-6 h-6 text-red-600" />
              </div>
              <p className="text-[15px] text-gray-700 leading-relaxed pt-1">
                <strong className="text-red-900 font-extrabold text-[16px] uppercase tracking-wider mr-2">Analysis:</strong> Your idea (High Protein Snack) currently falls into the <span className="text-red-600 font-bold bg-red-100 px-2 py-0.5 rounded">Contested</span> quadrant due to extremely high Claim Density (82) at this price tier. Consumer resonance remains moderate (45). Pivot towards the <span className="text-emerald-600 font-bold">True Whitespace</span> for maximum market impact.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
