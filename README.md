# Phantom Bio Labs storefront

The new research-peptide store: Next.js 16 (App Router), TypeScript, Tailwind CSS 4, Supabase,
deployed on Vercel. It replaces the old WooCommerce site at phantombiopeptides.com, whose
saved copy lives in [`archive/`](archive/phantombiopeptides-com-2026-10-27/README.md).

## Status

| Step | What | State |
| --- | --- | --- |
| 1 | Supabase schema + catalog import | Done |
| 2 | Design system + home page | Done, waiting for design sign-off |
| 3 | Shop, 9 category pages, 32 product pages | Next |
| 4 | Cart drawer, accounts, wishlist | |
| 5 | Content pages (About, Quality, COA library, FAQ, Contact, legal) | |
| 6 | Admin area (products, sizes, prices, stock, COAs, orders) | |
| 7 | Checkout up to payment (orders saved as "pending payment") | |

Open review items are in [`CONTENT_REVIEW.md`](CONTENT_REVIEW.md). Every image the site needs is
listed in [`IMAGE_SPEC.md`](IMAGE_SPEC.md).

## Run it locally

```bash
npm install
cp .env.example .env.local   # public Supabase URL + publishable key
npm run dev                  # http://localhost:3000
```

`npm run build` needs network access to Supabase, because pages are pre-rendered from the
live catalog. Behind a corporate or sandbox proxy, run it with `NODE_USE_ENV_PROXY=1`.

## How it fits together

- **Catalog data** comes from Supabase (`src/lib/catalog.ts`). Reads are cached with
  `"use cache"` and tagged `catalog`, so pages are static and refresh hourly, or immediately when
  the admin area saves a change.
- **Database schema** is in `supabase/migrations/`. Row-level security is on for every table:
  visitors can read live products only; orders are created only through the `place_order`
  function, which re-reads prices and stock from the database.
- **Starting catalog**: `scripts/import-legacy-catalog.mjs` turned the archived WooCommerce
  data into `data/catalog.json` (fixes, review flags, rewritten descriptions), and
  `scripts/generate-seed-sql.mjs` turns that into `supabase/seed.sql`. After launch, edit
  products in the admin area instead.
- **Images**: drop files into `public/images/...` as named in `IMAGE_SPEC.md`. A manifest is
  rebuilt before every `dev` and `build`, and the labelled placeholder vials disappear as real
  photos arrive.
- **UI**: several components are adapted from [21st.dev](https://21st.dev) (spotlight cards,
  marquee, animated grid, number ticker); each file credits its source.

## Compliance rules for anyone editing copy

This is a research-use-only store. Product copy describes what a compound is and what research
it's used in, never effects on a person (weight, healing, skin, libido, sleep, mood, muscle).
No dosing instructions, no people or before/after images. Every product page and the footer
carry "For laboratory research use only. Not for human consumption." and the FDA disclosure.
