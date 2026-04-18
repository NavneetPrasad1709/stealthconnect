"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: "var(--bg)" }}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="text-center max-w-md"
      >
        <p className="text-sm font-medium tracking-widest uppercase mb-6" style={{ color: "var(--brand)" }}>
          404
        </p>
        <h1 className="font-display text-4xl font-700 mb-4" style={{ color: "var(--fg)" }}>
          Page not found
        </h1>
        <p className="text-base mb-10" style={{ color: "var(--fg-muted)" }}>
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-600 transition-opacity hover:opacity-80"
          style={{ background: "var(--brand)", color: "#fff" }}
        >
          Back to home
        </Link>
      </motion.div>
    </div>
  );
}
