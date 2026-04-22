"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, m } from "framer-motion";
import {
  Phone, Mail, Layers, FileText, Upload,
  Check, ChevronLeft, ArrowRight, Zap, AlertCircle, X,
} from "lucide-react";
import {
  PayPalScriptProvider,
  PayPalButtons,
  usePayPalScriptReducer,
} from "@paypal/react-paypal-js";

/* ─── Types ─────────────────────────────────────────────────── */
type ContactType = "phone" | "email" | "both";
type InputMode   = "single" | "bulk" | "csv";

interface WizardState {
  contactType: ContactType | null;
  inputMode:   InputMode;
  singleUrl:   string;
  bulkText:    string;
  csvUrls:     string[];
  emailDraft:  boolean;
}

/* ─── Pricing ────────────────────────────────────────────────── */
const PRICE: Record<ContactType, number> = { phone: 1.00, email: 0.20, both: 1.20 };
const DRAFT_PRICE = 1.00;

/* ─── URL helpers ────────────────────────────────────────────── */
const LI_RE = /linkedin\.com\/in\//i;

function normalizeUrl(raw: string): string | null {
  const t = raw.trim().replace(/,$/, "");
  if (!t || !LI_RE.test(t)) return null;
  try {
    const u = new URL(t.startsWith("http") ? t : `https://${t}`);
    return u.origin + u.pathname.replace(/\/$/, "");
  } catch { return null; }
}

function parseBulk(text: string): string[] {
  return [...new Set(
    text.split(/[\n,]/).map(normalizeUrl).filter(Boolean) as string[]
  )];
}

