// Builds data/catalog.json (the starting catalog) from the archived WooCommerce export.
// Run once: node scripts/import-legacy-catalog.mjs
// After the first import, edit products in the admin area, not here.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

const ARCHIVE = "archive/phantombiopeptides-com-2026-10-27/products.json";
const legacy = JSON.parse(readFileSync(ARCHIVE, "utf8"));

// Categories in display order. Names are kept from the old site; descriptions are new.
const CATEGORIES = [
  ["recovery-and-repair", "Recovery & Repair", "Peptides studied in preclinical models of cell migration, angiogenesis and extracellular-matrix signaling."],
  ["growth-hormone", "Growth Hormone", "GHRH analogs, ghrelin-receptor agonists and growth factors used in GH/IGF-1 axis research."],
  ["metabolic", "Metabolic", "Incretin, amylin and glucagon receptor agonists for metabolic-signaling research."],
  ["cognitive", "Cognitive", "Neuropeptides and synthetic analogs studied in neurotrophic and neuroendocrine research."],
  ["longevity", "Longevity", "Compounds used in research on telomerase activity, redox balance and immune signaling."],
  ["cosmetic", "Cosmetic", "Peptides used in cosmetic-science and in-vitro dermal research."],
  ["hormonal", "Hormonal", "Ligands for gonadotropin, kisspeptin and melanocortin receptor research."],
  ["mitochondrial-and-energy", "Mitochondrial & Energy", "Peptides studied in mitochondrial membrane and cellular energy research."],
  ["solvents-and-supplies", "Solvents & Supplies", "Reconstitution solvents and laboratory supplies."],
];
const categoryByName = {
  "Recovery & Repair": "recovery-and-repair",
  "Growth Hormone": "growth-hormone",
  Metabolic: "metabolic",
  Cognitive: "cognitive",
  Longevity: "longevity",
  Cosmetic: "cosmetic",
  Hormonal: "hormonal",
  "Mitochondrial & Energy": "mitochondrial-and-energy",
  "Solvents and Supplies": "solvents-and-supplies",
};

