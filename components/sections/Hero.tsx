"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, Zap } from "lucide-react";
import { FONT_DISPLAY } from "@/lib/tokens";
import { useTypewriter } from "@/lib/useTypewriter";
import { LinkedInIcon } from "@/components/ui/LinkedInIcon";

/* ─── constants ─── */
const PHRASES = [
  "linkedin.com/in/sarah-chen-cto",
  "linkedin.com/in/john-smith-vp-sales",
  "linkedin.com/in/michael-torres-ciso",
  "Paste any LinkedIn profile URL…",
];

const GF = '"Arial Black", Impact, sans-serif'; // graphic font

/* ─── decorative SVG arrows ─── */
const ArrowCurvedLeft = () => (
  <svg viewBox="0 0 120 80" fill="none" className="w-full h-full" stroke="#CCFF00" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10,70 C20,20 60,10 100,30" />
    <path d="M85,16 L100,30 L84,40" />
  </svg>
);
const ArrowCurvedRight = () => (
  <svg viewBox="0 0 120 80" fill="none" className="w-full h-full" stroke="#CCFF00" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M110,70 C100,20 60,10 20,30" />
    <path d="M35,16 L20,30 L36,40" />
  </svg>
);

/* ─── spinning badge ─── */
const SpinBadge = () => (
  <Link href="/signup" className="block">
    <div className="relative w-24 h-24 md:w-28 md:h-28 bg-[#CCFF00] rounded-full flex items-center justify-center shadow-2xl rotate-[-8deg] hover:rotate-0 hover:scale-110 transition-all duration-500 cursor-pointer">
      <div className="absolute inset-0.5 animate-[spin_12s_linear_infinite]">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <path id="spinPath" d="M 50,50 m -34,0 a 34,34 0 1,1 68,0 a 34,34 0 1,1 -68,0" fill="none" />
          <text fill="black" style={{ fontSize: 10, fontFamily: GF, fontWeight: 900, letterSpacing: "0.2em" }}>
            <textPath href="#spinPath" startOffset="0%">START FREE • START FREE •&nbsp;</textPath>
          </text>
        </svg>
      </div>
      <ArrowRight className="w-7 h-7 text-black relative z-10" strokeWidth={3.5} />
    </div>
  </Link>
);

