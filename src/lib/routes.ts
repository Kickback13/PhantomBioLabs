// Public, indexable pages that aren't generated from the catalog. The sitemap reads this list.
// `updated` is the date the page's copy last changed (YYYY-MM-DD); bump it when you edit a page.

/** Copy dates for pages whose lastModified is otherwise driven by catalog data. */
export const copyUpdated = { home: "2026-11-02", coa: "2026-11-02" } as const;

export type StaticPage = { path: string; updated: string };

export const staticPages: StaticPage[] = [
  { path: "/about", updated: "2026-11-02" },
  { path: "/quality", updated: "2026-11-02" },
  { path: "/faq", updated: "2026-11-02" },
  { path: "/contact", updated: "2026-10-27" },
  { path: "/shipping", updated: "2026-11-02" },
  { path: "/terms", updated: "2026-10-27" },
  { path: "/privacy", updated: "2026-10-27" },
  { path: "/research-use", updated: "2026-10-27" },
];

/** Never in the sitemap and disallowed in robots.txt. */
export const privatePaths = ["/cart", "/checkout", "/account", "/admin", "/api", "/search"] as const;
