# StealthConnect AI — Master Priority Report (Phase 7)

> **Purpose:** Single prioritised view of every finding from `docs/02`–`docs/06`, ranked by launch risk.
> **Buckets:** `P0` Launch-blocking · `P1` Critical · `P2` High · `P3` Medium · `P4` Low.
> **Columns:** Effort (S ≤½ day · M ≤2 days · L ≤1 week) · Risk (of the fix itself) · Order (recommended sequence) · Expected impact.
> **Cross-reference:** IDs map to the source audit docs.

---

## P0 — Launch-blocking (do not ship without these)

| # | ID(s) | Issue | Effort | Fix risk | Order | Expected impact |
|---|---|---|---|---|---|---|
| P0-1 | SEC-CRIT-01 (`docs/05`) | Spoofable `x-user-id` header → API auth bypass / IDOR / admin-credit self-grant | **S** | Low | **1st** | Closes a full-API authentication bypass; protects customer data, credits, and admin actions |
| P0-2 | F-PAY-02 / F-ADMIN-01 / F-DASH-01 (`docs/02`) | Order status `delivered` not in DB enum (`completed`) → admins cannot fulfil; "Delivered" never shows | **S–M** | Low–Med (DB migration) | 2nd | Restores the core fulfilment workflow + customer-facing "Delivered" status + dashboard KPI |
| P0-3 | F-PAY-01 / F-PUB-01 / UX-C1 (`docs/02`,`03`) | Advertised volume/combo discounts not applied at checkout (quote ≠ charge) | **M** | Med (pricing logic) | 3rd | Eliminates overcharging vs advertised price; removes chargeback/false-advertising risk; restores funnel trust |
| P0-4 | (`docs/02` F-PUB-02 detail) / Terms §10 | Terms of Service has unfilled legal placeholders `[JURISDICTION]`/`[ARBITRATION SEAT]`/`[ARBITRAL BODY]` | **S** (legal-dependent) | Low | 4th | Makes the binding contract enforceable/professional before taking real money |

**Rationale:** P0-1 is a security catastrophe waiting to happen and a ~30-minute code fix. P0-2 and P0-3 mean the product either *can't deliver* or *charges the wrong amount* — both fatal for a paid SaaS. P0-4 is a low-effort legal must-fix (needs counsel input on the values).

---

## P1 — Critical (fix in launch week)

| # | ID(s) | Issue | Effort | Fix risk | Order | Expected impact |
|---|---|---|---|---|---|---|
| P1-1 | SEC-H2 (`docs/05`) | No rate limit/abuse protection on `/api/chatbot` (Groq cost DoS) and `/api/contact` (email-bomb) | **M** | Low | 5th | Prevents launch-day cost-amplification DoS + support-inbox spam |
| P1-2 | SEC-H1 (`docs/05`) | Service-role client used for user data bypasses RLS (no second gate) | **M–L** | Med | 6th | Makes RLS a live defence; limits blast radius of any handler bug |
| P1-3 | F-PAY-03 (`docs/02`) | Order confirmation email is fire-and-forget; `EMAIL_FROM` falls back to `onboarding@resend.dev` | **S–M** | Low | 7th | Customers reliably get receipts from a verified domain (deliverability + trust) |
| P1-4 | F-CRED-01 (`docs/02`) | Atomic credit deduction silently falls back to non-atomic if migration 004 absent | **S** | Low | 7th | Guarantees no credit double-spend; surfaces misconfiguration loudly |
| P1-5 | SEC-H5 (`docs/05`) | Stored `linkedin_urls` (3rd-party PII) contradicts "we don't store" claim → GDPR/CCPA risk | **M** (+ counsel) | Med | 8th | Aligns practice with policy; reduces compliance exposure |
| P1-6 | F-PUB-02 / UX-H2 (`docs/02`,`03`) | Fabricated testimonials + fake `randomuser.me` faces presented as real | **M** | Low | 8th | Removes FTC/ASA fake-endorsement risk; protects credibility |
| P1-7 | SEC-H3 (`docs/05`) | In-memory rate limiter is per-instance (bypassable) | **M** | Low | 9th | Makes throttling effective on serverless; protects payment endpoints |
| P1-8 | SEC-H4 (`docs/05`) | CSP allows `unsafe-inline` + `unsafe-eval` | **M–L** | Med (hydration) | 9th | Restores meaningful XSS protection |

---

## P2 — High (fix within 2–3 weeks)

