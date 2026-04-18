"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown, ChevronRight, ExternalLink, PlusCircle,
  ClipboardList, Filter, Mail, Phone, Layers,
} from "lucide-react";

/* ── Types ─────────────────────────────────────────────────── */
type OrderStatus  = "pending" | "processing" | "delivered" | "failed" | "refunded";
type ContactType  = "email" | "phone" | "both";

export type Order = {
  id:                    string;
  contact_type:          ContactType;
  input_type:            string;
  quantity:              number;
  amount_paid:           number;
  email_draft_requested: boolean;
  status:                OrderStatus;
  created_at:            string;
  delivered_at:          string | null;
  linkedin_urls:         string[];
};

/* ── Config ─────────────────────────────────────────────────── */
const PER_PAGE = 10;

const STATUS_CONFIG: Record<OrderStatus, { label: string; dot: string; fg: string; bg: string }> = {
  pending:    { label: "Pending",    dot: "#f59e0b", fg: "#b45309", bg: "rgba(245,158,11,0.09)"  },
  processing: { label: "Processing", dot: "#3b82f6", fg: "#1d4ed8", bg: "rgba(59,130,246,0.09)"  },
  delivered:  { label: "Delivered",  dot: "#10b981", fg: "#065f46", bg: "rgba(16,185,129,0.09)"  },
  failed:     { label: "Failed",     dot: "#ef4444", fg: "#991b1b", bg: "rgba(239,68,68,0.09)"   },
  refunded:   { label: "Refunded",   dot: "#8b5cf6", fg: "#4c1d95", bg: "rgba(139,92,246,0.09)"  },
};

const CONTACT_CONFIG: Record<ContactType, { label: string; Icon: typeof Mail }> = {
  email: { label: "Email",        Icon: Mail   },
  phone: { label: "Phone",        Icon: Phone  },
  both:  { label: "Email+Phone",  Icon: Layers },
};

const ALL_STATUSES: (OrderStatus | "all")[] = [
  "all", "pending", "processing", "delivered", "failed", "refunded",
];

/* ── Helpers ─────────────────────────────────────────────────── */
const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

const fmtTime = (iso: string) =>
  new Date(iso).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

const shortId = (id: string) => id.slice(0, 8).toUpperCase();

