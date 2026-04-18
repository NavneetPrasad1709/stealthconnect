import type { Metadata } from "next";
import CinematicFooter from "@/components/ui/motion-footer";
import { FinalCTA } from "@/components/sections/FinalCTA";
import FAQ from "@/components/sections/FAQ";
import Testimonials from "@/components/sections/Testimonials";
import Pricing from "@/components/sections/Pricing";
import { StatsSection } from "@/components/sections/StatsSection";
import Hero from "@/components/sections/Hero";
import Features from "@/components/sections/Features";
import HowItWorks from "@/components/sections/HowItWorks";
import TrustedBy from "@/components/sections/TrustedBy";
import Navbar from "@/components/Navbar";

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
