// Guides and research hubs. The SEO desk fills in each section's `body`; until every section of a
// page has a body (and the page needs no other sign-off), the page stays noindex and out of the
// sitemap, and its placeholders are hidden in production.
//
// Rules for anything written here (non-negotiable): no human or animal use or benefit, no dosing,
// injection or administration instructions, research-model wording only ("studied in ... research"),
// and every factual or regulatory statement backed by a citation in `citations` (PubMed/DOI, or a
// primary FDA/HHS source for regulatory pages). Never invent data, findings or citations.
import type { Citation } from "@/lib/compound-facts";
import { indexingAllowed } from "@/lib/seo";

export type GuideSection = {
  id: string;
  heading: string;
  /** Paragraphs of approved copy. Empty means the section is still waiting on its brief. */
  body: string[];
  /** What the SEO desk needs to write for this section. */
  brief: string;
  /** Adds a diagram slot after the section. */
  diagram?: string;
};

export type GuidePage = {
  kind: "guide" | "hub";
  path: string;
  /** Title without the brand suffix (≤ 41 characters so the full title stays ≤ 60). */
  title: string;
  /** Meta description, ≤ 155 characters. */
  description: string;
  eyebrow: string;
  /** YYYY-MM-DD, shown as "Last updated" and used in the sitemap. */
  updated: string;
  // TODO(SEO-DESK/KEANU): named author and reviewer for each page.
  author: string | null;
  reviewer: string | null;
  intro: { body: string[]; brief: string };
  sections: GuideSection[];
  citations: Citation[];
  /** Compounds linked from the page (catalog slugs). Hubs show them as cards. */
  compounds: string[];
  /** Extra sign-off before indexing, e.g. legal review of the regulatory explainer. */
  needsSignOff?: { label: string; done: boolean };
  /** Shown above the body (e.g. "Not legal advice"). */
  notice?: string;
};

