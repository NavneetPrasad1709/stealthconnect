"use client";

import { motion } from "framer-motion";

const COMPANIES = [
  "Stripe", "Linear", "Notion", "Vercel", "Figma",
  "Intercom", "HubSpot", "Salesforce", "Segment", "Mixpanel",
];

export default function LogoStrip() {
  return (
    <section
      className="relative py-12 overflow-hidden"
      style={{ borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", background: "var(--bg-secondary)" }}
    >
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-center text-[11.5px] font-semibold uppercase tracking-[0.22em] mb-8"
        style={{ color: "var(--fg-subtle)" }}
      >
        Trusted by teams at
      </motion.p>

      {/* Scrolling strip */}
      <div className="relative overflow-hidden">
        {/* Fade masks */}
        <div
          className="absolute left-0 top-0 bottom-0 w-32 z-10 pointer-events-none"
          style={{ background: "linear-gradient(to right, var(--bg-secondary), transparent)" }}
        />
        <div
          className="absolute right-0 top-0 bottom-0 w-32 z-10 pointer-events-none"
          style={{ background: "linear-gradient(to left, var(--bg-secondary), transparent)" }}
        />

        <div className="flex animate-[marquee_30s_linear_infinite] w-max gap-16 items-center px-8">
          {[...COMPANIES, ...COMPANIES].map((name, i) => (
            <span
              key={`${name}-${i}`}
              className="text-[15px] font-semibold whitespace-nowrap select-none"
              style={{
                color: "var(--fg-subtle)",
                fontFamily: "var(--font-montserrat, 'Montserrat', sans-serif)",
                letterSpacing: "-0.01em",
              }}
            >
              {name}
            </span>
          ))}
        </div>
      </div>

      <style jsx global>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  );
}
