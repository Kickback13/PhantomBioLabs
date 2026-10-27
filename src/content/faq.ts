// Shared by the home page preview and the FAQ page. Answers come from the old site, tightened.
export type FaqItem = { topic: "Orders" | "Shipping" | "Quality" | "Compliance" | "Handling"; q: string; a: string };

export const faq: FaqItem[] = [
  {
    topic: "Quality",
    q: "Are your peptides tested for purity?",
    a: "Yes. Every lot is tested by HPLC at ISL Labs, an independent laboratory, to a minimum of 99% purity before release. A lot-specific Certificate of Analysis ships with every order, and published COAs are in the COA library.",
  },
  {
    topic: "Compliance",
    q: "Are these products intended for human use?",
    a: "No. All compounds sold by Phantom Bio Labs are supplied strictly for in-vitro laboratory research and analytical use. They are not for human or animal consumption, and not for therapeutic, diagnostic or veterinary use.",
  },
  {
    topic: "Shipping",
    q: "How are orders shipped?",
    a: "Orders placed before 2pm ET on business days ship the same day; later orders ship the next business day. Domestic orders go by USPS Priority or UPS Ground, with 2-day and overnight options at checkout, in discreet, unmarked packaging.",
  },
  {
    topic: "Orders",
    q: "What's your return policy?",
    a: "Because these are research materials, opened products can't be returned. Damaged shipments and defective products are replaced at no charge. Contact us within 7 days of delivery.",
  },
  {
    topic: "Shipping",
    q: "Do you ship internationally?",
    a: "We ship to most countries where receipt of research chemicals is legally permitted. Customs duties, delays and destination restrictions are the recipient's responsibility.",
  },
  {
    topic: "Handling",
    q: "How should peptides be stored?",
    a: "Sealed lyophilized peptides are typically stable at 2–8°C for up to 24 months. Once reconstituted, keep solutions at 2–8°C and use within 30 days, or aliquot and freeze at −20°C.",
  },
  {
    topic: "Orders",
    q: "Can I get bulk or institutional pricing?",
    a: "Yes. Message us with your institution and the quantities you need, and we'll quote tiered pricing.",
  },
  {
    topic: "Orders",
    q: "What payment methods do you accept?",
    a: "Available payment methods are shown at checkout.",
  },
];
