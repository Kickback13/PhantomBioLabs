// Writes IMAGE_SPEC.md and CONTENT_REVIEW.md from data/catalog.json.
// Re-run after changing the starting catalog: node scripts/generate-docs.mjs
import { readFileSync, writeFileSync } from "node:fs";

const catalog = JSON.parse(readFileSync("data/catalog.json", "utf8"));
const sizeSlug = (label) => label.toLowerCase().replace(/[^a-z0-9.]+/g, "");
const money = (c) => `$${(c / 100).toFixed(2)}`;

const categoryArt = {
  "recovery-and-repair": "Macro of clear glass vials in a lab rack, violet rim light, shallow depth of field.",
  "growth-hormone": "Close-up of an HPLC column and steel tubing, cool violet glow on black.",
  metabolic: "Pipette tip releasing one clear droplet into a well plate, dark bench, violet edge light.",
  cognitive: "Abstract network of fine lines etched into dark glass, faint violet highlights.",
  longevity: "Long-exposure light trail forming a helix above a dark lab bench.",
  cosmetic: "Macro of pale blue powder inside a clear vial, soft violet backlight.",
  hormonal: "Rows of sealed vials in a cold-storage tray, frost on the edges, violet side light.",
  "mitochondrial-and-energy": "Microscope objective above a glass slide, violet illumination, black background.",
  "solvents-and-supplies": "Clear liquid vials beside a glass beaker on a dark bench, minimal, violet reflection.",
};

let spec = `# Image spec

Every image the new site needs, where to put it, and the exact size. Drop a file in the listed
folder with the listed name, push, and it replaces the placeholder automatically on the next
deploy. WebP is preferred; PNG, JPG and AVIF also work.

**House style for every image:** pure black background (\`#060509\`) or transparent, one violet
(\`#8B3DFF\`) rim or back light, clean studio lighting, glass and label in sharp focus.
**Never:** people, hands, faces, syringes, needles, body imagery, before/after shots, or
anything that suggests human use. Instagram and payment processors reject stores for this.

## 1. Brand

| File | Size | Art direction |
| --- | --- | --- |
| \`public/brand/logo.svg\` | vector | Ghost mark + "PHANTOM BIO LABS" wordmark, violet on transparent. Replaces the drawn placeholder in the header and footer. |
| \`src/app/icon.png\` | 512 × 512 | Ghost mark centered on \`#060509\`, violet line art. Browser tab icon (replaces \`src/app/icon.svg\`). |
| \`src/app/apple-icon.png\` | 180 × 180 | Same as the icon, for iPhone home screens. |
| \`public/images/og/og-default.jpg\` | 1200 × 630 | Share card for Instagram, iMessage and X: hero vial on the right, "Research-grade peptides. Zero compromise." on the left, logo top-left. |

## 2. Home hero

| File | Size | Art direction |
| --- | --- | --- |
| \`public/images/hero/hero-vial.webp\` | 1600 × 2000 (4:5), transparent or \`#060509\` | One hero vial at a slight 3/4 angle, violet flip cap, white label reading "PHANTOM BIO LABS", lyophilized cake visible, dramatic violet rim light, soft floor reflection. Leave 10% empty space on every side. |

## 3. Category banners (9)

All 1600 × 900 (16:9). The text sits bottom-left, so keep that corner dark and calm.

| File | Category | Art direction |
| --- | --- | --- |
${catalog.categories.map((c) => `| \`public/images/categories/${c.slug}.webp\` | ${c.name} | ${categoryArt[c.slug] ?? ""} |`).join("\n")}

## 4. Product photos (${catalog.products.reduce((n, p) => n + p.variants.length, 0)} sizes across ${catalog.products.length} products)

All 1600 × 1600 (1:1), vial centered and filling about 75% of the height, on \`#060509\` or
transparent. Same camera angle and lighting for every photo so the grid looks uniform.
The label must show the product name and size exactly as written below.

Optional: \`public/images/products/<slug>/main.webp\` is used for any size without its own photo.

| File | Label text | Notes |
| --- | --- | --- |
`;
for (const p of catalog.products) {
  for (const v of p.variants) {
    spec += `| \`public/images/products/${p.slug}/${sizeSlug(v.label)}.webp\` | ${p.name} · ${v.label} | ${v.in_stock ? "In stock" : "Out of stock"}${p.review_flags.length ? " · name or size under review" : ""} |\n`;
  }
}
spec += `
## 5. Later pages (not needed for the home page sign-off)

| File | Size | Art direction |
| --- | --- | --- |
| \`public/images/pages/about.webp\` | 2000 × 1100 | Empty, dark lab bench with one row of vials, violet light raking across. |
| \`public/images/pages/quality.webp\` | 2000 × 1100 | HPLC chromatogram on a monitor in a dark lab, violet reflection on the desk. |
`;
writeFileSync("IMAGE_SPEC.md", spec);

let review = `# Content review

What was reviewed before launch and what was decided. Edit products any time in the admin
area (/admin).

## 1. Product decisions (resolved 27 Oct 2026)

You approved the catalog as imported, with these changes and checks. Prices, the KPV size and
the shipping settings stay as they are.

| Product | Change or check |
| --- | --- |
${catalog.products.flatMap((p) => p.resolved_flags.map((f) => `| ${p.name} | ${f} |`)).join("\n")}

## 2. Descriptions rewritten for compliance (all ${catalog.products.length})

Every old description described effects on a person: healing, weight, appetite, libido, sleep,
mood, skin or muscle. All ${catalog.products.length} were rewritten in neutral research terms:
what the compound is, and what research it's used in. Size-specific wording ("This 5 mg vial…")
and protocol wording were also removed, since one description now covers every size.

| Product | Old claims removed |
| --- | --- |
${catalog.products.map((p) => `| ${p.name} | ${p.previous_description_claims} |`).join("\n")}

## 3. Copy decisions

- **Testing lab:** you use more than one lab, so the site now says "independent third-party lab" and never names one. Each COA can still record its lab in the admin area.
- Approved as written: mass-spectrometry identity check, U.S.-based fulfilment, certified partner facility, replace-or-refund and reship-at-our-cost promises.
- Left out: the old site's "10,000+ orders shipped", "99.4% average purity" and "4.9★ researcher rating". Send real numbers if you want them back.

## 4. Conflicts in the old copy (fixed, please confirm)

- **Shipping method.** The old FAQ said "insulated containers with gel packs, overnight or 2-day". The old shipping page said "USPS Priority or UPS Ground, with 2-day and overnight options". The new FAQ uses the shipping-page version.
- **Payment methods.** The old FAQ listed cards, ACH and crypto. Until a processor is chosen, the FAQ says "Available payment methods are shown at checkout".

## 5. Settings

| Setting | Current value | Where it's used |
| --- | --- | --- |
| Free U.S. shipping threshold | ${money(catalog.settings.free_shipping_threshold_cents)} | Announcement bar, comparison table, checkout |
| Flat shipping under the threshold | ${money(catalog.settings.flat_shipping_cents)} | Checkout |
| Brand name | ${catalog.settings.store_name} | Everywhere |
`;
writeFileSync("CONTENT_REVIEW.md", review);
console.log("wrote IMAGE_SPEC.md and CONTENT_REVIEW.md");