| # | ID(s) | Issue | Effort | Fix risk | Order | Expected impact |
|---|---|---|---|---|---|---|
| P2-1 | UX-H1 (`docs/03`) | Brand blue `#0038FF` on white fails WCAG AA contrast | **S** | Low | 10 | Accessibility compliance + readability |
| P2-2 | PERF-H1 (`docs/04`) | Middleware `getUser()` on every route incl. `/api/*` | **S** | Med | 10 | Lower latency on every request; less Supabase load |
| P2-3 | PERF-H2 (`docs/04`) | recharts shipped for one decorative chart | **M** | Low | 11 | Smaller bundle / better mobile TTI + CWV (SEO) |
| P2-4 | PERF-H3 (`docs/04`) | Two animation engines + client-heavy landing | **L** | Med | 12 | Lower JS/INP; better CWV ranking signal |
| P2-5 | SEC-M1 (`docs/05`) | Webhook fails open on handler error; refunds don't reverse credits | **M** | Med | 11 | Reliable refund/dispute handling; no lost events |
| P2-6 | SEC-M2 / F-ADMIN-03 | CSV export formula injection | **S** | Low | 10 | Protects admins opening exports |
| P2-7 | SEC-M3 (`docs/05`) | No explicit CSRF/origin checks on mutations | **S** | Low | 10 | Defence-in-depth on state-changing routes |
| P2-8 | SEC-M4 (`docs/05`) | ±2¢ amount tolerance (10% on a 20¢ item) | **S** | Low | 11 | Closes minor revenue leak; exact-cents integrity |
| P2-9 | SEC-M5 (`docs/05`) | Incomplete startup env validation | **S** | Low | 10 | Fail-fast on misconfig instead of silent wrong behaviour |
| P2-10 | F-ADMIN-02 / PERF-M2 | Unbounded CSV export + joined-column filter | **M** | Low | 12 | Export survives scale; faster admin search |
| P2-11 | F-PAY-04 (`docs/02`) | No max quantity on credits order path | **S** | Low | 10 | Prevents oversized/abusive orders |
| P2-12 | F-CRED-02 (`docs/02`) | Duplicate admin credit endpoints | **S** | Low | 11 | One code path; smaller attack surface |
| P2-13 | SEO-1 / SEO-2 (`docs/06`) | Structured-data price drift + www/apex canonical | **S–M** | Low | 11 | Avoids duplicate content + rich-result price mismatch |
| P2-14 | F-MISC-01 / UX-H4 | Dead components (incl. mis-branded "Volvox" footer) | **S** | Low | 12 | Removes branding landmine + clutter |
| P2-15 | F-MISC-04 / SEC-L3 | React 18 pinned under Next 16 (verify peer) | **S–M** | Med | 10 | Avoids subtle hydration/runtime issues |

---

## P3 — Medium (backlog, next month)

| # | ID(s) | Issue | Effort | Impact |
|---|---|---|---|---|
| P3-1 | UX-H3 (`docs/03`) | Inline styles instead of token utility layer | L | Long-term consistency/maintainability |
| P3-2 | UX-M1 (`docs/03`) | Accent-colour discipline (blue vs lime) | S | Clearer visual hierarchy |
| P3-3 | UX-M2 (`docs/03`) | No shared type scale | M | Consistent rhythm |
| P3-4 | UX-M3 (`docs/03`) | Two floating widgets may overlap on mobile | S | Cleaner mobile UX |
| P3-5 | UX-M4 (`docs/03`) | No `prefers-reduced-motion` support | S | Accessibility (vestibular) |
| P3-6 | UX-M6 (`docs/03`) | No focus trap in drawer/chat overlays | M | Keyboard/SR accessibility |
| P3-7 | F-AUTH-01 (`docs/02`) | Forgot-password lands on account page (no reset screen) | M | Recovery completion rate |
| P3-8 | F-WIZ-01 (`docs/02`) | CSV upload no size limit (browser hang) | S | Bulk-user stability |
| P3-9 | SEC-M6/M7 (`docs/05`) | Verbose error detail + PII in logs | S | Less info disclosure / PII exposure |
| P3-10 | PERF-M1 (`docs/04`) | Duplicate profile fetch per dashboard load | S | Fewer DB round-trips |
| P3-11 | PERF-M4 (`docs/04`) | Auth/testimonial images bypass `next/image` | S | LCP on auth pages |
| P3-12 | F-PAY-05 (`docs/02`) | `amount_paid` from client on credits path | S | Reporting integrity |

---

## P4 — Low (polish / hygiene)

| # | ID(s) | Issue | Effort |
|---|---|---|---|
| P4-1 | F-MISC-02 | Admin mounted at two routes | S |
| P4-2 | F-MISC-03 / SEC-L2 | `@anthropic-ai/sdk` unused + dead CSP origin | S |
| P4-3 | SEC-L1 | Auth callback `next` not `//host`-validated | S |
| P4-4 | SEC-L4 | No error monitoring (Sentry) | M |
| P4-5 | SEC-L5 / PERF-L4 | `paypal_intents` no TTL; single keep-alive cron | S |
| P4-6 | SEO-4/5/6 | sitemap `lastModified`, redundant `next-sitemap`, no `twitter:site` | S |
| P4-7 | F-AUTH-02/03 | Dead `pwOld` state; weak password policy | S |
| P4-8 | F-WIZ-02 / UX-L1/L3/L4 | Client/server URL-regex mismatch; mobile step labels; feedback-pattern consistency | S |
| P4-9 | SEO-7 | Thin content surface (growth opportunity) | L |
| P4-10 | PERF-L3 | No bundle analyzer / perf budget in CI | S |

---

## Risk heat map (by area)

| Area | P0 | P1 | P2 | P3 | P4 |
|---|---|---|---|---|---|
| Security | 1 | 4 | 5 | 1 | 3 |
| Payments/Orders | 2 | 2 | 2 | 1 | 1 |
| Compliance/Legal | 1 | 2 | — | — | — |
| Performance | — | — | 3 | 2 | 2 |
| UI/UX | (1)* | 1 | 2 | 5 | 1 |
| SEO | — | — | 1 | — | 1 |

\* UX-C1/C2 are the UX faces of P0-2/P0-3.

---

## The "minimum to launch" set

If only one batch can ship before go-live, it is the **four P0s** plus **P1-1 (rate limiting)** and **P1-3 (email reliability)**:

1. **P0-1** — sanitise identity headers in middleware (≈30 min).
2. **P0-2** — fix the order-status enum end-to-end.
3. **P0-3** — single pricing source-of-truth (or remove unhonoured discounts).
4. **P0-4** — fill Terms legal placeholders (with counsel).
5. **P1-1** — rate-limit `/api/chatbot` + `/api/contact`.
6. **P1-3** — make order confirmation reliable + verified sender.

Total effort ≈ **3–5 focused engineering days** (excluding legal turnaround on P0-4). Everything else can follow the `docs/08` roadmap.

*End of Phase 7.*
