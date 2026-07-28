# StealthConnect AI — Functionality Audit (Phase 2)

> **Document type:** Page-by-page / feature-by-feature functional audit.
> **Method:** Every issue below was verified against source (`path:line` cited). No issue is asserted without a reading of the actual code path.
> **Companion docs:** System map → `docs/01`; UI/UX → `docs/03`; Performance → `docs/04`; Security → `docs/05`; SEO → `docs/06`; Prioritisation → `docs/07`.
> **Severity scale:** `Critical` (launch-blocking / breaks core flow or charges wrong money) · `High` · `Medium` · `Low`.

---

## 0. Executive summary

The product is functionally well-engineered in its payment integrity (server-authoritative pricing, PayPal intent ownership checks, idempotent order creation, atomic credit RPC, optimistic UI with rollback). However, **two defects are launch-blocking**:

1. **The fulfilment state machine is broken** — the entire app uses an order status (`delivered`) that does not exist in the database enum (`completed`). Admins literally cannot mark an order delivered (the DB rejects it), so no order can ever reach a terminal state and customers never see "Delivered".
2. **Advertised pricing is not the price charged** — the marketing/pricing page promises volume discounts (down to $0.10/email, $0.50/phone) and a discounted "$1.08" Email+Phone bundle, but the order flow charges flat rates ($0.20 / $1.00 / $1.20) with no discount logic at all. A buyer who is quoted $500 for 5,000 emails on the pricing page is charged $1,000 at checkout.

Both are below with full detail, alongside 18 further findings.

---

## 1. Authentication

### F-AUTH-01 — Forgot-password flow lands on the account page instead of a dedicated reset screen
- **Severity:** Medium
- **Location:** `app/(auth)/forgot-password/page.tsx:24`, `app/auth/callback/route.ts:8,32-34`, `components/dashboard/AccountView.tsx:88-114`
- **Description:** `resetPasswordForEmail` sets `redirectTo` to `/auth/callback?next=/dashboard/account`. After the user clicks the recovery link, the callback exchanges the code for a session and forwards them to the account page, where they must locate the "Change Password" card and set a new password. There is no dedicated "set a new password" screen.
- **Root cause:** The reset journey reuses the generic account password-change form rather than a purpose-built recovery page.
- **Business impact:** Higher drop-off on password recovery; users who don't scroll to the password card may abandon, generating support load.
- **User impact:** Confusing — the user expects to be asked for a new password immediately, but is dropped onto a full dashboard page.
- **Recommended fix:** Add a `/reset-password` route that detects the recovery session and shows only the new-password form, then redirects to `/dashboard`. Point `redirectTo` at it.

### F-AUTH-02 — Account password change does not require the current password
- **Severity:** Low (acceptable for Supabase session model; flagged for completeness)
- **Location:** `components/dashboard/AccountView.tsx:69-114`
- **Description:** The form collects "New password" and "Confirm" only. The `pwOld` state variable exists (line 69) but is never rendered or used. `supabase.auth.updateUser({ password })` relies on the active session, not the old password.
- **Root cause:** Dead `pwOld` state left in; reliance on session auth.
- **Business impact:** Minor — a hijacked open session could change the password without knowing the old one. This matches Supabase's default behaviour but is weaker than "require current password" UX.
- **User impact:** None functionally.
- **Recommended fix:** Either remove the dead `pwOld` state, or add a re-authentication step (`signInWithPassword` with the old password) before `updateUser` for sensitive change.

### F-AUTH-03 — No password-strength enforcement beyond length ≥ 8
- **Severity:** Low
- **Location:** `app/(auth)/signup/SignupClient.tsx:102`, `components/dashboard/AccountView.tsx:91`
- **Description:** Only `password.length < 8` is checked client-side. No complexity, no breached-password check, no server-side enforcement (Supabase project policy not visible in repo).
- **Recommended fix:** Configure Supabase Auth password policy (min length, leaked-password protection) in the Supabase dashboard; surface inline strength feedback.

