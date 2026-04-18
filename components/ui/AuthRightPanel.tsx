"use client";

import React from "react";
import { ShieldCheck, Zap, Clock, Globe, CreditCard, TrendingUp } from "lucide-react";

const F = "var(--font-montserrat,'Montserrat',sans-serif)";

const STATS = [
  { value: "97.2%",  label: "Verified accuracy" },
  { value: "< 30m",  label: "Avg. delivery"     },
  { value: "4,200+", label: "Sales teams"        },
];

const FEATURES = [
  { icon: Zap,         text: "Email + direct phone — not just email like competitors"  },
  { icon: CreditCard,  text: "Pay per result — zero subscriptions or monthly fees"     },
  { icon: Clock,       text: "LinkedIn URL → verified contact in under 30 minutes"     },
  { icon: Globe,       text: "190+ countries covered, any industry, any seniority"      },
  { icon: ShieldCheck, text: "97.2% accuracy guaranteed — full refund if we miss"       },
  { icon: TrendingUp,  text: "Used by 4,200+ SDRs, AEs and outbound teams worldwide"   },
];

const COMPARED = [
  { feature: "Direct phone numbers",  us: true,  them: false },
  { feature: "Pay per result",        us: true,  them: false },
  { feature: "< 30 min delivery",     us: true,  them: false },
  { feature: "No subscription lock",  us: true,  them: false },
];

