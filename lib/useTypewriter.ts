"use client";

import { useState, useEffect } from "react";

export function useTypewriter(phrases: string[], pause = 2600) {
  const [idx,       setIdx]       = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [deleting,  setDeleting]  = useState(false);

  useEffect(() => {
    const full = phrases[idx];
    if (!full) return;
    if (!deleting && displayed.length < full.length) {
      const t = setTimeout(() => setDisplayed(full.slice(0, displayed.length + 1)), 46);
      return () => clearTimeout(t);
    }
    if (!deleting && displayed.length === full.length) {
      const t = setTimeout(() => setDeleting(true), pause);
      return () => clearTimeout(t);
    }
    if (deleting && displayed.length > 0) {
      const t = setTimeout(() => setDisplayed(full.slice(0, displayed.length - 1)), 22);
      return () => clearTimeout(t);
    }
    if (deleting && displayed.length === 0) {
      setDeleting(false);
      setIdx((idx + 1) % phrases.length);
    }
  }, [displayed, deleting, idx, phrases, pause]);

  return displayed;
}