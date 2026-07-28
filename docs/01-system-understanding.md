# StealthConnect AI — System Understanding

> **Document type:** Principal-architect system map (read-only audit).
> **Scope:** Full-stack understanding of the StealthConnect AI codebase at repo root `d:/SConnectAI`.
> **Grounding rule:** Every claim below is cited as `path:line` against the real source. Where a behavior is asserted, it is verifiable in the repo.
> **Live URL:** https://www.stealthconnect.ai

---

## 1. Complete Project Overview

StealthConnect AI is a **B2B contact-data SaaS**. A customer pastes LinkedIn profile URLs (single, bulk paste, or CSV-of-URLs), chooses what they want enriched (**verified work email**, **direct phone**, or **both**), optionally adds an **AI-written cold email draft** per profile, and pays either with **PayPal** or with prepaid **credits**. The order is then fulfilled by the team (a manual/operational back-office process surfaced via the admin dashboard and team email notifications) and the contact data is delivered to the customer.

| Aspect | Detail | Evidence |
|---|---|---|
| **What it sells** | Verified B2B contact info (email / phone / both) enriched from LinkedIn URLs | `app/api/paypal/create-order/route.ts` `BASE_CENTS` map; `components/dashboard/SubmitOrder/SubmitWizard.tsx` contact-type step |
| **Who uses it** | (a) Self-serve buyers (sales/recruiting/growth teams), (b) Internal **admins** who grant credits, manage order status, export data | `app/admin/layout.tsx`; `app/api/admin/*` |
| **Add-on product** | AI-generated cold-email draft, priced per profile | `email_draft_requested` field across order flow; `BASE_CENTS` + draft surcharge in `create-order` |
| **Free incentive** | 1 free credit granted on signup (on email confirmation, or immediately for OAuth) | `supabase/migrations/004_audit_fixes.sql` `grant_signup_credit_on_confirm`; `001_initial_schema.sql` default credit |

### Monetization model
Two parallel payment rails converge on a single order-creation endpoint (`app/api/orders/create/route.ts`):

1. **PayPal (cash)** — server computes the price authoritatively, creates a PayPal order, records a server-side *intent*, captures payment, and only then writes the order. Price tampering and order-ID hijacking are blocked by re-validating the stored intent.
2. **Credits (prepaid)** — atomic RPC `deduct_credit` decrements the balance under a row lock; orders cost `quantity` credits (1 credit ≈ 1 profile lookup).

Credits are sold/granted via admin endpoints (`/api/admin/credits`, `/api/credits/admin-assign`) and seeded with 1 free credit at signup.

---

## 2. Tech Stack & Framework Versions

Sourced from `package.json`.

| Layer | Technology | Version |
|---|---|---|
| Framework | Next.js (App Router) | `16.2.4` |
| UI runtime | React / React-DOM | `^18` |
| Language | TypeScript | `^5` |
| Styling | Tailwind CSS | `^3.4.1` |
| CSS pipeline | PostCSS / Autoprefixer | `^8` / `^10.4.20` |
| Animation | framer-motion | `^11.18.2` |
| UI primitives | Radix (`@radix-ui/react-{checkbox,label,select,slot,switch}`) | `^2.x` |
| Component utils | class-variance-authority `^0.7.1`, clsx `^2.1.1`, tailwind-merge `^2.5.4` | — |
| Icons | lucide-react | `^0.468.0` |
| Charts | recharts | `^2.15.4` |
| Carousel | embla-carousel-react / -auto-scroll | `^8.6.0` |
| Theme | next-themes | `^0.4.6` |
| Auth + DB | `@supabase/ssr` `^0.5.1`, `@supabase/supabase-js` `^2.45.4` | — |
| Payments | `@paypal/react-paypal-js` | `^9.1.1` |
| Email | resend `^6.12.0`, `@react-email/components` `^1.0.12` | — |
| AI | groq-sdk `^1.1.2` (**active**), `@anthropic-ai/sdk` `^0.89.0` (**installed, unused**) | — |
| Telemetry | `@vercel/speed-insights` `^2.0.0` | — |
| Toasts | react-hot-toast `^2.6.0` | — |
| SEO | next-sitemap `^4.2.3` | — |
| Animation (footer) | gsap `^3.15.0` (**active** — `components/ui/motion-footer.tsx` ScrollTrigger) | — |
| Dataviz (map) | dotted-map `^3.1.0` (**active** — `components/sections/StatsSection.tsx` world map) | — |

> **Note:** Some libs cited in the original project memo (e.g. `lib/paypal.ts`, `lib/constants.ts`, `lib/credits.ts`, `lib/seo.ts`, `lib/validations.ts`, `lib/analytics.ts`) do **not** exist as standalone files. Pricing constants and PayPal token logic live **inline** inside route handlers and `lib/admin-db.ts`. The real `lib/` surface is: `admin-db.ts`, `email.ts`, `env.ts`, `rate-limit.ts`, `site-url.ts`, `utils.ts`, and `lib/supabase/{client,server,middleware}.ts`.

---

## 3. Folder Structure (Annotated Tree)

