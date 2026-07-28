# StealthConnect AI — Fix Prompts (Phase 9)

> **Purpose:** Ready-to-run, self-contained Claude Code prompts — one per issue — to execute the fixes from `docs/07`/`docs/08`.
> **How to use:** Paste a prompt into Claude Code (or your IDE agent) **one at a time, in order**. Each prompt is scoped, cites files, and ends with explicit validation, regression, and success criteria. Do not batch P0s — verify each before moving on.
> **Ordering:** FP-01…FP-06 are launch-blocking (Week 1). FP-07…FP-11 are Week 2. FP-12…FP-15 are Weeks 3–4.

---

## FP-03 — Fix the spoofable identity-header auth bypass (SEC-CRIT-01) 🔴 DO THIS FIRST

**Context:** API routes authenticate by reading the `x-user-id` request header, which the middleware injects from the verified Supabase session. But the middleware only sets that header when a user exists and never *strips* a client-supplied one; `/api/*` isn't in the protected-path list, so an unauthenticated caller can forge `x-user-id: <any-uuid>` and be treated as that user (IDOR / admin-credit self-grant / data exfiltration).

**Files to inspect:** `lib/supabase/middleware.ts` (esp. lines 42-61, 63-75), `proxy.ts`, and confirm consumers: `app/api/orders/create/route.ts`, `app/api/credits/use/route.ts`, `app/api/admin/credits/route.ts`, `app/api/admin/orders/route.ts`, `app/api/credits/admin-assign/route.ts`.

**Root cause:** Identity headers are sanitised only on the authenticated branch; the unauthenticated branch forwards original (forgeable) headers.

**Implementation steps:**
1. In `updateSession`, build a sanitised header set from `request.headers` and **unconditionally `delete` `x-user-id` and `x-user-email`** before any branching.
2. Only re-`set` them when `supabase.auth.getUser()` returns a verified user.
3. Return a response built from those sanitised request headers in **every** code path (authenticated, unauthenticated, redirect, and pass-through), so no path ever forwards a client-supplied identity header.
4. (Defence-in-depth) Add a brief comment documenting that these headers are server-trusted only, and consider a shared `getUserIdFromHeaders()` helper that returns null if absent.

**Validation steps:**
- Unauthenticated: `curl -X POST https://localhost/api/credits/use -H "x-user-id: <any-uuid>"` → must return **401**, not act on the user.
- Authenticated (real session cookie): dashboard loads, `/api/orders/list`, credit use, and admin actions still work.
- Forged header while logged in as user A with `x-user-id: <user B>` → still treated as A.

**Regression checks:** Full auth flow (login, OAuth, logout), dashboard data, submit-order (credits + PayPal), admin console actions.

**Success criteria:** No API route trusts a client-supplied `x-user-id`/`x-user-email`; authenticated flows unchanged; the curl forgery test returns 401.

---

## FP-02 — Align order-status enum across DB, API, and UI (F-PAY-02) 🔴

**Context:** The DB enum `order_status` is `pending|processing|completed|failed|refunded`, but the app uses `delivered` everywhere and `completed` nowhere. Admin "Delivered" writes fail with a Postgres enum error, so orders can never reach a terminal state and the dashboard "Delivered" count is always 0.

**Files to inspect:** `supabase/migrations/001_initial_schema.sql:14`, `app/api/admin/orders/route.ts:53`, `components/admin/AdminDashboard.tsx:18,21-27,348-364`, `components/dashboard/Orders/OrdersView.tsx:12,31-37`, `app/dashboard/page.tsx:16,49`, `types/database.ts:57,71,83`.

**Root cause:** Schema/code drift — `completed` (DB) vs `delivered` (app).

**Implementation steps (recommended: standardise on DB `completed`):**
1. Replace `delivered` with `completed` in: the admin PATCH allowlist (`admin/orders:53`), `STATUS_OPTIONS`/`STATUS_COLORS` (`AdminDashboard:18,21-27`), `OrderStatus` type + `STATUS_CONFIG` + `ALL_STATUSES` (`OrdersView:12,31-37,45-47`), the dashboard `Order` type + `deliveredOrders` filter (`page.tsx:16,49`), and `types/database.ts`.
2. When status transitions to `completed`, set `delivered_at = now()` in the PATCH handler.
3. Add a tiny test/asserting helper that the API allowlist === the DB enum values.
4. *(Alternative if product wants the word "delivered":* create `supabase/migrations/005_add_delivered.sql` with `ALTER TYPE order_status ADD VALUE 'delivered';` — note this cannot run inside a transaction on some Postgres setups — and keep the app on `delivered`. Pick **one** approach, not both.)*

