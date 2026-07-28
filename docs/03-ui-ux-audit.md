# StealthConnect AI — UI/UX Audit (Phase 3)

> **Document type:** Design, usability, and conversion audit.
> **Benchmark set:** Stripe, Linear, Notion, Vercel, Framer, Airbnb (as instructed). The product is measured against the bar these set for visual hierarchy, consistency, trust, and conversion.
> **Method:** Findings cite real source (`path:line`). Design tokens read from `app/globals.css`; components read directly.
> **Verdict in one line:** Visually this is a strong, modern, dark-first SaaS site with genuinely polished motion and glassmorphism — close to the benchmark on *craft*, but held back by **content authenticity, pricing-message integrity, accent-colour discipline, contrast accessibility, and a heavy reliance on inline styles** that erodes consistency.

---

## 0. Design system snapshot (what exists)

| Token group | Value(s) | Source |
|---|---|---|
| Brand primary | `#0038FF` (electric blue), variants `--brand-dark #0029CC`, `--brand-mid #3b82f6` | `app/globals.css`, `tailwind.config.ts` |
| Secondary accent | `#CCFF00` (lime) — used in footer CTA, OG image, hero selection, "Best Value" badge | `ui/motion-footer.tsx`, `Hero.tsx`, `opengraph-image.tsx`, `Pricing.tsx` |
| Typography | **Montserrat** for both display and body (400/600/700/900), `display: swap` | `app/layout.tsx:11-16`, `globals.css` |
| Theme | Dark-first (`--bg #000`), full light-mode override; `next-themes` with `sc-theme` key | `globals.css`, `ThemeProvider.tsx` |
| Radii | `--r-sm 8` → `--r-xl 24`, `--r-full` | `globals.css` |
| Shadows | sm/md/lg + `--shadow-brand` (blue-tinted) | `globals.css` |
| Focus | `:focus-visible { outline: 2px solid var(--brand) }` | `globals.css` |
| Motion | framer-motion (`LazyMotion domAnimation`), gsap+ScrollTrigger (footer) | `MotionProvider.tsx`, `ui/motion-footer.tsx` |

The token foundation is good — a single brand colour, a coherent dark palette, semantic section tokens (`--c-section-bg`, `--c-heading`, …), and no `!important`. The problems are in *application*, not foundation.

---

## CRITICAL ISSUES

### UX-C1 — The pricing calculator (the site's strongest conversion tool) quotes prices the checkout won't honour
- **Where:** `components/sections/Pricing.tsx` (volume tiers + combo bundle + live calculator) vs the flat checkout price (see `docs/02` F-PAY-01).
- **Why it's critical for UX:** The interactive estimator is the single most persuasive element on the page — it invites the user to compute their exact cost and then click "Get N contacts". When the wizard then charges a different, higher number, the moment of conversion becomes the moment of betrayal. Benchmarks (Stripe, Vercel) treat price transparency as sacred; a quoted-vs-charged mismatch is the worst possible trust break at the bottom of the funnel.
- **Fix:** Reconcile to one source of truth (see `docs/09` prompt FP-01). Until then, the calculator over-promises.

### UX-C2 — "Delivered" status never renders, so the dashboard looks broken to paying users
- **Where:** `app/dashboard/page.tsx:49`, `components/dashboard/Orders/OrdersView.tsx:31-37` (see `docs/02` F-PAY-02).
- **Why it's critical for UX:** A customer who paid sees their order stuck in "Pending"/"Processing" forever and a "Delivered: 0" KPI. The product *appears* to never deliver, which is catastrophic for a service whose entire promise is "results in 30 minutes". This is a UX symptom of a data bug, but users experience it as "the product doesn't work".
- **Fix:** Resolve the enum drift (`docs/09` FP-02).

---

## HIGH PRIORITY ISSUES

### UX-H1 — Brand blue `#0038FF` on white fails WCAG AA contrast for text and links
- **Where:** Used as text/link colour on light surfaces throughout — e.g. `Pricing.tsx` per-unit text and "Talk to us" link (`:482,:522`), accent words in headings, light-mode body copy.
- **Detail:** `#0038FF` on `#ffffff` ≈ **3.6:1** contrast. WCAG AA requires **4.5:1** for normal text (3:1 for large/bold ≥24px). So blue *body* text and *small links* fail; blue used only on large bold headings passes.
- **Impact:** Low-vision users struggle to read links/labels; fails accessibility compliance (ADA/EN 301 549 risk for a commercial product).
- **Fix:** Use `--brand-dark #0029CC` (≈ 5.6:1, passes) for text/links on white; reserve `#0038FF` for large headings, fills, and decorative use. Audit with an automated contrast checker.