```text
d:/SConnectAI/
├── proxy.ts                      # Next 16 middleware (NAMED proxy.ts, not middleware.ts)
├── next.config.ts                # CSP, security headers, image domains, modularizeImports
├── vercel.json                   # Daily cron -> /api/health (Supabase keep-alive)
├── tailwind.config.ts            # Dark-first theme, brand #0038FF, Montserrat
├── tsconfig.json                 # strict, paths {@/*: ./}, bundler resolution
├── postcss.config.mjs            # tailwindcss -> autoprefixer
│
├── app/
│   ├── layout.tsx                # Root layout: fonts, ThemeProvider, MotionProvider, Toaster, SpeedInsights, metadata
│   ├── globals.css               # Design-system tokens + utility classes (dark/light)
│   ├── page.tsx                  # (root) marketing landing — composes section components
│   ├── sitemap.ts / robots.ts                  # SEO endpoints (NOTE: no manifest.ts exists)
│   ├── opengraph-image.tsx / twitter-image.tsx # Dynamic OG/Twitter cards (1200×630)
│   ├── icon.svg                                # Favicon (no PWA manifest)
│   │
│   ├── (auth)/                   # Route group: login, signup, forgot-password (+ layout)
│   │   ├── login/{page.tsx, LoginClient.tsx}
│   │   ├── signup/{page.tsx, SignupClient.tsx}
│   │   └── forgot-password/page.tsx
│   │
│   ├── dashboard/                # Authenticated user area
│   │   ├── layout.tsx            # Requires x-user-id header; fetches credits + role
│   │   ├── page.tsx              # Dashboard home (server component)
│   │   ├── submit/page.tsx       # Order wizard host
│   │   ├── orders/page.tsx       # Order history
│   │   └── account/page.tsx      # Profile + credits + password change
│   │
│   ├── admin/
│   │   ├── layout.tsx            # role === 'admin' gate
│   │   └── page.tsx              # Admin dashboard host
│   │
│   ├── auth/
│   │   ├── callback/route.ts     # PKCE/OAuth/email-confirm code exchange
│   │   └── logout/route.ts       # Server-side signOut
│   │
│   └── api/                      # Route handlers (see §11)
│       ├── orders/{create,list}/route.ts
│       ├── credits/{use,admin-assign}/route.ts
│       ├── admin/{credits,export,orders}/route.ts
│       ├── paypal/{create-order,capture-order,verify,webhook}/route.ts
│       ├── contact/route.ts
│       ├── chatbot/route.ts
│       └── health/route.ts
│
├── components/
│   ├── sections/                 # Hero, Features, Pricing, FAQ, CTA, Footer, Navbar, ...
│   ├── dashboard/                # DashboardAnimated, SubmitOrder/SubmitWizard, Orders/, AccountView
│   ├── admin/AdminDashboard.tsx
│   ├── ui/                       # shadcn primitives + sign-in.tsx / sign-up.tsx
│   ├── chatbot/                  # chat widget
│   └── providers/                # MotionProvider, ThemeProvider, AnalyticsProvider
│
├── lib/
│   ├── supabase/{client,server,middleware}.ts   # Anon client / admin (service-role) client / session refresh
│   ├── admin-db.ts               # Service-role data layer: credits, intents, alerts, PayPal token
│   ├── email.ts                  # Resend send + React Email templates
│   ├── env.ts                    # Startup env validation (Supabase keys + APP_URL)
│   ├── rate-limit.ts             # In-memory token-bucket limiter
│   ├── site-url.ts               # authRedirectBase() host-scoped redirect base
│   └── utils.ts                  # cn() (clsx + tailwind-merge)
│
├── types/database.ts             # Typed DB schema
└── supabase/migrations/          # 001 schema, 002 RLS, 003 profile fields, 004 audit fixes
```

---

## 4. Architecture Diagram

```text
                              ┌──────────────────────────────────────────────┐
                              │                   BROWSER                     │
                              │  Marketing pages · Auth forms · Dashboard     │
                              │  SubmitWizard · PayPal JS SDK · Chat widget   │
                              └───────────────┬──────────────────────────────┘
                                              │ HTTPS (cookies: Supabase session, PKCE verifier)
                                              ▼
        ┌──────────────────────────────────────────────────────────────────────────┐
        │  proxy.ts  ->  lib/supabase/middleware.ts :: updateSession()               │
        │   • supabase.auth.getUser()  (validate + silently refresh tokens)          │
        │   • inject request headers  x-user-id / x-user-email                       │
        │   • guard /dashboard /admin /order  ->  redirect /login?next=...           │
        │   • bounce logged-in users off /login /signup -> /dashboard                │
        └───────────────┬───────────────────────────────────┬──────────────────────┘
                        │ (page render)                      │ (fetch /api/*)
                        ▼                                    ▼
        ┌──────────────────────────┐      ┌──────────────────────────────────────────┐
        │  Server Components        │      │  Route Handlers (app/api/**/route.ts)     │
        │  dashboard/*, admin/*     │      │  read x-user-id, rate-limit, validate     │
        │  createAdminClient()      │      │  business logic                           │
        └──────────┬───────────────┘      └──────┬───────────┬───────────┬───────────┘
                   │                              │           │           │
                   ▼                              ▼           ▼           ▼
        ┌────────────────────┐   ┌───────────────────┐ ┌──────────┐ ┌──────────────┐
        │  SUPABASE Postgres  │  │      PAYPAL        │ │  RESEND  │ │  GROQ (LLM)  │
        │  • Anon client (RLS)│  │ create/capture/    │ │  order + │ │ llama-3.1-8b │
        │  • Service role     │  │ verify/webhook     │ │  team    │ │ chatbot SSE  │
        │    (bypasses RLS)   │  │ api-m.paypal.com   │ │  emails  │ │              │
        │  RPC: deduct_credit │  └───────────────────┘ └──────────┘ └──────────────┘
        │       add_credits   │
        └─────────┬───────────┘
                  ▲
                  │ daily cron 0 6 * * * (vercel.json)
        ┌─────────┴───────────┐
        │  /api/health         │  HEAD count on profiles -> keeps free-tier DB awake
        └──────────────────────┘
```

