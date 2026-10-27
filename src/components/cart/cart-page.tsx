"use client";

import Link from "next/link";
import { ArrowRight, FlaskConical, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { useCart } from "./cart-context";
import { CartLines, FreeShippingMeter } from "./cart-lines";

export function CartPage() {
  const { lines, ready, subtotalCents, settings } = useCart();
  if (!ready) return <div className="h-64 animate-pulse rounded-2xl bg-surface" />;
  if (!lines.length) {
    return (
      <div className="flex flex-col items-center rounded-3xl border border-dashed border-line-strong py-20 text-center">
        <ShoppingBag className="size-8 text-violet-300" />
        <p className="mt-4 text-lg font-medium">Your cart is empty</p>
        <Button asChild className="mt-6">
          <Link href="/shop">
            Shop the catalog <ArrowRight />
          </Link>
        </Button>
      </div>
    );
  }
  const shipping = subtotalCents >= settings.freeShippingThresholdCents ? 0 : settings.flatShippingCents;
  return (
    <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
      <div className="rounded-3xl border border-line bg-surface p-5 sm:p-6">
        <CartLines />
      </div>
      <aside className="h-fit space-y-5 rounded-3xl border border-line bg-surface p-5 sm:p-6 lg:sticky lg:top-24">
        <FreeShippingMeter />
        <dl className="space-y-2 border-t border-line pt-5 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted">Subtotal</dt>
            <dd className="tabular-nums">{formatPrice(subtotalCents)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted">Standard shipping</dt>
            <dd className="tabular-nums">{shipping ? formatPrice(shipping) : "Free"}</dd>
          </div>
          <div className="flex justify-between border-t border-line pt-3 text-base font-semibold">
            <dt>Estimated total</dt>
            <dd className="tabular-nums">{formatPrice(subtotalCents + shipping)}</dd>
          </div>
        </dl>
        <Button asChild size="lg" className="w-full">
          <Link href="/checkout">
            Checkout <ArrowRight />
          </Link>
        </Button>
        <p className="flex items-center justify-center gap-1.5 text-[11px] text-subtle">
          <FlaskConical className="size-3" /> For laboratory research use only.
        </p>
      </aside>
    </div>
  );
}