/* ════════════════════════════════════════════════════════════════
   Root
═══════════════════════════════════════════════════════════════ */
export function OrdersView({ orders }: { orders: Order[] }) {
  const [filter, setFilter]     = useState<OrderStatus | "all">("all");
  const [page,   setPage]       = useState(1);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);

  const filtered = useMemo(
    () => filter === "all" ? orders : orders.filter((o) => o.status === filter),
    [orders, filter]
  );

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paged      = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  function changeFilter(f: OrderStatus | "all") {
    setFilter(f);
    setPage(1);
    setExpanded(null);
    setFilterOpen(false);
  }

  function toggle(id: string) {
    setExpanded((cur) => cur === id ? null : id);
  }

  /* counts */
  const counts = useMemo(() => {
    const c: Partial<Record<OrderStatus | "all", number>> = { all: orders.length };
    orders.forEach((o) => { c[o.status] = (c[o.status] ?? 0) + 1; });
    return c;
  }, [orders]);

  return (
    <div className="max-w-5xl mx-auto w-full">

      {/* ── Page header ────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <h1
            className="text-[26px] sm:text-[30px] font-bold tracking-tight leading-none mb-1.5"
            style={{ color: "var(--fg)", fontFamily: "var(--font-montserrat,'Montserrat',sans-serif)" }}
          >
            My Orders
          </h1>
          <p className="text-[13.5px]" style={{ color: "var(--fg-muted)" }}>
            {orders.length === 0 ? "No orders yet" : `${orders.length} order${orders.length !== 1 ? "s" : ""} total`}
          </p>
        </div>

        <Link
          href="/dashboard/submit"
          className="group shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-semibold text-white transition-all hover:brightness-90 active:scale-[0.97]"
          style={{ background: "var(--brand)" }}
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">New Order</span>
          <span className="sm:hidden">New</span>
        </Link>
      </div>

      {orders.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          {/* ── Filter bar ───────────────────────────────────── */}
          <div className="flex items-center gap-3 mb-5 flex-wrap">

            {/* Desktop pills */}
            <div className="hidden sm:flex items-center gap-1.5 flex-wrap">
              {ALL_STATUSES.map((s) => {
                const active = filter === s;
                const cfg    = s === "all" ? null : STATUS_CONFIG[s];
                const count  = counts[s] ?? 0;
                if (count === 0 && s !== "all") return null;
                return (
                  <button
                    key={s}
                    onClick={() => changeFilter(s)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium transition-all"
                    style={{
                      background:  active ? (cfg ? cfg.bg : "rgba(var(--brand-rgb),0.08)") : "var(--surface)",
                      color:       active ? (cfg ? cfg.fg : "var(--brand)")                 : "var(--fg-muted)",
                      border:      active
                        ? `1px solid ${cfg ? cfg.dot + "44" : "rgba(var(--brand-rgb),0.2)"}`
                        : "1px solid var(--border)",
                    }}
                  >
                    {cfg && (
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ background: active ? cfg.dot : "var(--fg-subtle)" }}
                      />
                    )}
                    {s === "all" ? "All" : STATUS_CONFIG[s].label}
                    <span
                      className="text-[10px] font-bold px-1 rounded"
                      style={{
                        background: active ? "rgba(0,0,0,0.07)" : "var(--elevated)",
                        color:      active ? "inherit" : "var(--fg-subtle)",
                      }}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Mobile dropdown */}
            <div className="relative sm:hidden">
              <button
                onClick={() => setFilterOpen((v) => !v)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-[13px] font-medium transition-all"
                style={{
                  background: "var(--surface)",
                  border:     "1px solid var(--border)",
                  color:      "var(--fg)",
                }}
              >
                <Filter className="w-3.5 h-3.5" style={{ color: "var(--fg-muted)" }} />
                {filter === "all" ? "All orders" : STATUS_CONFIG[filter].label}
                <ChevronDown
                  className="w-3.5 h-3.5 transition-transform"
                  style={{
                    color:     "var(--fg-muted)",
                    transform: filterOpen ? "rotate(180deg)" : "rotate(0deg)",
                  }}
                />
              </button>

              <AnimatePresence>
                {filterOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0,  scale: 1 }}
                    exit={{    opacity: 0, y: -4,  scale: 0.97 }}
                    transition={{ duration: 0.14 }}
                    className="absolute left-0 top-full mt-1.5 z-20 rounded-xl overflow-hidden shadow-lg min-w-[160px]"
                    style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
                  >
                    {ALL_STATUSES.map((s) => {
                      const count = counts[s] ?? 0;
                      if (count === 0 && s !== "all") return null;
                      const cfg = s === "all" ? null : STATUS_CONFIG[s];
                      return (
                        <button
                          key={s}
                          onClick={() => changeFilter(s)}
                          className="w-full flex items-center justify-between px-4 py-2.5 text-[13px] text-left transition-colors hover:bg-white/5"
                          style={{
                            color:      filter === s ? "var(--brand)" : "var(--fg)",
                            fontWeight: filter === s ? 600 : 400,
                          }}
                        >
                          <span className="flex items-center gap-2">
                            {cfg && <span className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.dot }} />}
                            {s === "all" ? "All" : STATUS_CONFIG[s].label}
                          </span>
                          <span className="text-[11px]" style={{ color: "var(--fg-subtle)" }}>{count}</span>
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {filtered.length !== orders.length && (
              <span className="text-[12.5px]" style={{ color: "var(--fg-subtle)" }}>
                Showing {filtered.length} of {orders.length}
              </span>
            )}
          </div>

          {/* ── Table — desktop ──────────────────────────────── */}
          <div className="hidden md:block">
            <div
              className="rounded-2xl overflow-hidden"
              style={{ border: "1px solid var(--border)", background: "var(--surface)" }}
            >
              {/* Head */}
              <div
                className="grid items-center px-5 py-3"
                style={{
                  gridTemplateColumns: "1fr 120px 80px 90px 110px 32px",
                  borderBottom: "1px solid var(--border)",
                }}
              >
                {["Order", "Type", "Qty", "Amount", "Status", ""].map((h) => (
                  <span
                    key={h}
                    className="text-[10.5px] font-semibold uppercase tracking-wider"
                    style={{ color: "var(--fg-subtle)" }}
                  >
                    {h}
                  </span>
                ))}
              </div>

              {/* Rows */}
              <AnimatePresence initial={false}>
                {paged.length === 0 ? (
                  <div className="py-12 text-center text-[13px]" style={{ color: "var(--fg-muted)" }}>
                    No orders match this filter.
                  </div>
                ) : (
                  paged.map((order, i) => (
                    <TableRow
                      key={order.id}
                      order={order}
                      index={i}
                      expanded={expanded === order.id}
                      onToggle={() => toggle(order.id)}
                    />
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* ── Cards — mobile ───────────────────────────────── */}
          <div className="md:hidden space-y-3">
            <AnimatePresence initial={false}>
              {paged.length === 0 ? (
                <div className="py-10 text-center text-[13px]" style={{ color: "var(--fg-muted)" }}>
                  No orders match this filter.
                </div>
              ) : (
                paged.map((order, i) => (
                  <MobileCard
                    key={order.id}
                    order={order}
                    index={i}
                    expanded={expanded === order.id}
                    onToggle={() => toggle(order.id)}
                  />
                ))
              )}
            </AnimatePresence>
          </div>

          {/* ── Pagination ───────────────────────────────────── */}
          {totalPages > 1 && (
            <Pagination
              page={page}
              total={totalPages}
              count={filtered.length}
              perPage={PER_PAGE}
              onChange={setPage}
            />
          )}
        </>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   Desktop table row
═══════════════════════════════════════════════════════════════ */
function TableRow({ order, index, expanded, onToggle }: {
  order:    Order;
  index:    number;
  expanded: boolean;
  onToggle: () => void;
}) {
  const st  = STATUS_CONFIG[order.status];
  const ct  = CONTACT_CONFIG[order.contact_type];

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.22 }}
    >
      {/* Main row */}
      <div
        className="border-b last:border-b-0 transition-colors"
        style={{ borderColor: "var(--border)" }}
      >
        <button
          onClick={onToggle}
          className="w-full grid items-center px-5 py-3.5 text-left transition-colors hover:bg-white/[0.02] group"
          style={{ gridTemplateColumns: "1fr 120px 80px 90px 110px 32px" }}
        >
          {/* Order ID + date */}
          <div>
            <p className="text-[13px] font-semibold font-mono" style={{ color: "var(--fg)" }}>
              #{shortId(order.id)}
            </p>
            <p className="text-[11.5px]" style={{ color: "var(--fg-subtle)" }}>
              {fmtDate(order.created_at)}
            </p>
          </div>

          {/* Contact type */}
          <div className="flex items-center gap-1.5">
            <ct.Icon className="w-3.5 h-3.5 shrink-0" style={{ color: "var(--fg-subtle)" }} strokeWidth={1.75} />
            <span className="text-[12.5px]" style={{ color: "var(--fg-muted)" }}>{ct.label}</span>
          </div>

          {/* Quantity */}
          <span className="text-[13.5px] font-semibold" style={{ color: "var(--fg)" }}>
            {order.quantity}
          </span>

          {/* Amount */}
          <span className="text-[13px] tabular-nums" style={{ color: "var(--fg-muted)" }}>
            {order.amount_paid === 0 ? (
              <span style={{ color: "var(--brand)", fontWeight: 600 }}>Free</span>
            ) : (
              `$${order.amount_paid.toFixed(2)}`
            )}
          </span>

          {/* Status */}
          <span
            className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full w-fit"
            style={{ background: st.bg, color: st.fg }}
          >
            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: st.dot }} />
            {st.label}
          </span>

          {/* Expand */}
          <motion.span
            animate={{ rotate: expanded ? 90 : 0 }}
            transition={{ duration: 0.18 }}
            className="flex items-center justify-center w-6 h-6 rounded-lg ml-auto transition-colors"
            style={{
              background: expanded ? "rgba(var(--brand-rgb),0.08)" : "var(--elevated)",
              border:     "1px solid var(--border)",
            }}
          >
            <ChevronRight className="w-3.5 h-3.5" style={{ color: expanded ? "var(--brand)" : "var(--fg-subtle)" }} />
          </motion.span>
        </button>

        {/* Expanded URLs */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{    height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              style={{ overflow: "hidden" }}
            >
              <ExpandedURLs urls={order.linkedin_urls} emailDraft={order.email_draft_requested} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

/* ════════════════════════════════════════════════════════════════
   Mobile card
═══════════════════════════════════════════════════════════════ */
function MobileCard({ order, index, expanded, onToggle }: {
  order:    Order;
  index:    number;
  expanded: boolean;
  onToggle: () => void;
}) {
  const st = STATUS_CONFIG[order.status];
  const ct = CONTACT_CONFIG[order.contact_type];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.22 }}
      className="rounded-2xl overflow-hidden"
      style={{ border: "1px solid var(--border)", background: "var(--surface)" }}
    >
      <button
        onClick={onToggle}
        className="w-full text-left px-4 py-4 transition-colors hover:bg-white/[0.02]"
      >
        <div className="flex items-start justify-between gap-3 mb-3">
          {/* Left */}
          <div>
            <p className="text-[13.5px] font-semibold font-mono mb-0.5" style={{ color: "var(--fg)" }}>
              #{shortId(order.id)}
            </p>
            <p className="text-[12px]" style={{ color: "var(--fg-subtle)" }}>
              {fmtDate(order.created_at)} · {fmtTime(order.created_at)}
            </p>
          </div>
          {/* Status badge */}
          <span
            className="shrink-0 inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full"
            style={{ background: st.bg, color: st.fg }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: st.dot }} />
            {st.label}
          </span>
        </div>

        <div className="flex items-center gap-4">
          {/* Contact type */}
          <div className="flex items-center gap-1.5">
            <ct.Icon className="w-3.5 h-3.5" style={{ color: "var(--fg-subtle)" }} strokeWidth={1.75} />
            <span className="text-[12.5px]" style={{ color: "var(--fg-muted)" }}>{ct.label}</span>
          </div>

          <span className="text-[var(--border-strong)]">·</span>

          {/* Quantity */}
          <span className="text-[12.5px]" style={{ color: "var(--fg-muted)" }}>
            {order.quantity} profile{order.quantity !== 1 ? "s" : ""}
          </span>

          <span className="text-[var(--border-strong)]">·</span>

          {/* Amount */}
          <span className="text-[12.5px]" style={{ color: "var(--fg-muted)" }}>
            {order.amount_paid === 0
              ? <span style={{ color: "var(--brand)", fontWeight: 600 }}>Free</span>
              : `$${order.amount_paid.toFixed(2)}`
            }
          </span>
        </div>

        {/* Expand hint */}
        <div className="flex items-center gap-1 mt-3" style={{ color: "var(--brand)" }}>
          <motion.span animate={{ rotate: expanded ? 90 : 0 }} transition={{ duration: 0.18 }}>
            <ChevronRight className="w-3.5 h-3.5" />
          </motion.span>
          <span className="text-[12px] font-medium">
            {expanded ? "Hide" : "Show"} {order.linkedin_urls.length} URL{order.linkedin_urls.length !== 1 ? "s" : ""}
          </span>
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{    height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            style={{ overflow: "hidden", borderTop: "1px solid var(--border)" }}
          >
            <ExpandedURLs urls={order.linkedin_urls} emailDraft={order.email_draft_requested} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ════════════════════════════════════════════════════════════════
   Expanded URL list (shared)
═══════════════════════════════════════════════════════════════ */
function ExpandedURLs({ urls, emailDraft }: { urls: string[]; emailDraft: boolean }) {
  return (
    <div className="px-4 sm:px-5 py-3.5" style={{ background: "rgba(var(--brand-rgb),0.02)" }}>
      {emailDraft && (
        <div
          className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full mb-3"
          style={{
            background: "rgba(16,185,129,0.08)",
            color:      "#059669",
            border:     "1px solid rgba(16,185,129,0.15)",
          }}
        >
          ✓ AI Email Draft included
        </div>
      )}
      <p
        className="text-[10.5px] font-semibold uppercase tracking-wider mb-2"
        style={{ color: "var(--fg-subtle)" }}
      >
        LinkedIn URLs · {urls.length}
      </p>
      <div className="space-y-1.5">
        {urls.map((url, i) => (
          <div key={url} className="flex items-center gap-2.5">
            <span
              className="w-4 h-4 rounded flex items-center justify-center text-[9px] font-bold shrink-0"
              style={{ background: "var(--elevated)", color: "var(--fg-subtle)", border: "1px solid var(--border)" }}
            >
              {i + 1}
            </span>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[12px] font-mono transition-opacity hover:opacity-70 min-w-0 truncate"
              style={{ color: "var(--brand)" }}
            >
              <span className="truncate">{url}</span>
              <ExternalLink className="w-3 h-3 shrink-0 opacity-60" />
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   Pagination
═══════════════════════════════════════════════════════════════ */
function Pagination({ page, total, count, perPage, onChange }: {
  page:     number;
  total:    number;
  count:    number;
  perPage:  number;
  onChange: (p: number) => void;
}) {
  const start = (page - 1) * perPage + 1;
  const end   = Math.min(page * perPage, count);

  return (
    <div className="mt-5 flex items-center justify-between flex-wrap gap-3">
      <span className="text-[12.5px]" style={{ color: "var(--fg-subtle)" }}>
        {start}–{end} of {count}
      </span>

      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onChange(page - 1)}
          disabled={page === 1}
          className="px-3.5 py-2 rounded-lg text-[12.5px] font-medium transition-all disabled:opacity-30"
          style={{
            background: "var(--surface)",
            border:     "1px solid var(--border)",
            color:      "var(--fg-muted)",
          }}
        >
          ← Prev
        </button>

        {/* Page numbers */}
        <div className="flex items-center gap-1">
          {Array.from({ length: total }, (_, i) => i + 1)
            .filter((p) => p === 1 || p === total || Math.abs(p - page) <= 1)
            .reduce<(number | "…")[]>((acc, p, i, arr) => {
              if (i > 0 && (p as number) - (arr[i - 1] as number) > 1) acc.push("…");
              acc.push(p);
              return acc;
            }, [])
            .map((p, i) =>
              p === "…" ? (
                <span key={`ellipsis-${i}`} className="w-8 text-center text-[12px]" style={{ color: "var(--fg-subtle)" }}>…</span>
              ) : (
                <button
                  key={p}
                  onClick={() => onChange(p as number)}
                  className="w-8 h-8 rounded-lg text-[12.5px] font-medium transition-all"
                  style={{
                    background: page === p ? "var(--brand)" : "var(--surface)",
                    color:      page === p ? "#fff"         : "var(--fg-muted)",
                    border:     page === p ? "none"         : "1px solid var(--border)",
                  }}
                >
                  {p}
                </button>
              )
            )}
        </div>

        <button
          onClick={() => onChange(page + 1)}
          disabled={page === total}
          className="px-3.5 py-2 rounded-lg text-[12.5px] font-medium transition-all disabled:opacity-30"
          style={{
            background: "var(--surface)",
            border:     "1px solid var(--border)",
            color:      "var(--fg-muted)",
          }}
        >
          Next →
        </button>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   Empty state
═══════════════════════════════════════════════════════════════ */
function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center py-20 text-center"
    >
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
        style={{
          background: "var(--surface)",
          border:     "1px solid var(--border)",
        }}
      >
        <ClipboardList className="w-7 h-7" style={{ color: "var(--fg-subtle)" }} strokeWidth={1.5} />
      </div>

      <h2
        className="text-[18px] font-bold mb-2"
        style={{ color: "var(--fg)", fontFamily: "var(--font-montserrat,'Montserrat',sans-serif)" }}
      >
        No orders yet
      </h2>
      <p
        className="text-[13.5px] max-w-xs mb-7 leading-relaxed"
        style={{ color: "var(--fg-muted)" }}
      >
        Submit your first LinkedIn URL and get verified contact info delivered in 30 minutes.
      </p>

      <Link
        href="/dashboard/submit"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13.5px] font-semibold text-white transition-all hover:brightness-90 active:scale-[0.97]"
        style={{ background: "var(--brand)" }}
      >
        <PlusCircle className="w-4 h-4" />
        Submit first order
      </Link>
    </motion.div>
  );
}
