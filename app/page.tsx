import type { Metadata } from "next";
import dynamic from "next/dynamic";
import Hero from "@/components/sections/Hero";
import Navbar from "@/components/Navbar";
import HowItWorks from "@/components/sections/HowItWorks";

const ph = (h: number) => () => <div style={{ minHeight: h, background: "var(--c-section-bg)" }} />;
const phAlt = (h: number) => () => <div style={{ minHeight: h, background: "var(--c-section-bg-alt)" }} />;

const Features        = dynamic(() => import("@/components/sections/Features"),       { loading: phAlt(600) });
const StatsSection    = dynamic(() => import("@/components/sections/StatsSection").then(m => ({ default: m.StatsSection })), { loading: phAlt(500) });
const Pricing         = dynamic(() => import("@/components/sections/Pricing"),         { loading: phAlt(600) });
const Testimonials    = dynamic(() => import("@/components/sections/Testimonials"),   { loading: ph(400) });
const FAQ             = dynamic(() => import("@/components/sections/FAQ"),             { loading: ph(400) });
const FinalCTA        = dynamic(() => import("@/components/sections/FinalCTA").then(m => ({ default: m.FinalCTA })), { loading: phAlt(400) });
const CinematicFooter = dynamic(() => import("@/components/ui/motion-footer"),        { loading: phAlt(200) });

export const metadata: Metadata = {
  title: "StealthConnect AI — Find Verified LinkedIn Contacts in 30 Minutes",
  description:
    "Paste any LinkedIn URL and get a verified email and direct phone number in 30 minutes. Pay only per result — no subscription, no contracts. First lookup is free.",
  alternates: { canonical: "/" },
};

const FAQ_ITEMS = [
  {
    q: "How do you find verified contacts from a LinkedIn URL?",
    a: "We cross-reference the LinkedIn profile against multiple proprietary data sources, professional registries, and real-time verification APIs. Every result is deliverability-tested before it reaches you — we never serve guessed or pattern-matched data.",
  },
  {
    q: "What counts as a 'verified' contact?",
    a: "For emails, we confirm deliverability via SMTP handshake before charging. For phone numbers, we validate against live carrier records. If our system can't verify a contact to our 97.2% accuracy standard, you are not charged — period.",
  },
  {
    q: "How long does a lookup actually take?",
    a: "Our median delivery time is 28 minutes. Simple profiles (public, well-indexed) often return in under 10 minutes. Complex or private profiles may take the full 30. You'll receive an email notification the moment your result is ready.",
  },
  {
    q: "Do I need a subscription or monthly commitment?",
    a: "No. StealthConnect AI is strictly pay-per-result. $0.20 per verified email, $1.00 per direct phone number. Credits you purchase never expire. You can buy 1 or 10,000 — there is no minimum, no plan, no contract.",
  },
  {
    q: "What's included in the free first lookup?",
    a: "When you create an account, we credit your wallet with 1 free lookup (email or phone — your choice). No credit card required to sign up. The free lookup is identical in quality to paid results — no watermarks, no partial data.",
  },
  {
    q: "Is this legal and GDPR / CCPA compliant?",
    a: "Yes. We only surface business contact information that professionals have made publicly available for professional contact purposes — consistent with GDPR's legitimate interest basis and CCPA B2B exemptions. We do not scrape private messages, connections lists, or any non-public LinkedIn data.",
  },
  {
    q: "What if you can't find a contact for a profile I submitted?",
    a: "If we can't return a verified result, you are not charged. Your credit is automatically refunded to your wallet within minutes. We'd rather lose the transaction than send you unverified data.",
  },
  {
    q: "Can I use StealthConnect AI at scale or in bulk?",
    a: "Absolutely. We support team accounts, shared credit wallets, and bulk CSV imports. For anyone needing 10,000+ contacts per month, contact us for custom volume pricing with dedicated SLA guarantees.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://www.stealthconnect.ai/#organization",
      name: "StealthConnect AI",
      url: "https://www.stealthconnect.ai",
      logo: {
        "@type": "ImageObject",
        url: "https://www.stealthconnect.ai/icon.svg",
      },
      contactPoint: {
        "@type": "ContactPoint",
        email: "support@stealthconnect.ai",
        contactType: "customer support",
      },
    },
    {
      "@type": "SoftwareApplication",
      "@id": "https://www.stealthconnect.ai/#product",
      name: "StealthConnect AI",
      applicationCategory: "BusinessApplication",
      description:
        "Find verified emails and direct phone numbers behind any LinkedIn profile in 30 minutes. Pay only per result — no subscription, no contracts.",
      url: "https://www.stealthconnect.ai",
      offers: [
        {
          "@type": "Offer",
          name: "Verified Email",
          price: "0.20",
          priceCurrency: "USD",
          description: "SMTP-verified business email matched to a LinkedIn profile.",
        },
        {
          "@type": "Offer",
          name: "Direct Mobile Phone",
          price: "1.00",
          priceCurrency: "USD",
          description: "Live carrier-validated direct mobile number matched to a LinkedIn profile.",
        },
      ],
    },
    {
      "@type": "FAQPage",
      mainEntity: FAQ_ITEMS.map(({ q, a }) => ({
        "@type": "Question",
        name: q,
        acceptedAnswer: { "@type": "Answer", text: a },
      })),
    },
  ],
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
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
    </>
  );
}
