import { ogCard } from "@/lib/og-card";

// Default share card for every page without its own (see pageMetadata in src/lib/seo.ts).
export function GET() {
  return ogCard({ eyebrow: "Research peptides", title: "Third-party tested, lot-specific COA" });
}
