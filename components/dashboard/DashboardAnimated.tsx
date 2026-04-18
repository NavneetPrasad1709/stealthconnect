"use client";

import Link from "next/link";
import { m } from "framer-motion";
import {
  Zap,
  ClipboardList,
  Clock,
  CheckCircle2,
  ArrowRight,
  PlusCircle,
  ExternalLink,
} from "lucide-react";

/* ── Types ───────────────────────────────────────────────────── */
type OrderStatus = "pending" | "processing" | "delivered" | "failed" | "refunded";
type ContactType = "email" | "phone" | "both";

type Order = {
  id:           string;
  contact_type: ContactType;
  quantity:     number;
  status:       OrderStatus;
  created_at:   string;
  amount_paid:  number;
};

interface Props {
  firstName:       string;
  credits:         number;
  totalOrders:     number;
  pendingOrders:   number;
  deliveredOrders: number;
  recentOrders:    Order[];
}

/* ── Status config ───────────────────────────────────────────── */
const STATUS: Record<OrderStatus, { label: string; dot: string; text: string; bg: string }> = {
  pending:    { label: "Pending",    dot: "#f59e0b", text: "#92400e", bg: "rgba(245,158,11,0.09)" },
  processing: { label: "Processing", dot: "#3b82f6", text: "#1e40af", bg: "rgba(59,130,246,0.09)"  },
  delivered:  { label: "Delivered",  dot: "#10b981", text: "#065f46", bg: "rgba(16,185,129,0.09)"  },
  failed:     { label: "Failed",     dot: "#ef4444", text: "#991b1b", bg: "rgba(239,68,68,0.09)"   },
  refunded:   { label: "Refunded",   dot: "#8b5cf6", text: "#4c1d95", bg: "rgba(139,92,246,0.09)"  },
};

/* ── Helpers ─────────────────────────────────────────────────── */
const fmt = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

const shortId = (id: string) => id.slice(0, 8).toUpperCase();

const contactLabel: Record<ContactType, string> = {
  email: "Email",
  phone: "Phone",
  both:  "Email + Phone",
};