### UX-H2 — Fabricated testimonials and stock "customer" faces undercut trust
- **Where:** `components/sections/Testimonials.tsx` (9 named fake people), `app/(auth)/login/LoginClient.tsx:9-28`, `signup/SignupClient.tsx:12-31` (`randomuser.me` avatars). See `docs/02` F-PUB-02.
- **Why it matters for UX/conversion:** Authentic social proof is the benchmark standard (Stripe customer logos, Linear real quotes). Invented testimonials with `randomuser.me` faces are recognisable to savvy B2B buyers and, once spotted, poison credibility for the whole site — and carry FTC/ASA fake-review risk.
- **Fix:** Replace with real, attributed testimonials (logo + name + company, ideally linked), or remove and lead with verifiable metrics. Remove fake faces from auth screens.

### UX-H3 — Pervasive inline styles instead of the design-token utility layer
- **Where:** Nearly every component uses `style={{ … }}` with raw values and CSS vars (e.g. `SubmitWizard.tsx`, `Pricing.tsx`, `AccountView.tsx`, `terms/page.tsx` uses inline styles for an entire page).
- **Why it matters:** The benchmark teams enforce a single styling system (Tailwind/utility or CSS-in-JS) for consistency, theming, and review-ability. Here, Tailwind classes and inline styles are mixed, hardcoded hex values appear inline (`#0038FF`, `#CCFF00`, `rgba(...)`) alongside the token system, and font-family is repeated as an inline string (`"var(--font-montserrat,'Montserrat',sans-serif)"`) in dozens of places. This causes drift (some components use `var(--brand)`, others hardcode `#0038FF`), bloats server-rendered HTML, and makes global restyling error-prone.
- **Impact:** Inconsistency over time; harder maintenance; larger DOM payload.
- **Fix:** Standardise on Tailwind utilities backed by the token theme (extend `tailwind.config.ts` with the CSS vars so classes like `text-brand`, `bg-surface` exist). Replace inline hex with tokens. Set the font once on `<body>` (already done via `font-body`) and stop repeating it inline.

### UX-H4 — Multiple competing implementations of nav, hero, footer, and testimonials (design drift)
- **Where:** Active: `components/Navbar.tsx`, `sections/Hero.tsx`, `ui/motion-footer.tsx`. Dead variants: `sections/LandingNav.tsx`, `components/hero.tsx`, `components/motion-footer.tsx` (mis-branded "Volvox"/"SOBERS"), `components/Testimonials.tsx`, `components/testimonial-v2.tsx`, `sections/FeaturesStack.tsx`.
- **Why it matters:** Benchmark codebases keep one canonical component per role. Here a reviewer/designer cannot tell which is real, and the mis-branded dead footer is a latent disaster. Multiple versions also imply the design language wasn't finalised.
- **Fix:** Delete dead variants (see `docs/02` F-MISC-01); document the canonical component set.

---

## MEDIUM PRIORITY ISSUES

