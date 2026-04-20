"use client";

import * as React from "react";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";
import Link from "next/link";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// ── Styles ────────────────────────────────────────────────────────────────────
const STYLES = `
.cinematic-footer-wrapper {
  font-family: var(--font-montserrat), 'Montserrat', sans-serif;
  -webkit-font-smoothing: antialiased;

  --pill-bg-1: rgba(255,255,255,0.04);
  --pill-bg-2: rgba(255,255,255,0.02);
  --pill-shadow: rgba(0,0,0,0.5);
  --pill-highlight: rgba(255,255,255,0.08);
  --pill-inset-shadow: rgba(0,0,0,0.6);
  --pill-border: rgba(255,255,255,0.08);

  --pill-bg-1-hover: rgba(255,255,255,0.09);
  --pill-bg-2-hover: rgba(255,255,255,0.04);
  --pill-border-hover: rgba(255,255,255,0.22);
  --pill-shadow-hover: rgba(0,0,0,0.6);
  --pill-highlight-hover: rgba(255,255,255,0.18);
}

@keyframes footer-breathe {
  0%   { transform: translate(-50%, -50%) scale(1);    opacity: 0.35; }
  100% { transform: translate(-50%, -50%) scale(1.12); opacity: 0.6;  }
}

@keyframes footer-scroll-marquee {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
}

@keyframes footer-heartbeat {
  0%, 100% { transform: scale(1);    filter: drop-shadow(0 0 5px rgba(239,68,68,0.5)); }
  15%, 45% { transform: scale(1.28); filter: drop-shadow(0 0 10px rgba(239,68,68,0.8)); }
  30%      { transform: scale(1); }
}

.animate-footer-breathe        { animation: footer-breathe 8s ease-in-out infinite alternate; }
.animate-footer-scroll-marquee { animation: footer-scroll-marquee 38s linear infinite; }
.animate-footer-heartbeat      { animation: footer-heartbeat 2s cubic-bezier(0.25,1,0.5,1) infinite; }

.footer-bg-grid {
  background-size: 60px 60px;
  background-image:
    linear-gradient(to right,  rgba(255,255,255,0.025) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(255,255,255,0.025) 1px, transparent 1px);
  mask-image: linear-gradient(to bottom, transparent, black 25%, black 75%, transparent);
  -webkit-mask-image: linear-gradient(to bottom, transparent, black 25%, black 75%, transparent);
}

.footer-aurora {
  background: radial-gradient(
    circle at 50% 50%,
    rgba(0,56,255,0.15) 0%,
    rgba(59,130,246,0.08) 45%,
    transparent 70%
  );
}

.footer-glass-pill {
  background: linear-gradient(145deg, var(--pill-bg-1) 0%, var(--pill-bg-2) 100%);
  box-shadow:
    0 10px 30px -10px var(--pill-shadow),
    inset 0 1px 1px var(--pill-highlight),
    inset 0 -1px 2px var(--pill-inset-shadow);
  border: 1px solid var(--pill-border);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.footer-glass-pill:hover {
  background: linear-gradient(145deg, var(--pill-bg-1-hover) 0%, var(--pill-bg-2-hover) 100%);
  border-color: var(--pill-border-hover);
  box-shadow:
    0 20px 40px -10px var(--pill-shadow-hover),
    inset 0 1px 1px var(--pill-highlight-hover);
  color: #ffffff;
}

.footer-giant-bg-text {
  font-size: 24vw;
  line-height: 0.75;
  font-weight: 900;
  letter-spacing: -0.05em;
  color: transparent;
  -webkit-text-stroke: 1px rgba(255,255,255,0.04);
  background: linear-gradient(180deg, rgba(255,255,255,0.07) 0%, transparent 60%);
  -webkit-background-clip: text;
  background-clip: text;
}

.footer-text-glow {
  background: linear-gradient(180deg, #ffffff 0%, rgba(255,255,255,0.4) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  filter: drop-shadow(0px 0px 24px rgba(0,56,255,0.22));
}

.footer-link {
  color: rgba(255,255,255,0.38);
  font-size: 20px;
  font-weight: 500;
  transition: color 0.2s ease;
  text-decoration: none;
  display: block;
  padding: 4px 0;
}
.footer-link:hover { color: rgba(255,255,255,0.85); }
@media (max-width: 640px) {
  .footer-link { font-size: 18px; }
}

.footer-col-heading {
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: white;
  margin-bottom: 18px;
}

.footer-divider {
  width: 100%;
  height: 1px;
  background: linear-gradient(to right, transparent, rgba(255,255,255,0.07) 30%, rgba(255,255,255,0.07) 70%, transparent);
}
`;

