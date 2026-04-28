import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Zap, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "GDPR Compliance",
  description: "StealthConnect AI's GDPR approach — legal basis for processing, your data rights (access, erasure, portability), how to file a request, and our contact for privacy matters.",
  alternates: { canonical: "/gdpr" },
};

const rights = [
  { title: "Right of Access", body: "You can request a copy of all personal data we hold about you at any time." },
  { title: "Right to Rectification", body: "If any data we hold is inaccurate or incomplete, you have the right to have it corrected." },
  { title: "Right to Erasure", body: `You can request deletion of your personal data ("right to be forgotten"). We will comply within 30 days unless we have a legal obligation to retain it.` },
  { title: "Right to Restrict Processing", body: "You can ask us to stop processing your data in certain circumstances, for example while a complaint is under investigation." },
  { title: "Right to Data Portability", body: "You can request your data in a structured, machine-readable format to transfer to another service." },
  { title: "Right to Object", body: "You can object to processing of your personal data for direct marketing or where we rely on legitimate interests as a legal basis." },
  { title: "Right to Withdraw Consent", body: "Where processing is based on your consent, you may withdraw it at any time without affecting the lawfulness of prior processing." },
];

const faqs = [
  {
    q: "What is the legal basis for processing contact data?",
    a: "We rely on legitimate interests (Article 6(1)(f)) for B2B contact enrichment. All contacts retrieved are professionals acting in their business capacity, and the processing is proportionate to our users' outreach needs.",
  },
  {
    q: "Are you a data controller or data processor?",
    a: "StealthConnect AI acts as a data controller for account data (your profile, billing info). For contact lookup results, we act as a data processor on behalf of our users, who bear responsibility for compliant use.",
  },
  {
    q: "Do you transfer data outside the EEA?",
    a: "Our infrastructure uses Supabase (EU-hosted region available) and Vercel (edge CDN). Where data is transferred outside the EEA, we rely on Standard Contractual Clauses (SCCs) to ensure adequate protection.",
  },
  {
    q: "How do I submit a data request?",
    a: "Email support@stealthconnect.ai with your registered email address and the nature of your request. We will acknowledge within 72 hours and respond fully within 30 days.",
  },
];

export default function GdprPage() {
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
            GDPR <span style={{ color: "#0038FF" }}>Compliance</span>
          </h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", margin: 0 }}>Last updated: April 2026 · General Data Protection Regulation (EU) 2016/679</p>
        </div>

        {/* Intro */}
        <p style={{ fontSize: 15, color: "rgba(255,255,255,0.45)", lineHeight: 1.75, marginBottom: 40 }}>
          StealthConnect AI is committed to full compliance with the GDPR. This page outlines your rights as a data subject and explains how we handle personal data under EU law.
        </p>

        {/* Your Rights */}
        <h2 style={{ fontSize: 18, fontWeight: 800, color: "#fff", letterSpacing: "-0.02em", marginBottom: 16 }}>Your Rights Under GDPR</h2>
        <div className="flex flex-col gap-3 mb-12">
          {rights.map((r) => (
            <div key={r.title} className="flex items-start gap-4 p-4 rounded-2xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5" style={{ color: "#0038FF" }} />
              <div>
                <p style={{ fontSize: 14, fontWeight: 700, color: "#fff", margin: "0 0 4px" }}>{r.title}</p>
                <p style={{ fontSize: 13.5, color: "rgba(255,255,255,0.4)", lineHeight: 1.65, margin: 0 }}>{r.body}</p>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <h2 style={{ fontSize: 18, fontWeight: 800, color: "#fff", letterSpacing: "-0.02em", marginBottom: 16 }}>Frequently Asked Questions</h2>
        <div className="flex flex-col gap-5 mb-12">
          {faqs.map((f) => (
            <div key={f.q}>
              <p style={{ fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,0.85)", marginBottom: 6 }}>{f.q}</p>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", lineHeight: 1.7, margin: 0 }}>{f.a}</p>
            </div>
          ))}
        </div>

        {/* Contact DPO */}
        <div className="p-5 rounded-2xl mb-10" style={{ background: "rgba(0,56,255,0.06)", border: "1px solid rgba(0,56,255,0.18)" }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 6 }}>Data Protection Contact</p>
          <p style={{ fontSize: 13.5, color: "rgba(255,255,255,0.4)", lineHeight: 1.65, margin: 0 }}>
            To exercise your rights or submit a GDPR request, email{" "}
            <a href="mailto:support@stealthconnect.ai" style={{ color: "#5b8ff9" }}>support@stealthconnect.ai</a>.
            You also have the right to lodge a complaint with your local supervisory authority.
          </p>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.25)", margin: 0 }}>© 2026 StealthConnect AI. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/privacy" style={{ fontSize: 13, color: "rgba(0,100,255,0.7)", textDecoration: "none" }} className="hover:underline">Privacy</Link>
            <Link href="/terms" style={{ fontSize: 13, color: "rgba(0,100,255,0.7)", textDecoration: "none" }} className="hover:underline">Terms</Link>
            <Link href="/contact" style={{ fontSize: 13, color: "rgba(0,100,255,0.7)", textDecoration: "none" }} className="hover:underline">Contact</Link>
          </div>
        </div>

      </div>
    </div>
  );
}
