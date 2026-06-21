import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Logo } from "./Logo";
import { Activity, AlertTriangle, Target, FileText, ArrowRight } from "lucide-react";

/* ─── Ai Palette nav links ─── */
const NAV_LINKS = [
  { label: "Platform", testId: "nav-platform" },
  { label: "Solutions", testId: "nav-solutions" },
  { label: "Resources", testId: "nav-resources" },
  { label: "Company", testId: "nav-company" },
];

const STEPS = [
  { to: "/", label: "Value Propositions", end: true, testId: "stepper-scan" },
  { to: "/risk-flags", label: "Risk Flags", testId: "stepper-risk" },
  { to: "/claim-territory", label: "Claim Territory", testId: "stepper-territory" },
  { to: "/brand-brief", label: "Brand Brief", testId: "stepper-brief" },
];

/* ─────────────────────────────────────────────
   TOPBAR — dark header matching screenshot
   ───────────────────────────────────────────── */
const Topbar = () => (
  <header
    data-testid="site-header"
    style={{
      position: "sticky",
      top: 0,
      zIndex: 40,
      background: "#211F33",
      borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
    }}
  >
    <div
      className="max-w-[1360px] mx-auto px-6 lg:px-10"
      style={{ height: "72px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px" }}
    >
      {/* Logo */}
      <NavLink to="/" data-testid="logo-home" style={{ display: "flex", textDecoration: "none" }}>
        <Logo noPill={true} />
      </NavLink>

      {/* Primary nav */}
      <nav className="hidden md:flex items-center" style={{ gap: "4px" }}>
        {NAV_LINKS.map((l) => (
          <button
            key={l.label}
            data-testid={l.testId}
            style={{
              fontSize: "15px",
              fontWeight: 600,
              fontFamily: "'Mulish', sans-serif",
              color: "rgba(255, 255, 255, 0.85)",
              padding: "8px 16px",
              borderRadius: "6px",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              transition: "color 150ms, background 150ms",
              whiteSpace: "nowrap",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#F5A623";
              e.currentTarget.style.background = "rgba(245, 166, 35, 0.05)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "rgba(255, 255, 255, 0.85)";
              e.currentTarget.style.background = "transparent";
            }}
          >
            {l.label}
          </button>
        ))}
      </nav>

      {/* CTA group */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        {/* LOGIN button */}
        <button
          data-testid="nav-login"
          className="hidden sm:inline-flex items-center justify-center"
          style={{
            fontSize: "13px",
            fontWeight: 700,
            fontFamily: "'Mulish', sans-serif",
            color: "#F5A623",
            background: "transparent",
            border: "1px solid #F5A623",
            borderRadius: "30px",
            cursor: "pointer",
            transition: "all 150ms",
            padding: "8px 20px",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "#FFB64D";
            e.currentTarget.style.color = "#FFB64D";
            e.currentTarget.style.background = "rgba(245, 166, 35, 0.08)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "#F5A623";
            e.currentTarget.style.color = "#F5A623";
            e.currentTarget.style.background = "transparent";
          }}
        >
          Login
        </button>

        {/* Gold CTA */}
        <button
          data-testid="nav-cta-demo"
          style={{
            padding: "10px 24px",
            fontSize: "13px",
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            borderRadius: "30px",
            boxShadow: "none",
            background: "#F5A623",
            color: "#1A1035",
            border: "none",
            cursor: "pointer",
            transition: "all 150ms ease",
            fontFamily: "'Mulish', sans-serif",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#FFB64D";
            e.currentTarget.style.transform = "translateY(-1px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "#F5A623";
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          Schedule Demo
        </button>

        {/* Menu button */}
        <button
          style={{
            fontSize: "13px",
            fontWeight: 700,
            fontFamily: "'Mulish', sans-serif",
            color: "#FFFFFF",
            background: "rgba(255, 255, 255, 0.08)",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            borderRadius: "30px",
            cursor: "pointer",
            transition: "all 150ms",
            padding: "8px 18px",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.15)";
            e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.35)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)";
            e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.15)";
          }}
        >
          Menu
          <svg width="14" height="10" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 1H13M1 5H13M1 9H13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  </header>
);

/* ─────────────────────────────────────────────
   STAGE STEPPER — Styled as text tabs with bottom underlines
   ───────────────────────────────────────────── */
export const StageStepper = () => {
  const { pathname } = useLocation();
  const activeIdx = STEPS.findIndex((s) => (s.end ? pathname === s.to : pathname.startsWith(s.to)));

  return (
    <div
      data-testid="stage-stepper"
      style={{
        borderBottom: "1px solid #E5E7EB",
        background: "rgba(255, 255, 255, 0.8)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
      }}
    >
      <div className="max-w-[1360px] mx-auto px-6 lg:px-10">
        <div className="flex items-center gap-8 overflow-x-auto">
          {STEPS.map((s, i) => {
            const isActive = i === activeIdx;
            return (
              <NavLink
                key={s.to}
                to={s.to}
                data-testid={s.testId}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "16px 4px 12px 4px",
                  textDecoration: "none",
                  transition: "all 150ms ease",
                  flexShrink: 0,
                  fontSize: "14px",
                  fontWeight: isActive ? 800 : 700,
                  fontFamily: "'Mulish', sans-serif",
                  color: isActive ? "#7C3AED" : "#6B7280",
                  borderBottom: isActive ? "3px solid #7C3AED" : "3px solid transparent",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.color = "#7C3AED";
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.color = "#6B7280";
                }}
              >
                {s.label}
              </NavLink>
            );
          })}
        </div>
      </div>
    </div>
  );
};