### UX-M1 — Accent-colour usage is undisciplined (blue vs lime)
- **Where:** Lime `#CCFF00` appears as the primary CTA colour in the footer (`ui/motion-footer.tsx:327,342`), the "Try it free"/selection accent in the hero, the "Best Value" badge and top-tier highlight in pricing, and the OG image — while blue `#0038FF` is the primary CTA elsewhere (nav "Get started", pricing buttons, dashboard).
- **Why it matters:** Strong brands assign each accent a consistent job (e.g. Linear's single accent). Here the same "primary action" is sometimes blue, sometimes lime, with no evident rule, so the eye can't learn what "the button to click" looks like.
- **Fix:** Define a rule: blue = primary action everywhere; lime = reserved highlight/badge only (or vice-versa). Apply consistently across hero, nav, pricing, footer, dashboard.

### UX-M2 — No shared type scale; font sizes are hardcoded per-element
- **Where:** Sizes like `text-[13.5px]`, `text-[22px]`, inline `fontSize: 13/14/15/16/32/48` are scattered across `SubmitWizard.tsx`, `AccountView.tsx`, `OrdersView.tsx`, `Pricing.tsx`, legal pages.
- **Why it matters:** Benchmark UIs use a small, fixed type scale for vertical rhythm. Arbitrary px values (13.5px, 12.5px, 10.5px) produce subtle inconsistency between sections.
- **Fix:** Define a type scale in Tailwind theme (e.g. `text-xs/sm/base/lg/…` mapped to your sizes) and use it; eliminate fractional px sizes.

### UX-M3 — Two floating widgets may collide on small screens
- **Where:** `app/layout.tsx:88-89` renders both `<ChatWidgetLazy />` and `<FloatingConsultButtonLazy />` globally.
- **Why it matters:** Two persistent floating affordances (chat + consult) compete for the same bottom corners on mobile, can overlap, and add visual noise — benchmark apps surface a single launcher.
- **Fix:** Verify positions don't overlap at 360–414px widths; consolidate into one launcher or ensure clear separation and that they hide where appropriate (the consult button already hides on auth routes).

### UX-M4 — Animations lack a `prefers-reduced-motion` escape hatch
- **Where:** Heavy framer-motion throughout, gsap ScrollTrigger parallax in the footer, looping hero/HowItWorks animations, `scroll-smooth` global (`app/layout.tsx:80`). No `@media (prefers-reduced-motion: reduce)` overrides were found in `globals.css`.
- **Why it matters:** Vestibular-sensitive users need reduced motion; it's a WCAG 2.1 (2.3.3) and benchmark accessibility expectation.
- **Fix:** Add a global `prefers-reduced-motion` block that disables non-essential animation and `scroll-behavior`, and gate looping/parallax effects on the media query (framer-motion's `useReducedMotion`).

### UX-M5 — Information architecture: long landing page with overlapping sections
- **Where:** `app/page.tsx` stacks Hero → HowItWorks → Features → Stats → Pricing → Testimonials → FAQ → FinalCTA → Footer; `HowItWorks` and the (dead) `FeaturesStack` cover similar "how it works" ground, and Features partly restates value props.
- **Why it matters:** The page is long; benchmark landing pages are ruthlessly tight. Some message repetition (97.2% / 28 min / no subscription appears in hero, features, stats, FAQ) risks fatigue.
- **Fix:** Tighten the narrative; ensure each section earns its place; remove the dead duplicate layout.

### UX-M6 — Focus management in overlays is partial
- **Where:** Mobile sidebar drawer (`DashboardShell.tsx:95-133`) traps scroll but not focus; chat widget/FAB open without a documented focus trap.
- **Why it matters:** Keyboard/screen-reader users can tab "behind" an open drawer/modal. Benchmark apps trap focus and restore it on close.
- **Fix:** Add focus trapping + `Escape` to close + focus restore for the drawer and chat panel (e.g. a small focus-trap utility or Radix Dialog).

---

## LOW PRIORITY ISSUES

### UX-L1 — Step-indicator labels hidden on mobile
- **Where:** `SubmitWizard.tsx:128-133` (`hidden sm:block`). On phones, the wizard shows numbered circles without text labels.
- **Fix:** Show the current step's label on mobile (e.g. "Step 2 of 4 · LinkedIn URLs").

### UX-L2 — Large Unsplash hero image on auth pages affects LCP
- **Where:** `LoginClient.tsx:83` / `SignupClient.tsx:155` load a `w=2160` Unsplash image as the auth hero.
- **Fix:** Use a smaller, `next/image`-optimised, or self-hosted asset; it's decorative.

### UX-L3 — Legal pages are inline-styled, full-bleed black, and slightly off the app shell
- **Where:** `app/terms/page.tsx`, `privacy`, `gdpr` render their own black page with inline styles rather than the shared design system.
- **Fix:** Move to shared layout/components for consistency; otherwise content is good (note the Terms placeholder issue in `docs/02`/`docs/05`).

### UX-L4 — Toaster + form feedback patterns are inconsistent
- **Where:** Some flows use `react-hot-toast` (AccountView, AdminDashboard), others use inline banners (SubmitWizard, ContactForm, auth). 
- **Fix:** Pick one feedback pattern per interaction class (inline for forms, toast for background actions) and apply consistently.

---

## What's genuinely strong (keep)

- **Motion craft:** framer-motion transitions, the gsap cinematic footer, the orbiting-card FinalCTA, and the animated pricing tiers are polished and on-benchmark.
- **Dark-first system** with a clean light override and `next-themes`.
- **Responsive structure:** the dashboard, orders, and admin views ship proper desktop-table + mobile-card variants (`AdminDashboard.tsx:307-410`, `OrdersView.tsx:236-300`); the marketing site uses sensible `sm/md/lg` breakpoints and fluid `clamp()` headings.
- **Accessibility basics:** semantic `<nav>/<section>/<footer>/<blockquote>`, `aria-label`s on icon buttons, `role="alert"` on errors, `:focus-visible` ring, `aria-hidden` on decorative elements.
- **Empty/loading/error states** are branded and consistent (see `docs/02` §10).
- **Trust scaffolding** exists: pricing guarantees, GDPR/Privacy/Terms pages, security headers, "no charge on failed lookups".

---

## Benchmark scorecard

| Dimension | StealthConnect | Benchmark bar | Gap |
|---|---|---|---|
| Visual craft / motion | 9/10 | Framer/Linear | Minimal |
| Visual hierarchy | 7/10 | Stripe | Accent discipline (UX-M1) |
| Consistency (styling system) | 5/10 | Vercel | Inline styles (UX-H3), type scale (UX-M2) |
| Content authenticity / trust | 4/10 | Stripe | Fake testimonials (UX-H2) |
| Pricing transparency | 3/10 | Stripe | Quote ≠ charge (UX-C1) |
| Accessibility | 6/10 | Airbnb | Contrast (UX-H1), reduced-motion (UX-M4), focus traps (UX-M6) |
| Conversion integrity | 4/10 | Stripe | Calculator over-promises (UX-C1) |
| Responsive | 8/10 | Linear | Floating-widget overlap (UX-M3), mobile step labels (UX-L1) |

**Net:** The product *looks* like a top-tier SaaS but undermines itself on the two things buyers care about most — **truthful pricing and credible proof** — plus accessibility contrast. Fixing UX-C1, UX-C2, UX-H1, and UX-H2 moves it from "impressive demo" to "trustworthy product".

*End of Phase 3.*
