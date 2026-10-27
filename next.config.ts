import type { NextConfig } from "next";
import catalog from "./data/catalog.json";

// Old product URLs that changed during the rebuild redirect permanently to the new ones.
// Slugs changed later in the admin area are also handled at runtime by the product page.
const legacyProductRedirects = catalog.products
  .filter((p) => p.legacy_slug)
  .map((p) => ({ source: `/product/${p.legacy_slug}`, destination: `/product/${p.slug}`, permanent: true }));

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  images: {
    remotePatterns: [new URL("https://evashoufuzbtkpsloyof.supabase.co/storage/v1/object/public/**")],
  },
  async redirects() {
    return legacyProductRedirects;
  },
};

export default nextConfig;
