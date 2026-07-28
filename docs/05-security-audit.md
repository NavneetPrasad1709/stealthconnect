# StealthConnect AI — Security Audit (Phase 5)

> **Document type:** Application security review (auth, authorization, injection, secrets, API, rate-limiting, data protection, dependencies).
> **Method:** White-box review of the actual code paths. Each finding cites `path:line` and states the exploit, impact, and fix. Where a claim depends on deployment behaviour, that caveat is stated explicitly.
> **Severity:** `Critical` (auth bypass / direct financial or data loss) · `High` · `Medium` · `Low`.
> **Scope note:** This is a defensive review of the StealthConnect AI codebase for its own launch readiness.

---

## 0. Security posture summary

The team has done **a lot right**: RLS enabled on every table, server-authoritative pricing, PayPal intent-ownership + amount reconciliation, idempotent order creation, atomic credit RPC with row locks, append-only credit ledger, PayPal webhook signature verification, a comprehensive security-header set (HSTS/CSP/XFO/nosniff/Referrer-Policy/Permissions-Policy/COOP/CORP), PKCE OAuth, HTTP-only session cookies, and no hardcoded secrets.

However, **the primary authentication control for the entire API surface is a request header that can be spoofed by an unauthenticated caller** (SEC-CRIT-01). Because nearly all data access uses the service-role client (which bypasses RLS), that header is effectively the *only* gate in front of most mutations — making this the single most important fix before launch. RLS is a backstop that the app rarely exercises, not the front-line control.

---

## CRITICAL

### SEC-CRIT-01 — Spoofable `x-user-id` identity header → authentication bypass / IDOR / privilege escalation
- **Severity:** Critical
- **Where:** `lib/supabase/middleware.ts:42-61`, `proxy.ts:8-11`, and every API route that reads identity from the header (e.g. `app/api/orders/create/route.ts:25`, `app/api/credits/use/route.ts:8`, `app/api/admin/credits/route.ts:6`, `app/api/credits/admin-assign/route.ts:14`, `app/api/admin/orders/route.ts:5`).
- **How identity flows:** API routes do **not** call Supabase to authenticate. They trust `headers().get("x-user-id")`, which the middleware is supposed to inject from the verified session.
- **The defect:** The middleware only sets `x-user-id`/`x-user-email` **inside `if (user) { … }`** (lines 44-61). It builds `new Headers(request.headers)` (which *includes any client-supplied headers*) and overwrites `x-user-id` — good for authenticated users. But when `user` is **null**, that block is skipped and the middleware returns `NextResponse.next({ request })` with the **original, unmodified** request headers. The middleware **never deletes** an incoming `x-user-id`. And `/api/*` is **not** in `protectedPaths = ["/dashboard","/admin","/order"]` (line 66), so unauthenticated API requests are **not redirected**.
- **The exploit:** An unauthenticated attacker sends `POST /api/credits/use` (or `/api/orders/create`, `/api/admin/credits`, …) with a forged header `x-user-id: <victim-uuid>`. The middleware sees no session, skips the overwrite, and forwards the forged header to the route handler, which reads it as the caller's identity and acts as that user. Concretely:
  - `POST /api/credits/use` / `orders/create` with `use_credits:true` → **drains the victim's credits** and creates orders on their account.
  - `POST /api/admin/credits` with an **admin's** UUID → attacker **grants themselves unlimited credits** (the route authorises by `getProfile(forgedAdminId).role === "admin"`).
  - `GET /api/admin/orders` / `/api/admin/export` with an admin UUID → **exfiltrates all customers' orders + emails + LinkedIn URLs**.
- **Caveat (does not reduce severity ceiling):** Practical exploitation requires knowing a target `profiles.id` (a UUIDv4, not trivially guessable). But (a) self-targeting/admin-targeting needs only one leaked UUID (IDs appear in URLs, support, CSV exports, the account page shows a truncated id), and (b) relying on UUID secrecy for *authentication* is not a control. Authenticated users are currently protected (the overwrite path runs), but the unauthenticated path is wide open.
- **Root cause:** The middleware sanitises spoofed headers only on the authenticated branch; it must sanitise on **all** branches.
- **Fix (must-do before launch):** In `updateSession`, **always** construct a sanitised header set, **delete** `x-user-id` and `x-user-email` from it unconditionally, and only re-set them when a verified `user` exists — then return that sanitised request downstream in *every* path (including null-user). Additionally, defence-in-depth: have sensitive API routes verify the session themselves (or add `/api` to a matcher that strips these headers), and prefer the RLS-backed anon client over the service-role client where possible so RLS becomes a real second gate. See `docs/09` FP-03.

