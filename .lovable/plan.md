# Momently — Build Plan

Premium SaaS for private, ephemeral surprise websites that expire in 48h. Stack: TanStack Start + Tailwind v4 + Lovable Cloud (Supabase) + Framer Motion + Lucide. Direction: **Boutique Warmth** (cream `hsl(20 40% 98%)`, ink `hsl(20 20% 12%)`, coral `hsl(12 85% 65%)`, Playfair Display + Inter + JetBrains Mono).

## Pages & Routes

```
src/routes/
  __root.tsx                — shell, fonts, providers, nav/footer
  index.tsx                 — Landing
  create.tsx                — Create Surprise (auth-required, redirects to /auth)
  preview.$id.tsx           — Surprise Preview (owner)
  s.$slug.tsx               — Public Dynamic Surprise Page
  _authenticated/
    route.tsx               — auth gate (managed)
    dashboard.tsx           — Admin Dashboard
  auth.tsx                  — sign in / sign up
```

Root sets `notFoundComponent` → premium 404.

## Design tokens

Port the chosen direction's tokens into `src/styles.css` verbatim (light + dark variants), map into `@theme inline`. Load Playfair Display, Inter, JetBrains Mono via `<link>` in `__root.tsx` head. Signature moments: rotated glass preview card with coral glow, circular 48h countdown ring with shimmer, occasion chips.

## Component library (`src/components/`)

- `layout/SiteNav.tsx`, `layout/SiteFooter.tsx`
- `momently/OccasionChip.tsx`, `OccasionGrid.tsx`
- `momently/SurprisePreviewCard.tsx` (the rotated glass card)
- `momently/CountdownRing.tsx` (circular, shimmer, live ticking)
- `momently/CountdownInline.tsx` (mono digits `47:59:12`)
- `momently/RevealEnvelope.tsx` (letter-unseal animation for /s/[slug])
- `momently/ThemeToggle.tsx` (dark/light)
- `momently/PhotoUploader.tsx`, `MessageEditor.tsx`, `ThemePicker.tsx`
- `ui/*` shadcn primitives already present

## Data model (Lovable Cloud)

Enable Lovable Cloud. Migration creates:

- `surprises` — `id uuid pk`, `slug text unique`, `owner_id uuid → auth.users`, `occasion text`, `recipient_name text`, `title text`, `message text`, `theme text`, `cover_image_url text`, `music_url text`, `expires_at timestamptz`, `opened_at timestamptz`, `is_published bool`, `created_at`
- `surprise_photos` — `id`, `surprise_id fk`, `url`, `caption`, `sort_order`
- Storage bucket `surprise-media` (public read for signed URLs of published)
- RLS: owner CRUD on own rows; anon SELECT on `is_published=true AND (opened_at IS NULL OR now() < opened_at + interval '48 hours')`, projected to safe columns. Owner-scoped SELECT policy alongside public one so preview works pre-publish.
- GRANTs to `authenticated`, `service_role`, plus narrow `anon` SELECT.

Slug generation via `nanoid`-style random 10-char in a server fn.

## Server functions (`src/lib/surprises.functions.ts`)

- `createSurprise` (auth) — insert draft, return id + slug
- `updateSurprise` (auth) — patch fields
- `publishSurprise` (auth) — set `is_published=true`
- `deleteSurprise` (auth)
- `listMySurprises` (auth) — dashboard
- `getSurpriseBySlugPublic` (public, publishable client) — reads only non-expired published rows; on first read sets `opened_at = now()` (idempotent via `is null` check) via admin client inside handler
- `getSurpriseByIdOwner` (auth) — for preview

Public route loader for `/s/$slug` calls the public fn; owner routes under `_authenticated` call auth fns.

## Page contracts

1. **Landing (`/`)** — hero (headline + preview card), occasion chips, dark countdown feature section, 3-step how-it-works, pricing (Free / $12 Premium), testimonial, footer. Framer Motion reveal-up on scroll.
2. **Create Surprise (`/create`, gated)** — multi-step: occasion → recipient/title/message → photos/theme/music → review. Live mini-preview card on the side. Publish CTA → routes to `/preview/:id`.
3. **Surprise Preview (`/preview/:id`)** — owner view of exactly what recipient sees, plus a share bar (copy link, QR, expiry info) and Edit/Publish/Delete.
4. **Dynamic Surprise (`/s/:slug`)** — RevealEnvelope intro → full experience: cover photo, recipient name in Playfair italic, message, photo gallery, background music (opt-in play), CountdownRing showing time left. Expired state → tasteful "This moment has faded" screen. 404 if slug missing.
5. **Admin Dashboard (`/_authenticated/dashboard`)** — grid of user's surprises with status chips (Draft / Live / Expired), countdowns, quick actions, "New surprise" CTA.
6. **404** — Playfair "404", "This memory doesn't exist", link home.

## Auth

Email/password + Google (via `lovable.auth.signInWithOAuth`). `/auth` public route with sign-in/up tabs and post-auth redirect back to intended path.

## Motion

Framer Motion for: hero reveal, staggered section entry, envelope unseal on /s/[slug], countdown pulse, chip hover. Keep restrained.

## SEO / head

Each route sets own `head()` — /s/[slug] uses loader data (recipient + occasion) for og:title/og:description/og:image (cover photo).

## Build order

1. Enable Lovable Cloud + migration + GRANTs/RLS.
2. Tokens in `styles.css` + fonts in `__root.tsx` + nav/footer + 404.
3. Landing page (full).
4. Auth page + auth gate wiring.
5. Server functions + shared components (SurprisePreviewCard, CountdownRing, RevealEnvelope).
6. Create Surprise wizard.
7. Preview page + share bar.
8. Public `/s/:slug` with reveal + expiry.
9. Dashboard.
10. Polish pass: motion, dark mode, mobile.

Approve to start building.