"use client";

import { useState } from "react";
import { m } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import {
  User, Mail, Phone, Link2, Shield, Zap,
  KeyRound, CheckCircle2, AlertCircle, Clock,
} from "lucide-react";
import toast from "react-hot-toast";

/* ── Types ───────────────────────────────────────────────────── */
type Profile = {
  id:          string;
  email:       string;
  full_name:   string | null;
  phone:       string | null;
  linkedin_id: string | null;
  credits:     number;
  role:        "user" | "admin";
  created_at:  string;
} | null;

type CreditLog = {
  id:         string;
  amount:     number;
  type:       string;
  note:       string | null;
  created_at: string;
};

/* ── Animation ───────────────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show:   { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 320, damping: 30 } },
};
const stagger = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.07 } },
};

/* ── Credit log label ────────────────────────────────────────── */
const LOG_META: Record<string, { label: string; color: string; bg: string }> = {
  admin_grant: { label: "Admin grant",   color: "#3b82f6", bg: "rgba(59,130,246,0.09)"  },
  purchase:    { label: "Purchase",      color: "#10b981", bg: "rgba(16,185,129,0.09)"  },
  usage:       { label: "Used",          color: "#f59e0b", bg: "rgba(245,158,11,0.09)"  },
  refund:      { label: "Refund",        color: "#8b5cf6", bg: "rgba(139,92,246,0.09)"  },
};

const logMeta = (type: string) =>
  LOG_META[type] ?? { label: type, color: "var(--fg-muted)", bg: "var(--elevated)" };

const fmt = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

const memberSince = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { month: "long", year: "numeric" });

