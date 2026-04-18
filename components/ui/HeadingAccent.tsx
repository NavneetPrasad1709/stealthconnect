import React from "react"

/** Blue italic accent word(s) within a heading — #0038FF, italic, 800 weight */
export function HeadingAccent({ children }: { children: React.ReactNode }) {
  return (
    <em
      style={{
        color: "#0038FF",
        fontStyle: "italic",
        fontWeight: 800,
        fontFamily: "inherit",
      }}
    >
      {children}
    </em>
  )
}
