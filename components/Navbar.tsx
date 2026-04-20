"use client"

import React, { useRef, useState, useEffect } from "react"
import { m, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { Zap, ArrowRight, Sun, Moon, X } from "lucide-react"
import { useTheme } from "next-themes"

const F = "var(--font-montserrat,'Montserrat',sans-serif)"

const LINKS = [
  { label: "How it works", href: "/#how-it-works" },
  { label: "Features",     href: "/#features"     },
  { label: "Pricing",      href: "/#pricing"      },
  { label: "Testimonials", href: "/#testimonials" },
]

/* ─── Sliding pill tab ──────────────────────────────────── */
type Pos = { left: number; width: number; opacity: number }

function Tab({ href, children, setPos }: {
  href: string; children: React.ReactNode; setPos: (p: Pos) => void
}) {
  const ref = useRef<HTMLLIElement>(null)
  return (
    <li ref={ref} onMouseEnter={() => {
      if (!ref.current) return
      const { width } = ref.current.getBoundingClientRect()
      setPos({ width, opacity: 1, left: ref.current.offsetLeft })
    }} className="relative z-10 select-none">
      <a href={href}
        style={{ fontFamily: F, color: "white", fontSize: 15, fontWeight: 500 }}
        className="block px-4 py-2 whitespace-nowrap transition-colors duration-150"
        onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,.92)")}
        onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,.5)")}>
        {children}
      </a>
    </li>
  )
}

function PillNav() {
  const [pos, setPos] = useState<Pos>({ left: 0, width: 0, opacity: 0 })
  return (
    <ul className="relative hidden md:flex w-fit items-center rounded-full p-1"
      onMouseLeave={() => setPos(p => ({ ...p, opacity: 0 }))}>
      {LINKS.map(l => <Tab key={l.href} href={l.href} setPos={setPos}>{l.label}</Tab>)}
      <m.li animate={pos} transition={{ type: "spring", stiffness: 400, damping: 34 }}
        aria-hidden className="absolute z-0 rounded-full pointer-events-none"
        style={{ top: 4, bottom: 4, background: "rgba(255,255,255,0.09)", border: "1px solid rgba(255,255,255,0.13)" }} />
    </ul>
  )
}

