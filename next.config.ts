import type { NextConfig } from "next";
import catalog from "./data/catalog.json";

const CANONICAL_HOST = "www.phantombiopeptides.com";
const APEX_HOST = "phantombiopeptides.com";

// Old URLs whose slug changed in the rebuild. Product renames come from data/catalog.json
// (`legacy_slug`); the old "supplies" category is now "solvents-and-supplies".
// Slugs changed later in the admin area are also handled at runtime by the product page.
const renamed: { source: string; destination: string }[] = [
  ...catalog.products
    .filter((p) => p.legacy_slug)
    .map((p) => ({ source: `/product/${p.legacy_slug}`, destination: `/product/${p.slug}` })),
  { source: "/category/supplies", destination: "/category/solvents-and-supplies" },
];

const apex = [{ type: "host" as const, value: APEX_HOST }];

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
  // Order matters: the first match wins. Every old apex URL reaches its final www URL in one hop.
  // This only works if the apex domain is attached to the project WITHOUT a Vercel domain-level
  // redirect (see docs/cutover-checklist.md). Vercel itself sends http:// to https:// first.
  async redirects() {
    return [
      // 1. Apex + renamed slug -> www + new slug, directly.
      ...renamed.map((r) => ({ source: r.source, has: apex, destination: `https://${CANONICAL_HOST}${r.destination}`, permanent: true })),
      // 2. Any other apex URL -> same path on www.
      { source: "/:path*", has: apex, destination: `https://${CANONICAL_HOST}/:path*`, permanent: true },
      // 3. Renamed slug on www (or a preview host) -> new slug.
      ...renamed.map((r) => ({ ...r, permanent: true })),
    ];
  },
  async headers() {
    return [
      {
        // The *.vercel.app copies of the store must never be indexed, even after launch.
        source: "/:path*",
        has: [{ type: "host", value: ".*\\.vercel\\.app" }],
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
};

export default nextConfig;
