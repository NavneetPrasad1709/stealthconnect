"use client"

import { ContainerScroll, CardSticky } from "@/components/cards-stack"
import { Link2, ScanSearch, ShieldCheck, Zap } from "lucide-react"
import { SectionBadge } from "@/components/ui/SectionBadge"
import { HeadingAccent } from "@/components/ui/HeadingAccent"

// ── Card visuals ──────────────────────────────────────────────────────────────

function VisualURL() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <div className="w-full max-w-[340px] space-y-3">
        <div className="rounded-2xl p-4 shadow-sm" style={{ background: "var(--c-section-card)", border: "1px solid var(--c-border-light)" }}>
          <p
            className="mb-2 text-[10px] font-semibold uppercase tracking-widest"
            style={{ color: "#9ca3af", fontFamily: "var(--font-montserrat,'Montserrat',sans-serif)" }}
          >
            LinkedIn Profile URL
          </p>
          <div className="flex items-center gap-2 rounded-xl bg-gray-50 border border-gray-200 px-3 py-2.5">
            <Link2 className="size-4 shrink-0 text-blue-500" />
            <span
              className="truncate text-sm"
              style={{ color: "#4b5563", fontFamily: "var(--font-montserrat,'Montserrat',sans-serif)" }}
            >
              linkedin.com/in/jane-doe-cto
            </span>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <span className="size-2 rounded-full bg-green-400" />
            <span
              className="text-xs"
              style={{ color: "#9ca3af", fontFamily: "var(--font-montserrat,'Montserrat',sans-serif)" }}
            >
              Valid profile detected
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="size-10 shrink-0 rounded-full bg-gradient-to-br from-blue-400 to-blue-600" />
          <div>
            <p
              className="text-sm font-semibold"
              style={{ color: "var(--c-heading)", fontFamily: "var(--font-montserrat,'Montserrat',sans-serif)" }}
            >
              Jane Doe
            </p>
            <p
              className="text-xs"
              style={{ color: "#9ca3af", fontFamily: "var(--font-montserrat,'Montserrat',sans-serif)" }}
            >
              CTO · Acme Corp
            </p>
          </div>
          <span
            className="ml-auto rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-600"
            style={{ fontFamily: "var(--font-montserrat,'Montserrat',sans-serif)" }}
          >
            190+ countries
          </span>
        </div>
      </div>
    </div>
  )
}

