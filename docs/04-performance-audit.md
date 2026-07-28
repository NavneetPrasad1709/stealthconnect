# StealthConnect AI — Performance Audit (Phase 4)

> **Document type:** Front-end + back-end performance review.
> **Method:** Static analysis of bundle composition, rendering strategy, data-fetching, DB indexing, and edge/middleware cost from source. Runtime numbers (Lighthouse, bundle bytes) should be confirmed with `next build` + a Lighthouse run; this audit identifies *where* to look and *what* to fix.
> **Note from Phase 1:** A prior commit (`50a3a55 perf(seo): … lift Lighthouse to 90+`) indicates Lighthouse work was already done — several optimisations below are already present and credited.
> **Severity:** `High` (material LCP/TTI or cost impact) · `Medium` · `Low`.

---

## 0. What's already done well (verified)

The codebase shows real performance intent — do **not** undo these:

- **Route-level code splitting** — below-the-fold landing sections are `next/dynamic` with lightweight placeholder loaders (`app/page.tsx:11-17`): Features, StatsSection, Pricing, Testimonials, FAQ, FinalCTA, and the gsap footer are all split out of the initial chunk.
- **Viewport-gated rendering** — `LazyOnView` (IntersectionObserver) defers mounting of heavy sections until scrolled into view (`app/page.tsx:127-132`).
- **Idle-loaded chrome** — `FloatingConsultButtonLazy` and `ChatWidgetLazy` defer via `requestIdleCallback`/timeout (`app/layout.tsx:88-89`), keeping the chat/consult JS out of the critical path.
- **Import optimisation** — `modularizeImports` for `lucide-react` (per-icon imports, `preventFullImport`) and `experimental.optimizePackageImports` for framer-motion, radix, recharts, embla (`next.config.ts:66-85`).
- **Image pipeline** — AVIF/WebP, `minimumCacheTTL: 31536000`, explicit `remotePatterns` (`next.config.ts:56-65`).
- **Build flags** — `compress: true`, `productionBrowserSourceMaps: false`, `reactStrictMode: true`.
- **Fonts** — Montserrat via `next/font/google`, self-hosted, `display: swap`, scoped weights (`app/layout.tsx:11-16`).
- **PayPal token caching** — in-memory token reused ~9h within a warm instance (`lib/admin-db.ts:151-186`), avoiding an OAuth round-trip per payment call.

---

## HIGH PRIORITY

### PERF-H1 — Middleware (`proxy.ts`) runs on every route including `/api/*`, adding a Supabase `getUser()` round-trip per request
- **Where:** `proxy.ts:8-11` matcher excludes only static assets/images; `lib/supabase/middleware.ts:38-40` calls `supabase.auth.getUser()` on every matched request.
- **Detail:** `getUser()` validates (and may refresh) the session against Supabase Auth — a network call to the Supabase project on **every** page navigation *and* every `/api/*` call. API routes then *also* read identity from the injected header and frequently make their own Supabase calls, so an API request can incur the middleware auth round-trip **plus** the route's own queries.
- **Impact:** Added latency on every request (tens to low-hundreds of ms depending on region vs Supabase region), and extra load/cost on Supabase Auth. Most acute for chatty client flows (admin dashboard polling, wizard).
- **Fix:** Exclude `/api/*` from the middleware matcher where the route already authenticates from the header, **or** ensure API routes that don't need session refresh are matched out. Keep middleware on page routes. Co-locate the app and Supabase in the same region to minimise round-trip time.

### PERF-H2 — `recharts` shipped to render a single decorative area chart
- **Where:** `components/sections/StatsSection.tsx` (Recharts `AreaChart` with illustrative data), pulled in via the lazy `StatsSection` chunk.
- **Detail:** Recharts is a large dependency (~100 KB+ gzipped incl. d3 deps). It's used only for one cosmetic "growth" chart with hardcoded numbers. It *is* code-split (good), but any user scrolling to Stats downloads it.
- **Impact:** Heavy chunk for non-functional eye-candy; hurts TTI for engaged scrollers and mobile data budgets.
- **Fix:** Replace the decorative chart with a lightweight inline SVG/CSS sparkline (the data is static), or drop the chart. Removes recharts from the build entirely if it's the only usage.

