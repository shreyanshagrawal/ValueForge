import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2, CheckCircle2, Database, BrainCircuit,
  Activity, FileSearch, Sparkles,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../lib/api";
import DesignScanProgress from "./design/ScanProgress";

// Exact status values + messages + percentages from UI_SPEC.md
const stages = [
  { id: "pending",            label: "Initializing scan...",                      progress: 10,  icon: FileSearch   },
  { id: "extracting_claims",  label: "Scanning competitive landscape...",          progress: 30,  icon: Database     },
  { id: "scoring_claims",     label: "Computing market & consumer scores...",      progress: 50,  icon: Activity     },
  { id: "matching_failures",  label: "Matching against failure patterns...",       progress: 70,  icon: BrainCircuit },
  { id: "generating_vps",     label: "Generating recommendations...",             progress: 90,  icon: Sparkles     },
  { id: "complete",           label: "Scan complete! Redirecting...",             progress: 100, icon: CheckCircle2 },
];

function cn(...classes: (string | undefined | boolean | null)[]) {
  return classes.filter(Boolean).join(" ");
}

export default function ScanProgress() {
  // ── ALL hooks at the top — never after a conditional return ──
  const { scanId } = useParams();
  const navigate   = useNavigate();
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [showPipeline, setShowPipeline] = useState(false);
  const [scanFailed, setScanFailed] = useState(false);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    const timers: ReturnType<typeof setTimeout>[] = [];

    const runFallbackTimers = (id: string = "demo") => {
      timers.push(setTimeout(() => setCurrentStageIndex(1),  2000));
      timers.push(setTimeout(() => setCurrentStageIndex(2),  5000));
      timers.push(setTimeout(() => setCurrentStageIndex(3),  8000));
      timers.push(setTimeout(() => setCurrentStageIndex(4), 11000));
      timers.push(setTimeout(() => setCurrentStageIndex(5), 12500));
      timers.push(setTimeout(() => navigate(`/scan/${id}/failures`), 13500));
    };

    if (scanId) {
      interval = setInterval(async () => {
        try {
          const res    = await api.getScanStatus(scanId);
          const status = (res.status || res) as string;
          // Handle failed_ prefix (e.g. failed_scoring)
          if (status.startsWith("failed")) {
            clearInterval(interval);
            setScanFailed(true);
            return;
          }
          const idx = stages.findIndex((s) => s.id === status);
          if (idx !== -1) {
            setCurrentStageIndex(idx);
            if (status === "complete") {
              clearInterval(interval);
              setTimeout(() => navigate(`/scan/${scanId}/failures`), 800);
            }
          }
        } catch {
          clearInterval(interval);
          runFallbackTimers(scanId);
        }
      }, 1500);
    } else {
      runFallbackTimers();
    }

    return () => {
      if (interval) clearInterval(interval);
      timers.forEach(clearTimeout);
    };
  }, [scanId, navigate]);

  // ── Conditional RENDER (safe — all hooks already called) ────
  if (showPipeline) {
    return (
      <div className="relative w-full">
        {/* floating back button */}
        <div className="fixed top-24 right-6 z-50">
          <button
            onClick={() => setShowPipeline(false)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold text-white border border-white/20 bg-white/10 hover:bg-white/20 backdrop-blur-md transition-all shadow-lg"
          >
            ← Back to Loader
          </button>
        </div>
        <DesignScanProgress />
      </div>
    );
  }

  // ── Scan failed state ───────────────────────────────────────
  if (scanFailed) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center gap-6 p-6" style={{ background: "#0C0A18" }}>
        <div className="text-center">
          <h2 className="text-3xl font-black text-red-400 mb-3">Scan Failed</h2>
          <p className="text-[#9CA3AF] mb-6">The scan encountered an error during processing.</p>
          <div className="flex gap-4 justify-center">
            <button onClick={() => window.location.reload()} className="px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-full font-bold transition-all border border-white/20">Retry</button>
            <button onClick={() => navigate("/input")} className="px-6 py-2.5 bg-[#8B4CFF] hover:bg-[#7C3AED] text-white rounded-full font-bold transition-all">Start Over</button>
          </div>
        </div>
      </div>
    );
  }

  // ── Default: old spinning-sphere loader view ─────────────────
  const currentStage = stages[currentStageIndex];
  const progressPct  = currentStage.progress;

  return (
    <div
      className="min-h-[calc(100vh-80px)] w-full flex flex-col items-center justify-center p-6 relative overflow-hidden"
      style={{ background: "#0C0A18", fontFamily: "'Mulish', sans-serif" }}
    >
      {/* Background grid */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(124,58,237,0.07) 1px, transparent 1px)," +
            "linear-gradient(90deg, rgba(124,58,237,0.07) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      {/* Ambient glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#6B21A8]/20 blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[400px] h-[400px] rounded-full bg-[#EA580C]/10 blur-[100px] pointer-events-none z-0" />

      <div className="w-full max-w-2xl relative z-10 text-center flex flex-col items-center gap-12">

        {/* ── Spinning-sphere animation ── */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", bounce: 0.5, duration: 0.8 }}
          className="relative inline-flex items-center justify-center w-40 h-40"
        >
          {/* outer dashed ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="absolute rounded-full border border-dashed border-[#FFB64D]/30"
            style={{ inset: "-22px" }}
          />
          {/* inner ring */}
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute rounded-full border border-[#7C3AED]/40"
            style={{ inset: "-10px" }}
          />
          {/* ping glow */}
          <div className="absolute inset-0 bg-[#FFB64D]/10 rounded-full animate-ping opacity-40" />
          {/* glass sphere */}
          <div
            className="absolute inset-0 rounded-full flex items-center justify-center z-10"
            style={{
              background: "rgba(33,28,43,0.85)",
              backdropFilter: "blur(16px)",
              boxShadow: "0 0 40px rgba(255,182,77,0.15)",
              border: "1px solid rgba(255,182,77,0.2)",
            }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStageIndex}
                initial={{ opacity: 0, scale: 0.5, rotate: -90 }}
                animate={{ opacity: 1, scale: 1,   rotate:   0 }}
                exit   ={{ opacity: 0, scale: 0.5, rotate:  90 }}
                transition={{ duration: 0.4, type: "spring" }}
              >
                {React.createElement(currentStage.icon, {
                  className: cn(
                    "w-14 h-14",
                    currentStageIndex === stages.length - 1
                      ? "text-[#34D399]"
                      : "text-[#FFB64D]"
                  ),
                })}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Title */}
        <div className="space-y-2">
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-black text-white tracking-tight"
          >
            {currentStageIndex === stages.length - 1
              ? "Analysis Complete!"
              : "Analyzing Whitespace..."}
          </motion.h2>
          <p className="text-[#9CA3AF] text-sm font-medium">{currentStage.label}</p>
          {/* Spec-defined progress bar */}
          <div className="w-full max-w-xs mx-auto mt-3">
            <div className="flex justify-between text-[10px] font-bold text-[#4B5563] mb-1 uppercase tracking-widest">
              <span>Progress</span><span>{progressPct}%</span>
            </div>
            <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-[#7C3AED] to-[#FFB64D]"
                initial={{ width: 0 }}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              />
            </div>
          </div>
        </div>

        {/* Stage list card */}
        <div
          className="w-full rounded-2xl p-8 text-left relative overflow-hidden"
          style={{
            background: "rgba(26,19,51,0.85)",
            backdropFilter: "blur(16px)",
            border: "1px solid rgba(255,255,255,0.06)",
            boxShadow: "0 25px 50px rgba(0,0,0,0.4)",
          }}
        >
          {/* scanning laser */}
          {currentStageIndex < stages.length - 1 && (
            <motion.div
              className="absolute left-0 right-0 h-[2px] opacity-40"
              style={{
                background: "linear-gradient(90deg,transparent,#FFB64D,transparent)",
              }}
              animate={{ top: ["0%", "100%", "0%"] }}
              transition={{ duration: 3, ease: "easeInOut", repeat: Infinity }}
            />
          )}

          <div className="space-y-5 relative z-10">
            {stages.map((stage, index) => {
              const isActive   = index === currentStageIndex;
              const isComplete = index < currentStageIndex;
              

              return (
                <motion.div
                  key={stage.id}
                  className="flex items-center gap-5"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0,   opacity: 1 }}
                  transition={{ delay: index * 0.12 }}
                >
                  {/* status icon */}
                  <div className="w-10 flex-shrink-0 flex justify-center items-center relative">
                    {isComplete ? (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring" }}
                      >
                        <CheckCircle2 className="w-6 h-6 text-[#34D399]" />
                      </motion.div>
                    ) : isActive ? (
                      <>
                        <div className="absolute w-8 h-8 rounded-full bg-[#FFB64D]/20 animate-ping" />
                        <Loader2 className="w-6 h-6 text-[#FFB64D] animate-spin relative z-10" />
                      </>
                    ) : (
                      <div className="w-2.5 h-2.5 rounded-full bg-white/15" />
                    )}
                  </div>

                  {/* label */}
                  <span
                    className={cn(
                      "text-sm tracking-wide transition-all duration-300 flex-1",
                      isComplete ? "text-[#9CA3AF] font-medium"
                        : isActive ? "text-[#FFB64D] font-bold text-base"
                        : "text-white/25 font-medium"
                    )}
                  >
                    {stage.label}
                  </span>

                  {/* status badge */}
                  {isActive && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full"
                      style={{ background: "rgba(255,182,77,0.12)", color: "#FFB64D" }}
                    >
                      Running
                    </motion.span>
                  )}
                  {isComplete && (
                    <span
                      className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full"
                      style={{ background: "rgba(52,211,153,0.10)", color: "#34D399" }}
                    >
                      Done
                    </span>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* ── Toggle button — opens full pipeline design page ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          <button
            onClick={() => setShowPipeline(true)}
            className="inline-flex items-center gap-2 text-[#9CA3AF] hover:text-white text-sm font-semibold tracking-wider uppercase border border-white/10 hover:border-[#7C3AED]/60 rounded-full px-8 py-3 transition-all"
            style={{ background: "rgba(255,255,255,0.04)" }}
          >
            <Sparkles className="w-3.5 h-3.5" />
            View Full Pipeline Details
          </button>
        </motion.div>

      </div>
    </div>
  );
}
