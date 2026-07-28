"use client";

import Link from "next/link";
import { m, AnimatePresence } from "framer-motion";
import { SectionBadge } from "@/components/ui/SectionBadge";
import { HeadingAccent } from "@/components/ui/HeadingAccent";
import { Check, ArrowRight, Zap, Phone, Mail, Layers } from "lucide-react";
import { useMemo, useState } from "react";
import { UNIT_DOLLARS } from "@/lib/pricing";

// ── Pricing logic (canonical source: lib/pricing) ──────────────────────────────
type Category = "email" | "phone" | "combo";

// FP-01: flat per-unit pricing with a 10% combo bundle discount. No volume tiers.
function calcPrice(qty: number, cat: Category): number {
  const t = cat === "combo" ? "both" : cat;
  return qty * UNIT_DOLLARS[t];
}

// ── Static data ───────────────────────────────────────────────────────────────
const PRODUCT_CARDS = [
  {
    id: "email" as Category,
    icon: Mail,
    label: "Email Address",
    price: "$0.20",
    unit: "per verified email",
    accent: "#0038FF",
    accentBg: "rgba(0,56,255,0.06)",
    accentBorder: "rgba(0,56,255,0.15)",
    popular: false,
    features: [
      "SMTP deliverability verified",
      "Business email, not personal",
      "Matched to LinkedIn profile",
      "Charged only on success",
    ],
  },
  {
    id: "phone" as Category,
    icon: Phone,
    label: "Direct Mobile",
    price: "$1.00",
    unit: "per verified number",
    accent: "#0038FF",
    accentBg: "rgba(0,56,255,0.08)",
    accentBorder: "rgba(0,56,255,0.2)",
    popular: true,
    features: [
      "Live carrier record validated",
      "Direct mobile, not switchboard",
      "Matched to LinkedIn profile",
      "Charged only on success",
    ],
  },
  {
    id: "combo" as Category,
    icon: Layers,
    label: "Phone + Email",
    price: "$1.08",
    unit: "bundle · 10% off both",
    accent: "#0038FF",
    accentBg: "rgba(0,56,255,0.05)",
    accentBorder: "rgba(0,56,255,0.12)",
    popular: false,
    features: [
      "Both phone and email in one order",
      "Auto 10% bundle discount",
      "Single LinkedIn URL lookup",
      "Charged only on success",
    ],
  },
];

const GUARANTEES = [
  { icon: "✓", text: "Credits never expire" },
  { icon: "✓", text: "No monthly fee" },
  { icon: "✓", text: "No charge on failed lookups" },
  { icon: "✓", text: "First lookup free" },
];

const CALC_PRESETS: Record<Category, number[]> = {
  email: [100, 500, 1000],
  phone: [50, 100, 500],
  combo: [50, 100, 500],
};
const CALC_MAX: Record<Category, number> = { email: 5000, phone: 10000, combo: 5000 };
const CALC_STEP: Record<Category, number> = { email: 10, phone: 1, combo: 10 };

// ── Sub-components ────────────────────────────────────────────────────────────
function ProductCard({ card, index, active, onSelect }: {
  card: typeof PRODUCT_CARDS[0];
  index: number;
  active: boolean;
  onSelect: () => void;
}) {
  const Icon = card.icon;
  return (
    <m.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      onClick={onSelect}
      className="relative flex flex-col rounded-2xl p-6 cursor-pointer transition-all duration-300"
      style={{
        background: active ? card.accentBg : "var(--c-section-card)",
        border: `1.5px solid ${active ? card.accent : "rgba(0,56,255,0.1)"}`,
        boxShadow: active
          ? `0 8px 32px ${card.accentBg}, 0 2px 8px rgba(0,0,0,0.06)`
          : "0 2px 20px rgba(0,56,255,0.06)",
      }}
    >
      {card.popular && (
        <div
          className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[13px] font-bold uppercase tracking-widest text-white"
          style={{ background: "#0038FF" }}
        >
          Most Popular
        </div>
      )}

      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: card.accentBg, border: `1px solid ${card.accentBorder}` }}
        >
          <Icon className="w-5 h-5" style={{ color: card.accent }} strokeWidth={2} />
        </div>
        <div>
          <p className="text-[14px] font-semibold uppercase tracking-widest" style={{ color: "var(--c-heading)" }}>
            {card.label}
          </p>
          <div className="flex items-baseline gap-1.5">
            <span
              className="text-[32px] font-black tracking-tight leading-none"
              style={{ color: "var(--c-heading)", fontFamily: "var(--font-montserrat, 'Montserrat', sans-serif)" }}
            >
              {card.price}
            </span>
            <span className="text-[13px]" style={{ color: "var(--c-heading)" }}>{card.unit}</span>
          </div>
        </div>
      </div>

      <ul className="flex flex-col gap-2 mb-5">
        {card.features.map((f) => (
          <li key={f} className="flex items-start gap-2" style={{ fontSize: 16, color: "var(--c-heading)" }}>
            <Check className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: "#0038FF" }} strokeWidth={2.5} />
            {f}
          </li>
        ))}
      </ul>

      <button
        className="mt-auto w-full py-2.5 rounded-xl text-[16px] font-semibold transition-all"
        style={{
          background: active ? "#0038FF" : "var(--c-section-card-inner)",
          color: active ? "#ffffff" : "var(--c-body)",
          border: `1px solid ${active ? "#0038FF" : "var(--c-border-light)"}`,
        }}
      >
        {active ? "Selected, see estimate ↓" : "Calculate price"}
      </button>
    </m.div>
  );
}

