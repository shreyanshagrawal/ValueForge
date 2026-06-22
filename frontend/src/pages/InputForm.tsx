import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, MessageSquare, FileText, Send, Target, Zap, ShieldCheck, Clock, CheckSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";

// ─── Animation variants ───────────────────────
const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.2 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 260, damping: 24 } },
};

// ─── Reusable dark-themed field wrapper ───────
function Field({
  label,
  required = true,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-[#9CA3AF]">
        {label}
        {required && <span className="text-[#F97316] text-sm leading-none">*</span>}
      </label>
      {children}
      {hint && <p className="text-[11px] text-[#6B7280] mt-1">{hint}</p>}
    </div>
  );
}

// ─── Shared input / select / textarea dark styles ─
const inputCls =
  "w-full bg-[#1A1333]/80 border border-[#FFB64D]/20 text-white placeholder:text-[#4B5563] " +
  "rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#FFB64D] " +
  "focus:ring-2 focus:ring-[#FFB64D]/25 transition-all duration-200 caret-[#FFB64D]";

const selectCls =
  "w-full appearance-none bg-[#1A1333]/80 border border-[#FFB64D]/20 text-white " +
  "rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#FFB64D] " +
  "focus:ring-2 focus:ring-[#FFB64D]/25 transition-all duration-200 cursor-pointer";

// ─── Chat question flow ──────────────────────
interface ChatMessage {
  id: number;
  type: "bot" | "user";
  text: string;
  field?: string;
  options?: { value: string; label: string }[];
  isTextarea?: boolean;
  isOptional?: boolean;
}

// ─── Simple markdown bold parser ──────────────
function renderBold(text: string) {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <span key={i} className="font-bold text-[#FFB64D]">{part}</span>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

// ═══════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════
export default function InputForm() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  // false = chat (front), true = form (back)
  const [isFlipped, setIsFlipped] = useState(false);

  // ── Options State ─────────────────────────
  const [categories, setCategories] = useState<{value: string, label: string}[]>([]);
  const [personas, setPersonas] = useState<{value: string, label: string}[]>([]);
  const [recentScans, setRecentScans] = useState<any[]>([]);

  // ── Form State ────────────────────────────
  const [useLiveData, setUseLiveData] = useState(false);
  const [formData, setFormData] = useState({
    productName: "",
    category: "",
    persona: "",
    priceTier: "",
    benefitIdea: "",
    keyIngredient: ""
  });

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const loadExample = (exampleNum: 1 | 2) => {
    setIsFlipped(true);
    if (exampleNum === 1) {
      setFormData({
        productName: "VitaBoost Hydration",
        category: "energy_drinks",
        persona: "fitness_millennial",
        priceTier: "premium",
        benefitIdea: "A clean-energy effervescent tablet focusing on sustained energy without synthetic additives.",
        keyIngredient: "Green Tea Extract"
      });
    } else {
      setFormData({
        productName: "ImmunoProtein Bar",
        category: "protein_bars",
        persona: "urban_health",
        priceTier: "mass",
        benefitIdea: "High protein bar with immune-boosting capabilities for daily urban health.",
        keyIngredient: "Whey Isolate + Vitamin C"
      });
    }
  };

  // ── Dynamic Questions ─────────────────────
  const QUESTIONS: Omit<ChatMessage, "id" | "type">[] = [
    { text: "👋 Hey there! Let's discover your product's true whitespace. What's your **product name**?", field: "productName" },
    { text: "Great choice! Now, which **category** does it fall into?", field: "category", options: categories.length > 0 ? categories : [{ value: "energy_drinks", label: "Energy Drinks" }] },
    { text: "Who's your **target persona**?", field: "persona", options: personas.length > 0 ? personas : [{ value: "fitness_millennial", label: "Fitness Millennial" }] },
    { text: "What **price tier** are you targeting?", field: "priceTier", options: [{ value: "mass", label: "Mass Market" }, { value: "mid", label: "Mid-Tier" }, { value: "premium", label: "Premium" }, { value: "ultra_premium", label: "Ultra-Premium" }] },
    { text: "Tell me about your **primary benefit idea**. Describe your core product concept in a few sentences.", field: "benefitIdea", isTextarea: true },
    { text: "Almost done! Any **key ingredient** you'd like to highlight? *(Optional — press Skip or type your answer)*", field: "keyIngredient", isOptional: true },
  ];

  // ── Chat state ────────────────────────────
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [chatInput, setChatInput] = useState("");
  const [chatData, setChatData] = useState<Record<string, string>>({});
  const [chatDone, setChatDone] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);

  // Initialize first chat message when QUESTIONS is ready
  useEffect(() => {
    if (chatMessages.length === 0 && QUESTIONS.length > 0) {
      setChatMessages([{ id: 0, type: "bot", ...QUESTIONS[0] }]);
    }
  }, [QUESTIONS.length]);

  useEffect(() => {
    // Fetch options and recent scans
    Promise.all([
      api.getCategories().catch(() => []),
      api.getPersonas().catch(() => [])
    ]).then(([catRes, perRes]) => {
      setCategories(catRes.categories || catRes || []);
      setPersonas(perRes.personas || perRes || []);
    });

    api.getScans().then((res: any) => {
      setRecentScans((res.scans || res).slice(0, 3));
    }).catch(console.error);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  useEffect(() => {
    if (!chatDone) chatInputRef.current?.focus();
  }, [currentStep, chatDone]);

  const advanceChat = (answer: string, displayText?: string) => {
    const q = QUESTIONS[currentStep];
    if (!q) return;

    // Add user reply
    const userMsg: ChatMessage = {
      id: chatMessages.length,
      type: "user",
      text: displayText || answer,
    };

    const nextStep = currentStep + 1;
    const newData = { ...chatData, [q.field!]: answer };
    setChatData(newData);

    if (nextStep < QUESTIONS.length) {
      // Add bot's next question after a brief delay
      const botMsg: ChatMessage = {
        id: chatMessages.length + 1,
        type: "bot",
        ...QUESTIONS[nextStep],
      };
      setChatMessages((prev) => [...prev, userMsg]);
      setTimeout(() => {
        setChatMessages((prev) => [...prev, botMsg]);
        setCurrentStep(nextStep);
        setChatInput("");
      }, 400);
    } else {
      // All done
      setChatMessages((prev) => [
        ...prev,
        userMsg,
      ]);
      setTimeout(() => {
        setChatMessages((prev) => [
          ...prev,
          {
            id: prev.length,
            type: "bot",
            text: "🚀 Perfect! All set. Click the button below to **Generate Intelligence**!",
          },
        ]);
        setChatDone(true);
      }, 400);
    }
  };

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = chatInput.trim();
    const q = QUESTIONS[currentStep];
    if (!q) return;

    if (q.isOptional && !trimmed) {
      advanceChat("", "Skipped");
      return;
    }
    if (!trimmed) return;
    advanceChat(trimmed);
  };

  const handleOptionClick = (value: string, label: string) => {
    advanceChat(value, label);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await api.createScan({ ...formData, useLiveData });
      navigate(`/scan-progress/${res.scanId || res.id || 'demo'}`);
    } catch (err) {
      console.error(err);
      navigate("/scan-progress/demo");
    }
  };

  const handleChatGenerate = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        productName: chatData.productName || "",
        category: chatData.category || "",
        persona: chatData.persona || "",
        priceTier: chatData.priceTier || "",
        benefitIdea: chatData.benefitIdea || "",
        keyIngredient: chatData.keyIngredient || "",
        useLiveData
      };
      const res = await api.createScan(payload);
      navigate(`/scan-progress/${res.scanId || res.id || 'demo'}`);
    } catch (err) {
      console.error(err);
      navigate("/scan-progress/demo");
    }
  };

  return (
    <div
      className="min-h-[calc(100vh-70px)] w-full flex flex-col justify-center px-4 lg:px-8 py-12 relative overflow-x-hidden"
      style={{ background: "#0C0A18" }}
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

      {/* Ambient glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#6B21A8]/20 blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[400px] h-[400px] rounded-full bg-[#EA580C]/10 blur-[100px] pointer-events-none z-0" />

      <motion.div
        className="w-full max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {/* ── Left Column: Hero Info ── */}
        <motion.div variants={itemVariants} className="flex flex-col justify-center max-w-2xl lg:pr-8">
          <h1 
            className="font-black text-[#F5F2EF] mb-6 leading-[1.15]" 
            style={{ fontFamily: "'Mulish', sans-serif", fontSize: "65px" }}
          >
            ValueForge
          </h1>
          <p 
            className="text-[#F5F2EF] leading-relaxed mb-10" 
            style={{ fontFamily: "'Mulish', sans-serif", fontSize: "28px" }}
          >
            AI-Driven Product Value Proposition & Positioning Intelligence.
          </p>

          <div className="flex flex-col gap-8 mt-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-[#7C3AED]/20 flex items-center justify-center shrink-0 border border-[#7C3AED]/30">
                <Target className="w-6 h-6 text-[#A78BFA]" />
              </div>
              <div>
                <h3 className="text-white font-bold text-xl mb-1.5" style={{ fontFamily: "'Mulish', sans-serif" }}>Find True Whitespace</h3>
                <p className="text-[#9CA3AF] text-base leading-relaxed">Map market gaps, consumer desire, and brand permission simultaneously to find ownable claim territories.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-[#EA580C]/20 flex items-center justify-center shrink-0 border border-[#EA580C]/30">
                <Zap className="w-6 h-6 text-[#FDBA74]" />
              </div>
              <div>
                <h3 className="text-white font-bold text-xl mb-1.5" style={{ fontFamily: "'Mulish', sans-serif" }}>Actionable Product Intel</h3>
                <p className="text-[#9CA3AF] text-base leading-relaxed">Get ranked value propositions complete with hero ingredients, format directions, and price architecture.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-[#34D399]/20 flex items-center justify-center shrink-0 border border-[#34D399]/30">
                <ShieldCheck className="w-6 h-6 text-[#6EE7B7]" />
              </div>
              <div>
                <h3 className="text-white font-bold text-xl mb-1.5" style={{ fontFamily: "'Mulish', sans-serif" }}>Failure Simulation</h3>
                <p className="text-[#9CA3AF] text-base leading-relaxed">Validate your ideas against historical category failures before spending a single rupee on launch.</p>
              </div>
            </div>
          </div>

          <div className="mt-10 flex gap-4">
            <button onClick={() => loadExample(1)} className="px-4 py-2 bg-white/5 hover:bg-white/10 text-[#FFB64D] rounded-full text-sm font-bold border border-[#FFB64D]/30 transition">
              Auto-fill Example 1
            </button>
            <button onClick={() => loadExample(2)} className="px-4 py-2 bg-white/5 hover:bg-white/10 text-[#FFB64D] rounded-full text-sm font-bold border border-[#FFB64D]/30 transition">
              Auto-fill Example 2
            </button>
          </div>

          {recentScans.length > 0 && (
            <div className="mt-10 border-t border-white/10 pt-6">
              <h4 className="text-white font-bold text-sm mb-4 uppercase tracking-widest flex items-center gap-2">
                <Clock className="w-4 h-4" /> Recent Scans
              </h4>
              <div className="space-y-3">
                {recentScans.map((scan, i) => (
                  <div key={i} onClick={() => navigate(`/scan/${scan.id}/whitespace-grid`)} className="bg-[#1A1333]/60 border border-white/5 p-3 rounded-xl cursor-pointer hover:bg-[#1A1333] transition">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-white text-sm">{scan.productName}</span>
                      <span className="text-[#34D399] text-xs font-bold">{scan.status}</span>
                    </div>
                    <div className="text-xs text-[#9CA3AF]">
                      {scan.category} • {scan.persona}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* ── Right Column: Form/Chat ── */}
        <div className="w-full max-w-[720px] mx-auto flex flex-col">

        {/* ── Flip Card Container ── */}
        <motion.div variants={itemVariants} className="w-full relative">
          <div
            className="relative w-full h-[680px]"
            style={{ perspective: "1200px" }}
          >
            <div
              className="relative w-full h-full transition-transform duration-700 ease-in-out"
              style={{
                transformStyle: "preserve-3d",
                transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
              }}
            >
              {/* ═══ FRONT — Chat Interface ═══ */}
              <div
                className="absolute inset-0 w-full h-full rounded-2xl overflow-hidden"
                style={{ backfaceVisibility: "hidden" }}
              >
                <div className="h-[3px] w-full bg-gradient-to-r from-[#FFB64D] via-[#F97316] to-[#7C3AED]" />
                <div className="bg-[#211C2B] backdrop-blur-xl border border-[#FFB64D]/15 border-t-0 rounded-b-2xl flex flex-col h-[calc(100%-3px)]">

                  {/* Chat header */}
                  <div className="px-6 py-3 border-b border-white/[0.06] flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#34D399] animate-pulse" />
                    <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#9CA3AF]">
                      ValueForge AI Assistant
                    </span>
                  </div>

                  {/* Chat messages area */}
                  <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3 scrollbar-thin">
                    <AnimatePresence>
                      {chatMessages.map((msg) => (
                        <motion.div
                          key={msg.id}
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{ type: "spring" as const, stiffness: 300, damping: 25 }}
                          className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                              msg.type === "user"
                                ? "bg-[#FFB64D]/15 border border-[#FFB64D]/25 text-white rounded-br-md"
                                : "bg-[#1A1333]/80 border border-white/[0.06] text-[#E5E7EB] rounded-bl-md"
                            }`}
                          >
                            {renderBold(msg.text)}
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>

                    {/* Option buttons for current question */}
                    {!chatDone && QUESTIONS[currentStep]?.options && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-wrap gap-2 pl-1"
                      >
                        {QUESTIONS[currentStep].options!.map((opt) => (
                          <button
                            key={opt.value}
                            onClick={() => handleOptionClick(opt.value, opt.label)}
                            className="px-3.5 py-1.5 rounded-full text-xs font-semibold border border-[#FFB64D]/30 text-[#FFB64D] bg-[#FFB64D]/5 hover:bg-[#FFB64D]/15 hover:border-[#FFB64D]/50 transition-all duration-200"
                          >
                            {opt.label}
                          </button>
                        ))}
                      </motion.div>
                    )}

                    {/* Generate button when done */}
                    {chatDone && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="pt-2 space-y-4"
                      >
                        <label className={`flex items-center gap-3 group w-fit mx-auto ${chatData.category !== 'protein_bars' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                          <div className="relative flex items-center justify-center">
                            <input 
                              type="checkbox" 
                              checked={useLiveData}
                              disabled={chatData.category !== 'protein_bars'}
                              onChange={(e) => setUseLiveData(e.target.checked)}
                              className="peer appearance-none w-5 h-5 border-2 border-[#FFB64D]/50 rounded bg-[#1A1333] checked:bg-[#FFB64D] checked:border-[#FFB64D] transition-colors disabled:cursor-not-allowed"
                            />
                            <CheckSquare className="absolute w-3.5 h-3.5 text-[#1A1333] pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" />
                          </div>
                          <span className="text-sm font-medium text-[#E5E7EB] group-hover:text-white transition-colors">
                            Use Live Market Data
                            {chatData.category !== 'protein_bars' && <span className="text-[#6B7280] ml-2">(Protein Bars only)</span>}
                          </span>
                        </label>
                        <button
                          type="button"
                          disabled={isSubmitting}
                          onClick={handleChatGenerate}
                          className="w-full flex items-center justify-center gap-3 bg-transparent border-2 border-[#FFB64D] hover:bg-[#FFB64D]/10 disabled:opacity-60 disabled:hover:bg-transparent text-[#FFB64D] font-bold uppercase tracking-[0.15em] text-[15px] rounded-full h-[60px] transition-all duration-300 shadow-[0_0_20px_rgba(255,182,77,0.15)] hover:shadow-[0_0_30px_rgba(255,182,77,0.3)]"
                        >
                          {isSubmitting ? (
                            <>
                              <div className="w-4 h-4 border-2 border-[#211C2B]/30 border-t-[#211C2B] rounded-full animate-spin" />
                              Initializing Scan...
                            </>
                          ) : (
                            <>
                              Generate Intelligence
                              <ArrowRight className="w-4 h-4" />
                            </>
                          )}
                        </button>
                      </motion.div>
                    )}

                    <div ref={chatEndRef} />
                  </div>

                  {/* Chat input bar */}
                  {!chatDone && !QUESTIONS[currentStep]?.options && (
                    <form
                      onSubmit={handleChatSubmit}
                      className="px-4 py-3 border-t border-white/[0.06] flex items-center gap-3"
                    >
                      <input
                        ref={chatInputRef}
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder={
                          QUESTIONS[currentStep]?.isOptional
                            ? "Type your answer or press Skip..."
                            : "Type your answer..."
                        }
                        className="flex-1 bg-[#1A1333]/80 border border-[#FFB64D]/20 text-white placeholder:text-[#4B5563] rounded-full px-4 py-2.5 text-sm focus:outline-none focus:border-[#FFB64D] focus:ring-2 focus:ring-[#FFB64D]/25 transition-all duration-200 caret-[#FFB64D]"
                      />
                      {QUESTIONS[currentStep]?.isOptional && (
                        <button
                          type="button"
                          onClick={() => advanceChat("", "Skipped")}
                          className="px-3 py-2 rounded-full text-xs font-bold text-[#9CA3AF] border border-white/10 hover:border-[#FFB64D]/30 hover:text-[#FFB64D] transition-all duration-200"
                        >
                          Skip
                        </button>
                      )}
                      <button
                        type="submit"
                        className="w-10 h-10 rounded-full bg-[#FFB64D] hover:bg-[#E5A344] flex items-center justify-center text-[#211C2B] transition-all duration-200 shrink-0"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </form>
                  )}
                </div>
              </div>

              {/* ═══ BACK — Form Interface ═══ */}
              <div
                className="absolute inset-0 w-full h-full rounded-2xl overflow-hidden"
                style={{
                  backfaceVisibility: "hidden",
                  transform: "rotateY(180deg)",
                }}
              >
                <div className="h-[3px] w-full bg-gradient-to-r from-[#FFB64D] via-[#F97316] to-[#7C3AED]" />
                <div className="bg-[#211C2B] backdrop-blur-xl border border-[#FFB64D]/15 border-t-0 rounded-b-2xl px-8 py-8 h-[calc(100%-3px)] overflow-y-auto">
                  
                  {/* Form Actions Header */}
                  <div className="flex justify-between items-center mb-6 border-b border-white/[0.06] pb-4">
                    <h3 className="text-white font-bold text-lg">Manual Entry</h3>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => loadExample(1)} className="px-3 py-1.5 bg-[#FFB64D]/10 hover:bg-[#FFB64D]/20 text-[#FFB64D] rounded text-xs font-bold transition">
                        Example 1
                      </button>
                      <button type="button" onClick={() => loadExample(2)} className="px-3 py-1.5 bg-[#FFB64D]/10 hover:bg-[#FFB64D]/20 text-[#FFB64D] rounded text-xs font-bold transition">
                        Example 2
                      </button>
                    </div>
                  </div>

                  <form onSubmit={handleFormSubmit} className="space-y-5">

                    {/* Row 1: Product Name + Category */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <Field label="Product Name">
                        <input
                          type="text"
                          name="productName"
                          value={formData.productName}
                          onChange={handleFormChange}
                          className={inputCls}
                          placeholder="e.g. VitaBoost Pro"
                          required
                        />
                      </Field>
                      <Field label="Category">
                        <div className="relative">
                          <select name="category" value={formData.category} onChange={handleFormChange} className={selectCls} required>
                            <option value="" disabled className="bg-[#110E22] text-[#4B5563]">Select category...</option>
                            {categories.map(c => (
                              <option key={c.value} value={c.value} className="bg-[#110E22]">{c.label}</option>
                            ))}
                          </select>
                          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280]">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                      </Field>
                    </div>

                    {/* Row 2: Target Persona + Price Tier */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <Field label="Target Persona">
                        <div className="relative">
                          <select name="persona" value={formData.persona} onChange={handleFormChange} className={selectCls} required>
                            <option value="" disabled className="bg-[#110E22] text-[#4B5563]">Select persona...</option>
                            {personas.map(p => (
                              <option key={p.value} value={p.value} className="bg-[#110E22]">{p.label}</option>
                            ))}
                          </select>
                          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280]">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                      </Field>
                      <Field label="Target Price Tier">
                        <div className="relative">
                          <select name="priceTier" value={formData.priceTier} onChange={handleFormChange} className={selectCls} required>
                            <option value="" disabled className="bg-[#110E22] text-[#4B5563]">Select price tier...</option>
                            <option value="mass" className="bg-[#110E22]">Mass Market</option>
                            <option value="mid" className="bg-[#110E22]">Mid-Tier</option>
                            <option value="premium" className="bg-[#110E22]">Premium</option>
                            <option value="ultra_premium" className="bg-[#110E22]">Ultra-Premium</option>
                          </select>
                          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280]">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                      </Field>
                    </div>

                    {/* Row 3: Primary Benefit Idea */}
                    <Field
                      label="Primary Benefit Idea"
                      hint="Our NLP engine will automatically extract key claim signals from your text."
                    >
                      <textarea
                        name="benefitIdea"
                        value={formData.benefitIdea}
                        onChange={handleFormChange}
                        className={`${inputCls} min-h-[130px] resize-y`}
                        placeholder={`Describe your core product idea in a few sentences. e.g., 'A high protein snack that focuses on natural ingredients and sustained energy for busy professionals...'`}
                        required
                      />
                    </Field>

                    {/* Row 4: Key Ingredient */}
                    <Field label="Key Ingredient" required={false}>
                      <input
                        type="text"
                        name="keyIngredient"
                        value={formData.keyIngredient}
                        onChange={handleFormChange}
                        className={inputCls}
                        placeholder="e.g. Ashwagandha, Whey Isolate"
                      />
                    </Field>

                    {/* Live Data toggle & Submit */}
                    <div className="pt-1 space-y-4">
                      <label className={`flex items-center gap-3 group w-fit ${formData.category !== 'protein_bars' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                        <div className="relative flex items-center justify-center">
                          <input 
                            type="checkbox" 
                            checked={useLiveData}
                            disabled={formData.category !== 'protein_bars'}
                            onChange={(e) => setUseLiveData(e.target.checked)}
                            className="peer appearance-none w-5 h-5 border-2 border-[#FFB64D]/50 rounded bg-[#1A1333] checked:bg-[#FFB64D] checked:border-[#FFB64D] transition-colors disabled:cursor-not-allowed"
                          />
                          <CheckSquare className="absolute w-3.5 h-3.5 text-[#1A1333] pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" />
                        </div>
                        <span className="text-sm font-medium text-[#E5E7EB] group-hover:text-white transition-colors">
                          Use Live Market Data (takes ~10s)
                          {formData.category !== 'protein_bars' && <span className="text-[#6B7280] ml-2">(Protein Bars only)</span>}
                        </span>
                      </label>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full flex items-center justify-center gap-3 bg-transparent border-2 border-[#FFB64D] hover:bg-[#FFB64D]/10 disabled:opacity-60 disabled:hover:bg-transparent text-[#FFB64D] font-bold uppercase tracking-[0.15em] text-sm rounded-full h-[54px] transition-all duration-300 shadow-[0_0_20px_rgba(255,182,77,0.15)] hover:shadow-[0_0_30px_rgba(255,182,77,0.3)] hover:-translate-y-[2px] active:translate-y-0"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Initializing Scan...
                          </>
                        ) : (
                          <>
                            Generate Intelligence
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </div>

                  </form>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Mode Toggle Button ── */}
        <motion.div variants={itemVariants} className="flex justify-center mt-5">
          <button
            onClick={() => setIsFlipped(!isFlipped)}
            className="flex items-center gap-2.5 px-5 py-2 rounded-full border border-[#FFB64D]/30 bg-[#211C2B]/80 text-[#FFB64D] text-xs font-bold uppercase tracking-[0.12em] hover:bg-[#FFB64D]/10 hover:border-[#FFB64D]/50 transition-all duration-300 shadow-[0_4px_20px_rgba(255,182,77,0.1)]"
          >
            {isFlipped ? (
              <>
                <MessageSquare className="w-3.5 h-3.5" />
                Switch to Chat Interface
              </>
            ) : (
              <>
                <FileText className="w-3.5 h-3.5" />
                Switch to Form Interface
              </>
            )}
          </button>
        </motion.div>
        
        </div>
      </motion.div>
    </div>
  );
}