**Validation steps:** As admin, set an order to the terminal status → succeeds (200, no enum error); the user dashboard shows it as completed and the "Completed" KPI increments.

**Regression checks:** All status transitions (pending→processing→completed, failed, refunded); webhook refund still sets `refunded`; OrdersView filters/counts.

**Success criteria:** Admin can complete orders; no `invalid input value for enum` errors; customer + dashboard reflect the terminal state.

---

## FP-01 — One pricing source-of-truth (F-PAY-01) 🔴

**Context:** The marketing pricing page advertises volume discounts (email $0.20→$0.10, phone $1.00→$0.50) and a "$1.08" Email+Phone bundle (10% off), but the wizard, both server endpoints, and the chatbot all charge flat rates ($0.20/$1.00/$1.20) with no discounts. Customers are quoted one price and charged a higher one.

**Files to inspect:** `components/sections/Pricing.tsx:14-33,90-96`, `components/dashboard/SubmitOrder/SubmitWizard.tsx:30`, `app/api/paypal/create-order/route.ts:14,38-40`, `app/api/orders/create/route.ts:20,69-71`, `app/api/chatbot/route.ts:9`.

**Root cause:** Two independent pricing implementations (rich discounts in marketing, flat in checkout) were never reconciled.

**Implementation steps:**
1. **Decide the policy with the business**: implement the advertised discounts server-side (recommended) OR remove the discounts from marketing. The steps below implement them.
2. Create `lib/pricing.ts` exporting pure functions: `unitCents(category, qty)` applying the EMAIL/PHONE tier tables, `comboCents(qty)` = `(emailTier+phoneTier)*0.9` rounded, and `quoteCents({contactType, qty, emailDraft})` adding the $1.00/profile draft. Keep everything in **integer cents**.
3. Replace the flat `BASE_CENTS` math in `paypal/create-order` and `orders/create` with `quoteCents(...)`.
4. Replace `PRICE`/`contactCost` in `SubmitWizard` with the same module.
5. Replace `calcPrice`/tier tables in `Pricing.tsx` with the same module (single import).
6. Update the chatbot system prompt to reference the canonical prices (or have it read a generated summary string from `lib/pricing.ts`).
7. Add unit tests for tier boundaries (qty 9/10, 99/100, 999/1000, 4999/5000) and combo, for all three categories + draft.

**Validation steps:** For several (category, qty, draft) combos, confirm the marketing calculator, wizard total, PayPal order amount, and chatbot all return the identical figure; place a real sandbox PayPal order and confirm the captured amount matches the quote.

**Regression checks:** Amount-mismatch guards in `orders/create`/`capture-order` still pass with the new amounts; credits path (qty credits) unaffected.

**Success criteria:** Quoted price === charged price in every surface; tests green.

---

## FP-04 — Rate-limit and protect public endpoints (SEC-H2) 🔴

**Context:** `/api/chatbot` (Groq, unauthenticated, unthrottled) and `/api/contact` (Resend, no honeypot/throttle) are open to cost-amplification DoS and spam.

**Files to inspect:** `app/api/chatbot/route.ts`, `app/api/contact/route.ts`, `components/ContactForm.tsx`, `lib/rate-limit.ts`.

**Root cause:** No abuse controls on public endpoints.

**Implementation steps:**
1. Derive a client key from `x-forwarded-for`/`request.ip`; apply `rateLimit(`chatbot:${ip}`, …)` and `rateLimit(`contact:${ip}`, …)` returning 429 when exceeded.
2. Cap chatbot `messages.length` and total characters; reject oversized payloads.
3. Add a hidden honeypot field to `ContactForm` and reject submissions where it's filled in the API.
4. Add an `Origin`/`Referer` allowlist check to `/api/contact`.
5. (Stronger, optional now / required in FP-11) enable Vercel Firewall/BotID rules for edge enforcement.

**Validation steps:** Rapid repeated requests → 429 after the threshold; honeypot-filled submission → rejected; normal use unaffected.

**Regression checks:** Legit chat + contact submissions still work within limits.

**Success criteria:** Bounded LLM/email spend; bots blocked; humans unaffected.

---

## FP-05 — Reliable order confirmation + verified sender (F-PAY-03) 🔴

**Context:** The order-confirmation email is fire-and-forget; a Resend failure silently drops the customer's receipt. `EMAIL_FROM` falls back to `onboarding@resend.dev` (fails SPF/DKIM, lands in spam).

