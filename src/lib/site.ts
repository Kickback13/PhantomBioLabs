// Store-wide copy and links. Prices, stock and the shipping threshold live in Supabase.

/**
 * Support hours and the same-day dispatch cutoff, in one place. These are the old site's values.
 * TODO(SEO-DESK/KEANU): confirm ET or PT. Switching every page is a one-line change to `timezone`.
 */
const timezone = "ET";
export const hours = {
  timezone,
  support: `Mon–Fri, 9am–6pm ${timezone}`,
  /** Orders placed before this time on a business day ship the same day. */
  shipCutoff: `2pm ${timezone}`,
} as const;

/** Production origin. Canonicals, the sitemap, robots.txt, Open Graph and schema all use this host. */
export const SITE_ORIGIN = "https://www.phantombiopeptides.com";

export const site = {
  name: "Phantom Bio Labs",
  /** Legal entity behind the brand. Use only where a legal name belongs (copyright, terms, schema). */
  legalName: "Phantom Labs Bio LLC",
  shortName: "Phantom",
  url: SITE_ORIGIN,
  tagline: "Research-grade peptides. Zero compromise.",
  description:
    "Research peptides independently HPLC-tested to ≥99% purity, with a lot-specific Certificate of Analysis in every box. For laboratory research use only.",
  contact: {
    whatsapp: "+1 559 360 6568",
    /** E.164 form of the same number, for schema.org. */
    telephone: "+1-559-360-6568",
    whatsappHref: "https://wa.me/15593606568",
    hours: hours.support,
  },
  /**
   * City-level location only; there is no public street address.
   * TODO(SEO-DESK/KEANU): San Diego, CA comes from the launch brief. Confirm before launch.
   */
  address: { locality: "San Diego", region: "CA", country: "US" },
  dispatch: {
    sameDay: `Same-day dispatch before ${hours.shipCutoff}`,
    cutoff: hours.shipCutoff,
  },
  compliance: {
    short: "For laboratory research use only. Not for human consumption.",
    /** Shown on every product page and in the footer. */
    ruo: "For laboratory research use only. Not for human or animal consumption. Not intended to diagnose, treat, cure, or prevent any disease. These statements have not been evaluated by the FDA.",
    fda:
      "The statements on this website have not been evaluated by the U.S. Food and Drug Administration. Products sold by Phantom Bio Labs are not intended to diagnose, treat, cure, or prevent any disease. All compounds are supplied strictly for in-vitro laboratory research and analytical use by qualified researchers aged 21 or older.",
  },
} as const;

export const mainNav = [
  { href: "/shop", label: "Shop" },
  { href: "/quality", label: "Quality & Testing" },
  { href: "/coa", label: "COA Library" },
  { href: "/about", label: "About" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
] as const;

export const footerNav = {
  Company: [
    { href: "/about", label: "About" },
    { href: "/quality", label: "Quality & Testing" },
    { href: "/coa", label: "COA Library" },
    { href: "/contact", label: "Contact" },
  ],
  Support: [
    { href: "/faq", label: "FAQ" },
    { href: "/shipping", label: "Shipping & Returns" },
    { href: "/account", label: "Your account" },
  ],
  Legal: [
    { href: "/terms", label: "Terms of Service" },
    { href: "/privacy", label: "Privacy Policy" },
    { href: "/research-use", label: "Research Use Policy" },
  ],
} as const;

export const trustPoints = [
  "Free U.S. shipping over $125",
  "Third-party HPLC tested",
  site.dispatch.sameDay,
  "Lot-specific COA in every box",
  "Discreet, unmarked packaging",
  "For laboratory research use only",
] as const;
