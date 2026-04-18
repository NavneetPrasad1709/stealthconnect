"use client"

import AutoScroll from "embla-carousel-auto-scroll"
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel"
import { motion } from "framer-motion"

const FONT = "var(--font-montserrat,'Montserrat',sans-serif)"

const LOGOS = [
  { id: "salesforce", name: "Salesforce", src: "https://logo.clearbit.com/salesforce.com"  },
  { id: "hubspot",    name: "HubSpot",    src: "https://logo.clearbit.com/hubspot.com"     },
  { id: "linkedin",   name: "LinkedIn",   src: "https://logo.clearbit.com/linkedin.com"    },
  { id: "slack",      name: "Slack",      src: "https://logo.clearbit.com/slack.com"       },
  { id: "zapier",     name: "Zapier",     src: "https://logo.clearbit.com/zapier.com"      },
  { id: "outreach",   name: "Outreach",   src: "https://logo.clearbit.com/outreach.io"     },
  { id: "apollo",     name: "Apollo",     src: "https://logo.clearbit.com/apollo.io"       },
  { id: "pipedrive",  name: "Pipedrive",  src: "https://logo.clearbit.com/pipedrive.com"   },
  { id: "notion",     name: "Notion",     src: "https://logo.clearbit.com/notion.so"       },
  { id: "zoominfo",   name: "ZoomInfo",   src: "https://logo.clearbit.com/zoominfo.com"    },
  { id: "gong",       name: "Gong",       src: "https://logo.clearbit.com/gong.io"         },
  { id: "salesloft",  name: "Salesloft",  src: "https://logo.clearbit.com/salesloft.com"   },
]

const STATS = [
  { value: "4,200+", label: "Sales teams"       },
  { value: "97.2%",  label: "Verified accuracy" },
  { value: "190+",   label: "Countries covered" },
]

export default function TrustedBy() {
  return (
    <section
      style={{
        background: "var(--c-section-bg-alt)",
        borderTop:    "1px solid var(--c-border-light)",
        borderBottom: "1px solid var(--c-border-light)",
        padding: "72px 0 64px",
        overflow: "hidden",
      }}
    >
      {/* ── Header ──────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        className="text-center px-5 mb-12"
      >
        {/* Eyebrow */}
        <p
          className="mb-4 inline-flex items-center gap-2"
          style={{
            fontFamily: FONT,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "var(--c-muted)",
          }}
        >
          <span
            className="inline-block w-5 h-px"
            style={{ background: "var(--c-muted)" }}
          />
          Trusted worldwide
          <span
            className="inline-block w-5 h-px"
            style={{ background: "var(--c-muted)" }}
          />
        </p>

        {/* Main heading */}
        <h2
          style={{
            fontFamily: FONT,
            fontSize: "clamp(1.65rem, 3.5vw, 2.5rem)",
            fontWeight: 800,
            letterSpacing: "-0.028em",
            lineHeight: 1.12,
            color: "var(--c-heading)",
          }}
        >
          <span style={{ color: "#0038FF" }}>4,200+</span> sales teams
          <br className="hidden sm:block" />
          {" "}trust StealthConnect every day.
        </h2>

        <p
          style={{
            fontFamily: FONT,
            fontSize: 14.5,
            color: "var(--c-body)",
            marginTop: 12,
            lineHeight: 1.65,
          }}
        >
          From solo SDRs to Fortune 500 outbound teams — across every industry.
        </p>
      </motion.div>

      {/* ── Logo carousel ────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.9, delay: 0.15 }}
        className="relative"
      >
        <Carousel
          opts={{ loop: true }}
          plugins={[AutoScroll({ playOnInit: true, speed: 1.1, stopOnInteraction: false })]}
        >
          <CarouselContent className="ml-0 items-center">
            {LOGOS.map((logo) => (
              <CarouselItem
                key={logo.id}
                className="basis-1/3 sm:basis-1/4 md:basis-1/5 lg:basis-1/6 xl:basis-1/7 pl-0 flex items-center justify-center"
              >
                <div className="px-8 py-3 flex items-center justify-center">
                  <img
                    src={logo.src}
                    alt={logo.name}
                    height={28}
                    className="h-7 w-auto object-contain transition-all duration-300
                      grayscale opacity-[0.38] hover:grayscale-0 hover:opacity-75
                      dark:grayscale-0 dark:brightness-0 dark:invert dark:opacity-[0.28]
                      dark:hover:brightness-100 dark:hover:invert-0 dark:hover:grayscale-0 dark:hover:opacity-70"
                    draggable={false}
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>

        {/* Theme-aware edge fades */}
        <div
          className="pointer-events-none absolute inset-y-0 left-0 w-32 z-10"
          style={{ background: "linear-gradient(to right, var(--c-section-bg-alt) 20%, transparent)" }}
        />
        <div
          className="pointer-events-none absolute inset-y-0 right-0 w-32 z-10"
          style={{ background: "linear-gradient(to left, var(--c-section-bg-alt) 20%, transparent)" }}
        />
      </motion.div>

      {/* ── Stats row ────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="mt-14 mx-auto flex items-stretch justify-center px-5"
        style={{ maxWidth: 560 }}
      >
        {STATS.map((s, i) => (
          <div
            key={s.label}
            className="flex-1 text-center"
            style={{
              padding: "0 20px",
              borderLeft: i > 0 ? "1px solid var(--c-border-light)" : "none",
            }}
          >
            <p
              style={{
                fontFamily: FONT,
                fontSize: "clamp(1.3rem, 2.8vw, 1.75rem)",
                fontWeight: 800,
                letterSpacing: "-0.025em",
                lineHeight: 1.1,
                color: "var(--c-heading)",
              }}
            >
              {s.value}
            </p>
            <p
              style={{
                fontFamily: FONT,
                fontSize: 11.5,
                fontWeight: 500,
                color: "var(--c-muted)",
                marginTop: 5,
                letterSpacing: "0.01em",
              }}
            >
              {s.label}
            </p>
          </div>
        ))}
      </motion.div>
    </section>
  )
}
