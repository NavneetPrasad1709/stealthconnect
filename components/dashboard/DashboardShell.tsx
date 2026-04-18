"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  PlusCircle,
  ClipboardList,
  UserCircle,
  Zap,
  X,
  Menu,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

/* ── Config ─────────────────────────────────────────────────── */
const NAV = [
  { label: "Dashboard",    href: "/dashboard",         icon: LayoutDashboard },
  { label: "Submit Order", href: "/dashboard/submit",  icon: PlusCircle      },
  { label: "My Orders",    href: "/dashboard/orders",  icon: ClipboardList   },
  { label: "Account",      href: "/dashboard/account", icon: UserCircle      },
];

const ADMIN_NAV = { label: "Admin Panel", href: "/dashboard/admin", icon: ShieldCheck };

interface Props {
  userName:  string;
  userEmail: string;
  credits:   number;
  isAdmin?:  boolean;
  children:  React.ReactNode;
}

/* ── Root shell ─────────────────────────────────────────────── */
export default function DashboardShell({ userName, userEmail, credits, isAdmin = false, children }: Props) {
  const pathname        = usePathname();
  const [open, setOpen] = useState(false);

  // close on route change
  useEffect(() => { setOpen(false); }, [pathname]);

  // trap scroll when mobile drawer open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const initials = userName
    .split(" ").slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <div className="flex min-h-screen" style={{ background: "var(--bg)" }}>

      {/* ── Desktop sidebar — always visible lg+ ──────────────── */}
      <nav
        aria-label="Sidebar"
        className="hidden lg:flex flex-col fixed inset-y-0 left-0 z-30 w-[220px] shrink-0"
        style={{
          background:  "var(--surface)",
          borderRight: "1px solid var(--border)",
        }}
      >
        <SidebarInner
          pathname={pathname}
          initials={initials}
          userName={userName}
          userEmail={userEmail}
          credits={credits}
          isAdmin={isAdmin}
        />
      </nav>

      {/* ── Mobile drawer ─────────────────────────────────────── */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="overlay"
            className="fixed inset-0 z-40 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(3px)" }}
            onClick={() => setOpen(false)}
          />
        )}
        {open && (
          <motion.nav
            key="drawer"
            aria-label="Mobile sidebar"
            className="fixed inset-y-0 left-0 z-50 flex flex-col w-[260px] lg:hidden"
            initial={{ x: -260 }}
            animate={{ x: 0 }}
            exit={{ x: -260 }}
            transition={{ type: "spring", stiffness: 400, damping: 40 }}
            style={{
              background:  "var(--surface)",
              borderRight: "1px solid var(--border)",
            }}
          >
            {/* Close btn */}
            <button
              onClick={() => setOpen(false)}
              className="absolute top-3.5 right-3 w-7 h-7 flex items-center justify-center rounded-lg"
              style={{
                background: "var(--elevated)",
                border:     "1px solid var(--border-strong)",
              }}
              aria-label="Close sidebar"
            >
              <X className="w-3.5 h-3.5" style={{ color: "var(--fg-muted)" }} />
            </button>

            <SidebarInner
              pathname={pathname}
              initials={initials}
              userName={userName}
              userEmail={userEmail}
              credits={credits}
              isAdmin={isAdmin}
              onNavClick={() => setOpen(false)}
            />
          </motion.nav>
        )}
      </AnimatePresence>

      {/* ── Main area ─────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-h-screen lg:pl-[220px]">

        {/* Topbar */}
        <header
          className="sticky top-0 z-20 flex items-center justify-between px-4 sm:px-6 h-14"
          style={{
            background:     "var(--glass-bg)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            borderBottom:   "1px solid var(--border)",
          }}
        >
          {/* Left: hamburger + logo (mobile), or page label (desktop) */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setOpen(true)}
              className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg"
              style={{
                background: "var(--elevated)",
                border:     "1px solid var(--border-strong)",
              }}
              aria-label="Open menu"
            >
              <Menu className="w-4 h-4" style={{ color: "var(--fg-muted)" }} />
            </button>

            {/* Logo — mobile only */}
            <Link href="/dashboard" className="lg:hidden flex items-center gap-2">
              <span
                className="w-6 h-6 rounded-md flex items-center justify-center"
                style={{ background: "var(--brand)" }}
              >
                <Zap className="w-3 h-3 text-white" strokeWidth={2.5} />
              </span>
              <span
                className="text-[14px] font-bold tracking-tight"
                style={{
                  color:      "var(--fg)",
                  fontFamily: "var(--font-montserrat,'Montserrat',sans-serif)",
                }}
              >
                Stealth<span style={{ color: "var(--brand)" }}>Connect</span>
              </span>
            </Link>

            {/* Page label — desktop only */}
            <span
              className="hidden lg:block text-[13px] font-semibold"
              style={{
                color:      "var(--fg-muted)",
                fontFamily: "var(--font-body)",
              }}
            >
              {NAV.find((n) =>
                n.href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname.startsWith(n.href)
              )?.label ?? "Dashboard"}
            </span>
          </div>

          {/* Right: credits pill + theme + logout */}
          <div className="flex items-center gap-2">
            {/* Credits pill — visible everywhere */}
            <span
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11.5px] font-semibold"
              style={{
                background: credits > 0
                  ? "rgba(var(--brand-rgb),0.08)"
                  : "rgba(245,158,11,0.08)",
                color: credits > 0 ? "var(--brand)" : "#d97706",
                border: credits > 0
                  ? "1px solid rgba(var(--brand-rgb),0.18)"
                  : "1px solid rgba(245,158,11,0.2)",
              }}
            >
              <Zap className="w-3 h-3" />
              {credits} {credits === 1 ? "credit" : "credits"}
            </span>
            <ThemeToggle />
            <LogoutBtn />
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          {children}
        </main>
      </div>
    </div>
  );
}

