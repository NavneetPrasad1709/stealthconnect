"use client";

import React from "react";
import { ShieldCheck, Zap, Mail, Phone } from "lucide-react";

const F = "var(--font-montserrat,'Montserrat',sans-serif)";

const TESTIMONIALS = [
  {
    quote: "Closed two deals the same week. Nothing else comes close.",
    name: "Sarah Chen",
    role: "SDR · TechCorp",
    initials: "SC",
    color: "linear-gradient(135deg,#3b5bdb,#7048e8)",
  },
  {
    quote: "Replaced three tools with this one. Accuracy is unmatched.",
    name: "Marcus Johnson",
    role: "AE · GrowthLabs",
    initials: "MJ",
    color: "linear-gradient(135deg,#0f766e,#0891b2)",
  },
];

export function AuthRightPanel() {
  return (
    <section
      className="flex flex-col w-full h-full overflow-hidden relative"
      style={{ background: "#04040f" }}
      aria-hidden="true"
    >
      {/* ── Animated background ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div style={{
          position:"absolute", top:"-20%", left:"-15%",
          width:"70%", paddingTop:"70%", borderRadius:"50%",
          background:"radial-gradient(circle,rgba(0,56,255,0.22) 0%,transparent 70%)",
          animation:"blob1 16s ease-in-out infinite", filter:"blur(48px)",
        }}/>
        <div style={{
          position:"absolute", bottom:"-20%", right:"-10%",
          width:"60%", paddingTop:"60%", borderRadius:"50%",
          background:"radial-gradient(circle,rgba(99,102,241,0.18) 0%,transparent 70%)",
          animation:"blob2 20s ease-in-out infinite", filter:"blur(56px)",
        }}/>
        <div style={{
          position:"absolute", top:"35%", right:"5%",
          width:"40%", paddingTop:"40%", borderRadius:"50%",
          background:"radial-gradient(circle,rgba(204,255,0,0.06) 0%,transparent 70%)",
          animation:"blob3 12s ease-in-out infinite", filter:"blur(64px)",
        }}/>
        <div style={{
          position:"absolute", inset:0,
          backgroundImage:"linear-gradient(rgba(255,255,255,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.025) 1px,transparent 1px)",
          backgroundSize:"52px 52px",
        }}/>
      </div>

      {/* ── Content ── */}
      <div className="relative z-10 flex flex-col justify-center h-full px-8 xl:px-12 py-10 gap-6">

        {/* Logo */}
        <div className="flex items-center gap-2" style={{ animation:"floatUp .4s ease both" }}>
          <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
            style={{ background:"var(--brand)", boxShadow:"0 0 18px rgba(0,56,255,0.55)" }}>
            <Zap className="w-3.5 h-3.5 text-white" strokeWidth={2.5}/>
          </div>
          <span style={{ fontFamily:F, fontSize:14, fontWeight:800, color:"#fff", letterSpacing:"-0.02em" }}>
            Stealth<span style={{ color:"rgba(255,255,255,0.28)" }}>Connect AI</span>
          </span>
        </div>

        {/* Headline */}
        <div style={{ animation:"floatUp .45s .06s ease both" }}>
          <h2 style={{ fontFamily:F, fontSize:"clamp(1.5rem,2.2vw,2rem)", fontWeight:900, lineHeight:1.12, letterSpacing:"-0.03em", color:"#fff", margin:0 }}>
            Find anyone's contact<br/>
            <span style={{ color:"#CCFF00" }}>in under 30 minutes.</span>
          </h2>
          <p style={{ fontFamily:F, fontSize:13, color:"rgba(255,255,255,0.38)", marginTop:8, lineHeight:1.6, maxWidth:340 }}>
            Paste a LinkedIn URL. Get verified email + direct phone — or you don't pay.
          </p>
        </div>

        {/* ── Result card ── */}
        <div style={{ animation:"floatUp .45s .12s ease both" }}>
          <div style={{
            background:"rgba(255,255,255,0.04)",
            border:"1px solid rgba(255,255,255,0.09)",
            borderRadius:18,
            padding:"16px",
            backdropFilter:"blur(12px)",
          }}>
            {/* Card header */}
            <div className="flex items-center justify-between" style={{ marginBottom:12 }}>
              <div className="flex items-center gap-2">
                <div style={{
                  width:28, height:28, borderRadius:8,
                  background:"#0A66C2",
                  display:"flex", alignItems:"center", justifyContent:"center",
                }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="white">
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/>
                  </svg>
                </div>
                <span style={{ fontFamily:F, fontSize:12, fontWeight:700, color:"rgba(255,255,255,0.7)" }}>Contact Found</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full" style={{ background:"#CCFF00", display:"inline-block", boxShadow:"0 0 6px rgba(204,255,0,0.7)" }}/>
                <span style={{ fontFamily:F, fontSize:10.5, color:"rgba(255,255,255,0.35)" }}>24 min</span>
              </div>
            </div>

            {/* Person row */}
            <div className="flex items-center gap-3" style={{ marginBottom:12 }}>
              <div style={{
                width:38, height:38, borderRadius:"50%",
                background:"linear-gradient(135deg,#3b5bdb,#7048e8)",
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:11, fontWeight:900, color:"#fff", flexShrink:0,
                fontFamily:F,
              }}>SC</div>
              <div>
                <p style={{ fontFamily:F, fontSize:13, fontWeight:700, color:"#fff", margin:0, lineHeight:1.2 }}>Sarah Chen</p>
                <p style={{ fontFamily:F, fontSize:11, color:"rgba(255,255,255,0.38)", margin:0 }}>CTO · Acme Corp</p>
              </div>
            </div>

            {/* Contact details */}
            <div className="flex flex-col gap-2">
              {[
                { Icon: Mail,  val: "s.chen@acmecorp.com", label:"Email" },
                { Icon: Phone, val: "+1 (415) 555-0147",   label:"Phone" },
              ].map(({ Icon, val, label }) => (
                <div key={label} style={{
                  display:"flex", alignItems:"center", gap:10,
                  background:"rgba(0,56,255,0.08)",
                  border:"1px solid rgba(0,56,255,0.18)",
                  borderRadius:10, padding:"8px 12px",
                }}>
                  <Icon className="w-3.5 h-3.5 shrink-0" style={{ color:"#6da8ff" }}/>
                  <span style={{ fontFamily:F, fontSize:12, color:"rgba(255,255,255,0.75)", flex:1, letterSpacing:"-0.01em" }}>{val}</span>
                  <div className="flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" style={{ color:"#CCFF00" }}/>
                    <span style={{ fontFamily:F, fontSize:9.5, fontWeight:700, color:"#CCFF00" }}>Verified</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Stats row ── */}
        <div className="grid grid-cols-3 gap-3" style={{ animation:"floatUp .45s .18s ease both" }}>
          {[
            { v:"97.2%",  l:"Accuracy" },
            { v:"< 30m",  l:"Delivery" },
            { v:"4,200+", l:"Teams"    },
          ].map(({ v, l }) => (
            <div key={l} style={{
              background:"rgba(255,255,255,0.03)",
              border:"1px solid rgba(255,255,255,0.07)",
              borderRadius:12, padding:"12px 8px", textAlign:"center",
            }}>
              <p style={{ fontFamily:F, fontSize:"clamp(1rem,1.6vw,1.4rem)", fontWeight:900, color:"#CCFF00", letterSpacing:"-0.02em", margin:0, lineHeight:1 }}>{v}</p>
              <p style={{ fontFamily:F, fontSize:10, fontWeight:600, color:"rgba(255,255,255,0.3)", marginTop:4, textTransform:"uppercase", letterSpacing:"0.07em" }}>{l}</p>
            </div>
          ))}
        </div>

        {/* ── Testimonial cards ── */}
        <div className="flex flex-col gap-3" style={{ animation:"floatUp .45s .24s ease both" }}>
          {TESTIMONIALS.map((t) => (
            <div key={t.name} style={{
              background:"rgba(255,255,255,0.03)",
              border:"1px solid rgba(255,255,255,0.07)",
              borderRadius:14, padding:"14px",
              display:"flex", gap:12, alignItems:"flex-start",
            }}>
              <div style={{
                width:34, height:34, borderRadius:10, flexShrink:0,
                background:t.color,
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:11, fontWeight:800, color:"#fff", fontFamily:F,
              }}>{t.initials}</div>
              <div>
                <p style={{ fontFamily:F, fontSize:12.5, color:"rgba(255,255,255,0.72)", lineHeight:1.5, margin:0 }}>
                  "{t.quote}"
                </p>
                <p style={{ fontFamily:F, fontSize:11, color:"rgba(255,255,255,0.3)", marginTop:5 }}>
                  {t.name} · <span style={{ color:"rgba(255,255,255,0.2)" }}>{t.role}</span>
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