### F-AUTH-04 — OAuth/email auth confirmed working; positive note
- **Severity:** — (informational)
- **Location:** `proxy.ts`, `lib/supabase/middleware.ts:38-90`, `lib/site-url.ts`, `app/auth/callback/route.ts`
- **Description:** Route protection (`/dashboard`, `/admin`, `/order`), logged-in bounce off `/login`/`/signup`, host-preserving PKCE redirect via `authRedirectBase()`, and open-redirect guard (`next.startsWith("/")`) are all correctly implemented. Logout works via both the server route and client `signOut`.

---

## 2. Order / Payment flow

### F-PAY-01 — Advertised pricing (volume discounts + combo bundle) is never applied at checkout  🔴
- **Severity:** Critical
- **Location:** `components/sections/Pricing.tsx:14-33,90-96` vs `components/dashboard/SubmitOrder/SubmitWizard.tsx:30` vs `app/api/paypal/create-order/route.ts:14,38-40` vs `app/api/orders/create/route.ts:20,69-71` vs `app/api/chatbot/route.ts:9`
- **Description:** The public pricing section advertises:
  - **Volume tiers**: email $0.20 → $0.10, phone $1.00 → $0.50 (10%–50% off as quantity grows), shown in `VOLUME_TIERS` and a live calculator that computes `calcPrice` with these discounts.
  - **Combo bundle**: "Phone + Email — **$1.08** · 10% off both" (`PRODUCT_CARDS`, `calcPrice` applies `* 0.9`).

  The actual order path uses **flat, undiscounted** pricing in three places that must agree:
  - Wizard: `PRICE = { phone: 1.00, email: 0.20, both: 1.20 }`, `contactCost = qty * PRICE[...]` (no tiers).
  - Server (PayPal): `BASE_CENTS = { email: 20, phone: 100, both: 120 }`, `expectedCents = quantity * BASE_CENTS[...]` (no tiers).
  - Server (orders/create): identical `BASE_CENTS` flat calc.

  Consequence: a customer who uses the marketing calculator and sees "5,000 emails = $500" ($0.10 each) is charged **$1,000** ($0.20 each) at checkout. A customer who picks "Email + Phone" expecting **$1.08** is charged **$1.20**. The combo gives no discount despite the "Best value" / "10% off" labels (`SubmitWizard.tsx:282`, `Pricing.tsx:76`).
- **Root cause:** Two independent pricing implementations — a rich discount model in the marketing component and a flat model in the order pipeline — were never reconciled. The server is correctly authoritative (cannot be tampered), but it enforces the *wrong* (undiscounted) price relative to what the customer was shown.
- **Business impact:** Severe. This is a material discrepancy between advertised and charged price: trust damage, chargebacks/disputes (the webhook already handles `CUSTOMER.DISPUTE.CREATED`), refund load, and potential consumer-protection / false-advertising exposure (FTC in the US, ASA/CMA in the UK, etc.). At scale the overcharge is large in absolute dollars.
- **User impact:** Overcharged versus the quoted price; loses confidence; likely abandons or disputes.
- **Recommended fix:** Decide the single source of truth, then implement it everywhere. Recommended: move the tier/combo logic into **one shared server module** (`lib/pricing.ts`) exporting `priceCents(contactType, qty, emailDraft)`, and have the wizard, `paypal/create-order`, `orders/create`, the marketing calculator, and the chatbot prompt all derive from it. Until tiers are implemented server-side, **either** (a) implement the discounts server-side, **or** (b) remove the volume-tier table and combo discount from the marketing page so the site only promises what it charges. Do not ship with the two in conflict.

