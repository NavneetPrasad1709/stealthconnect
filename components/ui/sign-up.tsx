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

export interface Testimonial { avatarSrc:string; name:string; handle:string; text:string; }

export interface SignUpPageProps {
  title?: React.ReactNode;
  description?: React.ReactNode;
  heroImageSrc?: string;
  testimonials?: Testimonial[];
  onSignUp?: (event: React.FormEvent<HTMLFormElement>) => void;
  onGoogleSignUp?: () => void;
  onSignIn?: () => void;
  loading?: boolean;
  oauthLoading?: boolean;
  error?: string | null;
}

export const SignUpPage: React.FC<SignUpPageProps> = ({
  onSignUp, onGoogleSignUp, onSignIn,
  loading=false, oauthLoading=false, error,
}) => {
  const [showPw, setShowPw] = useState(false);
  const disabled = loading || oauthLoading;

  const inputStyle: React.CSSProperties = {
    fontFamily:F, background:"rgba(255,255,255,0.05)",
    border:"1px solid rgba(255,255,255,0.09)", caretColor:"var(--brand)",
  };
  const onFocus = (e: React.FocusEvent<HTMLInputElement>) => (e.currentTarget.style.borderColor="rgba(0,56,255,0.5)");
  const onBlur  = (e: React.FocusEvent<HTMLInputElement>) => (e.currentTarget.style.borderColor="rgba(255,255,255,0.09)");
  const inputCls = "w-full text-sm py-3.5 px-4 rounded-2xl focus:outline-none text-white placeholder:text-white/20 transition-all duration-150";

  return (
    <div className="h-[100dvh] w-[100dvw] flex flex-col md:flex-row overflow-hidden"
      style={{ background:"#000", fontFamily:F }}>

      {/* ── LEFT ── */}
      <section className="flex-1 flex items-center justify-center p-6 sm:p-10 relative overflow-y-auto">
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <div style={{
            position:"absolute", top:"10%", left:"50%", transform:"translateX(-50%)",
            width:600, height:600, borderRadius:"50%",
            background:"radial-gradient(circle,rgba(0,56,255,0.08) 0%,transparent 70%)",
          }}/>
        </div>

        <div className="w-full max-w-[400px] relative z-10 flex flex-col gap-5 py-6">

          {/* Logo */}
          <div className="animate-element animate-delay-100 flex items-center gap-2">
            <div className="w-7 h-7 rounded-full flex items-center justify-center"
              style={{ background:"var(--brand)", boxShadow:"0 0 16px rgba(0,56,255,0.6)" }}>
              <Zap className="w-3.5 h-3.5 text-white" strokeWidth={2.5}/>
            </div>
            <span style={{ fontFamily:F, fontSize:13, fontWeight:800, color:"rgba(255,255,255,0.55)", letterSpacing:"-0.01em" }}>
              StealthConnect AI
            </span>
          </div>

          {/* Heading */}
          <div className="animate-element animate-delay-200">
            <div className="inline-flex items-center gap-2 mb-3 px-3 py-1.5 rounded-full"
              style={{ background:"rgba(204,255,0,0.08)", border:"1px solid rgba(204,255,0,0.2)" }}>
              <span style={{ width:6, height:6, borderRadius:"50%", background:"#CCFF00", display:"inline-block" }}/>
              <span style={{ fontFamily:F, fontSize:11, fontWeight:700, color:"#CCFF00" }}>1 free credit included — no card needed</span>
            </div>
            <h1 style={{ fontFamily:F, fontSize:"clamp(2.4rem,4.5vw,3.4rem)", fontWeight:300, lineHeight:1.05, letterSpacing:"-0.04em", color:"rgba(255,255,255,0.9)", margin:0 }}>
              Start finding<br/>
              <span style={{ fontWeight:900, color:"#fff" }}>contacts.</span>
            </h1>
          </div>

          {/* Google */}
          <button type="button" onClick={onGoogleSignUp} disabled={disabled}
            className="animate-element animate-delay-300 w-full flex items-center justify-center gap-2.5 rounded-2xl py-3.5 text-sm font-medium text-white transition-all duration-150 disabled:opacity-50"
            style={{ border:"1px solid rgba(255,255,255,0.1)", background:"rgba(255,255,255,0.04)", fontFamily:F }}
            onMouseEnter={e=>(e.currentTarget.style.background="rgba(255,255,255,0.07)")}
            onMouseLeave={e=>(e.currentTarget.style.background="rgba(255,255,255,0.04)")}>
            {oauthLoading
              ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
              : <GoogleIcon/>}
            Continue with Google
          </button>

          {/* Divider */}
          <div className="animate-element animate-delay-400 flex items-center gap-3">
            <span className="flex-1 h-px" style={{ background:"rgba(255,255,255,0.06)" }}/>
            <span style={{ fontFamily:F, fontSize:10, color:"rgba(255,255,255,0.2)", textTransform:"uppercase", letterSpacing:"0.12em" }}>or</span>
            <span className="flex-1 h-px" style={{ background:"rgba(255,255,255,0.06)" }}/>
          </div>

          {/* Form */}
          <form className="flex flex-col gap-3.5" onSubmit={onSignUp}>

            <div className="animate-element animate-delay-400">
              <label style={{ fontFamily:F, fontSize:11.5, fontWeight:600, color:"rgba(255,255,255,0.35)", textTransform:"uppercase", letterSpacing:"0.1em", display:"block", marginBottom:6 }}>Full Name</label>
              <input name="fullName" type="text" placeholder="John Doe"
                autoComplete="name" minLength={2} required
                className={inputCls} style={inputStyle}
                onFocus={onFocus} onBlur={onBlur}/>
            </div>

            <div className="animate-element animate-delay-500">
              <label style={{ fontFamily:F, fontSize:11.5, fontWeight:600, color:"rgba(255,255,255,0.35)", textTransform:"uppercase", letterSpacing:"0.1em", display:"block", marginBottom:6 }}>Email</label>
              <input name="email" type="email" placeholder="you@example.com"
                autoComplete="email" required
                className={inputCls} style={inputStyle}
                onFocus={onFocus} onBlur={onBlur}/>
            </div>

            <div className="animate-element animate-delay-500 grid grid-cols-2 gap-3">
              <div>
                <label style={{ fontFamily:F, fontSize:11.5, fontWeight:600, color:"rgba(255,255,255,0.35)", textTransform:"uppercase", letterSpacing:"0.1em", display:"block", marginBottom:6 }}>
                  Phone <span style={{ color:"rgba(255,255,255,0.18)", fontWeight:400, textTransform:"none", letterSpacing:0 }}>(opt)</span>
                </label>
                <input name="phone" type="tel" placeholder="+1 555 0000"
                  className={inputCls} style={inputStyle}
                  onFocus={onFocus} onBlur={onBlur}/>
              </div>
              <div>
                <label style={{ fontFamily:F, fontSize:11.5, fontWeight:600, color:"rgba(255,255,255,0.35)", textTransform:"uppercase", letterSpacing:"0.1em", display:"block", marginBottom:6 }}>
                  LinkedIn <span style={{ color:"rgba(255,255,255,0.18)", fontWeight:400, textTransform:"none", letterSpacing:0 }}>(opt)</span>
                </label>
                <input name="linkedinUrl" type="url" placeholder="linkedin.com/in/you"
                  className={inputCls} style={inputStyle}
                  onFocus={onFocus} onBlur={onBlur}/>
              </div>
            </div>

            <div className="animate-element animate-delay-600">
              <label style={{ fontFamily:F, fontSize:11.5, fontWeight:600, color:"rgba(255,255,255,0.35)", textTransform:"uppercase", letterSpacing:"0.1em", display:"block", marginBottom:6 }}>Password</label>
              <div className="relative">
                <input name="password" type={showPw?"text":"password"} placeholder="Min. 8 characters"
                  autoComplete="new-password" minLength={8} required
                  className={`${inputCls} pr-11`} style={inputStyle}
                  onFocus={onFocus} onBlur={onBlur}/>
                <button type="button" onClick={()=>setShowPw(v=>!v)}
                  className="absolute inset-y-0 right-3.5 flex items-center transition-colors"
                  style={{ color:"rgba(255,255,255,0.25)" }}
                  onMouseEnter={e=>(e.currentTarget.style.color="rgba(255,255,255,0.6)")}
                  onMouseLeave={e=>(e.currentTarget.style.color="rgba(255,255,255,0.25)")}>
                  {showPw ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                </button>
              </div>
            </div>

            {error && (
              <p role="alert" className="text-sm px-3.5 py-2.5 rounded-xl"
                style={{ background:"rgba(239,68,68,0.07)", color:"#f87171", border:"1px solid rgba(239,68,68,0.15)", fontFamily:F }}>
                {error}
              </p>
            )}

            <button type="submit" disabled={disabled}
              className="animate-element animate-delay-700 w-full rounded-2xl py-3.5 text-sm font-bold text-white transition-all duration-150 disabled:opacity-50 active:scale-[0.98]"
              style={{ background:"var(--brand)", fontFamily:F, boxShadow:"0 4px 24px rgba(0,56,255,0.35)" }}
              onMouseEnter={e=>!disabled&&(e.currentTarget.style.boxShadow="0 6px 32px rgba(0,56,255,0.55)")}
              onMouseLeave={e=>(e.currentTarget.style.boxShadow="0 4px 24px rgba(0,56,255,0.35)")}>
              {loading
                ? <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Creating account…
                  </span>
                : "Create Free Account →"}
            </button>
          </form>

          <p className="animate-element animate-delay-800 text-center text-xs" style={{ color:"rgba(255,255,255,0.25)", fontFamily:F }}>
            Already have an account?{" "}
            <button type="button" onClick={onSignIn}
              className="font-semibold hover:underline"
              style={{ color:"rgba(0,100,255,0.8)" }}>
              Sign in
            </button>
          </p>

        </div>
      </section>

      {/* ── RIGHT ── */}
      <div className="hidden md:flex flex-1 min-h-0">
        <AuthRightPanel />
      </div>
    </div>
  );
};