---

## 5. Routing System & Route Groups

Next.js App Router with **route groups** (parenthesized folders share a layout without affecting the URL).

| Route group / segment | URL(s) | Purpose | Key file(s) |
|---|---|---|---|
| (root) | `/` | Marketing landing | `app/page.tsx`, `app/layout.tsx` |
| `(auth)` | `/login`, `/signup`, `/forgot-password` | Auth screens | `app/(auth)/login/{page,LoginClient}.tsx`, `app/(auth)/signup/{page,SignupClient}.tsx`, `app/(auth)/forgot-password/page.tsx` |
| `dashboard` | `/dashboard`, `/dashboard/submit`, `/dashboard/orders`, `/dashboard/account` | Authenticated user area | `app/dashboard/layout.tsx`, `app/dashboard/page.tsx`, `…/submit/page.tsx`, `…/orders/page.tsx`, `…/account/page.tsx` |
| `admin` | `/admin`, `/dashboard/admin` | Admin console (mounted at two paths; both render `components/admin/AdminDashboard.tsx`) | `app/admin/layout.tsx`, `app/admin/page.tsx`, `app/dashboard/admin/page.tsx` |
| `auth` (non-group) | `/auth/callback`, `/auth/logout` | OAuth/PKCE exchange, logout | `app/auth/callback/route.ts`, `app/auth/logout/route.ts` |
| `api` | `/api/**` | Route handlers (§11) | `app/api/**/route.ts` |
| SEO | `/sitemap.xml`, `/robots.txt` | Generated | `app/sitemap.ts`, `app/robots.ts` (no `manifest.ts` / PWA manifest in repo) |

**Middleware matcher** (`proxy.ts:8-11`) — runs on all routes **except** Next internals and static image assets. Note: it does **not** exclude `/api/*`, so every API call also passes through session refresh (latency cost, see §16).

**Rendering strategy:** dashboard/admin pages are **server components** that read the middleware-injected `x-user-id` header (`app/dashboard/page.tsx`, `app/dashboard/account/page.tsx`) and fetch via `createAdminClient()`; interactivity is delegated to `"use client"` child shells. Marketing landing composes section components with framer-motion (`app/page.tsx`).

---

## 6. Authentication Flow (ASCII Sequence)

Supabase Auth via `@supabase/ssr`. Sessions live in HTTP-only cookies; the middleware refreshes them on every request and forwards a verified user identity downstream.

```text
 Browser            proxy.ts / middleware.ts           Supabase Auth         Route/Page
   │                        │                               │                    │
   │ any request (cookies)  │                               │                    │
   │───────────────────────>│ updateSession(request)        │                    │
   │                        │ createServerClient(ANON_KEY)  │                    │
   │                        │ auth.getUser() ──────────────>│                    │
   │                        │   validate JWT exp            │                    │
   │                        │   refresh if near expiry  <───│ new tokens         │
   │                        │ setAll() -> Set-Cookie        │                    │
   │                        │ if user: add request headers  │                    │
   │                        │   x-user-id, x-user-email     │                    │
   │                        │ if protected & no user:       │                    │
   │                        │   302 /login?next=<path>      │                    │
   │                        │ if /login|/signup & user:     │                    │
   │                        │   302 /dashboard              │                    │
   │                        │──────────── forward ─────────────────────────────>│
   │                        │                               │   reads x-user-id  │
   │<─────────────────────── NextResponse (cookies + body) ─────────────────────│
```

Cited: `proxy.ts:4-6` calls `updateSession`; `lib/supabase/middleware.ts` performs `getUser()`, `setAll()` cookie persistence, `x-user-id`/`x-user-email` header injection, protected-path redirects, and auth-route bounce.

---

## 7. Signup Flow (Step-by-Step)

Two paths share the trigger-based profile creation in `supabase/migrations/`.

