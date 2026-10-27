# Image spec

Every image the new site needs, where to put it, and the exact size. Drop a file in the listed
folder with the listed name, push, and it replaces the placeholder automatically on the next
deploy. WebP is preferred; PNG, JPG and AVIF also work.

**House style for every image:** pure black background (`#060509`) or transparent, one violet
(`#8B3DFF`) rim or back light, clean studio lighting, glass and label in sharp focus.
**Never:** people, hands, faces, syringes, needles, body imagery, before/after shots, or
anything that suggests human use. Instagram and payment processors reject stores for this.

## 1. Brand

| File | Size | Art direction |
| --- | --- | --- |
| `public/brand/logo.svg` | vector | Ghost mark + "PHANTOM BIO LABS" wordmark, violet on transparent. Replaces the drawn placeholder in the header and footer. |
| `src/app/icon.png` | 512 × 512 | Ghost mark centered on `#060509`, violet line art. Browser tab icon (replaces `src/app/icon.svg`). |
| `src/app/apple-icon.png` | 180 × 180 | Same as the icon, for iPhone home screens. |
| `public/images/og/og-default.jpg` | 1200 × 630 | Share card for Instagram, iMessage and X: hero vial on the right, "Research-grade peptides. Zero compromise." on the left, logo top-left. |

## 2. Home hero

| File | Size | Art direction |
| --- | --- | --- |
| `public/images/hero/hero-vial.webp` | 1600 × 2000 (4:5), transparent or `#060509` | One hero vial at a slight 3/4 angle, violet flip cap, white label reading "PHANTOM BIO LABS", lyophilized cake visible, dramatic violet rim light, soft floor reflection. Leave 10% empty space on every side. |

## 3. Category banners (9)

All 1600 × 900 (16:9). The text sits bottom-left, so keep that corner dark and calm.

| File | Category | Art direction |
| --- | --- | --- |
| `public/images/categories/recovery-and-repair.webp` | Recovery & Repair | Macro of clear glass vials in a lab rack, violet rim light, shallow depth of field. |
| `public/images/categories/growth-hormone.webp` | Growth Hormone | Close-up of an HPLC column and steel tubing, cool violet glow on black. |
| `public/images/categories/metabolic.webp` | Metabolic | Pipette tip releasing one clear droplet into a well plate, dark bench, violet edge light. |
| `public/images/categories/cognitive.webp` | Cognitive | Abstract network of fine lines etched into dark glass, faint violet highlights. |
| `public/images/categories/longevity.webp` | Longevity | Long-exposure light trail forming a helix above a dark lab bench. |
| `public/images/categories/cosmetic.webp` | Cosmetic | Macro of pale blue powder inside a clear vial, soft violet backlight. |
| `public/images/categories/hormonal.webp` | Hormonal | Rows of sealed vials in a cold-storage tray, frost on the edges, violet side light. |
| `public/images/categories/mitochondrial-and-energy.webp` | Mitochondrial & Energy | Microscope objective above a glass slide, violet illumination, black background. |
| `public/images/categories/solvents-and-supplies.webp` | Solvents & Supplies | Clear liquid vials beside a glass beaker on a dark bench, minimal, violet reflection. |

## 4. Product photos (47 sizes across 32 products)

All 1600 × 1600 (1:1), vial centered and filling about 75% of the height, on `#060509` or
transparent. Same camera angle and lighting for every photo so the grid looks uniform.
The label must show the product name and size exactly as written below.

Optional: `public/images/products/<slug>/main.webp` is used for any size without its own photo.

