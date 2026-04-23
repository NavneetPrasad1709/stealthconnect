"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { m, AnimatePresence } from "framer-motion";
import { ArrowRight, Sparkles, X } from "lucide-react";

const GF = '"Arial Black", Impact, sans-serif';
const F = "var(--font-montserrat,'Montserrat',sans-serif)";

// Chat button sits at bottom:24px (1.5rem), height:46px — place SpinBadge 10px above it
const BOTTOM_PX = 24 + 46 + 10; // 80px

export function FloatingConsultButtonWrapper() {
  const pathname = usePathname();
  const router = useRouter();
  const [inHero,    setInHero]    = useState(true);
  const [isDesktop, setIsDesktop] = useState(false);
  const [mounted,   setMounted]   = useState(false);
  const [open,      setOpen]      = useState(false);

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

  // Close card on route change
  useEffect(() => { setOpen(false); }, [pathname]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (!mounted) return null;
  if (pathname.startsWith("/dashboard")) return null;

  const heroSize  = isDesktop ? 96 : 80;
  const smallSize = 46;
  const btnSize   = inHero ? heroSize : smallSize;
  const arrowSize = inHero ? (isDesktop ? 28 : 24) : 16;

  const handleCTA = () => {
    setOpen(false);
    router.push("/signup");
  };

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {open && (
          <m.div
            key="fab-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[45]"
            style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)" }}
            onClick={() => setOpen(false)}
            aria-hidden
          />
        )}
      </AnimatePresence>

      {/* Attached card — anchored to FAB, opens above it */}
      <AnimatePresence>
        {open && (
          <m.div
            key="fab-card"
            initial={{ opacity: 0, scale: 0.6, y: 24, originX: 1, originY: 1 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.6, y: 24 }}
            transition={{ type: "spring", stiffness: 340, damping: 28 }}
            className="fixed z-[55]"
            style={{
              bottom: BOTTOM_PX + btnSize + 14,
              right: "1.5rem",
              width: "min(320px, calc(100vw - 2rem))",
              transformOrigin: "bottom right",
              background: "linear-gradient(160deg, rgba(20,20,22,0.96) 0%, rgba(12,12,14,0.98) 100%)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 22,
              boxShadow: "0 24px 70px rgba(0,0,0,0.55), 0 4px 18px rgba(204,255,0,0.12)",
              padding: "1.4rem 1.4rem 1.25rem",
              fontFamily: F,
              overflow: "hidden",
            }}
          >
            {/* Accent glow */}
            <div
              aria-hidden
              className="pointer-events-none absolute -top-16 -right-16 w-40 h-40 rounded-full"
              style={{ background: "radial-gradient(circle, rgba(204,255,0,0.22) 0%, transparent 70%)" }}
            />

            {/* Close */}
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="absolute top-3 right-3 flex items-center justify-center rounded-full transition-colors"
              style={{
                width: 28, height: 28,
                color: "rgba(255,255,255,0.55)",
                background: "rgba(255,255,255,0.05)",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.12)")}
              onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
            >
              <X className="w-4 h-4" />
            </button>

            {/* Badge */}
            <m.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full mb-3"
              style={{
                background: "rgba(204,255,0,0.1)",
                border: "1px solid rgba(204,255,0,0.25)",
              }}
            >
              <Sparkles className="w-3 h-3" style={{ color: "#CCFF00" }} />
              <span style={{ fontSize: 10.5, fontWeight: 800, color: "#CCFF00", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                Limited Offer
              </span>
            </m.div>

            {/* Heading */}
            <m.h3
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.14 }}
              style={{
                fontSize: "1.35rem",
                fontWeight: 800,
                color: "#fff",
                lineHeight: 1.2,
                letterSpacing: "-0.02em",
                margin: 0,
              }}
            >
              Start finding verified contacts today.
            </m.h3>

            {/* Description */}
            <m.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              style={{
                fontSize: "0.8rem",
                lineHeight: 1.55,
                color: "rgba(255,255,255,0.55)",
                margin: "8px 0 16px",
              }}
            >
              No credit card required. Claim your free credit and unlock contact search instantly.
            </m.p>

            {/* CTA */}
            <m.button
              type="button"
              onClick={handleCTA}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.26 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="w-full flex items-center justify-center gap-2 rounded-full cursor-pointer"
              style={{
                background: "#CCFF00",
                color: "#000",
                fontWeight: 800,
                fontSize: "0.9rem",
                padding: "13px 18px",
                border: "none",
                boxShadow: "0 6px 20px rgba(204,255,0,0.35)",
                fontFamily: F,
                letterSpacing: "-0.01em",
              }}
            >
              Get your first credit free
              <ArrowRight className="w-4 h-4" strokeWidth={3} />
            </m.button>

            {/* Micro copy */}
            <p
              style={{
                fontSize: 11,
                color: "rgba(255,255,255,0.3)",
                textAlign: "center",
                marginTop: 10,
                marginBottom: 0,
              }}
            >
              Takes 20 seconds · No spam
            </p>
          </m.div>
        )}
      </AnimatePresence>

      {/* Floating button */}
      <m.div
        className="fixed z-[50]"
        style={{ bottom: BOTTOM_PX, right: "1.5rem" }}
        initial={{ opacity: 0, scale: 0.5, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.5, type: "spring", stiffness: 260, damping: 20 }}
      >
        <button
          type="button"
          onClick={() => setOpen(v => !v)}
          aria-label="Start Free"
          aria-expanded={open}
          className="block p-0 border-0 bg-transparent"
        >
          <m.div
            animate={{
              width: btnSize,
              height: btnSize,
              rotate: open ? 0 : (inHero ? -8 : 0),
            }}
            transition={{ type: "spring", stiffness: 280, damping: 26 }}
            className="relative bg-[#CCFF00] rounded-full flex items-center justify-center cursor-pointer overflow-hidden"
            style={{ boxShadow: "0 8px 32px rgba(204,255,0,0.5), 0 2px 8px rgba(0,0,0,0.25)" }}
            whileHover={{ scale: 1.1, rotate: 0 }}
            whileTap={{ scale: 0.95 }}
          >
            {/* Spinning text ring — hero only, hidden while card open */}
            <AnimatePresence>
              {inHero && !open && (
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

            {/* Center icon — morphs between arrow and X */}
            <m.div
              animate={{ width: arrowSize, height: arrowSize, rotate: open ? 180 : 0 }}
              transition={{ type: "spring", stiffness: 280, damping: 26 }}
              className="relative z-10 flex items-center justify-center text-black"
            >
              {open
                ? <X className="w-full h-full" strokeWidth={3.5} />
                : <ArrowRight className="w-full h-full" strokeWidth={3.5} />}
            </m.div>
          </m.div>
        </button>
      </m.div>
    </>
  );
}
