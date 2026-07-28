# StealthConnect AI — Implementation Roadmap (Phase 8)

> **Purpose:** A sequenced 4-week plan to take the codebase from "audited" to "launch-ready and hardened". Each task lists **Goal · Files · Dependencies · Risks · Expected outcome**.
> **Priorities** map to `docs/07`. Step-by-step prompts for executing each item are in `docs/09`.
> **Assumption:** 1–2 engineers. Weeks 1–2 are launch-gating; weeks 3–4 are hardening/polish.

---

## Week 1 — Launch blockers (P0) + immediate abuse protection

### W1-T1 — Sanitise identity headers in middleware (SEC-CRIT-01) — `docs/09` FP-03
- **Goal:** Make `x-user-id`/`x-user-email` strictly server-controlled; never honour client-supplied values.
- **Files:** `lib/supabase/middleware.ts`; (verify) `proxy.ts` matcher; smoke-test all `app/api/**/route.ts`.
- **Dependencies:** None — start here.
- **Risks:** Low. Must ensure authenticated requests still receive the header (they will — it's set when `user` exists). Test logged-in dashboard + API calls after.
- **Expected outcome:** Forged-header requests are rejected (401) on every API route; authenticated flows unchanged.

### W1-T2 — Fix order-status enum drift (F-PAY-02) — `docs/09` FP-02
- **Goal:** One canonical terminal status across DB + API + UI.
- **Files:** new `supabase/migrations/005_status_align.sql`; `app/api/admin/orders/route.ts:53`; `components/admin/AdminDashboard.tsx:18,21-27`; `components/dashboard/Orders/OrdersView.tsx:12,31-37`; `app/dashboard/page.tsx:16,49`; `types/database.ts`.
- **Dependencies:** Decide term — recommend keeping DB `completed` and renaming app `delivered → completed` (also set `delivered_at`).
- **Risks:** Medium — a DB migration. If choosing to ADD `delivered` to the enum, note `ALTER TYPE … ADD VALUE` can't run inside a transaction block on some setups; coordinate carefully. Back up first.
- **Expected outcome:** Admin can move orders to the terminal state; customers see "Completed/Delivered"; dashboard KPI populates.

### W1-T3 — Single pricing source-of-truth (F-PAY-01) — `docs/09` FP-01
- **Goal:** The price advertised equals the price charged, everywhere.
- **Files:** new `lib/pricing.ts`; `components/sections/Pricing.tsx`; `components/dashboard/SubmitOrder/SubmitWizard.tsx:30`; `app/api/paypal/create-order/route.ts:14`; `app/api/orders/create/route.ts:20`; `app/api/chatbot/route.ts:9`.
- **Dependencies:** Business decision — **either** implement volume/combo discounts server-side **or** remove them from marketing. (Recommend: implement them server-side; they're a selling point.)
- **Risks:** Medium — touches money math; cover with unit tests for tier boundaries (9→10, 99→100, etc.) and combo.
- **Expected outcome:** Calculator, wizard, PayPal order, credits order, and chatbot all return identical prices.

### W1-T4 — Fill Terms legal placeholders (P0-4)
- **Goal:** Enforceable Terms before taking real money.
- **Files:** `app/terms/page.tsx:62` (Section 10).
- **Dependencies:** **Legal counsel** must supply jurisdiction/arbitration values. (Engineering time is trivial; turnaround is the gate.)
- **Risks:** Low (engineering). Don't guess legal values.
- **Expected outcome:** No `[PLACEHOLDER]` text in the published contract.

### W1-T5 — Rate-limit + protect public endpoints (SEC-H2 / P1-1) — `docs/09` FP-04
- **Goal:** Stop cost-DoS on `/api/chatbot` and spam on `/api/contact`.
- **Files:** `app/api/chatbot/route.ts`, `app/api/contact/route.ts`, `components/ContactForm.tsx` (honeypot), `lib/rate-limit.ts` (or new shared limiter).
- **Dependencies:** Decide limiter backend (start with IP-based using existing limiter or Vercel Firewall rules; upgrade to shared store in W2).
- **Risks:** Low. Tune limits to avoid blocking legit bursts.
- **Expected outcome:** Abusive volume returns 429; honeypot blocks bots; LLM/email spend bounded.

### W1-T6 — Reliable order confirmation + verified sender (F-PAY-03 / P1-3) — `docs/09` FP-05
- **Goal:** Customers always get a receipt from a verified domain.
- **Files:** `app/api/orders/create/route.ts:240-242`, `lib/email.ts:8`, `lib/env.ts`.
- **Dependencies:** Verified Resend domain + `EMAIL_FROM` env set.
- **Risks:** Low.
- **Expected outcome:** Confirmation failures are captured as `pending_alert` (retryable); no `onboarding@resend.dev` fallback in prod.

**End of Week 1:** All four P0s closed; the two most dangerous launch-day abuse vectors mitigated. → **Launch-ready gate.**

---

## Week 2 — Remaining critical hardening (P1)

### W2-T1 — Use RLS-scoped clients for user data (SEC-H1)
- **Goal:** Make RLS a live second gate; shrink service-role blast radius.
- **Files:** `lib/supabase/server.ts` (use `createClient()` anon path); user-scoped reads in `app/dashboard/**`, `app/api/orders/list`, `app/api/credits/use`; keep service-role only for RPCs/webhooks/admin grants.
- **Dependencies:** W1-T1 (so identity is trustworthy first).
- **Risks:** Medium — RLS policies must actually permit the intended reads; test each migrated query against `migrations/002`.
- **Expected outcome:** A handler bug or future flaw can no longer read the whole DB.

### W2-T2 — Guarantee atomic credits / verify migration 004 (F-CRED-01)
- **Goal:** No silent downgrade to non-atomic deduction.
- **Files:** `lib/admin-db.ts:36-72`; add a startup/health check that `deduct_credit(uuid,int)` exists; ensure 004 applied in prod.
- **Dependencies:** DB access to confirm migration state.
- **Risks:** Low.
- **Expected outcome:** RPC failure is loud, not silently weaker.

### W2-T3 — Reconcile data retention with policy (SEC-H5)
- **Goal:** Practice matches the privacy/chatbot promises.
- **Files:** `supabase/migrations` (retention/erasure for `orders.linkedin_urls`), `app/api/chatbot/route.ts:16`, `app/privacy/page.tsx`, GDPR erasure routine.
- **Dependencies:** Counsel sign-off on retention period.
- **Risks:** Medium — deleting/hashing operational data; ensure fulfilment isn't broken.
- **Expected outcome:** Documented retention + erasure; no policy contradiction.

### W2-T4 — Replace fabricated testimonials/faces (F-PUB-02)
- **Goal:** Remove fake-endorsement risk.
- **Files:** `components/sections/Testimonials.tsx`, `app/(auth)/login/LoginClient.tsx:9-28`, `signup/SignupClient.tsx:12-31`.
- **Dependencies:** Real testimonials/logos (or interim metric-led proof).
- **Risks:** Low.
- **Expected outcome:** Only genuine, consented social proof (or none).

### W2-T5 — Distributed rate limiting + nonce CSP (SEC-H3, SEC-H4)
- **Goal:** Edge-effective throttling; meaningful XSS defence.
- **Files:** shared limiter (Upstash/marketplace store) or Vercel Firewall; `next.config.ts` CSP → nonce/`strict-dynamic` via middleware.
- **Dependencies:** Store provisioning; Next nonce wiring.
- **Risks:** Medium — nonce CSP can break inline scripts/styles; test PayPal/Google embeds and Framer inline styles.
- **Expected outcome:** Throttling survives multi-instance; CSP no longer needs `unsafe-inline`/`unsafe-eval`.

**End of Week 2:** All P0+P1 done. Product is launch-hardened.

---

## Week 3 — High-value hardening + performance + a11y (P2)

### W3-T1 — Payment/webhook integrity (SEC-M1, SEC-M4)
- **Goal:** Reliable refunds/disputes; exact-cents pricing.
- **Files:** `app/api/paypal/webhook/route.ts` (return non-2xx on handler failure for retry; reverse credits on refund; idempotent event handling), `orders/create`/`capture-order` (0¢ tolerance, integer cents).
- **Risks:** Medium — webhook idempotency must avoid double-processing.
- **Expected outcome:** No lost refund events; refunds reverse credits; no underpayment slack.

### W3-T2 — Input/output safety (SEC-M2, SEC-M3, SEC-M5, F-PAY-04)
- **Goal:** Close injection/CSRF/config gaps.
- **Files:** `app/api/admin/export/route.ts` (CSV-injection neutralisation), mutating routes (Origin check), `lib/env.ts` (validate all server vars), `app/api/orders/create/route.ts` (MAX_QUANTITY both paths).
- **Risks:** Low.
- **Expected outcome:** Safer exports, CSRF-resistant mutations, fail-fast config, bounded orders.

### W3-T3 — Accessibility contrast (UX-H1) + dedupe admin endpoints (F-CRED-02)
- **Files:** token usage (`#0038FF`→`#0029CC` for text/links on light), delete `app/api/credits/admin-assign/route.ts`.
- **Risks:** Low.
- **Expected outcome:** WCAG AA links; single credit-grant path.

### W3-T4 — Performance quick wins (PERF-H1, PERF-H2, PERF-M2)
- **Files:** `proxy.ts` matcher (exclude `/api` from auth refresh), replace recharts chart in `StatsSection.tsx` with SVG sparkline, stream/paginate `admin/export`, index/trgm for email search.
- **Risks:** Medium (middleware change — re-test auth on pages).
- **Expected outcome:** Lower per-request latency, smaller bundle, scalable export.

### W3-T5 — SEO + dependency hygiene (SEO-1, SEO-2, F-MISC-01, F-MISC-04, F-MISC-03)
- **Files:** Vercel domain 301 (apex↔www), JSON-LD price alignment in `app/page.tsx`, delete dead components, align React/Next versions, remove `@anthropic-ai/sdk` + its CSP origin.
- **Risks:** Medium (version bump — full regression).
- **Expected outcome:** Canonical host, consistent rich-result price, lean dependency tree.

**End of Week 3:** All P2 cleared.

---

## Week 4 — Polish, consistency, monitoring (P3 + select P4)

### W4-T1 — Design-system consolidation (UX-H3, UX-M1, UX-M2)
- **Goal:** One styling system + accent discipline + type scale.
- **Files:** `tailwind.config.ts` (extend with token-backed utilities + type scale), migrate inline `style={{}}` → utilities incrementally (start with `SubmitWizard`, `AccountView`, legal pages).
- **Risks:** Medium — large surface; do incrementally with visual QA.
- **Expected outcome:** Consistent, themeable UI; smaller HTML payload.

### W4-T2 — Accessibility round-out (UX-M4, UX-M6, UX-L1)
- **Files:** `globals.css` (`prefers-reduced-motion`), drawer/chat focus traps + Esc + restore, mobile wizard step labels.
- **Risks:** Low.
- **Expected outcome:** WCAG 2.1 motion + keyboard/SR conformance.

### W4-T3 — Reliability + UX flows (F-AUTH-01, F-WIZ-01, PERF-M1, PERF-M4, SEC-M6/M7)
- **Files:** dedicated `/reset-password` page, CSV size/row cap + worker, dedupe dashboard profile fetch (`cache()`), route remote images via `next/image`, redact PII/error detail in responses + logs.
- **Risks:** Low.
- **Expected outcome:** Smoother recovery + bulk flows; fewer round-trips; less info leakage.

### W4-T4 — Observability + cleanup (SEC-L4, SEC-L5/PERF-L4, P4-x)
- **Files:** add Sentry (alert on `pending_alerts`, capture failures, 5xx), `paypal_intents` TTL cleanup job, callback `next` validation, sitemap `lastModified`, remove `next-sitemap`, bundle analyzer + CI size budget.
- **Risks:** Low.
- **Expected outcome:** Proactive error visibility; tidy infra.

**End of Week 4:** P3 + key P4 cleared; remaining P4 tracked in backlog.

---

## Sequencing diagram (dependencies)

```text
W1-T1 (header auth) ─────► W2-T1 (RLS clients)
W1-T2 (status enum)
W1-T3 (pricing src) ─────► SEO-1 (W3-T5 JSON-LD price)
W1-T4 (terms)        (legal, parallel)
W1-T5 (rate limit)  ─────► W2-T5 (distributed limiter)
W1-T6 (email)        (independent)
                     CSP nonce (W2-T5) ─────► verify PayPal/Framer embeds
PERF-H1 middleware (W3) re-tests auth set in W1-T1
```

## Milestones

| Milestone | When | Gate |
|---|---|---|
| **M1 — Launch-ready** | End W1 | P0 ×4 + rate-limit + email reliable |
| **M2 — Hardened** | End W2 | All P0+P1 closed |
| **M3 — Robust** | End W3 | All P2 closed; CWV improved |
| **M4 — Polished** | End W4 | P3 + key P4 closed; monitoring live |

*End of Phase 8.*
