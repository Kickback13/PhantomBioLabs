// Store-wide copy and links. Prices, stock and the shipping threshold live in Supabase.
export const site = {
  name: "Phantom Bio Labs",
  shortName: "Phantom",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.phantombiopeptides.com",
  tagline: "Research-grade peptides. Zero compromise.",
  description:
    "Research-grade peptides, independently HPLC-tested to ≥99% purity with a lot-specific Certificate of Analysis in every box. For laboratory research use only.",
  testingLab: "ISL Labs",
  contact: {
    whatsapp: "+1 559 360 6568",
    whatsappHref: "https://wa.me/15593606568",
    hours: "Mon–Fri, 9am–6pm ET",
  },
  compliance: {
    short: "For laboratory research use only. Not for human consumption.",
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
  "Same-day dispatch before 2pm ET",
  "Lot-specific COA in every box",
  "Discreet, unmarked packaging",
  "For laboratory research use only",
] as const;