/* ── Sidebar inner — shared between desktop + drawer ────────── */
function SidebarInner({
  pathname,
  initials,
  userName,
  userEmail,
  credits,
  isAdmin = false,
  onNavClick,
}: {
  pathname:    string;
  initials:    string;
  userName:    string;
  userEmail:   string;
  credits:     number;
  isAdmin?:    boolean;
  onNavClick?: () => void;
}) {
  const visibleNav = isAdmin ? [...NAV, ADMIN_NAV] : NAV;
  return (
    <>
      {/* Logo */}
      <div
        className="flex items-center gap-2.5 h-14 px-5 shrink-0"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <span
          className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: "var(--brand)" }}
        >
          <Zap className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
        </span>
        <span
          className="text-[15px] font-bold tracking-tight"
          style={{
            color:      "var(--fg)",
            fontFamily: "var(--font-montserrat,'Montserrat',sans-serif)",
          }}
        >
          Stealth<span style={{ color: "var(--brand)" }}>Connect</span>
        </span>
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto py-4 px-3">
        <p
          className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-widest"
          style={{ color: "var(--fg-subtle)" }}
        >
          Menu
        </p>
        <ul className="space-y-0.5">
          {visibleNav.map(({ label, href, icon: Icon }) => {
            const active =
              href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  onClick={onNavClick}
                  className={`dash-nav-item${active ? " active" : ""}`}
                >
                  <Icon
                    className="w-[17px] h-[17px] shrink-0"
                    strokeWidth={active ? 2 : 1.75}
                    style={{ color: active ? "var(--brand)" : "var(--fg-subtle)" }}
                  />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Credits block */}
      <div
        className="mx-3 mb-3 rounded-xl p-3.5"
        style={{
          background: "var(--elevated)",
          border:     "1px solid var(--border)",
        }}
      >
        <div className="flex items-center justify-between mb-0.5">
          <span
            className="text-[10px] font-semibold uppercase tracking-widest"
            style={{ color: "var(--fg-subtle)" }}
          >
            Credits
          </span>
          {credits > 0 && (
            <span
              className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
              style={{
                background: "rgba(var(--brand-rgb),0.1)",
                color:      "var(--brand)",
              }}
            >
              Active
            </span>
          )}
        </div>
        <p
          className="text-2xl font-bold leading-tight"
          style={{
            color:      credits > 0 ? "var(--brand)" : "#d97706",
            fontFamily: "var(--font-montserrat,'Montserrat',sans-serif)",
          }}
        >
          {credits}
        </p>
        <p className="text-[11px] mt-0.5" style={{ color: "var(--fg-subtle)" }}>
          {credits === 1
            ? "1 free credit available"
            : credits > 1
            ? `${credits} credits available`
            : "No credits — top up"}
        </p>
      </div>

      {/* User footer */}
      <div
        className="shrink-0 px-3 py-3"
        style={{ borderTop: "1px solid var(--border)" }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center text-[11px] font-bold shrink-0"
            style={{
              background: "rgba(var(--brand-rgb),0.1)",
              color:      "var(--brand)",
              border:     "1px solid rgba(var(--brand-rgb),0.15)",
            }}
          >
            {initials || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p
              className="text-[12.5px] font-semibold truncate leading-tight"
              style={{ color: "var(--fg)" }}
            >
              {userName}
            </p>
            <p
              className="text-[11px] truncate leading-tight"
              style={{ color: "var(--fg-subtle)" }}
            >
              {userEmail}
            </p>
          </div>
          <LogoutBtn iconOnly />
        </div>
      </div>
    </>
  );
}

/* ── Logout button ──────────────────────────────────────────── */
function LogoutBtn({ iconOnly = false }: { iconOnly?: boolean }) {
  const router  = useRouter();
  const [busy, setBusy] = useState(false);

  async function logout() {
    setBusy(true);
    const sb = createClient();
    await sb.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  if (iconOnly) {
    return (
      <button
        onClick={logout}
        disabled={busy}
        aria-label="Sign out"
        title="Sign out"
        className="w-7 h-7 flex items-center justify-center rounded-lg shrink-0 transition-opacity hover:opacity-60 disabled:opacity-40"
        style={{
          background: "var(--elevated)",
          border:     "1px solid var(--border-strong)",
        }}
      >
        <LogOut className="w-3.5 h-3.5" style={{ color: "var(--fg-muted)" }} />
      </button>
    );
  }

  return (
    <button
      onClick={logout}
      disabled={busy}
      className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[12.5px] font-medium transition-all hover:opacity-70 disabled:opacity-40"
      style={{
        background: "var(--elevated)",
        border:     "1px solid var(--border-strong)",
        color:      "var(--fg-muted)",
      }}
    >
      <LogOut className="w-3.5 h-3.5" />
      <span className="hidden sm:inline">{busy ? "…" : "Sign out"}</span>
    </button>
  );
}
