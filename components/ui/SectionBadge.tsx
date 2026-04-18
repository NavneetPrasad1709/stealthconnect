import React from "react"

interface SectionBadgeProps {
  children: React.ReactNode
  /** "light" = dark border on light bg (default) | "dark" = white border on dark bg */
  variant?: "light" | "dark"
  className?: string
}

export function SectionBadge({ children, variant = "light", className = "" }: SectionBadgeProps) {
  const isDark = variant === "dark"
  return (
    <div
      className={`inline-flex items-center gap-[7px] ${className}`}
      style={{
        padding: "6px 16px",
        borderRadius: 999,
        border: `1.5px solid ${isDark ? "rgba(255,255,255,0.35)" : "var(--c-heading)"}`,
        fontFamily: "var(--font-montserrat), 'Montserrat', sans-serif",
        fontSize: 11.5,
        fontWeight: 600,
        letterSpacing: "0.12em",
        textTransform: "uppercase" as const,
        color: isDark ? "rgba(255,255,255,0.65)" : "var(--c-heading)",
        userSelect: "none" as const,
      }}
    >
      <span style={{ fontSize: 7, lineHeight: 1, color: isDark ? "rgba(255,255,255,0.65)" : "var(--c-heading)" }}>●</span>
      {children}
    </div>
  )
}