export function AuthRightPanel() {
  return (
    <section
      className="hidden md:flex flex-col h-full overflow-hidden relative"
      style={{ background: "#03030d" }}
      aria-hidden="true"
    >
      {/* ── Animated blobs ─────────────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div style={{
          position:"absolute", top:"-20%", left:"-10%",
          width:600, height:600, borderRadius:"50%",
          background:"radial-gradient(circle,rgba(0,56,255,0.28) 0%,transparent 70%)",
          animation:"blob1 14s ease-in-out infinite",
          filter:"blur(40px)",
        }}/>
        <div style={{
          position:"absolute", bottom:"-15%", right:"-10%",
          width:500, height:500, borderRadius:"50%",
          background:"radial-gradient(circle,rgba(99,102,241,0.22) 0%,transparent 70%)",
          animation:"blob2 18s ease-in-out infinite",
          filter:"blur(50px)",
        }}/>
        <div style={{
          position:"absolute", top:"40%", right:"20%",
          width:300, height:300, borderRadius:"50%",
          background:"radial-gradient(circle,rgba(204,255,0,0.08) 0%,transparent 70%)",
          animation:"blob3 10s ease-in-out infinite",
          filter:"blur(60px)",
        }}/>
        {/* grid overlay */}
        <div style={{
          position:"absolute", inset:0,
          backgroundImage:"linear-gradient(rgba(255,255,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.03) 1px,transparent 1px)",
          backgroundSize:"48px 48px",
        }}/>
      </div>

      {/* ── Content ────────────────────────────────────────── */}
      <div className="relative z-10 flex flex-col h-full px-10 py-12 gap-8">

        {/* Logo */}
        <div className="flex items-center gap-2.5" style={{ animation:"floatUp .5s ease both" }}>
          <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
            style={{ background:"var(--brand)", boxShadow:"0 0 20px rgba(0,56,255,0.5)" }}>
            <Zap className="w-4 h-4 text-white" strokeWidth={2.5}/>
          </div>
          <span style={{ fontFamily:F, fontSize:15, fontWeight:800, color:"#fff", letterSpacing:"-0.02em" }}>
            Stealth<span style={{ color:"rgba(255,255,255,0.3)" }}>Connect AI</span>
          </span>
        </div>

        {/* Headline */}
        <div style={{ animation:"floatUp .55s .1s ease both" }}>
          <p style={{ fontFamily:F, fontSize:11, fontWeight:700, letterSpacing:"0.16em", textTransform:"uppercase", color:"rgba(0,56,255,0.9)", marginBottom:10 }}>
            Why StealthConnect AI?
          </p>
          <h2 style={{ fontFamily:F, fontSize:"clamp(1.6rem,2.5vw,2.2rem)", fontWeight:900, lineHeight:1.1, letterSpacing:"-0.03em", color:"#fff" }}>
            Find anyone's contact<br/>
            <span style={{ color:"#CCFF00" }}>in under 30 minutes.</span>
          </h2>
          <p style={{ fontFamily:F, fontSize:13.5, color:"rgba(255,255,255,0.45)", marginTop:10, lineHeight:1.65, maxWidth:380 }}>
            Paste any LinkedIn URL. Get a verified email and direct phone number delivered fast — or you don't pay.
          </p>
        </div>

        {/* Stats row */}
        <div className="flex gap-0" style={{ animation:"floatUp .55s .18s ease both" }}>
          {STATS.map((s, i) => (
            <div key={s.label} style={{
              flex:1, textAlign:"center", padding:"16px 8px",
              borderLeft: i > 0 ? "1px solid rgba(255,255,255,0.07)" : "none",
              borderRight: i < STATS.length-1 ? "none" : "none",
            }}>
              <p style={{ fontFamily:F, fontSize:"clamp(1.3rem,2vw,1.75rem)", fontWeight:900, letterSpacing:"-0.03em", color:"#CCFF00", lineHeight:1 }}>
                {s.value}
              </p>
              <p style={{ fontFamily:F, fontSize:10.5, fontWeight:600, color:"rgba(255,255,255,0.35)", marginTop:4, textTransform:"uppercase", letterSpacing:"0.08em" }}>
                {s.label}
              </p>
            </div>
          ))}
        </div>

        {/* Feature list */}
        <div className="flex flex-col gap-3" style={{ animation:"floatUp .55s .26s ease both" }}>
          {FEATURES.map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-start gap-3">
              <div className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center mt-0.5"
                style={{ background:"rgba(0,56,255,0.18)", border:"1px solid rgba(0,56,255,0.3)" }}>
                <Icon className="w-3.5 h-3.5" style={{ color:"#6da8ff" }}/>
              </div>
              <p style={{ fontFamily:F, fontSize:13, color:"rgba(255,255,255,0.65)", lineHeight:1.55 }}>
                {text}
              </p>
            </div>
          ))}
        </div>

        {/* Comparison mini-table */}
        <div style={{ animation:"floatUp .55s .34s ease both", marginTop:"auto" }}>
          <p style={{ fontFamily:F, fontSize:10, fontWeight:700, letterSpacing:"0.14em", textTransform:"uppercase", color:"rgba(255,255,255,0.25)", marginBottom:8 }}>
            vs Apollo, Hunter, Lusha
          </p>
          <div className="flex flex-col gap-1.5">
            {COMPARED.map(({ feature, us, them }) => (
              <div key={feature} className="flex items-center gap-3">
                <span style={{ fontFamily:F, fontSize:12, color:"rgba(255,255,255,0.5)", flex:1 }}>{feature}</span>
                <span style={{
                  fontSize:11, fontWeight:700, fontFamily:F,
                  padding:"2px 10px", borderRadius:999,
                  background: us ? "rgba(204,255,0,0.12)" : "rgba(255,255,255,0.05)",
                  color: us ? "#CCFF00" : "rgba(255,255,255,0.2)",
                  border: `1px solid ${us ? "rgba(204,255,0,0.25)" : "rgba(255,255,255,0.07)"}`,
                  minWidth:40, textAlign:"center",
                }}>Us</span>
                <span style={{
                  fontSize:11, fontWeight:700, fontFamily:F,
                  padding:"2px 10px", borderRadius:999,
                  background:"rgba(255,255,255,0.04)",
                  color:"rgba(255,255,255,0.2)",
                  border:"1px solid rgba(255,255,255,0.07)",
                  minWidth:42, textAlign:"center",
                }}>Them</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
