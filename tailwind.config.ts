import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class", "class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // ── Semantic tokens (theme-aware via CSS vars) ──────────────────
        bg:         "var(--bg)",
        surface:    "var(--surface)",
        elevated:   "var(--elevated)",
        fg:         "var(--fg)",
        muted:      "var(--fg-muted)",
        subtle:     "var(--fg-subtle)",
        border:     "var(--border)",
        "border-s": "var(--border-strong)",

        // ── Brand palette ───────────────────────────────────────────────
        brand: {
          DEFAULT: "var(--brand)",
          mid:     "var(--brand-mid)",
          light:   "var(--brand-light)",
          dark:    "var(--brand-dark)",
          50:  "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
        },

        // ── Always-dark palette (footer, auth pages) ────────────────────
        dark: {
          900: "#0a0a0a",
          950: "#000000",
        },
      },

      borderColor: {
        DEFAULT: "var(--border)",
      },

      fontFamily: {
        // Montserrat for headings / display
        display:     ["var(--font-montserrat)", "Montserrat", "system-ui", "sans-serif"],
        montserrat:  ["var(--font-montserrat)", "Montserrat", "system-ui", "sans-serif"],
        // Montserrat for body / content
        body:        ["var(--font-montserrat)", "Montserrat", "system-ui", "sans-serif"],
        poppins:     ["var(--font-montserrat)", "Montserrat", "system-ui", "sans-serif"],
        sans:        ["var(--font-montserrat)", "Montserrat", "system-ui", "sans-serif"],
      },

      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
      },

      borderRadius: {
        xl:   "0.75rem",
        "2xl":"1rem",
        "3xl":"1.25rem",
        pill: "9999px",
      },

      animation: {
        "fade-in":  "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.4s ease-out",
        "pulse-dot":"pulseDot 2s ease-in-out infinite",
      },

      keyframes: {
        fadeIn:   { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        slideUp:  { "0%": { transform: "translateY(20px)", opacity: "0" }, "100%": { transform: "translateY(0)", opacity: "1" } },
        pulseDot: { "0%, 100%": { opacity: "1", transform: "scale(1)" }, "50%": { opacity: "0.5", transform: "scale(0.85)" } },
      },

      boxShadow: {
        card:    "var(--card-shadow)",
        brand:   "var(--shadow-brand)",
        "brand-glow": "0 8px 24px -4px rgba(37,99,235,0.35)",
      },

      transitionTimingFunction: {
        ease: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
