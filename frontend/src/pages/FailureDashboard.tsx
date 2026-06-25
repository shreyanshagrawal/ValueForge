import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Info, ArrowRight, ShieldAlert, BadgeX, TrendingDown, Users2, Clock4, Truck, Building2, Check, Loader2 } from "lucide-react";
import { Button } from "../components/ui/Button";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../lib/api";
import StepperNav from "../components/StepperNav";

// Mapping the exact failure reasons from the PRD to icons and colors
const reasonConfig: Record<string, { label: string, icon: React.ElementType, colorClass: string }> = {
  taste_mismatch: { label: "Taste Mismatch", icon: BadgeX, colorClass: "text-[#EF4444] bg-[#EF4444]/10 border-[#EF4444]/30" },
  claim_not_believed: { label: "Claim Not Believed", icon: ShieldAlert, colorClass: "text-[#F97316] bg-[#F97316]/10 border-[#F97316]/30" },
  price_value_disconnect: { label: "Price-Value Disconnect", icon: TrendingDown, colorClass: "text-[#F59E0B] bg-[#F59E0B]/10 border-[#F59E0B]/30" },
  persona_wrong: { label: "Wrong Target Persona", icon: Users2, colorClass: "text-[#F43F5E] bg-[#F43F5E]/10 border-[#F43F5E]/30" },
  market_not_ready: { label: "Market Not Ready", icon: Clock4, colorClass: "text-[#EAB308] bg-[#EAB308]/10 border-[#EAB308]/30" },
  distribution_failure: { label: "Distribution Failure", icon: Truck, colorClass: "text-[#D946EF] bg-[#D946EF]/10 border-[#D946EF]/30" },
  brand_permission_gap: { label: "Brand Permission Gap", icon: Building2, colorClass: "text-[#EC4899] bg-[#EC4899]/10 border-[#EC4899]/30" },
  market_saturation: { label: "Market Saturation", icon: TrendingDown, colorClass: "text-[#F59E0B] bg-[#F59E0B]/10 border-[#F59E0B]/30" },
  permission_gap: { label: "Permission Gap", icon: Building2, colorClass: "text-[#EC4899] bg-[#EC4899]/10 border-[#EC4899]/30" },
};

const fallbackFailures = [
  {
    id: "fallback-1",
    positioning: "High Protein Enriched Snack",
    product_name: "ProFit Crunch Bar",
    similarity_score: 84,
    reasonKey: "taste_mismatch",
    secondaryReasonKey: "claim_not_believed",
    lesson: "Consumers rejected 'high protein' claims from a traditionally indulgent brand because the texture was heavily compromised without a clear health payoff.",
    summary: "Product tasted chalky and failed to deliver on 'indulgent' promise.",
  },
  {
    id: "fallback-2",
    positioning: "Premium Vegan Energy Bite",
    product_name: "PurePower Vegan Bites",
    similarity_score: 71,
    reasonKey: "price_value_disconnect",
    secondaryReasonKey: "persona_wrong",
    lesson: "Positioned at an ultra-premium price tier, but lacked the clinically-tested efficacy claims demanded by the 'Fitness Millennial' persona.",
    summary: "Too expensive for the perceived value.",
  },
  {
    id: "fallback-3",
    positioning: "Natural Focus Bar",
    product_name: "FocusEdge Nootropic Bar",
    similarity_score: 63,
    reasonKey: "brand_permission_gap",
    secondaryReasonKey: "market_not_ready",
    lesson: "Brand had zero historical equity in cognitive health. Consumers fundamentally distrusted the functional focus claim coming from a snack brand.",
    summary: "Consumers didn't trust the brand to deliver nootropic benefits.",
  },
];

type FailureItem = {
  id: string | number;
  positioning: string;
  product_name: string;
  similarity_score: number;
  reasonKey: string;
  secondaryReasonKey: string;
  lesson: string;
  summary: string;
};

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring" as const, stiffness: 150, damping: 20 } },
};

