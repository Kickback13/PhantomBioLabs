"use client";

import { AnimatePresence, motion } from "motion/react";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Check, FileCheck2, FlaskConical, PackageCheck, ShieldCheck } from "lucide-react";
import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { QuantityStepper } from "@/components/ui/quantity-stepper";
import { Spotlight } from "@/components/ui/spotlight";
import { WishlistButton } from "@/components/wishlist/wishlist-button";
import type { Product } from "@/lib/catalog";
import { cn, discountPercent, formatPrice, sizeSlug } from "@/lib/utils";
import { MAX_LINE_QUANTITY } from "@/components/cart/cart-context";
import { ProductImage } from "./product-image";
import { StockBadge } from "./stock-badge";

/** Reads ?size= from the URL. Rendered inside <Suspense>; the fallback is ProductPurchase with the default size. */
export function ProductPurchaseFromUrl({ product }: { product: Product }) {
  const params = useSearchParams();
  return <ProductPurchase product={product} initialSize={params.get("size")} />;
}

export function ProductPurchase({ product, initialSize }: { product: Product; initialSize?: string | null }) {
  const fallback = product.variants.find((v) => v.inStock) ?? product.variants[0];
  const fromUrl = initialSize ? product.variants.find((v) => sizeSlug(v.label) === initialSize) : undefined;
  const [variantId, setVariantId] = useState((fromUrl ?? fallback).id);
  const [quantity, setQuantity] = useState(1);
  const variant = product.variants.find((v) => v.id === variantId) ?? fallback;
  const off = discountPercent(variant.priceCents, variant.compareAtCents);

  // Sticky buy bar on phones once the main button scrolls away.
  const buyRef = useRef<HTMLDivElement>(null);
  const [showBar, setShowBar] = useState(false);
  useEffect(() => {
    let frame = 0;
    const check = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const node = buyRef.current;
        if (node) setShowBar(node.getBoundingClientRect().bottom < 0);
      });
    };
    window.addEventListener("scroll", check, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", check);
    };
  }, []);

  function choose(id: string) {
    setVariantId(id);
    const v = product.variants.find((x) => x.id === id);
    if (v) window.history.replaceState(null, "", `?size=${sizeSlug(v.label)}`);
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
      {/* Gallery */}
      <div className="lg:sticky lg:top-24 lg:self-start">
        <Spotlight className="overflow-hidden rounded-3xl border border-line bg-ink-900" size={520} intensity={18}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={variant.id} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.3 }}>
              <ProductImage slug={product.slug} name={product.name} size={variant.label} priority sizes="(min-width: 1024px) 50vw, 100vw" />
            </motion.div>
          </AnimatePresence>
          <div className="absolute top-4 left-4">
            <StockBadge inStock={variant.inStock} />
          </div>
          {off ? (
            <span className="absolute top-4 right-4 rounded-full bg-violet-500 px-2.5 py-1 font-mono text-[11px] font-medium text-white">−{off}%</span>
          ) : null}
        </Spotlight>
        {product.variants.length > 1 && (
          <div className="mt-3 grid grid-cols-4 gap-3 sm:grid-cols-5">
            {product.variants.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => choose(v.id)}
                aria-label={`Show ${v.label}`}
                className={cn(
                  "overflow-hidden rounded-xl border bg-ink-900 transition-colors",
                  v.id === variant.id ? "border-violet-400" : "border-line hover:border-line-strong",
                )}
              >
                <ProductImage slug={product.slug} name={product.name} size={v.label} sizes="120px" showTag={false} />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Details */}
      <div>
        {product.category && <p className="eyebrow">{product.category.name}</p>}
        <h1 className="mt-3 text-4xl leading-[0.98] font-semibold tracking-[-0.04em] sm:text-5xl">{product.name}</h1>
        {product.summary && <p className="mt-3 text-[15px] text-muted">{product.summary}</p>}

        <div className="mt-6 flex items-end gap-3">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={variant.priceCents}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -10, opacity: 0 }}
              className="text-4xl font-semibold tracking-tight tabular-nums"
            >
              {formatPrice(variant.priceCents)}
            </motion.span>
          </AnimatePresence>
          {variant.compareAtCents ? <span className="pb-1 text-lg text-subtle tabular-nums line-through">{formatPrice(variant.compareAtCents)}</span> : null}
          {off ? <span className="mb-1.5 rounded-full border border-violet-400/40 px-2 py-0.5 font-mono text-[10px] text-violet-200">SAVE {off}%</span> : null}
        </div>

        <fieldset className="mt-8">
          <legend className="eyebrow">Size</legend>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {product.variants.map((v) => {
              const active = v.id === variant.id;
              return (
                <label
                  key={v.id}
                  className={cn(
                    "relative flex cursor-pointer flex-col rounded-xl border px-4 py-3 transition-colors",
                    active ? "border-violet-400 bg-violet-500/10" : "border-line hover:border-line-strong",
                  )}
                >
                  <input type="radio" name="size" value={v.id} checked={active} onChange={() => choose(v.id)} className="sr-only" />
                  <span className="flex items-center justify-between font-mono text-sm">
                    {v.label}
                    {active && <Check className="size-3.5 text-violet-300" />}
                  </span>
                  <span className="mt-1 text-[13px] tabular-nums text-muted">{formatPrice(v.priceCents)}</span>
                  <span className={cn("mt-1 font-mono text-[10px] tracking-wider uppercase", v.inStock ? "text-violet-300" : "text-subtle")}>
                    {v.inStock ? "In stock" : "Out of stock"}
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>

        <div ref={buyRef} className="mt-6 flex flex-wrap items-center gap-3">
          {variant.inStock && <QuantityStepper value={quantity} onValueChange={setQuantity} max={MAX_LINE_QUANTITY} />}
          <AddToCartButton product={product} variant={variant} quantity={quantity} size="lg" label="Add to cart" className="h-13 min-w-0 flex-1" />
          <WishlistButton productId={product.id} name={product.name} />
        </div>
        {!variant.inStock && (
          <p className="mt-3 text-sm text-muted">
            This size is out of stock. Message us on WhatsApp to be told when the next lot is released.
          </p>
        )}

        <ul className="mt-8 grid gap-3 border-y border-line py-6 text-sm sm:grid-cols-2">
          {[
            { icon: ShieldCheck, text: "≥99% purity, HPLC-tested by an independent lab" },
            { icon: FileCheck2, text: "Lot-specific COA in every box" },
            { icon: PackageCheck, text: "Same-day dispatch before 2pm ET" },
            { icon: Check, text: "Discreet, unmarked packaging" },
          ].map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-start gap-3">
              <Icon className="mt-0.5 size-4 shrink-0 text-violet-300" />
              <span className="text-ink-200">{text}</span>
            </li>
          ))}
        </ul>

        <div className="mt-6 flex gap-3 rounded-xl border border-violet-400/25 bg-violet-500/[0.06] p-4">
          <FlaskConical className="mt-0.5 size-4 shrink-0 text-violet-300" />
          <p className="text-[13px] leading-relaxed text-ink-200">
            <span className="font-semibold text-foreground">For laboratory research use only. Not for human consumption.</span> Not for use in humans or
            animals, and not intended to diagnose, treat, cure or prevent any disease. Sold to qualified researchers aged 21+.
          </p>
        </div>
      </div>

      {/* Phone buy bar */}
      <AnimatePresence>
        {showBar && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            transition={{ type: "spring", stiffness: 300, damping: 32 }}
            className="fixed inset-x-0 bottom-0 z-40 border-t border-line-strong bg-ink-900/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-xl lg:hidden"
          >
            <div className="flex items-center gap-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {product.name} · <span className="font-mono text-xs text-muted">{variant.label}</span>
                </p>
                <p className="text-sm font-semibold tabular-nums">{formatPrice(variant.priceCents * quantity)}</p>
              </div>
              <AddToCartButton product={product} variant={variant} quantity={quantity} size="md" label="Add" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
