'use client'

import { Activity, Globe, Zap, ShieldCheck } from 'lucide-react'
import DottedMap from 'dotted-map'
import { SectionBadge } from '@/components/ui/SectionBadge'
import { HeadingAccent } from '@/components/ui/HeadingAccent'

// ── Map setup ─────────────────────────────────────────────────────────────────
const map = new DottedMap({ height: 32, grid: 'diagonal' })
const mapPoints = map.getPoints()

const CITY_PINGS = [
  { cx: 34, cy: 18 },   // New York
  { cx: 58, cy: 13 },   // London
  { cx: 83, cy: 26 },   // Mumbai
  { cx: 108, cy: 43 },  // Sydney
  { cx: 43, cy: 40 },   // São Paulo
  { cx: 76, cy: 22 },   // Dubai
  { cx: 106, cy: 19 },  // Tokyo
]

const MapView = () => (
  <svg
    viewBox="0 0 120 60"
    className="w-full"
    style={{ background: 'transparent', display: 'block' }}
  >
    {/* Base dots */}
    {mapPoints.map((point, i) => (
      <circle key={i} cx={point.x} cy={point.y} r={0.22} fill="#94a3b8" opacity={0.55} />
    ))}
    {/* City pings */}
    {CITY_PINGS.map((pin, i) => (
      <g key={i}>
        <circle cx={pin.cx} cy={pin.cy} r={2.4} fill="#0038FF" opacity={0.1} />
        <circle cx={pin.cx} cy={pin.cy} r={1.2} fill="#0038FF" opacity={0.28} />
        <circle cx={pin.cx} cy={pin.cy} r={0.6} fill="#0038FF" />
      </g>
    ))}
  </svg>
)

// ── Chart setup (inline SVG — recharts removed, PERF-H2) ───────────────────────
const chartData = [
  { month: 'Sep', lookups: 420,  emails: 310 },
  { month: 'Oct', lookups: 680,  emails: 520 },
  { month: 'Nov', lookups: 890,  emails: 710 },
  { month: 'Dec', lookups: 1100, emails: 860 },
  { month: 'Jan', lookups: 1540, emails: 1230 },
  { month: 'Feb', lookups: 2200, emails: 1800 },
  { month: 'Mar', lookups: 3100, emails: 2600 },
  { month: 'Apr', lookups: 4400, emails: 3700 },
]

// Inline SVG area chart — same illustrative data, zero chart library (PERF-H2).
const GrowthChart = () => {
  const W = 760, H = 300, padT = 14, padB = 26
  const max = Math.max(...chartData.map((d) => d.lookups))
  const xAt = (i: number) => (i / (chartData.length - 1)) * W
  const yAt = (v: number) => padT + (1 - v / max) * (H - padT - padB)
  const line = (k: 'lookups' | 'emails') =>
    chartData.map((d, i) => `${i ? 'L' : 'M'}${xAt(i).toFixed(1)},${yAt(d[k]).toFixed(1)}`).join(' ')
  const area = (k: 'lookups' | 'emails') =>
    `${line(k)} L${W},${H - padB} L0,${H - padB} Z`

  return (
    <div className="w-full px-6 md:px-10 pb-8 pt-2">
      <div className="relative w-full h-64 md:h-80">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="none"
          className="absolute inset-0 w-full h-full"
          role="img"
          aria-label="Monthly verified lookups and emails found, trending upward from September to April"
        >
          <defs>
            <linearGradient id="scFillLookups" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#0038FF" stopOpacity={0.45} />
              <stop offset="100%" stopColor="#0038FF" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="scFillEmails" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#6b9eff" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#6b9eff" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          {[0.25, 0.5, 0.75].map((t) => (
            <line key={t} x1={0} x2={W} y1={padT + t * (H - padT - padB)} y2={padT + t * (H - padT - padB)} stroke="var(--c-border-light)" strokeWidth={1} />
          ))}
          <path d={area('lookups')} fill="url(#scFillLookups)" />
          <path d={area('emails')}  fill="url(#scFillEmails)" />
          <path d={line('lookups')} fill="none" stroke="#0038FF" strokeWidth={2.5} vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
          <path d={line('emails')}  fill="none" stroke="#6b9eff" strokeWidth={2}   vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
        </svg>
      </div>
      <div className="flex justify-between mt-2 px-0.5">
        {chartData.map((d) => (
          <span key={d.month} className="text-[10px] md:text-[11px]" style={{ color: 'var(--c-muted)', fontFamily: FONT }}>{d.month}</span>
        ))}
      </div>
      <div className="flex items-center gap-4 mt-3">
        <span className="inline-flex items-center gap-1.5 text-[11px]" style={{ color: 'var(--c-muted)', fontFamily: FONT }}>
          <span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ background: '#0038FF' }} /> Verified Lookups
        </span>
        <span className="inline-flex items-center gap-1.5 text-[11px]" style={{ color: 'var(--c-muted)', fontFamily: FONT }}>
          <span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ background: '#6b9eff' }} /> Emails Found
        </span>
      </div>
    </div>
  )
}

