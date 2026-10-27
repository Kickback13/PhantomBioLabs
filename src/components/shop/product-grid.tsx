import { ProductCard } from "@/components/product/product-card";
import type { Product } from "@/lib/catalog";
import { cn } from "@/lib/utils";

/** Static product grid used by category pages, related products and the shop fallback. */
export function ProductGrid({ products, className, priorityCount = 4 }: { products: Product[]; className?: string; priorityCount?: number }) {
  return (
    <ul className={cn("grid grid-cols-1 gap-3 min-[460px]:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4", className)}>
      {products.map((p, i) => (
        <li key={p.id}>
          <ProductCard product={p} priority={i < priorityCount} />
        </li>
      ))}
    </ul>
  );
}
