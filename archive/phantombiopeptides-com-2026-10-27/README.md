# phantombiopeptides.com — site archive (27 Oct 2026)

A full copy of the old store, taken before the rebuild. The store's WordPress/WooCommerce
backend is offline, so this archive may be the only readable copy of the catalog outside
WordPress.com itself.

## What's here

| Path | Contents |
| --- | --- |
| `products.json` | All 32 products: name, slug, category, prices, sale prices, dosage options, variations, stock, image links, full description HTML |
| `products_raw.json` | The same products exactly as WooCommerce returned them (includes COA attachment IDs) |
| `text/` | Readable text of every page (home, shop, about, FAQ, contact, terms, shipping, 32 product pages, 9 category pages, cart, login) |
| `html/` | Raw HTML of the same 50 pages |
| `images/` | 35 product images recovered from Vercel's image cache (compressed copies, not the originals) |
| `static/` | The site's own art: hero vials, favicon, app icons |
| `report.json` | What was fetched, what failed, and why |

Re-run with `python3 archive/tools/scrape_phantombiopeptides.py <output-dir>` while the old site is still up.

## How the old site was set up

- **Storefront:** custom Next.js app on Vercel, project `phantombiopeptides` in the **JKN Ventures** team.
  Built and deployed by GitHub user `ruelknmdeveloper` from the repo `ruelknmdeveloper/phantombiopeptides`
  (not owned by kickback13). Last deploy: 3 Aug 2026.
- **Backend:** WooCommerce on a WordPress.com site, `kickbackai-pkjdo.wpcomstaging.com`, mapped to
  `admin.phantombiopeptides.com`. Plugins seen in product data: Jetpack, Elementor, Reddit for WooCommerce,
  Snapchat for WooCommerce, and a COA field (ACF).
- **Domain:** `phantombiopeptides.com` is registered at **GoDaddy** (expires 16 Jun 2027). DNS is at GoDaddy and
  already points to Vercel (`A 216.198.79.1`, `www CNAME …vercel-dns-017.com`).
- **Contact on site:** WhatsApp +1 559 360 6568, Mon–Fri 9am–6pm ET.
- **Features:** age gate, cart drawer, customer accounts, wishlist, COA pages, category filters, FAQ, free U.S.
  shipping over $125.

## Problems found

1. **The backend is down.** WordPress.com returns "Active domain connection for this domain not found", and
   `admin.phantombiopeptides.com` has no valid SSL certificate.
2. **The live site runs on cached pages.** Some pages are about 11 days stale. The homepage "Bestselling" grid
   already shows "No products found". Cart, checkout, login and wishlist depend on the dead backend.
3. **A redeploy of the old project would likely break every product page**, because the build fetches products
   from WordPress.
4. **Not recoverable from the public site:** customer accounts, order history, original full-size images,
   COA PDFs (only their WordPress attachment IDs survive), and 12 variant images (e.g. BPC-157 10 mg / 20 mg).
   These only exist inside the WordPress.com account.

## Other domain found

`phantombiolabs.com` ("Phantom Biolabs LLC | Pure Research Compounds") is a separate site: registered at
Squarespace Domains (expires 28 Apr 2027), `www` hosted on the Internet Computer (canister
`k6uno-kyaaa-aaaao-qpuaq-cai`), apex redirected by Squarespace.

## Catalog at a glance

| Category | Products |
| --- | --- |
| Recovery & Repair | BPC-157, BPC-157 + TB-500, TB-500, KPV, GLOW, KLOW |
| Growth Hormone | CJC-1295 (No DAC) / Ipamorelin, Ipamorelin, GHRP-2, GHRP-6, IGF-1 LR3, Tesamorelin |
| Metabolic | Semaglutide (GLP-1), Tirzepatide (GLP-2), GLP-3 (Rt), Cagrilintide |
| Cognitive | Semax, Selank, DSIP, Pinealon |
| Longevity | Epithalon, Glutathione, Thymosin Alpha-1 |
| Cosmetic | GHK-Cu, Snap-8, MT-2 (Melanotan II) |
| Hormonal | HCG, Kisspeptin, PT-141 |
| Mitochondrial & Energy | MOTS-c, SS-31 |
| Solvents & Supplies | BAC Water |

Prices, sale prices and per-dosage variations are in `products.json`. 15 of 32 products were marked out of stock.
