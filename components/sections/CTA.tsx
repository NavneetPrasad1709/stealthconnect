"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Zap } from "lucide-react";
import { SectionBadge } from "@/components/ui/SectionBadge";
import { HeadingAccent } from "@/components/ui/HeadingAccent";

export default function CTA() {
  return (
    <section
      className="relative px-5 py-28 overflow-hidden"
      style={{ background: "var(--c-section-bg)" }}
    >
      {/* Background glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none w-[600px] h-[400px] animate-glow-pulse"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse, rgba(37,99,235,0.10) 0%, rgba(99,102,241,0.05) 45%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />

      {/* Grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden
        style={{
          backgroundImage: `
            linear-gradient(rgba(37,99,235,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(37,99,235,0.03) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
          maskImage: "radial-gradient(ellipse 70% 70% at 50% 50%, black, transparent)",
          WebkitMaskImage: "radial-gradient(ellipse 70% 70% at 50% 50%, black, transparent)",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 max-w-[640px] mx-auto text-center"
      >
        {/* Icon badge */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex justify-center mb-8"
        >
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ background: "var(--brand)", boxShadow: "var(--shadow-brand)" }}
          >
            <Zap className="w-6 h-6 text-white" strokeWidth={2} />
          </div>
        </motion.div>

        <SectionBadge variant="light" className="mb-6 mx-auto">Start Free Today</SectionBadge>
        <h2
          className="font-extrabold tracking-tight leading-[1.1] mb-5"
          style={{
            fontSize: "clamp(2rem, 4vw, 3.25rem)",
            color: "var(--c-heading)",
            fontFamily: "var(--font-montserrat, 'Montserrat', sans-serif)",
            fontWeight: 800,
          }}
        >
          Your next deal starts with{" "}
          <HeadingAccent>one LinkedIn URL.</HeadingAccent>
        </h2>

        <p
          className="text-[15px] mb-10 max-w-sm mx-auto leading-relaxed"
          style={{ color: "var(--c-body)" }}
        >
          Join 4,200+ sales teams. Get your first contact verified free — no card required.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/signup"
            className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-[14.5px] font-semibold text-white transition-all active:scale-[0.97] w-full sm:w-auto"
            style={{ background: "#0038FF" }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "#0030dd")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "#0038FF")}
          >
            Start free — 1 lookup on us
            <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
          </Link>
          <Link
            href="/login"
            className="px-8 py-4 rounded-2xl text-[14.5px] font-medium border transition-all w-full sm:w-auto text-center"
            style={{ borderColor: "var(--c-border-light)", color: "var(--c-body)" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.color = "var(--c-heading)";
              (e.currentTarget as HTMLElement).style.borderColor = "#0038FF";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.color = "var(--c-body)";
              (e.currentTarget as HTMLElement).style.borderColor = "var(--c-border-light)";
            }}
          >
            Already have an account
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
