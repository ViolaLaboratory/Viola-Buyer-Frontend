# Viola Landing — Work Summary & Handoff

Branch: **`gabe-landing-page-updates`** · Repo: `ViolaLaboratory/Viola-Buyer-Frontend`

This document is a handoff for the next developer or AI agent. It explains **what changed**, **why**, **where** (file paths), and **how to reproduce/extend it**. Read it top to bottom before touching the landing page.

---

## 0. TL;DR

Two passes were done on the marketing **landing page** (`/` → `src/pages/Landing.tsx`) and the shared footer:

1. **Pass 1 — SEO / AEO**: metadata, Open Graph/Twitter cards, JSON-LD, semantic landmarks, alt text, sitemap/robots. No visual change.
2. **Pass 2 — Visual rebuild**: a brand color system, a WebGL shader hero, neutral "glass" buttons with a cursor-following spotlight, fluid type, full mobile responsiveness incl. a mobile menu and an Apple-style floating tab dock with a "dot-shoots-to-target" indicator, a Cluely-style structured footer, and motion polish.

On-page **copy was never changed** (except one user-requested mobile label: "Try the marketplace for free" → "Try it now" on mobile). The display typeface (**Zen Dots**, `font-zen`) was kept; body/UI uses **Inter**/**DM Sans**.

---

## 1. Project context & gotchas (read first)

- **Stack:** Vite + React 18 + TypeScript + Tailwind + shadcn/ui + React Router. **NOT Next.js** — there is no SSR, no RSC, no Next Metadata API. The page is a client-rendered SPA.
- **AEO caveat (important):** Because it's a client-rendered SPA, the hero/FAQ **body copy is NOT in `curl`/View-Source HTML** — it's rendered by JS (Google executes JS, so it still indexes). Pass 1 put the `<title>`/meta/JSON-LD into the static `index.html` (so those ARE in served HTML), and kept all copy as static JSX (nothing behind client-only fetches). If you need body copy in raw HTML, you must add a prerender step (e.g. `vite-plugin-prerender` / `react-snap`) — deliberately NOT done here.
- **Dev server runs on port 8080** (hardcoded in `vite.config.ts`): `npm run dev`.
- **Git LFS quirk:** `public/*.mp4` are LFS-tracked; a fresh clone may show some as modified ("should have been pointers"). Run `git lfs pull`. These were never touched by this work.
- **Build check:** `npm run build` (Vite/esbuild — does NOT run eslint/tsc typecheck, so it won't fail on unused vars or type errors; lint separately with `npm run lint` if needed).
- **One new dependency:** `@paper-design/shaders-react` (the shaders.com WebGL mesh-gradient lib used for the hero). Everything else is built-in.

---

## 2. Pass 1 — SEO / AEO

Goal: discoverability metadata only; zero visual/copy change.

| Area | What | Files |
| --- | --- | --- |
| Route metadata | `<title>`, meta description (kept existing copy), canonical, robots, Open Graph + Twitter card tags | `index.html` |
| Structured data | Three `application/ld+json` blocks: **Organization**, **SoftwareApplication**, **FAQPage** (FAQ built from the real 5 Q&As; no fabricated pricing) | `index.html` |
| OG image | 1200×630 placeholder (near-black + wordmark + tagline) | `public/og.png` |
| Per-route metadata | `useDocumentMeta(title, description)` hook — native DOM, **no react-helmet**; restores defaults on unmount. Used by the Waitlist page | `src/hooks/useDocumentMeta.ts`, `src/pages/Waitlist.tsx` |
| Semantic HTML | `<header>`/`<main>` landmarks (nav/footer already existed), one `<h1>`, descriptive `alt` text on images, decorative icon → `alt=""` | `src/pages/Landing.tsx` |
| Crawl | `sitemap.xml` (`/` + `/waitlist`), linked from `robots.txt` | `public/sitemap.xml`, `public/robots.txt` |
| Bug fix | favicon `href="/public/favicon.ico"` → `/favicon.ico` (Vite serves `public/` at root) | `index.html` |

**Canonical host used:** `https://www.theviola.co` — confirm this matches the deployed host (vs apex) and update all references in `index.html` + `public/sitemap.xml`/`robots.txt` if needed.

---

## 3. Pass 2 — Visual rebuild

Aesthetic target: minimal, premium, restrained dark SaaS. Color is grounded in the **real product gradient** and lives in exactly one bold place — the hero. UI chrome (buttons/cards/borders) is neutral white-on-dark glass. The retired **acid lime/yellow `#e4ea04`** was removed everywhere.

### 3.1 Design tokens — source of truth
Defined as **Tailwind theme colors** (`tailwind.config.ts`) and mirrored as **CSS variables** (`src/index.css` `:root`):

```
amber #FFD65C · orange #F76213 · red-orange #E0481F · magenta #C81FB5
violet #7A23CC · purple-deep #2D0351 · ink #16042F · ink-900 #100020
```
Page background base is a consistent near-black (`#09090b`). Custom easing tokens: `ease-out-expo` `cubic-bezier(0.16,1,0.3,1)`, `ease-out-quint` `cubic-bezier(0.22,1,0.36,1)`.
> `red-orange` + `magenta` were added later to match the **actual** product background (warm red-orange → magenta → violet, not the original amber-led guess).

### 3.2 Glass buttons (`src/index.css`, `@layer components`)
- `.glass-btn` (base): `relative inline-flex`, border, `backdrop-blur`, bright top-inner-highlight via `box-shadow: inset 0 1px 0 …`, soft outer shadow, `active:scale-[0.97]`, amber focus ring.
- `.glass-btn-primary` (brighter, `bg-white/15`) and `.glass-btn-secondary` (fainter, `bg-white/5`).
- **Cursor-following spotlight:** `.glass-btn::before` is a radial-gradient at `var(--mouse-x) var(--mouse-y)`, shown on `:hover`. The `--mouse-x/--mouse-y` vars are fed for **every** glass button by one delegated `pointermove` listener mounted app-wide → `src/components/GlassSpotlight.tsx` (in `src/App.tsx`). No per-button wiring needed.
- All CTAs (primary + secondary, incl. "Talk to Our Team") use these classes — visually consistent.

### 3.3 Hero shader (the one bold moment) — `src/components/HeroShader.tsx`
- `@paper-design/shaders-react` `MeshGradient`, seeded with `SPECTRUM = ["#E0481F","#C81FB5","#8E2BE8","#7A23CC"]` (red-orange → magenta → bright purple → violet; **no near-black in the mesh** so it stays vivid — the scrim supplies the dark), built-in `grainOverlay` kills banding.
- **Fallback ladder (all required):** no-WebGL, `prefers-reduced-motion`, and mobile (`max-width:768px`) all render the static CSS gradient `.hero-gradient-fallback` instead. Lazy-mounted via `requestAnimationFrame` so it never blocks first paint.
- `ambient` prop = dimmer/softer variant, used as the **demo section** background.
- Scrim fades the shader into the page black top & bottom so it never hard-edges; the mobile fallback also fades its bottom into `#09090b`, and the hero product-screenshot bottom fade matches `#09090b`.

### 3.4 Type
- Display = **Zen Dots** (`font-zen`), unchanged. Body/UI = **Inter** (`font-sans`) / **DM Sans** (`font-dm`).
- Hero `<h1>` is fluid: `text-[clamp(2.75rem,8vw,5.5rem)]`, `leading-[1.05]`. The washed-gray "effortlessly" treatment was replaced with solid white italic.
- `.eyebrow` utility = small tracked uppercase **Inter** (fixes the old display-font-on-tiny-uppercase look).

### 3.5 Responsiveness
- Mobile-first throughout; rows stack (`grid-cols-1 md:grid-cols-2`, `flex-col md:flex-row`), media constrained, `clamp()` headlines, no horizontal scroll.
- **Mobile menu** — `src/components/MobileMenu.tsx`: `md:hidden` hamburger → solid panel + darkened/blurred scrim, animates open AND close (stays mounted, transitions via the `open` class). Contains nav links + Contact + a Request Access CTA (the top-bar Request Access button is hidden on mobile to declutter).

### 3.6 Feature tab dock — `src/pages/Landing.tsx`
- Apple-style **floating bottom dock** (`fixed bottom-8`), shown only while the features section is in view (IntersectionObserver → `tabsVisible`), slides/scales/fades in. Compact on mobile so all three tabs fit a 375px screen (scrolls, scrollbar hidden, on narrower).
- **"Dot-shoots-to-target" active indicator:** a single shared `<span>` (white pill) animated with **WAAPI** (hardware-accelerated, off-main-thread, interruptible). On `activeTab` change it **pinches to a round dot at the midpoint and expands** into a pill at the target. Easing `cubic-bezier(0.77,0,0.175,1)` (Emil-style ease-in-out), 440ms. **Animate `width` + `translateX`, NOT `scaleX`** (scaleX distorted the `rounded-full` corners and made the dot a thin lozenge). Honors reduced-motion; re-aligns on resize.
- `activeTab` is driven by a **scroll-spy** (per-section IntersectionObserver). Clicking a dock tab calls `goToTab(i)`: it sets the active tab immediately (so the dot fires on tap) **and locks the scroll-spy during the click-triggered smooth-scroll** (`spyLockedRef`) so sections passed mid-flight don't yank the selector backward. Lock releases ~150ms after scroll settles (700ms fallback).

### 3.7 Footer — `src/components/Footer.tsx`
Cluely-style structured footer on an **elevated dark surface the page gradient-fades into** (`bg-gradient-to-b from-[#09090b] via-[#0c0a12] to-[#0f0b18]` + a subtle violet brand glow up top):
- CTA (kept, copy verbatim) → link columns (**Explore**: Features/Outcomes/FAQ anchors · **Get Started**: Request Access/Try the Demo/Contact — all real links) → a live **"Now in early access"** status pill (pulsing amber dot) → social icons → copyright.
- An earlier animated giant-wordmark version was removed (not the desired style).

### 3.8 Background & video
- Page background unified to a single consistent near-black `#09090b` (a scroll-varying colored backdrop was removed). All color lives in the hero shader.
- **Video loading/fallback is now black** (was a `viola.jpg` PNG poster, which looked bad): posters removed, containers are `bg-black`, and the on-error state is a black `<div>` instead of the image. Applies to the hero product-screenshot video and the three feature videos in `src/pages/Landing.tsx`.

---

## 4. Key files

| File | Role |
| --- | --- |
| `src/pages/Landing.tsx` | The landing page — hero+shader, feature dock + indicator, sections, Who-It's-For cards, demo, FAQ |
| `src/components/HeroShader.tsx` | WebGL shader hero + fallbacks (`ambient` prop) |
| `src/components/GlassSpotlight.tsx` | App-wide delegated pointer listener → cursor-following spotlight on every `.glass-btn` |
| `src/components/MobileMenu.tsx` | Mobile hamburger menu |
| `src/components/Footer.tsx` | Structured footer |
| `src/index.css` | Brand CSS vars, `.glass-btn*`, `.eyebrow`, `.hero-gradient-fallback`, animations |
| `tailwind.config.ts` | Brand color tokens, easing tokens |
| `src/hooks/useDocumentMeta.ts` | Per-route title/description (SEO) |
| `index.html` | Meta tags, OG/Twitter, JSON-LD, canonical, favicon |
| `public/og.png`, `public/sitemap.xml`, `public/robots.txt` | SEO assets |

---

## 5. How to run & verify

```bash
npm install
npm run dev        # http://localhost:8080
npm run build      # production build (also the smoke test)
```
Verification used during the work: a headless preview at desktop (1280) and mobile (375) widths + DOM inspection. Note the preview screenshot tool only reliably captured the **top** of the page, so the dock/footer/mid-page elements were verified via DOM measurement (computed styles, geometry) rather than screenshots.

---

## 6. Known caveats / follow-ups

- **Canonical host** (`www.theviola.co`) — confirm vs the real deployment.
- **AEO** — body copy is JS-rendered (SPA); add a prerender step if raw-HTML copy is required.
- **OG image** is a placeholder — replace with a polished 1200×630 export.
- Redundant per-button `onMouseMove`/`buttonRefs` handlers remain in `Landing.tsx`/`Footer.tsx` (the global `GlassSpotlight` now covers them) — harmless, can be removed for tidiness.
- The in-app **demo** (`/demo/*`) product UI keeps its own genre/mood badge colors — out of scope for the landing-chrome cleanup.
- Bundle is large (single chunk ~700kB+); consider code-splitting the `/demo` app if perf matters.

---

## 7. Commit list (this work, oldest → newest)

Pass 1 (SEO): route metadata/OG/JSON-LD · OG image · header/main+alt · waitlist per-route meta · sitemap+robots · favicon fix.

Pass 2 (visual): tokens+easing+glass primitives · retire lime · WebGL shader hero+fallbacks+clamp type+mobile menu · re-ground shader to product bg (+magenta/red-orange) · footer-button spotlight standard · spotlight-on-all + unify secondary + sticky feature bar + mobile Request Access + "Try it now" + Who-It's-For rework · unify near-black background · floating dock (fit/raise/smooth) · Cluely footer rebuild · gradient-fade shader→black + WAAPI dot-shoot indicator · cursor-spotlight on all glass (delegated) · fix indicator squish (width not scaleX) · fix selector glitch (lock scroll-spy) · black video loading/fallback.

Run `git log --oneline` on this branch for exact messages/hashes.