### PERF-H3 — Landing is animation-heavy and largely client-rendered
- **Where:** `Hero.tsx`, `Navbar.tsx`, all `sections/*` are `"use client"` (framer-motion); gsap+ScrollTrigger in `ui/motion-footer.tsx`; looping animations in Hero/HowItWorks.
- **Detail:** The marketing route hydrates a lot of interactive JS (framer-motion + gsap + embla + dotted-map). framer-motion and gsap overlap in capability — two animation engines ship to the same site. Looping/scroll-scrubbed animations also keep the main thread busy.
- **Impact:** Larger JS payload and longer hydration/TBT on the most-visited page; battery/CPU on mobile.
- **Fix:** (a) Pick one animation engine where possible — gsap is used *only* for the footer; consider porting the footer to framer-motion (already loaded) and dropping gsap. (b) Convert purely-presentational sections to Server Components with CSS animations where interactivity isn't required. (c) Gate loops behind `prefers-reduced-motion` and `IntersectionObserver` so off-screen loops pause.

---

## MEDIUM PRIORITY

### PERF-M1 — Duplicate profile fetch on every dashboard load
- **Where:** `app/dashboard/layout.tsx:22-26` selects `credits, full_name, role`; `app/dashboard/page.tsx:28-32` independently selects `credits, full_name` for the same user on the same render.
- **Detail:** Two separate round-trips to Supabase for overlapping profile data per dashboard visit (layout + page render in the same request lifecycle but don't share the fetch).
- **Impact:** An extra DB round-trip per dashboard load; multiplies across navigations.
- **Fix:** Fetch the profile once (e.g. in the layout) and pass via context/props, or use React `cache()` to dedupe the query within a request.

### PERF-M2 — Admin CSV export and order queries are unbounded / filter on a joined column
- **Where:** `app/api/admin/export/route.ts:15-43` (selects all orders, builds full CSV in memory); `app/api/admin/orders/route.ts:34-37` (`ilike("profiles.email", …)` on the joined table).
- **Detail:** Export has no pagination/streaming → memory + timeout risk as the table grows (also a functional issue, `docs/02` F-ADMIN-02). The `ilike` email filter on a joined relation may not use an index efficiently in PostgREST.
- **Impact:** Export breaks at scale; admin search slows on large datasets.
- **Fix:** Stream/paginate the export; add a trigram index on `profiles.email` (or filter by `user_id`); add date-range bounds.

### PERF-M3 — Per-request Supabase client construction
- **Where:** `lib/admin-db.ts:adminDb()`, `lib/supabase/server.ts:createAdminClient()` — a new client is created per call/request.
- **Detail:** Cheap relative to network, but in hot paths multiple `adminDb()` calls within one request each construct a client. Minor.
- **Fix:** Construct once per request and pass it down; or memoise within a request.

### PERF-M4 — Remote images on auth/testimonials bypass `next/image` optimisation
- **Where:** Auth hero `w=2160` Unsplash (`LoginClient.tsx:83`, `SignupClient.tsx:155`) via the `SignInPage`/`SignUpPage` components; testimonial avatars from Unsplash/`randomuser.me`.
- **Detail:** These appear to be raw `<img>`/CSS backgrounds, not `next/image`, so they skip AVIF/WebP transcoding and responsive sizing despite the image pipeline being configured.
- **Impact:** Oversized images on auth pages (LCP) and testimonial rows.
- **Fix:** Route through `next/image` with proper `sizes`, or self-host smaller assets. (Also see `docs/03` UX-H2/UX-L2 re: removing fake avatars entirely.)

---

## LOW PRIORITY

### PERF-L1 — Dead components inflate the repo but not the bundle (clarification)
- **Where:** `components/motion-footer.tsx`, `hero.tsx`, `LandingNav.tsx`, etc.
- **Detail:** These are **not imported**, so tree-shaking keeps them out of the production bundle — bundle impact is ~nil. The cost is maintenance/clarity, not runtime. (Listed here to correct any assumption that deleting them shrinks the bundle materially.)
- **Fix:** Delete for hygiene (see `docs/02` F-MISC-01), but don't expect a perf win.

### PERF-L2 — Two animation libraries + dotted-map on the landing
- **Where:** `framer-motion`, `gsap`, `dotted-map`, `embla-carousel-*` all live on the marketing route.
- **Fix:** Consolidate animation engines (PERF-H3); confirm `dotted-map` generates its SVG at build/once (it constructs `new DottedMap(...)` at module scope in `StatsSection.tsx:16` — good, computed once) rather than per-render.

### PERF-L3 — No bundle analysis or perf budget in CI
- **Detail:** No `@next/bundle-analyzer` config or size budget found; regressions won't be caught.
- **Fix:** Add bundle analysis and a CI size budget; track route JS over time.

### PERF-L4 — Keep-alive cron is a single point at 06:00 UTC
- **Where:** `vercel.json` (`/api/health` daily), `app/api/health/route.ts`.
- **Detail:** Cleverly prevents Supabase free-tier auto-pause, but a single daily ping with no alerting means a missed run can still let the DB pause (this is reliability-adjacent; see `docs/05`/`docs/07`). On a paid Supabase tier this cron is unnecessary.
- **Fix:** Increase frequency or move off free-tier; add failure alerting.

---

## Database performance

| Aspect | Status | Evidence |
|---|---|---|
| Indexes on `orders` | ✅ `user_id`, `status`, `paypal_order_id` | `migrations/001:87-89` |
| Indexes on `credit_logs` | ✅ `user_id`, `type` | `001:105-106` |
| Indexes on `paypal_intents` | ✅ `user_id`, `created_at` | `004:159-160` |
| Indexes on `pending_alerts` | ✅ partial `(resolved, created_at desc)` | `004:182-183` |
| `profiles.email` | ✅ UNIQUE (implicit index) | `001:25` |
| Atomic credit RPC | ✅ `SELECT … FOR UPDATE` | `004:13-41` |
| Admin email search | ⚠️ `ilike` on joined `profiles.email` may not use index | `admin/orders:36` |
| Export query | ⚠️ unbounded full-table scan + in-memory CSV | `export:15-43` |

Schema indexing is solid for the user-facing read paths; the only concerns are admin-side (export, email search) at scale.

---

## Rendering / hydration summary

- **Dashboard/admin/account/orders pages:** Server Components that fetch via the service-role client and pass data to `"use client"` shells — good separation, minimal client data-fetching. Cookie/header reads make them dynamic (uncacheable), which is correct for authed pages.
- **Marketing page:** mostly client components due to framer-motion; the main hydration cost of the app. Mitigated by code-splitting + LazyOnView, but the initial Hero/Navbar still ship framer-motion.
- **Caching:** No ISR/`unstable_cache`/Cache Components usage; legal/marketing pages are static-eligible but the landing's client components limit static optimisation gains. The health route correctly opts out of caching.

---

## Findings summary

| ID | Severity | Area | One-line |
|---|---|---|---|
| PERF-H1 | High | Middleware | `getUser()` on every route incl. `/api/*` |
| PERF-H2 | High | Bundle | recharts for one decorative chart |
| PERF-H3 | High | Bundle/hydration | two animation engines, client-heavy landing |
| PERF-M1 | Medium | Data | duplicate profile fetch per dashboard load |
| PERF-M2 | Medium | DB/API | unbounded export + joined-column filter |
| PERF-M3 | Medium | Server | per-request client construction |
| PERF-M4 | Medium | Images | auth/testimonial images bypass `next/image` |
| PERF-L1 | Low | Bundle | dead code not in bundle (no win) |
| PERF-L2 | Low | Bundle | consolidate animation libs |
| PERF-L3 | Low | Process | no bundle analyzer / perf budget |
| PERF-L4 | Low | Reliability | single keep-alive cron |

**Top three wins:** (1) exclude `/api/*` from middleware auth (PERF-H1), (2) drop recharts via an SVG sparkline (PERF-H2), (3) consolidate to one animation engine + more server components on the landing (PERF-H3). Then validate with `next build` + Lighthouse mobile.

*End of Phase 4.*
