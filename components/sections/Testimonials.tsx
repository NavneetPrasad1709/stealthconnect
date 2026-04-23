"use client";

import React from "react";
import { SectionBadge } from "@/components/ui/SectionBadge";
import { HeadingAccent } from "@/components/ui/HeadingAccent";

interface Testimonial {
  text: string;
  initials: string;
  color: string;
  name: string;
  role: string;
  company: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    text: "I pasted a LinkedIn URL for a CTO I'd been trying to reach for 3 months. Had his verified mobile in 22 minutes. Signed the partnership two weeks later.",
    initials: "JW",
    color: "#0038FF",
    name: "James W.",
    role: "Business Development",
    company: "Enterprise Software Co.",
  },
  {
    text: "We replaced a $1,200/month data provider with StealthConnect. Same quality contacts, pay only when we need them. ROI was obvious in week one.",
    initials: "PN",
    color: "#6366f1",
    name: "Priya N.",
    role: "VP of Partnerships",
    company: "B2B Growth Agency",
  },
  {
    text: "97% accuracy isn't marketing fluff — I've tested it. Out of 200 emails purchased, 194 delivered. That's better than any tool we've tried.",
    initials: "MW",
    color: "#0891b2",
    name: "Marcus W.",
    role: "Head of Demand Gen",
    company: "SaaS Marketing Platform",
  },
  {
    text: "The no-subscription model is a game changer for our agency. We scale up during campaigns and pay nothing in quiet months. Pure flexibility.",
    initials: "SR",
    color: "#7c3aed",
    name: "Sofia R.",
    role: "Founder",
    company: "Digital Marketing Agency",
  },
  {
    text: "Tried 4 other LinkedIn contact tools. StealthConnect is the only one that gives me a direct number, not a switchboard. Worth every cent.",
    initials: "HC",
    color: "#0d9488",
    name: "Hannah C.",
    role: "Talent Partner",
    company: "Fintech Scale-up",
  },
  {
    text: "Onboarded my whole recruiting team in under an hour. They were submitting URLs and getting contacts before lunch. Zero learning curve.",
    initials: "DP",
    color: "#0038FF",
    name: "Daniel P.",
    role: "Head of Recruiting",
    company: "Productivity SaaS",
  },
  {
    text: "I appreciate that they just don't charge if they can't verify. It builds real trust. I've never once disputed a charge in 8 months.",
    initials: "AO",
    color: "#be185d",
    name: "Aisha O.",
    role: "Operations Lead",
    company: "Customer Success Platform",
  },
  {
    text: "We use StealthConnect for enterprise contact research. Direct mobiles for Fortune 500 decision-makers — delivered in under 30 minutes. Unreal.",
    initials: "TH",
    color: "#1d4ed8",
    name: "Tom H.",
    role: "CTO",
    company: "Data Analytics Startup",
  },
  {
    text: "The free first lookup sold me instantly. Got the CFO's email I needed, signed up, and I've been a customer ever since. Best freemium hook in B2B.",
    initials: "RC",
    color: "#0369a1",
    name: "Ryan C.",
    role: "CEO",
    company: "Venture-Backed SaaS",
  },
];

const col1 = TESTIMONIALS.slice(0, 3);
const col2 = TESTIMONIALS.slice(3, 6);
const col3 = TESTIMONIALS.slice(6, 9);

const FONT = "var(--font-montserrat, 'Montserrat', sans-serif)";