// Per-product fixes. Every old description made human-benefit claims, so all are rewritten
// in neutral research terms. `was` records the claims that were removed (see docs/CONTENT_CHANGES.md).
const P = {
  "bpc-157": {
    summary: "Synthetic pentadecapeptide",
    description: "BPC-157 (Body Protection Compound-157) is a synthetic 15-amino-acid peptide whose sequence is derived from a protein fragment isolated from gastric juice. It is one of the most frequently cited peptides in preclinical literature, where it is studied in cell-culture and animal models of angiogenesis and growth-factor signaling.",
    was: "soft-tissue healing, tendon and ligament repair, gut-lining integrity; 'starting point for a new study protocol'",
    featured: 1,
  },
  "bpc-157-tb-500": {
    name: "BPC-157 + TB-500",
    summary: "Two-peptide research blend",
    description: "A co-formulated vial containing BPC-157 and TB-500, a synthetic fragment of Thymosin Beta-4. The two peptides are frequently examined side by side in preclinical models of cell migration, angiogenesis and extracellular-matrix signaling, and co-formulation provides a fixed ratio in a single vial.",
    was: "systemic healing, flexibility, synergistic soft-tissue recovery",
    flags: ["Old size list included 5 mg, but only 10 mg and 20 mg had prices. Imported 10 mg and 20 mg only."],
    featured: 3,
  },
  cagrilintide: {
    summary: "Long-acting amylin analog",
    description: "Cagrilintide is a long-acting, acylated analog of amylin, a pancreatic peptide hormone. It is studied as an agonist of amylin and calcitonin receptors in metabolic-signaling research, often alongside GLP-1 receptor agonists in preclinical models.",
    was: "appetite regulation, satiety, body-weight management",
  },
  "cjc-1295-no-dac-ipomerelin": {
    name: "CJC-1295 (No DAC) + Ipamorelin",
    slug: "cjc-1295-no-dac-ipamorelin",
    summary: "GHRH analog + ghrelin-receptor agonist",
    description: "A co-formulated vial of CJC-1295 without Drug Affinity Complex (also known as Modified GRF 1-29), a GHRH analog, and Ipamorelin, a selective ghrelin-receptor (GHS-R1a) agonist. The pairing is used in research on the GHRH and ghrelin receptor pathways that regulate pulsatile growth-hormone secretion in preclinical models.",
    was: "'stronger, more sustained pulse of growth hormone'; 'saves preparation time'",
    flags: ["Name corrected from 'Ipomerelin' to 'Ipamorelin'. URL changed to /product/cjc-1295-no-dac-ipamorelin."],
  },
  dsip: {
    summary: "Neuroendocrine nonapeptide",
    description: "DSIP (Delta Sleep-Inducing Peptide) is a naturally occurring nonapeptide first described in the 1970s. It is studied in neuroendocrine research, including its interactions with hypothalamic signaling and circadian regulation in animal models.",
    was: "deep sleep, stress response, recovery, cognitive-restorative pathways",
  },
  epithalon: {
    summary: "Synthetic tetrapeptide (AEDG)",
    description: "Epithalon (Ala-Glu-Asp-Gly), also spelled Epitalon, is a synthetic tetrapeptide modeled on epithalamin, a peptide extract of the pineal gland. It is studied in cell-culture research on telomerase activity and in models of pineal and circadian signaling.",
    was: "cellular aging, longevity and cellular-health positioning",
  },
  "ghk-cu": {
    summary: "Copper tripeptide complex",
    description: "GHK-Cu is a copper(II) complex of the naturally occurring tripeptide glycyl-L-histidyl-L-lysine. It is studied in in-vitro fibroblast and extracellular-matrix research, including collagen and glycosaminoglycan synthesis. The copper complex gives the powder its characteristic blue color.",
    was: "skin remodeling, wound healing, hair-follicle support, 'topical formulations'",
    featured: 4,
  },
  "ghrp-2": {
    summary: "Ghrelin-receptor agonist",
    description: "GHRP-2 (Pralmorelin) is a synthetic hexapeptide agonist of the ghrelin receptor (GHS-R1a). It is used as a reference compound in research on growth-hormone secretagogue signaling and the ghrelin pathway.",
    was: "appetite signaling, 'metabolic effects'",
  },
  "ghrp-6": {
    summary: "Ghrelin-receptor agonist",
    description: "GHRP-6 is a synthetic hexapeptide and one of the earliest characterized growth-hormone secretagogues. It acts on the ghrelin receptor (GHS-R1a) and is used in research on secretagogue signaling and ghrelin-receptor pharmacology.",
    was: "hunger regulation, 'pronounced effect on appetite'",
  },
  glow: {
    summary: "Three-peptide research blend",
    description: "GLOW is a multi-peptide research blend containing BPC-157, TB-500 and GHK-Cu in a single vial. It is intended for preclinical studies that examine the three compounds together, such as models of cell migration and extracellular-matrix signaling.",
    was: "tissue repair, skin quality, 'overall regeneration'",
    flags: ["Price is $99.00. Every other price ends in .99. Please confirm."],
    featured: 5,
  },
  "glp-3-rt": {
    name: "Retatrutide",
    slug: "retatrutide",
    summary: "GLP-1 / GIP / glucagon receptor agonist",
    description: "Retatrutide is a synthetic single-molecule agonist of three receptors: GLP-1, GIP and glucagon. It is studied in metabolic-signaling research on incretin and glucagon receptor pathways.",
    was: "appetite regulation, blood-sugar control, body-weight management",
    flags: ["Renamed from 'GLP-3 (Rt)' to Retatrutide. URL changed to /product/retatrutide."],
  },
  glutathione: {
    summary: "Endogenous tripeptide thiol",
    description: "Glutathione (γ-L-glutamyl-L-cysteinylglycine) is an endogenous tripeptide thiol. It is widely used in research on cellular redox balance, oxidative-stress models and enzymatic conjugation pathways.",
    was: "'master antioxidant', detoxification, longevity",
  },
  hcg: {
    name: "HCG",
    summary: "LH/hCG receptor glycoprotein hormone",
    description: "Human chorionic gonadotropin (hCG) is a glycoprotein hormone composed of alpha and beta subunits that acts on the LH/hCG receptor (LHCGR). It is used in reproductive endocrinology research, including studies of gonadotropin receptor signaling and steroidogenesis in vitro.",
    was: "testosterone, fertility, 'endogenous hormone production'",
  },
  "igf-1-lr3": {
    summary: "Long-acting IGF-1 analog",
    description: "IGF-1 LR3 (Long R3 IGF-1) is an 83-amino-acid analog of insulin-like growth factor 1 with an arginine substitution at position 3 and a 13-amino-acid N-terminal extension, which reduces binding to IGF-binding proteins. It is widely used as a cell-culture growth-factor supplement and in research on IGF-1 receptor signaling.",
    was: "muscle-tissue development",
  },
  ipamorelin: {
    summary: "Selective ghrelin-receptor agonist",
    description: "Ipamorelin is a synthetic pentapeptide and selective agonist of the ghrelin receptor (GHS-R1a). Its receptor selectivity makes it a common reference compound in research on growth-hormone secretagogue signaling.",
    was: "'beginning a protocol'",
  },
  kisspeptin: {
    summary: "KISS1 receptor ligand",
    description: "Kisspeptin is a peptide ligand of the KISS1 receptor (GPR54), encoded by the KISS1 gene. It is studied in reproductive neuroendocrinology research on hypothalamic GnRH signaling and the hypothalamic-pituitary-gonadal axis.",
    was: "fertility, puberty, sex hormones",
  },
  klow: {
    summary: "Four-peptide research blend",
    description: "KLOW is a multi-peptide research blend containing KPV, GHK-Cu, BPC-157 and TB-500 in a single vial. It is intended for preclinical studies that examine the four compounds together, including models of inflammatory signaling, cell migration and extracellular-matrix activity.",
    was: "tissue healing, inflammation modulation, skin quality, systemic recovery",
    flags: ["Price is $109.00. Every other price ends in .99. Please confirm."],
    featured: 6,
  },
  "kpv-2": {
    slug: "kpv",
    summary: "α-MSH C-terminal tripeptide",
    description: "KPV (Lys-Pro-Val) is a tripeptide corresponding to the C-terminal sequence of alpha-melanocyte-stimulating hormone (α-MSH). It is studied in cell-culture and animal models of inflammatory signaling, including NF-κB pathway activity.",
    was: "anti-inflammatory properties, gut health, tissue recovery",
    sizeIfMissing: "10 mg",
    flags: ["URL changed from /product/kpv-2 to /product/kpv.", "Old store had no size listed. Set to 10 mg from the old description and photo. Please confirm."],
  },
  "mots-c": {
    summary: "Mitochondrial-derived peptide",
    description: "MOTS-c is a 16-amino-acid peptide encoded within the mitochondrial 12S rRNA gene. It is studied in research on mitochondrial-nuclear signaling, AMPK activation and cellular energy metabolism.",
    was: "insulin sensitivity, exercise capacity, metabolic health",
    featured: 7,
  },
  "mt-2-melanotan-ii": {
    summary: "Melanocortin receptor agonist",
    description: "Melanotan II (MT-2) is a synthetic cyclic heptapeptide analog of alpha-melanocyte-stimulating hormone (α-MSH) and a non-selective melanocortin receptor agonist. It is used in research on melanocortin receptor signaling, including MC1R-mediated melanogenesis in vitro.",
    was: "skin pigmentation, appetite, libido",
  },
  pinealon: {
    summary: "Synthetic tripeptide (EDR)",
    description: "Pinealon (Glu-Asp-Arg) is a synthetic tripeptide. It is studied in cell-culture and animal models of neuronal oxidative stress and gene-expression regulation.",
    was: "neuroprotection, 'brain-supporting properties', cognition, brain health",
  },
  "pt-141": {
    summary: "Melanocortin MC3R / MC4R agonist",
    description: "PT-141 (Bremelanotide) is a synthetic cyclic heptapeptide melanocortin receptor agonist and an active metabolite of Melanotan II. It is studied in research on central melanocortin (MC3R/MC4R) signaling.",
    was: "libido, sexual response, sexual health",
  },
  "recon-water": {
    summary: "Reconstitution solvent",
    description: "Bacteriostatic water is sterile water containing 0.9% benzyl alcohol as a bacteriostatic preservative. It is a standard laboratory solvent for reconstituting lyophilized peptides, and the preservative allows a sealed vial to be accessed multiple times.",
    was: "minor: 'single-project use' (kept facts, tightened wording)",
    form: "Sterile liquid",
  },
  selank: {
    summary: "Tuftsin-analog heptapeptide",
    description: "Selank is a synthetic heptapeptide analog of tuftsin, an endogenous immunomodulatory peptide, extended with a Pro-Gly-Pro sequence for stability. It is studied in animal models of GABAergic signaling and brain-derived neurotrophic factor (BDNF) expression.",
    was: "anti-anxiety, mood, stress resilience, cognitive performance",
  },
  "semaglutide-glp-1": {
    name: "Semaglutide",
    slug: "semaglutide",
    summary: "GLP-1 receptor agonist",
    description: "Semaglutide is a synthetic, acylated analog of glucagon-like peptide-1 (GLP-1) and a GLP-1 receptor agonist. It is one of the most frequently studied compounds in research on incretin receptor signaling.",
    was: "appetite regulation, blood-sugar control, body-weight management",
    flags: ["Renamed from 'Semaglutide (GLP-1)' to Semaglutide to match Tirzepatide and Retatrutide. URL changed to /product/semaglutide."],
  },
  semax: {
    summary: "ACTH(4-10) analog heptapeptide",
    description: "Semax is a synthetic heptapeptide analog of the ACTH(4-10) fragment, extended with a Pro-Gly-Pro sequence. It is studied in animal models of neurotrophic signaling, including BDNF expression.",
    was: "focus, memory, cognitive enhancement, neuroprotection",
    featured: 8,
  },
  "snap-8": {
    summary: "SNAP-25-derived octapeptide",
    description: "SNAP-8 (Acetyl Glutamyl Heptapeptide-3) is a synthetic octapeptide modeled on the N-terminal end of the SNAP-25 protein. It is studied in cosmetic-science and in-vitro research on SNARE complex formation.",
    was: "smoothing expression lines, wrinkles, skincare",
  },
  "ss-31": {
    summary: "Mitochondria-targeting tetrapeptide",
    description: "SS-31 (Elamipretide) is a synthetic, cell-permeable tetrapeptide that localizes to the inner mitochondrial membrane, where it interacts with cardiolipin. It is studied in research on mitochondrial membrane structure, electron transport and reactive oxygen species.",
    was: "'supporting mitochondrial function', preserving energy production, mitochondrial health",
  },
  "tb-500": {
    summary: "Thymosin Beta-4 fragment",
    description: "TB-500 is a synthetic peptide based on the active region of Thymosin Beta-4, an actin-sequestering protein. It is studied in preclinical research on actin dynamics, cell migration and angiogenesis.",
    was: "tissue healing, flexibility, reducing inflammation 'across the body'",
    featured: 2,
  },
  tesamorelin: {
    summary: "GHRH analog",
    description: "Tesamorelin is a synthetic analog of growth-hormone-releasing hormone (GHRH) comprising the 44 amino acids of human GHRH with an N-terminal trans-3-hexenoyl modification. It is studied in research on GHRH receptor signaling and the GH/IGF-1 axis.",
    was: "reduction of visceral fat, body composition",
  },
  "thymosin-alpha-1": {
    summary: "Thymic immunomodulatory peptide",
    description: "Thymosin Alpha-1 is a 28-amino-acid acetylated peptide originally isolated from thymus tissue. It is studied in immunology research on T-cell maturation and toll-like receptor signaling.",
    was: "supporting immune function, resilience against infection, aging",
  },
  tirzepatide: {
    name: "Tirzepatide",
    summary: "GIP / GLP-1 receptor agonist",
    description: "Tirzepatide is a synthetic single-molecule agonist of the GIP and GLP-1 receptors. It is studied in research on dual incretin receptor signaling.",
    was: "appetite, glucose regulation, body-weight management",
    flags: ["Renamed from 'Tirzepatide (GLP-2)': tirzepatide is a GIP/GLP-1 agonist, not GLP-2."],
  },
};