/* ─── Theme toggle ──────────────────────────────────────── */
function ThemeBtn({ size = 32 }: { size?: number }) {
  const { resolvedTheme, setTheme } = useTheme()
  const [ok, setOk] = useState(false)
  useEffect(() => setOk(true), [])

  const s = { width: size, height: size, borderRadius: 999, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.06)", flexShrink: 0 } as React.CSSProperties
  if (!ok) return <div style={s} />

  const dark = resolvedTheme === "dark"
  return (
    <button onClick={() => setTheme(dark ? "light" : "dark")} aria-label="Toggle theme"
      className="relative flex items-center justify-center transition-opacity duration-150 hover:opacity-80"
      style={s}>
      <AnimatePresence mode="wait" initial={false}>
        <m.span key={dark ? "sun" : "moon"}
          initial={{ opacity: 0, scale: 0.4, rotate: -45 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          exit={{ opacity: 0, scale: 0.4, rotate: 45 }}
          transition={{ duration: .16 }}
          className="absolute flex items-center justify-center">
          {dark
            ? <Sun size={13} className="text-amber-300" />
            : <Moon size={13} style={{ color: "#60a5fa" }} />}
        </m.span>
      </AnimatePresence>
    </button>
  )
}

/* ─── Mobile bottom-sheet drawer ───────────────────────── */
function Drawer({ open, close }: { open: boolean; close(): void }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* backdrop */}
          <m.div key="bd" onClick={close}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: .22 }}
            className="fixed inset-0 z-[58] md:hidden"
            style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)" }} />

          {/* sheet */}
          <m.div key="sheet"
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 360, damping: 34, mass: 0.75 }}
            className="fixed bottom-0 inset-x-0 z-[59] md:hidden"
            style={{
              borderRadius: "28px 28px 0 0",
              background: "#080808",
              border: "1px solid rgba(255,255,255,0.1)",
              borderBottom: "none",
              overflow: "hidden",
            }}>

            {/* drag handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-9 h-[3px] rounded-full" style={{ background: "rgba(255,255,255,0.18)" }} />
            </div>

            {/* header row */}
            <div className="flex items-center justify-between px-5 py-3"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <Link href="/" onClick={close} className="flex items-center gap-2" style={{ textDecoration: "none" }}>
                <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: "var(--brand)", boxShadow: "0 0 14px rgba(0,56,255,0.5)" }}>
                  <Zap className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
                </div>
                <span className="text-[15px] font-black" style={{ fontFamily: F, color: "#fff", letterSpacing: "-0.03em" }}>
                  Stealth<span style={{ color: "rgba(255,255,255,0.3)" }}>Connect</span>
                </span>
              </Link>
              <div className="flex items-center gap-2">
                <ThemeBtn />
                <button onClick={close} aria-label="Close"
                  className="w-8 h-8 flex items-center justify-center rounded-full"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
                  <X size={14} style={{ color: "rgba(255,255,255,0.6)" }} />
                </button>
              </div>
            </div>

            {/* nav links */}
            <nav className="px-4 py-3 space-y-0.5">
              {LINKS.map((item, i) => (
                <m.a key={item.href} href={item.href} onClick={close}
                  className="flex items-center justify-between px-4 py-3.5 rounded-2xl group"
                  style={{ textDecoration: "none", background: "transparent" }}
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: .04 + i * .04, duration: .22, ease: [.22, 1, .36, 1] }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)"}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}>
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-bold tabular-nums" style={{ color: "rgba(0,56,255,0.7)", fontFamily: F }}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="text-[15px] font-600" style={{ fontFamily: F, color: "rgba(255,255,255,0.82)", letterSpacing: "-0.01em" }}>
                      {item.label}
                    </span>
                  </div>
                  
                </m.a>
              ))}
            </nav>

            {/* CTAs */}
            <m.div className="px-5 pt-3 pb-10 space-y-2.5"
              style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: .2, duration: .24 }}>
              <Link href="/signup" onClick={close}
                className="flex items-center justify-center gap-2 w-full py-3.5 rounded-full text-[14px] font-semibold text-white"
                style={{ background: "var(--brand)", fontFamily: F, textDecoration: "none", boxShadow: "0 6px 28px rgba(0,56,255,0.45)" }}>
                Get Started Free 
              </Link>
              <Link href="/login" onClick={close}
                className="flex items-center justify-center w-full py-3.5 rounded-full text-[14px] font-medium"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.65)", fontFamily: F, textDecoration: "none" }}>
                Sign In
              </Link>
            </m.div>
          </m.div>
        </>
      )}
    </AnimatePresence>
  )
}

