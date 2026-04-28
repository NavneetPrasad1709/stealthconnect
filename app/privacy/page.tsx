import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Zap } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Read StealthConnect AI's Privacy Policy — what data we collect, how we use it, your rights under GDPR and CCPA, and how to contact us about your data.",
  alternates: { canonical: "/privacy" },
};

const sections = [
  {
    title: "1. Information We Collect",
    body: `We collect information you provide directly (name, email, password, LinkedIn URL), information generated through your use of the service (lookup history, credits used, order data), and standard technical data (IP address, browser type, usage analytics).`,
  },
  {
    title: "2. How We Use Your Information",
    body: `We use your data to provide and improve the StealthConnect AI service, process payments, send transactional emails (confirmations, credit alerts), and detect fraud or abuse. We do not sell your personal data to third parties.`,
  },
  {
    title: "3. Data Storage & Security",
    body: `All data is stored on Supabase (PostgreSQL) with encryption at rest and in transit. Passwords are hashed and never stored in plaintext. We use industry-standard security practices to protect your information.`,
  },
  {
    title: "4. Contact Data Processing",
    body: `Contact information retrieved through lookups is sourced from publicly available professional directories. We verify this data but do not guarantee accuracy. You are responsible for using retrieved contacts in compliance with applicable laws (CAN-SPAM, GDPR, etc.).`,
  },
  {
    title: "5. Cookies",
    body: `We use essential session cookies required for authentication and service operation. We do not use advertising or tracking cookies. Analytics (Vercel Analytics) collects anonymised, aggregate usage data.`,
  },
  {
    title: "6. Data Retention",
    body: `Account data is retained for the duration of your account. You may request deletion at any time by emailing support@stealthconnect.ai. Order records may be retained for up to 7 years for legal and accounting purposes.`,
  },
  {
    title: "7. Your Rights",
    body: `Depending on your jurisdiction, you may have rights to access, correct, delete, or port your personal data. To exercise any of these rights, contact us at support@stealthconnect.ai and we will respond within 30 days.`,
  },
  {
    title: "8. Changes to This Policy",
    body: `We may update this policy periodically. Material changes will be communicated via email or an in-app notice. Continued use of the service after changes constitutes acceptance.`,
  },
  {
    title: "9. Contact",
    body: `Questions about this policy? Email us at support@stealthconnect.ai.`,
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-[100dvh]" style={{ background: "#000", fontFamily: "var(--font-montserrat,'Montserrat',sans-serif)", color: "#fff" }}>

      <div className="w-full h-[3px]" style={{ background: "linear-gradient(90deg,#0038FF 0%,#CCFF00 50%,#0038FF 100%)" }} />

      <div className="max-w-[720px] mx-auto px-5 py-14 md:py-20">

        <Link href="/" className="inline-flex items-center gap-2 mb-10 text-sm font-medium hover:underline" style={{ color: "rgba(255,255,255,0.35)", textDecoration: "none" }}>
          <ArrowLeft className="w-4 h-4" /> Back to home
        </Link>

        <div className="flex items-center gap-2 mb-10">
          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "#0038FF", boxShadow: "0 0 20px rgba(0,56,255,0.5)" }}>
            <Zap className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
          <span style={{ fontSize: 13, fontWeight: 800, color: "rgba(255,255,255,0.5)", letterSpacing: "-0.01em" }}>StealthConnect AI</span>
        </div>

        <div className="mb-10" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)", paddingBottom: 32 }}>
          <h1 style={{ fontSize: "clamp(2rem,5vw,2.8rem)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1.05, margin: "0 0 12px" }}>
            Privacy <span style={{ color: "#0038FF" }}>Policy</span>
          </h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", margin: 0 }}>Last updated: April 2026 · Applies to stealthconnect.ai</p>
        </div>

        <div className="flex flex-col gap-8">
          {sections.map((s) => (
            <div key={s.title}>
              <h2 style={{ fontSize: 16, fontWeight: 800, color: "#fff", letterSpacing: "-0.02em", marginBottom: 8 }}>{s.title}</h2>
              <p style={{ fontSize: 15, color: "rgba(255,255,255,0.45)", lineHeight: 1.75, margin: 0 }}>{s.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-14 pt-8 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.25)", margin: 0 }}>© 2026 StealthConnect AI. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/terms" style={{ fontSize: 13, color: "rgba(0,100,255,0.7)", textDecoration: "none" }} className="hover:underline">Terms</Link>
            <Link href="/gdpr" style={{ fontSize: 13, color: "rgba(0,100,255,0.7)", textDecoration: "none" }} className="hover:underline">GDPR</Link>
            <Link href="/contact" style={{ fontSize: 13, color: "rgba(0,100,255,0.7)", textDecoration: "none" }} className="hover:underline">Contact</Link>
          </div>
        </div>

      </div>
    </div>
  );
}
