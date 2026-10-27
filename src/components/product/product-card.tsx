"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { useState } from "react";
import { Spotlight } from "@/components/ui/spotlight";
import { Button } from "@/components/ui/button";
import type { Product } from "@/lib/catalog";
import { cn, discountPercent, formatPrice, sizeSlug } from "@/lib/utils";
import { ProductImage } from "./product-image";
import { StockBadge } from "./stock-badge";

export function ProductCard({ product, priority = false, className }: { product: Product; priority?: boolean; className?: string }) {
  const initial = product.variants.find((v) => v.inStock) ?? product.variants[0];
  const [variantId, setVariantId] = useState(initial?.id);
  const variant = product.variants.find((v) => v.id === variantId) ?? initial;
  if (!variant) return null;

  const off = discountPercent(variant.priceCents, variant.compareAtCents);
  const href = `/product/${product.slug}?size=${sizeSlug(variant.label)}`;

  return (
    <Spotlight
      className={cn(
        "flex h-full flex-col rounded-[var(--radius-card)] border border-line bg-surface transition-colors duration-300 hover:border-line-strong",
        className,
      )}
    >
      <article className="flex h-full flex-col">
        <Link href={href} prefetch className="relative block overflow-hidden rounded-t-[var(--radius-card)] bg-ink-850" aria-label={`${product.name}, ${variant.label}`}>
          <ProductImage
            slug={product.slug}
            name={product.name}
            size={variant.label}
            priority={priority}
            className="transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover/spotlight:scale-[1.04]"
          />
          <div className="absolute top-3 left-3">
            <StockBadge inStock={variant.inStock} />
          </div>
          {off ? (
            <span className="absolute top-3 right-3 rounded-full bg-violet-500 px-2 py-0.5 font-mono text-[10px] font-medium tracking-wider text-white">
              −{off}%
            </span>
          ) : null}
        </Link>

        <div className="flex flex-1 flex-col p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              {product.category && <p className="eyebrow truncate !text-[10px]">{product.category.name}</p>}
              <h3 className="mt-1.5 text-[17px] leading-tight font-semibold tracking-tight">
                <Link href={href} className="after:absolute-none hover:text-violet-300">
                  {product.name}
                </Link>
              </h3>
            </div>
            <ArrowUpRight className="mt-5 size-4 shrink-0 text-subtle transition-colors group-hover/spotlight:text-violet-300" />
          </div>
          {product.summary && <p className="mt-1.5 line-clamp-1 text-[13px] text-muted">{product.summary}</p>}

          {product.variants.length > 1 ? (
            <div role="radiogroup" aria-label="Size" className="mt-4 flex flex-wrap gap-1.5">
              {product.variants.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  role="radio"
                  aria-checked={v.id === variant.id}
                  onClick={() => setVariantId(v.id)}
                  className={cn(
                    "h-8 rounded-lg border px-2.5 font-mono text-[11px] tracking-wide transition-colors",
                    v.id === variant.id
                      ? "border-violet-400 bg-violet-500/15 text-foreground"
                      : "border-line text-muted hover:border-line-strong hover:text-foreground",
                    !v.inStock && "line-through decoration-ink-400/70",
                  )}
                >
                  {v.label}
                </button>
              ))}
            </div>
          ) : (
            <p className="mt-4 inline-flex h-8 w-fit items-center rounded-lg border border-line px-2.5 font-mono text-[11px] tracking-wide text-muted">
              {variant.label}
            </p>
          )}

          <div className="mt-auto flex items-end justify-between gap-3 pt-5">
            <p className="flex items-baseline gap-2">
              <span className="text-xl font-semibold tracking-tight tabular-nums">{formatPrice(variant.priceCents)}</span>
              {variant.compareAtCents ? (
                <span className="text-sm text-subtle tabular-nums line-through">{formatPrice(variant.compareAtCents)}</span>
              ) : null}
            </p>
            {variant.inStock ? (
              <AddToCartButton product={product} variant={variant} />
            ) : (
              <Button asChild size="sm" variant="outline" className="relative z-10">
                <Link href={href}>View</Link>
              </Button>
            )}
          </div>
        </div>
      </article>
    </Spotlight>
  );
}