const money = (v) => (v === "" || v == null || Number.isNaN(Number(v)) ? null : Math.round(Number(v) * 100));
const sizeValue = (label) => {
  const m = String(label).match(/([\d.]+)\s*(mg|ml|iu|mcg)/i);
  if (!m) return 0;
  const n = Number(m[1]);
  return m[2].toLowerCase() === "mcg" ? n / 1000 : n;
};
const normLabel = (s) => String(s).trim().replace(/\s*(mg|ml|iu|mcg)$/i, (u) => " " + u.trim().replace(/^ml$/i, "mL").replace(/^iu$/i, "IU").toLowerCase().replace("ml", "mL").replace("iu", "IU"));
const skuPart = (s) => s.toUpperCase().replace(/[^A-Z0-9]+/g, "");

const products = legacy.map((p, i) => {
  const o = P[p.slug];
  if (!o) throw new Error(`No override for ${p.slug}`);
  const slug = o.slug ?? p.slug;
  const name = o.name ?? p.name;
  const flags = [...(o.flags ?? [])];
  let variants;
  if (p.variations?.length) {
    variants = p.variations.map((v) => ({
      label: normLabel(v.attributes?.[0]?.option ?? ""),
      price: money(v.price),
      regular: money(v.regular_price),
      inStock: v.stock_status === "instock",
      legacyId: v.id,
    }));
  } else {
    const label = p.attributes?.[0]?.options?.[0] ?? o.sizeIfMissing;
    variants = [{ label: normLabel(label), price: money(p.price), regular: money(p.regular_price), inStock: p.stock_status === "instock", legacyId: null }];
  }
  variants.sort((a, b) => sizeValue(a.label) - sizeValue(b.label));
  const outVariants = variants.map((v, j) => {
    const compareAt = v.regular && v.regular > v.price ? v.regular : null;
    return {
      label: v.label,
      sku: `PBL-${skuPart(slug.replace(/-melanotan-ii$/, ""))}-${skuPart(v.label)}`.slice(0, 40),
      price_cents: v.price,
      compare_at_cents: compareAt,
      in_stock: v.inStock,
      sort_order: j,
      legacy_woo_id: v.legacyId,
    };
  });
  const sameAsSale = variants.filter((v) => v.regular && v.regular === v.price).map((v) => v.label);
  if (sameAsSale.length && variants.some((v) => v.regular && v.regular > v.price)) {
    flags.push(`No sale on ${sameAsSale.join(", ")} (regular price = sale price), so no strikethrough is shown.`);
  }
  return {
    slug,
    legacy_slug: slug !== p.slug ? p.slug : null,
    legacy_woo_id: p.id,
    name,
    category: categoryByName[p.categories[0]],
    summary: o.summary,
    description: o.description,
    specs: { form: o.form ?? "Lyophilized powder", purity: o.form ? null : "≥99% (HPLC)" },
    status: "active",
    featured_rank: o.featured ?? null,
    sort_order: i,
    // Every flag was reviewed and approved on 27 Oct 2026; kept here as a record only.
    review_flags: [],
    resolved_flags: flags,
    previous_description_claims: o.was,
    variants: outVariants,
  };
});

products.sort((a, b) => a.name.localeCompare(b.name, "en", { numeric: true }));
products.forEach((p, i) => (p.sort_order = i));

const catalog = {
  generated_from: ARCHIVE,
  settings: {
    store_name: "Phantom Bio Labs",
    currency: "USD",
    free_shipping_threshold_cents: 12500,
    flat_shipping_cents: 999,
    support_whatsapp: "+1 559 360 6568",
    support_hours: "Mon–Fri, 9am–6pm ET",
  },
  categories: CATEGORIES.map(([slug, name, description], i) => ({ slug, name, description, sort_order: i })),
  products,
};

mkdirSync("data", { recursive: true });
writeFileSync("data/catalog.json", JSON.stringify(catalog, null, 2) + "\n");
const v = products.flatMap((p) => p.variants);
console.log(`products ${products.length} (in stock ${products.filter((p) => p.variants.some((x) => x.in_stock)).length})`);
console.log(`sizes ${v.length} (in stock ${v.filter((x) => x.in_stock).length})`);
console.log(`resolved flags ${products.reduce((n, p) => n + p.resolved_flags.length, 0)} on ${products.filter((p) => p.resolved_flags.length).length} products`);
