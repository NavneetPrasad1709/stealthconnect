"use client";

import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { AuthRightPanel } from "@/components/ui/AuthRightPanel";

const F = "var(--font-montserrat,'Montserrat',sans-serif)";

const GoogleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" viewBox="0 0 48 48">
    <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-2.641-.21-5.236-.611-7.743z" />
    <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
    <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
    <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C42.022 35.026 44 30.038 44 24c0-2.641-.21-5.236-.611-7.743z" />
  </svg>
);

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

const GlassInput = ({ children }: { children: React.ReactNode }) => (
  <div
    className="rounded-2xl transition-colors focus-within:ring-1"
    style={{
      border: "1px solid rgba(255,255,255,0.1)",
      background: "rgba(255,255,255,0.04)",
      backdropFilter: "blur(8px)",
    }}
    onFocusCapture={e => (e.currentTarget.style.borderColor = "rgba(0,56,255,0.5)")}
    onBlurCapture={e  => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
  >
    {children}
  </div>
);

export const SignInPage: React.FC<SignInPageProps> = ({
  title,
  description = "Sign in to StealthConnect AI and continue finding leads",
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
      style={{ background: "#000000", fontFamily: F }}
    >
      {/* ── LEFT: Form ── */}
      <section className="flex-1 flex items-center justify-center p-6 sm:p-10 relative overflow-y-auto">
        {/* ambient glow */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden>
          <div className="w-[500px] h-[500px] rounded-full blur-[130px]"
            style={{ background: "rgba(0,56,255,0.07)" }} />
        </div>

        <div className="w-full max-w-md relative z-10 flex flex-col gap-5 py-6">

          {/* Logo */}
          <div className="animate-element animate-delay-100">
            <span className="text-base font-black tracking-tight" style={{ fontFamily: F, color: "rgba(255,255,255,0.9)" }}>
              Stealth<span style={{ color: "rgba(255,255,255,0.28)" }}>Connect AI</span>
            </span>
          </div>

          {/* Heading */}
          <div className="animate-element animate-delay-200">
            <h1 className="text-4xl sm:text-5xl font-light leading-tight tracking-tight text-white" style={{ fontFamily: F }}>
              {title ?? <span>Welcome<br/><span className="font-black" style={{ color:"var(--brand)" }}>back.</span></span>}
            </h1>
            <p className="mt-2 text-sm" style={{ color: "rgba(255,255,255,0.38)", fontFamily: F }}>
              {description}
            </p>
          </div>

          {/* Form */}
          <form className="flex flex-col gap-4" onSubmit={onSignIn}>
            <div className="animate-element animate-delay-300 flex flex-col gap-1.5">
              <label className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.45)", fontFamily: F }}>
                Email Address
              </label>
              <GlassInput>
                <input
                  name="email" type="email"
                  placeholder="you@example.com"
                  autoComplete="email" required
                  className="w-full bg-transparent text-sm p-4 rounded-2xl focus:outline-none text-white placeholder:text-white/20"
                  style={{ fontFamily: F }}
                />
              </GlassInput>
            </div>

            <div className="animate-element animate-delay-400 flex flex-col gap-1.5">
              <label className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.45)", fontFamily: F }}>
                Password
              </label>
              <GlassInput>
                <div className="relative">
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    autoComplete="current-password" required
                    className="w-full bg-transparent text-sm p-4 pr-12 rounded-2xl focus:outline-none text-white placeholder:text-white/20"
                    style={{ fontFamily: F }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute inset-y-0 right-3 flex items-center transition-colors"
                    style={{ color: "rgba(255,255,255,0.28)" }}
                    onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.7)")}
                    onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.28)")}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </GlassInput>
            </div>

            <div className="animate-element animate-delay-500 flex items-center justify-between text-sm">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input type="checkbox" name="rememberMe"
                  className="w-4 h-4 rounded accent-blue-500" />
                <span style={{ color: "rgba(255,255,255,0.55)", fontFamily: F }}>Keep me signed in</span>
              </label>
              <button type="button" onClick={onResetPassword}
                className="transition-colors hover:underline"
                style={{ color: "var(--brand-mid)", fontFamily: F }}>
                Reset password
              </button>
            </div>

            {error && (
              <p role="alert" className="text-sm px-3 py-2.5 rounded-xl"
                style={{ background:"rgba(239,68,68,0.08)", color:"#f87171", border:"1px solid rgba(239,68,68,0.18)", fontFamily:F }}>
                {error}
              </p>
            )}

            <button
              type="submit" disabled={isDisabled}
              className="animate-element animate-delay-600 w-full rounded-2xl py-4 text-sm font-semibold text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
              style={{ background: "var(--brand)", fontFamily: F }}
              onMouseEnter={e => !isDisabled && (e.currentTarget.style.background = "var(--brand-dark)")}
              onMouseLeave={e => (e.currentTarget.style.background = "var(--brand)")}
            >
              {loading
                ? <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                    Signing in…
                  </span>
                : "Sign In"}
            </button>
          </form>

          {/* Divider */}
          <div className="animate-element animate-delay-700 relative flex items-center">
            <span className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.07)" }}/>
            <span className="px-4 text-xs uppercase tracking-widest" style={{ color:"rgba(255,255,255,0.2)", fontFamily:F }}>
              Or continue with
            </span>
            <span className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.07)" }}/>
          </div>

          {/* Google */}
          <button
            type="button" onClick={onGoogleSignIn} disabled={isDisabled}
            className="animate-element animate-delay-800 w-full flex items-center justify-center gap-3 rounded-2xl py-4 text-sm font-medium text-white transition-all duration-200 disabled:opacity-50"
            style={{ border:"1px solid rgba(255,255,255,0.1)", background:"rgba(255,255,255,0.04)", fontFamily:F, backdropFilter:"blur(8px)" }}
            onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.08)")}
            onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}
          >
            {oauthLoading
              ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
              : <GoogleIcon />}
            Continue with Google
          </button>

          <p className="animate-element animate-delay-900 text-center text-sm" style={{ color:"rgba(255,255,255,0.3)", fontFamily:F }}>
            New here?{" "}
            <button type="button" onClick={onCreateAccount}
              className="font-medium transition-colors hover:underline"
              style={{ color:"var(--brand-mid)" }}>
              Create Account
            </button>
          </p>
        </div>
      </section>

      {/* ── RIGHT: Animated product panel ── */}
      <div className="hidden md:flex flex-1 min-h-0">
        <AuthRightPanel />
      </div>
    </div>
  );
};
