"use client"

import Link from "next/link"
import { m } from "framer-motion"
import { ShieldCheck, Zap, CreditCard, Globe2, Inbox, Lock, ArrowRight } from "lucide-react"
import { ContainerScroll, CardSticky } from "@/components/ui/cards-stack"
import { SectionBadge } from "@/components/ui/SectionBadge"

const FONT = "var(--font-montserrat,'Montserrat',sans-serif)"

/* ─── Card data ──────────────────────────────────────────────────────────── */
const CARDS = [
  {
    icon: ShieldCheck,
    number: "01",
    title: "Verified, not estimated",
    desc: "We confirm every contact before charging you. If it's not verified, you owe nothing — zero risk, guaranteed.",
    tag: "VERIFIED RESULTS",
    dark: false,
  },
  {
    icon: Zap,
    number: "02",
    title: "30-minute turnaround",
    desc: "Our average delivery time is 28 minutes. Fast enough to act on any opportunity without missing a beat.",
    tag: "FAST DELIVERY",
    dark: false,
  },
  {
    icon: CreditCard,
    number: "03",
    title: "Pay per result only",
    desc: "No monthly plan, no setup fees. $0.20 per verified email, $1.00 per direct phone. Completely transparent.",
    tag: "PAY-AS-YOU-GO",
    dark: false,
  },
  {
    icon: Globe2,
    number: "04",
    title: "Any LinkedIn profile",
    desc: "Public or private, CISO to intern — if the profile exists across 190+ countries, we can find the contact data.",
    tag: "GLOBAL COVERAGE",
    dark: false,
  },
  {
    icon: Inbox,
    number: "05",
    title: "Instant dashboard delivery",
    desc: "Results land in your dashboard the moment they're ready. Export to CSV or copy with one click, anytime.",
    tag: "INSTANT ACCESS",
    dark: false,
  },
  {
    icon: Lock,
    number: "06",
    title: "GDPR-conscious by design",
    desc: "We operate within compliant data practices. No protected sources, no scraped private data — your contact lookups stay clean.",
    tag: "GDPR COMPLIANT",
    dark: true,
  },
]

/* ─── Individual card ────────────────────────────────────────────────────── */
function FeatureCard({ card }: { card: (typeof CARDS)[number] }) {
  const Icon = card.icon
  const isDark = card.dark

  return (
    <div
      className="relative overflow-hidden"
      style={{
        background: isDark ? "#0D0D0D" : "var(--c-section-card)",
        borderRadius: 16,
        padding: "32px 28px 28px",
        boxShadow: isDark
          ? "0 8px 32px rgba(0,0,0,0.22)"
          : "0 2px 12px rgba(0,0,0,0.06)",
        border: isDark ? "none" : "1px solid var(--c-border-light)",
      }}
    >
      {/* Lime glow on dark card */}
      {isDark && (
        <div
          className="absolute pointer-events-none"
          style={{
            top: -80,
            right: -80,
            width: 260,
            height: 260,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(200,255,0,0.13) 0%, transparent 70%)",
          }}
        />
      )}

      {/* Top row: icon + number */}
      <div className="flex items-start justify-between mb-5 relative z-10">
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: isDark
              ? "rgba(200,255,0,0.1)"
              : "rgba(0,56,255,0.07)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon
            size={19}
            strokeWidth={2}
            style={{ color: isDark ? "#C8FF00" : "#0038FF" }}
          />
        </div>

        <span
          style={{
            fontFamily: FONT,
            fontWeight: 700,
            fontSize: 20,
            color: isDark ? "#C8FF00" : "#0038FF",
            lineHeight: 1,
            letterSpacing: "-0.02em",
          }}
        >
          {card.number}
        </span>
      </div>

      {/* Title */}
      <h3
        className="relative z-10"
        style={{
          fontFamily: FONT,
          fontWeight: 700,
          fontSize: 19,
          color: isDark ? "#FFFFFF" : "var(--c-heading)",
          lineHeight: 1.2,
          marginBottom: 10,
        }}
      >
        {card.title}
      </h3>

      {/* Body */}
      <p
        className="relative z-10"
        style={{
          fontFamily: FONT,
          fontWeight: 400,
          fontSize: 16,
          color: isDark ? "#AAAAAA" : "var(--c-body)",
          lineHeight: 1.6,
          marginBottom: 22,
        }}
      >
        {card.desc}
      </p>

      {/* Tag pill */}
      <span
        className="relative z-10"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          padding: "4px 0",
          fontFamily: FONT,
          fontWeight: 600,
          fontSize: 13,
          letterSpacing: "0.1em",
          color: isDark ? "rgba(200,255,0,0.65)" : "var(--c-muted)",
          textTransform: "uppercase",
        }}
      >
        {card.tag}
      </span>
    </div>
  )
}

