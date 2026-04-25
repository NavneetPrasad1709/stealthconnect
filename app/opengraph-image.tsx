import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "StealthConnect AI — LinkedIn Contact Finder";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          background: "#0038FF",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          fontFamily: '"Arial Black", Impact, sans-serif',
          overflow: "hidden",
        }}
      >
        {/* Grid texture */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.06) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.06) 1px,transparent 1px)",
            backgroundSize: "60px 60px",
            display: "flex",
          }}
        />

        {/* Radial glow */}
        <div
          style={{
            position: "absolute",
            top: -80,
            left: "50%",
            transform: "translateX(-50%)",
            width: 900,
            height: 600,
            background:
              "radial-gradient(ellipse at top,rgba(255,255,255,0.12) 0%,transparent 65%)",
            display: "flex",
          }}
        />

        {/* Main text block */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 0,
            zIndex: 10,
          }}
        >
          <span
            style={{
              fontSize: 96,
              fontWeight: 900,
              lineHeight: 0.88,
              letterSpacing: "-3px",
              textTransform: "uppercase",
              color: "#CCFF00",
              textShadow: "4px 4px 0 #001A99,8px 8px 0 #001A99",
            }}
          >
            LOOKING FOR
          </span>
          <span
            style={{
              fontSize: 116,
              fontWeight: 900,
              lineHeight: 0.88,
              letterSpacing: "-3px",
              textTransform: "uppercase",
              color: "#FFFFFF",
              textShadow: "4px 4px 0 #001A99,8px 8px 0 #001A99",
            }}
          >
            SOMEONE
          </span>
          <span
            style={{
              fontSize: 88,
              fontWeight: 900,
              lineHeight: 0.88,
              letterSpacing: "-3px",
              textTransform: "uppercase",
              color: "#FFFFFF",
              textShadow: "4px 4px 0 #001A99,8px 8px 0 #001A99",
            }}
          >
            ON LINKEDIN?
          </span>
        </div>

        {/* Tagline */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginTop: 32,
            zIndex: 10,
          }}
        >
          <span
            style={{
              fontSize: 28,
              fontWeight: 600,
              color: "#FFFFFF",
              fontFamily: "Arial, sans-serif",
            }}
          >
            Real contacts, delivered in
          </span>
          <span
            style={{
              fontSize: 28,
              fontWeight: 900,
              color: "#000000",
              background: "#CCFF00",
              padding: "4px 14px",
              borderRadius: 8,
              fontFamily: "Arial, sans-serif",
            }}
          >
            less than 30 minutes
          </span>
        </div>

        {/* Bottom badges */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginTop: 28,
            zIndex: 10,
          }}
        >
          {["No subscription", "Pay per result", "97.2% verified"].map((b) => (
            <span
              key={b}
              style={{
                fontSize: 20,
                fontWeight: 600,
                color: "#FFFFFF",
                background: "rgba(255,255,255,0.15)",
                border: "1.5px solid rgba(255,255,255,0.3)",
                borderRadius: 999,
                padding: "8px 20px",
                fontFamily: "Arial, sans-serif",
              }}
            >
              ✓ {b}
            </span>
          ))}
        </div>

        {/* Brand watermark */}
        <div
          style={{
            position: "absolute",
            bottom: 32,
            right: 40,
            display: "flex",
            alignItems: "center",
            gap: 10,
            zIndex: 10,
          }}
        >
          <span
            style={{
              fontSize: 22,
              fontWeight: 900,
              color: "#CCFF00",
              fontFamily: '"Arial Black", Impact, sans-serif',
              letterSpacing: "-0.5px",
            }}
          >
            StealthConnect AI
          </span>
        </div>
      </div>
    ),
    { ...size }
  );
}
