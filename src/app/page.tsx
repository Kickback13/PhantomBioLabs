import type { Metadata } from "next";
import { CoaCallout } from "@/components/home/coa-callout";
import { Comparison } from "@/components/home/comparison";
import { CtaBand } from "@/components/home/cta-band";
import { FaqPreview } from "@/components/home/faq-preview";
import { FeaturedProducts } from "@/components/home/featured-products";
import { Hero } from "@/components/home/hero";
import { PhantomStandard } from "@/components/home/phantom-standard";
import { ResearchAreas } from "@/components/home/research-areas";
import { pageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: `Third-Party Tested Research Peptides | ${site.name}`,
  absoluteTitle: true,
  description: site.description,
  path: "/",
});

export default function HomePage() {
  return (
    <>
      <Hero />
      <ResearchAreas />
      <FeaturedProducts />
      <PhantomStandard />
      <CoaCallout />
      <Comparison />
      <FaqPreview />
      <CtaBand />
    </>
  );
}