### Email / password
1. User fills the form in `app/(auth)/signup/SignupClient.tsx` (collects `full_name`, `email`, `phone`, `linkedin_id`, `password`); client-side checks (name length, password ≥ 8).
2. `SignupClient.tsx` calls `createClient().auth.signUp({ email, password, options: { data: {full_name, phone, linkedin_id}, emailRedirectTo: authRedirectBase() + '/auth/callback' } })`.
3. Supabase inserts into `auth.users` with `email_confirmed_at = NULL`.
4. Trigger `on_auth_user_created` → `handle_new_user()` (`migrations/001`, evolved in `003`/`004`) inserts a `profiles` row. For unconfirmed email/password users, credits start at **0** and `signup_credit_granted = FALSE`.
5. A `SuccessScreen` ("check your email") renders; Supabase sends the confirmation email.
6. User clicks the link → `/auth/callback?code=…` (`app/auth/callback/route.ts`) → `exchangeCodeForSession(code)` → `email_confirmed_at` set.
7. Trigger `on_email_confirmed` → `grant_signup_credit_on_confirm()` (`migrations/004`) grants **+1 credit**, sets `signup_credit_granted = TRUE`, and appends a `credit_logs` row (idempotent via the flag).
8. Redirect to `/dashboard`.

### Google OAuth (PKCE)
1. `SignupClient.tsx` (or `LoginClient.tsx`) calls `signInWithOAuth({ provider: 'google', options: { redirectTo: authRedirectBase() + '/auth/callback' } })`.
2. `@supabase/ssr` stores the PKCE `code_verifier` in a host-scoped HTTP-only cookie.
3. Google returns to `/auth/callback?code=…` → `exchangeCodeForSession(code)`.
4. OAuth users are **pre-confirmed** (`email_confirmed_at` already set), so `handle_new_user()` grants the **1 free credit immediately**.

---

## 8. Login Flow (Email + Google OAuth / PKCE)

Cited: `app/(auth)/login/LoginClient.tsx`, `lib/site-url.ts`, `app/auth/callback/route.ts`.

### Email / password
1. `LoginClient.tsx::handleSignIn()` calls `createClient().auth.signInWithPassword({ email, password })`.
2. On success, tokens are stored in cookies; `router.push(next ?? '/dashboard')` then `router.refresh()`. No email confirmation required to log in.
3. On error, an inline error banner is set via local `useState`.

### Google OAuth (PKCE)
1. `LoginClient.tsx::handleGoogleSignIn()` calls `signInWithOAuth({ provider: 'google', options: { redirectTo: authRedirectBase() + '/auth/callback' } })`.
2. `authRedirectBase()` (`lib/site-url.ts`) returns `window.location.origin` in the browser to **preserve the host** (www vs apex), falling back to `NEXT_PUBLIC_APP_URL` during SSR. This prevents the PKCE "code verifier missing" failure across hosts.
3. Callback `/auth/callback/route.ts` exchanges the code for a session and redirects to `/dashboard` (or `?next`).

```text
 EMAIL                                  GOOGLE / PKCE
 ─────                                  ─────────────
 signInWithPassword({email,pwd})        signInWithOAuth({provider:'google',
   │                                       redirectTo: origin + '/auth/callback'})
   ▼                                         │  (code_verifier -> host cookie)
 tokens -> cookies                           ▼
   │                                     Google consent
 router.push(next ?? '/dashboard')           │
 router.refresh()                            ▼
                                         /auth/callback?code -> exchangeCodeForSession
                                             │
                                             ▼  -> /dashboard
```

---

## 9. User Roles & Authorization Model

| Role | Source | Capabilities |
|---|---|---|
| `user` (default) | `profiles.role` default `user` (`migrations/001`) | Read/update **own** profile (cannot mutate `role`/`credits`); create + read own orders; read own `credit_logs`; spend credits / pay |
| `admin` | `profiles.role = 'admin'` (set manually / via DB) | Read all profiles/orders/credit_logs; grant credits; change order status; export CSV; view `paypal_intents` & `pending_alerts` |

**Three enforcement layers:**
1. **Middleware** (`lib/supabase/middleware.ts`) — gates `/dashboard`, `/admin`, `/order` by *authentication* only (any logged-in user passes).
2. **Admin layout** (`app/admin/layout.tsx`) — server-side `role === 'admin'` check; non-admins are redirected to `/dashboard`.
3. **API handlers** — admin routes (`app/api/admin/*`, `app/api/credits/admin-assign`) re-verify the caller's role via the service-role client before acting.
4. **Database RLS** (`migrations/002`) — the ultimate authority: per-row policies on every table (see §12).

> There is **no `ADMIN_EMAIL`-based gate in code**; the role lives entirely in `profiles.role`.

---

## 10. User Journey Flow

```text
 VISITOR ──> landing (/) ──> /signup ──> [email confirm | Google] ──> 1 free credit
                                                                          │
                                                                          ▼
                                                                     /dashboard
                                                                          │
                                                  ┌───────────────────────┴───────────────────┐
                                                  ▼                                            ▼
                                          /dashboard/submit                            /dashboard/orders
                                          (SubmitWizard)                               (history, status)
                                                  │
            Step 0 contact type (email/phone/both)│
            Step 1 paste LinkedIn URLs            │
            Step 2 optional AI email draft addon  │
            Step 3 summary + total                │
                                                  │
                       ┌──────────────────────────┴───────────────────────────┐
                       ▼ (credits >= qty)                                      ▼ (cash)
               "Use Credits"                                          PayPal create-order
               POST /api/orders/create                                   │ user approves
                use_credits=true                                         ▼
                deduct_credit RPC                                  capture-order (verify $)
                       │                                                 │
                       └───────────────────┬─────────────────────────────┘
                                           ▼
                            POST /api/orders/create (status=pending)
                                           │
                          ┌────────────────┴───────────────────┐
                          ▼                                     ▼
                 Resend: order confirmation          Resend: team notification
                 (to customer)                       (URLs + checklist to team)
                                           │
                                           ▼
                          Admin fulfils order -> status processing -> delivered
                          (admin dashboard / export CSV; delivery is operational)
```