export const guides: GuidePage[] = [
  {
    kind: "guide",
    path: "/guides/how-to-read-a-peptide-coa",
    title: "How to Read a Peptide COA",
    description:
      "A guide to reading a peptide Certificate of Analysis: HPLC vs LC-MS, purity vs net peptide content, endotoxin results, and verifying a COA with the lab.",
    eyebrow: "Guide · Testing",
    updated: "2026-11-02",
    author: null,
    reviewer: null,
    intro: { body: [], brief: "Intro: what a Certificate of Analysis is, who issues it, and why each lot has its own." },
    sections: [
      {
        id: "hplc-vs-lc-ms",
        heading: "HPLC vs LC-MS",
        body: [],
        brief: "What HPLC measures (purity by peak area) vs what LC-MS / mass spectrometry confirms (identity by mass), with sources.",
        diagram: "Annotated example HPLC chromatogram: main peak, impurity peaks, retention time, area %. Illustrative only, not a real lot.",
      },
      {
        id: "purity-vs-net-peptide",
        heading: "Purity vs net peptide content",
        body: [],
        brief: "Difference between HPLC purity and net peptide content (counter-ions, water, salts), with sources.",
      },
      { id: "endotoxin", heading: "Endotoxin testing", body: [], brief: "What an endotoxin (LAL) result on a COA means and its units, with sources." },
      {
        id: "verify-with-the-lab",
        heading: "Verifying a COA with the lab",
        body: [],
        brief: "How to match the lot number on the vial to the COA and confirm the report with the issuing lab. No lab named unless Keanu confirms it.",
      },
    ],
    citations: [],
    compounds: [],
  },
  {
    kind: "guide",
    path: "/guides/lab-handling-reconstitution-storage",
    title: "Lab Handling, Reconstitution & Storage",
    description:
      "Laboratory handling of lyophilized research peptides: in-vitro concentration math, bacteriostatic vs sterile water as solvents, and storage and stability.",
    eyebrow: "Guide · Lab handling",
    updated: "2026-11-02",
    author: null,
    reviewer: null,
    intro: { body: [], brief: "Intro: scope is in-vitro laboratory handling only. No human or animal dosing, syringes for human use, or injection sites." },
    sections: [
      {
        id: "concentration-math",
        heading: "Concentration math for in-vitro work",
        body: [],
        brief: "Worked example: peptide mass (mg) and solvent volume (mL) to stock concentration (mg/mL), then dilution to a working concentration for an assay.",
      },
      {
        id: "solvents",
        heading: "Bacteriostatic vs sterile water as solvents",
        body: [],
        brief: "Bacteriostatic water (0.9% benzyl alcohol) vs sterile water as laboratory solvents, and when each is used, with sources.",
      },
      { id: "storage", heading: "Storage and stability", body: [], brief: "Storage of sealed lyophilized vials and of reconstituted solutions (temperature, light, freeze-thaw), with sources." },
    ],
    citations: [],
    compounds: ["recon-water"],
  },
  {
    kind: "guide",
    path: "/guides/bpc-157-regulatory-status-2026",
    title: "BPC-157 Regulatory Status (2026)",
    description:
      "A neutral, sourced summary of BPC-157's U.S. regulatory status in 2026, quoting and linking primary FDA and HHS sources. Not legal advice.",
    eyebrow: "Explainer · Regulatory",
    updated: "2026-11-02",
    author: null,
    reviewer: null,
    notice:
      "This page summarizes public regulatory sources for general information. It is not legal advice. Every statement quotes and links a primary FDA or HHS source.",
    intro: { body: [], brief: "Intro: neutral scope statement and the date the sources were last checked." },
    sections: [
      {
        id: "current-status",
        heading: "Current status",
        body: [],
        brief: "Quote and link the primary FDA/HHS sources on BPC-157's status. No legal conclusion that isn't in the brief.",
      },
      {
        id: "compounding-503a",
        heading: "503A compounding",
        body: [],
        brief: "Anything about the 503A compounding rules and bulk-substance categories, quoting and linking the primary FDA source.",
      },
      { id: "research-use", heading: "Research-use supply", body: [], brief: "How research-use-only supply is described in the cited sources, quoted and linked." },
    ],
    citations: [],
    compounds: ["bpc-157"],
    needsSignOff: { label: "Legal review by Keanu's counsel", done: false },
  },
  {
    kind: "hub",
    path: "/research/cosmetic-peptide-research",
    title: "Cosmetic Peptide Research",
    description:
      "Research hub for peptides used in cosmetic-science and in-vitro dermal research: GHK-Cu, Snap-8 and GLOW, with citations. For laboratory research use only.",
    eyebrow: "Research hub",
    updated: "2026-11-02",
    author: null,
    reviewer: null,
    intro: { body: [], brief: "Intro to cosmetic-science and in-vitro dermal peptide research, research-model wording only, cited. No human benefit claims." },
    sections: [],
    citations: [],
    compounds: ["ghk-cu", "snap-8", "glow"],
  },
  {
    kind: "hub",
    path: "/research/recovery-and-gi-peptide-research",
    title: "Recovery & GI Peptide Research",
    description:
      "Research hub for peptides studied in preclinical tissue-repair and gastrointestinal models: BPC-157, TB-500 and KPV, with citations. Research use only.",
    eyebrow: "Research hub",
    updated: "2026-11-02",
    author: null,
    reviewer: null,
    intro: { body: [], brief: "Intro to preclinical tissue-repair and GI-model research on these peptides, research-model wording only, cited. No human benefit claims." },
    sections: [],
    citations: [],
    compounds: ["bpc-157", "tb-500", "kpv"],
  },
];

/** True when every slot has approved copy and any required sign-off is done. */
export function isGuideReady(page: GuidePage) {
  const filled = page.intro.body.length > 0 && page.sections.every((s) => s.body.length > 0);
  return filled && (page.needsSignOff?.done ?? true);
}

/** Unfinished pages are visible on previews (with their placeholders) but 404 in production. */
export function isGuideVisible(page: GuidePage) {
  return isGuideReady(page) || !indexingAllowed;
}

export function getGuide(path: string) {
  const page = guides.find((g) => g.path === path);
  if (!page) throw new Error(`Unknown guide: ${path}`);
  return page;
}