### F-PAY-02 — Order status `delivered` does not exist in the DB enum → orders can never be delivered  🔴
- **Severity:** Critical
- **Location:** `supabase/migrations/001_initial_schema.sql:14` (`order_status = pending|processing|completed|failed|refunded`) vs `app/api/admin/orders/route.ts:53` (`allowed = [...,"delivered",...]`) vs `components/admin/AdminDashboard.tsx:18` (`STATUS_OPTIONS`) vs `components/dashboard/Orders/OrdersView.tsx:12,31-37` vs `app/dashboard/page.tsx:16,49`
- **Description:** The database enum's terminal success value is `completed`. The application uses `delivered` **everywhere** and `completed` **nowhere**:
  - Admin status dropdown offers `delivered` (`AdminDashboard.tsx:18`).
  - The PATCH validator allows `delivered` and omits `completed` (`admin/orders/route.ts:53`), then writes it via the service-role client.
  - When an admin selects "Delivered", Postgres rejects the write (`invalid input value for enum order_status: "delivered"`, SQLSTATE 22P02). The PATCH returns 500; `AdminDashboard.handleStatusChange` rolls back the optimistic update and shows "Failed to update status" (`AdminDashboard.tsx:72-87`).
  - The user dashboard counts `deliveredOrders = orders.filter(o => o.status === "delivered")` (`page.tsx:49`) — always 0 — and `OrdersView` renders a "Delivered" status badge that no row can ever have.
- **Root cause:** Schema/code drift — the enum was defined as `completed` in migration 001 but the entire TypeScript/UI layer standardised on `delivered`.
- **Business impact:** The core fulfilment workflow is non-functional. Operations cannot close out orders; every order is stuck in `pending`/`processing` forever; customer-facing "Delivered" status and the dashboard "Delivered" KPI are dead.
- **User impact:** Customers never see their order marked complete; admins get repeated "Failed to update status" errors when trying to fulfil.
- **Recommended fix:** Pick one term and align all layers. Lowest-risk: add `delivered` to the enum (`ALTER TYPE order_status ADD VALUE 'delivered'`) **or** rename the app to use `completed`. Recommended: standardise on `completed` (already in DB) and set `delivered_at` on transition; update `admin/orders` allowlist, `AdminDashboard` options, `OrdersView` config/types, and the dashboard counter. Add a DB-level test that the allowed status list equals the enum.

