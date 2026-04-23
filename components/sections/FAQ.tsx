"use client";

import { useState } from "react";
import { m } from "framer-motion";
import { Plus, Minus } from "lucide-react";
import { SectionBadge } from "@/components/ui/SectionBadge";
import { HeadingAccent } from "@/components/ui/HeadingAccent";

const FAQS = [
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

function FAQItem({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(false);

  return (
    <m.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      className="border-b"
      style={{ borderColor: "#e5e7eb" }}
    >
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-start justify-between gap-4 py-5 text-left"
        aria-expanded={open}
      >
        <span
          className="text-[17px] font-semibold leading-snug flex-1 transition-colors"
          style={{
            color: open ? "var(--c-heading)" : "var(--c-body)",
            fontFamily: "var(--font-montserrat, 'Montserrat', sans-serif)",
          }}
        >
          {q}
        </span>
        <span
          className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all mt-0.5"
          style={{
            background: open ? "#0038FF" : "var(--c-section-card-inner)",
            border: "1.5px solid",
            borderColor: open ? "#0038FF" : "var(--c-border-light)",
          }}
        >
          {open ? (
            <Minus className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
          ) : (
            <Plus className="w-3.5 h-3.5" style={{ color: "var(--c-heading)" }} strokeWidth={2.5} />
          )}
        </span>
      </button>

      {/* Answer always in DOM for SSR/SEO — collapsed via CSS transition */}
      <div
        style={{
          overflow: "hidden",
          maxHeight: open ? "600px" : "0",
          opacity: open ? 1 : 0,
          transition: "max-height 0.32s ease, opacity 0.22s ease",
        }}
      >
        <p
          className="pb-5 text-[16px] leading-relaxed"
          style={{
            color: "var(--c-body)",
            fontFamily: "var(--font-montserrat, 'Montserrat', sans-serif)",
            maxWidth: 620,
          }}
        >
          {a}
        </p>
      </div>
    </m.div>
  );
}

export default function FAQ() {
  return (
    <section
      id="faq"
      className="py-14 md:py-24"
      style={{ background: "var(--c-section-bg)" }}
    >
      <div className="max-w-3xl mx-auto px-5 md:px-8">
        {/* Header */}
        <m.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <SectionBadge variant="light" className="mb-5">FAQ</SectionBadge>
          <h2
            className="font-extrabold tracking-tight leading-[1.1] mb-4"
            style={{
              fontSize: "clamp(1.85rem, 3.5vw, 2.75rem)",
              color: "var(--c-heading)",
              fontFamily: "var(--font-montserrat, 'Montserrat', sans-serif)",
              fontWeight: 800,
            }}
          >
            Everything you need to <HeadingAccent>know.</HeadingAccent>
          </h2>
          <p
            className="leading-relaxed"
            style={{ fontSize: "clamp(16px,2.5vw,20px)", color: "var(--c-heading)", maxWidth: 480 }}
          >
            Still have questions? Reach out at{" "}
            <a
              href="mailto:support@stealthconnect.ai"
              className="font-semibold underline underline-offset-2"
              style={{ color: "#0038FF" }}
            >
              hello@stealthconnect.ai
            </a>
          </p>
        </m.div>

        {/* Accordion */}
        <div>
          {FAQS.map((item, i) => (
            <FAQItem key={i} q={item.q} a={item.a} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
