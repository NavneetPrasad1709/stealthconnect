"use client"

import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import { motion, useInView } from "framer-motion"
import { ArrowRight, Mail, Phone, CheckCircle2, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

/* ─── Types ──────────────────────────────────────────────────────────────── */
interface ContactCard {
  id: string
  name: string
  title: string
  company: string
  initials: string
  avatarGradient: string
  email: string
  phone: string
  rotation: number
}
interface StatItem    { value: string; label: string }
interface FeatureItem { title: string; description: string }

export interface ImageCarouselHeroProps {
  title: string
  subtitle?: string
  description: string
  ctaText: string
  onCtaClick?: () => void
  cards: ContactCard[]
  features?: FeatureItem[]
  stats?: StatItem[]
  /** Words/phrases within title to render as blue italic accent */
  accentWords?: string[]
}

/* ─── Contact Card ───────────────────────────────────────────────────────── */
function ContactCardItem({ card }: { card: ContactCard }) {
  return (
    <div
      className="w-full h-full rounded-2xl overflow-hidden flex flex-col"
      style={{
        background: "white",
        boxShadow: "0 12px 40px rgba(59,130,246,0.14), 0 2px 8px rgba(0,0,0,0.06)",
        border: "1px solid rgba(59,130,246,0.12)",
      }}
    >
      <div
        className="relative flex items-end justify-center shrink-0"
        style={{ background: card.avatarGradient, height: 64 }}
      >
        <div
          className="absolute -bottom-5 w-10 h-10 rounded-full flex items-center justify-center
                     text-white font-bold text-sm border-2 border-white"
          style={{ background: card.avatarGradient, boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}
        >
          {card.initials}
        </div>
      </div>

      <div className="flex flex-col items-center px-3 pt-7 pb-3 gap-[3px] flex-1">
        <div className="flex items-center gap-1">
          <span className="text-[10px] font-semibold leading-tight text-center"
            style={{ color: "#0f172a", fontFamily: "var(--font-display)" }}>
            {card.name}
          </span>
          <CheckCircle2 size={8} style={{ color: "#22c55e", flexShrink: 0 }} />
        </div>
        <p className="text-[7.5px] text-center leading-tight"
          style={{ color: "#64748b", fontFamily: "var(--font-body)" }}>{card.title}</p>
        <p className="text-[7.5px] font-semibold text-center"
          style={{ color: "#3b82f6", fontFamily: "var(--font-body)" }}>{card.company}</p>
        <div className="w-full my-1.5" style={{ height: 1, background: "rgba(0,0,0,0.05)" }} />
        <div className="flex items-center gap-1 w-full">
          <Mail size={7} style={{ color: "#3b82f6", flexShrink: 0 }} />
          <span className="text-[7px] truncate"
            style={{ color: "#475569", fontFamily: "var(--font-body)" }}>{card.email}</span>
        </div>
        <div className="flex items-center gap-1 w-full">
          <Phone size={7} style={{ color: "#3b82f6", flexShrink: 0 }} />
          <span className="text-[7px] truncate"
            style={{ color: "#475569", fontFamily: "var(--font-body)" }}>{card.phone}</span>
        </div>
        <div className="mt-1.5 px-2 py-[3px] rounded-full"
          style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)" }}>
          <span className="text-[6.5px] font-bold tracking-wide" style={{ color: "#16a34a" }}>✓ VERIFIED</span>
        </div>
      </div>
    </div>
  )
}

/* ─── Main Component ─────────────────────────────────────────────────────── */
/** Render title with accent words as blue italic */
function renderTitle(title: string, accentWords: string[] = []) {
  if (!accentWords.length) return title
  let parts: React.ReactNode[] = [title]
  for (const word of accentWords) {
    parts = parts.flatMap(part => {
      if (typeof part !== "string") return [part]
      const segments = part.split(word)
      return segments.reduce((acc: React.ReactNode[], seg, i) => {
        if (i < segments.length - 1)
          return [...acc, seg, <em key={word + i} style={{ color: "#0038FF", fontStyle: "italic", fontWeight: 800, fontFamily: "inherit" }}>{word}</em>]
        return [...acc, seg]
      }, [])
    })
  }
  return parts
}

export function ImageCarouselHero({
  title, subtitle, description, ctaText, onCtaClick,
  cards, features = [], stats = [], accentWords = [],
}: ImageCarouselHeroProps) {

  /* scroll-reveal */
  const sectionRef = useRef<HTMLDivElement>(null)
  const inView     = useInView(sectionRef, { once: true, margin: "-60px" })

  /* ── RAF-based orbit — zero React re-renders ── */
  const cardRefs   = useRef<(HTMLDivElement | null)[]>([])
  const anglesRef  = useRef<number[]>([])
  const perspRef   = useRef({ x: 0.5, y: 0.5 })
  const rafRef     = useRef<number>(0)
  const RADIUS     = 185

  /* init angles once */
  useEffect(() => {
    anglesRef.current = cards.map((_, i) => i * (360 / cards.length))
  }, [cards.length])

  /* RAF loop — direct DOM writes, no setState */
  useEffect(() => {
    const tick = () => {
      anglesRef.current = anglesRef.current.map(a => (a + 0.45) % 360)

      const px = (perspRef.current.x - 0.5) * 20
      const py = (perspRef.current.y - 0.5) * 20

      cardRefs.current.forEach((el, i) => {
        if (!el) return
        const rad   = anglesRef.current[i] * (Math.PI / 180)
        const x     = Math.cos(rad) * RADIUS
        const y     = Math.sin(rad) * RADIUS
        const depth = (Math.sin(rad) + 1) / 2           // 0 → back, 1 → front
        const scale = (0.82 + depth * 0.22).toFixed(3)
        el.style.transform =
          `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)` +
          ` rotateX(${py.toFixed(1)}deg) rotateY(${px.toFixed(1)}deg)` +
          ` rotateZ(${cards[i].rotation}deg) scale(${scale})`
        el.style.opacity = (0.65 + depth * 0.35).toFixed(2)
        el.style.zIndex  = String(Math.round(depth * 10))
      })

      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [cards])

  /* mouse tilt — ref only, no setState */
  const orbitAreaRef = useRef<HTMLDivElement>(null)
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    perspRef.current = {
      x: (e.clientX - r.left) / r.width,
      y: (e.clientY - r.top)  / r.height,
    }
  }, [])
  const handleMouseLeave = useCallback(() => {
    perspRef.current = { x: 0.5, y: 0.5 }
  }, [])

  return (
    <div
      ref={sectionRef}
      className="relative w-full overflow-hidden"
      style={{
        background: "white",
        paddingTop: "5rem",
        paddingBottom: "5rem",
      }}
    >
      {/* Dot grid */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: "radial-gradient(circle,rgba(59,130,246,0.07) 1px,transparent 1px)",
        backgroundSize: "30px 30px",
        maskImage: "radial-gradient(ellipse 85% 65% at 50% 50%,black 40%,transparent 100%)",
        WebkitMaskImage: "radial-gradient(ellipse 85% 65% at 50% 50%,black 40%,transparent 100%)",
      }} />

      {/* Ambient blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl animate-pulse"
          style={{ background: "rgba(59,130,246,0.07)" }} />
        <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full blur-3xl animate-pulse"
          style={{ background: "rgba(99,102,241,0.06)" }} />
      </div>

      <div className="relative z-10 flex flex-col items-center px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">

        {/* Trust badge — design system pill */}
        {subtitle && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, ease: [0.22,1,0.36,1], delay: 0.05 }}
            className="inline-flex items-center gap-[7px] mb-6 cursor-default"
            style={{
              padding: "6px 16px",
              borderRadius: 999,
              border: "1.5px solid #0D0D0D",
              fontFamily: "var(--font-montserrat, 'Montserrat', sans-serif)",
              fontSize: 11.5,
              fontWeight: 600,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "#0D0D0D",
            }}
          >
            <span style={{ fontSize: 7, lineHeight: 1 }}>●</span>
            {subtitle}
          </motion.div>
        )}

        {/* Headline — Montserrat 800, #0D0D0D + #0038FF accent */}
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.22,1,0.36,1], delay: 0.15 }}
          className="text-4xl sm:text-5xl lg:text-[3.5rem] text-center mb-5 leading-tight tracking-tight"
          style={{
            color: "#0D0D0D",
            fontFamily: "var(--font-montserrat, 'Montserrat', sans-serif)",
            fontWeight: 800,
            maxWidth: 700,
          }}
        >
          {renderTitle(title, accentWords)}
        </motion.h2>

        {/* Description — Montserrat 400, #3D3D3D */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, ease: [0.22,1,0.36,1], delay: 0.25 }}
          className="text-base sm:text-[17px] text-center mb-8 leading-relaxed"
          style={{
            color: "#3D3D3D",
            fontFamily: "var(--font-montserrat, 'Montserrat', sans-serif)",
            fontWeight: 400,
            maxWidth: 500,
            lineHeight: 1.6,
          }}
        >
          {description}
        </motion.p>

        {/* CTA */}
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.5, ease: [0.22,1,0.36,1], delay: 0.33 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          onClick={onCtaClick}
          className="group inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full font-semibold text-base mb-3"
          style={{
            background: "linear-gradient(135deg,#3b82f6 0%,#2563eb 100%)",
            color: "#ffffff",
            fontFamily: "var(--font-body)",
            boxShadow: "0 8px 32px rgba(59,130,246,0.32),0 2px 8px rgba(59,130,246,0.18),inset 0 1px 0 rgba(255,255,255,0.15)",
            cursor: "pointer",
            border: "none",
          }}
        >
          {ctaText}
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
        </motion.button>

        {/* Social proof */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.42 }}
          className="text-xs mb-14"
          style={{ color: "#94a3b8", fontFamily: "var(--font-body)" }}
        >
          No credit card · First lookup free · Results in 30 min
        </motion.p>

        {/* ── Orbit ── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.7, ease: [0.22,1,0.36,1], delay: 0.18 }}
          className="relative w-full max-w-6xl mb-12 sm:mb-16"
          style={{ height: 420 }}
          ref={orbitAreaRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {/* Dashed orbit ring */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
            style={{ width: 375, height: 375, border: "1px dashed rgba(59,130,246,0.18)" }} />

          {/* Center hub */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
            <motion.div
              animate={{ boxShadow: [
                "0 0 0 8px rgba(59,130,246,0.08),0 0 0 18px rgba(59,130,246,0.04)",
                "0 0 0 14px rgba(59,130,246,0.11),0 0 0 26px rgba(59,130,246,0.05)",
                "0 0 0 8px rgba(59,130,246,0.08),0 0 0 18px rgba(59,130,246,0.04)",
              ]}}
              transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ background: "linear-gradient(135deg,#3b82f6,#6366f1)" }}
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"
                  fill="rgba(255,255,255,0.92)" />
              </svg>
            </motion.div>
          </div>

          {/* Cards — positioned by RAF, no re-renders */}
          <div className="absolute inset-0 flex items-center justify-center"
            style={{ perspective: 1000 }}>
            {cards.map((card, i) => (
              <div
                key={card.id}
                ref={el => { cardRefs.current[i] = el }}
                className="absolute w-32 h-40 sm:w-[130px] sm:h-[162px]"
                style={{ willChange: "transform, opacity", transformStyle: "preserve-3d" }}
              >
                <div
                  className={cn(
                    "relative w-full h-full rounded-2xl overflow-hidden shadow-2xl",
                    "transition-shadow duration-300 hover:shadow-3xl hover:scale-110",
                    "cursor-pointer group",
                  )}
                  style={{ transformStyle: "preserve-3d" }}
                >
                  <ContactCardItem card={card} />
                  {/* Original shine on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Stats */}
        {stats.length > 0 && (
          <div className="w-full max-w-3xl grid grid-cols-3 gap-6 mb-14">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, ease: [0.22,1,0.36,1], delay: 0.5 + i * 0.08 }}
                className="flex flex-col items-center gap-1"
              >
                <span className="text-3xl sm:text-4xl font-bold"
                  style={{ color: "#0f172a", fontFamily: "var(--font-display)" }}>{stat.value}</span>
                <span className="text-xs sm:text-sm text-center"
                  style={{ color: "#64748b", fontFamily: "var(--font-body)" }}>{stat.label}</span>
              </motion.div>
            ))}
          </div>
        )}

        {/* Feature cards */}
        {features.length > 0 && (
          <div className="w-full max-w-4xl grid grid-cols-1 sm:grid-cols-3 gap-5">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 22 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.55, ease: [0.22,1,0.36,1], delay: 0.62 + i * 0.1 }}
                whileHover={{ y: -4, boxShadow: "0 12px 36px rgba(59,130,246,0.14)", borderColor: "rgba(59,130,246,0.28)" }}
                className="group p-6 rounded-2xl cursor-default"
                style={{
                  background: "white",
                  border: "1px solid rgba(59,130,246,0.1)",
                  boxShadow: "0 2px 12px rgba(59,130,246,0.06)",
                }}
              >
                <div className="w-2 h-2 rounded-full mb-4"
                  style={{ background: "linear-gradient(135deg,#3b82f6,#6366f1)" }} />
                <h3 className="text-base font-semibold mb-2"
                  style={{ color: "#0f172a", fontFamily: "var(--font-display)" }}>{feature.title}</h3>
                <p className="text-sm leading-relaxed"
                  style={{ color: "#64748b", fontFamily: "var(--font-body)" }}>{feature.description}</p>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