function VisualScan() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <div className="w-full max-w-[340px] space-y-3">
        {[
          { label: "Corporate Directories", pct: "w-4/5",   color: "bg-blue-500" },
          { label: "Domain Registries",     pct: "w-3/5",   color: "bg-blue-400" },
          { label: "B2B Enrichment DB",     pct: "w-[90%]", color: "bg-blue-600" },
        ].map(({ label, pct, color }) => (
          <div key={label} className="rounded-2xl border border-blue-100 bg-white p-4 shadow-sm">
            <div className="mb-2 flex items-center justify-between">
              <span
                className="text-xs font-medium"
                style={{ color: "#4b5563", fontFamily: "var(--font-montserrat,'Montserrat',sans-serif)" }}
              >
                {label}
              </span>
              <span className="size-2 rounded-full bg-green-400 animate-pulse" />
            </div>
            <div className="h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
              <div className={`h-full ${pct} rounded-full ${color} animate-pulse`} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function VisualVerify() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <div className="w-full max-w-[340px] space-y-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm space-y-3">
          {[
            { type: "Email",  value: "jane.doe@acmecorp.com", badge: "SMTP ✓",    badgeCls: "bg-green-100 text-green-700" },
            { type: "Phone",  value: "+1 (415) 555-0182",     badge: "Carrier ✓", badgeCls: "bg-green-100 text-green-700" },
            { type: "Domain", value: "acmecorp.com",          badge: "MX Live",   badgeCls: "bg-blue-100 text-blue-700"   },
          ].map(({ type, value, badge, badgeCls }) => (
            <div key={type} className="flex items-center justify-between gap-3">
              <div>
                <p
                  className="text-[10px] font-semibold uppercase tracking-widest"
                  style={{ color: "#9ca3af", fontFamily: "var(--font-montserrat,'Montserrat',sans-serif)" }}
                >
                  {type}
                </p>
                <p
                  className="text-sm"
                  style={{ color: "var(--c-body)", fontFamily: "var(--font-montserrat,'Montserrat',sans-serif)" }}
                >
                  {value}
                </p>
              </div>
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${badgeCls}`}
                style={{ fontFamily: "var(--font-montserrat,'Montserrat',sans-serif)" }}
              >
                {badge}
              </span>
            </div>
          ))}
        </div>
        <p
          className="text-center text-xs"
          style={{ color: "#9ca3af", fontFamily: "var(--font-montserrat,'Montserrat',sans-serif)" }}
        >
          Triple-verified before delivery
        </p>
      </div>
    </div>
  )
}

function VisualDelivery() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <div className="w-full max-w-[340px] space-y-3">
        <div className="rounded-2xl border border-white/20 bg-white/10 p-5 shadow-lg backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-4">
            <span className="size-2 rounded-full bg-green-400 animate-pulse" />
            <span
              className="text-sm font-semibold text-white"
              style={{ fontFamily: "var(--font-montserrat,'Montserrat',sans-serif)" }}
            >
              Delivered · 28 min
            </span>
          </div>
          <div className="space-y-2 mb-5">
            <div>
              <p
                className="text-[10px] font-semibold uppercase tracking-widest text-blue-200"
                style={{ fontFamily: "var(--font-montserrat,'Montserrat',sans-serif)" }}
              >
                Email
              </p>
              <p
                className="text-sm text-white"
                style={{ fontFamily: "var(--font-montserrat,'Montserrat',sans-serif)" }}
              >
                jane.doe@acmecorp.com
              </p>
            </div>
            <div>
              <p
                className="text-[10px] font-semibold uppercase tracking-widest text-blue-200"
                style={{ fontFamily: "var(--font-montserrat,'Montserrat',sans-serif)" }}
              >
                Phone
              </p>
              <p
                className="text-sm text-white"
                style={{ fontFamily: "var(--font-montserrat,'Montserrat',sans-serif)" }}
              >
                +1 (415) 555-0182
              </p>
            </div>
          </div>
          <button
            className="w-full rounded-xl bg-white py-2 text-sm font-semibold text-blue-600 shadow hover:bg-blue-50 transition-colors"
            style={{ fontFamily: "var(--font-montserrat,'Montserrat',sans-serif)" }}
          >
            View in dashboard →
          </button>
        </div>
        <div className="flex justify-center gap-6">
          {["Pay per result", "No subscription", "Free first lookup"].map((t) => (
            <span
              key={t}
              className="text-[10px] font-medium text-blue-200"
              style={{ fontFamily: "var(--font-montserrat,'Montserrat',sans-serif)" }}
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Feature data ──────────────────────────────────────────────────────────────

const features = [
  {
    step: "01",
    icon: Link2,
    label: "Paste a LinkedIn URL",
    heading: "Any profile, anywhere in the world.",
    body: "Drop any LinkedIn profile URL — sales targets, hiring prospects, investors. Works for profiles across 190+ countries. No browser extension or login needed.",
    visual: <VisualURL />,
    dark: false,
    dividerCls: "border-gray-100",
    cardStyle: { background: "var(--c-section-card)", border: "1px solid var(--c-border-light)" },
  },
  {
    step: "02",
    icon: ScanSearch,
    label: "AI researches the contact",
    heading: "Cross-referenced across verified databases.",
    body: "Our AI simultaneously queries corporate directories, domain registries, and enriched B2B datasets to surface every possible contact signal.",
    visual: <VisualScan />,
    dark: false,
    dividerCls: "border-blue-100",
    cardStyle: { background: "var(--c-section-bg-alt)", border: "1px solid var(--c-border-light)" },
  },
  {
    step: "03",
    icon: ShieldCheck,
    label: "Triple-verified accuracy",
    heading: "99.2% deliverability — or we refund.",
    body: "Every email is SMTP-tested. Every phone checked against live carrier data. If a contact bounces you pay nothing — no questions asked.",
    visual: <VisualVerify />,
    dark: false,
    dividerCls: "border-gray-100",
    cardStyle: { background: "var(--c-section-card)", border: "1px solid var(--c-border-light)" },
  },
  {
    step: "04",
    icon: Zap,
    label: "Delivered in 30 minutes",
    heading: "In your dashboard, ready to use.",
    body: "Results land in your dashboard with verified email, direct phone, job title, and company. Export to CSV or copy instantly. Pay only per result.",
    visual: <VisualDelivery />,
    dark: true,
    dividerCls: "border-blue-500",
    cardStyle: { background: "#0038FF", border: "1px solid rgba(255,255,255,0.15)" },
  },
]

// ── Section ───────────────────────────────────────────────────────────────────

export function FeaturesStack() {
  return (
    <section style={{ background: "var(--c-section-bg)", padding: "80px 16px 80px" }}>
      <div className="mx-auto max-w-5xl">

        {/* ── Header ── */}
        <div className="mb-16 text-center">
          <SectionBadge variant="light" className="mb-5">How It Works</SectionBadge>
          <h2
            style={{
              fontFamily: "var(--font-montserrat,'Montserrat',sans-serif)",
              fontWeight: 800,
              fontSize: "clamp(1.85rem, 3.5vw, 2.75rem)",
              color: "var(--c-heading)",
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
            }}
          >
            From LinkedIn URL to{" "}
            <HeadingAccent>verified contact</HeadingAccent>
            <br className="hidden md:block" />
            {" "}in four steps.
          </h2>
        </div>

        {/* ── Stack ── */}
        <ContainerScroll>
          {features.map((f, i) => {
            const Icon = f.icon
            const isDark = f.dark
            return (
              <CardSticky
                key={f.step}
                index={i}
                incrementY={64}
                incrementZ={10}
                className="rounded-3xl overflow-hidden shadow-sm"
                style={f.cardStyle}
              >
                <div className="grid min-h-[420px] md:grid-cols-2">

                  {/* ── Left: text ── */}
                  <div className="flex flex-col justify-center p-8 md:p-12">
                    <p
                      className="mb-1 text-xs uppercase tracking-widest"
                      style={{
                        fontFamily: "var(--font-montserrat,'Montserrat',sans-serif)",
                        fontWeight: 700,
                        color: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.2)",
                      }}
                    >
                      Step {f.step}
                    </p>

                    <span
                      className="mb-5 flex items-center gap-2 text-sm font-semibold"
                      style={{
                        fontFamily: "var(--font-montserrat,'Montserrat',sans-serif)",
                        color: isDark ? "rgba(255,255,255,0.8)" : "#0038FF",
                      }}
                    >
                      <Icon className="size-4" />
                      {f.label}
                    </span>

                    <h3
                      style={{
                        fontFamily: "var(--font-montserrat,'Montserrat',sans-serif)",
                        fontWeight: 800,
                        fontSize: "clamp(1.2rem, 2.5vw, 1.65rem)",
                        color: isDark ? "#ffffff" : "var(--c-heading)",
                        lineHeight: 1.2,
                        marginBottom: 16,
                        letterSpacing: "-0.01em",
                      }}
                    >
                      {f.heading}
                    </h3>

                    <p
                      style={{
                        fontFamily: "var(--font-montserrat,'Montserrat',sans-serif)",
                        fontWeight: 400,
                        fontSize: 15,
                        color: isDark ? "rgba(255,255,255,0.72)" : "var(--c-body)",
                        lineHeight: 1.65,
                      }}
                    >
                      {f.body}
                    </p>
                  </div>

                  {/* ── Right: visual ── */}
                  <div className={`border-l min-h-[260px] md:min-h-0 ${f.dividerCls}`}>
                    {f.visual}
                  </div>

                </div>
              </CardSticky>
            )
          })}
        </ContainerScroll>

      </div>
    </section>
  )
}