export default function FailureDashboard() {
  const { scanId } = useParams();
  const basePath = scanId ? `/scan/${scanId}` : "";
  const navigate = useNavigate();
  const [failuresData, setFailuresData] = useState<FailureItem[]>(fallbackFailures);
  const [acknowledged, setAcknowledged] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (scanId) {
      setLoading(true);
      setError(null);
      api.getFailureRisks(scanId)
        .then(res => {
          // The backend returns a flat array of FailureMatchResponse objects
          const rawFailures = Array.isArray(res) ? res : (res.failures || res);
          if (!rawFailures || !Array.isArray(rawFailures) || rawFailures.length === 0) {
            setFailuresData(fallbackFailures);
            return;
          }
          const formattedFailures: FailureItem[] = rawFailures.map((item: any, idx: number) => {
            if (item.failure_case) {
              return {
                id: item.id || `match-${idx}`,
                positioning: item.failure_case.positioning_used || "Unknown positioning",
                product_name: item.failure_case.product_name || "Unknown product",
                similarity_score: Math.round(item.similarity_score || 0),
                reasonKey: item.failure_case.failure_reason_type || "taste_mismatch",
                secondaryReasonKey: "market_not_ready",
                lesson: item.failure_case.lesson_learned || "No lesson recorded.",
                summary: item.failure_case.failure_summary || item.failure_case.lesson_learned || "No summary available.",
              };
            }
            // Direct item (already formatted or fallback shape)
            return {
              id: item.id || `item-${idx}`,
              positioning: item.positioning || item.positioning_used || "Unknown positioning",
              product_name: item.product_name || "Unknown product",
              similarity_score: Math.round(item.similarity_score || 0),
              reasonKey: item.reasonKey || item.failure_reason_type || "taste_mismatch",
              secondaryReasonKey: item.secondaryReasonKey || "market_not_ready",
              lesson: item.lesson || item.lesson_learned || "No lesson recorded.",
              summary: item.summary || item.failure_summary || item.lesson || "No summary available.",
            };
          });
          setFailuresData(formattedFailures);
        })
        .catch(err => {
          console.error("Failed to fetch failures, using fallback", err);
          setError("Could not load failure data from backend. Showing example data.");
          setFailuresData(fallbackFailures);
        })
        .finally(() => setLoading(false));
    }
  }, [scanId]);

  return (
    <div 
      className="min-h-screen w-full flex flex-col items-center justify-start p-6 pt-24 pb-24 overflow-x-hidden relative"
      style={{ background: "#0C0A18", fontFamily: "'Mulish', sans-serif" }}
    >
      {/* Background Grid Layer */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(124,58,237,0.07) 1px, transparent 1px),
            linear-gradient(90deg, rgba(124,58,237,0.07) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Ambient glows — purple + warm accent */}
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-[#6B21A8]/20 blur-[150px] pointer-events-none z-0" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#EA580C]/10 blur-[120px] pointer-events-none z-0" />
      <div className="absolute top-[40%] left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full bg-[#7C3AED]/10 blur-[180px] pointer-events-none z-0" />

      <StepperNav currentStep={1} />

      <motion.div 
        className="w-full max-w-[1400px] relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div 
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", bounce: 0.6, duration: 1 }}
            className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-[#EF4444]/10 text-[#EF4444] mb-8 border border-[#EF4444]/30 shadow-[0_0_60px_rgba(239,68,68,0.25)] relative"
          >
            {/* Pulsing alarm rings */}
            <motion.div 
              animate={{ scale: [1, 1.5, 2], opacity: [0.5, 0, 0] }} 
              transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
              className="absolute inset-0 border-2 border-[#EF4444] rounded-3xl"
            />
            <AlertTriangle className="w-12 h-12 relative z-10" />
          </motion.div>
          <h1 className="text-5xl md:text-6xl font-black text-[#F5F2EF] tracking-tight mb-6 leading-tight">
            Before we look forward, <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#EF4444] to-[#F97316]">let's look at what failed.</span>
          </h1>
          <p className="text-[#9CA3AF] text-xl max-w-3xl mx-auto font-medium leading-relaxed">
            Our semantic engine matched your idea against <span className="text-white font-bold">500+ failed product launches</span>. We found {failuresData.length} historical patterns with nearly identical positioning that crashed in the market.
          </p>
        </div>

        {/* Error Banner */}
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-4 rounded-xl bg-[#F97316]/10 border border-[#F97316]/30 text-[#F97316] text-sm font-medium text-center max-w-2xl mx-auto"
          >
            {error}
          </motion.div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-10 h-10 text-[#EF4444] animate-spin" />
            <p className="text-[#9CA3AF] text-lg font-medium">Loading failure analysis...</p>
          </div>
        )}

        {/* Failure Cards Grid — always visible, no carousel */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {failuresData.map((failure, idx) => {
              const primaryReason = reasonConfig[failure.reasonKey] || reasonConfig["taste_mismatch"];
              const secondaryReason = reasonConfig[failure.secondaryReasonKey] || reasonConfig["market_not_ready"];
              const PrimaryIcon = primaryReason.icon;
              
              return (
                <motion.div 
                  key={failure.id} 
                  variants={cardVariants}
                  className="h-full"
                >
                  <div className="h-full flex flex-col bg-[#211C2B]/80 backdrop-blur-2xl rounded-3xl border border-white/5 overflow-hidden relative group transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_60px_rgba(239,68,68,0.15)] hover:border-[#EF4444]/30">
                    
                    {/* Glowing Top Edge */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#EF4444] to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />

                    <div className="p-8 pb-6 border-b border-white/[0.06] relative">
                      {/* Ambient card glow */}
                      <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#EF4444]/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      
                      {/* Product name + similarity score */}
                      <div className="flex items-center gap-3 mb-6 relative z-10 flex-wrap">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20">
                          {failure.similarity_score ?? 0}% pattern match
                        </span>
                        {failure.product_name && (
                          <span className="text-[#9CA3AF] text-xs font-semibold">
                            Failed product: <span className="text-white font-bold">{failure.product_name}</span>
                          </span>
                        )}
                      </div>
                      <div className="flex gap-3 flex-wrap mb-6 relative z-10">
                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest border ${primaryReason.colorClass}`}>
                          <PrimaryIcon className="w-4 h-4" />
                          {failure.reasonKey.replace(/_/g, " ")}
                        </div>
                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border ${secondaryReason.colorClass} opacity-80`}>
                          {failure.secondaryReasonKey.replace(/_/g, " ")}
                        </div>
                      </div>
                      
                      <span className="text-[#6B7280] text-xs font-bold uppercase tracking-[0.2em] block mb-2">Positioning Used</span>
                      <h3 className="text-2xl text-[#F5F2EF] font-black leading-snug">"{failure.positioning}"</h3>
                    </div>

                    <div className="p-8 pt-6 flex-1 bg-gradient-to-b from-transparent to-black/20 flex flex-col gap-6">
                      
                      {/* Why it Failed / Summary */}
                      <div className="flex items-start gap-4">
                        <div className="p-3 rounded-xl bg-white/5 border border-white/10 shrink-0 shadow-inner">
                          <AlertTriangle className="w-5 h-5 text-[#EF4444]" />
                        </div>
                        <div>
                          <span className="block text-[#E5E7EB] text-sm font-bold tracking-wide mb-2 uppercase">Why it Failed</span>
                          <p className="text-[15px] text-[#9CA3AF] leading-relaxed font-medium">{failure.summary}</p>
                        </div>
                      </div>

                      {/* Lesson Learned */}
                      <div className="flex items-start gap-4">
                        <div className="p-3 rounded-xl bg-white/5 border border-white/10 shrink-0 shadow-inner">
                          <Info className="w-5 h-5 text-[#8B4CFF]" />
                        </div>
                        <div>
                          <span className="block text-[#E5E7EB] text-sm font-bold tracking-wide mb-2 uppercase">Lesson Learned</span>
                          <p className="text-[15px] text-[#9CA3AF] leading-relaxed font-medium">{failure.lesson}</p>
                        </div>
                      </div>
                      
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Empty state */}
        {!loading && failuresData.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 mb-16"
          >
            <p className="text-[#9CA3AF] text-lg font-medium">No strong historical failure patterns detected for this concept.</p>
          </motion.div>
        )}

        {/* Acknowledgement Section */}
        <motion.div 
          className="flex flex-col items-center gap-6 bg-[#1A1333]/90 p-10 rounded-[2rem] border border-[#EF4444]/20 backdrop-blur-xl max-w-2xl mx-auto shadow-[0_0_50px_rgba(239,68,68,0.1)] relative overflow-hidden"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, type: "spring", stiffness: 100 }}
        >
          {/* Animated hazard stripes */}
          <div className="absolute top-0 left-0 right-0 h-1 overflow-hidden opacity-30">
             <motion.div 
                animate={{ x: ["0%", "-50%"] }} 
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-[200%] h-full bg-[repeating-linear-gradient(45deg,#EF4444,#EF4444_10px,transparent_10px,transparent_20px)]" 
              />
          </div>

          <div className="flex items-center gap-3 text-[#EF4444]">
            <ShieldAlert className="w-6 h-6" />
            <p className="text-sm font-black uppercase tracking-[0.2em]">
              Mandatory Acknowledgment
            </p>
          </div>
          
          <label className="flex items-center gap-3 cursor-pointer group mt-2 mb-4">
            <div className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${acknowledged ? 'bg-[#FFB64D] border-[#FFB64D]' : 'border-white/20 group-hover:border-white/40'}`}>
              {acknowledged && <Check className="w-4 h-4 text-[#1A1333]" />}
            </div>
            <span className="text-[#E5E7EB] text-sm md:text-base font-medium">
              I understand these market risks and want to see the whitespace recommendations.
            </span>
            <input 
              type="checkbox" 
              className="hidden" 
              checked={acknowledged} 
              onChange={(e) => setAcknowledged(e.target.checked)} 
            />
          </label>
          
          <Button 
            disabled={!acknowledged}
            className="flex items-center gap-2 px-6 py-3 bg-[#8B4CFF] hover:bg-[#7C3AED] disabled:bg-gray-300 disabled:text-gray-500 text-white rounded-full font-bold transition-all"
            onClick={() => navigate(scanId ? `${basePath}/grid` : "/design/grid")}
          >
            Continue to Whitespace Maps <ArrowRight className="w-5 h-5" />
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}

