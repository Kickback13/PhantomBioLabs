import type { MetadataRoute } from "next";
import { privatePaths } from "@/lib/routes";
import { absoluteUrl, indexingAllowed } from "@/lib/seo";

// Blocks all crawlers until launch day (NEXT_PUBLIC_ALLOW_INDEXING=true in Vercel).
export default function robots(): MetadataRoute.Robots {
  if (!indexingAllowed) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  return {
    rules: { userAgent: "*", allow: "/", disallow: [...privatePaths] },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
