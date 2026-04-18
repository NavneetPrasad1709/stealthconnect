"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { SectionBadge } from "@/components/ui/SectionBadge"

const FONT = "var(--font-montserrat,'Montserrat',sans-serif)"

/* ─── Timing constants ─────────────────────────────────────────────────── */
const T_CARD_1  = 0        // Step 1 appears
const T_ARROW_1 = 1.05     // Arrow 1 draws
const T_CARD_2  = 1.5      // Step 2 appears
const T_ARROW_2 = 2.55     // Arrow 2 draws
const T_CARD_3  = 3.0      // Step 3 appears
const T_HOLD    = 5600     // ms — all visible → start fade
const T_FADE    = 800      // ms — fade-out duration
const T_RESET   = T_HOLD + T_FADE + 200  // ms — remount

/* ─── SVG Arrow between steps ──────────────────────────────────────────── */
function AnimatedArrow({ delay, gen }: { delay: number; gen: number }) {
  return (
    <div className="hidden lg:flex items-center justify-center w-14 shrink-0 pb-6">
      <svg
        width="56"
        height="36"
        viewBox="0 0 56 36"
        fill="none"
        className="overflow-visible"
      >
        <motion.path
          key={gen}
          d="M4 18 C14 4, 42 4, 52 18"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          fill="none"
          className="text-[#0D0D0D] dark:text-white/40"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ delay, duration: 0.6, ease: "easeInOut" }}
        />
        <motion.path
          key={`head-${gen}`}
          d="M44 12 L52 18 L44 24"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          className="text-[#0D0D0D] dark:text-white/40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: delay + 0.55, duration: 0.2 }}
        />
      </svg>
    </div>
  )
}

