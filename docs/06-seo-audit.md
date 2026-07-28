# StealthConnect AI — SEO Audit (Phase 6)

> **Document type:** Technical + on-page SEO review.
> **Method:** Source-verified (`path:line`). There is also a prior `StealthConnect-AI_Technical-SEO-Audit.pdf` in the repo root and a commit `50a3a55 perf(seo): resolve audit findings + lift Lighthouse to 90+` — this audit reflects the **current** code state and notes where prior work already landed.
> **Severity:** `High` · `Medium` · `Low` · `Info` (positive/no action).

---

## 0. Summary

SEO fundamentals are **in good shape** — far better than typical for an early SaaS. Metadata, canonicals, OG/Twitter cards, JSON-LD structured data, a typed sitemap, and a correct robots policy are all present and largely correct. The remaining items are refinements (sitemap accuracy, www/apex canonicalisation, structured-data/price consistency, Core Web Vitals on a JS-heavy landing) plus one cleanup (a redundant `next-sitemap` dependency).

---

## 1. Metadata & on-page (verified present)

| Element | Status | Evidence |
|---|---|---|
| `metadataBase` | ✅ `NEXT_PUBLIC_APP_URL ?? https://www.stealthconnect.ai` | `app/layout.tsx:26` |
| Title template | ✅ `%s \| StealthConnect AI`, sensible default | `app/layout.tsx:27-30` |
| Per-page titles/descriptions | ✅ home, contact, privacy, terms, gdpr, dashboard, auth all set | respective `page.tsx` / `metadata` |
| Canonicals | ✅ `/`, `/contact`, `/terms` etc. set `alternates.canonical` | `layout.tsx:67`, `page.tsx:23`, `terms:8` |
| `robots` directives | ✅ index/follow on public; `index:false` on dashboard/admin/auth | `dashboard/page.tsx:9`, `(auth)/layout.tsx:10`, `admin/*` |
| `googleBot` hints | ✅ `max-image-preview:large`, `max-snippet:-1` | `layout.tsx:39-44` |
| `lang` attribute | ✅ `<html lang="en">` | `layout.tsx:79` |
| Favicon/icons | ✅ `/icon.svg` (svg + apple) | `layout.tsx:60-66` |
| `themeColor` viewport | ✅ `#000000` | `layout.tsx:19-23` |
| Heading hierarchy | ✅ single `<h1>` in Hero; sections use `<h2>` | `Hero.tsx`, `sections/*` |

On-page SEO is solid. The description copy is keyword-relevant ("verified emails and direct phone numbers behind any LinkedIn profile in 30 minutes").

---

## 2. Structured data (JSON-LD)

- **Present and valid-shaped** in `app/page.tsx:61-121`: a `@graph` with `Organization` (logo, contactPoint), `SoftwareApplication` (category `BusinessApplication`, two `Offer`s), and `FAQPage` (8 Q&As mirrored from the on-page FAQ).
- **SEO-MED — structured-data price vs on-page price will diverge once pricing is "fixed":** The `Offer`s hardcode `0.20` (email) and `1.00` (phone) (`page.tsx:91,98`). These match the *base/flat* checkout price, but the on-page calculator advertises *discounted* volume/combo prices (see `docs/02` F-PAY-01). Google can flag a mismatch between marked-up price and visible price in Merchant/rich results. There is **no `both`/combo Offer** and no `priceSpecification` for volume tiers.
  - **Fix:** After resolving the pricing source-of-truth (FP-01), keep JSON-LD `Offer`s consistent with what's displayed; add the combo Offer; consider `priceSpecification`/`eligibleQuantity` for tiers if you keep them.
- **SEO-Info — correctly *no* `AggregateRating`/`Review` markup:** Given the testimonials are fabricated (`docs/02` F-PUB-02), it is *good* that no Review/Rating schema is emitted — marking up fake reviews would risk a Google manual action. Do **not** add rating markup until reviews are real and consented.
- **Opportunity:** Add `BreadcrumbList` for legal pages and a `WebSite` node with `potentialAction` (sitelinks search) if/when a search exists.

---

## 3. Sitemap & robots

- **`app/sitemap.ts`** lists 5 URLs (`/`, `/contact`, `/privacy`, `/terms`, `/gdpr`) with `changeFrequency`/`priority`. ✅ correct mechanism (native App Router sitemap).
  - **SEO-LOW — `lastModified` is `new Date()` at build time for every route**, so all entries claim "modified now" on each deploy. This is noise to crawlers.
    - **Fix:** Use real content modification dates (e.g. the "Last updated: April 2026" the legal pages already display) or git mtime.
