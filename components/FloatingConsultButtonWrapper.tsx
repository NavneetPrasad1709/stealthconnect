"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { m, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";

const GF = '"Arial Black", Impact, sans-serif';

// Chat button sits at bottom:24px (1.5rem), height:46px — place SpinBadge 10px above it
const BOTTOM_PX = 24 + 46 + 10; // 80px

export function FloatingConsultButtonWrapper() {
  const [inHero,    setInHero]    = useState(true);
  const [isDesktop, setIsDesktop] = useState(false);
  const [mounted,   setMounted]   = useState(false);

  useEffect(() => {
    setMounted(true);

    const onScroll = () => setInHero(window.scrollY < window.innerHeight * 0.75);
    const onResize = () => setIsDesktop(window.innerWidth >= 768);

    onScroll();
    onResize();

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  if (!mounted) return null;

  const heroSize  = isDesktop ? 96 : 80;
  const smallSize = 46;
  const btnSize   = inHero ? heroSize : smallSize;
  const arrowSize = inHero ? (isDesktop ? 28 : 24) : 16;

  return (
    <m.div
      className="fixed z-50"
      style={{ bottom: BOTTOM_PX, right: "1.5rem" }}
      initial={{ opacity: 0, scale: 0.5, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: 1.2, duration: 0.5, type: "spring", stiffness: 260, damping: 20 }}
    >
      <Link href="/signup" className="block" aria-label="Start Free">
        <m.div
          animate={{ width: btnSize, height: btnSize, rotate: inHero ? -8 : 0 }}
          transition={{ type: "spring", stiffness: 280, damping: 26 }}
          className="relative bg-[#CCFF00] rounded-full flex items-center justify-center cursor-pointer overflow-hidden"
          style={{ boxShadow: "0 8px 32px rgba(204,255,0,0.5), 0 2px 8px rgba(0,0,0,0.25)" }}
          whileHover={{ scale: 1.1, rotate: 0 }}
          whileTap={{ scale: 0.95 }}
        >
          {/* Spinning text ring — hero only */}
          <AnimatePresence>
            {inHero && (
              <m.div
                key="ring"
                className="absolute inset-0.5 animate-[spin_10s_linear_infinite] pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <path id="floatSpinPath" d="M 50,50 m -34,0 a 34,34 0 1,1 68,0 a 34,34 0 1,1 -68,0" fill="none" />
                  <text fill="black" style={{ fontSize: 10, fontFamily: GF, fontWeight: 900, letterSpacing: "0.2em" }}>
                    <textPath href="#floatSpinPath" startOffset="0%">START FREE • START FREE •&nbsp;</textPath>
                  </text>
                </svg>
              </m.div>
            )}
          </AnimatePresence>

          {/* Center arrow */}
          <m.div
            animate={{ width: arrowSize, height: arrowSize }}
            transition={{ type: "spring", stiffness: 280, damping: 26 }}
            className="relative z-10 flex items-center justify-center text-black"
          >
            <ArrowRight className="w-full h-full" strokeWidth={3.5} />
          </m.div>
        </m.div>
      </Link>
    </m.div>
  );
}