function parseCSVText(text: string): string[] {
  const urls: string[] = [];
  for (const line of text.split(/\r?\n/)) {
    for (const cell of line.split(",")) {
      const n = normalizeUrl(cell.replace(/^["'\s]+|["'\s]+$/g, ""));
      if (n) urls.push(n);
    }
  }
  return [...new Set(urls)];
}

function getUrls(s: WizardState): string[] {
  if (s.inputMode === "single") return [normalizeUrl(s.singleUrl)].filter(Boolean) as string[];
  if (s.inputMode === "bulk")   return parseBulk(s.bulkText);
  return s.csvUrls;
}

/* ════════════════════════════════════════════════════════════════
   Wizard shell
═══════════════════════════════════════════════════════════════ */
const STEP_LABELS = ["Contact Type", "LinkedIn URLs", "Add-ons", "Payment"];

export function SubmitWizard({ credits }: { credits: number }) {
  const [form, setForm] = useState<WizardState>({
    contactType: null, inputMode: "single",
    singleUrl: "", bulkText: "", csvUrls: [], emailDraft: false,
  });
  const [step, setStep]   = useState(0);
  const [dir,  setDir]    = useState<1 | -1>(1);
  const [err,  setErr]    = useState<string | null>(null);

  const go = useCallback((next: number) => {
    setErr(null);
    setDir(next > step ? 1 : -1);
    setStep(next);
  }, [step]);

  function advance() {
    if (step === 0 && !form.contactType) { setErr("Choose a contact type to continue."); return; }
    if (step === 1 && !getUrls(form).length) { setErr("Add at least one valid LinkedIn URL."); return; }
    go(step + 1);
  }

  const urls        = getUrls(form);
  const qty         = urls.length;
  const contactCost = qty * PRICE[form.contactType ?? "email"];
  const draftCost   = form.emailDraft ? qty * DRAFT_PRICE : 0;
  const total       = contactCost + draftCost;
  const canCredit   = credits >= qty && qty > 0;

  return (
    <PayPalScriptProvider
      options={{ clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!, currency: "USD" }}
    >
      <div className="max-w-[520px] mx-auto w-full">

        {/* Step indicator */}
        <div className="mb-10">
          <div className="flex items-start mb-3">
            {STEP_LABELS.map((label, i) => (
              <div key={i} className="flex items-center flex-1 last:flex-none">
                <button
                  onClick={() => i < step && go(i)}
                  disabled={i >= step}
                  className="flex flex-col items-center gap-1.5"
                  style={{ cursor: i < step ? "pointer" : "default" }}
                >
                  <span
                    className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold transition-colors duration-200"
                    style={{
                      background: i <= step ? "var(--brand)" : "var(--elevated)",
                      border:     i <= step ? "none" : "1.5px solid var(--border-strong)",
                      color:      i <= step ? "#fff" : "var(--fg-subtle)",
                    }}
                  >
                    {i < step ? <Check className="w-3.5 h-3.5" strokeWidth={2.5} /> : i + 1}
                  </span>
                  <span
                    className="hidden sm:block text-[10px] font-medium text-center leading-tight max-w-[60px]"
                    style={{ color: i === step ? "var(--fg)" : "var(--fg-subtle)" }}
                  >
                    {label}
                  </span>
                </button>
                {i < 3 && (
                  <div
                    className="flex-1 h-px mx-2 mt-[-14px] sm:mt-[-24px]"
                    style={{
                      background: i < step ? "var(--brand)" : "var(--border-strong)",
                      minWidth:   12,
                    }}
                  />
                )}
              </div>
            ))}
          </div>

          {/* thin progress track */}
          <div className="h-[2px] rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
            <m.div
              className="h-full rounded-full"
              style={{ background: "var(--brand)" }}
              animate={{ width: `${((step + 1) / 4) * 100}%` }}
              transition={{ type: "spring", stiffness: 280, damping: 30 }}
            />
          </div>
        </div>

        {/* Error */}
        <AnimatePresence>
          {err && (
            <m.div
              initial={{ opacity: 0, y: -6, height: 0 }}
              animate={{ opacity: 1, y: 0,  height: "auto" }}
              exit={{    opacity: 0,          height: 0 }}
              className="mb-5 flex items-start gap-2.5 px-4 py-3 rounded-xl text-[13px]"
              style={{
                background: "rgba(239,68,68,0.07)",
                border:     "1px solid rgba(239,68,68,0.2)",
                color:      "#dc2626",
              }}
            >
              <AlertCircle className="w-4 h-4 mt-px shrink-0" />
              <span className="flex-1">{err}</span>
              <button onClick={() => setErr(null)}>
                <X className="w-3.5 h-3.5 opacity-50 hover:opacity-100" />
              </button>
            </m.div>
          )}
        </AnimatePresence>

        {/* Step content */}
        <div className="relative">
          <AnimatePresence mode="wait" custom={dir}>
            <m.div
              key={step}
              custom={dir}
              variants={{
                enter:  (d: number) => ({ x: d * 32, opacity: 0 }),
                center: { x: 0, opacity: 1, transition: { type: "spring", stiffness: 360, damping: 34 } },
                exit:   (d: number) => ({ x: d * -20, opacity: 0, transition: { duration: 0.13 } }),
              }}
              initial="enter" animate="center" exit="exit"
            >
              {step === 0 && (
                <StepContactType
                  value={form.contactType}
                  onChange={(v) => { setForm((s) => ({ ...s, contactType: v })); setErr(null); }}
                />
              )}
              {step === 1 && (
                <StepLinkedIn
                  mode={form.inputMode}
                  singleUrl={form.singleUrl}
                  bulkText={form.bulkText}
                  csvUrls={form.csvUrls}
                  onChange={(patch) => { setForm((s) => ({ ...s, ...patch })); setErr(null); }}
                />
              )}
              {step === 2 && (
                <StepAddons
                  emailDraft={form.emailDraft}
                  qty={qty}
                  onChange={(v) => setForm((s) => ({ ...s, emailDraft: v }))}
                />
              )}
              {step === 3 && (
                <StepSummary
                  contactType={form.contactType!}
                  inputMode={form.inputMode}
                  urls={urls}
                  emailDraft={form.emailDraft}
                  contactCost={contactCost}
                  draftCost={draftCost}
                  total={total}
                  credits={credits}
                  canCredit={canCredit}
                  onBack={() => go(2)}
                />
              )}
            </m.div>
          </AnimatePresence>
        </div>

        {/* Navigation — steps 0-2 */}
        {step < 3 && (
          <div
            className="flex items-center justify-between mt-8 pt-5"
            style={{ borderTop: "1px solid var(--border)" }}
          >
            {step > 0 ? (
              <button
                onClick={() => go(step - 1)}
                className="flex items-center gap-1 text-[13px] font-medium transition-opacity hover:opacity-60"
                style={{ color: "var(--fg-muted)" }}
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
            ) : <span />}

            <button
              onClick={advance}
              className="group flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13.5px] font-semibold text-white transition-all active:scale-[0.97] hover:brightness-90"
              style={{ background: "var(--brand)" }}
            >
              {step === 2 ? "Review Order" : "Continue"}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-150" />
            </button>
          </div>
        )}
      </div>
    </PayPalScriptProvider>
  );
}

/* ════════════════════════════════════════════════════════════════
   Step A — Contact Type
═══════════════════════════════════════════════════════════════ */
function StepContactType({
  value, onChange,
}: { value: ContactType | null; onChange: (v: ContactType) => void }) {
  const OPTIONS: {
    type:  ContactType;
    icon:  React.ElementType;
    label: string;
    sub:   string;
    price: string;
    tag?:  string;
  }[] = [
    { type: "phone", icon: Phone,  label: "Mobile Numbers",  sub: "Direct-dial verified numbers",    price: "$1.00 / contact", tag: "Most accurate" },
    { type: "email", icon: Mail,   label: "Email Addresses", sub: "Verified work & personal emails", price: "$0.20 / contact"                       },
    { type: "both",  icon: Layers, label: "Email + Phone",   sub: "Full contact profile",            price: "$1.20 / contact", tag: "Best value"    },
  ];

  return (
    <div>
      <h2
        className="text-[22px] font-bold tracking-tight mb-1.5"
        style={{ color: "var(--fg)", fontFamily: "var(--font-montserrat,'Montserrat',sans-serif)" }}
      >
        What do you need?
      </h2>
      <p className="text-[13.5px] mb-7" style={{ color: "var(--fg-muted)" }}>
        Choose what to retrieve for each LinkedIn profile.
      </p>

      <div className="space-y-3">
        {OPTIONS.map(({ type, icon: Icon, label, sub, price, tag }) => {
          const on = value === type;
          return (
            <button
              key={type}
              onClick={() => onChange(type)}
              className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-left transition-all duration-150 active:scale-[0.99]"
              style={{
                background: on ? "rgba(var(--brand-rgb),0.05)" : "var(--surface)",
                border:     on ? "1.5px solid var(--brand)"     : "1.5px solid var(--border)",
              }}
            >
              <span
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{
                  background: on ? "rgba(var(--brand-rgb),0.1)" : "var(--elevated)",
                  border:     on ? "none" : "1px solid var(--border)",
                }}
              >
                <Icon
                  className="w-[18px] h-[18px]"
                  style={{ color: on ? "var(--brand)" : "var(--fg-muted)" }}
                  strokeWidth={1.75}
                />
              </span>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                  <span
                    className="text-[14px] font-semibold"
                    style={{ color: on ? "var(--brand)" : "var(--fg)" }}
                  >
                    {label}
                  </span>
                  {tag && (
                    <span
                      className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                      style={{
                        background: on ? "rgba(var(--brand-rgb),0.1)" : "var(--elevated)",
                        color:      on ? "var(--brand)" : "var(--fg-subtle)",
                        border:     "1px solid var(--border)",
                      }}
                    >
                      {tag}
                    </span>
                  )}
                </div>
                <span className="text-[12.5px]" style={{ color: "var(--fg-muted)" }}>{sub}</span>
              </div>

              <div className="flex flex-col items-end gap-2 shrink-0">
                <span
                  className="text-[13px] font-semibold tabular-nums"
                  style={{ color: on ? "var(--brand)" : "var(--fg-muted)" }}
                >
                  {price}
                </span>
                <span
                  className="w-5 h-5 rounded-full flex items-center justify-center"
                  style={{
                    background: on ? "var(--brand)" : "transparent",
                    border:     on ? "none" : "1.5px solid var(--border-strong)",
                  }}
                >
                  {on && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   Step B — LinkedIn URLs
═══════════════════════════════════════════════════════════════ */
type StepLinkedInPatch = Partial<Pick<WizardState, "inputMode" | "singleUrl" | "bulkText" | "csvUrls">>;

function StepLinkedIn({
  mode, singleUrl, bulkText, csvUrls, onChange,
}: {
  mode:      InputMode;
  singleUrl: string;
  bulkText:  string;
  csvUrls:   string[];
  onChange:  (p: StepLinkedInPatch) => void;
}) {
  const TABS: { id: InputMode; label: string }[] = [
    { id: "single", label: "Single URL"  },
    { id: "bulk",   label: "Bulk URLs"   },
    { id: "csv",    label: "CSV Upload"  },
  ];

  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const detectedCount =
    mode === "single" ? (normalizeUrl(singleUrl) ? 1 : 0)
    : mode === "bulk"  ? parseBulk(bulkText).length
    : csvUrls.length;

  function readFile(file: File) {
    const r = new FileReader();
    r.onload = (ev) => onChange({ csvUrls: parseCSVText(ev.target?.result as string) });
    r.readAsText(file);
  }

  return (
    <div>
      <h2
        className="text-[22px] font-bold tracking-tight mb-1.5"
        style={{ color: "var(--fg)", fontFamily: "var(--font-montserrat,'Montserrat',sans-serif)" }}
      >
        LinkedIn profiles
      </h2>
      <p className="text-[13.5px] mb-6" style={{ color: "var(--fg-muted)" }}>
        Paste the profile URLs you want to look up.
      </p>

      {/* Underline tabs */}
      <div className="flex gap-0 mb-6 border-b" style={{ borderColor: "var(--border)" }}>
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => onChange({ inputMode: id })}
            className="relative pb-2.5 mr-7 text-[13px] font-medium transition-colors"
            style={{ color: mode === id ? "var(--fg)" : "var(--fg-subtle)" }}
          >
            {label}
            {mode === id && (
              <m.span
                layoutId="tab-ul"
                className="absolute bottom-0 left-0 right-0 h-[2px] rounded-t-full"
                style={{ background: "var(--brand)" }}
                transition={{ type: "spring", stiffness: 500, damping: 40 }}
              />
            )}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {mode === "single" && (
          <m.div key="single" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.1 }}>
            <label
              className="block text-[11px] font-semibold uppercase tracking-widest mb-2"
              style={{ color: "var(--fg-subtle)" }}
            >
              LinkedIn URL
            </label>
            <input
              type="url"
              value={singleUrl}
              onChange={(e) => onChange({ singleUrl: e.target.value })}
              placeholder="https://linkedin.com/in/username"
              className="w-full px-4 py-3 rounded-xl text-[14px] outline-none transition-all"
              style={{
                background: "var(--surface)",
                border:     "1.5px solid var(--border)",
                color:      "var(--fg)",
                fontFamily: "var(--font-body)",
              }}
              onFocus={(e)  => (e.currentTarget.style.borderColor = "var(--brand)")}
              onBlur={(e)   => (e.currentTarget.style.borderColor = "var(--border)")}
            />
            {singleUrl && !normalizeUrl(singleUrl) && (
              <p className="text-[11.5px] mt-1.5" style={{ color: "#ef4444" }}>
                Needs to be a valid linkedin.com/in/ URL
              </p>
            )}
          </m.div>
        )}

        {mode === "bulk" && (
          <m.div key="bulk" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.1 }}>
            <div className="flex items-center justify-between mb-2">
              <label
                className="text-[11px] font-semibold uppercase tracking-widest"
                style={{ color: "var(--fg-subtle)" }}
              >
                One URL per line
              </label>
              {detectedCount > 0 && (
                <span
                  className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                  style={{ background: "rgba(var(--brand-rgb),0.08)", color: "var(--brand)" }}
                >
                  {detectedCount} detected
                </span>
              )}
            </div>
            <textarea
              value={bulkText}
              onChange={(e) => onChange({ bulkText: e.target.value })}
              placeholder={"https://linkedin.com/in/alice\nhttps://linkedin.com/in/bob\nhttps://linkedin.com/in/carol"}
              rows={7}
              className="w-full px-4 py-3 rounded-xl text-[13.5px] resize-none outline-none leading-relaxed"
              style={{
                background: "var(--surface)",
                border:     "1.5px solid var(--border)",
                color:      "var(--fg)",
                fontFamily: "var(--font-body)",
                transition: "border-color 0.15s",
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "var(--brand)")}
              onBlur={(e)  => (e.currentTarget.style.borderColor = "var(--border)")}
            />
          </m.div>
        )}

        {mode === "csv" && (
          <m.div key="csv" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.1 }}>
            {csvUrls.length === 0 ? (
              <>
                <input
                  ref={fileRef} type="file" accept=".csv,text/csv" className="sr-only"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) readFile(f); }}
                />
                <button
                  onDragEnter={(e) => { e.preventDefault(); setDragging(true);  }}
                  onDragOver={(e)  => { e.preventDefault(); setDragging(true);  }}
                  onDragLeave={()  => setDragging(false)}
                  onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) readFile(f); }}
                  onClick={() => fileRef.current?.click()}
                  className="w-full flex flex-col items-center justify-center py-12 rounded-2xl transition-all"
                  style={{
                    border:     `2px dashed ${dragging ? "var(--brand)" : "var(--border-strong)"}`,
                    background: dragging ? "rgba(var(--brand-rgb),0.04)" : "var(--surface)",
                    cursor:     "pointer",
                  }}
                >
                  <Upload
                    className="w-7 h-7 mb-3"
                    style={{ color: dragging ? "var(--brand)" : "var(--fg-subtle)" }}
                    strokeWidth={1.5}
                  />
                  <p className="text-[14px] font-medium mb-1" style={{ color: "var(--fg)" }}>
                    Drop CSV here or <span style={{ color: "var(--brand)" }}>browse</span>
                  </p>
                  <p className="text-[12px]" style={{ color: "var(--fg-muted)" }}>
                    LinkedIn URLs auto-detected from any column
                  </p>
                </button>
              </>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span
                    className="text-[12px] font-semibold px-2.5 py-1 rounded-full"
                    style={{ background: "rgba(var(--brand-rgb),0.08)", color: "var(--brand)" }}
                  >
                    {csvUrls.length} URL{csvUrls.length !== 1 ? "s" : ""} parsed
                  </span>
                  <button
                    onClick={() => onChange({ csvUrls: [] })}
                    className="flex items-center gap-1 text-[12px] transition-opacity hover:opacity-60"
                    style={{ color: "var(--fg-muted)" }}
                  >
                    <X className="w-3.5 h-3.5" /> Replace
                  </button>
                </div>
                <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
                  <div
                    className="px-4 py-2.5 text-[10.5px] font-semibold uppercase tracking-wide"
                    style={{ background: "var(--elevated)", color: "var(--fg-subtle)", borderBottom: "1px solid var(--border)" }}
                  >
                    Preview
                  </div>
                  <div className="max-h-[160px] overflow-y-auto">
                    {csvUrls.slice(0, 20).map((url, i) => (
                      <div
                        key={i}
                        className="px-4 py-2 text-[12.5px] font-mono truncate"
                        style={{
                          color:        "var(--fg-muted)",
                          borderBottom: i < Math.min(csvUrls.length, 20) - 1 ? "1px solid var(--border)" : "none",
                        }}
                      >
                        {url}
                      </div>
                    ))}
                    {csvUrls.length > 20 && (
                      <div className="px-4 py-2 text-[12px]" style={{ color: "var(--fg-subtle)", borderTop: "1px solid var(--border)" }}>
                        +{csvUrls.length - 20} more
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   Step C — Add-ons
═══════════════════════════════════════════════════════════════ */
function StepAddons({
  emailDraft, qty, onChange,
}: { emailDraft: boolean; qty: number; onChange: (v: boolean) => void }) {
  return (
    <div>
      <h2
        className="text-[22px] font-bold tracking-tight mb-1.5"
        style={{ color: "var(--fg)", fontFamily: "var(--font-montserrat,'Montserrat',sans-serif)" }}
      >
        Add-ons
      </h2>
      <p className="text-[13.5px] mb-7" style={{ color: "var(--fg-muted)" }}>
        Optional extras to supercharge your outreach.
      </p>

      <button
        onClick={() => onChange(!emailDraft)}
        className="w-full flex items-start gap-4 px-5 py-4 rounded-2xl text-left transition-all duration-150 active:scale-[0.99]"
        style={{
          background: emailDraft ? "rgba(var(--brand-rgb),0.04)" : "var(--surface)",
          border:     emailDraft ? "1.5px solid var(--brand)"     : "1.5px solid var(--border)",
        }}
      >
        <span
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
          style={{
            background: emailDraft ? "rgba(var(--brand-rgb),0.1)" : "var(--elevated)",
            border:     emailDraft ? "none" : "1px solid var(--border)",
          }}
        >
          <FileText className="w-[18px] h-[18px]" style={{ color: emailDraft ? "var(--brand)" : "var(--fg-muted)" }} strokeWidth={1.75} />
        </span>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-[14px] font-semibold" style={{ color: emailDraft ? "var(--brand)" : "var(--fg)" }}>
              AI Email Draft
            </span>
            <span
              className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
              style={{
                background: "rgba(16,185,129,0.08)",
                color:      "#10b981",
                border:     "1px solid rgba(16,185,129,0.15)",
              }}
            >
              Boost reply rates
            </span>
          </div>
          <p className="text-[12.5px]" style={{ color: "var(--fg-muted)" }}>
            Personalised cold outreach email per profile, written by AI.
          </p>
          {emailDraft && qty > 0 && (
            <p className="text-[12px] mt-1.5 font-medium" style={{ color: "var(--brand)" }}>
              +${(qty * DRAFT_PRICE).toFixed(2)} for {qty} profile{qty !== 1 ? "s" : ""}
            </p>
          )}
        </div>

        {/* Toggle */}
        <span
          className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 shrink-0 mt-1"
          style={{ background: emailDraft ? "var(--brand)" : "var(--border-strong)" }}
        >
          <m.span
            layout
            className="inline-block h-4 w-4 rounded-full bg-white shadow-sm"
            animate={{ x: emailDraft ? 22 : 2 }}
            transition={{ type: "spring", stiffness: 500, damping: 35 }}
          />
        </span>
      </button>

      {!emailDraft && (
        <p className="text-[12px] mt-5 text-center" style={{ color: "var(--fg-subtle)" }}>
          No add-ons — skip to continue.
        </p>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   Step D — Order Summary + Payment
═══════════════════════════════════════════════════════════════ */
const CONTACT_LABEL: Record<ContactType, string> = {
  phone: "Mobile Numbers",
  email: "Email Addresses",
  both:  "Email + Phone",
};

function StepSummary({
  contactType, inputMode, urls, emailDraft,
  contactCost, draftCost, total,
  credits, canCredit, onBack,
}: {
  contactType:  ContactType;
  inputMode:    InputMode;
  urls:         string[];
  emailDraft:   boolean;
  contactCost:  number;
  draftCost:    number;
  total:        number;
  credits:      number;
  canCredit:    boolean;
  onBack:       () => void;
}) {
  const router = useRouter();
  const [busy,     setBusy]    = useState(false);
  const [success,  setSuccess] = useState(false);
  const [payErr,   setPayErr]  = useState<string | null>(null);

  const qty       = urls.length;
  const inputType = inputMode === "csv" ? "csv" : "single";

  async function useCredits() {
    setBusy(true); setPayErr(null);
    try {
      const res = await fetch("/api/orders/create", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          contact_type:          contactType,
          linkedin_urls:         urls,
          email_draft_requested: emailDraft,
          amount_paid:           0,
          use_credits:           true,
          input_type:            inputType,
        }),
      });
      const data = await res.json() as { orderId?: string; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Failed");
      setSuccess(true);
      setTimeout(() => router.push("/dashboard/orders"), 1800);
    } catch (e) {
      setPayErr((e as Error).message);
    } finally { setBusy(false); }
  }

  async function createPayPalOrder() {
    const res  = await fetch("/api/paypal/create-order", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ amount: total }),
    });
    const data = await res.json() as { id?: string; error?: string };
    if (!res.ok || !data.id) throw new Error(data.error ?? "Failed to create PayPal order");
    return data.id;
  }

  async function onApprove(data: { orderID: string }) {
    setBusy(true); setPayErr(null);
    try {
      const cap = await fetch("/api/paypal/capture-order", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ orderID: data.orderID }),
      });
      if (!cap.ok) {
        const capData = await cap.json().catch(() => ({})) as { error?: string };
        throw new Error(capData.error ?? "Capture failed");
      }

      // Payment captured. Retry order creation up to 3x — server is idempotent
      // on paypal_order_id so retries are safe.
      const orderPayload = JSON.stringify({
        contact_type:          contactType,
        linkedin_urls:         urls,
        email_draft_requested: emailDraft,
        amount_paid:           total,
        paypal_order_id:       data.orderID,
        use_credits:           false,
        input_type:            inputType,
      });

      let lastError = "Order failed";
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          const ord = await fetch("/api/orders/create", {
            method:  "POST",
            headers: { "Content-Type": "application/json" },
            body:    orderPayload,
          });
          const d = await ord.json() as { orderId?: string; error?: string };
          if (ord.ok && d.orderId) {
            setSuccess(true);
            setTimeout(() => router.push("/dashboard/orders"), 1800);
            return;
          }
          lastError = d.error ?? "Order failed";
        } catch (e) {
          lastError = (e as Error).message;
        }
        if (attempt < 2) await new Promise((r) => setTimeout(r, 800 * (attempt + 1)));
      }

      // All retries failed. Payment is captured but order is not saved.
      // Server-side orphan alert has already fired; show user a support ref.
      setPayErr(
        `${lastError}. Your payment was received — please contact support with PayPal reference: ${data.orderID}`
      );
    } catch (e) {
      setPayErr((e as Error).message);
    } finally { setBusy(false); }
  }

  if (success) {
    return (
      <m.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-14 text-center"
      >
        <m.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 22, delay: 0.1 }}
          className="w-16 h-16 rounded-full flex items-center justify-center mb-5"
          style={{ background: "rgba(16,185,129,0.1)", border: "2px solid #10b981" }}
        >
          <Check className="w-8 h-8" style={{ color: "#10b981" }} strokeWidth={2.5} />
        </m.span>
        <h3
          className="text-[20px] font-bold mb-2"
          style={{ color: "var(--fg)", fontFamily: "var(--font-montserrat,'Montserrat',sans-serif)" }}
        >
          Order placed!
        </h3>
        <p className="text-[13.5px]" style={{ color: "var(--fg-muted)" }}>
          Redirecting to your orders…
        </p>
      </m.div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-1.5">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-[13px] font-medium transition-opacity hover:opacity-60"
          style={{ color: "var(--fg-muted)" }}
        >
          <ChevronLeft className="w-4 h-4" /> Edit
        </button>
      </div>
      <h2
        className="text-[22px] font-bold tracking-tight mb-1.5"
        style={{ color: "var(--fg)", fontFamily: "var(--font-montserrat,'Montserrat',sans-serif)" }}
      >
        Order summary
      </h2>
      <p className="text-[13.5px] mb-6" style={{ color: "var(--fg-muted)" }}>
        Review before paying.
      </p>

      {/* Line items */}
      <div className="rounded-2xl overflow-hidden mb-5" style={{ border: "1px solid var(--border)" }}>
        <LineItem
          label={`${qty} × ${CONTACT_LABEL[contactType]}`}
          sub={`$${PRICE[contactType].toFixed(2)} per contact`}
          amount={contactCost}
        />
        {emailDraft && (
          <LineItem
            label={`${qty} × AI Email Draft`}
            sub="$1.00 per profile"
            amount={draftCost}
          />
        )}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ background: "var(--elevated)", borderTop: "1px solid var(--border)" }}
        >
          <span
            className="text-[14px] font-bold"
            style={{ color: "var(--fg)", fontFamily: "var(--font-montserrat,'Montserrat',sans-serif)" }}
          >
            Total
          </span>
          <span
            className="text-[22px] font-black tabular-nums"
            style={{ color: "var(--fg)", fontFamily: "var(--font-montserrat,'Montserrat',sans-serif)" }}
          >
            ${total.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Error */}
      {payErr && (
        <div
          className="mb-4 flex items-center gap-2 px-4 py-3 rounded-xl text-[13px]"
          style={{ background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.2)", color: "#dc2626" }}
        >
          <AlertCircle className="w-4 h-4 shrink-0" />
          {payErr}
        </div>
      )}

      {/* Use credits */}
      {canCredit && (
        <>
          <button
            onClick={useCredits}
            disabled={busy}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-[14px] font-semibold mb-3 transition-all active:scale-[0.98] hover:brightness-90 disabled:opacity-50"
            style={{
              background: "rgba(var(--brand-rgb),0.08)",
              border:     "1.5px solid rgba(var(--brand-rgb),0.2)",
              color:      "var(--brand)",
            }}
          >
            <Zap className="w-4 h-4" />
            {busy ? "Processing…" : `Use ${qty} Free Credit${qty !== 1 ? "s" : ""}`}
          </button>

          <div className="flex items-center gap-3 mb-3">
            <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
            <span className="text-[11px] font-medium" style={{ color: "var(--fg-subtle)" }}>or pay with</span>
            <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
          </div>
        </>
      )}

      {/* PayPal */}
      {busy ? (
        <div className="py-5 text-center text-[13px]" style={{ color: "var(--fg-muted)" }}>
          Processing…
        </div>
      ) : (
        <PPButtons
          createOrder={createPayPalOrder}
          onApprove={onApprove}
          onError={() => setPayErr("PayPal error — please try again.")}
        />
      )}
    </div>
  );
}