---

## HIGH

### SEC-H1 — Service-role client used for almost all data access bypasses RLS, amplifying any auth flaw
- **Severity:** High
- **Where:** `lib/admin-db.ts:adminDb()` and `lib/supabase/server.ts:createAdminClient()` used by dashboard pages and nearly every API route.
- **Detail:** RLS is enabled and well-written, but the app reads/writes through the **service-role** key, which **bypasses RLS entirely**. So the per-row policies in `migrations/002` rarely execute in production — they only protect a hypothetical anon-key path the app doesn't use. The real authorization is the application code (and the spoofable header in SEC-CRIT-01). One logic bug in any handler = unrestricted DB access.
- **Impact:** Removes the RLS safety net; magnifies SEC-CRIT-01 and any future handler bug into a full-DB compromise.
- **Fix:** Use the **anon, cookie-scoped** server client (`createClient()` in `lib/supabase/server.ts`) for user-scoped reads/writes so RLS enforces ownership, reserving the service-role client for genuinely privileged operations (RPCs, webhooks, admin grants). This makes RLS a live second line of defence.

### SEC-H2 — No rate limiting on public endpoints `/api/chatbot` and `/api/contact`
- **Severity:** High
- **Where:** `app/api/chatbot/route.ts` (no limiter, no auth), `app/api/contact/route.ts` (no limiter, no honeypot).
- **Detail:** `/api/chatbot` streams Groq completions to anyone, unthrottled → cost-amplification DoS against `GROQ_API_KEY` (and possible quota suspension). `/api/contact` forwards to Resend with no throttle/honeypot/CAPTCHA → support-inbox email-bomb and Resend cost/quota abuse, risking sender-reputation/account suspension.
- **Fix:** Add IP-based rate limiting (and bot protection — Vercel BotID/Firewall or Cloudflare Turnstile) to both; add a honeypot to the contact form; cap chatbot message count/length and consider requiring a session.

### SEC-H3 — In-memory rate limiter is per-instance, not distributed (bypassable)
- **Severity:** High
- **Where:** `lib/rate-limit.ts` (module-scoped `Map`), used by PayPal/order endpoints.
- **Detail:** On serverless/Fluid Compute, each instance has its own bucket map; a burst spread across instances multiplies the effective limit, and buckets reset on cold start. The file's own docstring acknowledges this. For payment endpoints this weakens brute-force/abuse protection.
- **Fix:** Back the limiter with a shared store (Upstash Redis / Vercel KV-equivalent marketplace store) or use Vercel Firewall rate-limit rules for edge-enforced limits.

### SEC-H4 — CSP allows `unsafe-inline` and `unsafe-eval` in `script-src`
- **Severity:** High
- **Where:** `next.config.ts:31`.
- **Detail:** The CSP is otherwise strong, but `script-src 'unsafe-inline' 'unsafe-eval'` permits inline script execution and `eval`, substantially weakening XSS mitigation — the main thing CSP is meant to stop. (The code itself avoids `dangerouslySetInnerHTML` except for the JSON-LD blob and the footer `<style>`, both static, so current XSS exposure is low — but the policy provides little protection if an injection is ever introduced.)
- **Fix:** Move to a nonce-based CSP with `strict-dynamic` (Next supports nonces via middleware), removing `unsafe-inline`/`unsafe-eval`. Keep PayPal/Google origins whitelisted.

### SEC-H5 — Stored data contradicts the published data-retention promise (compliance risk)
- **Severity:** High (legal/compliance)
- **Where:** `orders.linkedin_urls TEXT[]` stored indefinitely (`migrations/001:76`, surfaced in `OrdersView`/`admin/orders`/`export`) vs the chatbot's claim "**We do not store LinkedIn URLs beyond order fulfillment**" (`app/api/chatbot/route.ts:16`) and the privacy page's data-handling statements.
- **Detail:** LinkedIn URLs (and, by extension, the contacts being researched — third-party PII) are retained in the `orders` table permanently, contradicting the stated policy. The Privacy/GDPR pages assert deletion rights and limited retention; the actual schema has no retention/erasure mechanism for `linkedin_urls`.
- **Impact:** GDPR/CCPA exposure (processing third-party PII without a retention limit while claiming otherwise); a discoverable contradiction between policy and practice.
- **Fix:** Either implement the promised behaviour (purge `linkedin_urls` after fulfilment, or store a hash/reference) **or** correct the chatbot prompt and policy to match reality. Add a documented retention period and an erasure routine for GDPR requests.

---

## MEDIUM

