"use client"

import { useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { m, useInView } from "framer-motion"
import { ArrowRight, Mail, Phone, CheckCircle2 } from "lucide-react"
import { SectionBadge } from "@/components/ui/SectionBadge"
import { HeadingAccent } from "@/components/ui/HeadingAccent"

const FONT = "var(--font-montserrat,'Montserrat',sans-serif)"

const CARDS = [
  { id: "1", name: "Sarah Chen",   title: "Head of Sales",    company: "Stripe",      initials: "SC", gradient: "linear-gradient(135deg,#3b82f6,#6366f1)", email: "s.chen@str••••.com",     phone: "+1 (415) ••• ••••", rotation: -8  },
  { id: "2", name: "Marcus Webb",  title: "CEO & Co-Founder", company: "GrowthLabs",  initials: "MW", gradient: "linear-gradient(135deg,#8b5cf6,#ec4899)", email: "m.webb@grow••••.io",     phone: "+1 (628) ••• ••••", rotation:  5  },
  { id: "3", name: "Priya Nair",   title: "VP of Marketing",  company: "HubSpot",     initials: "PN", gradient: "linear-gradient(135deg,#10b981,#3b82f6)", email: "p.nair@hubsp••.com",     phone: "+1 (857) ••• ••••", rotation: -3  },
  { id: "4", name: "James Liu",    title: "Founder",          company: "Venture.io",  initials: "JL", gradient: "linear-gradient(135deg,#f59e0b,#ef4444)", email: "james@ventu••••.io",     phone: "+1 (212) ••• ••••", rotation: 10  },
  { id: "5", name: "Emily Ross",   title: "Director of BD",   company: "Salesforce",  initials: "ER", gradient: "linear-gradient(135deg,#ec4899,#f97316)", email: "e.ross@sales••••.com",   phone: "+1 (415) ••• ••••", rotation: -6  },
  { id: "6", name: "Tom Hassan",   title: "CTO",              company: "DataStack",   initials: "TH", gradient: "linear-gradient(135deg,#0ea5e9,#6366f1)", email: "t.hassan@data••••.com",  phone: "+44 20 •••• ••••",  rotation:  4  },
]

const STATS = [
  
  { value: "800M+",  label: "Contacts delivered"       },
  { value: "99.9%",  label: "Verification accuracy"    },
]

/* ─── Contact card ──────────────────────────────────────────────────────────── */
function ContactCard({ card }: { card: typeof CARDS[0] }) {
  return (
    <div
      className="w-full h-full rounded-2xl overflow-hidden flex flex-col"
      style={{
        background: "var(--c-section-card)",
        border: "1px solid var(--c-border-light)",
        boxShadow: "0 8px 32px rgba(0,56,255,0.10)",
      }}
    >
      <div className="relative flex items-end justify-center shrink-0" style={{ background: card.gradient, height: 56 }}>
        <div
          className="absolute -bottom-4 w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-xs border-2"
          style={{ background: card.gradient, borderColor: "var(--c-section-card)", boxShadow: "0 4px 10px rgba(0,0,0,0.18)" }}
        >
          {card.initials}
        </div>
      </div>

      <div className="flex flex-col items-center px-3 pt-6 pb-3 gap-[3px] flex-1">
        <div className="flex items-center gap-1">
          <span className="text-[11px] font-semibold leading-tight text-center" style={{ color: "var(--c-heading)", fontFamily: FONT }}>
            {card.name}
          </span>
          <CheckCircle2 size={8} style={{ color: "#22c55e", flexShrink: 0 }} />
        </div>
        <p className="text-[8.5px] text-center leading-tight" style={{ color: "var(--c-body)", fontFamily: FONT }}>{card.title}</p>
        <p className="text-[8.5px] font-semibold text-center" style={{ color: "#0038FF", fontFamily: FONT }}>{card.company}</p>
        <div className="w-full my-1.5" style={{ height: 1, background: "var(--c-border-light)" }} />
        <div className="flex items-center gap-1 w-full">
          <Mail size={7} style={{ color: "#0038FF", flexShrink: 0 }} />
          <span className="text-[8px] truncate" style={{ color: "var(--c-body)", fontFamily: FONT }}>{card.email}</span>
        </div>
        <div className="flex items-center gap-1 w-full">
          <Phone size={7} style={{ color: "#0038FF", flexShrink: 0 }} />
          <span className="text-[8px] truncate" style={{ color: "var(--c-body)", fontFamily: FONT }}>{card.phone}</span>
        </div>
        <div className="mt-1.5 px-2 py-[3px] rounded-full" style={{ background: "rgba(34,197,94,0.10)", border: "1px solid rgba(34,197,94,0.25)" }}>
          <span className="text-[8px] font-bold tracking-wide" style={{ color: "#16a34a" }}>✓ VERIFIED</span>
        </div>
      </div>
    </div>
  )
}

/* ─── Section ───────────────────────────────────────────────────────────────── */
export function FinalCTA() {
  const router     = useRouter()
  const sectionRef = useRef<HTMLDivElement>(null)
  const inView     = useInView(sectionRef, { once: true, margin: "-60px" })

  /* RAF orbit */
  const cardRefs  = useRef<(HTMLDivElement | null)[]>([])
  const anglesRef = useRef<number[]>([])
  const perspRef  = useRef({ x: 0.5, y: 0.5 })
  const rafRef    = useRef<number>(0)
  const radiusRef = useRef(180)

  useEffect(() => {
    const update = () => {
      radiusRef.current = window.innerWidth < 480 ? 100 : window.innerWidth < 768 ? 130 : 180
    }
    update()
    window.addEventListener("resize", update)
    return () => window.removeEventListener("resize", update)
  }, [])

  useEffect(() => {
    anglesRef.current = CARDS.map((_, i) => i * (360 / CARDS.length))
  }, [])

  useEffect(() => {
    const tick = () => {
      anglesRef.current = anglesRef.current.map(a => (a + 0.42) % 360)
      const px = (perspRef.current.x - 0.5) * 18
      const py = (perspRef.current.y - 0.5) * 18
      cardRefs.current.forEach((el, i) => {
        if (!el) return
        const rad   = anglesRef.current[i] * (Math.PI / 180)
        const x     = Math.cos(rad) * radiusRef.current
        const y     = Math.sin(rad) * radiusRef.current
        const depth = (Math.sin(rad) + 1) / 2
        el.style.transform =
          `translate(${x.toFixed(1)}px,${y.toFixed(1)}px)` +
          ` rotateX(${py.toFixed(1)}deg) rotateY(${px.toFixed(1)}deg)` +
          ` rotateZ(${CARDS[i].rotation}deg) scale(${(0.82 + depth * 0.22).toFixed(3)})`
        el.style.opacity = (0.6 + depth * 0.4).toFixed(2)
        el.style.zIndex  = String(Math.round(depth * 10))
      })
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  const orbitRef       = useRef<HTMLDivElement>(null)
  const handleMove     = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    perspRef.current = { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height }
  }, [])
  const handleLeave    = useCallback(() => { perspRef.current = { x: 0.5, y: 0.5 } }, [])

  return (
    <section
      ref={sectionRef}
      className="py-14 md:py-24"
      style={{ background: "var(--c-section-bg-alt)", overflow: "hidden", position: "relative" }}
    >
      {/* Dot grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle,rgba(0,56,255,0.07) 1px,transparent 1px)",
          backgroundSize: "28px 28px",
          maskImage: "radial-gradient(ellipse 80% 60% at 50% 50%,black 30%,transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 80% 60% at 50% 50%,black 30%,transparent 100%)",
        }}
      />

      <div className="relative z-10 flex flex-col items-center text-center px-5 max-w-5xl mx-auto">

        {/* Badge */}
        <m.div
          initial={{ opacity: 0, y: -12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: [0.22,1,0.36,1] }}
          className="mb-6"
        >
          <SectionBadge variant="light">Find Anyone. Fast.</SectionBadge>
        </m.div>

        {/* Heading */}
        <m.h2
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.22,1,0.36,1], delay: 0.1 }}
          style={{
            fontFamily: FONT,
            fontWeight: 800,
            fontSize: "clamp(2rem,4vw,3.1rem)",
            lineHeight: 1.08,
            letterSpacing: "-0.025em",
            color: "var(--c-heading)",
            marginBottom: 20,
          }}
        >
          Turn Any LinkedIn{" "}
          <HeadingAccent>Into a Direct Line.</HeadingAccent>
        </m.h2>

        {/* CTA button */}
        <m.button
          initial={{ opacity: 0, scale: 0.92 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.5, ease: [0.22,1,0.36,1], delay: 0.28 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => router.push("/signup")}
          className="group inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full font-semibold mb-3"
          style={{
            background: "#0038FF",
            color: "#ffffff",
            fontFamily: FONT,
            fontSize: 15,
            fontWeight: 700,
            border: "none",
            cursor: "pointer",
            boxShadow: "0 8px 32px rgba(0,56,255,0.28),0 2px 8px rgba(0,56,255,0.14)",
          }}
        >
          Start Free - 1 Lookup on Us
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
        </m.button>

        {/* Social proof line */}
        <m.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.38 }}
          style={{ fontFamily: FONT, fontSize: 14, color: "var(--c-muted)", marginBottom: 56 }}
        >
          No credit card · First lookup free · Results in 30 min
        </m.p>

        {/* ── Orbit ── */}
        <m.div
          initial={{ opacity: 0, scale: 0.88 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.7, ease: [0.22,1,0.36,1], delay: 0.18 }}
          className="relative w-full max-w-5xl mb-14 h-[260px] sm:h-[340px] md:h-[420px]"
          ref={orbitRef}
          onMouseMove={handleMove}
          onMouseLeave={handleLeave}
        >
          {/* Orbit ring */}
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none w-[208px] h-[208px] sm:w-[268px] sm:h-[268px] md:w-[368px] md:h-[368px]"
            style={{ border: "1px dashed var(--c-border-light)" }}
          />

          {/* Center hub */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
            <m.div
              animate={{ boxShadow: [
                "0 0 0 8px rgba(0,56,255,0.08),0 0 0 18px rgba(0,56,255,0.04)",
                "0 0 0 14px rgba(0,56,255,0.12),0 0 0 28px rgba(0,56,255,0.05)",
                "0 0 0 8px rgba(0,56,255,0.08),0 0 0 18px rgba(0,56,255,0.04)",
              ]}}
              transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ background: "linear-gradient(135deg,#0038FF,#6366f1)" }}
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"
                  fill="rgba(255,255,255,0.92)" />
              </svg>
            </m.div>
          </div>

          {/* Cards */}
          <div className="absolute inset-0 flex items-center justify-center" style={{ perspective: 1000 }}>
            {CARDS.map((card, i) => (
              <div
                key={card.id}
                ref={el => { cardRefs.current[i] = el }}
                className="absolute w-[90px] h-[112px] sm:w-[110px] sm:h-[138px] md:w-[120px] md:h-[150px]"
                style={{ willChange: "transform,opacity", transformStyle: "preserve-3d" }}
              >
                <ContactCard card={card} />
              </div>
            ))}
          </div>
        </m.div>

        {/* Stats */}
        <div className="w-full max-w-2xl grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          {STATS.map((stat, i) => (
            <m.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, ease: [0.22,1,0.36,1], delay: 0.5 + i * 0.08 }}
              className="flex flex-col items-center gap-1"
            >
              <span
                style={{ fontFamily: FONT, fontWeight: 800, fontSize: "clamp(1.5rem,3vw,2rem)", color: "var(--c-heading)", letterSpacing: "-0.02em" }}
              >
                {stat.value}
              </span>
              <span style={{ fontFamily: FONT, fontSize: 15, color: "var(--c-muted)", textAlign: "center" }}>
                {stat.label}
              </span>
            </m.div>
          ))}
        </div>
      </div>
    </section>
  )
}