/* ══════════════════════════════════════════════════════════════
   AccountView
═══════════════════════════════════════════════════════════════ */
export function AccountView({
  profile,
  creditLogs,
}: {
  profile:    Profile;
  creditLogs: CreditLog[];
}) {
  const [pwOld,    setPwOld]    = useState("");
  const [pwNew,    setPwNew]    = useState("");
  const [pwConfirm,setPwConfirm]= useState("");
  const [pwBusy,   setPwBusy]   = useState(false);
  const [pwDone,   setPwDone]   = useState(false);

  if (!profile) {
    return (
      <div className="flex items-center justify-center py-24">
        <p style={{ color: "var(--fg-muted)" }}>Profile not found.</p>
      </div>
    );
  }

  const initials = (profile.full_name ?? profile.email)
    .split(" ").slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? "")
    .join("");

  /* ── Password change ──────────────────────────────────────── */
  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    if (pwNew.length < 8) {
      toast.error("New password must be at least 8 characters.");
      return;
    }
    if (pwNew !== pwConfirm) {
      toast.error("Passwords do not match.");
      return;
    }
    setPwBusy(true);
    try {
      const sb = createClient();
      const { error } = await sb.auth.updateUser({ password: pwNew });
      if (error) throw error;
      setPwDone(true);
      setPwOld(""); setPwNew(""); setPwConfirm("");
      toast.success("Password updated successfully.");
      setTimeout(() => setPwDone(false), 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update password.";
      toast.error(msg);
    } finally {
      setPwBusy(false);
    }
  }

  /* ── Render ───────────────────────────────────────────────── */
  return (
    <m.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="max-w-2xl mx-auto w-full space-y-5"
    >

      {/* ── Header ─────────────────────────────────────────── */}
      <m.div variants={fadeUp} className="mb-2">
        <p className="text-[13px] mb-1" style={{ color: "var(--fg-muted)" }}>
          Manage your
        </p>
        <h1
          className="text-[28px] sm:text-[32px] font-bold tracking-tight leading-none"
          style={{ color: "var(--fg)", fontFamily: "var(--font-montserrat,'Montserrat',sans-serif)" }}
        >
          Account
        </h1>
      </m.div>

      {/* ── Profile card ───────────────────────────────────── */}
      <m.div
        variants={fadeUp}
        className="rounded-2xl overflow-hidden"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
      >
        {/* Top accent */}
        <div className="h-[3px]" style={{ background: "var(--brand)" }} />

        <div className="px-6 py-5">
          <div className="flex items-center gap-4 mb-6">
            {/* Avatar */}
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-[20px] font-bold shrink-0"
              style={{
                background: "rgba(var(--brand-rgb),0.1)",
                color:      "var(--brand)",
                border:     "1.5px solid rgba(var(--brand-rgb),0.2)",
                fontFamily: "var(--font-montserrat,'Montserrat',sans-serif)",
              }}
            >
              {initials || "U"}
            </div>
            <div>
              <p
                className="text-[17px] font-bold leading-tight"
                style={{ color: "var(--fg)", fontFamily: "var(--font-montserrat,'Montserrat',sans-serif)" }}
              >
                {profile.full_name ?? "—"}
              </p>
              <p className="text-[12.5px] mt-0.5" style={{ color: "var(--fg-muted)" }}>
                Member since {memberSince(profile.created_at)}
              </p>
              {profile.role === "admin" && (
                <span
                  className="inline-flex items-center gap-1 text-[10.5px] font-bold px-2 py-0.5 rounded-full mt-1.5"
                  style={{ background: "rgba(var(--brand-rgb),0.1)", color: "var(--brand)", border: "1px solid rgba(var(--brand-rgb),0.2)" }}
                >
                  <Shield className="w-3 h-3" /> Admin
                </span>
              )}
            </div>
          </div>

          {/* Info rows */}
          <div className="space-y-3">
            <InfoRow icon={Mail}  label="Email"    value={profile.email}                     />
            <InfoRow icon={Phone} label="Phone"    value={profile.phone    ?? "Not provided"} muted={!profile.phone} />
            <InfoRow icon={Link2} label="LinkedIn" value={profile.linkedin_id ?? "Not provided"} muted={!profile.linkedin_id} />
            <InfoRow
              icon={User}
              label="Account ID"
              value={profile.id.slice(0, 8).toUpperCase()}
              mono
            />
          </div>
        </div>
      </m.div>

      {/* ── Credits summary ────────────────────────────────── */}
      <m.div
        variants={fadeUp}
        className="rounded-2xl"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
      >
        <div
          className="flex items-center gap-2 px-6 py-4"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <Zap className="w-4 h-4" style={{ color: "var(--brand)" }} />
          <span
            className="text-[14px] font-semibold"
            style={{ color: "var(--fg)", fontFamily: "var(--font-montserrat,'Montserrat',sans-serif)" }}
          >
            Credits
          </span>
        </div>

        {/* Balance */}
        <div className="px-6 py-5 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--fg-subtle)" }}>
              Current balance
            </p>
            <p
              className="text-[40px] font-black leading-none"
              style={{
                color:      profile.credits > 0 ? "var(--brand)" : "#f59e0b",
                fontFamily: "var(--font-montserrat,'Montserrat',sans-serif)",
              }}
            >
              {profile.credits}
            </p>
            <p className="text-[12px] mt-1" style={{ color: "var(--fg-muted)" }}>
              {profile.credits === 0
                ? "No credits — pay per order via PayPal"
                : `${profile.credits} credit${profile.credits !== 1 ? "s" : ""} available · never expire`}
            </p>
          </div>
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{
              background: profile.credits > 0 ? "rgba(var(--brand-rgb),0.08)" : "rgba(245,158,11,0.08)",
              border:     profile.credits > 0 ? "1px solid rgba(var(--brand-rgb),0.15)" : "1px solid rgba(245,158,11,0.2)",
            }}
          >
            <Zap
              className="w-6 h-6"
              style={{ color: profile.credits > 0 ? "var(--brand)" : "#f59e0b" }}
            />
          </div>
        </div>

        {/* Credit log */}
        {creditLogs.length > 0 && (
          <div style={{ borderTop: "1px solid var(--border)" }}>
            <p
              className="px-6 pt-4 pb-2 text-[10.5px] font-semibold uppercase tracking-wider"
              style={{ color: "var(--fg-subtle)" }}
            >
              Recent activity
            </p>
            <div className="pb-2">
              {creditLogs.map((log, i) => {
                const meta = logMeta(log.type);
                const isPos = log.amount > 0;
                return (
                  <div
                    key={log.id}
                    className="flex items-center justify-between px-6 py-2.5"
                    style={{
                      borderTop: i > 0 ? "1px solid var(--border)" : "none",
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="text-[10.5px] font-semibold px-2 py-0.5 rounded-full shrink-0"
                        style={{ background: meta.bg, color: meta.color }}
                      >
                        {meta.label}
                      </span>
                      {log.note && (
                        <span className="text-[12px] truncate max-w-[180px]" style={{ color: "var(--fg-muted)" }}>
                          {log.note}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span
                        className="text-[13px] font-bold tabular-nums"
                        style={{ color: isPos ? "#10b981" : "#f59e0b" }}
                      >
                        {isPos ? "+" : ""}{log.amount}
                      </span>
                      <span className="text-[11px]" style={{ color: "var(--fg-subtle)" }}>
                        {fmt(log.created_at)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {creditLogs.length === 0 && (
          <div
            className="px-6 pb-6 flex items-center gap-2"
            style={{ borderTop: "1px solid var(--border)" }}
          >
            <Clock className="w-4 h-4 mt-5" style={{ color: "var(--fg-subtle)" }} />
            <p className="text-[13px] mt-5" style={{ color: "var(--fg-muted)" }}>
              No credit activity yet.
            </p>
          </div>
        )}
      </m.div>

      {/* ── Change password ────────────────────────────────── */}
      <m.div
        variants={fadeUp}
        className="rounded-2xl"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
      >
        <div
          className="flex items-center gap-2 px-6 py-4"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <KeyRound className="w-4 h-4" style={{ color: "var(--brand)" }} />
          <span
            className="text-[14px] font-semibold"
            style={{ color: "var(--fg)", fontFamily: "var(--font-montserrat,'Montserrat',sans-serif)" }}
          >
            Change Password
          </span>
        </div>

        <form onSubmit={handlePasswordChange} className="px-6 py-5 space-y-4">
          <Field
            label="New password"
            type="password"
            value={pwNew}
            onChange={setPwNew}
            placeholder="Min 8 characters"
          />
          <Field
            label="Confirm new password"
            type="password"
            value={pwConfirm}
            onChange={setPwConfirm}
            placeholder="Repeat new password"
          />

          {pwNew && pwConfirm && pwNew !== pwConfirm && (
            <div
              className="flex items-center gap-2 text-[12.5px] px-3 py-2.5 rounded-lg"
              style={{ background: "rgba(239,68,68,0.07)", color: "#dc2626", border: "1px solid rgba(239,68,68,0.2)" }}
            >
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              Passwords do not match
            </div>
          )}

          {pwDone && (
            <div
              className="flex items-center gap-2 text-[12.5px] px-3 py-2.5 rounded-lg"
              style={{ background: "rgba(16,185,129,0.08)", color: "#10b981", border: "1px solid rgba(16,185,129,0.2)" }}
            >
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              Password updated successfully.
            </div>
          )}

          <button
            type="submit"
            disabled={pwBusy || !pwNew || !pwConfirm}
            className="w-full py-2.5 rounded-xl text-[13.5px] font-semibold text-white transition-all hover:brightness-90 active:scale-[0.98] disabled:opacity-40"
            style={{ background: "var(--brand)" }}
          >
            {pwBusy ? "Updating…" : "Update Password"}
          </button>
        </form>
      </m.div>

    </m.div>
  );
}

/* ── Info row ────────────────────────────────────────────────── */
function InfoRow({
  icon: Icon, label, value, muted, mono,
}: {
  icon:   React.ElementType;
  label:  string;
  value:  string;
  muted?: boolean;
  mono?:  boolean;
}) {
  return (
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-xl"
      style={{ background: "var(--elevated)", border: "1px solid var(--border)" }}
    >
      <span
        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
        style={{ background: "rgba(var(--brand-rgb),0.08)" }}
      >
        <Icon className="w-4 h-4" style={{ color: "var(--brand)" }} strokeWidth={1.75} />
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-[10.5px] font-semibold uppercase tracking-wider" style={{ color: "var(--fg-subtle)" }}>
          {label}
        </p>
        <p
          className={`text-[13.5px] font-medium truncate mt-0.5 ${mono ? "font-mono" : ""}`}
          style={{ color: muted ? "var(--fg-subtle)" : "var(--fg)" }}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

/* ── Input field ─────────────────────────────────────────────── */
function Field({
  label, type, value, onChange, placeholder,
}: {
  label:       string;
  type:        string;
  value:       string;
  onChange:    (v: string) => void;
  placeholder: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--fg-subtle)" }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-2.5 rounded-xl text-[13.5px] outline-none transition-all"
        style={{
          background:  "var(--elevated)",
          border:      "1.5px solid var(--border)",
          color:       "var(--fg)",
        }}
        onFocus={(e)  => (e.currentTarget.style.borderColor = "var(--brand)")}
        onBlur={(e)   => (e.currentTarget.style.borderColor = "var(--border)")}
      />
    </div>
  );
}

import type React from "react";
