"use client";

import { AnimatePresence, motion } from "motion/react";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { PackageSearch } from "lucide-react";
import { ProductCard } from "@/components/product/product-card";
import { BeamSearch } from "@/components/ui/beam-search";
import type { Category, Product } from "@/lib/catalog";
import { cn } from "@/lib/utils";

type Sort = "featured" | "price-asc" | "price-desc" | "name";
const SORTS: { id: Sort; label: string }[] = [
  { id: "featured", label: "Featured" },
  { id: "price-asc", label: "Price: low to high" },
  { id: "price-desc", label: "Price: high to low" },
  { id: "name", label: "Name A–Z" },
];

const minPrice = (p: Product) => Math.min(...p.variants.map((v) => v.priceCents));

/** Shop filters: search, category chips, in-stock toggle and sort. State is mirrored in the URL. */
export function ShopBrowser({ products, categories }: { products: Product[]; categories: Category[] }) {
  const params = useSearchParams();
  const [query, setQuery] = useState(params.get("q") ?? "");
  const [category, setCategory] = useState(params.get("category") ?? "all");
  const [inStockOnly, setInStockOnly] = useState(params.get("instock") === "1");
  const [sort, setSort] = useState<Sort>((SORTS.find((s) => s.id === params.get("sort"))?.id ?? "featured") as Sort);

  // Keep the address bar shareable without a navigation.
  useEffect(() => {
    const next = new URLSearchParams();
    if (query.trim()) next.set("q", query.trim());
    if (category !== "all") next.set("category", category);
    if (inStockOnly) next.set("instock", "1");
    if (sort !== "featured") next.set("sort", sort);
    const qs = next.toString();
    window.history.replaceState(null, "", qs ? `?${qs}` : window.location.pathname);
  }, [query, category, inStockOnly, sort]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = products.filter((p) => {
      if (category !== "all" && p.category?.slug !== category) return false;
      if (inStockOnly && !p.inStock) return false;
      if (!q) return true;
      return [p.name, p.summary, p.category?.name, ...p.variants.map((v) => v.label)].some((s) => s?.toLowerCase().includes(q));
    });
    return list.sort((a, b) => {
      if (sort === "price-asc") return minPrice(a) - minPrice(b);
      if (sort === "price-desc") return minPrice(b) - minPrice(a);
      if (sort === "name") return a.name.localeCompare(b.name, "en", { numeric: true });
      // Featured: ranked items, then in stock, then name.
      const ra = a.featuredRank ?? 999;
      const rb = b.featuredRank ?? 999;
      if (ra !== rb) return ra - rb;
      if (a.inStock !== b.inStock) return a.inStock ? -1 : 1;
      return a.name.localeCompare(b.name, "en", { numeric: true });
    });
  }, [products, query, category, inStockOnly, sort]);

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of products) if (p.category) map.set(p.category.slug, (map.get(p.category.slug) ?? 0) + 1);
    return map;
  }, [products]);

  return (
    <div>
      <div className="sticky top-16 z-20 -mx-4 border-b border-line bg-ink-950/85 px-4 py-4 backdrop-blur-xl sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <BeamSearch value={query} onChange={setQuery} placeholder="Search compounds, sizes or research areas…" className="lg:max-w-md" label="Search the catalog" />
          <div className="flex items-center gap-2 lg:ml-auto">
            <label className="flex h-12 cursor-pointer items-center gap-3 rounded-xl border border-line-strong bg-ink-950 px-3.5 text-sm select-none">
              <span className="relative inline-flex">
                <input type="checkbox" checked={inStockOnly} onChange={(e) => setInStockOnly(e.target.checked)} className="peer sr-only" />
                <span className="h-5 w-9 rounded-full bg-ink-700 transition-colors peer-checked:bg-violet-500 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-violet-400" />
                <span className="absolute top-0.5 left-0.5 size-4 rounded-full bg-white shadow transition-transform peer-checked:translate-x-4" />
              </span>
              In stock only
            </label>
            <label className="relative flex h-12 min-w-0 flex-1 items-center rounded-xl border border-line-strong bg-ink-950 text-sm lg:flex-none">
              <span className="sr-only">Sort by</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as Sort)}
                className="h-full w-full appearance-none bg-transparent pr-9 pl-3.5 text-foreground outline-none [&>option]:bg-ink-900"
              >
                {SORTS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
              <span aria-hidden className="pointer-events-none absolute right-3.5 text-subtle">
                ▾
              </span>
            </label>
          </div>
        </div>
        <div role="radiogroup" aria-label="Research area" className="mt-3 -mb-1 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {[{ slug: "all", name: "All", productCount: products.length }, ...categories.map((c) => ({ ...c, productCount: counts.get(c.slug) ?? 0 }))].map((c) => {
            const active = category === c.slug;
            return (
              <button
                key={c.slug}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setCategory(c.slug)}
                className={cn(
                  "relative flex h-9 shrink-0 items-center gap-2 rounded-full border px-3.5 text-[13px] transition-colors",
                  active ? "border-violet-400/70 text-foreground" : "border-line text-muted hover:border-line-strong hover:text-foreground",
                )}
              >
                {active && (
                  <motion.span layoutId="shop-chip" className="absolute inset-0 rounded-full bg-violet-500/15" transition={{ type: "spring", bounce: 0.15, duration: 0.4 }} />
                )}
                <span className="relative">{c.name}</span>
                <span className="relative font-mono text-[10px] text-subtle">{c.productCount}</span>
              </button>
            );
          })}
        </div>
      </div>

      <p className="mt-6 font-mono text-[11px] tracking-[0.14em] text-muted uppercase" aria-live="polite">
        {visible.length} {visible.length === 1 ? "compound" : "compounds"}
      </p>

      {visible.length ? (
        <motion.ul layout className="mt-4 grid grid-cols-1 gap-3 min-[460px]:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
          <AnimatePresence mode="popLayout" initial={false}>
            {visible.map((p, i) => (
              <motion.li
                key={p.id}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              >
                <ProductCard product={p} priority={i < 4} />
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
      ) : (
        <div className="mt-6 flex flex-col items-center rounded-2xl border border-dashed border-line-strong py-20 text-center">
          <PackageSearch className="size-8 text-violet-300" />
          <p className="mt-4 font-medium">No compounds match those filters</p>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setCategory("all");
              setInStockOnly(false);
            }}
            className="mt-3 text-sm text-violet-300 underline-offset-4 hover:underline"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
