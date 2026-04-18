"use client";

import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { AuthRightPanel } from "@/components/ui/AuthRightPanel";

const FONT_DISPLAY = "var(--font-montserrat, 'Montserrat', sans-serif)";
const FONT_BODY    = "var(--font-montserrat, 'Montserrat', sans-serif)";

// ── Icons ──────────────────────────────────────────────────────────────────

const GoogleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" viewBox="0 0 48 48">
    <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-2.641-.21-5.236-.611-7.743z" />
    <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
    <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
    <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C42.022 35.026 44 30.038 44 24c0-2.641-.21-5.236-.611-7.743z" />
  </svg>
);

// ── Types ──────────────────────────────────────────────────────────────────

export interface Testimonial {
  avatarSrc: string;
  name: string;
  handle: string;
  text: string;
}

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

// ── Sub-components ─────────────────────────────────────────────────────────

const GlassInput = ({ children }: { children: React.ReactNode }) => (
  <div className="signin-glass-input">
    {children}
  </div>
);

const TestimonialCard = ({
  testimonial,
  animClass,
}: {
  testimonial: Testimonial;
  animClass: string;
}) => (
  <div
    className={`${animClass} flex items-start gap-3 rounded-2xl backdrop-blur-xl border border-white/10 p-4 w-60 sm:w-64`}
    style={{ background: "rgba(15,18,30,0.55)", fontFamily: FONT_BODY }}
  >
    <img
      src={testimonial.avatarSrc}
      className="h-10 w-10 object-cover rounded-xl shrink-0"
      alt={testimonial.name}
    />
    <div className="text-sm leading-snug min-w-0">
      <p className="font-semibold text-white truncate" style={{ fontFamily: FONT_DISPLAY }}>{testimonial.name}</p>
      <p className="text-white/40 text-xs">{testimonial.handle}</p>
      <p className="mt-1.5 text-white/70 text-xs leading-relaxed">{testimonial.text}</p>
    </div>
  </div>
);

// ── Main component ─────────────────────────────────────────────────────────