### SEC-M1 — PayPal webhook fails open on handler errors; refunds don't reverse credits or notify the customer
- **Severity:** Medium
- **Where:** `app/api/paypal/webhook/route.ts:91-138`.
- **Detail:** Signature verification is correctly enforced (good). But the event-handling `try/catch` swallows errors and still returns `200` (lines 133-138) to avoid PayPal retries — so a transient DB failure during a `REFUNDED`/`DISPUTE` event is silently lost (no retry). Also, on refund the handler sets `orders.status = 'refunded'` and logs an alert but does **not** reverse any credits granted or refund-related ledger entry, and there's no customer notification.
- **Fix:** On handler failure, return non-2xx so PayPal retries (or enqueue for retry); on refund/reversal, reverse the corresponding credits/ledger entry and notify the customer; de-duplicate webhook events idempotently.

### SEC-M2 — CSV export is vulnerable to formula injection
- **Severity:** Medium
- **Where:** `app/api/admin/export/route.ts:30-40`.
- **Detail:** User-controlled `full_name` is quote-escaped but a leading `=`/`+`/`-`/`@` still executes as a formula in Excel/Sheets; `email`/`contact_type` are not quoted at all. A malicious customer name like `=HYPERLINK("http://evil","click")` could attack an admin opening the export.
- **Fix:** Prefix any cell beginning with `= + - @` with a `'`, and wrap all fields in quotes with `"`→`""` escaping.

### SEC-M3 — No explicit CSRF/origin checks on state-changing POSTs
- **Severity:** Medium
- **Where:** `orders/create`, `paypal/*`, `credits/use`, `admin/*`.
- **Detail:** Auth relies on Supabase cookies (default `SameSite=Lax`, which blocks most cross-site POST cookie sending) plus the header pattern. There is no explicit `Origin`/`Referer` validation. Combined with SEC-CRIT-01 (which needs no cookie at all), the absence of origin checks is a gap.
- **Fix:** Validate `Origin`/`Referer` against an allowlist on mutating routes; confirm Supabase cookies are `SameSite=Lax`/`Strict` + `Secure`.

### SEC-M4 — Payment amount tolerance (±2¢) is large relative to low-priced items
- **Severity:** Medium
- **Where:** `app/api/orders/create/route.ts:74,113`, `app/api/paypal/capture-order/route.ts:86`.
- **Detail:** A ±2¢ tolerance on a 20¢ email is a 10% variance; an attacker could underpay by 2¢ per item. Across volume this is a (small) revenue leak and a sign of mixed dollar/cent arithmetic.
- **Fix:** Tighten to 0¢ tolerance using integer-cents arithmetic end-to-end (the server already computes integer cents; compare exactly).

### SEC-M5 — Incomplete startup env validation; unsafe email-sender fallback
- **Severity:** Medium
- **Where:** `lib/env.ts:7-31` (validates only Supabase keys + APP_URL), `lib/email.ts:8` (`EMAIL_FROM` defaults to `onboarding@resend.dev`).
- **Detail:** PayPal secret/client-id, `PAYPAL_WEBHOOK_ID`, `RESEND_API_KEY`, `GROQ_API_KEY`, `TEAM_EMAIL` are not validated at startup — misconfiguration surfaces as runtime 500s or, worse, silent wrong behaviour (e.g. sending from an unverified `onboarding@resend.dev`, which fails SPF/DKIM and lands in spam). (The webhook does fail-closed if `PAYPAL_WEBHOOK_ID` is missing — good.)
- **Fix:** Validate all required server env vars at boot; remove the `onboarding@resend.dev` fallback in production.

### SEC-M6 — Verbose error detail returned to clients
- **Severity:** Medium
- **Where:** `app/api/paypal/create-order/route.ts:97-100` returns `detail: errMsg` (raw error text, incl. possible DB messages); various handlers echo provider messages.
- **Detail:** Leaking internal error strings (DB/relation names, stack hints) aids reconnaissance.
- **Fix:** Return generic client messages; log details server-side only.

### SEC-M7 — PII written to logs
- **Severity:** Medium
- **Where:** e.g. `orders/create` logs `body`/`intent` objects on mismatch (`:85,:94`), webhook logs full `event`.
- **Detail:** Emails, LinkedIn URLs, and order details are written to application logs (retained by the platform), expanding PII exposure.
- **Fix:** Redact PII in logs; log identifiers, not payloads.

---

## LOW

### SEC-L1 — Auth callback `next` param not validated against `//host` open-redirect
- **Severity:** Low
- **Where:** `app/auth/callback/route.ts:8,34` (`next = searchParams.get("next") ?? "/dashboard"`, then `redirect(`${origin}${next}`)`).
- **Detail:** The middleware validates `next.startsWith("/")`, but the callback does not. Appending `next` to `origin` largely contains it, but it should still reject values not matching `^/(?!/)` to be safe.
- **Fix:** Validate `next` is a same-site path (`startsWith("/") && !startsWith("//")`).