- **`app/robots.ts`** allows `/`, disallows `/dashboard`, `/admin`, `/api`, `/login`, `/signup`, `/forgot-password`, references `${SITE}/sitemap.xml`, and sets `host`. ✅ correct — private/auth/API routes excluded, sitemap referenced.
- **SEO-LOW — redundant `next-sitemap` dependency:** `package.json` includes `next-sitemap ^4.2.3`, but the app uses the **native** `app/sitemap.ts`/`app/robots.ts`. If `next-sitemap` ever runs in `postbuild`, it could emit a conflicting `sitemap.xml`/`robots.txt`. No `next-sitemap.config.js` was found, so it's likely inert — but it's confusing.
  - **Fix:** Remove `next-sitemap` (and any postbuild hook) since native generation is in use, or commit fully to one approach.

---

## 4. Social / Open Graph

| Element | Status | Evidence |
|---|---|---|
| OG image | ✅ dynamic 1200×630, branded, alt text | `app/opengraph-image.tsx` |
| Twitter image | ✅ dynamic 1200×630, `summary_large_image` | `app/twitter-image.tsx`, `layout.tsx:54-59` |
| OG title/description/type/locale/siteName | ✅ | `layout.tsx:46-53` |
| Per-page OG (legal) | ✅ | `terms:9-15`, etc. |
| **SEO-LOW** — `twitter:site`/`creator` handle | ⚠️ not set | `layout.tsx:54-59` |

Social cards are well done. Add a `twitter:site` handle when the brand account exists.

---

## 5. Domain / canonicalisation

- **SEO-MED — www vs apex must resolve to one canonical host:** `metadataBase` and `robots.host` use `www.stealthconnect.ai`, and `lib/site-url.ts` deliberately preserves whichever host the user is on (for PKCE). If both `stealthconnect.ai` and `www.stealthconnect.ai` serve `200`s, that's duplicate content.
  - **Fix:** Configure a permanent 301 from apex → `www` (or vice-versa) at the Vercel domain/DNS level so only the canonical host is indexable; keep `metadataBase`/canonicals on that host. (The auth host-preservation logic still works because the redirect happens before the app.)

---

## 6. Performance SEO (Core Web Vitals)

- Core Web Vitals (LCP, INP, CLS) are ranking signals. The landing is **JS-heavy** (framer-motion + gsap + recharts + embla + dotted-map; see `docs/04` PERF-H2/H3), which risks INP/LCP on mobile field data (CrUX) even if lab Lighthouse is 90+.
  - **SEO-MED:** Treat the `docs/04` "top three wins" (drop recharts, consolidate animation engines, exclude `/api` from middleware) as SEO work too — they improve the field CWV that Google actually uses for ranking.
  - **Positive:** `@vercel/speed-insights` is wired (`layout.tsx:87`) — use its field data to monitor CWV. Lazy-loading + code-splitting already reduce initial JS.
- **CLS:** dynamic sections use fixed-height placeholders (`ph`/`phAlt` in `app/page.tsx:8-9`) — good for CLS. Verify the placeholders' heights match the loaded sections to avoid shift.

---

## 7. Indexability & crawl

- Private areas correctly `noindex` (`dashboard`, `admin`, `(auth)`); public marketing + legal indexable. ✅
- Internal linking is healthy for a small site: footer links to all legal/contact pages and anchors; nav anchors to sections; CTAs to `/signup`/`/login`/`/contact`. ✅
- **SEO-LOW — thin content surface:** Only ~5 indexable URLs. This is fine for launch but limits organic reach.
  - **Opportunity (not a defect):** A content/blog strategy (e.g. "how to find someone's email from LinkedIn", comparison pages) would expand the indexable surface and capture high-intent queries — the product's value prop maps directly to searchable questions.

---

## 8. Findings summary

| ID | Severity | Area | One-line | Fix |
|---|---|---|---|---|
| SEO-1 | Medium | Structured data | JSON-LD price will diverge from displayed (discounted) price; no combo Offer | Align after FP-01; add combo Offer |
| SEO-2 | Medium | Canonical | www/apex duplicate content if both 200 | 301 to one canonical host |
| SEO-3 | Medium | CWV | JS-heavy landing risks mobile INP/LCP | Apply `docs/04` PERF-H2/H3 |
| SEO-4 | Low | Sitemap | `lastModified` = build time (noise) | Use real content dates |
| SEO-5 | Low | Tooling | redundant `next-sitemap` dep | Remove (native sitemap in use) |
| SEO-6 | Low | Social | no `twitter:site` handle | Add when account exists |
| SEO-7 | Low | Content | only ~5 indexable URLs | Content/blog strategy (growth) |
| SEO-Info | — | Reviews | correctly no fake Review/Rating markup | Keep until reviews are real |

---

## 9. Verdict

Technical SEO is a **strength**, not a blocker. Nothing here is launch-blocking. The two items worth doing before/at launch are **www↔apex canonicalisation** (SEO-2) and keeping **structured-data prices honest** once the pricing source-of-truth is fixed (SEO-1, tied to the Critical `docs/02` F-PAY-01). Everything else is incremental. The biggest *growth* lever is content (SEO-7), and the biggest *ranking-risk* lever is Core Web Vitals on the animation-heavy landing (SEO-3), which overlaps with the performance roadmap.

*End of Phase 6.*