Cited: `components/dashboard/SubmitOrder/SubmitWizard.tsx` (4-step wizard, credits vs PayPal branch), `app/api/orders/create/route.ts`, `lib/email.ts`, `app/admin/page.tsx` / `components/admin/AdminDashboard.tsx`.

---

## 11. API Architecture & Per-Route Table

All handlers read identity from the middleware-injected `x-user-id` header. Mutations use the **service-role** client (`lib/admin-db.ts` / `lib/supabase/server.ts createAdminClient()`), which bypasses RLS and enforces checks internally.

| Route | Method | Auth | Rate limit | Responsibility |
|---|---|---|---|---|
| `/api/orders/create` | POST | user | `order-create:{uid}` | Validate URLs + payment method; PayPal path re-validates intent & PayPal `COMPLETED` status; credits path runs `deduct_credit`; insert `orders`; send emails; idempotent by `paypal_order_id` |
| `/api/orders/list` | GET | user | — | List caller's own orders |
| `/api/credits/use` | POST | user | — | Deduct 1 credit via `deduct_credit` RPC; returns remaining |
| `/api/credits/admin-assign` | POST | **admin** | — | Find target by email; `add_credits`; log `admin_grant` |
| `/api/admin/credits` | POST | **admin** | — | Duplicate of admin-assign (grant credits) |
| `/api/admin/orders` | GET / PATCH | **admin** | — | Paginated orders + user join; PATCH validates status enum |
| `/api/admin/export` | GET | **admin** | — | CSV export of all orders |
| `/api/paypal/create-order` | POST | user | `paypal-create:{uid}` | Server-side price calc (`BASE_CENTS`); create PayPal order; `recordPayPalIntent` |
| `/api/paypal/capture-order` | POST | user | `paypal-capture:{uid}` | Verify intent ownership; capture; validate captured ≈ expected (±2¢) |
| `/api/paypal/verify` | POST | user | `paypal-verify:{uid}` | Re-check PayPal order status for a stored intent |
| `/api/paypal/webhook` | POST | **none** (signature) | — | Verify PayPal signature; handle REFUNDED/REVERSED/DISPUTE → update order + `pending_alerts` |
| `/api/contact` | POST | none | — | Validate name/email/message; Resend send with reply-to |
| `/api/chatbot` | POST | none | — | Groq `llama-3.1-8b-instant`, streamed SSE, scoped system prompt |
| `/api/health` | GET | none | — | HEAD count on `profiles` (Supabase keep-alive); 200/503 |

**Rate limiting** (`lib/rate-limit.ts`) is an **in-memory token bucket** (per-process; not distributed). Keys are per-user per-endpoint with capacity + refill rate, returning HTTP 429 on burst exhaustion.

---

## 12. Database Architecture (Tables, RLS, Triggers)

Supabase Postgres, defined across `supabase/migrations/001_initial_schema.sql` → `004_audit_fixes.sql`, typed in `types/database.ts`. **All 5 app tables have RLS enabled.**

### Tables

| Table | Key columns | Notes |
|---|---|---|
| `profiles` | `id` (FK→auth.users), `email` UNIQUE, `full_name`, `phone`, `linkedin_id`, `credits` (INT, CHECK ≥ 0), `role` (`user`/`admin`), `signup_credit_granted` (bool), timestamps | Auto-created by trigger on signup |
| `orders` | `id`, `user_id` (FK), `input_type`, `linkedin_urls[]`, `contact_type` (`email`/`phone`/`both`), `quantity` (CHECK > 0), `amount_paid`, `paypal_order_id` (UNIQUE, nullable), `email_draft_requested`, `status` (`pending`/`processing`/`completed`/`failed`/`refunded`), `created_at`, `delivered_at` | Indexed on user_id/status/paypal_order_id |
| `credit_logs` | `id`, `user_id` (FK), `amount` (signed), `type` (`purchase`/`usage`/`refund`/`admin_grant`), `note`, `admin_id` (nullable), `created_at` | **Append-only**: direct INSERT blocked by RLS; written only by RPC |
| `paypal_intents` | `paypal_order_id` (PK), `user_id`, `contact_type`, `quantity`, `email_draft`, `expected_cents` (CHECK > 0), `consumed`, `created_at` | Admin-only RLS; anti-hijack / anti-tamper map |
| `pending_alerts` | `id`, `order_id` (nullable), `user_id` (nullable), `reason`, `details` (JSONB), `resolved`, `created_at` | Admin-only RLS; surfaces orphan payments, refunds, disputes |

### RLS policy summary (`migrations/002`)

