/**
 * Canonical pricing — the SINGLE source of truth for what a lookup costs (FP-01).
 *
 * Every surface that quotes or charges a price MUST import from here:
 *   - marketing calculator   (components/sections/Pricing.tsx)
 *   - order wizard           (components/dashboard/SubmitOrder/SubmitWizard.tsx)
 *   - PayPal order creation   (app/api/paypal/create-order/route.ts)
 *   - order creation          (app/api/orders/create/route.ts)
 *   - support chatbot prompt  (app/api/chatbot/route.ts)
 *
 * Policy (per product decision): flat per-unit pricing with a 10% bundle discount
 * on the Email+Phone combo. NO per-quantity volume tiers.
 *
 *   email  = $0.20 / profile
 *   phone  = $1.00 / profile
 *   both   = ($1.00 + $0.20) * 0.90 = $1.08 / profile   (10% combo discount)
 *   AI email draft add-on = +$1.00 / profile
 *
 * All money math is done in INTEGER CENTS to avoid floating-point drift.
 */

export type ContactType = "email" | "phone" | "both";

/** Per-profile price in integer cents. */
export const UNIT_CENTS: Record<ContactType, number> = {
  email: 20,
  phone: 100,
  both: 108, // (100 + 20) * 0.9 — 10% combo bundle discount
};

/** AI email-draft add-on, per profile, in integer cents. */
export const DRAFT_CENTS = 100;

/** Dollar mirrors for display (derived — never edit independently). */
export const UNIT_DOLLARS: Record<ContactType, number> = {
  email: UNIT_CENTS.email / 100,
  phone: UNIT_CENTS.phone / 100,
  both: UNIT_CENTS.both / 100,
};
export const DRAFT_DOLLARS = DRAFT_CENTS / 100;

/** Cost of the contact lookups alone, in integer cents. */
export function contactCents(contactType: ContactType, qty: number): number {
  return qty * UNIT_CENTS[contactType];
}

/** Total quote in integer cents, including the optional AI draft add-on. */
export function quoteCents(opts: {
  contactType: ContactType;
  qty: number;
  emailDraft: boolean;
}): number {
  const { contactType, qty, emailDraft } = opts;
  return contactCents(contactType, qty) + (emailDraft ? qty * DRAFT_CENTS : 0);
}
