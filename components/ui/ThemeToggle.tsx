"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { AnimatePresence, motion } from "framer-motion";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Render a size-stable placeholder during SSR to avoid layout shift
  if (!mounted) {
    return (
      <div
        className="w-9 h-9 rounded-lg"
        style={{ border: "1px solid var(--border-strong)", background: "var(--elevated)" }}
      />
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="w-9 h-9 flex items-center justify-center rounded-lg transition-all duration-200 relative hover:opacity-80"
      style={{
        border:      "1px solid var(--border-strong)",
        background:  "var(--elevated)",
      }}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={isDark ? "sun" : "moon"}
          initial={{ opacity: 0, rotate: -20, scale: 0.7 }}
          animate={{ opacity: 1, rotate: 0,  scale: 1 }}
          exit={{    opacity: 0, rotate: 20,  scale: 0.7 }}
          transition={{ duration: 0.15 }}
          className="absolute"
        >
          {isDark
            ? <Sun  className="w-[15px] h-[15px] text-amber-400" />
            : <Moon className="w-[15px] h-[15px]" style={{ color: "#0038FF" }} />
          }
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
