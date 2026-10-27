"use client";

import Link from "next/link";
import { Trash2 } from "lucide-react";
import { ProductImage } from "@/components/product/product-image";
import { QuantityStepper } from "@/components/ui/quantity-stepper";
import { formatPrice } from "@/lib/utils";
import { MAX_LINE_QUANTITY, useCart } from "./cart-context";

/** The list of cart lines, shared by the drawer and the cart page. */
export function CartLines({ onNavigate }: { onNavigate?: () => void }) {
  const { lines, setQuantity, remove } = useCart();
  return (
    <ul className="divide-y divide-line">
      {lines.map((line) => (
        <li key={line.variantId} className="flex gap-4 py-4 first:pt-0">
          <Link
            href={`/product/${line.slug}`}
            onClick={onNavigate}
            className="w-20 shrink-0 overflow-hidden rounded-xl border border-line bg-ink-850"
            aria-label={`${line.name} ${line.label}`}
          >
            <ProductImage slug={line.slug} name={line.name} size={line.label} sizes="80px" showTag={false} />
          </Link>
          <div className="flex min-w-0 flex-1 flex-col">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <Link href={`/product/${line.slug}`} onClick={onNavigate} className="block truncate font-medium tracking-tight hover:text-violet-300">
                  {line.name}
                </Link>
                <p className="mt-0.5 font-mono text-[11px] tracking-wide text-muted">{line.label}</p>
              </div>
              <p className="text-right text-sm font-medium tabular-nums">{formatPrice(line.priceCents * line.quantity)}</p>
            </div>
            <div className="mt-auto flex items-center justify-between pt-3">
              <QuantityStepper
                size="sm"
                value={line.quantity}
                max={MAX_LINE_QUANTITY}
                onValueChange={(q) => setQuantity(line.variantId, q)}
                label={`Quantity of ${line.name} ${line.label}`}
              />
              <button
                type="button"
                onClick={() => remove(line.variantId)}
                className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs text-subtle transition-colors hover:bg-white/5 hover:text-danger"
              >
                <Trash2 className="size-3.5" /> Remove
              </button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

/** Progress toward free shipping, from the store setting. */
export function FreeShippingMeter() {
  const { subtotalCents, settings } = useCart();
  const remaining = settings.freeShippingThresholdCents - subtotalCents;
  const pct = Math.min(100, (subtotalCents / settings.freeShippingThresholdCents) * 100);
  return (
    <div>
      <p className="text-[13px]">
        {remaining > 0 ? (
          <>
            Add <span className="font-semibold text-violet-300">{formatPrice(remaining)}</span> for free U.S. shipping
          </>
        ) : (
          <span className="text-violet-200">You&apos;ve unlocked free U.S. shipping</span>
        )}
      </p>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/8">
        <div className="h-full rounded-full bg-gradient-to-r from-violet-600 to-violet-300 transition-[width] duration-500 ease-out" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
