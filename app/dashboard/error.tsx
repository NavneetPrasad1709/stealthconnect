"use client";

import { useEffect } from "react";
import { m } from "framer-motion";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-1 items-center justify-center min-h-[60vh] px-6">
      <m.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center max-w-sm"
      >
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-5"
          style={{ background: "rgba(239,68,68,0.12)" }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M10 6v4m0 4h.01M19 10a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h2 className="font-display text-lg font-600 mb-2" style={{ color: "var(--fg)" }}>
          Something went wrong
        </h2>
        <p className="text-sm mb-6" style={{ color: "var(--fg-muted)" }}>
          Failed to load this section. Try again or contact support.
        </p>
        <button
          onClick={reset}
          className="px-5 py-2.5 rounded-lg text-sm font-600 transition-opacity hover:opacity-80"
          style={{ background: "var(--brand)", color: "#fff" }}
        >
          Try again
        </button>
      </m.div>
    </div>
  );
}
