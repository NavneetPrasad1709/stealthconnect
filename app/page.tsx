import type { Metadata } from "next";
import dynamic from "next/dynamic";
import Hero from "@/components/sections/Hero";
import HowItWorks from "@/components/sections/HowItWorks";
import Navbar from "@/components/Navbar";

const TrustedBy      = dynamic(() => import("@/components/sections/TrustedBy"));
const Features       = dynamic(() => import("@/components/sections/Features"));
const StatsSection   = dynamic(() => import("@/components/sections/StatsSection").then(m => ({ default: m.StatsSection })));
const Testimonials   = dynamic(() => import("@/components/sections/Testimonials"));
const Pricing        = dynamic(() => import("@/components/sections/Pricing"));
const FAQ            = dynamic(() => import("@/components/sections/FAQ"));
const FinalCTA       = dynamic(() => import("@/components/sections/FinalCTA").then(m => ({ default: m.FinalCTA })));
const CinematicFooter = dynamic(() => import("@/components/ui/motion-footer"));

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
      <TrustedBy />
      <Features />
      <StatsSection />
      <Testimonials />
      <Pricing />
      <FAQ />
      <FinalCTA />
      <CinematicFooter />
    </main>
  );
}