// ── Main Section ──────────────────────────────────────────────────────────────
export default function Pricing() {
  const [category, setCategory] = useState<Category>("phone");
  const [qty, setQty] = useState(100);

  const max = CALC_MAX[category];
  const step = CALC_STEP[category];
  const presets = CALC_PRESETS[category];
  const sliderPct = (qty / max) * 100;

  const price = useMemo(() => calcPrice(qty, category), [qty, category]);
  const perUnit = qty > 0 ? price / qty : 0;

  const fmt = (n: number) =>
    n.toLocaleString("en-US", { minimumFractionDigits: n < 10 ? 2 : 0, maximumFractionDigits: 2 });

  const handleCard = (cat: Category) => {
    setCategory(cat);
    setQty(CALC_PRESETS[cat][0]);
  };

  return (
    <section id="pricing" className="py-14 md:py-24" style={{ background: "var(--c-section-bg-alt)", scrollMarginTop: "80px" }}>
      <div className="max-w-[1120px] mx-auto px-5 md:px-8">

        {/* ── Header ── */}
        <m.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-14 text-center flex flex-col items-center"
        >
          <SectionBadge variant="light" className="mb-5">Pricing</SectionBadge>
          <h2
            className="font-extrabold tracking-tight leading-[1.1] mb-4"
            style={{
              fontSize: "clamp(1.5rem, 3.5vw, 2.75rem)",
              color: "var(--c-heading)",
              fontFamily: "var(--font-montserrat, 'Montserrat', sans-serif)",
              fontWeight: 800,
             
            }}
          >
            Pay only for <HeadingAccent>what you get.</HeadingAccent>
            <br />Not a penny more.
          </h2>
          <p className="leading-relaxed" style={{ fontSize: "clamp(16px,2.5vw,22px)", color: "var(--c-heading)" }}>
            Pay for <span style={{ color: "#0038FF", fontWeight: 700 }}>results</span>, not access.{" "} <br />
            <span style={{ fontWeight: 700 }}>One credit = one verified contact</span><br />
            <span style={{ fontWeight: 700 }}>No contracts. No surprises.</span>{" "}
            <span style={{ color: "#0038FF", fontWeight: 800 }}>Ever.</span>
          </p>
        </m.div>

        {/* ── Product Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-12">
          {PRODUCT_CARDS.map((card, i) => (
            <ProductCard
              key={card.id}
              card={card}
              index={i}
              active={category === card.id}
              onSelect={() => handleCard(card.id)}
            />
          ))}
        </div>

        {/* ── Live Calculator ── */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-3xl overflow-hidden mb-6"
          style={{ border: "1.5px solid rgba(0,56,255,0.18)", boxShadow: "0 8px 40px rgba(0,56,255,0.1)" }}
        >
          {/* Calculator header */}
          <div
            className="px-6 sm:px-8 py-4 flex items-center justify-between"
            style={{ background: "var(--c-section-card)", borderBottom: "1px solid var(--c-border-light)" }}
          >
            <p className="text-[14px] font-bold uppercase tracking-[0.15em]" style={{ color: "#0038FF" }}>
              Live Price Estimator
            </p>
            <div className="flex gap-2">
              {(["email", "phone", "combo"] as Category[]).map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleCard(cat)}
                  className="px-3 py-1 rounded-full text-[13px] font-semibold capitalize transition-all"
                  style={{
                    background: category === cat ? "#0038FF" : "transparent",
                    color: category === cat ? "#ffffff" : "var(--c-heading)",
                    border: `1px solid ${category === cat ? "#0038FF" : "rgba(0,0,0,0.1)"}`,
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6 sm:p-8" style={{ background: "var(--c-section-card)" }}>
            <div className="flex items-baseline justify-between mb-4">
              <p className="text-[13px] font-semibold uppercase tracking-[0.15em]" style={{ color: "var(--c-heading)" }}>
                Quantity
              </p>
              <p className="text-[13px]" style={{ color: "var(--c-heading)" }}>
                Max {max.toLocaleString()}
              </p>
            </div>

            {/* Number input + slider */}
            <div className="flex items-center gap-4 mb-4">
              <button
                onClick={() => setQty((q) => Math.max(1, q - step))}
                disabled={qty <= 1}
                className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all disabled:opacity-25 active:scale-95"
                style={{ border: "1.5px solid var(--c-border-light)", background: "var(--c-section-bg-alt)", color: "var(--c-body)" }}
              >
                <span className="text-lg font-bold leading-none">−</span>
              </button>
              <input
                type="number"
                aria-label="Number of lookups"
                value={qty}
                onChange={(e) => setQty(Math.max(1, Math.min(max, parseInt(e.target.value) || 1)))}
                className="flex-1 text-[32px] sm:text-[48px] font-black tracking-tight bg-transparent outline-none text-center"
                style={{ color: "var(--c-heading)", fontFamily: "var(--font-montserrat, 'Montserrat', sans-serif)", minWidth: 0, background: "transparent" }}
              />
              <button
                onClick={() => setQty((q) => Math.min(max, q + step))}
                disabled={qty >= max}
                className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all disabled:opacity-25 active:scale-95 text-white"
                style={{ background: "#0038FF" }}
              >
                <span className="text-lg font-bold leading-none">+</span>
              </button>
            </div>

            {/* Slider */}
            <input
              type="range" min={1} max={max} step={step} value={qty}
              aria-label="Lookup quantity slider"
              onChange={(e) => setQty(parseInt(e.target.value))}
              className="pricing-slider w-full mb-4"
              style={{
                background: `linear-gradient(to right, #0038FF 0%, #0038FF ${sliderPct}%, #e5e7eb ${sliderPct}%, #e5e7eb 100%)`,
              }}
            />

            {/* Presets */}
            <div className="flex flex-wrap gap-2 mb-0">
              {presets.map((p) => (
                <button
                  key={p}
                  onClick={() => setQty(p)}
                  className="px-3 py-1.5 rounded-full text-[14px] font-semibold border transition-all active:scale-95"
                  style={{
                    borderColor: qty === p ? "#0038FF" : "rgba(0,0,0,0.1)",
                    background: qty === p ? "#0038FF" : "transparent",
                    color: qty === p ? "#ffffff" : "var(--c-heading)",
                  }}
                >
                  {p.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          {/* Price strip */}
          <div
            className="px-6 sm:px-8 py-6 flex flex-col sm:flex-row sm:items-center gap-5"
            style={{ background: "#0038FF" }}
          >
            <div className="flex-1">
              <p className="text-[13px] font-semibold uppercase tracking-widest text-white/60 mb-1">
                Estimated Total
              </p>
              <div className="flex items-baseline gap-1.5 flex-wrap">
                <span className="text-[20px] text-white/70 font-light">$</span>
                <AnimatePresence mode="popLayout">
                  <m.span
                    key={Math.round(price * 100)}
                    initial={{ y: 8, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -8, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="text-[36px] sm:text-[52px] font-black tracking-tight leading-none text-white"
                    style={{ fontFamily: "var(--font-montserrat, 'Montserrat', sans-serif)" }}
                  >
                    {fmt(price)}
                  </m.span>
                </AnimatePresence>
                <span className="text-[14px] text-white/50 ml-1">
                  · ${perUnit.toFixed(2)} per {category === "combo" ? "contact" : category === "email" ? "email" : "number"}
                </span>
              </div>
            </div>
            <Link
              href="/signup"
              className="h-12 px-7 rounded-2xl text-[16px] font-bold flex items-center justify-center gap-2 transition-all hover:scale-[1.03] active:scale-[0.97] whitespace-nowrap shrink-0"
              style={{ background: "var(--c-section-card)", color: "#0038FF" }}
            >
              Get {qty.toLocaleString()} contacts
              <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
            </Link>
          </div>
        </m.div>

        {/* ── Guarantees ── */}
        <m.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6"
        >
          {GUARANTEES.map((g) => (
            <div
              key={g.text}
              className="flex items-center gap-2 px-4 py-3 rounded-xl text-[14px] font-medium"
              style={{ background: "rgba(0,56,255,0.04)", border: "1px solid rgba(0,56,255,0.1)", color: "var(--c-body)" }}
            >
              <Check className="w-3.5 h-3.5 shrink-0" style={{ color: "#0038FF" }} strokeWidth={2.5} />
              {g.text}
            </div>
          ))}
        </m.div>

        <p className="text-[14px] text-center" style={{ color: "var(--c-heading)" }}>
          Need more than 10,000 contacts per month?{" "}
          <Link href="/contact" className="font-semibold underline underline-offset-2" style={{ color: "#0038FF" }}>
            Talk to us
          </Link>{" "}
          for custom enterprise pricing.
        </p>
      </div>
    </section>
  );
}
