"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";

const FONT_DISPLAY = "var(--font-montserrat, 'Montserrat', sans-serif)";

interface Props {
  initials: string;
  gradient: string;
  name: string;
  title: string;
  company: string;
  delay?: number;
  floatDir?: 1 | -1;
  className?: string;
}

export function ContactCard({
  initials, gradient, name, title, company, delay = 0, floatDir = 1, className,
}: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1,  y: 0,  scale: 1 }}
      transition={{ delay: 0.9 + delay, duration: 0.6, ease: [0.22,1,0.36,1] }}
      className={`absolute hidden lg:block ${className ?? ""}`}
    >
      <motion.div
        animate={{ y: [0, floatDir * -9, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay }}
        className="w-52 rounded-2xl overflow-hidden"
        style={{
          background:     "#0d0f14",
          border:         "1px solid rgba(255,255,255,0.09)",
          backdropFilter: "blur(24px)",
          boxShadow:      "0 24px 48px -8px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)",
          fontFamily:     FONT_DISPLAY,
        }}
      >
        {/* Card header */}
        <div className="flex items-center gap-2.5 px-4 pt-4 pb-3">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-black text-white shrink-0"
            style={{ background: gradient }}
          >
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-[12.5px] font-semibold truncate" style={{ color: "#f1f5f9" }}>{name}</p>
            <p className="text-[10.5px] truncate mt-0.5" style={{ color: "rgba(255,255,255,0.38)" }}>
              {title} · {company}
            </p>
          </div>
        </div>

        {/* Fields */}
        <div className="px-3 pb-3 space-y-1.5">
          {[{ label: "Email", w: 80 }, { label: "Phone", w: 58 }].map(({ label, w }) => (
            <div
              key={label}
              className="flex items-center justify-between px-2.5 py-1.5 rounded-lg"
              style={{ background: "rgba(255,255,255,0.05)" }}
            >
              <span className="text-[10px] font-medium" style={{ color: "rgba(255,255,255,0.32)" }}>{label}</span>
              <div className="h-[5px] rounded-full" style={{ width: w, background: "rgba(255,255,255,0.12)" }} />
            </div>
          ))}
        </div>

        {/* Verified badge */}
        <div className="px-3 pb-3">
          <div
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg w-fit"
            style={{
              background: "rgba(59,130,246,0.15)",
              border:     "1px solid rgba(59,130,246,0.28)",
            }}
          >
            <Check className="w-2.5 h-2.5 shrink-0" style={{ color: "#60a5fa" }} strokeWidth={3} />
            <span className="text-[10px] font-bold" style={{ color: "#60a5fa" }}>Verified contact</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
