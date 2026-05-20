import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const alt = "StealthConnect AI — Find Verified LinkedIn Contacts in 30 Minutes";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function TwitterImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background:
            "linear-gradient(135deg,#0038FF 0%,#0029CC 60%,#001A99 100%)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          color: "#fff",
          fontFamily:
            'system-ui, -apple-system, "Segoe UI", "Helvetica Neue", Arial, sans-serif',
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 999,
              background: "#CCFF00",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#0038FF",
              fontSize: 36,
              fontWeight: 900,
            }}
          >
            ⚡
          </div>
          <div style={{ display: "flex", fontSize: 28, fontWeight: 800, letterSpacing: "-0.02em" }}>
            <span>Stealth</span>
            <span style={{ opacity: 0.55 }}>Connect AI</span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontSize: 84,
              fontWeight: 900,
              lineHeight: 1.02,
              letterSpacing: "-0.04em",
              textShadow: "4px 4px 0 rgba(0,26,153,0.55)",
            }}
          >
            <span>Find verified LinkedIn</span>
            <span>contacts in 30 minutes.</span>
          </div>
          <div
            style={{
              fontSize: 28,
              fontWeight: 500,
              opacity: 0.85,
              maxWidth: 980,
            }}
          >
            Paste any LinkedIn URL — get a verified email and direct phone number. Pay only per result.
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              padding: "10px 18px",
              borderRadius: 999,
              background: "#CCFF00",
              color: "#000",
              fontWeight: 900,
              fontSize: 22,
            }}
          >
            Try it free
          </div>
          <div style={{ fontSize: 22, opacity: 0.85 }}>
            No subscription · 97.2% verified · 190+ countries
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
