"use client";

import { useEffect } from "react";
import { m } from "framer-motion";

export default function GlobalError({
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
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: "var(--bg)" }}>
      <m.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="text-center max-w-md"
      >
        <p className="text-sm font-medium tracking-widest uppercase mb-6" style={{ color: "#ef4444" }}>
          Error
        </p>
        <h1 className="font-display text-4xl font-700 mb-4" style={{ color: "var(--fg)" }}>
          Something went wrong
        </h1>
        <p className="text-base mb-10" style={{ color: "var(--fg-muted)" }}>
          An unexpected error occurred. Please try again.
        </p>
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-600 transition-opacity hover:opacity-80"
          style={{ background: "var(--brand)", color: "#fff" }}
        >
          Try again
        </button>
      </m.div>
    </div>
  );
}
