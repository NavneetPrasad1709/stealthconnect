'use client';
import React from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { MenuToggleIcon } from '@/components/menu-toggle-icon';
import { useScroll } from '@/components/use-scroll';
import { useTheme } from 'next-themes';
import { Sun, Moon, Zap, ArrowRight } from 'lucide-react';

const FONT = "var(--font-montserrat,'Montserrat',sans-serif)";

const LINKS = [
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Features',     href: '#features'     },
  { label: 'Pricing',      href: '#pricing'       },
  { label: 'Testimonials', href: '#testimonials'  },
];

/* ── Inline theme toggle ─────────────────────────────── */
function ThemeBtn() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div
        className="w-9 h-9 rounded-full shrink-0"
        style={{ background: 'var(--elevated)', border: '1px solid var(--border-strong)' }}
      />
    );
  }

  const dark = resolvedTheme === 'dark';
  return (
    <button
      onClick={() => setTheme(dark ? 'light' : 'dark')}
      aria-label={dark ? 'Switch to light' : 'Switch to dark'}
      className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all hover:scale-105 active:scale-95"
      style={{ background: 'var(--elevated)', border: '1px solid var(--border-strong)' }}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={dark ? 'sun' : 'moon'}
          initial={{ opacity: 0, rotate: -30, scale: 0.6 }}
          animate={{ opacity: 1, rotate: 0,   scale: 1   }}
          exit={{    opacity: 0, rotate:  30,  scale: 0.6 }}
          transition={{ duration: 0.16 }}
          className="flex items-center justify-center"
        >
          {dark
            ? <Sun  size={14} className="text-amber-400" />
            : <Moon size={14} style={{ color: '#0038FF' }} />
          }
        </motion.span>
      </AnimatePresence>
    </button>
  );
}

/* ── Logo ────────────────────────────────────────────── */
function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 shrink-0 group">
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center transition-transform group-hover:scale-95 shrink-0"
        style={{ background: '#0038FF' }}
      >
        <Zap size={15} className="text-white" strokeWidth={2.5} />
      </div>
      <span
        className="hidden sm:block text-[14.5px] font-bold tracking-tight"
        style={{ color: 'var(--fg)', fontFamily: FONT }}
      >
        Stealth<span style={{ color: '#CCFF00' }}>Connect</span>
      </span>
    </Link>
  );
}