| File | Label text | Notes |
| --- | --- | --- |
| `public/images/products/recon-water/3ml.webp` | BAC Water · 3 mL | In stock |
| `public/images/products/recon-water/10ml.webp` | BAC Water · 10 mL | Out of stock |
| `public/images/products/bpc-157/5mg.webp` | BPC-157 · 5 mg | In stock |
| `public/images/products/bpc-157/10mg.webp` | BPC-157 · 10 mg | Out of stock |
| `public/images/products/bpc-157/20mg.webp` | BPC-157 · 20 mg | Out of stock |
| `public/images/products/bpc-157-tb-500/10mg.webp` | BPC-157 + TB-500 · 10 mg | In stock · name or size under review |
| `public/images/products/bpc-157-tb-500/20mg.webp` | BPC-157 + TB-500 · 20 mg | Out of stock · name or size under review |
| `public/images/products/cagrilintide/5mg.webp` | Cagrilintide · 5 mg | Out of stock |
| `public/images/products/cjc-1295-no-dac-ipamorelin/10mg.webp` | CJC-1295 (No DAC) + Ipamorelin · 10 mg | In stock · name or size under review |
| `public/images/products/dsip/10mg.webp` | DSIP · 10 mg | Out of stock |
| `public/images/products/epithalon/10mg.webp` | Epithalon · 10 mg | Out of stock |
| `public/images/products/ghk-cu/50mg.webp` | GHK-Cu · 50 mg | In stock |
| `public/images/products/ghrp-2/10mg.webp` | GHRP-2 · 10 mg | Out of stock |
| `public/images/products/ghrp-6/10mg.webp` | GHRP-6 · 10 mg | Out of stock |
| `public/images/products/glow/70mg.webp` | GLOW · 70 mg | In stock · name or size under review |
| `public/images/products/glp-3-rt/5mg.webp` | GLP-3 (Rt) · 5 mg | In stock · name or size under review |
| `public/images/products/glp-3-rt/10mg.webp` | GLP-3 (Rt) · 10 mg | In stock · name or size under review |
| `public/images/products/glp-3-rt/20mg.webp` | GLP-3 (Rt) · 20 mg | In stock · name or size under review |
| `public/images/products/glp-3-rt/40mg.webp` | GLP-3 (Rt) · 40 mg | Out of stock · name or size under review |
| `public/images/products/glutathione/1500mg.webp` | Glutathione · 1500 mg | Out of stock |
| `public/images/products/hcg/5000iu.webp` | HCG · 5000 IU | Out of stock |
| `public/images/products/igf-1-lr3/1mg.webp` | IGF-1 LR3 · 1 mg | In stock |
| `public/images/products/ipamorelin/5mg.webp` | Ipamorelin · 5 mg | Out of stock |
| `public/images/products/ipamorelin/10mg.webp` | Ipamorelin · 10 mg | Out of stock |
| `public/images/products/kisspeptin/10mg.webp` | Kisspeptin · 10 mg | Out of stock |
| `public/images/products/klow/80mg.webp` | KLOW · 80 mg | In stock · name or size under review |
| `public/images/products/kpv/10mg.webp` | KPV · 10 mg | In stock · name or size under review |
| `public/images/products/mots-c/10mg.webp` | MOTS-c · 10 mg | In stock |
| `public/images/products/mots-c/40mg.webp` | MOTS-c · 40 mg | Out of stock |
| `public/images/products/mt-2-melanotan-ii/10mg.webp` | MT-2 (Melanotan II) · 10 mg | Out of stock |
| `public/images/products/pinealon/10mg.webp` | Pinealon · 10 mg | Out of stock |
| `public/images/products/pt-141/10mg.webp` | PT-141 · 10 mg | Out of stock |
| `public/images/products/selank/5mg.webp` | Selank · 5 mg | In stock |
| `public/images/products/semaglutide-glp-1/5mg.webp` | Semaglutide (GLP-1) · 5 mg | In stock · name or size under review |
| `public/images/products/semaglutide-glp-1/10mg.webp` | Semaglutide (GLP-1) · 10 mg | In stock · name or size under review |
| `public/images/products/semax/5mg.webp` | Semax · 5 mg | In stock · name or size under review |
| `public/images/products/semax/10mg.webp` | Semax · 10 mg | Out of stock · name or size under review |
| `public/images/products/snap-8/10mg.webp` | Snap-8 · 10 mg | Out of stock |
| `public/images/products/ss-31/10mg.webp` | SS-31 · 10 mg | Out of stock |
| `public/images/products/tb-500/5mg.webp` | TB-500 · 5 mg | In stock |
| `public/images/products/tb-500/10mg.webp` | TB-500 · 10 mg | Out of stock |
| `public/images/products/tesamorelin/5mg.webp` | Tesamorelin · 5 mg | Out of stock |
| `public/images/products/tesamorelin/10mg.webp` | Tesamorelin · 10 mg | In stock |
| `public/images/products/thymosin-alpha-1/10mg.webp` | Thymosin Alpha-1 · 10 mg | Out of stock |
| `public/images/products/tirzepatide/5mg.webp` | Tirzepatide (GLP-2) · 5 mg | Out of stock · name or size under review |
| `public/images/products/tirzepatide/10mg.webp` | Tirzepatide (GLP-2) · 10 mg | In stock · name or size under review |
| `public/images/products/tirzepatide/20mg.webp` | Tirzepatide (GLP-2) · 20 mg | Out of stock · name or size under review |

## 5. Later pages (not needed for the home page sign-off)

| File | Size | Art direction |
| --- | --- | --- |
| `public/images/pages/about.webp` | 2000 × 1100 | Empty, dark lab bench with one row of vials, violet light raking across. |
| `public/images/pages/quality.webp` | 2000 × 1100 | HPLC chromatogram on a monitor in a dark lab, violet reflection on the desk. |
