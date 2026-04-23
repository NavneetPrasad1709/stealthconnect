import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Mail, MessageSquare, Zap } from "lucide-react";
import { ContactForm } from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Contact StealthConnect AI — reach our support team at support@stealthconnect.ai, or enquire about enterprise pricing and partnerships.",
  alternates: { canonical: "/contact" },
};

const F = "var(--font-montserrat,'Montserrat',sans-serif)";

export default function ContactPage() {
  return (
    <div className="min-h-[100dvh]" style={{ background: "#000", fontFamily: F, color: "#fff" }}>

      <style>{`
        .contact-card {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          text-decoration: none;
          transition: border-color 0.2s ease;
        }
        .contact-card:hover { border-color: rgba(0,56,255,0.45); }
      `}</style>

      {/* Top accent */}
      <div className="w-full h-[3px]" style={{ background: "linear-gradient(90deg,#0038FF 0%,#CCFF00 50%,#0038FF 100%)" }} />

      {/* Glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
        <div style={{ position: "absolute", top: "10%", left: "50%", transform: "translateX(-50%)", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle,rgba(0,56,255,0.07) 0%,transparent 70%)" }} />
      </div>

      <div className="relative z-10 max-w-[640px] mx-auto px-5 py-14 md:py-20">

        {/* Back */}
        <Link href="/" className="inline-flex items-center gap-2 mb-10 text-sm font-medium transition-colors hover:underline" style={{ color: "rgba(255,255,255,0.35)", textDecoration: "none" }}>
          <ArrowLeft className="w-4 h-4" /> Back to home
        </Link>

        {/* Logo */}
        <div className="flex items-center gap-2 mb-10">
          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "#0038FF", boxShadow: "0 0 20px rgba(0,56,255,0.5)" }}>
            <Zap className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
          <span style={{ fontSize: 13, fontWeight: 800, color: "rgba(255,255,255,0.5)", letterSpacing: "-0.01em" }}>StealthConnect AI</span>
        </div>

        {/* Heading */}
        <h1 style={{ fontSize: "clamp(2.2rem,6vw,3.2rem)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1.05, margin: "0 0 12px" }}>
          Contact <span style={{ color: "#0038FF" }}>Us</span>
        </h1>
        <p style={{ fontSize: 16, color: "rgba(255,255,255,0.4)", lineHeight: 1.7, marginBottom: 40 }}>
          Have a question, partnership inquiry, or need enterprise pricing? We'd love to hear from you.
        </p>

        {/* Contact cards */}
        <div className="flex flex-col gap-4 mb-12">
          <a href="mailto:support@stealthconnect.ai" className="contact-card flex items-center gap-4 p-5 rounded-2xl">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(0,56,255,0.12)", border: "1px solid rgba(0,56,255,0.2)" }}>
              <Mail className="w-5 h-5" style={{ color: "#0038FF" }} />
            </div>
            <div>
              <p style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.1em", margin: 0 }}>Email Support</p>
              <p style={{ fontSize: 15, fontWeight: 600, color: "#fff", margin: "2px 0 0" }}>support@stealthconnect.ai</p>
            </div>
          </a>

          <a href="mailto:sales@stealthconnect.ai" className="contact-card flex items-center gap-4 p-5 rounded-2xl">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(0,56,255,0.12)", border: "1px solid rgba(0,56,255,0.2)" }}>
              <MessageSquare className="w-5 h-5" style={{ color: "#0038FF" }} />
            </div>
            <div>
              <p style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.1em", margin: 0 }}>Enterprise & Sales</p>
              <p style={{ fontSize: 15, fontWeight: 600, color: "#fff", margin: "2px 0 0" }}>sales@stealthconnect.ai</p>
            </div>
          </a>
        </div>

        {/* Divider */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", margin: "8px 0 28px" }} />

        {/* Contact form */}
        <h2 style={{ fontSize: 18, fontWeight: 800, color: "#fff", letterSpacing: "-0.02em", margin: "0 0 16px", fontFamily: F }}>
          Send us a message
        </h2>
        <ContactForm />

        {/* Notice */}
        <div className="p-5 rounded-2xl mt-6" style={{ background: "rgba(204,255,0,0.05)", border: "1px solid rgba(204,255,0,0.15)" }}>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", lineHeight: 1.7, margin: 0 }}>
            <span style={{ color: "#CCFF00", fontWeight: 700 }}>Response time:</span> We typically respond within 24 hours on business days. For urgent issues, email support directly.
          </p>
        </div>

      </div>
    </div>
  );
}