| Table | User policy | Admin policy |
|---|---|---|
| `profiles` | SELECT/UPDATE own; `WITH CHECK` blocks self-mutation of `role`/`credits`; DELETE blocked | SELECT/UPDATE/DELETE all |
| `orders` | SELECT/INSERT own; UPDATE non-status fields only; DELETE blocked | SELECT/UPDATE/DELETE all |
| `credit_logs` | SELECT own; INSERT/UPDATE/DELETE **blocked** (append-only via RPC) | SELECT all |
| `paypal_intents` | **no access** | SELECT |
| `pending_alerts` | **no access** | SELECT + UPDATE |

### Triggers & RPC functions

| Object | Type | Behavior |
|---|---|---|
| `handle_new_user()` | AFTER INSERT on `auth.users`, SECURITY DEFINER | Creates `profiles` row; 1 credit if pre-confirmed (OAuth), else 0 (`001`→`003`→`004`) |
| `grant_signup_credit_on_confirm()` | AFTER UPDATE on `auth.users` (confirm), SECURITY DEFINER | +1 credit once via `signup_credit_granted` flag (`004`) |
| `deduct_credit(p_user_id, p_amount)` | RPC, SECURITY DEFINER | `SELECT … FOR UPDATE` row lock; return FALSE if insufficient; else decrement + log `usage`; raises if amount ≤ 0 |
| `add_credits(p_user_id, p_amount, p_type, p_note, p_admin_id)` | RPC, SECURITY DEFINER | Increment + log; positive-amount guard; no idempotency key |
| `profiles_updated_at` | BEFORE UPDATE | Auto-timestamp |

---

## 13. State Management Approach

There is **no global store** (no Redux/Zustand/Context for app data).

- **Server-fetched, prop-drilled:** Dashboard/admin pages are server components that fetch once (`createAdminClient()` + `x-user-id`) and pass plain data to `"use client"` shells (`DashboardAnimated`, `SubmitWizard`, `OrdersView`, `AccountView`, `AdminDashboard`).
- **Local component state:** `useState`/`useMemo`/`useCallback` handle wizard steps, filters, pagination, modal toggles, busy/error flags (`SubmitWizard.tsx`, `components/dashboard/Orders/OrdersView.tsx`, `components/admin/AdminDashboard.tsx`).
- **Re-sync via navigation:** after mutations, code calls `router.refresh()` or manual refetch (e.g. admin `fetchOrders`). Optimistic UI with rollback is used for admin status changes.
- **Cross-cutting providers** (`app/layout.tsx`): `ThemeProvider` (next-themes, storageKey `sc-theme`), `MotionProvider` (framer-motion LazyMotion `domAnimation`), `Toaster` (react-hot-toast), `SpeedInsights`. These provide UI services, not app data.

---

## 14. Third-Party Integrations

