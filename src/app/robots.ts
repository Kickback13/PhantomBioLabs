import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

// Blocks all crawlers until launch day (NEXT_PUBLIC_ALLOW_INDEXING=true in Vercel).
export default function robots(): MetadataRoute.Robots {
  if (process.env.NEXT_PUBLIC_ALLOW_INDEXING !== "true") {
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/account", "/admin", "/cart", "/checkout"] },
    host: site.url,
  };
}
