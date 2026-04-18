"use client"

import React, { useRef, useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { Zap, ArrowRight, Sun, Moon, Menu, X } from "lucide-react"
import { useTheme } from "next-themes"

/* ─── tokens ────────────────────────────────────────────── */
const F = "var(--font-montserrat,'Montserrat',sans-serif)"

const LINKS = [
  { label: "How it works", href: "#how-it-works" },
  { label: "Features",     href: "#features"     },
  { label: "Pricing",      href: "#pricing"      },
  { label: "Testimonials", href: "#testimonials" },
]

/* ═══════════════════════════════════════════════════════════
   21st.dev · abdulali254/nav-header — sliding pill mechanic
═══════════════════════════════════════════════════════════ */
type Pos = { left: number; width: number; opacity: number }

function Tab({
  href, children, setPos,
}: {
  href: string
  children: React.ReactNode
  setPos: (p: Pos) => void
}) {
  const ref = useRef<HTMLLIElement>(null)

  return (
    <li
      ref={ref}
      onMouseEnter={() => {
        if (!ref.current) return
        const { width } = ref.current.getBoundingClientRect()
        setPos({ width, opacity: 1, left: ref.current.offsetLeft })
      }}
      className="relative z-10 select-none"
    >
      <a
        href={href}
        style={{ fontFamily: F, color: "rgba(255,255,255,0.52)", fontSize: 13, fontWeight: 500, transition: "color .15s" }}
        className="block px-4 py-2 whitespace-nowrap hover:text-white"
        onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,.92)")}
        onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,.52)")}
      >
        {children}
      </a>
    </li>
  )
}