function LineItem({ label, sub, amount }: { label: string; sub: string; amount: number }) {
  return (
    <div
      className="flex items-center justify-between px-5 py-4"
      style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)" }}
    >
      <div>
        <p className="text-[13.5px] font-medium" style={{ color: "var(--fg)" }}>{label}</p>
        <p className="text-[12px]" style={{ color: "var(--fg-muted)" }}>{sub}</p>
      </div>
      <span className="text-[15px] font-semibold tabular-nums" style={{ color: "var(--fg)" }}>
        ${amount.toFixed(2)}
      </span>
    </div>
  );
}

function PPButtons({
  createOrder, onApprove, onError,
}: {
  createOrder: () => Promise<string>;
  onApprove:   (d: { orderID: string }) => Promise<void>;
  onError:     (e: unknown) => void;
}) {
  const [{ isPending }] = usePayPalScriptReducer();
  if (isPending) {
    return (
      <div
        className="w-full h-12 rounded-xl animate-pulse"
        style={{ background: "var(--elevated)", border: "1px solid var(--border)" }}
      />
    );
  }
  return (
    <PayPalButtons
      style={{ layout: "vertical", color: "blue", shape: "rect", label: "pay", height: 48 }}
      createOrder={createOrder}
      onApprove={onApprove}
      onError={onError}
    />
  );
}

/* ─── React import ───────────────────────────────────────────── */
import type React from "react";