const FONT = "var(--font-montserrat,'Montserrat',sans-serif)"

// ── Main component ────────────────────────────────────────────────────────────
export function StatsSection() {
  return (
    <section className="py-14 md:py-24 mt-14 md:mt-0" style={{ background: 'var(--c-section-bg-alt)' }}>
      <div className="mx-auto max-w-[1120px] px-5 md:px-8">

        {/* Section label + heading */}
        <div className="text-center mb-14">
          <SectionBadge variant="light" className="mb-5">Proof - not promises.</SectionBadge>
          <h2
            style={{
              fontFamily: FONT,
              fontWeight: 800,
              fontSize: 'clamp(1.85rem, 3.5vw, 2.75rem)',
              color: 'var(--c-heading)',
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              marginBottom: 12,
            }}
          >
            Results that{' '}
            <HeadingAccent>speak for themselves.</HeadingAccent>
          </h2>
          <p style={{ fontFamily: FONT, fontSize: "clamp(16px,2.5vw,20px)", color: 'var(--c-heading)', margin: '0 auto', lineHeight: 1.6 }}>
            Real numbers from real people using StealthConnect every day.
          </p>
        </div>

        <div className="grid md:grid-cols-2 rounded-2xl overflow-hidden" style={{ border: "1px solid var(--c-border-light)", boxShadow: "0 4px 32px rgba(0,56,255,0.06)" }}>

          {/* ── Map panel ── */}
          <div>
            <div className="p-6 sm:p-10">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(0,56,255,0.08)" }}>
                  <Globe className="size-4" style={{ color: '#0038FF' }} />
                </div>
                <span className="text-[14px] font-bold uppercase tracking-widest" style={{ color: '#0038FF', fontFamily: FONT }}>
                  Global Coverage
                </span>
              </div>
              <p
                className="font-black mb-2"
                style={{ fontFamily: FONT, color: 'var(--c-heading)', letterSpacing: '-0.03em', fontSize: 'clamp(1.5rem,5vw,2.25rem)' }}
              >
                190+ countries.
              </p>
              <p className="text-[16px] leading-relaxed" style={{ fontFamily: FONT, color: 'var(--c-muted)' }}>
                Find verified contacts behind any LinkedIn profile,
                no matter where in the world they are.
              </p>
            </div>

            {/* Map with tooltip */}
            <div aria-hidden className="relative overflow-hidden" style={{ minHeight: 200 }}>
              {/* Edge fade overlays */}
              <div className="absolute inset-x-0 bottom-0 h-1/2 z-[2] pointer-events-none"
                style={{ background: 'linear-gradient(to bottom, transparent, var(--c-section-bg))' }} />
              <div className="absolute inset-y-0 left-0 w-1/5 z-[2] pointer-events-none"
                style={{ background: 'linear-gradient(to right, var(--c-section-bg), transparent)' }} />
              <div className="absolute inset-y-0 right-0 w-1/5 z-[2] pointer-events-none"
                style={{ background: 'linear-gradient(to left, var(--c-section-bg), transparent)' }} />

              {/* Tooltip card — pinned bottom-center */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[3] flex flex-col items-center gap-1">
                <div
                  className="rounded-xl flex items-center gap-2 px-3 py-1.5 text-xs font-semibold shadow-lg whitespace-nowrap"
                  style={{ background: 'var(--c-section-card)', border: '1px solid var(--c-border-light)', color: 'var(--c-heading)', fontFamily: FONT }}
                >
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse inline-block" />
                  <span className="text-sm">🇺🇸</span> Contact found in United States
                </div>
              </div>

              <MapView />
            </div>
          </div>

          {/* ── Lookup flow panel ── */}
          <div className="overflow-hidden p-6 sm:p-10" style={{ background: "var(--c-section-bg-alt)", borderTop: "1px solid var(--c-border-light)", borderLeft: "1px solid var(--c-border-light)" }}>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(0,56,255,0.08)" }}>
                  <Zap className="size-4" style={{ color: '#0038FF' }} />
                </div>
                <span className="text-[14px] font-bold uppercase tracking-widest" style={{ color: '#0038FF', fontFamily: FONT }}>
                  Speed Guarantee
                </span>
              </div>
              <p
                className="font-black mb-2"
                style={{ fontFamily: FONT, color: 'var(--c-heading)', letterSpacing: '-0.03em', fontSize: 'clamp(1.5rem,5vw,2.25rem)' }}
              >
                30 minutes.
              </p>
              <p className="text-[16px] leading-relaxed mb-6" style={{ fontFamily: FONT, color: 'var(--c-muted)' }}>
                Paste a LinkedIn URL. Receive a verified email and
                direct phone number, or you don&apos;t pay.
              </p>
            </div>

            {/* Chat-style lookup flow */}
            <div aria-hidden className="flex flex-col gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="flex justify-center items-center size-5 rounded-full" style={{ border: '1px solid var(--c-border-light)', background: 'var(--c-section-card)' }}>
                    <span className="size-2.5 rounded-full bg-blue-600" />
                  </span>
                  <span className="text-[14px]" style={{ color: 'var(--c-heading)', fontFamily: FONT }}>You · just now</span>
                </div>
                <div
                  className="rounded-xl p-3 text-[14px] w-full sm:w-4/5 shadow-sm"
                  style={{ background: 'var(--c-section-card)', border: '1px solid var(--c-border-light)', color: 'var(--c-body)', fontFamily: FONT }}
                >
                  linkedin.com/in/john-smith-founder
                </div>
              </div>

              <div>
                <div
                  className="rounded-xl mb-1 p-3 text-[14px] text-white w-full sm:w-4/5 ml-auto shadow-sm"
                  style={{ background: '#0038FF', fontFamily: FONT }}
                >
                  <p className="font-bold mb-1.5">✓ Contact verified, ready in 28 min</p>
                  <p className="opacity-80">john.smith@company.com</p>
                  <p className="opacity-80">+1 (415) 555-0182</p>
                </div>
                <span className="text-[13px] block text-right" style={{ color: 'var(--c-heading)', fontFamily: FONT }}>
                  Delivered in 28 min · 1 credit used
                </span>
              </div>
            </div>
          </div>

          {/* ── Big stat ── */}
          <div className="col-span-full p-10 md:p-14" style={{ background: "linear-gradient(135deg,#0038FF 0%,#0029CC 100%)", borderTop: "1px solid var(--c-border-light)" }}>
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-2 mb-3">
                  <ShieldCheck className="w-5 h-5 text-[#CCFF00]" />
                  <span className="text-[14px] font-bold uppercase tracking-widest text-white" style={{ fontFamily: FONT }}>
                    Verification Rate
                  </span>
                </div>
                <p
                  className="text-6xl md:text-7xl lg:text-8xl font-black text-white"
                  style={{ fontFamily: FONT, letterSpacing: '-0.04em', lineHeight: 1 }}
                >
                  97.2%
                </p>
                <p className="mt-2 text-[16px] text-white font-medium" style={{ fontFamily: FONT }}>
                  Every email and phone is triple-verified before delivery
                </p>
              </div>
              <div className="flex flex-col gap-4 shrink-0">
                {[
                  { val: "800M+", label: "Total contacts found" },
                  { val: "28 min", label: "Average delivery time" },
                  
                ].map(s => (
                  <div key={s.label} className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#CCFF00]" />
                    <div>
                      <span className="text-[20px] font-black text-white" style={{ fontFamily: FONT }}>{s.val} </span>
                      <span className="text-[16px] text-white" style={{ fontFamily: FONT }}>{s.label}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Growth chart ── */}
          <div className="col-span-full flex flex-col md:relative md:block" style={{ background: "var(--c-section-card)" }}>
            <div className="relative md:absolute z-10 max-w-lg px-6 pr-12 pt-6 md:px-10 md:pt-10">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(0,56,255,0.08)" }}>
                  <Activity className="size-4" style={{ color: '#0038FF' }} />
                </div>
                <span className="text-[14px] font-bold uppercase tracking-widest" style={{ color: '#0038FF', fontFamily: FONT }}>
                  Growth
                </span>
              </div>
              <p
                className="text-2xl font-black mb-1"
                style={{ fontFamily: FONT, color: 'var(--c-heading)', letterSpacing: '-0.02em' }}
              >
                Growing every month.
              </p>
              <p className="text-[16px] leading-relaxed" style={{ fontFamily: FONT, color: 'var(--c-muted)' }}>
                4,400+ verified contacts delivered in April alone.
                Join thousands finding contacts faster, with less effort.
              </p>
            </div>
            <GrowthChart />
          </div>

        </div>
      </div>
    </section>
  )
}