function PillNav() {
  const [pos, setPos] = useState<Pos>({ left: 0, width: 0, opacity: 0 })

  return (
    /* exact pattern from 21st.dev — relative ul, w-fit, rounded-full, border, p-1 */
    <ul
      className="relative hidden md:flex w-fit items-center rounded-full p-1"
      style={{ border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)" }}
      onMouseLeave={() => setPos(p => ({ ...p, opacity: 0 }))}
    >
      {LINKS.map(l => (
        <Tab key={l.href} href={l.href} setPos={setPos}>{l.label}</Tab>
      ))}

      {/* sliding cursor */}
      <motion.li
        animate={pos}
        transition={{ type: "spring", stiffness: 420, damping: 36 }}
        aria-hidden
        className="absolute z-0 rounded-full pointer-events-none"
        style={{ top: 4, bottom: 4, background: "rgba(255,255,255,0.11)", border: "1px solid rgba(255,255,255,0.15)" }}
      />
    </ul>
  )
}

/* ─── Theme toggle ──────────────────────────────────────── */
function ThemeBtn() {
  const { resolvedTheme, setTheme } = useTheme()
  const [ok, setOk] = useState(false)
  useEffect(() => setOk(true), [])

  const base = "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all duration-150 hover:scale-110 active:scale-95"
  const style = { background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" } as React.CSSProperties

  if (!ok) return <div className={base} style={style} />

  const dark = resolvedTheme === "dark"
  return (
    <button onClick={() => setTheme(dark ? "light" : "dark")}
      aria-label="Toggle theme" className={base} style={style}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.span key={dark ? "sun" : "moon"}
          initial={{ opacity: 0, y: 6, scale: .6 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -6, scale: .6 }}
          transition={{ duration: .18, ease: [.22,1,.36,1] }}
          className="absolute flex items-center justify-center">
          {dark ? <Sun size={14} className="text-amber-300" /> : <Moon size={14} className="text-blue-300" />}
        </motion.span>
      </AnimatePresence>
    </button>
  )
}

/* ─── Hamburger ─────────────────────────────────────────── */
function Burger({ open, toggle }: { open: boolean; toggle(): void }) {
  return (
    <button onClick={toggle} aria-label={open ? "Close" : "Menu"}
      className="md:hidden w-9 h-9 flex flex-col items-center justify-center gap-[5px] rounded-xl shrink-0"
      style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}>
      {(["t","m","b"] as const).map(k => (
        <motion.span key={k}
          className="block h-[1.5px] rounded-full"
          style={{ background: "rgba(255,255,255,0.9)", originX:.5, originY:.5,
            ...(k === "m" ? { width: 11 } : { width: 16 }) }}
          animate={
            k === "t" ? (open ? { rotate:  45, y:  6.5, width: 16 } : { rotate: 0, y: 0, width: 16 }) :
            k === "m" ? (open ? { opacity:  0, scaleX: 0 }          : { opacity: 1, scaleX: 1 })       :
                        (open ? { rotate: -45, y: -6.5, width: 16 } : { rotate: 0, y: 0, width: 16 })
          }
          transition={k === "m" ? { duration:.16 } : { duration:.26, ease:[.22,1,.36,1] }}
        />
      ))}
    </button>
  )
}

/* ─── Mobile full-screen drawer ─────────────────────────── */
function Drawer({ open, close }: { open: boolean; close(): void }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div key="drawer"
          initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
          transition={{ duration: .28, ease: [.16,1,.3,1] }}
          className="fixed inset-0 z-[60] md:hidden flex flex-col overflow-hidden"
          style={{ background: "#060606" }}>

          {/* grid texture */}
          <div aria-hidden className="absolute inset-0 pointer-events-none" style={{
            backgroundImage: "radial-gradient(rgba(255,255,255,0.028) 1px,transparent 1px)",
            backgroundSize: "28px 28px" }} />
          {/* blue glow */}
          <div aria-hidden className="absolute pointer-events-none" style={{
            top:-180, left:"50%", transform:"translateX(-50%)",
            width:640, height:440,
            background:"radial-gradient(ellipse at top,rgba(0,56,255,0.22) 0%,transparent 65%)",
            filter:"blur(56px)" }} />

          {/* top bar */}
          <div className="relative z-10 flex items-center justify-between px-5 py-4 shrink-0"
            style={{ borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
            <Link href="/" onClick={close} className="flex items-center gap-2" style={{ textDecoration:"none" }}>
              <div className="w-7 h-7 rounded-[9px] flex items-center justify-center"
                style={{ background:"var(--brand)", boxShadow:"0 0 16px rgba(0,56,255,0.55)" }}>
                <Zap className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
              </div>
              <span className="text-[15px] font-black" style={{ fontFamily:F, color:"#fff", letterSpacing:"-0.025em" }}>
                Stealth<span style={{ color:"rgba(255,255,255,0.35)" }}>Connect</span>
              </span>
            </Link>
            <div className="flex items-center gap-2">
              <ThemeBtn />
              <button onClick={close} aria-label="Close"
                className="w-8 h-8 flex items-center justify-center rounded-xl"
                style={{ background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", color:"rgba(255,255,255,0.55)" }}>
                <X size={15} />
              </button>
            </div>
          </div>

          {/* nav links */}
          <nav className="relative z-10 flex-1 flex flex-col justify-center px-6 gap-0.5">
            {LINKS.map((item, i) => (
              <motion.a key={item.href} href={item.href} onClick={close}
                className="group flex items-baseline gap-4 py-4"
                style={{ borderBottom:"1px solid rgba(255,255,255,0.05)", textDecoration:"none" }}
                initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }}
                transition={{ delay:.05 + i*.06, duration:.32, ease:[.22,1,.36,1] }}>
                <span style={{ fontFamily:F, fontSize:10, fontWeight:700, letterSpacing:"0.1em",
                  color:"rgba(0,56,255,0.65)", minWidth:20 }}>
                  {String(i+1).padStart(2,"0")}
                </span>
                <span className="text-[clamp(1.6rem,7vw,2.1rem)] font-bold leading-none transition-colors duration-150"
                  style={{ fontFamily:F, color:"rgba(255,255,255,0.82)", letterSpacing:"-0.025em" }}
                  onMouseEnter={e=>(e.currentTarget.style.color="#fff")}
                  onMouseLeave={e=>(e.currentTarget.style.color="rgba(255,255,255,0.82)")}>
                  {item.label}
                </span>
              </motion.a>
            ))}
          </nav>

          {/* footer CTAs */}
          <motion.div className="relative z-10 px-5 pt-4 pb-10 flex flex-col gap-2.5 shrink-0"
            style={{ borderTop:"1px solid rgba(255,255,255,0.06)" }}
            initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
            transition={{ delay:.28, duration:.28, ease:[.22,1,.36,1] }}>
            <Link href="/auth/signup" onClick={close}
              className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl text-white text-[14px] font-semibold"
              style={{ background:"var(--brand)", fontFamily:F, textDecoration:"none",
                boxShadow:"0 6px 24px rgba(0,56,255,0.45)" }}>
              Get Started Free <ArrowRight size={15} strokeWidth={2.5} />
            </Link>
            <Link href="/auth/login" onClick={close}
              className="flex items-center justify-center w-full py-3.5 rounded-xl text-[14px] font-medium"
              style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.09)",
                color:"rgba(255,255,255,0.55)", fontFamily:F, textDecoration:"none" }}>
              Sign In
            </Link>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/* ═══════════════════════════════════════════════════════════
   Navbar — 1fr [logo] | auto [pill nav] | 1fr [actions]
   guarantees pill is always geometrically centred
═══════════════════════════════════════════════════════════ */
export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open,     setOpen]     = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20)
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
      <header className="fixed top-0 inset-x-0 z-50 px-4 pt-3">
        <motion.nav
          animate={{
            boxShadow: scrolled ? "0 8px 40px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.06)" : "0 2px 20px rgba(0,0,0,0.3)",
            borderColor: scrolled ? "rgba(255,255,255,0.11)" : "rgba(255,255,255,0.07)",
          }}
          transition={{ duration:.3, ease:[.16,1,.3,1] }}
          className="mx-auto h-[54px] px-4"
          style={{
            maxWidth: 1180,
            borderRadius: 30,
            border: "1px solid rgba(255,255,255,0.07)",
            background: "rgba(7,7,7,0.85)",
            backdropFilter: "blur(24px) saturate(160%)",
            WebkitBackdropFilter: "blur(24px) saturate(160%)",
            /* 3-column grid: logo | nav | actions */
            display: "grid",
            gridTemplateColumns: "1fr auto 1fr",
            alignItems: "center",
            gap: 16,
          }}
        >
          {/* ── LEFT — Logo ──────────────────────────────── */}
          <Link href="/" className="flex items-center gap-2 min-w-0" style={{ textDecoration:"none" }}>
            <motion.div whileHover={{ scale:.9 }} whileTap={{ scale:.85 }}
              className="w-[30px] h-[30px] rounded-[9px] flex items-center justify-center shrink-0"
              style={{ background:"var(--brand)", boxShadow:"0 0 18px rgba(0,56,255,0.55)" }}>
              <Zap className="w-[15px] h-[15px] text-white" strokeWidth={2.5} />
            </motion.div>
            <span className="text-[14.5px] font-black hidden sm:block truncate"
              style={{ fontFamily:F, letterSpacing:"-0.025em" }}>
              <span style={{ color:"#fff" }}>Stealth</span>
              <span style={{ color:"rgba(255,255,255,0.35)" }}>Connect</span>
            </span>
          </Link>

          {/* ── CENTER — Sliding pill nav (21st.dev) ─────── */}
          <PillNav />

          {/* ── RIGHT — Actions ──────────────────────────── */}
          <div className="flex items-center justify-end gap-1.5">

            {/* desktop */}
            <div className="hidden md:flex items-center gap-1.5">
              <ThemeBtn />

              <div className="w-px h-4 mx-1" style={{ background:"rgba(255,255,255,0.1)" }} />

              <a href="/auth/login"
                className="px-3.5 py-[7px] rounded-lg text-[13px] font-medium transition-all duration-150"
                style={{ color:"rgba(255,255,255,0.52)", fontFamily:F, textDecoration:"none" }}
                onMouseEnter={e=>{e.currentTarget.style.color="rgba(255,255,255,.9)";e.currentTarget.style.background="rgba(255,255,255,.06)"}}
                onMouseLeave={e=>{e.currentTarget.style.color="rgba(255,255,255,.52)";e.currentTarget.style.background="transparent"}}>
                Sign In
              </a>

              <motion.div whileHover={{ scale:1.04 }} whileTap={{ scale:.97 }}>
                <Link href="/auth/signup"
                  className="flex items-center gap-1.5 px-4 py-[8px] rounded-lg text-[13px] font-semibold text-white"
                  style={{ background:"var(--brand)", fontFamily:F, textDecoration:"none",
                    boxShadow:"0 4px 16px rgba(0,56,255,0.5), 0 1px 3px rgba(0,56,255,0.3)" }}
                  onMouseEnter={e=>{const el=e.currentTarget as HTMLElement;el.style.background="#002fee";el.style.boxShadow="0 6px 24px rgba(0,56,255,0.65)"}}
                  onMouseLeave={e=>{const el=e.currentTarget as HTMLElement;el.style.background="var(--brand)";el.style.boxShadow="0 4px 16px rgba(0,56,255,0.5), 0 1px 3px rgba(0,56,255,0.3)"}}>
                  Get Started
                  <ArrowRight className="w-3.5 h-3.5" strokeWidth={2.5} />
                </Link>
              </motion.div>
            </div>

            {/* mobile */}
            <div className="md:hidden flex items-center gap-2">
              <ThemeBtn />
              <Burger open={open} toggle={() => setOpen(v => !v)} />
            </div>
          </div>
        </motion.nav>
      </header>

      <Drawer open={open} close={() => setOpen(false)} />
    </>
  )
}
