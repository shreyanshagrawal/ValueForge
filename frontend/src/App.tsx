import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Menu } from "lucide-react";
import InputForm from "./pages/InputForm";
import ScanProgress from "./pages/ScanProgress";
import FailureDashboard from "./pages/FailureDashboard";
import ValueProps from "./pages/ValueProps";
import CompetitiveMap from "./pages/CompetitiveMap";
import WhitespaceGrid from "./pages/WhitespaceGrid";
import AuthenticClaimTerritory from "./pages/AuthenticClaimTerritory";
import BrandBrief from "./pages/BrandBrief";

// Design Pages (Copied from the provided design folder)
import DesignScanProgress from "./pages/design/ScanProgress";
import DesignAuthenticClaimTerritory from "./pages/design/AuthenticClaimTerritory";
import DesignBrandBriefPreview from "./pages/design/BrandBriefPreview";
import DesignMisalignmentRiskFlags from "./pages/design/MisalignmentRiskFlags";

function GlobalNavbar() {
  const [isOpen, setIsOpen] = useState(false);

  const location = useLocation();
  const scanMatch = location.pathname.match(/^\/scan(?:-progress)?\/([^/]+)/);
  const scanId = scanMatch ? scanMatch[1] : "";
  const basePath = scanId ? `/scan/${scanId}` : "";

  const menuLinks = [
    { name: "Failures", href: scanId ? `${basePath}/failures` : "/input" },
    { name: "Risk Flags", href: scanId ? `${basePath}/risk-flags` : "/design/risk-flags" },
    { name: "Competitive Map", href: scanId ? `${basePath}/competitive-map` : "/input" },
    { name: "Whitespace Grid", href: scanId ? `${basePath}/grid` : "/input" },
    { name: "Authentic Claim", href: scanId ? `${basePath}/territory` : "/input" },
    { name: "Value Propositions", href: scanId ? `${basePath}/value-props` : "/input" },
    { name: "Brand Brief", href: scanId ? `${basePath}/brand-brief` : "/input" },
  ];

  return (
    <>
      {/* ── Top Bar ── */}
      <nav className="fixed top-0 w-full z-[40] bg-[#0C0A18]/90 backdrop-blur-md border-b border-white/5" style={{ fontFamily: "'Mulish', sans-serif" }}>
        <div className="max-w-[1400px] mx-auto px-6 h-[80px] flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center shrink-0">
            <span className="text-[32px] font-black text-white leading-none tracking-tight">
              ai
            </span>
            <span className="relative w-[26px] h-[34px] mx-[2px] inline-flex items-end">
              <span className="absolute bottom-[4px] right-0 w-[18px] h-[18px] rounded-full bg-[#EF4444] shadow-[0_0_15px_rgba(239,68,68,0.5)]" />
              <span className="absolute top-[2px] left-[1px] w-[12px] h-[12px] rounded-full bg-[#F97316]" />
            </span>
            <span className="text-[32px] font-black text-white leading-none tracking-tight">
              palette
            </span>
          </Link>

          {/* Center: Nav Links */}
          <div className="hidden lg:flex items-center">
            {["Platform", "Solutions", "Company", "Resources"].map(item => (
              <a
                key={item}
                href="#"
                className="flex items-center gap-1.5 px-[15px] py-2 text-[17px] font-semibold hover:text-white transition-colors"
                style={{ color: "#F5F2EF" }}
              >
                {item}
                <svg className="w-[14px] h-[14px] opacity-60 mt-[2px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </svg>
              </a>
            ))}
          </div>

          {/* Right: CTA Buttons & Menu Toggle */}
          <div className="flex items-center gap-3">
            <a
              href="#"
              className="hidden md:flex px-7 py-2.5 text-[14px] font-extrabold uppercase tracking-[0.06em] text-[#FFB64D] border-2 border-[#FFB64D] rounded-full hover:bg-[#FFB64D]/10 transition-all duration-200"
            >
              Login
            </a>
            <a
              href="#"
              className="hidden md:flex px-7 py-2.5 text-[14px] font-extrabold uppercase tracking-[0.06em] text-[#211F33] bg-[#FFB64D] border-2 border-[#FFB64D] rounded-full hover:bg-[#E5A344] transition-all duration-200"
            >
              Schedule Demo
            </a>
            <button 
              onClick={() => setIsOpen(true)}
              className="flex items-center gap-3 px-5 py-2.5 ml-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-white"
            >
              <span className="text-sm font-black uppercase tracking-widest text-[#EF4444] hidden sm:inline">Menu</span>
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      {/* ── Brutalist Menu Overlay ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: "-100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "-100%" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[60] bg-[#0C0A18] overflow-y-auto flex flex-col"
            style={{ fontFamily: "'Mulish', sans-serif" }}
          >
            {/* Ambient Background Glows */}
            <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-[#EF4444]/10 blur-[150px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-[#F97316]/5 blur-[150px] rounded-full pointer-events-none" />

            <div className="max-w-[1400px] mx-auto w-full px-6 flex-1 flex flex-col relative z-10">
              {/* Overlay Header */}
              <div className="h-[100px] flex items-center justify-between border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-[#EF4444]" />
                  <span className="text-white text-sm font-black uppercase tracking-[0.2em]">Menu</span>
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="w-14 h-14 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-[#EF4444] hover:border-[#EF4444] transition-all duration-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Main Links */}
              <div className="flex-1 flex flex-col justify-center py-12">
                {menuLinks.map((link, i) => (
                  <motion.div
                    key={link.name}
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + (i * 0.1), duration: 0.5 }}
                  >
                    <Link
                      to={link.href}
                      onClick={() => setIsOpen(false)}
                      className="group relative block border-b border-white/5 py-4 md:py-8 text-4xl md:text-7xl font-black text-white hover:text-[#EF4444] transition-colors duration-300 uppercase tracking-tighter"
                    >
                      {link.name}
                      <span className="absolute top-1/2 -translate-y-1/2 right-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="w-4 h-4 md:w-8 md:h-8 bg-[#EF4444]" />
                      </span>
                    </Link>
                  </motion.div>
                ))}
              </div>

              {/* Footer Section */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-10 py-10 border-t border-white/10"
              >
                <div>
                  <span className="block text-[#6B7280] text-xs font-black uppercase tracking-[0.2em] mb-4">(Others)</span>
                  <div className="flex flex-col gap-2">
                    <Link to="/design/scan-progress" onClick={() => setIsOpen(false)} className="text-lg text-white font-bold hover:text-[#EF4444] transition-colors">Design: Scan</Link>
                    <Link to="/design/territory" onClick={() => setIsOpen(false)} className="text-lg text-white font-bold hover:text-[#EF4444] transition-colors">Design: Territory</Link>
                    <Link to="/design/brand-brief" onClick={() => setIsOpen(false)} className="text-lg text-white font-bold hover:text-[#EF4444] transition-colors">Design: Brief</Link>
                  </div>
                </div>
                <div>
                  <span className="block text-[#6B7280] text-xs font-black uppercase tracking-[0.2em] mb-4">(Contact)</span>
                  <a href="mailto:hello@aipalette.com" className="text-2xl md:text-3xl font-black text-[#EF4444] hover:text-white transition-colors">
                    hello@aipalette.com
                  </a>
                </div>
                <div>
                  <span className="block text-[#6B7280] text-xs font-black uppercase tracking-[0.2em] mb-4">(Socials)</span>
                  <div className="grid grid-cols-2 gap-4">
                    {["LinkedIn", "X/Twitter", "Instagram", "Behance"].map(social => (
                      <a key={social} href="#" className="text-lg text-white font-bold flex items-center gap-1 hover:text-[#EF4444] transition-colors">
                        {social}
                        <span className="text-[#6B7280] text-sm font-normal transition-transform group-hover:-translate-y-1 group-hover:translate-x-1">↗</span>
                      </a>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-brand-light font-sans text-brand-body">
        <GlobalNavbar />

        {/* Main Content Area */}
        <main className="pt-[70px]">
          <Routes>
            <Route path="/" element={<Navigate to="/input" replace />} />
            <Route path="/input" element={<InputForm />} />
            {/* Scan progress: support both /scan-progress/:scanId and /scan/:scanId/progress */}
            <Route path="/scan-progress/:scanId" element={<ScanProgress />} />
            <Route path="/scan/:scanId/progress" element={<ScanProgress />} />
            <Route path="/scan/:scanId/failures" element={<FailureDashboard />} />
            <Route path="/scan/:scanId/competitive-map" element={<CompetitiveMap />} />
            <Route path="/scan/:scanId/grid" element={<WhitespaceGrid />} />
            <Route path="/scan/:scanId/territory" element={<AuthenticClaimTerritory />} />
            <Route path="/scan/:scanId/brand-brief" element={<BrandBrief />} />
            <Route path="/scan/:scanId/value-props" element={<ValueProps />} />
            {/* Spec-defined alias: /propositions maps to same ValueProps page */}
            <Route path="/scan/:scanId/propositions" element={<ValueProps />} />
            <Route path="/scan/:scanId/risk-flags" element={<DesignMisalignmentRiskFlags />} />
            
            {/* Design Mockup Routes — directly accessible */}
            <Route path="/design/scan-progress" element={<DesignScanProgress />} />
            <Route path="/design/risk-flags" element={<DesignMisalignmentRiskFlags />} />
            <Route path="/design/territory" element={<DesignAuthenticClaimTerritory />} />
            <Route path="/design/brand-brief" element={<DesignBrandBriefPreview />} />

            {/* Top-level shortcuts (used by design pages navigation) */}
            <Route path="/risk-flags" element={<DesignMisalignmentRiskFlags />} />
            <Route path="/brand-brief" element={<DesignBrandBriefPreview />} />

            <Route path="*" element={<Navigate to="/input" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
