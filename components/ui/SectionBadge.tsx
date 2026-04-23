import React from "react"

interface SectionBadgeProps {
  children: React.ReactNode
  /** "light" = dark border on light bg (default) | "dark" = white border on dark bg */
  variant?: "light" | "dark"
  className?: string
  style?: React.CSSProperties
}

export function SectionBadge({ children, variant = "light", className = "", style }: SectionBadgeProps) {
  const isDark = variant === "dark"
  return (
    <div
      className={`inline-flex items-center gap-[7px] ${className}`}
      style={{
        padding: "6px 16px",
        borderRadius: 999,
        border: `1.5px solid ${isDark ? "rgba(255,255,255,0.35)" : "var(--c-heading)"}`,
        fontFamily: "var(--font-montserrat), 'Montserrat', sans-serif",
        fontSize: 24,
        fontWeight: 700,
        letterSpacing: "normal",
        textTransform: "none" as const,
        color: isDark ? "#ffffff" : "var(--c-heading)",
        userSelect: "none" as const,
        ...style,
      }}
    >
      <span aria-hidden="true" style={{ fontSize: 7, lineHeight: 1, color: isDark ? "#ffffff" : "var(--c-heading)" }}>●</span>
      {children}
    </div>
  )
}
