"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Zap, ArrowLeft, CheckCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const F = "var(--font-montserrat,'Montserrat',sans-serif)";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/auth/callback?next=/dashboard/account`,
      });
      if (error) {
        setError(error.message);
      } else {
        setSent(true);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-[100dvh] w-full flex items-center justify-center px-5"
      style={{ background: "#000", fontFamily: F }}
    >
      {/* Glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
        <div style={{
          position: "absolute", top: "20%", left: "50%", transform: "translateX(-50%)",
          width: 500, height: 500, borderRadius: "50%",
          background: "radial-gradient(circle,rgba(0,56,255,0.08) 0%,transparent 70%)",
        }} />
      </div>

      <div className="w-full max-w-[400px] relative z-10 flex flex-col gap-6">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 w-fit" style={{ textDecoration: "none" }}>
          <div className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: "var(--brand)", boxShadow: "0 0 20px rgba(0,56,255,0.6)" }}>
            <Zap className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
          <span style={{ fontFamily: F, fontSize: 13, fontWeight: 800, color: "rgba(255,255,255,0.55)", letterSpacing: "-0.01em" }}>
            StealthConnect AI
          </span>
        </Link>

        {sent ? (
          /* ── Success state ── */
          <div className="flex flex-col items-center text-center gap-5 py-4">
            <div className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.25)" }}>
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
            <div>
              <h2 style={{ fontFamily: F, fontSize: "1.6rem", fontWeight: 900, color: "#fff", letterSpacing: "-0.03em", margin: 0 }}>
                Check your email
              </h2>
              <p style={{ fontFamily: F, fontSize: 14, color: "rgba(255,255,255,0.38)", marginTop: 10, lineHeight: 1.65 }}>
                We sent a reset link to{" "}
                <span style={{ color: "rgba(255,255,255,0.75)", fontWeight: 600 }}>{email}</span>.
                Click it to set a new password.
              </p>
            </div>
            <Link
              href="/login"
              className="flex items-center gap-2 text-sm font-semibold transition-colors hover:underline"
              style={{ color: "rgba(80,130,255,0.9)", textDecoration: "none" }}
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Sign In
            </Link>
          </div>
        ) : (
          /* ── Form state ── */
          <>
            <div>
              <h1 style={{ fontFamily: F, fontSize: "clamp(2rem,7vw,2.8rem)", fontWeight: 300, lineHeight: 1.08, letterSpacing: "-0.04em", color: "rgba(255,255,255,0.9)", margin: 0 }}>
                Reset your<br />
                <span style={{ fontWeight: 900, color: "#fff" }}>password.</span>
              </h1>
              <p style={{ fontFamily: F, fontSize: 14, color: "rgba(255,255,255,0.35)", marginTop: 10, lineHeight: 1.6 }}>
                Enter your email and we'll send you a reset link.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label style={{ fontFamily: F, fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.12em" }}>
                  Email
                </label>
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com" required autoComplete="email"
                  className="w-full text-[15px] py-3.5 px-4 rounded-2xl focus:outline-none text-white placeholder:text-white/25 transition-all duration-150"
                  style={{ fontFamily: F, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", caretColor: "var(--brand)", minHeight: 52 }}
                  onFocus={e => (e.currentTarget.style.borderColor = "rgba(0,56,255,0.55)")}
                  onBlur={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.09)")}
                />
              </div>

              {error && (
                <p role="alert" className="text-sm px-4 py-3 rounded-xl"
                  style={{ background: "rgba(239,68,68,0.07)", color: "#f87171", border: "1px solid rgba(239,68,68,0.15)", fontFamily: F }}>
                  {error}
                </p>
              )}

              <button
                type="submit" disabled={loading}
                className="w-full rounded-2xl text-[15px] font-bold text-white transition-all duration-150 disabled:opacity-50 active:scale-[0.98]"
                style={{ background: "var(--brand)", fontFamily: F, boxShadow: "0 4px 24px rgba(0,56,255,0.35)", minHeight: 52 }}
                onMouseEnter={e => !loading && (e.currentTarget.style.boxShadow = "0 6px 32px rgba(0,56,255,0.55)")}
                onMouseLeave={e => (e.currentTarget.style.boxShadow = "0 4px 24px rgba(0,56,255,0.35)")}
              >
                {loading
                  ? <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Sending…
                    </span>
                  : "Send Reset Link →"}
              </button>
            </form>

            <Link
              href="/login"
              className="flex items-center justify-center gap-1.5 text-sm font-medium transition-colors hover:underline"
              style={{ color: "rgba(255,255,255,0.3)", textDecoration: "none" }}
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Sign In
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
