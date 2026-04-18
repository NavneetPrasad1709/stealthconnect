"use client";

import React from "react";
import { ShieldCheck, Zap, Mail, Phone, ArrowRight } from "lucide-react";

const F = "var(--font-montserrat,'Montserrat',sans-serif)";

export function AuthRightPanel() {
  return (
    <section
      className="flex flex-col w-full h-full overflow-hidden relative"
      style={{ background: "#020208" }}
      aria-hidden="true"
    >
      {/* ── Background ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div style={{
          position:"absolute", top:"-30%", left:"-20%",
          width:"80%", paddingTop:"80%", borderRadius:"50%",
          background:"radial-gradient(circle,rgba(0,56,255,0.3) 0%,transparent 65%)",
          animation:"blob1 18s ease-in-out infinite", filter:"blur(60px)",
        }}/>
        <div style={{
          position:"absolute", bottom:"-25%", right:"-15%",
          width:"70%", paddingTop:"70%", borderRadius:"50%",
          background:"radial-gradient(circle,rgba(120,80,255,0.2) 0%,transparent 65%)",
          animation:"blob2 22s ease-in-out infinite", filter:"blur(70px)",
        }}/>
        <div style={{
          position:"absolute", top:"50%", left:"30%",
          width:"45%", paddingTop:"45%", borderRadius:"50%",
          background:"radial-gradient(circle,rgba(204,255,0,0.07) 0%,transparent 65%)",
          animation:"blob3 14s ease-in-out infinite", filter:"blur(80px)",
        }}/>
        {/* Fine dot grid */}
        <div style={{
          position:"absolute", inset:0,
          backgroundImage:"radial-gradient(circle,rgba(255,255,255,0.07) 1px,transparent 1px)",
          backgroundSize:"28px 28px",
          maskImage:"radial-gradient(ellipse 80% 80% at 50% 50%,black 40%,transparent 100%)",
        }}/>
        {/* Top vignette */}
        <div style={{
          position:"absolute", inset:0,
          background:"linear-gradient(to bottom, rgba(2,2,8,0.6) 0%, transparent 30%, transparent 70%, rgba(2,2,8,0.8) 100%)",
        }}/>
      </div>

      {/* ── Content ── */}
      <div className="relative z-10 flex flex-col justify-between h-full px-8 xl:px-12 py-10">

        {/* Top: Logo + headline */}
        <div style={{ animation:"floatUp .5s ease both" }}>
          <div className="flex items-center gap-2 mb-8">
            <div className="w-7 h-7 rounded-full flex items-center justify-center"
              style={{ background:"var(--brand)", boxShadow:"0 0 20px rgba(0,56,255,0.7)" }}>
              <Zap className="w-3.5 h-3.5 text-white" strokeWidth={2.5}/>
            </div>
            <span style={{ fontFamily:F, fontSize:13, fontWeight:800, color:"rgba(255,255,255,0.6)", letterSpacing:"-0.01em" }}>
              StealthConnect AI
            </span>
          </div>

          <p style={{ fontFamily:F, fontSize:11, fontWeight:700, letterSpacing:"0.18em", textTransform:"uppercase", color:"rgba(0,100,255,0.8)", marginBottom:10 }}>
            See it in action
          </p>
          <h2 style={{ fontFamily:F, fontSize:"clamp(1.6rem,2.4vw,2.1rem)", fontWeight:900, lineHeight:1.1, letterSpacing:"-0.035em", color:"#fff", margin:0 }}>
            Paste a URL.<br/>
            <span style={{
              background:"linear-gradient(90deg,#CCFF00,#a3f000)",
              WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
            }}>Get the contact.</span>
          </h2>
        </div>

        {/* Center: Result card */}
        <div style={{ animation:"floatUp .5s .12s ease both", flex:1, display:"flex", alignItems:"center", paddingTop:24, paddingBottom:24 }}>
          {/* Gradient border wrapper */}
          <div className="w-full" style={{
            borderRadius:22,
            padding:1.5,
            background:"linear-gradient(135deg,rgba(0,56,255,0.6),rgba(120,80,255,0.4),rgba(204,255,0,0.3))",
            boxShadow:"0 0 60px rgba(0,56,255,0.15), 0 0 120px rgba(0,56,255,0.07)",
          }}>
            <div style={{
              borderRadius:21,
              background:"rgba(8,8,20,0.95)",
              backdropFilter:"blur(20px)",
              overflow:"hidden",
            }}>

              {/* Card header bar */}
              <div style={{
                padding:"12px 16px",
                borderBottom:"1px solid rgba(255,255,255,0.06)",
                background:"rgba(255,255,255,0.02)",
                display:"flex", alignItems:"center", justifyContent:"space-between",
              }}>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <div style={{ width:28, height:28, borderRadius:8, background:"#0A66C2", display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z"/>
                      <rect x="2" y="9" width="4" height="12"/>
                      <circle cx="4" cy="4" r="2"/>
                    </svg>
                  </div>
                  <div>
                    <p style={{ fontFamily:F, fontSize:10, fontWeight:600, color:"rgba(255,255,255,0.4)", margin:0, lineHeight:1 }}>LinkedIn Profile</p>
                    <p style={{ fontFamily:F, fontSize:11.5, fontWeight:600, color:"rgba(255,255,255,0.7)", margin:0 }}>linkedin.com/in/sarah-chen-cto</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4" style={{ color:"rgba(255,255,255,0.2)" }}/>
              </div>

              {/* Slim progress bar (animated) */}
              <div style={{ height:2, background:"rgba(255,255,255,0.05)", overflow:"hidden" }}>
                <div style={{
                  height:"100%", width:"100%",
                  background:"linear-gradient(90deg,transparent,rgba(0,56,255,0.8),rgba(204,255,0,0.8),transparent)",
                  animation:"shimmer 2s linear infinite",
                }}/>
              </div>

              {/* Contact result */}
              <div style={{ padding:"16px" }}>
                {/* Person */}
                <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:14 }}>
                  <div style={{
                    width:44, height:44, borderRadius:14, flexShrink:0,
                    background:"linear-gradient(135deg,#3b5bdb,#7048e8)",
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontSize:14, fontWeight:900, color:"#fff", fontFamily:F,
                    boxShadow:"0 4px 16px rgba(59,91,219,0.4)",
                  }}>SC</div>
                  <div style={{ flex:1 }}>
                    <p style={{ fontFamily:F, fontSize:14, fontWeight:800, color:"#fff", margin:0, letterSpacing:"-0.01em" }}>Sarah Chen</p>
                    <p style={{ fontFamily:F, fontSize:11, color:"rgba(255,255,255,0.35)", margin:0 }}>CTO · Acme Corp · San Francisco</p>
                  </div>
                  <div style={{
                    padding:"3px 10px", borderRadius:999,
                    background:"rgba(204,255,0,0.1)", border:"1px solid rgba(204,255,0,0.3)",
                  }}>
                    <span style={{ fontFamily:F, fontSize:10, fontWeight:700, color:"#CCFF00" }}>Found</span>
                  </div>
                </div>

                {/* Contact rows */}
                {[
                  { Icon:Mail,  label:"Email", val:"s.chen@acmecorp.com" },
                  { Icon:Phone, label:"Phone", val:"+1 (415) 555-0147" },
                ].map(({ Icon, label, val }) => (
                  <div key={label} style={{
                    display:"flex", alignItems:"center", gap:10,
                    padding:"9px 12px", marginBottom:8, borderRadius:12,
                    background:"rgba(0,56,255,0.07)",
                    border:"1px solid rgba(0,56,255,0.15)",
                  }}>
                    <Icon className="w-3.5 h-3.5 shrink-0" style={{ color:"#5b8ff9" }}/>
                    <span style={{ fontFamily:F, fontSize:12.5, color:"rgba(255,255,255,0.7)", flex:1 }}>{val}</span>
                    <div style={{ display:"flex", alignItems:"center", gap:4 }}>
                      <ShieldCheck className="w-3 h-3" style={{ color:"#CCFF00" }}/>
                      <span style={{ fontFamily:F, fontSize:9.5, fontWeight:700, color:"#CCFF00" }}>Verified</span>
                    </div>
                  </div>
                ))}

                {/* Footer */}
                <div style={{
                  display:"flex", alignItems:"center", justifyContent:"space-between",
                  marginTop:4, paddingTop:10, borderTop:"1px solid rgba(255,255,255,0.06)",
                }}>
                  <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                    <span style={{ width:6, height:6, borderRadius:"50%", background:"#CCFF00", display:"inline-block", boxShadow:"0 0 8px rgba(204,255,0,0.8)" }}/>
                    <span style={{ fontFamily:F, fontSize:11, color:"rgba(255,255,255,0.35)" }}>Delivered in 24 minutes</span>
                  </div>
                  <span style={{ fontFamily:F, fontSize:10, color:"rgba(255,255,255,0.2)" }}>1 credit used</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom: Stats + testimonial */}
        <div style={{ animation:"floatUp .5s .22s ease both" }}>

          {/* Stats pills */}
          <div style={{ display:"flex", gap:8, marginBottom:16, flexWrap:"wrap" }}>
            {[
              { v:"97.2%", l:"accuracy" },
              { v:"< 30 min", l:"delivery" },
              { v:"4,200+", l:"teams" },
              { v:"190+", l:"countries" },
            ].map(({ v, l }) => (
              <div key={l} style={{
                padding:"6px 14px", borderRadius:999,
                background:"rgba(255,255,255,0.04)",
                border:"1px solid rgba(255,255,255,0.09)",
                display:"flex", alignItems:"center", gap:6,
              }}>
                <span style={{ fontFamily:F, fontSize:12.5, fontWeight:800, color:"#fff", letterSpacing:"-0.01em" }}>{v}</span>
                <span style={{ fontFamily:F, fontSize:10, color:"rgba(255,255,255,0.3)", fontWeight:500 }}>{l}</span>
              </div>
            ))}
          </div>

          {/* Testimonial */}
          <div style={{
            padding:"14px 16px", borderRadius:16,
            background:"rgba(255,255,255,0.03)",
            border:"1px solid rgba(255,255,255,0.07)",
          }}>
            <p style={{ fontFamily:F, fontSize:13, color:"rgba(255,255,255,0.6)", lineHeight:1.6, margin:0, fontStyle:"italic" }}>
              "Closed two deals the same week. Our outbound response rate doubled after switching."
            </p>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginTop:10 }}>
              <div style={{
                width:30, height:30, borderRadius:9, flexShrink:0,
                background:"linear-gradient(135deg,#0f766e,#0891b2)",
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:10, fontWeight:800, color:"#fff", fontFamily:F,
              }}>MJ</div>
              <div>
                <p style={{ fontFamily:F, fontSize:12, fontWeight:700, color:"rgba(255,255,255,0.7)", margin:0 }}>Marcus Johnson</p>
                <p style={{ fontFamily:F, fontSize:10.5, color:"rgba(255,255,255,0.28)", margin:0 }}>AE · GrowthLabs</p>
              </div>
              <div style={{ marginLeft:"auto", display:"flex", gap:2 }}>
                {[1,2,3,4,5].map(i => (
                  <span key={i} style={{ color:"#CCFF00", fontSize:10 }}>★</span>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