/* ═══════════════════════════════════════════════════════════
   Main Navbar — full capsule shape
═══════════════════════════════════════════════════════════ */
export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24)
    window.addEventListener("scroll", fn, { passive: true })
    fn()
    return () => window.removeEventListener("scroll", fn)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [open])

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-50 px-4 pt-4">
        <m.nav
          animate={{
            boxShadow: scrolled
              ? "0 8px 40px rgba(0,0,0,0.6), 0 2px 8px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.07)"
              : "0 2px 16px rgba(0,0,0,0.2)",
            borderColor: scrolled ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.07)",
          }}
          transition={{ duration: .28 }}
          className="mx-auto h-[52px] px-3 flex items-center"
          style={{
            maxWidth: 1100,
            borderRadius: 999,
            border: "1px solid rgba(255,255,255,0.07)",
            background: "rgba(6,6,6,0.88)",
            backdropFilter: "blur(24px) saturate(160%)",
            WebkitBackdropFilter: "blur(24px) saturate(160%)",
          }}>

          {/* LEFT — Logo */}
          <Link href="/" className="flex-1 flex items-center gap-2 pl-2 min-w-0" style={{ textDecoration: "none" }}>
            <m.div whileHover={{ scale: .88 }} whileTap={{ scale: .82 }}
              className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
              style={{ background: "var(--brand)", boxShadow: "0 0 16px rgba(0,56,255,0.48)" }}>
              <Zap className="w-[13px] h-[13px] text-white" strokeWidth={2.5} />
            </m.div>
            <span className="text-[14px] font-black block truncate"
              style={{ fontFamily: F, letterSpacing: "-0.03em" }}>
              <span style={{ color: "#fff" }}>Stealth</span>
              <span style={{ color: "rgba(255,255,255,0.3)" }}>Connect</span>
            </span>
          </Link>

          {/* CENTER — Sliding pill nav */}
          <PillNav />

          {/* RIGHT — Actions */}
          <div className="flex-1 flex items-center justify-end gap-1.5 pr-2">

            {/* desktop */}
            <div className="hidden md:flex items-center gap-1.5">
              <ThemeBtn />

              <div className="w-px h-4 mx-1" style={{ background: "rgba(255,255,255,0.1)" }} />

              <a href="/login"
                className="px-4 py-[6px] rounded-full text-[15px] font-medium transition-all duration-150"
                style={{ color: "white", fontFamily: F, textDecoration: "none", border: "1px solid transparent" }}
                onMouseEnter={e => {
                  e.currentTarget.style.color = "rgba(255,255,255,.9)"
                  e.currentTarget.style.background = "rgba(255,255,255,.06)"
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.color = "rgba(255,255,255,.5)"
                  e.currentTarget.style.background = "transparent"
                  e.currentTarget.style.borderColor = "transparent"
                }}>
                Sign In
              </a>

              <m.div whileHover={{ scale: 1.04 }} whileTap={{ scale: .96 }}>
                <Link href="/signup"
                  className="flex items-center gap-1.5 px-4 py-[6px] rounded-full text-[15px] font-semibold text-white"
                  style={{ background: "var(--brand)", fontFamily: F, textDecoration: "none", boxShadow: "0 4px 16px rgba(0,56,255,0.45)" }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLElement
                    el.style.background = "#002fee"
                    el.style.boxShadow = "0 6px 24px rgba(0,56,255,0.65)"
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLElement
                    el.style.background = "var(--brand)"
                    el.style.boxShadow = "0 4px 16px rgba(0,56,255,0.45)"
                  }}>
                  Get Started

                </Link>
              </m.div>
            </div>

            {/* mobile */}
            <div className="md:hidden flex items-center gap-2">
              <ThemeBtn />
              <button onClick={() => setOpen(v => !v)} aria-label={open ? "Close menu" : "Open menu"}
                className="w-8 h-8 flex flex-col items-center justify-center gap-[5px] rounded-full"
                style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}>
                <m.span className="block h-[1.5px] rounded-full"
                  style={{ background: "rgba(255,255,255,0.85)", originX: .5, originY: .5, width: 15 }}
                  animate={open ? { rotate: 45, y: 6.5 } : { rotate: 0, y: 0 }}
                  transition={{ duration: .22, ease: [.22, 1, .36, 1] }} />
                <m.span className="block h-[1.5px] rounded-full"
                  style={{ background: "rgba(255,255,255,0.45)", width: 10 }}
                  animate={open ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
                  transition={{ duration: .14 }} />
                <m.span className="block h-[1.5px] rounded-full"
                  style={{ background: "rgba(255,255,255,0.85)", originX: .5, originY: .5, width: 15 }}
                  animate={open ? { rotate: -45, y: -6.5 } : { rotate: 0, y: 0 }}
                  transition={{ duration: .22, ease: [.22, 1, .36, 1] }} />
              </button>
            </div>
          </div>
        </m.nav>
      </header>

      <Drawer open={open} close={() => setOpen(false)} />
    </>
  )
}
