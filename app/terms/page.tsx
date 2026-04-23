import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Zap } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "StealthConnect AI Terms of Service — acceptable use, credits and billing, data accuracy, governing law, and your rights as a user of our B2B contact enrichment platform.",
  alternates: { canonical: "/terms" },
};

const sections = [
  {
    title: "1. Acceptance of Terms",
    body: `By creating an account or using StealthConnect AI, you agree to these Terms of Service. If you do not agree, do not use the service. These terms apply to all users including free-tier and paid users.`,
  },
  {
    title: "2. Service Description",
    body: `StealthConnect AI provides a contact enrichment service that retrieves verified email addresses and phone numbers associated with LinkedIn profiles. Results are provided on a pay-per-result basis — you are only charged for successfully verified contacts.`,
  },
  {
    title: "3. Credits & Billing",
    body: `Credits are purchased in advance and deducted upon successful contact delivery. Credits do not expire. Failed lookups are not charged. All prices are in USD. Refunds are issued only for verified service failures, not for contacts you choose not to use.`,
  },
  {
    title: "4. Acceptable Use",
    body: `You may use StealthConnect AI only for lawful B2B outreach and sales prospecting. You may not use the service to spam, harass, or contact individuals in violation of CAN-SPAM, GDPR, CASL, or other applicable laws. Automated bulk scraping of results is prohibited. Reselling or redistributing retrieved contact data is prohibited without written permission.`,
  },
  {
    title: "5. Account Security",
    body: `You are responsible for maintaining the security of your account credentials. StealthConnect AI is not liable for losses resulting from unauthorised access to your account. Notify us immediately at support@stealthconnect.ai if you suspect a breach.`,
  },
  {
    title: "6. Data Accuracy",
    body: `We verify contacts through multiple sources and carrier/SMTP checks, but we do not guarantee 100% accuracy or deliverability. Contacts are provided on an "as-is" basis. Credits are only charged for contacts that pass our verification pipeline.`,
  },
  {
    title: "7. Intellectual Property",
    body: `StealthConnect AI and its technology are proprietary. You receive a limited, non-exclusive, non-transferable licence to use the service as described here. You may not reverse-engineer, copy, or create derivative works based on the platform.`,
  },
  {
    title: "8. Termination",
    body: `We reserve the right to suspend or terminate accounts that violate these terms, engage in abusive behaviour, or pose a legal risk. Unused credits at the time of termination for cause are forfeited. Terminations for our convenience will result in a full credit refund.`,
  },
  {
    title: "9. Limitation of Liability",
    body: `To the maximum extent permitted by law, StealthConnect AI is not liable for indirect, incidental, or consequential damages arising from use of the service. Our total liability shall not exceed the amount you paid in the 90 days preceding the claim.`,
  },
  {
    title: "10. Governing Law",
    body: `These terms are governed by the laws of [JURISDICTION — to be confirmed by counsel, e.g. "the State of Delaware, United States"]. Any dispute arising under these terms shall be resolved through binding arbitration seated in [ARBITRATION SEAT], administered under the rules of [ARBITRAL BODY], unless prohibited by applicable law. Nothing herein prevents either party from seeking injunctive relief in a court of competent jurisdiction.`,
  },
  {
    title: "11. Changes",
    body: `We may update these terms at any time. Material changes will be communicated via email. Continued use of the service after notice constitutes acceptance of the updated terms.`,
  },
];

export default function TermsPage() {
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
            Terms of <span style={{ color: "#0038FF" }}>Service</span>
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
            <Link href="/privacy" style={{ fontSize: 13, color: "rgba(0,100,255,0.7)", textDecoration: "none" }} className="hover:underline">Privacy</Link>
            <Link href="/gdpr" style={{ fontSize: 13, color: "rgba(0,100,255,0.7)", textDecoration: "none" }} className="hover:underline">GDPR</Link>
            <Link href="/contact" style={{ fontSize: 13, color: "rgba(0,100,255,0.7)", textDecoration: "none" }} className="hover:underline">Contact</Link>
          </div>
        </div>

      </div>
    </div>
  );
}