export const SignInPage: React.FC<SignInPageProps> = ({
  title = (
    <span style={{ fontFamily: FONT_DISPLAY }} className="font-bold tracking-tight">Welcome back</span>
  ),
  description = "Sign in to StealthConnect AI and continue finding leads",
  heroImageSrc,
  testimonials = [],
  onSignIn,
  onGoogleSignIn,
  onResetPassword,
  onCreateAccount,
  loading = false,
  oauthLoading = false,
  error,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isDisabled = loading || oauthLoading;

  return (
    <div
      className="h-[100dvh] w-[100dvw] flex flex-col md:flex-row overflow-hidden"
      style={{ background: "#000000", fontFamily: FONT_BODY }}
    >

      {/* ── Left: Form ───────────────────────────────────────────────────── */}
      <section className="flex-1 flex items-center justify-center p-6 md:p-10 relative">
        {/* ambient glow */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden>
          <div
            className="w-[480px] h-[480px] rounded-full blur-[120px]"
            style={{ background: "rgba(37,99,235,0.08)" }}
          />
        </div>

        <div className="w-full max-w-md relative z-10 flex flex-col gap-6">

          {/* Logo / wordmark */}
          <div className="signin-el signin-delay-0">
            <span
              className="text-lg font-bold gradient-text"
              style={{ fontFamily: FONT_DISPLAY }}
            >
              StealthConnect AI
            </span>
          </div>

          {/* Heading */}
          <div className="signin-el signin-delay-1">
            <h1
              className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight text-white"
              style={{ fontFamily: FONT_DISPLAY }}
            >
              {title}
            </h1>
            <p className="mt-2 text-white/40 text-sm" style={{ fontFamily: FONT_BODY }}>
              {description}
            </p>
          </div>

          {/* Form */}
          <form className="flex flex-col gap-5" onSubmit={onSignIn}>

            {/* Email */}
            <div className="signin-el signin-delay-2 flex flex-col gap-1.5">
              <label htmlFor="signin-email" className="text-sm font-medium text-white/50" style={{ fontFamily: FONT_BODY }}>
                Email Address
              </label>
              <GlassInput>
                <input
                  id="signin-email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                  className="w-full bg-transparent text-sm p-4 rounded-2xl focus:outline-none text-white placeholder:text-white/20"
                  style={{ fontFamily: FONT_BODY }}
                />
              </GlassInput>
            </div>

            {/* Password */}
            <div className="signin-el signin-delay-3 flex flex-col gap-1.5">
              <label htmlFor="signin-password" className="text-sm font-medium text-white/50" style={{ fontFamily: FONT_BODY }}>
                Password
              </label>
              <GlassInput>
                <div className="relative">
                  <input
                    id="signin-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    required
                    className="w-full bg-transparent text-sm p-4 pr-12 rounded-2xl focus:outline-none text-white placeholder:text-white/20"
                    style={{ fontFamily: FONT_BODY }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute inset-y-0 right-3 flex items-center text-white/30 hover:text-white/70 transition-colors"
                  >
                    {showPassword
                      ? <EyeOff className="w-4 h-4" />
                      : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </GlassInput>
            </div>

            {/* Remember + reset */}
            <div className="signin-el signin-delay-4 flex items-center justify-between text-sm">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  name="rememberMe"
                  className="w-4 h-4 rounded accent-blue-500"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.2)" }}
                />
                <span className="text-white/60" style={{ fontFamily: FONT_BODY }}>Keep me signed in</span>
              </label>
              <button
                type="button"
                onClick={onResetPassword}
                className="transition-colors"
                style={{ color: "var(--brand-mid)", fontFamily: FONT_BODY }}
              >
                Reset password
              </button>
            </div>

            {/* Error */}
            {error && (
              <p role="alert" className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 px-3 py-2.5 rounded-xl" style={{ fontFamily: FONT_BODY }}>
                {error}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isDisabled}
              className="signin-el signin-delay-5 w-full rounded-2xl py-4 text-sm font-semibold text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
              style={{ background: "var(--brand)", fontFamily: FONT_BODY }}
              onMouseEnter={e => (e.currentTarget.style.background = "var(--brand-dark)")}
              onMouseLeave={e => (e.currentTarget.style.background = "var(--brand)")}
            >
              {loading
                ? <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in…
                  </span>
                : "Sign In"}
            </button>
          </form>

          {/* Divider */}
          <div className="signin-el signin-delay-6 relative flex items-center">
            <span className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.08)" }} />
            <span className="px-4 text-xs text-white/25 uppercase tracking-widest" style={{ fontFamily: FONT_BODY }}>
              Or continue with
            </span>
            <span className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.08)" }} />
          </div>

          {/* Google */}
          <button
            type="button"
            onClick={onGoogleSignIn}
            disabled={isDisabled}
            aria-label="Continue with Google"
            className="signin-el signin-delay-7 w-full flex items-center justify-center gap-3 glass rounded-2xl py-4 text-sm font-medium text-white hover:bg-white/10 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ fontFamily: FONT_BODY }}
          >
            {oauthLoading
              ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <GoogleIcon />}
            Continue with Google
          </button>

          {/* Switch to signup */}
          <p className="signin-el signin-delay-8 text-center text-sm text-white/30" style={{ fontFamily: FONT_BODY }}>
            New here?{" "}
            <button
              type="button"
              onClick={onCreateAccount}
              className="font-medium transition-colors"
              style={{ color: "var(--brand-mid)" }}
            >
              Create Account
            </button>
          </p>

        </div>
      </section>

      {/* ── Right: Animated product panel ───────────────────────────────── */}
      <div className="hidden md:block flex-1">
        <AuthRightPanel />
      </div>
    </div>
  );
};