**Files to inspect:** `app/api/orders/create/route.ts:240-242`, `lib/email.ts:8`, `lib/env.ts`.

**Root cause:** Confirmation treated as non-critical; unsafe sender default.

**Implementation steps:**
1. `await` `sendOrderConfirmation`; on failure, record a `pending_alert` (mirror the team-notification path at `:246-256`) so it can be retried/resent.
2. Remove the `onboarding@resend.dev` fallback; require `EMAIL_FROM` (verified domain) via `lib/env.ts` startup validation.
3. (Optional) add a small retry/backoff around the send.

**Validation steps:** Simulate a Resend failure (bad key) → order still saves, a `pending_alert` row is created, no unhandled rejection; valid key → email delivered from the verified domain.

**Regression checks:** Happy-path order creation latency acceptable (don't block the response on slow email — consider awaiting with a timeout or enqueue).

**Success criteria:** No silent receipt loss; sender is the verified domain; failures are surfaced to ops.

---

## FP-06 — Fill Terms of Service legal placeholders (P0-4) 🔴

**Context:** `app/terms/page.tsx:62` Section 10 contains `[JURISDICTION …]`, `[ARBITRATION SEAT]`, `[ARBITRAL BODY]` placeholders.

**Files to inspect:** `app/terms/page.tsx:60-63`.

**Root cause:** Draft legal text shipped.

**Implementation steps:**
1. **Obtain final values from legal counsel** (jurisdiction, arbitration seat, arbitral body).
2. Replace the placeholders verbatim with counsel-approved text. Do **not** invent values.
3. Update the "Last updated" date.

**Validation steps:** Grep the repo for `[` placeholders in legal pages → none remain.

**Success criteria:** Enforceable Terms with no placeholder text; counsel sign-off recorded.

---

## FP-07 — Use RLS-scoped clients for user data (SEC-H1)

**Context:** Most data access uses the service-role client, which bypasses RLS, so the well-written RLS policies never run in production and a single handler flaw exposes the whole DB.

**Files to inspect:** `lib/supabase/server.ts` (`createClient` anon vs `createAdminClient`), `lib/admin-db.ts`, user-scoped reads in `app/dashboard/**`, `app/api/orders/list/route.ts`, `app/api/credits/use/route.ts`.

**Root cause:** Service-role used by default for user-scoped operations.

**Implementation steps:**
1. For user-scoped reads/writes, switch to the cookie-scoped anon `createClient()` so RLS enforces `auth.uid() = user_id`.
2. Reserve `createAdminClient()`/`adminDb()` for privileged ops only: RPCs (`deduct_credit`/`add_credits`), webhook handling, admin grants/exports.
3. Verify each migrated query is permitted by `migrations/002` policies.

**Validation steps:** As user A, confirm you can read only your own profile/orders/credit_logs; attempts to read others return empty/denied; admin paths still work via service role.

**Regression checks:** Dashboard, orders list, account, submit flow.

**Success criteria:** RLS actively gates user data; service-role surface minimised; depends on FP-03 being done first.

---

## FP-08 — Guarantee atomic credit deduction (F-CRED-01)

**Context:** `deductCredits` falls back to a non-atomic CAS if the `deduct_credit(uuid,int)` RPC errors (e.g. migration 004 not applied), masking misconfiguration and risking double-spend.

**Files to inspect:** `lib/admin-db.ts:36-72`, `supabase/migrations/004_audit_fixes.sql:13-41`.

**Implementation steps:**
1. Confirm migration 004 is applied in every environment.
2. Add a startup/health assertion that the `deduct_credit(uuid,int)` function exists (e.g. extend `/api/health` or `lib/env`-style check).
3. Treat an RPC error as a hard failure (log + alert) rather than silently using the weaker path — or make the fallback equally race-safe.

**Validation:** Concurrent credit-spend requests don't overdraw; missing-RPC surfaces loudly.

**Success criteria:** No silent downgrade; atomic deduction guaranteed.

---

## FP-09 — Reconcile data retention with policy (SEC-H5)

**Context:** `orders.linkedin_urls` (third-party PII) is stored indefinitely, contradicting the chatbot/privacy claim "we don't store LinkedIn URLs beyond fulfilment".

**Files to inspect:** `supabase/migrations/001:76`, `app/api/chatbot/route.ts:16`, `app/privacy/page.tsx`, `app/gdpr/page.tsx`.

**Implementation steps:**
1. With counsel, define a retention period for `linkedin_urls`/order PII.
2. Implement it: a scheduled purge/anonymise job, or store a hash/reference post-fulfilment; add a GDPR erasure routine.
3. If retention is intentional, **correct the chatbot prompt and policy** to state the real retention.

**Validation:** Retention job removes/anonymises per policy; erasure request flow works; policy text matches behaviour.

**Success criteria:** No contradiction between stated and actual retention; documented period + erasure path.

---

## FP-10 — Replace fabricated testimonials and fake avatars (F-PUB-02)

**Context:** Named fake testimonials and `randomuser.me` faces are presented as real customers (FTC/ASA risk; trust risk).

**Files to inspect:** `components/sections/Testimonials.tsx`, `app/(auth)/login/LoginClient.tsx:9-28`, `app/(auth)/signup/SignupClient.tsx:12-31`.

**Implementation steps:**
1. Replace with real, consented testimonials (name/role/company/logo) or remove the section until you have them.
2. Remove fake avatars from auth screens; use a neutral brand visual or real logos.
3. Do **not** add Review/AggregateRating JSON-LD until reviews are genuine.

**Validation:** No invented people/quotes/faces remain; any social proof is verifiable.

**Success criteria:** Only authentic proof on the site.

---

## FP-11 — Distributed rate limiting + nonce-based CSP (SEC-H3, SEC-H4)

**Context:** The in-memory limiter is per-instance (bypassable); the CSP allows `unsafe-inline`/`unsafe-eval`.

**Files to inspect:** `lib/rate-limit.ts`, `next.config.ts:26-49`, `lib/supabase/middleware.ts`/`proxy.ts`.

**Implementation steps:**
1. Back rate limiting with a shared store (Upstash Redis / a Vercel Marketplace KV) or move limits to Vercel Firewall rules.
2. Generate a per-request nonce in middleware; pass it to a CSP that uses `'nonce-…' 'strict-dynamic'` and drop `unsafe-inline`/`unsafe-eval`.
3. Add the nonce to Next's script tags; keep PayPal/Google/Supabase/Resend origins whitelisted.

**Validation:** Limits hold across instances; site (incl. PayPal buttons, Google OAuth, Framer inline styles) works under the strict CSP; browser console shows no CSP violations.

**Regression checks:** Payment flow, OAuth, animations, fonts.

**Success criteria:** Edge-effective throttling; CSP free of `unsafe-*`.

---

## FP-12 — Webhook integrity + refund reversal + exact-cents (SEC-M1, SEC-M4)

**Context:** The PayPal webhook returns 200 even when handling throws (lost events on transient failure), refunds don't reverse credits, and the ±2¢ tolerance is loose on cheap items.

**Files to inspect:** `app/api/paypal/webhook/route.ts:91-138`, `app/api/orders/create/route.ts:74,113`, `app/api/paypal/capture-order/route.ts:86`.

**Implementation steps:**
1. On handler failure, return a non-2xx so PayPal retries (keep returning 2xx for *unhandled event types* only); make event handling idempotent (track processed transmission IDs).
2. On `REFUNDED`/`REVERSED`, reverse the corresponding credits/ledger entry and notify the customer.
3. Replace ±2¢ tolerance with exact integer-cents comparison end-to-end.

**Validation:** Simulated refund reverses credits + notifies; a forced handler error causes a retry; amount checks are exact.

**Regression checks:** Normal capture/order creation; dispute path.

**Success criteria:** No lost webhook events; refunds fully reverse; no underpayment slack.

---

## FP-13 — Security mediums batch (SEC-M2, SEC-M3, SEC-M5, F-PAY-04)

**Context:** CSV-injection in export, no Origin checks on mutations, partial env validation, no max-quantity on the credits order path.

**Files to inspect:** `app/api/admin/export/route.ts:30-40`, mutating routes (`orders/create`, `paypal/*`, `credits/use`, `admin/*`), `lib/env.ts`, `app/api/orders/create/route.ts:39-66`.

**Implementation steps:**
1. Neutralise CSV cells starting with `= + - @` (prefix `'`); quote+escape all fields.
2. Add an `Origin`/`Referer` allowlist check to mutating API routes.
3. Validate all required server env vars at startup in `lib/env.ts` (PayPal client/secret/`PAYPAL_WEBHOOK_ID`, `RESEND_API_KEY`, `EMAIL_FROM`, `TEAM_EMAIL`, `GROQ_API_KEY`).
4. Enforce a `MAX_QUANTITY` (and body-size limit) in `orders/create` for both credits and PayPal paths.

**Validation:** Malicious name in export is inert in spreadsheets; cross-origin mutation blocked; missing env fails fast at boot; oversized order rejected.

**Success criteria:** All four gaps closed; existing flows unaffected.

---

## FP-14 — Performance batch (PERF-H1, PERF-H2, PERF-M2)

**Context:** Middleware runs auth on `/api/*`; recharts ships for one decorative chart; admin export is unbounded.

**Files to inspect:** `proxy.ts:8-11`, `components/sections/StatsSection.tsx`, `app/api/admin/export/route.ts`, `app/api/admin/orders/route.ts:36`.

**Implementation steps:**
1. Exclude `/api/*` from the middleware matcher (or skip `getUser()` for API routes that authenticate from the header) — **re-run FP-03's curl test afterward** to ensure header sanitisation still applies to API routes (you may need to strip headers in a lightweight API-only path).
2. Replace the Recharts area chart with an inline SVG/CSS sparkline (data is static); remove `recharts` if it becomes unused.
3. Stream/paginate the CSV export; add a trigram index (or `user_id` filter) for admin email search.

**Validation:** API latency drops; bundle shrinks (`next build` size diff); export works on a large dataset.

**Regression checks:** Auth still enforced on pages **and** API (FP-03 test), stats section renders, admin search/export work.

**Success criteria:** Lower latency + smaller bundle + scalable export, with auth intact.

---

## FP-15 — A11y contrast, dead-code/deps cleanup, SEO canonical (UX-H1, F-MISC-01/03/04, SEO-1/2)

**Context:** Brand blue fails AA on white; dead components (incl. mis-branded "Volvox" footer) linger; `@anthropic-ai/sdk` unused; React 18 under Next 16; www/apex duplicate content + JSON-LD price drift.

**Files to inspect:** light-mode text/link styles using `#0038FF`; dead components per `docs/02` F-MISC-01; `package.json`; `next.config.ts:39`; `app/page.tsx:61-121`; Vercel domain config.

**Implementation steps:**
1. Use `#0029CC` (or a token) for blue **text/links on light backgrounds**; keep `#0038FF` for large headings/fills. Verify ≥4.5:1.
2. After a final import `grep`, delete confirmed-dead components (`components/motion-footer.tsx`, `hero.tsx`, `sections/LandingNav.tsx`, `Testimonials.tsx`, `testimonial-v2.tsx`, `sections/FeaturesStack.tsx`, `floating-consult-button.tsx`, `cards-stack.tsx`, and verify `header-2.tsx`/`ai-image-generator-hero.tsx`/`logos3.tsx`).
3. Remove `@anthropic-ai/sdk` from `package.json` and `api.anthropic.com` from the CSP `connect-src`.
4. Verify/upgrade React to satisfy Next 16's peer requirement; run a full regression.
5. Configure a 301 from apex→`www` (or vice-versa) in Vercel; once FP-01 lands, keep JSON-LD `Offer` prices consistent with displayed prices and add the combo Offer.

**Validation:** Contrast checker passes; `next build` succeeds with no dead imports; only the canonical host serves 200; rich-results test shows consistent price.

**Regression checks:** Full site visual QA after React bump; all pages render; OG/Twitter/JSON-LD valid.

**Success criteria:** AA contrast, lean tree, single canonical host, honest structured data.

---

## Execution checklist

- [ ] FP-03 (auth header) — **first**, verify curl forgery → 401
- [ ] FP-02 (status enum) — admin can complete orders
- [ ] FP-01 (pricing) — quote === charge, tests green
- [ ] FP-04 (rate limit) — 429 on abuse
- [ ] FP-05 (email) — reliable receipt + verified sender
- [ ] FP-06 (terms) — placeholders filled (counsel)
- [ ] FP-07 (RLS clients) — after FP-03
- [ ] FP-08 (atomic credits)
- [ ] FP-09 (retention vs policy)
- [ ] FP-10 (real testimonials)
- [ ] FP-11 (distributed limit + nonce CSP)
- [ ] FP-12 (webhook integrity + refunds)
- [ ] FP-13 (security mediums)
- [ ] FP-14 (perf batch) — re-run FP-03 test after middleware change
- [ ] FP-15 (a11y/deps/SEO)

> Tip: after each prompt, run `next build` + `next lint`, exercise the affected flow, and only then proceed. Keep each fix in its own commit/PR for clean review and rollback.

*End of Phase 9. All audit phases complete — see `docs/01`–`docs/08` for the full analysis behind these prompts.*
