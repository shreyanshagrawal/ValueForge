import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Info, ArrowRight, ShieldAlert, BadgeX, TrendingDown, Users2, Clock4, Truck, Building2, Check } from "lucide-react";
import { Button } from "../components/ui/Button";
import { useNavigate, useParams } from "react-router-dom";
import { Carousel, CarouselContent, CarouselItem, CarouselNavigation, CarouselIndicator } from "../components/ui/carousel";
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
};

const fallbackFailures = [
  {
    id: 1,
    positioning: "High Protein Enriched Snack",
    product_name: "ProFit Crunch Bar",
    similarity_score: 84,
    reasonKey: "taste_mismatch",
    secondaryReasonKey: "claim_not_believed",
    lesson: "Consumers rejected 'high protein' claims from a traditionally indulgent brand because the texture was heavily compromised without a clear health payoff.",
  },
  {
    id: 2,
    positioning: "Premium Vegan Energy Bite",
    product_name: "PurePower Vegan Bites",
    similarity_score: 71,
    reasonKey: "price_value_disconnect",
    secondaryReasonKey: "persona_wrong",
    lesson: "Positioned at an ultra-premium price tier, but lacked the clinically-tested efficacy claims demanded by the 'Fitness Millennial' persona.",
  },
  {
    id: 3,
    positioning: "Natural Focus Bar",
    product_name: "FocusEdge Nootropic Bar",
    similarity_score: 63,
    reasonKey: "brand_permission_gap",
    secondaryReasonKey: "market_not_ready",
    lesson: "Brand had zero historical equity in cognitive health. Consumers fundamentally distrusted the functional focus claim coming from a snack brand.",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.9 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring" as const, stiffness: 150, damping: 20 } },
};

export default function FailureDashboard() {
  const { scanId } = useParams();
  const basePath = scanId ? `/scan/${scanId}` : "";
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  const [failuresData, setFailuresData] = useState(fallbackFailures);
  const [acknowledged, setAcknowledged] = useState(false);

  useEffect(() => {
    if (scanId) {
      api.getFailureRisks(scanId)
        .then(res => setFailuresData(res.failures || res))
        .catch(err => console.error("Failed to fetch failures, using fallback", err));
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
            Our semantic engine matched your idea against <span className="text-white font-bold">500+ failed product launches</span>. We found 3 historical patterns with nearly identical positioning that crashed in the market.
          </p>
        </div>

        <div className="w-full relative mb-16 pb-12">
          <Carousel index={index} onIndexChange={setIndex}>
            <CarouselContent className="relative py-4 -mx-4 px-4">
              {failuresData.map((failure) => {
                const primaryReason = reasonConfig[failure.reasonKey];
                const secondaryReason = reasonConfig[failure.secondaryReasonKey];
                const PrimaryIcon = primaryReason.icon;
                
                return (
                  <CarouselItem key={failure.id} className="w-full md:w-1/2 lg:w-1/3 px-4">
                    <motion.div variants={cardVariants} className="h-full">
                      <div className="h-full flex flex-col bg-[#211C2B]/80 backdrop-blur-2xl rounded-3xl border border-white/5 overflow-hidden relative group transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_60px_rgba(239,68,68,0.15)] hover:border-[#EF4444]/30">
                        
                        {/* Glowing Top Edge */}
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#EF4444] to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />

                        <div className="p-8 pb-6 border-b border-white/[0.06] relative">
                          {/* Ambient card glow */}
                          <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#EF4444]/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                          
                        {/* Product name + similarity score */}
                          <div className="flex items-center gap-3 mb-6 relative z-10">
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

                        <div className="p-8 pt-6 flex-1 bg-gradient-to-b from-transparent to-black/20">
                          <div className="flex items-start gap-4">
                            <div className="p-3 rounded-xl bg-white/5 border border-white/10 shrink-0 shadow-inner">
                              <Info className="w-5 h-5 text-[#9CA3AF]" />
                            </div>
                            <div>
                              <span className="block text-[#E5E7EB] text-sm font-bold tracking-wide mb-2 uppercase">Lesson Learned</span>
                              <p className="text-[15px] text-[#9CA3AF] leading-relaxed font-medium">{failure.lesson}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
            <div className="hidden md:block">
              <CarouselNavigation 
                alwaysShow={true} 
                classNameButton="bg-[#211C2B] hover:bg-[#EF4444] border border-white/10 text-white transition-colors duration-300"
              />
            </div>
            <CarouselIndicator classNameButton="bg-white/20 dark:bg-white/20 aria-selected:bg-[#EF4444]" />
          </Carousel>
        </div>

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
            className="w-full sm:w-auto h-[60px] px-10 bg-transparent border-2 border-[#FFB64D] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#FFB64D]/10 text-[#FFB64D] rounded-full transition-all duration-300 flex items-center justify-center gap-3" 
            onClick={() => navigate(scanId ? `${basePath}/risk-flags` : "/design/risk-flags")}
          >
            <span className="text-[15px] font-bold uppercase tracking-[0.08em]">I Understand the Risks — View Details</span>
            <ArrowRight className="w-5 h-5" />
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}
