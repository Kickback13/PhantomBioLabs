# Domain cutover checklist: phantombiopeptides.com → new store

Moves `phantombiopeptides.com` and `www.phantombiopeptides.com` from the old Vercel project
(`phantombiopeptides`) to the new one (`phantombiolabs-store`), both in the **JKN Ventures** team.
Keanu runs the account and DNS steps. Do the whole of section 2 in one sitting: the old site goes
dark the moment the domain is removed from the old project.

## 0. Before the day

- [ ] The new store's production deployment is the build you want live (Vercel → `phantombiolabs-store` → Deployments → the latest `claude/storefront-rebuild` build is marked **Production**). If it isn't, promote it or set the project's production branch to `claude/storefront-rebuild`.
- [ ] Decide ET or PT for support hours and the 2pm dispatch cutoff (one line in `src/lib/site.ts`, `timezone`).
- [ ] Confirm "San Diego, CA" as the business location (used in Organization schema, `src/lib/site.ts`).
- [ ] Confirm whether to name a testing lab anywhere (currently: never named).
- [ ] Both projects are in the same team (JKN Ventures), so Vercel shouldn't ask for a TXT verification record. If it does ask, add that TXT record at GoDaddy **before** removing the domain from the old project.

## 1. Turn on indexing (new project)

- [ ] In `phantombiolabs-store` → Settings → Environment Variables, set `NEXT_PUBLIC_ALLOW_INDEXING=true` for the **Production** environment only (not Preview).
- [ ] Redeploy production so the value is baked into the build (it's a `NEXT_PUBLIC_` variable).

## 2. Move the domain (one sitting)

- [ ] Old project `phantombiopeptides` → Settings → Domains: remove `www.phantombiopeptides.com` and `phantombiopeptides.com`.
- [ ] Right away, new project `phantombiolabs-store` → Settings → Domains: add `www.phantombiopeptides.com` as the primary domain (connected to Production).
- [ ] Add `phantombiopeptides.com` (apex) to the same project **as a normal domain, not as a Vercel "Redirect to www" domain**. The app's own redirects (`next.config.ts`) send every apex URL to its final www URL in one hop, including renamed products. A Vercel-level apex redirect would add a second hop for renamed URLs (apex → www → new slug).
- [ ] Check SSL is issued for both names (green "Valid Configuration" on the Domains screen).
- [ ] Only change DNS at GoDaddy if the Domains screen asks for it. Current records already point to Vercel: `A @ 216.198.79.1`, `CNAME www → …vercel-dns-017.com`.

## 3. Verify on production

Run from the repo:

```bash
npm run seo:audit -- --expect-indexable     # crawls https://www.phantombiopeptides.com/sitemap.xml
npm run seo:redirects                       # the 46 old URLs in docs/old-sitemap.xml
```

- [ ] Home HTML has no `noindex` (`curl -s https://www.phantombiopeptides.com/ | grep -i noindex` prints nothing).
- [ ] `https://www.phantombiopeptides.com/robots.txt` shows `Allow: /`, the disallow list (`/cart /checkout /account /admin /api /search`) and `Sitemap: https://www.phantombiopeptides.com/sitemap.xml`.
- [ ] `https://www.phantombiopeptides.com/sitemap.xml` returns XML; every URL returns 200 with no noindex (the audit checks this).
- [ ] Every page has one canonical pointing to its `https://www.` URL (the audit checks this).
- [ ] Old URLs: each of the 46 apex URLs answers one permanent redirect (308) straight to a www page that returns 200 (`npm run seo:redirects`). Spot-check: `curl -sI https://phantombiopeptides.com/product/kpv-2` → `location: https://www.phantombiopeptides.com/product/kpv`.
- [ ] `http://` URLs end up on `https://www.` (Vercel adds its own http → https hop first; that's expected).
- [ ] Schema validates with no errors: [Rich Results Test](https://search.google.com/test/rich-results) on `/`, `/faq`, one category and one product (Product + Breadcrumb), and [validator.schema.org](https://validator.schema.org) on the same URLs.
- [ ] Share cards render: paste the home page and one product URL into a link preview (iMessage, X or the [OG debugger](https://www.opengraph.xyz)).
- [ ] `phantombiolabs-store.vercel.app` answers with `X-Robots-Tag: noindex, nofollow` (it must never be indexed).
- [ ] Checkout shows "Checkout opens soon" until a payment processor is connected.

## 4. Google Search Console

- [ ] Add a **Domain** property for `phantombiopeptides.com` (DNS TXT verification). Keanu adds the TXT record at GoDaddy.
- [ ] Submit `https://www.phantombiopeptides.com/sitemap.xml` under Sitemaps.
- [ ] URL Inspection → Request indexing for: `/`, `/shop`, the top 5 products, and `/coa`.
- [ ] Watch Pages/Indexing and Enhancements (Products, Breadcrumbs, FAQ) for the next 2–4 weeks.

## 5. Bing Webmaster Tools

- [ ] Import the site from Google Search Console.
- [ ] Submit the sitemap.
- [ ] Optional: turn on IndexNow.

## 6. Keep the redirects

- [ ] The old platform can't stay live (its WordPress backend is down and the domain can only point at one project). The 301/308 map in `next.config.ts` is what carries the old URLs over: keep it in place permanently, and add a line for any slug renamed later.

## 7. phantombiolabs.com

- [ ] Ask Keanu what happens to `phantombiolabs.com` ("Phantom Biolabs LLC", Squarespace domain, hosted elsewhere). If it's his, 301 it to `https://www.phantombiopeptides.com`. A second site under the same brand name splits SEO.

## 8. After launch

- [ ] Fill the `{{SEO_DESK_BRIEF}}` slots (`src/content/guides.ts`, product research overviews) and `data/compound-facts.json`. Guides join the sitemap automatically once every slot is filled; the BPC-157 regulatory explainer also needs `needsSignOff.done = true` after legal review.
- [ ] Publish COAs in `/admin/coas`; each gets its own page at `/coa/{product}/{lot}` and joins the sitemap.
- [ ] Drop real images into `public/images/...` (see `IMAGE_SPEC.md`).