### SEC-L2 — `@anthropic-ai/sdk` unused dependency + unused CSP origin
- **Severity:** Low
- **Where:** `package.json:12`, `next.config.ts:39` (`connect-src … api.anthropic.com`).
- **Detail:** Dead dependency = unnecessary supply-chain surface; CSP whitelists an origin no code uses.
- **Fix:** Remove both.

### SEC-L3 — No dependency-vulnerability gate; React/Next version mismatch
- **Severity:** Low
- **Where:** `package.json`; no `npm audit`/Dependabot config in repo.
- **Detail:** No automated dependency scanning; `react ^18` under `next ^16` (verify peer requirement — see `docs/02` F-MISC-04).
- **Fix:** Add `npm audit`/Dependabot/Snyk to CI; align React to Next 16's requirement.

### SEC-L4 — No application error monitoring
- **Severity:** Low
- **Where:** Only `console.error` + Vercel Speed Insights.
- **Detail:** Security-relevant events (failed captures, orphan payments, auth anomalies) are only in logs; no alerting/aggregation (Sentry, etc.).
- **Fix:** Add error monitoring with alerting on `pending_alerts`, capture failures, and 5xx spikes.

### SEC-L5 — `paypal_intents` grows unbounded (no TTL)
- **Severity:** Low
- **Where:** `migrations/004:148-160`, `lib/admin-db.ts` (insert, mark consumed, never delete).
- **Fix:** Add a scheduled cleanup of consumed/expired intents.

---

## Controls that are correct (verified — keep)

| Control | Status | Evidence |
|---|---|---|
| RLS enabled on all tables | ✅ (but bypassed by service role — SEC-H1) | `migrations/001-004` |
| Server-authoritative pricing | ✅ | `paypal/create-order`, `orders/create` |
| PayPal intent ownership + amount match | ✅ | `capture-order:34-94`, `orders/create:82-115` |
| Idempotent order creation | ✅ | `orders/create:125-139` (`paypal_order_id` UNIQUE, 409 on cross-user) |
| Atomic credit deduction | ✅ | `deduct_credit` `FOR UPDATE` (`004:25-27`) |
| Append-only credit ledger | ✅ | `migrations/002:44-56` (no insert/update/delete) |
| Webhook signature verification | ✅ | `paypal/webhook:53-84` |
| Security headers (HSTS/XFO/nosniff/Referrer/Permissions/COOP/CORP) | ✅ | `next.config.ts:3-50` |
| PKCE OAuth + HTTP-only cookies | ✅ | `@supabase/ssr`, `site-url.ts` |
| No hardcoded secrets; server-only service key | ✅ | env-based throughout |
| Open-redirect guard in middleware | ✅ | `middleware.ts:85` |
| Admin role re-checked server-side | ✅ | `admin/*` handlers |

---

## OWASP Top-10 mapping

| Category | Finding(s) |
|---|---|
| A01 Broken Access Control | **SEC-CRIT-01**, SEC-H1, SEC-M3 |
| A02 Cryptographic Failures | — (cookies HTTP-only/Secure; verify SameSite) |
| A03 Injection | SEC-M2 (CSV), low XSS (mitigated by code, weak CSP SEC-H4) |
| A04 Insecure Design | SEC-H1 (service-role-everywhere), SEC-M4 (tolerance) |
| A05 Security Misconfiguration | SEC-H4 (CSP), SEC-M5 (env/sender), SEC-L2 |
| A06 Vulnerable Components | SEC-L3 |
| A07 Auth Failures | **SEC-CRIT-01**, SEC-H2/H3 |
| A08 Integrity Failures | SEC-M1 (webhook fail-open) |
| A09 Logging/Monitoring | SEC-M7, SEC-L4 |
| A10 SSRF | — (no user-controlled server-side fetch targets found) |
| Privacy/Compliance | SEC-H5 (retention vs policy), SEC-M7 |

---

## Verdict

**Do not launch until SEC-CRIT-01 is fixed.** It is a low-effort fix (sanitise the identity headers unconditionally in middleware) that closes an authentication bypass affecting the entire API. Pair it with SEC-H1 (use RLS-scoped clients for user data) so a single control failure can no longer expose the whole database, and SEC-H2/H3 (rate-limiting) to prevent cost/abuse DoS on launch day. SEC-H5 should be resolved with counsel before processing real customer data at scale.

*End of Phase 5.*