/* ─── floating contact result card ─── */
function ResultCard() {
  return (
    <motion.div
      initial={{ opacity: 0, x: -24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.5, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div
        animate={{ y: [0, -14, 0] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
        className="w-[200px] xl:w-[220px] rounded-[1.75rem] p-4 flex flex-col gap-3 rotate-[-6deg] hover:rotate-0 transition-[transform] duration-500 shadow-2xl"
        style={{
          background: "#ffffff",
          border: "1.5px solid rgba(0,0,0,0.06)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.25), 0 4px 12px rgba(0,0,0,0.1)",
        }}
      >
        {/* Header */}
        <div className="flex items-center gap-2.5 pb-2.5" style={{ borderBottom: "1px solid rgba(0,0,0,0.08)" }}>
          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white shrink-0" style={{ background: "#0A66C2" }}>
            <LinkedInIcon size={13} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-[#0D0D0D] leading-none" style={{ fontFamily: GF }}>Contact Found</p>
            <p className="text-[8.5px] mt-0.5" style={{ color: "#6b7280" }}>28 min · 1 credit used</p>
          </div>
          <span className="w-2 h-2 rounded-full bg-[#CCFF00] animate-pulse shrink-0" />
        </div>

        {/* Person */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-[10px] font-black text-white shrink-0" style={{ background: "linear-gradient(135deg,#3b5bdb,#7048e8)" }}>
            SC
          </div>
          <div>
            <p className="text-[12px] font-black text-[#0D0D0D] leading-tight" style={{ fontFamily: GF }}>Sarah Chen</p>
            <p className="text-[9px]" style={{ color: "#6b7280" }}>CTO · Acme Corp</p>
          </div>
        </div>

        {/* Contacts */}
        {[
          { label: "Email", val: "s.chen@acmecorp.com" },
          { label: "Phone", val: "+1 (415) 555-0147" },
        ].map(r => (
          <div
            key={r.label}
            className="px-3 py-2 rounded-xl flex flex-col gap-0.5"
            style={{ background: "rgba(0,56,255,0.05)", border: "1px solid rgba(0,56,255,0.1)" }}
          >
            <p className="text-[7.5px] uppercase tracking-widest font-bold" style={{ color: "#9ca3af" }}>{r.label}</p>
            <p className="text-[10px] font-semibold text-[#0D0D0D] truncate" style={{ fontFamily: FONT_DISPLAY }}>{r.val}</p>
          </div>
        ))}

        {/* Verified */}
        <div className="flex items-center justify-center gap-1.5 pt-0.5 px-2 py-1 rounded-lg" style={{ background: "rgba(204,255,0,0.15)", border: "1px solid rgba(204,255,0,0.4)" }}>
          <ShieldCheck className="w-3 h-3" style={{ color: "#4a7c00" }} />
          <span className="text-[8.5px] font-bold" style={{ color: "#4a7c00", fontFamily: GF }}>AI-verified · 97.2% accurate</span>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─── floating stats card ─── */
function StatsCard() {
  const stats = [
    { val: "2.4M+", label: "Contacts found", highlight: true },
    { val: "97.2%", label: "Verified accuracy", highlight: false },
    { val: "28 min", label: "Avg. delivery", highlight: false },
    { val: "190+",  label: "Countries", highlight: false },
  ];
  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.65, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div
        animate={{ y: [0, -12, 0] }}
        transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="w-[186px] xl:w-[200px] rounded-[1.75rem] p-4 flex flex-col gap-2.5 rotate-[5deg] hover:rotate-0 transition-[transform] duration-500 shadow-2xl"
        style={{
          background: "#ffffff",
          border: "1.5px solid rgba(0,0,0,0.06)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.25), 0 4px 12px rgba(0,0,0,0.1)",
        }}
      >
        <p className="text-[8px] font-black uppercase tracking-[0.2em] text-center mb-0.5" style={{ color: "#9ca3af", fontFamily: GF }}>
          Platform Stats
        </p>
        {stats.map((s, i) => (
          <div key={s.label}>
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-semibold" style={{ color: "#6b7280", fontFamily: FONT_DISPLAY }}>{s.label}</span>
              <span className="text-[15px] font-black leading-none" style={{ color: s.highlight ? "#0038FF" : "#0D0D0D", fontFamily: GF }}>{s.val}</span>
            </div>
            {i < stats.length - 1 && (
              <div className="mt-2.5 h-px" style={{ background: "rgba(0,0,0,0.06)" }} />
            )}
          </div>
        ))}
      </motion.div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════
   Main Hero
═══════════════════════════════════════ */
export default function Hero() {
  const typed = useTypewriter(PHRASES, 2800);
  const inputRef = useRef<HTMLInputElement>(null);
  const [focused, setFocused] = useState(false);

  return (
    <section
      className="relative flex flex-col overflow-hidden selection:bg-[#CCFF00] selection:text-black"
      style={{ background: "#0038FF", minHeight: "100svh" }}
    >
      {/* ── grid texture ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.06) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.06) 1px,transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* ── radial glow ── */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: "-10%", left: "50%", transform: "translateX(-50%)",
          width: 1000, height: 700,
          background: "radial-gradient(ellipse at top,rgba(255,255,255,0.1) 0%,transparent 65%)",
        }}
      />

      {/* ════════ MAIN CONTENT ════════ */}
      {/*
        3-col grid on lg+:  [left card zone] [center] [right card zone]
        Single col on mobile: center content only, cards stack below
      */}
      <main className="relative z-20 flex-1 w-full max-w-[1400px] mx-auto px-4 md:px-6">

        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr_240px] xl:grid-cols-[270px_1fr_270px] items-center gap-6 xl:gap-10 pt-6 pb-10 lg:pt-10 lg:pb-16">

          {/* ── LEFT: result card (desktop) ── */}
          <div className="hidden lg:flex flex-col items-center justify-center gap-6">
            <ResultCard />
            {/* arrow pointing right toward center */}
            <div className="w-24 h-14 self-end mr-4 mt-2 opacity-80">
              <ArrowCurvedLeft />
            </div>
          </div>

          {/* ── CENTER: headline + search ── */}
          <div className="flex flex-col items-center text-center mt-7">



            {/* ── Giant stacked type ── */}
            <div className="w-full flex flex-col items-center space-y-0 md:space-y-1 mb-8">

              {/* FIND */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.14, ease: [0.22, 1, 0.36, 1] }}
                className="w-full flex justify-start pl-[8%] md:pl-[12%]"
              >
                <span
                  className="text-[clamp(3.8rem,10vw,8rem)] font-black leading-[0.88] tracking-tighter uppercase text-[#CCFF00]"
                  style={{
                    fontFamily: GF,
                    textShadow: "3px 3px 0 #001A99,6px 6px 0 #001A99,9px 9px 0 #001A99,12px 12px 0 rgba(0,26,153,0.5)",
                  }}
                >
                  FIND
                </span>
              </motion.div>

              {/* ANYONE'S */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="w-full flex justify-center"
              >
                <span
                  className="text-[clamp(3rem,8.5vw,7.5rem)] font-black leading-[0.88] tracking-tighter uppercase text-white"
                  style={{
                    fontFamily: GF,
                    textShadow: "3px 3px 0 #001A99,6px 6px 0 #001A99,9px 9px 0 #001A99,12px 12px 0 rgba(0,26,153,0.5)",
                  }}
                >
                  ANYONE'S
                </span>
              </motion.div>

              {/* CONTACT */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.26, ease: [0.22, 1, 0.36, 1] }}
                className="w-full flex justify-end pr-[8%] md:pr-[12%]"
              >
                <span
                  className="text-[clamp(3.2rem,9vw,8rem)] font-black leading-[0.88] tracking-tighter uppercase text-white"
                  style={{
                    fontFamily: GF,
                    textShadow: "3px 3px 0 #001A99,6px 6px 0 #001A99,9px 9px 0 #001A99,12px 12px 0 rgba(0,26,153,0.5)",
                  }}
                >
                  CONTACT
                </span>
              </motion.div>
            </div>

            {/* ── Hook ── */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.33 }}
              className="mb-8 max-w-[44ch] space-y-3"
            >
              <p
                className="text-[20px] md:text-[23px] font-bold leading-snug text-white"
                style={{ fontFamily: FONT_DISPLAY, letterSpacing: "-0.025em" }}
              >
                Your next deal is one LinkedIn URL away.
              </p>
              <p
                className="text-[15px] md:text-[16px] leading-relaxed font-medium"
                style={{ color: "rgba(255,255,255,0.82)", fontFamily: FONT_DISPLAY }}
              >
                Stop guessing. Get a verified email + direct phone number
                delivered in&nbsp;
                <span
                  className="font-black px-1.5 py-0.5 rounded-md"
                  style={{ color: "#000", background: "#CCFF00" }}
                >
                  under 30 minutes
                </span>
                {" "}— or you don't pay.
              </p>
            </motion.div>

            {/* ── Search bar ── */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.38, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full max-w-[540px]"
            >
              {/* Always-on lime ambient glow */}
              <div
                className="absolute -inset-[6px] rounded-[26px] pointer-events-none"
                style={{
                  background: "transparent",
                  boxShadow: focused
                    ? "0 0 0 3px #CCFF00, 0 0 60px rgba(204,255,0,0.35), 0 0 120px rgba(204,255,0,0.15)"
                    : "0 0 0 2px rgba(204,255,0,0.45), 0 0 40px rgba(204,255,0,0.2)",
                  transition: "box-shadow 0.25s ease",
                  borderRadius: 26,
                }}
              />

              {/* White card */}
              <div
                className="relative flex items-center gap-3 p-2.5 w-full cursor-text"
                style={{
                  background: "#ffffff",
                  borderRadius: 20,
                  boxShadow: "0 20px 60px rgba(0,0,0,0.35), 0 4px 16px rgba(0,0,0,0.2)",
                }}
                onClick={() => inputRef.current?.focus()}
              >
                {/* LinkedIn badge */}
                <div className="shrink-0 w-11 h-11 rounded-[13px] flex items-center justify-center" style={{ background: "#0A66C2" }}>
                  <LinkedInIcon size={18} />
                </div>

                {/* Input + typewriter */}
                <div className="flex-1 min-w-0 relative h-[26px] flex items-center">
                  <input
                    ref={inputRef}
                    type="text"
                    className="absolute inset-0 w-full bg-transparent outline-none text-[14px] z-10"
                    style={{ color: "#0a0a0a", fontFamily: FONT_DISPLAY, caretColor: "#0038FF" }}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                  />
                  <span
                    className="absolute inset-0 flex items-center pointer-events-none select-none text-[14px]"
                    style={{ color: "rgba(0,0,0,0.28)", fontFamily: FONT_DISPLAY }}
                    aria-hidden
                  >
                    {typed}
                    <motion.span
                      animate={{ opacity: [1, 0, 1] }}
                      transition={{ duration: 0.9, repeat: Infinity }}
                      className="inline-block w-[2px] h-[0.8em] ml-[2px] align-middle rounded-sm"
                      style={{ background: "#0038FF" }}
                    />
                  </span>
                </div>

                {/* CTA */}
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="shrink-0">
                  <Link
                    href="/signup"
                    className="flex items-center gap-2 px-5 py-3 rounded-[14px] text-[13px] font-black text-black whitespace-nowrap"
                    style={{
                      background: "#CCFF00",
                      fontFamily: GF,
                      boxShadow: "0 4px 20px rgba(204,255,0,0.6), 0 2px 8px rgba(0,0,0,0.15)",
                      letterSpacing: "-0.01em",
                    }}
                  >
                    Find Contact
                    <ArrowRight className="w-4 h-4" strokeWidth={3} />
                  </Link>
                </motion.div>
              </div>

              {/* Below bar hint */}
              <p className="mt-2.5 text-center text-[11px] font-semibold" style={{ color: "rgba(255,255,255,0.7)", fontFamily: FONT_DISPLAY }}>
                e.g.{" "}
                <span className="font-bold" style={{ color: "#CCFF00" }}>
                  linkedin.com/in/sarah-chen-cto
                </span>
              </p>
            </motion.div>

            {/* ── Badges row ── */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.48, duration: 0.45 }}
              className="flex flex-wrap items-center justify-center gap-2.5 mt-6"
            >
              {/* Try it free — primary lime badge */}
              <Link
                href="/signup"
                className="flex items-center gap-2 px-4 py-2 rounded-full text-[12px] font-black text-black transition-all duration-200 hover:scale-105 active:scale-95"
                style={{
                  background: "#CCFF00",
                  fontFamily: GF,
                  boxShadow: "0 2px 14px rgba(204,255,0,0.45)",
                }}
              >
                <Zap className="w-3.5 h-3.5" strokeWidth={3} />
                Try it free
              </Link>

              {/* No subscription */}
              <span
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[12px] font-semibold"
                style={{
                  color: "#fff",
                  background: "rgba(255,255,255,0.12)",
                  border: "1px solid rgba(255,255,255,0.22)",
                  fontFamily: FONT_DISPLAY,
                }}
              >
                <span style={{ color: "#CCFF00", fontSize: 14 }}>✓</span> No subscription
              </span>

              {/* Pay per result */}
              <span
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[12px] font-semibold"
                style={{
                  color: "#fff",
                  background: "rgba(255,255,255,0.12)",
                  border: "1px solid rgba(255,255,255,0.22)",
                  fontFamily: FONT_DISPLAY,
                }}
              >
                <span style={{ color: "#CCFF00", fontSize: 14 }}>✓</span> Pay per result
              </span>

              {/* 97.2% verified */}
              <span
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[12px] font-semibold"
                style={{
                  color: "#fff",
                  background: "rgba(255,255,255,0.12)",
                  border: "1px solid rgba(255,255,255,0.22)",
                  fontFamily: FONT_DISPLAY,
                }}
              >
                <ShieldCheck className="w-3.5 h-3.5" style={{ color: "#CCFF00" }} strokeWidth={2.5} />
                97.2% verified
              </span>

              {/* GDPR */}
              <span
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[12px] font-semibold"
                style={{
                  color: "#fff",
                  background: "rgba(255,255,255,0.12)",
                  border: "1px solid rgba(255,255,255,0.22)",
                  fontFamily: FONT_DISPLAY,
                }}
              >
                <span style={{ color: "#CCFF00", fontSize: 14 }}>✓</span> GDPR compliant
              </span>
            </motion.div>

            {/* ── Mobile cards ── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.55 }}
              className="flex lg:hidden gap-4 justify-center mt-10 w-full overflow-x-auto pb-2"
            >
              <ResultCard />
              <StatsCard />
            </motion.div>
          </div>

          {/* ── RIGHT: stats card (desktop) ── */}
          <div className="hidden lg:flex flex-col items-center justify-center gap-6">
            {/* arrow pointing left toward center */}
            <div className="w-24 h-14 self-start ml-4 mb-2 opacity-80">
              <ArrowCurvedRight />
            </div>
            <StatsCard />
            {/* Spin badge below stats card */}
            <div className="mt-4">
              <SpinBadge />
            </div>
          </div>

        </div>
      </main>

      {/* ── bottom divider wave ── */}
      <div className="relative z-10 w-full overflow-hidden leading-none" style={{ height: 48 }}>
        <svg viewBox="0 0 1440 48" preserveAspectRatio="none" className="absolute bottom-0 w-full h-full" fill="white">
          <path d="M0,48 C360,0 1080,0 1440,48 L1440,48 L0,48 Z" />
        </svg>
      </div>
    </section>
  );
}