/* ─── Footer — light glass footer ─── */
const FOOTER_COLS = [
  { h: "Platform", items: ["Foresight Engine", "Concept Genius", "ValueForge", "Arya AI", "Trend Radar"] },
  { h: "Company", items: ["About Us", "Careers", "Press", "Contact", "Partners"] },
  { h: "Resources", items: ["Research Reports", "Case Studies", "Webinars", "API Docs", "Blog"] },
];

const Footer = () => (
  <footer
    data-testid="site-footer"
    style={{
      background: "#1A1035", /* var(--color-ink) */
      color: "rgba(255, 255, 255, 0.7)",
      borderTop: "1px solid rgba(255, 255, 255, 0.08)",
      marginTop: "auto",
    }}
  >
    <div className="max-w-[1360px] mx-auto px-6 lg:px-10 py-16 grid md:grid-cols-5 gap-10">
      {/* Brand column */}
      <div className="md:col-span-2">
        <div style={{ display: "inline-block" }}>
          <Logo size="sm" noPill={true} />
        </div>

        <p style={{
          marginTop: "20px",
          fontSize: "14px",
          lineHeight: 1.75,
          fontFamily: "'Mulish', sans-serif",
          color: "rgba(255, 255, 255, 0.7)",
          maxWidth: "320px",
        }}>
          AI-powered decisions for the CPG industry. Discover, launch & grow with 61B+ consumer signals across 24 countries.
        </p>

        {/* Social icons */}
        <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
          {[
            { label: "LinkedIn", path: "M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z M4 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" },
            { label: "Twitter", path: "M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" },
            { label: "YouTube", path: "M22.54 6.42a2.78 2.78 0 0 0-1.94-1.96C18.88 4 12 4 12 4s-6.88 0-8.6.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.94 1.95C5.12 20 12 20 12 20s6.88 0 8.6-.47a2.78 2.78 0 0 0 1.94-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58zM9.75 15.02V8.98L15.5 12l-5.75 3.02z" },
          ].map(({ label, path }) => (
            <button
              key={label}
              aria-label={label}
              style={{
                width: "36px", height: "36px", borderRadius: "50%",
                border: "1px solid rgba(255,255,255,0.12)",
                background: "rgba(255,255,255,0.04)",
                display: "flex", alignItems: "center", justifyCenter: "center",
                cursor: "pointer", transition: "all 180ms",
                color: "rgba(255,255,255,0.5)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#F5A623";
                e.currentTarget.style.color = "#FFFFFF";
                e.currentTarget.style.background = "rgba(245, 166, 35, 0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
                e.currentTarget.style.color = "rgba(255,255,255,0.5)";
                e.currentTarget.style.background = "rgba(255,255,255,0.04)";
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d={path} />
              </svg>
            </button>
          ))}
        </div>
      </div>
      {FOOTER_COLS.map((col) => (
        <div key={col.h}>
          <h4 style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em", color: "#FFFFFF", marginBottom: "20px" }}>
            {col.h}
          </h4>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
            {col.items.map((item) => (
              <li
                key={item}
                style={{
                  fontSize: "13.5px",
                  fontFamily: "'Mulish', sans-serif",
                  color: "rgba(255, 255, 255, 0.7)",
                  cursor: "pointer",
                  transition: "color 150ms",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#F5A623")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255, 255, 255, 0.7)")}
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>

    {/* Bottom bar */}
    <div style={{ borderTop: "1px solid rgba(255, 255, 255, 0.08)" }}>
      <div
        className="max-w-[1360px] mx-auto px-6 lg:px-10 py-5"
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px", flexWrap: "wrap" }}
      >
        <span style={{ fontSize: "12.5px", fontFamily: "'Mulish', sans-serif", color: "rgba(255, 255, 255, 0.4)" }}>
          © 2026 Ai Palette · ValueForge · All rights reserved.
        </span>
        <div style={{ display: "flex", gap: "20px" }}>
          {["Privacy Policy", "Terms of Service", "Cookie Policy"].map((item) => (
            <span
              key={item}
              style={{
                fontSize: "12.5px",
                fontFamily: "'Mulish', sans-serif",
                color: "rgba(255, 255, 255, 0.4)",
                cursor: "pointer",
                transition: "color 150ms",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#F5A623")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255, 255, 255, 0.4)")}
            >
              {item}
            </span>
          ))}
        </div>
        <span style={{ fontSize: "12.5px", fontFamily: "'Mulish', sans-serif", color: "rgba(255, 255, 255, 0.4)" }}>
          61B+ signals · 24 countries · 18 languages
        </span>
      </div>
    </div>
  </footer>
);


/* ─── Layout wrapper ─── */
export const Layout = ({ children, hideStepper = false }) => {
  return (
    <div style={{ minHeight: "100vh", background: "transparent", display: "flex", flexDirection: "column" }}>
      <Topbar />
      {!hideStepper && <StageStepper />}
      <main style={{ flex: 1 }}>{children}</main>
      <Footer />
    </div>
  );
};