// ── Magnetic Button ───────────────────────────────────────────────────────────
export type MagneticButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    as?: React.ElementType;
  };

const MagneticButton = React.forwardRef<HTMLElement, MagneticButtonProps>(
  ({ className, children, as: Component = "button", ...props }, forwardedRef) => {
    const localRef = useRef<HTMLElement>(null);

    useEffect(() => {
      if (typeof window === "undefined") return;
      const el = localRef.current;
      if (!el) return;

      const ctx = gsap.context(() => {
        const onMove = (e: MouseEvent) => {
          const rect = el.getBoundingClientRect();
          const x = e.clientX - rect.left - rect.width / 2;
          const y = e.clientY - rect.top  - rect.height / 2;
          gsap.to(el, { x: x * 0.38, y: y * 0.38, rotationX: -y * 0.14, rotationY: x * 0.14, scale: 1.05, ease: "power2.out", duration: 0.4 });
        };
        const onLeave = () => {
          gsap.to(el, { x: 0, y: 0, rotationX: 0, rotationY: 0, scale: 1, ease: "elastic.out(1, 0.3)", duration: 1.2 });
        };
        el.addEventListener("mousemove", onMove as any);
        el.addEventListener("mouseleave", onLeave);
        return () => {
          el.removeEventListener("mousemove", onMove as any);
          el.removeEventListener("mouseleave", onLeave);
        };
      }, el);

      return () => ctx.revert();
    }, []);

    return (
      <Component
        ref={(node: HTMLElement) => {
          (localRef as any).current = node;
          if (typeof forwardedRef === "function") forwardedRef(node);
          else if (forwardedRef) (forwardedRef as any).current = node;
        }}
        className={cn("cursor-pointer", className)}
        {...props}
      >
        {children}
      </Component>
    );
  }
);
MagneticButton.displayName = "MagneticButton";

// ── Marquee ───────────────────────────────────────────────────────────────────
const MarqueeItem = () => (
  <div className="flex items-center space-x-12 px-6">
    <span>Verified Contacts</span>
    <span style={{ color: "rgba(0,56,255,0.6)" }}>✦</span>
    <span>30-Minute Delivery</span>
    <span style={{ color: "rgba(99,102,241,0.6)" }}>✦</span>
    <span>Pay Per Result</span>
    <span style={{ color: "rgba(0,56,255,0.6)" }}>✦</span>
    <span>LinkedIn Intelligence</span>
    <span style={{ color: "rgba(99,102,241,0.6)" }}>✦</span>
    <span>97.2% Accuracy</span>
    <span style={{ color: "rgba(0,56,255,0.6)" }}>✦</span>
    <span>Zero Subscription</span>
    <span style={{ color: "rgba(99,102,241,0.6)" }}>✦</span>
  </div>
);

// ── Nav columns ───────────────────────────────────────────────────────────────
const NAV = [
  {
    heading: "Product",
    links: [
      { label: "How It Works",  href: "/#how-it-works" },
      { label: "Features",      href: "/#features" },
      { label: "Pricing",       href: "/#pricing" },
      { label: "Free Trial",    href: "/signup" },
      { label: "FAQ",           href: "/#faq" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "Contact",       href: "/contact" },
      { label: "Privacy Policy",href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "GDPR",          href: "/gdpr" },
    ],
  },
];