/* ══════════════════════════════════════════════════════ */
export function Header() {
  const [open, setOpen] = React.useState(false);
  const scrolled = useScroll(20);

  React.useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 flex justify-center px-4 pt-4',
      )}
    >
      {/* ── Pill nav bar ── */}
      <nav
        className={cn(
          'w-full max-w-5xl h-14 flex items-center justify-between gap-3 px-2 rounded-full border transition-all duration-300',
        )}
        style={{
          fontFamily:           FONT,
          background:           scrolled ? 'var(--glass-bg)'    : 'transparent',
          borderColor:          scrolled ? 'var(--glass-border)' : 'transparent',
          backdropFilter:       scrolled ? 'blur(20px) saturate(180%)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(20px) saturate(180%)' : 'none',
          boxShadow:            scrolled ? '0 4px 24px rgba(0,0,0,0.08)' : 'none',
        }}
      >
        {/* Logo */}
        <div className="pl-2">
          <Logo />
        </div>

        {/* Desktop Links */}
        <ul className="hidden md:flex items-center gap-0.5 flex-1 justify-center">
          {LINKS.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="px-3.5 py-2 text-[13px] font-medium rounded-full transition-colors duration-150"
                style={{ color: 'var(--fg-muted)', fontFamily: FONT }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = 'var(--fg)')}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = 'var(--fg-muted)')}
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        {/* Desktop Right */}
        <div className="hidden md:flex items-center gap-2 pr-1.5 shrink-0">
          <ThemeBtn />
          <Link
            href="/login"
            className="px-4 py-2 text-[13px] font-medium rounded-full transition-colors"
            style={{ color: 'var(--fg-muted)', fontFamily: FONT }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = 'var(--fg)')}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = 'var(--fg-muted)')}
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="flex items-center gap-1.5 px-4 py-[9px] text-[13px] font-black text-black rounded-full transition-all hover:scale-[1.03] active:scale-[0.97]"
            style={{ background: '#CCFF00', boxShadow: '0 2px 14px rgba(204,255,0,0.35)', fontFamily: FONT }}
          >
            Get started
            <ArrowRight size={13} strokeWidth={3} />
          </Link>
        </div>

        {/* Mobile Right */}
        <div className="md:hidden flex items-center gap-2 pr-1.5">
          <ThemeBtn />
          <button
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
            className="w-9 h-9 flex items-center justify-center rounded-full transition-all"
            style={{
              background:   'var(--elevated)',
              border:       '1px solid var(--border-strong)',
              color:        'var(--fg)',
            }}
          >
            <MenuToggleIcon open={open} className="size-4" duration={280} />
          </button>
        </div>
      </nav>

      {/* ── Mobile Full-Screen Menu ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="mob-menu"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{    opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[60] md:hidden flex flex-col"
            style={{ background: 'var(--bg)', fontFamily: FONT }}
          >
            {/* Gradient top accent */}
            <div
              className="absolute top-0 inset-x-0 h-[2px]"
              style={{ background: 'linear-gradient(90deg,#0038FF,#CCFF00,#0038FF)' }}
            />

            {/* Header row */}
            <div
              className="flex items-center justify-between px-5 pt-6 pb-4 shrink-0 relative z-10"
              style={{ borderBottom: '1px solid var(--border)' }}
            >
              <Logo />
              <button
                onClick={() => setOpen(false)}
                className="w-9 h-9 flex items-center justify-center rounded-full"
                style={{ background: 'var(--elevated)', border: '1px solid var(--border-strong)', color: 'var(--fg-muted)' }}
              >
                <MenuToggleIcon open={true} className="size-4" duration={280} />
              </button>
            </div>

            {/* Nav links */}
            <nav className="flex-1 flex flex-col px-6 justify-center gap-0 overflow-y-auto relative z-10">
              {LINKS.map((l, i) => (
                <motion.a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.04 + i * 0.06, duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                  className="flex items-center justify-between py-4 group"
                  style={{ borderBottom: '1px solid var(--border)' }}
                >
                  <span
                    className="text-[26px] font-extrabold tracking-tight leading-none transition-colors"
                    style={{ color: 'var(--fg-muted)' }}
                  >
                    {l.label}
                  </span>
                  <ArrowRight
                    size={18}
                    className="shrink-0 group-hover:translate-x-1 transition-transform"
                    style={{ color: '#CCFF00' }}
                  />
                </motion.a>
              ))}
            </nav>

            {/* Bottom CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.26, duration: 0.24 }}
              className="px-5 pb-10 pt-4 flex flex-col gap-3 shrink-0 relative z-10"
              style={{ borderTop: '1px solid var(--border)' }}
            >
              <div className="flex items-center justify-center gap-2 mb-1">
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#CCFF00' }} />
                <span className="text-[11.5px] font-semibold" style={{ color: 'var(--fg-muted)' }}>
                  1 free lookup · No card required
                </span>
              </div>
              <Link
                href="/signup"
                onClick={() => setOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-[14px] rounded-full text-black text-[15px] font-black transition-all active:scale-[0.98]"
                style={{ background: '#CCFF00', boxShadow: '0 4px 20px rgba(204,255,0,0.3)' }}
              >
                Get started free
                <ArrowRight size={16} strokeWidth={3} />
              </Link>
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="flex items-center justify-center w-full py-[14px] rounded-full text-[15px] font-medium transition-all"
                style={{ border: '1.5px solid var(--border-strong)', color: 'var(--fg-muted)', background: 'var(--elevated)' }}
              >
                Sign in
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
