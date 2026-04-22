import type { Metadata } from "next";
import dynamic from "next/dynamic";
import Hero from "@/components/sections/Hero";
import Navbar from "@/components/Navbar";
import HowItWorks from "@/components/sections/HowItWorks";

const ph = (h: number) => () => <div style={{ minHeight: h, background: "var(--c-section-bg)" }} />;
const phAlt = (h: number) => () => <div style={{ minHeight: h, background: "var(--c-section-bg-alt)" }} />;

const Features       = dynamic(() => import("@/components/sections/Features"),       { loading: phAlt(600) });
const StatsSection   = dynamic(() => import("@/components/sections/StatsSection").then(m => ({ default: m.StatsSection })), { loading: phAlt(500) });
const Pricing        = dynamic(() => import("@/components/sections/Pricing"),         { loading: phAlt(600) });
const Testimonials   = dynamic(() => import("@/components/sections/Testimonials"),   { loading: ph(400) });
const FAQ            = dynamic(() => import("@/components/sections/FAQ"),             { loading: ph(400) });
const FinalCTA       = dynamic(() => import("@/components/sections/FinalCTA").then(m => ({ default: m.FinalCTA })), { loading: phAlt(400) });
const CinematicFooter = dynamic(() => import("@/components/ui/motion-footer"),       { loading: phAlt(200) });

export const metadata: Metadata = {
  title: "StealthConnect AI — Find Verified LinkedIn Contacts in 30 Minutes",
  description:
    "Paste any LinkedIn URL and get a verified email and direct phone number in 30 minutes. Pay only per result — no subscription, no contracts. First lookup is free.",
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return (
    <main className="min-h-screen" style={{ background: "var(--bg)" }}>
      <Navbar />
      <Hero />
      <HowItWorks />
      <Features />
      <StatsSection />
      <Pricing />
      <Testimonials />
      <FAQ />
      <FinalCTA />
      <CinematicFooter />
    </main>
  );
}