/* ── Animation presets ───────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show:   { opacity: 1, y: 0,  transition: { type: "spring" as const, stiffness: 320, damping: 30 } },
};

const stagger = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.06 } },
};

/* ── Component ───────────────────────────────────────────────── */
export default function DashboardAnimated({
  firstName,
  credits,
  totalOrders,
  pendingOrders,
  deliveredOrders,
  recentOrders,
}: Props) {
  return (
    <m.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="max-w-4xl mx-auto w-full"
    >

      {/* ── Header ──────────────────────────────────────────── */}
      <m.div variants={fadeUp} className="mb-9">
        <p
          className="text-[13px] mb-1"
          style={{ color: "var(--fg-muted)", fontFamily: "var(--font-body)" }}
        >
          Good to see you,
        </p>
        <h1
          className="text-[28px] sm:text-[32px] font-bold tracking-tight leading-none"
          style={{
            color:      "var(--fg)",
            fontFamily: "var(--font-montserrat,'Montserrat',sans-serif)",
          }}
        >
          {firstName}
        </h1>
      </m.div>

      {/* ── Credits + CTA card ──────────────────────────────── */}
      <m.div variants={fadeUp} className="mb-5">
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background:  "var(--surface)",
            border:      "1px solid var(--border)",
          }}
        >
          {/* Top accent bar */}
          <div
            className="h-[3px]"
            style={{
              background: credits > 0
                ? "linear-gradient(90deg, var(--brand) 0%, var(--brand-mid) 100%)"
                : "linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%)",
            }}
          />

          <div className="px-5 sm:px-7 py-5 sm:py-6 flex flex-col sm:flex-row sm:items-center gap-5">
            {/* Number */}
            <div className="flex items-end gap-3">
              <span
                className="text-[56px] font-black leading-none"
                style={{
                  color:      credits > 0 ? "var(--brand)" : "#f59e0b",
                  fontFamily: "var(--font-montserrat,'Montserrat',sans-serif)",
                }}
              >
                {credits}
              </span>
              <div className="pb-1.5">
                <p
                  className="text-[12px] font-semibold leading-tight"
                  style={{ color: "var(--fg)" }}
                >
                  {credits === 1 ? "Credit" : "Credits"}
                </p>
                <p
                  className="text-[11px] leading-tight"
                  style={{ color: "var(--fg-muted)" }}
                >
                  available
                </p>
              </div>
            </div>

            {/* Divider — hidden on mobile */}
            <div
              className="hidden sm:block self-stretch w-px mx-2"
              style={{ background: "var(--border)" }}
            />

            {/* Description */}
            <div className="flex-1">
              {credits > 0 ? (
                <>
                  <div
                    className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full mb-2"
                    style={{
                      background: "rgba(var(--brand-rgb),0.08)",
                      color:      "var(--brand)",
                      border:     "1px solid rgba(var(--brand-rgb),0.15)",
                    }}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ background: "var(--brand)" }}
                    />
                    {credits === 1 ? "1 Free Credit Available" : `${credits} Credits Available`}
                  </div>
                  <p
                    className="text-[13px] leading-relaxed"
                    style={{ color: "var(--fg-muted)" }}
                  >
                    Each credit finds verified contact info for one LinkedIn profile.
                  </p>
                </>
              ) : (
                <>
                  <div
                    className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full mb-2"
                    style={{
                      background: "rgba(245,158,11,0.08)",
                      color:      "#d97706",
                      border:     "1px solid rgba(245,158,11,0.18)",
                    }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    No credits remaining
                  </div>
                  <p
                    className="text-[13px] leading-relaxed"
                    style={{ color: "var(--fg-muted)" }}
                  >
                    Purchase credits to continue finding LinkedIn contacts.
                  </p>
                </>
              )}
            </div>

            {/* CTA */}
            <Link
              href="/dashboard/submit"
              className="group shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13.5px] font-semibold text-white transition-all duration-200 active:scale-[0.97] hover:brightness-90"
              style={{
                background: "var(--brand)",
              }}
            >
              <PlusCircle className="w-4 h-4" />
              New Order
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform duration-150" />
            </Link>
          </div>
        </div>
      </m.div>

      {/* ── Stats row ────────────────────────────────────────── */}
      <m.div
        variants={fadeUp}
        className="grid grid-cols-3 gap-3 sm:gap-4 mb-5"
      >
        {[
          {
            label: "Total Orders",
            value: totalOrders,
            icon:  ClipboardList,
            color: "var(--brand)",
            bg:    "rgba(var(--brand-rgb),0.08)",
          },
          {
            label: "Pending",
            value: pendingOrders,
            icon:  Clock,
            color: "#f59e0b",
            bg:    "rgba(245,158,11,0.08)",
          },
          {
            label: "Delivered",
            value: deliveredOrders,
            icon:  CheckCircle2,
            color: "#10b981",
            bg:    "rgba(16,185,129,0.08)",
          },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div
            key={label}
            className="rounded-xl p-4 sm:p-5"
            style={{
              background: "var(--surface)",
              border:     "1px solid var(--border)",
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <p
                className="text-[10.5px] sm:text-[11px] font-semibold uppercase tracking-wider leading-none"
                style={{ color: "var(--fg-subtle)" }}
              >
                {label}
              </p>
              <span
                className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: bg }}
              >
                <Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5" style={{ color }} />
              </span>
            </div>
            <p
              className="text-2xl sm:text-3xl font-bold leading-none"
              style={{
                color:      "var(--fg)",
                fontFamily: "var(--font-montserrat,'Montserrat',sans-serif)",
              }}
            >
              {value}
            </p>
          </div>
        ))}
      </m.div>

      {/* ── Recent Orders ─────────────────────────────────────── */}
      <m.div variants={fadeUp}>
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: "var(--surface)",
            border:     "1px solid var(--border)",
          }}
        >
          {/* Card header */}
          <div
            className="flex items-center justify-between px-5 sm:px-6 py-4"
            style={{ borderBottom: "1px solid var(--border)" }}
          >
            <div className="flex items-center gap-2">
              <ClipboardList
                className="w-4 h-4"
                style={{ color: "var(--brand)" }}
              />
              <span
                className="text-[14px] font-semibold"
                style={{
                  color:      "var(--fg)",
                  fontFamily: "var(--font-montserrat,'Montserrat',sans-serif)",
                }}
              >
                Recent Orders
              </span>
              {recentOrders.length > 0 && (
                <span
                  className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                  style={{
                    background: "rgba(var(--brand-rgb),0.08)",
                    color:      "var(--brand)",
                  }}
                >
                  {recentOrders.length}
                </span>
              )}
            </div>
            {recentOrders.length > 0 && (
              <Link
                href="/dashboard/orders"
                className="flex items-center gap-1 text-[12px] font-medium transition-opacity hover:opacity-60"
                style={{ color: "var(--brand)" }}
              >
                View all
                <ExternalLink className="w-3 h-3" />
              </Link>
            )}
          </div>

          {recentOrders.length === 0 ? (
            <EmptyOrders />
          ) : (
            <div className="overflow-x-auto">
              <table className="dash-table">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th className="hidden sm:table-cell">Type</th>
                    <th>Qty</th>
                    <th>Status</th>
                    <th className="hidden md:table-cell">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order, i) => {
                    const s = STATUS[order.status];
                    return (
                      <m.tr
                        key={order.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.25 + i * 0.05 }}
                      >
                        <td>
                          <span className="font-mono text-[12px]">
                            #{shortId(order.id)}
                          </span>
                        </td>
                        <td className="hidden sm:table-cell">
                          {contactLabel[order.contact_type]}
                        </td>
                        <td>{order.quantity}</td>
                        <td>
                          <span
                            className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap"
                            style={{
                              background: s.bg,
                              color:      s.dot,
                            }}
                          >
                            <span
                              className="w-1.5 h-1.5 rounded-full shrink-0"
                              style={{ background: s.dot }}
                            />
                            {s.label}
                          </span>
                        </td>
                        <td className="hidden md:table-cell text-[12px]">
                          {fmt(order.created_at)}
                        </td>
                      </m.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </m.div>

    </m.div>
  );
}

/* ── Empty state ─────────────────────────────────────────────── */
function EmptyOrders() {
  return (
    <div className="flex flex-col items-center justify-center py-14 px-6 text-center">
      <div
        className="w-11 h-11 rounded-2xl flex items-center justify-center mb-4"
        style={{
          background: "var(--elevated)",
          border:     "1px solid var(--border)",
        }}
      >
        <Zap className="w-5 h-5" style={{ color: "var(--fg-subtle)" }} />
      </div>
      <p
        className="text-[14px] font-semibold mb-1"
        style={{
          color:      "var(--fg)",
          fontFamily: "var(--font-montserrat,'Montserrat',sans-serif)",
        }}
      >
        No orders yet
      </p>
      <p
        className="text-[13px] mb-6 max-w-xs"
        style={{ color: "var(--fg-muted)" }}
      >
        Submit your first LinkedIn URL and get verified contact info in 30 minutes.
      </p>
      <Link
        href="/dashboard/submit"
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-semibold text-white active:scale-[0.97] transition-all hover:brightness-90"
        style={{ background: "var(--brand)" }}
      >
        <PlusCircle className="w-3.5 h-3.5" />
        Submit first order
      </Link>
    </div>
  );
}