/* ─── Section ────────────────────────────────────────────────────────────── */
export default function Features() {
  return (
    <section
      id="features"
      className="dark:bg-[#0A0A0A] py-14 md:py-24"
      style={{ background: "var(--c-section-bg)", scrollMarginTop: "80px" }}
    >
      <div
        className="mx-auto"
        style={{ maxWidth: 1120, padding: "0 20px" }}
      >
        <div className="grid md:grid-cols-[1fr_1.2fr] gap-10 xl:gap-16 items-start">

          {/* ══ Left — sticky header ══ */}
          <div className="md:sticky md:top-32 md:self-start flex flex-col items-center md:items-start text-center md:text-left">

            {/* Badge */}
            <div className="mb-6">
              <SectionBadge variant="light">Why StealthConnect</SectionBadge>
            </div>

            {/* Heading */}
            <m.h2
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              style={{
                fontFamily: FONT,
                fontWeight: 800,
                fontSize: "clamp(2rem, 3.6vw, 3rem)",
                lineHeight: 1.08,
                letterSpacing: "-0.025em",
                marginBottom: 18,
                color: "var(--c-heading)",
              }}
            >
              Built different
              <br />
              from{" "}
              <em
                style={{
                  color: "#0038FF",
                  fontStyle: "italic",
                  fontWeight: 800,
                }}
              >
                every other
              </em>
              <br />
              contact tool.
            </m.h2>

            {/* Description */}
            <m.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.5 }}
              style={{
                fontFamily: FONT,
                fontWeight: 400,
                fontSize: "clamp(16px,2.5vw,20px)",
                color: "var(--c-heading)",
                lineHeight: 1.65,
                maxWidth: "36ch",
                marginBottom: 32,
              }}
            >
              No subscriptions. No guesswork. Just verified
              contact data delivered in under 30 minutes.
            </m.p>

            {/* CTA */}
            <m.div
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.18, duration: 0.45 }}
            >
              <Link
                href="/signup"
                className="group inline-flex items-center gap-2 rounded-full text-white transition-all hover:scale-[1.03] active:scale-[0.97]"
                style={{
                  background: "#0038FF",
                  fontFamily: FONT,
                  fontWeight: 700,
                  fontSize: 16,
                  padding: "12px 24px",
                  boxShadow: "0 6px 24px rgba(0,56,255,0.28)",
                  textDecoration: "none",
                }}
              >
                Start free - 1 lookup on us
              </Link>
            </m.div>

            {/* Stats */}
            <m.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.26, duration: 0.5 }}
              className="mt-10 mb-14 md:mb-0 grid grid-cols-2 gap-4 sm:flex sm:flex-wrap sm:gap-8 justify-center md:justify-start"
            >
              {[
                { val: "99.9%", label: "Verification rate" },
                { val: "28 min", label: "Avg. delivery" },
                
              ].map((s) => (
                <div key={s.label}>
                  <div
                    style={{
                      fontFamily: FONT,
                      fontWeight: 800,
                      fontSize: "1.55rem",
                      color: "#0038FF",
                      lineHeight: 1,
                    }}
                  >
                    {s.val}
                  </div>
                  <div
                    style={{
                      fontFamily: FONT,
                      fontWeight: 600,
                      fontSize: 14,
                      color: "#000000",
                      marginTop: 5,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                    }}
                  >
                    {s.label}
                  </div>
                </div>
              ))}
            </m.div>

            {/* Scroll hint — visible on desktop */}
            <p
              className="hidden md:block mt-12"
              style={{
                fontFamily: FONT,
                fontSize: 14,
                fontWeight: 500,
                color: "#888",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}
            >
              ↓ Scroll to explore
            </p>
          </div>

          {/* ══ Right — stacking cards ══ */}
          <ContainerScroll className="md:min-h-[420vh] space-y-6 py-10 md:pb-[55vh]">
            {CARDS.map((card, i) => (
              <CardSticky
                key={card.number}
                index={i + 6}
                incrementY={14}
                incrementZ={10}
              >
                <FeatureCard card={card} />
              </CardSticky>
            ))}
          </ContainerScroll>

        </div>
      </div>
    </section>
  )
}