/* ─── Step 1 visual: LinkedIn profile card ─────────────────────────────── */
function Step1Visual({ phase }: { phase: "in" | "hold" | "out" }) {
  const [count, setCount] = useState(4187)
  const running = phase !== "out"

  useEffect(() => {
    if (!running) { setCount(4187); return }
    const id = setInterval(() => {
      setCount(c => c + Math.floor(Math.random() * 3) + 1)
    }, 220)
    return () => clearInterval(id)
  }, [running])

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: "var(--c-section-card)",
        border: "1px solid var(--c-border-light)",
        boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
      }}
    >
      {/* Profile header bar */}
      <div
        className="h-14 w-full"
        style={{ background: "linear-gradient(135deg,#0038FF 0%,#0A66C2 100%)" }}
      />
      {/* Avatar row */}
      <div className="px-5 pb-4">
        <div className="flex items-end justify-between -mt-5 mb-3">
          <div
            className="w-11 h-11 rounded-full border-2 border-white flex items-center justify-center text-white text-sm font-bold shadow-sm"
            style={{ background: "linear-gradient(135deg,#3b63f5,#7c3aed)" }}
          >
            JD
          </div>
          {/* Pulsing verified badge */}
          <motion.div
            animate={{ scale: [1, 1.04, 1], boxShadow: ["0 0 0 0 rgba(34,197,94,0.25)", "0 0 0 5px rgba(34,197,94,0)", "0 0 0 0 rgba(34,197,94,0)"] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold"
            style={{ background: "rgba(34,197,94,0.12)", color: "#15803d", border: "1px solid rgba(34,197,94,0.3)" }}
          >
            <span className="size-1.5 rounded-full bg-green-500 inline-block" />
            Profile detected
          </motion.div>
        </div>
        <p className="text-[12px] font-bold text-[#0D0D0D] dark:text-white leading-none" style={{ fontFamily: FONT }}>
          Jane Doe
        </p>
        <p className="text-[10px] text-[#6b7280] mt-0.5 mb-3" style={{ fontFamily: FONT }}>
          CTO · Acme Corp · San Francisco
        </p>
        {/* Live counter pill */}
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl w-full"
          style={{ background: "rgba(0,56,255,0.06)", border: "1px solid rgba(0,56,255,0.14)" }}
        >
          <span className="text-[10px] text-[#0038FF] font-semibold" style={{ fontFamily: FONT }}>
            LOOKUPS TODAY
          </span>
          <span
            className="ml-auto text-[13px] font-black text-[#0038FF] tabular-nums"
            style={{ fontFamily: FONT }}
          >
            {count.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  )
}

/* ─── Step 2 visual: Verification progress ──────────────────────────────── */
function Step2Visual({ phase }: { phase: "in" | "hold" | "out" }) {
  const [score, setScore] = useState(97.4)
  const running = phase !== "out"
  const bars = [
    { label: "Corporate Directories", width: 82, color: "#0038FF" },
    { label: "Domain Registries",     width: 68, color: "#0EA5E9" },
    { label: "B2B Enrichment DB",     width: 91, color: "#8B5CF6" },
  ]

  useEffect(() => {
    if (!running) { setScore(97.4); return }
    const id = setInterval(() => {
      setScore(s => {
        const next = s + (Math.random() * 0.04 - 0.01)
        return Math.min(99.4, Math.max(97.2, parseFloat(next.toFixed(2))))
      })
    }, 350)
    return () => clearInterval(id)
  }, [running])

  return (
    <div
      className="rounded-2xl p-4 space-y-3"
      style={{
        background: "var(--c-section-card)",
        border: "1px solid var(--c-border-light)",
        boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
      }}
    >
      {bars.map((bar, i) => (
        <div key={bar.label}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-semibold text-[#6b7280]" style={{ fontFamily: FONT }}>
              {bar.label}
            </span>
            <span
              className="size-1.5 rounded-full animate-pulse"
              style={{ background: "#22c55e" }}
            />
          </div>
          <div className="h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: bar.color }}
              initial={{ width: 0 }}
              animate={{ width: `${bar.width}%` }}
              transition={{ delay: i * 0.25 + 0.2, duration: 0.9, ease: "easeOut" }}
            />
          </div>
        </div>
      ))}

      {/* Pulsing accuracy pill */}
      <motion.div
        animate={{
          boxShadow: [
            "0 0 0 0 rgba(0,56,255,0)",
            "0 0 0 6px rgba(0,56,255,0.1)",
            "0 0 0 0 rgba(0,56,255,0)",
          ],
        }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        className="flex items-center justify-between px-3 py-2 rounded-xl mt-1"
        style={{ background: "#0038FF", border: "1px solid rgba(0,56,255,0.3)" }}
      >
        <span className="text-[10px] font-bold text-white/80 uppercase tracking-wider" style={{ fontFamily: FONT }}>
          Verified accuracy
        </span>
        <span className="text-[15px] font-black text-white tabular-nums" style={{ fontFamily: FONT }}>
          {score.toFixed(1)}%
        </span>
      </motion.div>
    </div>
  )
}

/* ─── Step 3 visual: Delivery card ─────────────────────────────────────── */
function Step3Visual({ phase }: { phase: "in" | "hold" | "out" }) {
  const [secs, setSecs] = useState(0)
  const running = phase !== "out"

  useEffect(() => {
    if (!running) { setSecs(0); return }
    const id = setInterval(() => setSecs(s => s + 1), 1000)
    return () => clearInterval(id)
  }, [running])

  const mm = String(Math.floor(secs / 60)).padStart(2, "0")
  const ss = String(secs % 60).padStart(2, "0")

  return (
    <div className="space-y-2.5">
      {/* Lime delivery card */}
      <div
        className="rounded-2xl p-4"
        style={{ background: "#CCFF00", boxShadow: "0 4px 20px rgba(204,255,0,0.25)" }}
      >
        <p
          className="text-[9px] font-bold uppercase tracking-widest text-[#0D0D0D]/60 mb-0.5"
          style={{ fontFamily: FONT }}
        >
          Est. Delivery Time
        </p>
        <p
          className="text-[28px] font-black text-[#0D0D0D] leading-none tabular-nums"
          style={{ fontFamily: FONT, letterSpacing: "-0.04em" }}
        >
          {mm}:{ss}
        </p>
        <p className="text-[10px] font-semibold text-[#0D0D0D]/60 mt-0.5" style={{ fontFamily: FONT }}>
          avg. 28 minutes · live
        </p>
      </div>

      {/* Contact preview */}
      <div
        className="rounded-xl p-3 space-y-1.5"
        style={{
          background: "var(--c-section-card)",
          border: "1px solid var(--c-border-light)",
          boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
        }}
      >
        {[
          { type: "Email",   val: "jane.doe@acmecorp.com", price: "$0.20", color: "#0038FF" },
          { type: "Phone",   val: "+1 (415) 555-0182",     price: "$1.00", color: "#8B5CF6" },
        ].map((row) => (
          <div key={row.type} className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[8.5px] font-bold uppercase tracking-widest text-[#9ca3af]" style={{ fontFamily: FONT }}>
                {row.type}
              </p>
              <p className="text-[11px] font-semibold text-[#0D0D0D] dark:text-white/90 truncate" style={{ fontFamily: FONT }}>
                {row.val}
              </p>
            </div>
            <span
              className="shrink-0 px-2 py-0.5 rounded-full text-[9.5px] font-bold text-white"
              style={{ background: row.color, fontFamily: FONT }}
            >
              {row.price}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── Step card wrapper ─────────────────────────────────────────────────── */
interface StepCardProps {
  number: string
  title: string
  subtitle: string
  visual: React.ReactNode
  delay: number
  phase: "in" | "hold" | "out"
  isMobile?: boolean
}

function StepCard({ number, title, subtitle, visual, delay, phase, isMobile }: StepCardProps) {
  if (isMobile) {
    return (
      <div
        className="flex-1 min-w-0 rounded-[20px] dark:bg-[#111111] dark:border dark:border-white/[0.07]"
        style={{
          background: "var(--c-section-card)",
          boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
          padding: "28px 24px 24px",
        }}
      >
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center text-[11px] font-black text-white shrink-0" style={{ background: "#0038FF", fontFamily: FONT }}>{number}</div>
          <div className="h-px flex-1 rounded-full" style={{ background: "linear-gradient(90deg,rgba(0,56,255,0.3),transparent)" }} />
        </div>
        <h3 className="uppercase mb-1.5" style={{ fontFamily: FONT, fontWeight: 800, fontSize: "clamp(14px,1.5vw,17px)", letterSpacing: "0.01em", lineHeight: 1.2, color: "var(--c-heading)" }}>{title}</h3>
        <p className="mb-5" style={{ fontFamily: FONT, fontWeight: 400, fontSize: 13, lineHeight: 1.5, color: "var(--c-body)" }}>{subtitle}</p>
        {visual}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={
        phase === "out"
          ? { opacity: 0, y: -12, transition: { duration: 0.6, ease: "easeInOut" } }
          : { opacity: 1, y: 0, transition: { delay, duration: 0.65, ease: [0.22, 1, 0.36, 1] } }
      }
      className="flex-1 min-w-0 rounded-[20px] dark:bg-[#111111] dark:border dark:border-white/[0.07]"
      style={{
        background: "var(--c-section-card)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
        padding: "28px 24px 24px",
      }}
    >
      {/* Step number */}
      <div className="flex items-center gap-2.5 mb-4">
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center text-[11px] font-black text-white shrink-0"
          style={{ background: "#0038FF", fontFamily: FONT }}
        >
          {number}
        </div>
        <div
          className="h-px flex-1 rounded-full"
          style={{ background: "linear-gradient(90deg,rgba(0,56,255,0.3),transparent)" }}
        />
      </div>

      {/* Title */}
      <h3
        className="uppercase mb-1.5"
        style={{
          fontFamily: FONT,
          fontWeight: 800,
          fontSize: "clamp(14px,1.5vw,17px)",
          letterSpacing: "0.01em",
          lineHeight: 1.2,
          color: "var(--c-heading)",
        }}
      >
        {title}
      </h3>

      {/* Subtitle */}
      <p
        className="mb-5"
        style={{ fontFamily: FONT, fontWeight: 400, fontSize: 13, lineHeight: 1.5, color: "var(--c-body)" }}
      >
        {subtitle}
      </p>

      {/* Visual */}
      {visual}
    </motion.div>
  )
}

/* ─── Main Section ──────────────────────────────────────────────────────── */
export default function HowItWorks() {
  const [gen, setGen] = useState(0)
  const [phase, setPhase] = useState<"in" | "hold" | "out">("in")

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("hold"), T_HOLD - 800)
    const t2 = setTimeout(() => setPhase("out"), T_HOLD)
    const t3 = setTimeout(() => {
      setPhase("in")
      setGen(g => g + 1)
    }, T_HOLD + T_FADE + 300)

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [gen])

  const steps = [
    {
      number: "01",
      title: "Paste a LinkedIn URL",
      subtitle: "Any public or private profile — no extension needed",
      delay: T_CARD_1,
      visual: <Step1Visual phase={phase} />,
    },
    {
      number: "02",
      title: "AI finds & verifies",
      subtitle: "Cross-referenced across 3 live verified databases",
      delay: T_CARD_2,
      visual: <Step2Visual phase={phase} />,
    },
    {
      number: "03",
      title: "Contact delivered",
      subtitle: "Pay only on success — avg. delivery in 28 minutes",
      delay: T_CARD_3,
      visual: <Step3Visual phase={phase} />,
    },
  ]

  return (
    <section
      id="how-it-works"
      className="dark:bg-[#080808]"
      style={{ background: "var(--c-section-bg)", padding: "96px 0", scrollMarginTop: "80px" }}
    >
      <div style={{ maxWidth: 1120, margin: "0 auto", padding: "0 20px" }}>

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-14"
        >
          <div className="inline-flex mb-6">
            <SectionBadge variant="light">How It Works</SectionBadge>
          </div>

          {/* Heading */}
          <h2
            style={{
              fontFamily: FONT,
              fontWeight: 800,
              fontSize: "clamp(1.85rem, 3.5vw, 2.75rem)",
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              color: "var(--c-heading)",
            }}
          >
            See how it{" "}
            <em style={{ color: "#0038FF", fontStyle: "italic", fontWeight: 800 }}>
              actually works.
            </em>
          </h2>

          <p
            className="mt-4 mx-auto"
            style={{ fontFamily: FONT, fontWeight: 400, fontSize: 15, lineHeight: 1.6, maxWidth: 440, color: "var(--c-body)" }}
          >
            Three steps. No subscription. No guesswork.
            Just verified contacts in your dashboard.
          </p>
        </motion.div>

        {/* ── Desktop animated cards ── */}
        <div key={gen} className="hidden lg:flex items-stretch gap-0">
          {steps.map((step, i) => (
            <div key={step.number} className="contents">
              <StepCard {...step} phase={phase} />
              {i < steps.length - 1 && (
                <AnimatedArrow
                  delay={i === 0 ? T_ARROW_1 : T_ARROW_2}
                  gen={gen}
                />
              )}
            </div>
          ))}
        </div>

        {/* ── Mobile static cards ── */}
        <div className="flex lg:hidden flex-col gap-4">
          {steps.map((step) => (
            <StepCard key={step.number} {...step} phase="hold" isMobile />
          ))}
        </div>

        {/* ── Loop indicator (desktop only) ── */}
        <div className="hidden lg:flex items-center justify-center gap-2 mt-10">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={`${gen}-${i}`}
              className="rounded-full"
              style={{ background: "#0038FF" }}
              initial={{ width: 6, height: 6, opacity: 0.25 }}
              animate={
                phase !== "out"
                  ? {
                      width: [6, i === Math.floor(((Date.now() / (T_HOLD / 3)) % 3)) ? 20 : 6, 6],
                      opacity: [0.25, i === 0 && phase === "in" ? 1 : i === 1 && phase === "hold" ? 1 : 0.25, 0.25],
                    }
                  : { opacity: 0.15, width: 6, height: 6 }
              }
              transition={{ delay: i * (T_HOLD / 3 / 1000) * 0.3, duration: 1, ease: "easeInOut" }}
            />
          ))}
        </div>


      </div>
    </section>
  )
}
