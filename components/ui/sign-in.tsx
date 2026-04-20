"use client";

import React, { useState } from "react";
import { Eye, EyeOff, Zap } from "lucide-react";
import { AuthRightPanel } from "@/components/ui/AuthRightPanel";

const F = "var(--font-montserrat,'Montserrat',sans-serif)";

const GoogleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" viewBox="0 0 48 48">
    <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-2.641-.21-5.236-.611-7.743z" />
    <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
    <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
    <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C42.022 35.026 44 30.038 44 24c0-2.641-.21-5.236-.611-7.743z" />
  </svg>
);

export interface Testimonial { avatarSrc: string; name: string; handle: string; text: string; }

export interface SignInPageProps {
  title?: React.ReactNode;
  description?: React.ReactNode;
  heroImageSrc?: string;
  testimonials?: Testimonial[];
  onSignIn?: (event: React.FormEvent<HTMLFormElement>) => void;
  onGoogleSignIn?: () => void;
  onResetPassword?: () => void;
  onCreateAccount?: () => void;
  loading?: boolean;
  oauthLoading?: boolean;
  error?: string | null;
}

export const SignInPage: React.FC<SignInPageProps> = ({
  onSignIn, onGoogleSignIn, onResetPassword, onCreateAccount,
  loading = false, oauthLoading = false, error,
}) => {
  const [showPw, setShowPw] = useState(false);
  const disabled = loading || oauthLoading;

  const inputCls = "w-full text-[15px] py-3.5 px-4 rounded-2xl focus:outline-none text-white placeholder:text-white/25 transition-all duration-150";
  const inputStyle: React.CSSProperties = {
    fontFamily: F,
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.09)",
    caretColor: "var(--brand)",
    minHeight: 52,
  };
  const onFocus = (e: React.FocusEvent<HTMLInputElement>) =>
    (e.currentTarget.style.borderColor = "rgba(0,56,255,0.55)");
  const onBlur = (e: React.FocusEvent<HTMLInputElement>) =>
    (e.currentTarget.style.borderColor = "rgba(255,255,255,0.09)");

  return (
    <div
      className="min-h-[100dvh] w-full flex flex-col md:flex-row md:h-[100dvh] md:overflow-hidden"
      style={{ background: "#000", fontFamily: F }}
    >
      {/* ── LEFT ── */}
      <section className="flex-1 flex flex-col justify-center md:overflow-y-auto relative">

        {/* Subtle radial glow */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
          <div style={{
            position: "absolute", top: "15%", left: "50%", transform: "translateX(-50%)",
            width: 560, height: 560, borderRadius: "50%",
            background: "radial-gradient(circle,rgba(0,56,255,0.09) 0%,transparent 70%)",
          }} />
        </div>

        {/* Scrollable content */}
        <div className="relative z-10 w-full flex justify-center px-5 sm:px-8 md:px-12 py-10 md:py-14">
          <div className="w-full max-w-[400px] flex flex-col gap-6">

            {/* Logo */}
            <div className="animate-element animate-delay-100 flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                style={{ background: "var(--brand)", boxShadow: "0 0 20px rgba(0,56,255,0.6)" }}
              >
                <Zap className="w-4 h-4 text-white" strokeWidth={2.5} />
              </div>
              <span style={{ fontFamily: F, fontSize: 13, fontWeight: 800, color: "rgba(255,255,255,0.55)", letterSpacing: "-0.01em" }}>
                StealthConnect AI
              </span>
            </div>

            {/* Hero heading */}
            <div className="animate-element animate-delay-200">
              <h1 style={{
                fontFamily: F,
                fontSize: "clamp(2.6rem,8vw,3.8rem)",
                fontWeight: 300,
                lineHeight: 1.05,
                letterSpacing: "-0.04em",
                color: "rgba(255,255,255,0.9)",
                margin: 0,
              }}>
                Welcome<br />
                <span style={{ fontWeight: 900, color: "#fff" }}>back.</span>
              </h1>
              <p style={{ fontFamily: F, fontSize: 14, color: "rgba(255,255,255,0.35)", marginTop: 10, lineHeight: 1.6 }}>
                Sign in to find your next verified contact.
              </p>
            </div>

            {/* Google */}
            <button
              type="button"
              onClick={onGoogleSignIn}
              disabled={disabled}
              className="animate-element animate-delay-300 w-full flex items-center justify-center gap-2.5 rounded-2xl text-[15px] font-medium text-white transition-all duration-150 disabled:opacity-50 active:scale-[0.98]"
              style={{
                border: "1px solid rgba(255,255,255,0.1)",
                background: "rgba(255,255,255,0.04)",
                fontFamily: F,
                minHeight: 52,
                padding: "0 20px",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.08)")}
              onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}
            >
              {oauthLoading
                ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <GoogleIcon />}
              Continue with Google
            </button>

            {/* Divider */}
            <div className="animate-element animate-delay-400 flex items-center gap-3">
              <span className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.07)" }} />
              <span style={{ fontFamily: F, fontSize: 10, color: "rgba(255,255,255,0.22)", textTransform: "uppercase", letterSpacing: "0.14em" }}>or</span>
              <span className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.07)" }} />
            </div>

            {/* Form */}
            <form className="flex flex-col gap-4" onSubmit={onSignIn}>

              {/* Email */}
              <div className="animate-element animate-delay-400 flex flex-col gap-1.5">
                <label style={{ fontFamily: F, fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.12em" }}>
                  Email
                </label>
                <input
                  name="email" type="email" placeholder="you@example.com"
                  autoComplete="email" required
                  className={inputCls} style={inputStyle}
                  onFocus={onFocus} onBlur={onBlur}
                />
              </div>

              {/* Password */}
              <div className="animate-element animate-delay-500 flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label style={{ fontFamily: F, fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.12em" }}>
                    Password
                  </label>
                  <button
                    type="button" onClick={onResetPassword}
                    style={{ fontFamily: F, fontSize: 12, color: "rgba(80,120,255,0.9)" }}
                    className="hover:underline transition-colors"
                  >
                    Forgot?
                  </button>
                </div>
                <div className="relative">
                  <input
                    name="password" type={showPw ? "text" : "password"} placeholder="••••••••"
                    autoComplete="current-password" required
                    className={`${inputCls} pr-12`} style={inputStyle}
                    onFocus={onFocus} onBlur={onBlur}
                  />
                  <button
                    type="button" onClick={() => setShowPw(v => !v)}
                    className="absolute inset-y-0 right-4 flex items-center transition-colors"
                    style={{ color: "rgba(255,255,255,0.25)" }}
                    onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.65)")}
                    onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.25)")}
                  >
                    {showPw ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
                  </button>
                </div>
              </div>

              {error && (
                <p role="alert" className="text-sm px-4 py-3 rounded-xl"
                  style={{ background: "rgba(239,68,68,0.07)", color: "#f87171", border: "1px solid rgba(239,68,68,0.15)", fontFamily: F }}>
                  {error}
                </p>
              )}

              <button
                type="submit" disabled={disabled}
                className="animate-element animate-delay-600 w-full rounded-2xl text-[15px] font-bold text-white transition-all duration-150 disabled:opacity-50 active:scale-[0.98]"
                style={{
                  background: "var(--brand)",
                  fontFamily: F,
                  boxShadow: "0 4px 24px rgba(0,56,255,0.35)",
                  minHeight: 52,
                }}
                onMouseEnter={e => !disabled && (e.currentTarget.style.boxShadow = "0 6px 32px rgba(0,56,255,0.55)")}
                onMouseLeave={e => (e.currentTarget.style.boxShadow = "0 4px 24px rgba(0,56,255,0.35)")}
              >
                {loading
                  ? <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Signing in…
                    </span>
                  : "Sign In →"}
              </button>
            </form>

            <p className="animate-element animate-delay-700 text-center" style={{ fontSize: 13, color: "rgba(255,255,255,0.28)", fontFamily: F }}>
              Don't have an account?{" "}
              <button
                type="button" onClick={onCreateAccount}
                className="font-semibold transition-colors hover:underline"
                style={{ color: "rgba(80,130,255,0.9)" }}
              >
                Sign up free
              </button>
            </p>

          </div>
        </div>
      </section>

      {/* ── RIGHT ── */}
      <div className="hidden md:flex flex-1 min-h-0 h-[100dvh]">
        <AuthRightPanel />
      </div>
    </div>
  );
};
