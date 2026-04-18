"use client";

import React from "react";
import { m } from "framer-motion";
import { SectionBadge } from "@/components/ui/SectionBadge";
import { HeadingAccent } from "@/components/ui/HeadingAccent";

interface Testimonial {
  text: string;
  image: string;
  name: string;
  role: string;
  company: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    text: "I pasted a LinkedIn URL for a CRO I'd been trying to reach for 3 months. Had his verified mobile in 22 minutes. Closed the deal two weeks later.",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150&h=150",
    name: "James Whitfield",
    role: "Account Executive",
    company: "Salesforce",
  },
  {
    text: "We replaced a $1,200/month data provider with StealthConnect. Same quality contacts, pay only when we need them. ROI was obvious in week one.",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150&h=150",
    name: "Priya Nair",
    role: "VP of Sales",
    company: "GrowthLabs",
  },
  {
    text: "97% accuracy isn't marketing fluff — I've tested it. Out of 200 emails purchased, 194 delivered. That's better than any tool we've tried.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150&h=150",
    name: "Marcus Webb",
    role: "Head of Demand Gen",
    company: "HubSpot",
  },
  {
    text: "The no-subscription model is a game changer for our agency. We scale up during campaigns and pay nothing in quiet months. Pure flexibility.",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150&h=150",
    name: "Sofia Reyes",
    role: "Founder",
    company: "Apex Growth Co.",
  },
  {
    text: "Tried 4 other LinkedIn contact tools. StealthConnect is the only one that gives me a direct number, not a switchboard. Worth every cent.",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150&h=150",
    name: "Hannah Cole",
    role: "SDR Manager",
    company: "Stripe",
  },
  {
    text: "Onboarded my whole BDR team in under an hour. They were submitting URLs and getting contacts before lunch. Zero learning curve.",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150&h=150",
    name: "Daniel Park",
    role: "Director of Sales",
    company: "Notion",
  },
  {
    text: "I appreciate that they just don't charge if they can't verify. It builds real trust. I've never once disputed a charge in 8 months.",
    image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=150&h=150",
    name: "Aisha Okonkwo",
    role: "Revenue Operations",
    company: "Intercom",
  },
  {
    text: "We use StealthConnect for enterprise outbound. Decision-maker mobiles for Fortune 500 targets — delivered in under 30 minutes. Unreal.",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150&h=150",
    name: "Tom Hassan",
    role: "CRO",
    company: "DataStack",
  },
  {
    text: "The free first lookup sold me instantly. Got the CFO's email I needed, signed up, and I've been a customer ever since. Best freemium hook in B2B.",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=150&h=150",
    name: "Ryan Cho",
    role: "CEO",
    company: "Venture.io",
  },
];

const col1 = TESTIMONIALS.slice(0, 3);
const col2 = TESTIMONIALS.slice(3, 6);
const col3 = TESTIMONIALS.slice(6, 9);

function TestimonialCard({ text, image, name, role, company, dupIndex, i }: Testimonial & { dupIndex: number; i: number }) {
  return (
    <m.li
      key={`${dupIndex}-${i}`}
      aria-hidden={dupIndex === 1 ? "true" : "false"}
      tabIndex={dupIndex === 1 ? -1 : 0}
      whileHover={{
        scale: 1.02,
        y: -6,
        boxShadow: "0 20px 48px rgba(0,56,255,0.14), 0 4px 16px rgba(0,0,0,0.06)",
        transition: { type: "spring", stiffness: 400, damping: 20 },
      }}
      className="p-6 rounded-2xl max-w-xs w-full cursor-default select-none focus:outline-none list-none"
      style={{
        background: "var(--c-section-card)",
        border: "1px solid var(--c-border-light)",
        borderLeft: "3px solid #0038FF",
        boxShadow: "0 2px 16px rgba(0,56,255,0.07)",
      }}
    >
      <blockquote className="m-0 p-0">
        <p
          className="leading-relaxed font-normal m-0 text-[14px]"
          style={{ color: "var(--c-body)", fontFamily: "var(--font-montserrat, 'Montserrat', sans-serif)" }}
        >
          &ldquo;{text}&rdquo;
        </p>
        <footer className="flex items-center gap-3 mt-5">
          <img
            width={40}
            height={40}
            src={image}
            alt={`Avatar of ${name}`}
            className="h-10 w-10 rounded-full object-cover shrink-0"
            style={{ border: "2px solid #0038FF" }}
          />
          <div className="flex flex-col">
            <cite
              className="font-semibold not-italic leading-5 text-[13.5px]"
              style={{ color: "var(--c-heading)", fontFamily: "var(--font-montserrat, 'Montserrat', sans-serif)" }}
            >
              {name}
            </cite>
            <span
              className="text-[12px] leading-5 mt-0.5"
              style={{ color: "#6b7280", fontFamily: "var(--font-montserrat, 'Montserrat', sans-serif)" }}
            >
              {role} · {company}
            </span>
          </div>
        </footer>
      </blockquote>
    </m.li>
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
    <div className={`overflow-hidden ${className ?? ""}`}>
      <m.ul
        animate={{ translateY: "-50%" }}
        transition={{ duration, repeat: Infinity, ease: "linear", repeatType: "loop" }}
        className="flex flex-col gap-5 pb-5 m-0 p-0"
      >
        {[0, 1].map((dupIndex) => (
          <React.Fragment key={dupIndex}>
            {testimonials.map((t, i) => (
              <TestimonialCard key={`${dupIndex}-${i}`} {...t} dupIndex={dupIndex} i={i} />
            ))}
          </React.Fragment>
        ))}
      </m.ul>
    </div>
  );
}

export default function Testimonials() {
  return (
    <section
      id="testimonials"
      aria-labelledby="testimonials-heading"
      className="relative overflow-hidden"
      style={{ background: "var(--c-section-bg)", padding: "96px 0" }}
    >
      {/* Subtle dot grid */}
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

      <m.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 container px-5 mx-auto"
      >
        {/* Header */}
        <div className="flex flex-col items-center justify-center max-w-[540px] mx-auto mb-14 text-center">
          <SectionBadge variant="light" className="mb-5">Testimonials</SectionBadge>
          <h2
            id="testimonials-heading"
            className="font-extrabold tracking-tight leading-[1.1] mb-5"
            style={{
              fontSize: "clamp(1.85rem, 3.5vw, 2.75rem)",
              color: "var(--c-heading)",
              fontFamily: "var(--font-montserrat, 'Montserrat', sans-serif)",
              fontWeight: 800,
            }}
          >
            Trusted by 4,200+ <HeadingAccent>sales teams.</HeadingAccent>
          </h2>
          <p
            className="text-[15px] leading-relaxed"
            style={{ color: "var(--c-body)", maxWidth: 420 }}
          >
            Real results from real reps — from SDRs to CROs, across every industry.
          </p>
        </div>

        {/* Scrolling columns */}
        <div
          className="flex justify-center gap-5 mt-10 max-h-[720px] overflow-hidden"
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
      </m.div>
    </section>
  );
}