const SOCIALS = [
  {
    label: "LinkedIn",
    href: "https://linkedin.com",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  {
    label: "X / Twitter",
    href: "https://x.com",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    label: "GitHub",
    href: "https://github.com",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
      </svg>
    ),
  },
];

// ── Main Footer ───────────────────────────────────────────────────────────────
export default function CinematicFooter() {
  const wrapperRef   = useRef<HTMLDivElement>(null);
  const giantTextRef = useRef<HTMLDivElement>(null);
  const headingRef   = useRef<HTMLHeadingElement>(null);
  const bodyRef      = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !wrapperRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        giantTextRef.current,
        { y: "12vh", scale: 0.82, opacity: 0 },
        {
          y: "0vh", scale: 1, opacity: 1, ease: "power1.out",
          scrollTrigger: { trigger: wrapperRef.current, start: "top 85%", end: "bottom bottom", scrub: 1.2 },
        }
      );
      gsap.fromTo(
        [headingRef.current, bodyRef.current],
        { y: 48, opacity: 0 },
        {
          y: 0, opacity: 1, stagger: 0.12, ease: "power3.out",
          scrollTrigger: { trigger: wrapperRef.current, start: "top 45%", end: "bottom bottom", scrub: 1 },
        }
      );
    }, wrapperRef);

    return () => ctx.revert();
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />
      <div
        ref={wrapperRef}
        className="relative w-full"
        style={{ clipPath: "polygon(0% 0, 100% 0%, 100% 100%, 0 100%)" }}
      >
        <footer
          className="cinematic-footer-wrapper relative w-full overflow-hidden"
          style={{ background: "#000000", color: "#ffffff" }}
        >
          {/* Aurora */}
          <div className="footer-aurora absolute left-1/2 top-1/2 h-[60vh] w-[80vw] -translate-x-1/2 -translate-y-1/2 animate-footer-breathe rounded-[50%] blur-[80px] pointer-events-none z-0" />
          {/* Grid */}
          <div className="footer-bg-grid absolute inset-0 z-0 pointer-events-none" />
          {/* Giant bg text */}
          <div
            ref={giantTextRef}
            className="footer-giant-bg-text absolute -bottom-[4vh] left-1/2 -translate-x-1/2 whitespace-nowrap z-0 pointer-events-none select-none"
          >
            STEALTH
          </div>

          {/* ── Lime top accent line ── */}
          <div className="relative z-10 w-full h-[3px]" style={{ background: "linear-gradient(90deg, #0038FF 0%, #CCFF00 50%, #0038FF 100%)" }} />

          {/* ── Marquee band ── */}
          <div
            className="relative z-10 w-full overflow-hidden py-4 -rotate-1 scale-105"
            style={{
              borderTop: "1px solid rgba(255,255,255,0.06)",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
              background: "rgba(0,0,0,0.55)",
              backdropFilter: "blur(12px)",
            }}
          >
            <div
              className="flex w-max animate-footer-scroll-marquee text-xs font-bold tracking-[0.28em] uppercase"
              style={{ color: "rgba(255,255,255,0.32)" }}
            >
              <MarqueeItem /><MarqueeItem />
            </div>
          </div>

          {/* ── Main content ── */}
          <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 md:px-12 pt-10 sm:pt-16 md:pt-20 pb-10">

            {/* Headline + CTA */}
            <div ref={headingRef} className="text-center mb-16">
              <h2
                className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-4"
                style={{ fontFamily: "var(--font-montserrat,'Montserrat',sans-serif)", color: "#ffffff" }}
              >
                Find anyone.
                <br />
                <span style={{ color: "#CCFF00" }}>Connect faster.</span>
              </h2>
              <p className="text-[15px] sm:text-[18px] mb-8 mx-auto" style={{ color: "white", fontFamily: "var(--font-montserrat,'Montserrat',sans-serif)" }}>
                One LinkedIn URL. One verified contact. Zero subscriptions.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <MagneticButton
                  as={Link}
                  href="/signup"
                  className="footer-glass-pill inline-flex items-center gap-3 px-6 sm:px-9 py-3 sm:py-4 rounded-full font-bold text-sm"
                  style={{ color: "#ffffff" }}
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Start Free — 1 Lookup
                </MagneticButton>
                <MagneticButton
                  as={Link}
                  href="/#pricing"
                  className="footer-glass-pill inline-flex items-center gap-3 px-6 sm:px-9 py-3 sm:py-4 rounded-full font-bold text-sm"
                  style={{ color: "white" }}
                >
                  View Pricing
                </MagneticButton>
              </div>
            </div>

            {/* Divider */}
            <div className="footer-divider mb-14" />

            {/* ── Nav grid ── */}
            <div ref={bodyRef} className="grid grid-cols-2 md:grid-cols-[2fr_1fr_1fr] gap-10 md:gap-12 mb-14">

              {/* Brand column */}
              <div className="col-span-2 md:col-span-1 md:pr-8">
                {/* Wordmark */}
                <div className="flex items-center gap-2 mb-4">
                  <div
                    className="flex items-center justify-center rounded-lg text-white font-black text-xs"
                    style={{ width: 32, height: 32, background: "#0038FF", fontFamily: "var(--font-montserrat,'Montserrat',sans-serif)" }}
                  >
                    SC
                  </div>
                  <span
                    className="font-bold text-sm"
                    style={{ fontFamily: "var(--font-montserrat,'Montserrat',sans-serif)", letterSpacing: "-0.02em", color: "#ffffff" }}
                  >
                    Stealth<span style={{ color: "#CCFF00" }}>Connect</span> AI
                  </span>
                </div>

                <p
                  className="text-lg leading-relaxed mb-6"
                  style={{ color: "white", fontFamily: "var(--font-montserrat,'Montserrat',sans-serif)" }}
                >
                  Verified LinkedIn contacts in 30 minutes. Pay only per result — no subscriptions.
                </p>

                {/* Social icons */}
                <div className="flex items-center gap-3">
                  {SOCIALS.map((s) => (
                    <a
                      key={s.label}
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={s.label}
                      className="footer-glass-pill w-9 h-9 rounded-full flex items-center justify-center"
                      style={{ color: "rgba(255,255,255,0.45)" }}
                    >
                      {s.icon}
                    </a>
                  ))}
                </div>
              </div>

              {/* Nav columns */}
              {NAV.map((col) => (
                <div key={col.heading}>
                  <p className="footer-col-heading">{col.heading}</p>
                  <ul className="space-y-1">
                    {col.links.map((l) => (
                      <li key={l.label}>
                        <Link href={l.href} className="footer-link">{l.label}</Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Divider */}
            <div className="footer-divider mb-8" />

            {/* ── Bottom bar ── */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-5">
              <p
                className="text-[11px] font-semibold tracking-widest uppercase order-2 md:order-1"
                style={{ color: "rgba(255,255,255,0.25)" }}
              >
                © {new Date().getFullYear()} StealthConnect AI · All rights reserved.
              </p>

              <div className="footer-glass-pill px-5 py-2.5 rounded-full flex items-center gap-2 order-1 md:order-2 cursor-default">
                <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.28)" }}>Built for</span>
                <span className="animate-footer-heartbeat text-sm">❤</span>
                <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.28)" }}>everyone worldwide</span>
              </div>

              <MagneticButton
                as="button"
                onClick={scrollToTop}
                className="flex flex-col items-center gap-1.5 group order-3 cursor-pointer bg-transparent border-none"
                style={{ color: "#ffffff" }}
              >
                <div className="w-14 h-14 rounded-full footer-glass-pill flex items-center justify-center">
                  <svg className="w-6 h-6 group-hover:-translate-y-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                </div>
                <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.45)" }}>Back to Top</span>
              </MagneticButton>
            </div>

          </div>
        </footer>
      </div>
    </>
  );
}