### F-PAY-03 — Order confirmation email is fire-and-forget; a Resend failure silently drops the customer's receipt
- **Severity:** High
- **Location:** `app/api/orders/create/route.ts:240-242`, `lib/email.ts:6-9,27-50`
- **Description:** `sendOrderConfirmation(emailData).catch(e => console.error(...))` is not awaited. If Resend is down or the API key is missing, the customer receives no order confirmation even though payment succeeded and the order row exists. (By contrast, the **team** notification *is* awaited and failures are recorded as a `pending_alert` — good — at lines 246-256.) Additionally, `EMAIL_FROM` falls back to `onboarding@resend.dev` (Resend's shared demo sender) if the env var is unset (`lib/email.ts:8`), which will fail SPF/DKIM alignment for the real domain and likely land in spam.
- **Root cause:** Confirmation email treated as non-critical; no delivery tracking; unsafe default sender.
- **Business impact:** Customers who paid but got no email open support tickets ("did my order go through?"); spam-foldered confirmations hurt trust.
- **User impact:** No receipt; uncertainty after paying.
- **Recommended fix:** Capture the `resend.emails.send` result; on failure, record a `pending_alert` (mirroring the team-notification path) so it can be retried/resent. Require `EMAIL_FROM` via `lib/env.ts` and use a verified domain sender; never fall back to `onboarding@resend.dev` in production.

### F-PAY-04 — Credits path has no maximum quantity (PayPal path is capped at 1000)
- **Severity:** Medium
- **Location:** `app/api/paypal/create-order/route.ts:15,33` (`MAX_QUANTITY = 1000`) vs `app/api/orders/create/route.ts:39-66` (no quantity cap)
- **Description:** The PayPal create-order endpoint rejects `quantity > 1000`. The `orders/create` endpoint — which the credits path posts to directly — validates the URL format but never bounds `linkedin_urls.length`. A user with enough credits (or via the fallback path) could submit an arbitrarily large order in a single request.
- **Root cause:** Quantity limit enforced only in the PayPal pre-step, not in the canonical order creator.
- **Business impact:** Operational overload (a single 50,000-URL order), possible request-size/timeout issues, fulfilment strain.
- **User impact:** Edge users could create unmanageable orders; most users unaffected.
- **Recommended fix:** Enforce a `MAX_QUANTITY` (and a per-request body-size limit) in `orders/create` for both paths.

### F-PAY-05 — `amount_paid` recorded from the client on the credits path without validation
- **Severity:** Low
- **Location:** `app/api/orders/create/route.ts:35,72-79,154`; `SubmitWizard.tsx:728` (credits posts `amount_paid: 0`)
- **Description:** For `use_credits`, the amount-mismatch check is skipped (`expectedCents = 0`) and `amount_paid` is stored as whatever the client sent (the wizard sends `0`, which is correct, but the server does not enforce it). A crafted request could store a misleading `amount_paid` on a credits order.
- **Root cause:** `amount_paid` trusted from the client on the zero-cost path.
- **Business impact:** Reporting/accounting integrity only (credits orders should always show $0).
- **Recommended fix:** Force `amount_paid = 0` server-side when `use_credits` is true.

### F-PAY-06 — PayPal capture/verify/idempotency are correctly implemented; positive note
- **Severity:** — (informational)
- **Location:** `app/api/paypal/capture-order/route.ts:34-94`, `app/api/orders/create/route.ts:82-139`, `app/api/paypal/webhook/route.ts:53-84`
- **Description:** Confirmed strong controls: intent ownership check before capture; captured-amount vs intent reconciliation (±2¢); `COMPLETED` status enforcement; idempotency via `orders.paypal_order_id` UNIQUE with 409 on cross-user claim; orphan-payment handling (pending alert + team email) when capture succeeds but insert fails; webhook signature verification before acting. The ±2¢ tolerance is loose for a 20¢ item (see `docs/05`), but the architecture is sound.

---

## 3. Credits

### F-CRED-01 — Atomic deduction depends on migration 004 being applied; silent non-atomic fallback otherwise
- **Severity:** High
- **Location:** `lib/admin-db.ts:36-72`, `supabase/migrations/004_audit_fixes.sql:13-41`, `supabase/migrations/001_initial_schema.sql:208-228`
- **Description:** `deductCredits` calls the `deduct_credit(p_user_id, p_amount)` RPC (the migration-004 signature, returning boolean). Migration 001 defined a different signature (`uuid, uuid, text` returning void). If migration 004 was not applied to the live DB, the RPC call errors and the code **silently falls back** to a non-atomic optimistic compare-and-swap (`update ... .eq("credits", profile.credits)`), which is more race-prone under concurrency.
- **Root cause:** Function signature churn across migrations + a resilience fallback that masks the misconfiguration.
- **Business impact:** If 004 isn't applied, concurrent orders could double-spend or behave inconsistently; the failure is invisible except in logs.
- **User impact:** Rare double-charge / credit-drift under concurrent requests.
- **Recommended fix:** Add a startup/health assertion that `deduct_credit(uuid,int)` exists; treat RPC failure as a hard error (don't silently fall back to a weaker guarantee), or make the fallback equally safe. Verify migration 004 is applied in production.

### F-CRED-02 — Duplicate admin credit-grant endpoints with divergent code
- **Severity:** Medium
- **Location:** `app/api/admin/credits/route.ts` and `app/api/credits/admin-assign/route.ts`
- **Description:** Two endpoints grant credits to a user by email with near-identical logic but different payload shapes (`{email, amount, note}` vs `{target_email, amount, note}`), different lookups (`.single()` vs `.maybeSingle()`), and different responses. The admin UI calls `/api/admin/credits` (`AdminDashboard.tsx:116`). The other appears unused by the UI.
- **Root cause:** Two implementations of the same feature never consolidated.
- **Business impact:** Maintenance hazard — fixes/limits applied to one won't apply to the other; the unused one is an extra attack surface.
- **Recommended fix:** Delete `/api/credits/admin-assign` (or make it a thin alias) and keep a single grant endpoint with shared validation.

---

## 4. Admin console

### F-ADMIN-01 — Status dropdown surfaces a value the DB rejects (see F-PAY-02)
- **Severity:** Critical (same root cause as F-PAY-02)
- **Location:** `components/admin/AdminDashboard.tsx:18,348-364`
- **Description:** The "Status" `<select>` lists `delivered`, which always fails on save. Admins cannot complete the primary action of the console.
- **Recommended fix:** Covered by F-PAY-02.

### F-ADMIN-02 — CSV export is unbounded (all orders, no pagination/streaming)
- **Severity:** Medium
- **Location:** `app/api/admin/export/route.ts:15-43`
- **Description:** The export selects **all** orders with no limit and builds the entire CSV in memory. At scale this risks function timeouts/memory limits and a slow download.
- **Root cause:** No pagination or streaming on export.
- **Business impact:** Export breaks once the orders table grows large.
- **Recommended fix:** Stream the CSV (chunked Response) or paginate/limit with a date range; add an index-friendly query.

### F-ADMIN-03 — CSV injection risk in export (defensive)
- **Severity:** Low → Medium (see `docs/05`)
- **Location:** `app/api/admin/export/route.ts:30-40`
- **Description:** User-controlled fields (e.g. `full_name`) are written into CSV cells. `full_name` is quote-escaped, but a value beginning with `=`, `+`, `-`, or `@` can execute as a formula when opened in Excel/Sheets (CSV injection). `email`, `contact_type`, etc. are not quoted at all.
- **Recommended fix:** Prefix risky cells with `'` or wrap all fields in quotes and neutralise leading formula characters.

### F-ADMIN-04 — Admin authorization is correctly layered; positive note
- **Severity:** — (informational)
- **Location:** `app/admin/layout.tsx:15-19`, `app/dashboard/admin/page.tsx:18-19`, `app/api/admin/*` `requireAdmin`/role checks
- **Description:** Confirmed defence-in-depth: layout-level role gate, page-level gate on the `/dashboard/admin` mount, and per-endpoint `role !== "admin"` re-checks via the service-role client. Note: `app/admin/page.tsx` itself has no inline check (relies on `app/admin/layout.tsx`) — acceptable, but the two admin mounts (`/admin` and `/dashboard/admin`) are redundant (see F-MISC-02).

---

## 5. Dashboard & user pages

### F-DASH-01 — Dashboard "Delivered" KPI is permanently zero (see F-PAY-02)
- **Severity:** High (consequence of F-PAY-02)
- **Location:** `app/dashboard/page.tsx:49,57-59`, `components/dashboard/DashboardAnimated.tsx`
- **Description:** Because no order can reach `delivered`, the "delivered orders" stat is always 0, making the dashboard look broken/empty even for active customers.
- **Recommended fix:** Resolved by F-PAY-02; until then the KPI is misleading.

### F-DASH-02 — Server-rendered dashboard/orders/account pages have loading skeletons (positive) but no error boundaries beyond the route-level `error.tsx`
- **Severity:** Low
- **Location:** `app/dashboard/loading.tsx`, `app/dashboard/orders/loading.tsx`, `app/dashboard/error.tsx`, `app/error.tsx`
- **Description:** Branded skeletons exist for dashboard and orders; a branded `error.tsx` exists at root and dashboard level with a `reset()` button. Account/submit pages have no dedicated `loading.tsx` (they fetch quickly, so impact is minor).
- **Recommended fix:** Add `loading.tsx` for `account` and `submit` for consistency; otherwise good.

### F-DASH-03 — Empty states are implemented well; positive note
- **Severity:** — (informational)
- **Location:** `components/dashboard/Orders/OrdersView.tsx:647-688` (EmptyState), `AccountView.tsx:303-313` (no credit activity)
- **Description:** Orders empty state and credit-log empty state are branded with clear CTAs.

---

## 6. Submit-order wizard

### F-WIZ-01 — CSV upload has no file-size limit and is parsed entirely on the client
- **Severity:** Medium
- **Location:** `components/dashboard/SubmitOrder/SubmitWizard.tsx:401-408,51-60`
- **Description:** `readFile` reads the whole file via `FileReader` and `parseCSVText` scans every cell. A very large CSV will block the main thread and can freeze the tab; there is no row cap or size guard.
- **Root cause:** No size/row guard on client-side CSV parsing.
- **Business impact:** Poor experience for bulk users; potential browser hang.
- **Recommended fix:** Cap file size (e.g. 2 MB) and row count; parse in a Web Worker for large files; show a progress/limit message.

### F-WIZ-02 — Client URL validation is looser than the server regex (benign but inconsistent)
- **Severity:** Low
- **Location:** `SubmitWizard.tsx:34` (`/linkedin\.com\/in\//i`) vs `app/api/orders/create/route.ts:59` (`/^https:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9_%-]{3,100}\/?$/`)
- **Description:** The wizard accepts URLs the server later rejects (e.g. trailing query strings, unusual slugs). The server is authoritative (good), but the mismatch means a user can pass the wizard's step-1 validation and only hit the error at order creation.
- **Recommended fix:** Share one validation regex between client and server; show the precise rejection reason at input time.

### F-WIZ-03 — PayPal retry + orphan handling is robust; positive note
- **Severity:** — (informational)
- **Location:** `SubmitWizard.tsx:765-820`
- **Description:** After capture, order creation is retried up to 3× (server is idempotent on `paypal_order_id`); on total failure the user is shown a support reference and a server-side orphan alert has fired. Strong UX for the failure path.

---

## 7. Public / marketing site

### F-PUB-01 — Pricing calculator promises discounts the product doesn't honour (see F-PAY-01)
- **Severity:** Critical (same root cause as F-PAY-01)
- **Location:** `components/sections/Pricing.tsx`
- **Description:** The interactive calculator is the most persuasive conversion element on the site and it quotes prices the checkout will not match.
- **Recommended fix:** Covered by F-PAY-01.

### F-PUB-02 — Fabricated testimonials and sample data presented without disclaimer
- **Severity:** Medium
- **Location:** `components/sections/Testimonials.tsx` (9 invented people), `app/(auth)/login/LoginClient.tsx:9-28` and `signup/SignupClient.tsx:12-31` (`randomuser.me` avatars, invented quotes), sample contacts in `Hero.tsx`/`HowItWorks.tsx`/`StatsSection.tsx`/`FinalCTA.tsx`, illustrative chart data in `StatsSection.tsx`
- **Description:** Testimonials with named individuals, roles, and companies are fabricated, and the auth screens use stock `randomuser.me` faces as if real customers. Presenting invented endorsements as genuine is a regulatory risk (FTC endorsement guides; UK ASA/CMA fake-review rules). Sample contact data and chart numbers are illustrative but not labelled as such.
- **Root cause:** Template/demo content left in production.
- **Business impact:** Legal/reputational exposure; trust collapse if discovered.
- **User impact:** Misleading social proof.
- **Recommended fix:** Replace with real, consented testimonials, or clearly label example/illustrative content; remove fake avatars from auth screens.

### F-PUB-03 — Footer links and brand integrity (verified — active footer is correct)
- **Severity:** Low
- **Location:** `app/page.tsx:17,132` imports `components/ui/motion-footer.tsx`; the **dead** `components/motion-footer.tsx` is *not* imported.
- **Description:** The **active** footer (`components/ui/motion-footer.tsx`) is correctly branded ("© {year} StealthConnect AI", wordmark "StealthConnect AI", giant "STEALTH" backdrop) and all its links are valid (`/privacy`, `/terms`, `/gdpr`, `/contact`, `/#pricing`, `/signup`) — **no broken `#` links**. However, the **dead** component `components/motion-footer.tsx` contains wrong branding ("© 2026 Volvox", "SOBERS" backdrop) and placeholder `href="#"` links. It is not rendered, but it is a latent reputational landmine if ever wired up by mistake.
- **Recommended fix:** Delete `components/motion-footer.tsx` (and other dead components — see F-MISC-01) to eliminate the risk.

---

## 8. Contact form & chatbot

### F-CONTACT-01 — Contact endpoint has no rate limiting, no spam protection, no honeypot
- **Severity:** High
- **Location:** `app/api/contact/route.ts:3-54`, `components/ContactForm.tsx`
- **Description:** `POST /api/contact` validates field presence/email/length and forwards to Resend with the submitter's email as `reply_to`. There is no rate limit, no honeypot, no CAPTCHA, no origin check. A script can flood `TEAM_EMAIL` and burn Resend quota/cost.
- **Root cause:** No abuse controls on an unauthenticated public endpoint.
- **Business impact:** Email-bomb to the support inbox; Resend cost/quota exhaustion; possible Resend account suspension for spam.
- **Recommended fix:** Add IP-based rate limiting (shared limiter or Vercel BotID/Firewall), a hidden honeypot field, and an origin/referer check; consider Cloudflare Turnstile.

### F-CONTACT-02 — Chatbot endpoint is unauthenticated, unthrottled, and quotes a price that contradicts the pricing page
- **Severity:** High
- **Location:** `app/api/chatbot/route.ts:9,25-44`
- **Description:** Two issues: (a) **No rate limiting and no auth** — anyone can stream unlimited Groq completions, exhausting `GROQ_API_KEY` quota/cost and enabling a cheap DoS-by-cost. (b) The system prompt hardcodes "**Email+Phone $1.20 each**" (line 9), which matches the *checkout* but contradicts the *pricing page's* advertised "$1.08" combo (`Pricing.tsx:75`). So the bot, the pricing page, and possibly the volume tiers all tell the customer different numbers.
- **Root cause:** Public AI endpoint with no throttle; pricing duplicated in a fourth place (the prompt).
- **Business impact:** Uncontrolled LLM spend; inconsistent pricing messaging undermines trust and compounds F-PAY-01.
- **User impact:** Conflicting answers about price.
- **Recommended fix:** Rate-limit per IP (and/or require a session); cap message count/length; centralise pricing (the prompt should read from the same `lib/pricing.ts` source, or at minimum match the site). Reconcile all four pricing surfaces.

### F-CONTACT-03 — Contact form `noValidate` disables native validation but client only checks server-side
- **Severity:** Low
- **Location:** `components/ContactForm.tsx:88` (`noValidate`)
- **Description:** The form sets `noValidate`, so HTML5 `required`/`minLength` hints don't block submit; all validation falls to the server (which does validate — good). Slightly worse inline UX (errors only after round-trip).
- **Recommended fix:** Keep server validation; optionally add lightweight client validation for instant feedback.

---

## 9. Cross-cutting / misc

### F-MISC-01 — Dead components shipped in the repo (bundle + clutter + branding risk)
- **Severity:** Medium
- **Location:** Verified unimported: `components/sections/LandingNav.tsx`, `components/hero.tsx`, `components/motion-footer.tsx` (Volvox/SOBERS), `components/Testimonials.tsx`, `components/testimonial-v2.tsx`, `components/sections/FeaturesStack.tsx`, `components/floating-consult-button.tsx`, `components/cards-stack.tsx` (only used by dead FeaturesStack), and likely `components/header-2.tsx`, `components/ai-image-generator-hero.tsx`, `components/logos3.tsx` (verify before deleting).
- **Description:** Multiple alternative/older implementations of the nav, hero, footer, testimonials, and floating button remain in the tree. `app/page.tsx` uses `components/Navbar.tsx`, `components/sections/Hero.tsx`, and `components/ui/motion-footer.tsx`; the others are dead.
- **Root cause:** Iterative design left old variants behind.
- **Business impact:** Larger surface to maintain; risk of importing the wrong (mis-branded) component; potential bundle bloat if any get pulled in.
- **Recommended fix:** Delete confirmed-dead components after a final `grep` of imports; keep one canonical version of each section.

### F-MISC-02 — Admin console mounted at two routes
- **Severity:** Low
- **Location:** `app/admin/page.tsx`, `app/dashboard/admin/page.tsx` (both render `AdminDashboard`)
- **Description:** Two URLs render the same console. Harmless but duplicative; the sidebar links to `/dashboard/admin`.
- **Recommended fix:** Keep one (recommend `/dashboard/admin`, inside the authenticated shell) and redirect the other.

### F-MISC-03 — `@anthropic-ai/sdk` is an unused dependency
- **Severity:** Low
- **Location:** `package.json:12`; no source imports.
- **Description:** Installed but never imported (the chatbot uses `groq-sdk`). CSP also whitelists `api.anthropic.com` for a feature that doesn't exist.
- **Recommended fix:** Remove the dependency and the unused CSP origin (or keep if Anthropic is on the roadmap, but document it).

### F-MISC-04 — React 18 pinned under Next 16 (verify peer compatibility)
- **Severity:** Medium
- **Location:** `package.json:32,35-36`
- **Description:** `next ^16.2.4` with `react`/`react-dom ^18`. Next 16 targets React 19; a mismatch can cause subtle hydration/runtime issues or build warnings.
- **Recommended fix:** Confirm the installed React major satisfies Next 16's peer requirement; upgrade React if required.

---

## 10. State coverage matrix (loading / error / empty / success)

| Surface | Loading | Error | Empty | Success |
|---|---|---|---|---|
| Dashboard home | ✅ skeleton (`dashboard/loading.tsx`) | ✅ `dashboard/error.tsx` | ⚠️ "Delivered" KPI always 0 (F-PAY-02) | n/a |
| Orders list | ✅ skeleton | ✅ route error | ✅ `EmptyState` | n/a |
| Submit wizard | ✅ inline "Processing…" + PayPal pending | ✅ inline `payErr` + orphan ref | n/a | ✅ success screen + redirect |
| Account | ⚠️ none (fast) | ✅ route error | ✅ "No credit activity" | ✅ toast on pw change |
| Admin orders | ✅ skeleton + "Load all" gate | ✅ toast | ✅ "No orders found" | ✅ toast |
| Contact form | ✅ spinner | ✅ inline `role=alert` | n/a | ✅ success card |
| Chatbot | ✅ streaming | ✅ generic error | n/a | n/a |
| 404 / global error | n/a | ✅ branded `not-found.tsx` / `error.tsx` | n/a | n/a |

Overall state coverage is strong; the only functional gap is the false "Delivered" status surfaced across user/admin views.

---

## 11. Functional defect count

| Severity | Count | IDs |
|---|---|---|
| Critical | 2 (3 instances) | F-PAY-01 / F-PUB-01, F-PAY-02 / F-ADMIN-01 |
| High | 5 | F-PAY-03, F-CRED-01, F-CONTACT-01, F-CONTACT-02, F-DASH-01 |
| Medium | 7 | F-AUTH-01, F-PAY-04, F-CRED-02, F-ADMIN-02, F-WIZ-01, F-PUB-02, F-MISC-01, F-MISC-04 |
| Low | 9 | F-AUTH-02, F-AUTH-03, F-PAY-05, F-ADMIN-03, F-DASH-02, F-WIZ-02, F-PUB-03, F-CONTACT-03, F-MISC-02, F-MISC-03 |

(Several IDs are dual-listed where one root cause surfaces in multiple views.) Prioritisation and sequencing are in `docs/07` and `docs/08`.

*End of Phase 2.*