function TestimonialCard({
  text, initials, color, name, role, company, dupIndex,
}: Testimonial & { dupIndex: number }) {
  return (
    <li
      aria-hidden={dupIndex === 1 ? "true" : "false"}
      tabIndex={dupIndex === 1 ? -1 : 0}
      className="p-6 rounded-2xl max-w-xs w-full cursor-default select-none focus:outline-none list-none
                 transition-[transform,box-shadow] duration-200 ease-out will-change-transform
                 hover:scale-[1.02] hover:-translate-y-1.5"
      style={{
        background: "var(--c-section-card)",
        border: "1px solid var(--c-border-light)",
        borderLeft: "3px solid #0038FF",
        boxShadow: "0 2px 16px rgba(0,56,255,0.07)",
      }}
    >
      <blockquote className="m-0 p-0">
        <p
          className="leading-relaxed font-normal m-0 text-[16px]"
          style={{ color: "var(--c-body)", fontFamily: FONT }}
        >
          &ldquo;{text}&rdquo;
        </p>
        <footer className="flex items-center gap-3 mt-5">
          <div
            aria-hidden="true"
            className="h-10 w-10 rounded-full shrink-0 flex items-center justify-center text-white text-[13px] font-bold select-none"
            style={{ background: color, border: "2px solid rgba(255,255,255,0.15)" }}
          >
            {initials}
          </div>
          <div className="flex flex-col">
            <cite
              className="font-semibold not-italic leading-5 text-[16px]"
              style={{ color: "var(--c-heading)", fontFamily: FONT }}
            >
              {name}
            </cite>
            <span
              className="text-[14px] leading-5 mt-0.5"
              style={{ color: "var(--c-heading)", fontFamily: FONT }}
            >
              {role} · {company}
            </span>
          </div>
        </footer>
      </blockquote>
    </li>
  );
}

function TestimonialsColumn({
  testimonials,
  duration = 15,
  className,
}: {
  testimonials: Testimonial[];
  duration?: number;
  className?: string;
}) {
  return (
    <div className={`overflow-hidden h-[480px] md:h-[560px] ${className ?? ""}`}>
      <ul
        className="flex flex-col gap-5 pb-5 m-0 p-0"
        style={{ animation: `sc-scroll-col ${duration}s linear infinite` }}
      >
        {[0, 1].map((dupIndex) => (
          <React.Fragment key={dupIndex}>
            {testimonials.map((t, i) => (
              <TestimonialCard key={`${dupIndex}-${i}`} {...t} dupIndex={dupIndex} />
            ))}
          </React.Fragment>
        ))}
      </ul>
    </div>
  );
}

export default function Testimonials() {
  return (
    <section
      id="testimonials"
      aria-labelledby="testimonials-heading"
      className="relative overflow-hidden py-14 md:py-24"
      style={{ background: "var(--c-section-bg)" }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden
        style={{
          backgroundImage: "radial-gradient(circle, rgba(0,56,255,0.07) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          maskImage: "radial-gradient(ellipse 80% 60% at 50% 50%, black 30%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 80% 60% at 50% 50%, black 30%, transparent 100%)",
        }}
      />

      <div className="relative z-10 container px-5 mx-auto">
        <div className="flex flex-col items-center justify-center mx-auto mb-14 text-center">
          <SectionBadge variant="light" className="mb-5">Testimonials</SectionBadge>
          <h2
            id="testimonials-heading"
            className="font-extrabold tracking-tight leading-[1.1] mb-5"
            style={{
              fontSize: "clamp(1.85rem, 3.5vw, 2.75rem)",
              color: "var(--c-heading)",
              fontFamily: FONT,
              fontWeight: 800,
            }}
          >
            Trusted by <HeadingAccent>users worldwide.</HeadingAccent>
          </h2>
          <p
            className="leading-relaxed"
            style={{ fontSize: "clamp(16px,2.5vw,20px)", color: "var(--c-heading)" }}
          >
            Real results from real people — recruiters, founders, researchers, and more.
          </p>
        </div>

        <div
          className="flex justify-center gap-5 mt-10 overflow-hidden"
          role="region"
          aria-label="Scrolling testimonials"
          style={{
            maskImage: "linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)",
            WebkitMaskImage: "linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)",
          }}
        >
          <TestimonialsColumn testimonials={col1} duration={17} />
          <TestimonialsColumn testimonials={col2} duration={21} className="hidden md:block" />
          <TestimonialsColumn testimonials={col3} duration={19} className="hidden lg:block" />
        </div>
      </div>
    </section>
  );
}