| Service | Use | Where | Secrets |
|---|---|---|---|
| **Supabase** | Auth (PKCE/OAuth) + Postgres; dual clients (anon RLS + service-role) | `lib/supabase/*`, `lib/admin-db.ts` | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` |
| **PayPal** | Live-mode payments: create/capture/verify + webhook; in-memory token cache | `app/api/paypal/*`, `lib/admin-db.ts`, client SDK in `SubmitWizard.tsx` | `PAYPAL_MODE`, `NEXT_PUBLIC_PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, `PAYPAL_WEBHOOK_ID` |
| **Resend** | Transactional email: order confirmation (customer) + team notification | `lib/email.ts` (React Email templates) | `RESEND_API_KEY`, `EMAIL_FROM`, `TEAM_EMAIL` |
| **Groq** | Chatbot LLM `llama-3.1-8b-instant`, streamed, scoped system prompt | `app/api/chatbot/route.ts` | `GROQ_API_KEY` |
| **Anthropic** | **Installed, not imported** anywhere in source; CSP allows `api.anthropic.com` (planned/unused) | `package.json` only | — |
| **Vercel Speed Insights** | Core Web Vitals | `app/layout.tsx` | auto |
| **Vercel Cron** | Daily `/api/health` keep-alive | `vercel.json` (`0 6 * * *`) | — |

CSP (`next.config.ts`) explicitly whitelists each integration's origin in `connect-src`/`script-src`/`frame-src`/`img-src`.

---

## 15. Dependencies Analysis (Used vs Unused vs Risky)

| Package | Status | Evidence |
|---|---|---|
| next, react, react-dom, typescript, tailwindcss | **Used** (core) | build + everywhere |
| @supabase/ssr, @supabase/supabase-js | **Used** | `lib/supabase/*` |
| @paypal/react-paypal-js | **Used** | `SubmitWizard.tsx` |
| resend, @react-email/components | **Used** | `lib/email.ts` |
| groq-sdk | **Used** | `app/api/chatbot/route.ts` |
| framer-motion, lucide-react, next-themes, react-hot-toast | **Used** | layout + components |
| recharts, embla-carousel*, @radix-ui/* | **Used** | charts, carousels, shadcn primitives |
| class-variance-authority, clsx, tailwind-merge | **Used** | `lib/utils.ts` + ui |
| @vercel/speed-insights | **Used** | `app/layout.tsx` |
| next-sitemap | **Likely build-only** | no direct source import found (sitemap via `app/sitemap.ts`) — verify it is actually invoked, else remove |
| gsap | **USED** | `components/ui/motion-footer.tsx:5-6` (active footer, ScrollTrigger) and the dead `components/motion-footer.tsx` |
| dotted-map | **USED** | `components/sections/StatsSection.tsx:4,16` (`new DottedMap(...)` world map) |
| **@anthropic-ai/sdk** | **UNUSED** | zero imports in source (Grep confirms) — the only genuinely dead dependency; chatbot uses `groq-sdk` |

**Recommendation:** remove `@anthropic-ai/sdk` only (dead). `gsap` and `dotted-map` are live — keep, but both add weight to the landing bundle (see `docs/04-performance-audit.md`). Earlier audit notes that flagged `gsap`/`dotted-map` as dead were **incorrect** and are superseded here.

---

## 16. Risk Areas

| # | Risk | Detail | Evidence |
|---|---|---|---|
| R1 | **Middleware runs on `/api/*`** | Matcher does not exclude API routes → every API call refreshes the Supabase session (extra latency + token churn) | `proxy.ts:8-11`, `lib/supabase/middleware.ts` |
| R2 | **In-memory rate limiting** | Buckets are per serverless instance; load-balancing lets a user multiply bursts; not distributed | `lib/rate-limit.ts` |
| R3 | **Fire-and-forget email** | Resend results not awaited/checked; if Resend is down the customer never gets a confirmation though the order succeeds; no retry/bounce tracking | `lib/email.ts`, `app/api/orders/create/route.ts` |
| R4 | **Webhook fails-open on slow verify** | If PayPal signature verification times out, handler may continue and always returns 200; an unsigned payload could slip through during PayPal latency | `app/api/paypal/webhook/route.ts` |
| R5 | **Float amount tolerance (±2¢)** | For low-value items (20¢ email), 2¢ is 10% variance; arithmetic mixes dollars/cents | `app/api/paypal/capture-order/route.ts`, `create-order` |
| R6 | **Partial env validation** | `lib/env.ts` validates only Supabase keys + APP_URL at startup; PayPal/Resend/Groq vars fail silently at runtime if missing | `lib/env.ts` |
| R7 | **Service-role blast radius** | `createAdminClient()` bypasses all RLS; any compromised route handler has full DB read/write | `lib/admin-db.ts`, `lib/supabase/server.ts` |
| R8 | **CSP `unsafe-inline` + `unsafe-eval`** | Required for Next hydration but weakens XSS defense; no nonce/strict-dynamic | `next.config.ts` |
| R9 | **`paypal_intents.consumed` not pruned/TTL'd** | Stale intents accumulate indefinitely; no cleanup job | `migrations/004`, `lib/admin-db.ts` |
| R10 | **No CSRF tokens on state-changing POSTs** | Relies on cookie auth + header forwarding; no origin/referer check on capture-order / orders-create | `app/api/orders/create/route.ts`, `app/api/paypal/capture-order/route.ts` |
| R11 | **Single keep-alive cron** | If `/api/health` fails at 6am UTC, DB may still auto-pause; no fallback/alerting | `vercel.json`, `app/api/health/route.ts` |

---

## 17. Technical Debt Areas

| # | Debt | Detail | Evidence |
|---|---|---|---|
| D1 | **Duplicated admin credit logic** | `/api/admin/credits` and `/api/credits/admin-assign` implement the same grant flow | both route files |
| D2 | **Inline pricing constants** | `BASE_CENTS` and draft surcharge are duplicated in the create-order handler and the client wizard rather than a single shared module | `app/api/paypal/create-order/route.ts`, `SubmitWizard.tsx` |
| D3 | **Dead dependencies** | `@anthropic-ai/sdk`, `gsap` shipped but unused (see §15) | `package.json` + Grep |
| D4 | **No validation library** | Email/password/URL validation is hand-rolled inline (no Zod/yup); password check is length-only | `SignupClient.tsx`, `SubmitWizard.tsx` |
| D5 | **No `pending_alerts` remediation UI** | Disputes/refunds/orphans are recorded but require manual DB/dashboard inspection to action | `pending_alerts` table + admin dashboard |
| D6 | **Optimistic-lock fallback for credits** | If `deduct_credit` RPC errors transiently, a non-atomic CAS fallback can diverge from the RPC's intent | `lib/admin-db.ts` deduct path |
| D7 | **No loading skeletons on server pages** | Orders/account render server-side with no Suspense boundary → brief blank flash | dashboard pages |
| D8 | **Memo drift vs. reality** | Project memo references non-existent files (`lib/paypal.ts`, `lib/constants.ts`, `lib/credits.ts`, `lib/seo.ts`, `lib/validations.ts`, `lib/analytics.ts`) and `app/globals1.css`; the real file is `app/globals.css`. Real extra libs not in memo: `lib/tokens.ts`, `lib/useTypewriter.ts` | `lib/` listing, `app/globals.css` |
| D9 | **`order_status` enum drift (`delivered` vs `completed`)** | DB enum has `completed`; admin PATCH + dashboard types use `delivered`. Setting `delivered` fails the Postgres enum; "delivered" UI counters never match real rows | `supabase/migrations/001_initial_schema.sql:14`, `app/api/admin/orders/route.ts:53`, `app/dashboard/page.tsx:16` |
| D10 | **`deduct_credit` signature churn** | Migration 001 defined `deduct_credit(uuid, uuid, text)` returning VOID; migration 004 drops it and redefines `deduct_credit(uuid, int)` returning BOOLEAN. If 004 was not applied, the runtime call in `lib/admin-db.ts:39` (`p_user_id`,`p_amount`) errors and silently falls back to the non-atomic optimistic lock | `migrations/001:208`, `migrations/004:13`, `lib/admin-db.ts:39` |
| D11 | **Marketing price ≠ checkout price** | `Pricing.tsx` advertises volume discounts (down to $0.10 email / $0.50 phone) and a "$1.08" combo bundle (10% off). The order flow charges **flat**: email $0.20, phone $1.00, both $1.20, with no quantity tiers and no combo discount. The advertised discounts are **not implemented anywhere** in the order path. See `docs/02` / `docs/07`. | `components/sections/Pricing.tsx:14-33`, `SubmitWizard.tsx:30`, `app/api/paypal/create-order/route.ts:14`, `app/api/orders/create/route.ts:20` |
| D12 | **React 18 pinned under Next 16** | `package.json` pins `react`/`react-dom` to `^18`, but Next.js `^16.2.4` targets React 19. Confirm the installed React major matches Next 16's peer requirement; a mismatch can surface as subtle hydration/runtime issues. | `package.json:32,35-36` |

---

## 18. Business Logic Explanation (Pricing, Credits, Order Lifecycle)

### Pricing (cash / PayPal)
Server computes the authoritative price in **cents** (`app/api/paypal/create-order/route.ts`):

```text
BASE_CENTS = { email: 20, phone: 100, both: 120 }     // per profile

expectedCents = quantity * BASE_CENTS[contact_type]
              + (email_draft_requested ? quantity * 100 : 0)   // AI draft addon = $1.00/profile
```

Example: 5 profiles, "both" + AI draft = `5*120 + 5*100 = 1100` cents = **$11.00**. The summary UI in `SubmitWizard.tsx` mirrors this calculation for display, but the server value is canonical — the client cannot tamper with the charge.

### Credits
- **1 credit ≈ 1 profile lookup**; an order costs `quantity` credits.
- **Grant:** signup (+1, once), or admin `add_credits` RPC (logged as `admin_grant` / `purchase`).
- **Spend:** `deduct_credit` RPC under `SELECT … FOR UPDATE`; returns FALSE on insufficient balance (order is then rejected/rolled back). `credit_logs` is the append-only ledger; the running balance lives in `profiles.credits` (CHECK ≥ 0).

### Order lifecycle

```text
                         ┌─────────── PayPal path ───────────┐
 create-order ─> recordPayPalIntent ─> (user approves) ─> capture-order
   (price calc)     (paypal_intents)                    (verify ≈ expected, ±2¢)
                                                              │
                         ┌─────────── Credits path ──────────┤
 deduct_credit (RPC, row-locked)                              │
                                                              ▼
                                  POST /api/orders/create  (status = PENDING)
                                  • re-validate intent OR confirm credit deduction
                                  • idempotent on paypal_order_id (UNIQUE)
                                  • on PayPal-captured-but-insert-fail -> pending_alert + orphan email
                                              │
                          ┌───────────────────┴───────────────────┐
                          ▼                                        ▼
              Resend order confirmation (user)        Resend team notification (URLs + checklist)
                          │
                          ▼
        Admin updates status:  PENDING -> PROCESSING -> COMPLETED (delivered_at set)
                          │
        Webhook side-channel:  REFUNDED / REVERSED -> status=refunded + pending_alert
                               CUSTOMER.DISPUTE.CREATED -> pending_alert
```

**Status enum (with a real inconsistency):** The DB enum (`migrations/001:14`) defines `order_status = pending | processing | completed | failed | refunded`. However, the admin PATCH validator (`app/api/admin/orders/route.ts:53`) accepts `["pending","processing","delivered","failed","refunded"]` — it allows `delivered` (not in the DB enum) and omits `completed` (in the DB enum). The dashboard/orders TypeScript types also use `delivered` (`app/dashboard/page.tsx:16`, `app/dashboard/orders/page.tsx:18`). **Net effect:** an admin setting status to `delivered` would be rejected by Postgres (invalid enum value), and the dashboard's "delivered" counters never match a real DB row. This is a genuine schema/code drift bug (added to Tech Debt). Fulfilment itself (actually sourcing the contact data) is an **operational/manual** step driven off the team notification email and admin dashboard; the codebase manages the commercial/state machine, not an automated scraping pipeline.

**Idempotency & integrity guarantees:**
- `orders.paypal_order_id` UNIQUE → duplicate capture/retry returns the existing order (same user) or 409 (different user).
- `paypal_intents` ownership + amount re-validation → blocks order-ID hijacking and price tampering.
- `deduct_credit` row lock → prevents credit overdraft/double-spend.
- `signup_credit_granted` flag → prevents double-granting the free credit.

---

*End of document. All assertions above are grounded in the cited files within `d:/SConnectAI`.*
