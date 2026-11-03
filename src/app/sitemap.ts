import type { MetadataRoute } from "next";
import { getCategories, getCoas, getProducts } from "@/lib/catalog";
import { guides, isGuideReady } from "@/content/guides";
import { coaPath } from "@/lib/coa";
import { copyUpdated, staticPages } from "@/lib/routes";
import { absoluteUrl } from "@/lib/seo";

/** Newest of the given dates, as an ISO string (or the plain YYYY-MM-DD it came as). */
const latest = (dates: string[]) => {
  const newest = dates.filter(Boolean).sort().at(-1);
  return newest && newest.length > 10 ? new Date(newest).toISOString() : newest;
};

// Home, shop, categories, products, the COA library and lot pages, finished guides and info pages. Cart, checkout and account
// pages are left out. lastModified comes from the catalog rows and the dates in src/lib/routes.ts.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories, coas] = await Promise.all([getProducts(), getCategories(), getCoas()]);
  const catalogUpdated = latest(products.map((p) => p.updatedAt));

  return [
    { url: absoluteUrl("/"), lastModified: latest([catalogUpdated ?? "", copyUpdated.home]), changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/shop"), lastModified: catalogUpdated, changeFrequency: "weekly", priority: 0.9 },
    ...categories.map((c) => ({
      url: absoluteUrl(`/category/${c.slug}`),
      lastModified: latest([c.updatedAt]),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...products.map((p) => ({
      url: absoluteUrl(`/product/${p.slug}`),
      lastModified: latest([p.updatedAt, ...coas.filter((c) => c.productSlug === p.slug).map((c) => c.updatedAt)]),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    { url: absoluteUrl("/coa"), lastModified: latest([...coas.map((c) => c.updatedAt), copyUpdated.coa]), changeFrequency: "weekly", priority: 0.7 },
    ...coas.map((c) => ({ url: absoluteUrl(coaPath(c)), lastModified: latest([c.updatedAt]), changeFrequency: "yearly" as const, priority: 0.5 })),
    // Guides and research hubs appear only once their copy is filled in (until then they're noindex).
    ...guides.filter(isGuideReady).map((g) => ({ url: absoluteUrl(g.path), lastModified: g.updated, changeFrequency: "monthly" as const, priority: 0.6 })),
    ...staticPages.map((page) => ({ url: absoluteUrl(page.path), lastModified: page.updated, changeFrequency: "monthly" as const, priority: 0.5 })),
  ];
}
