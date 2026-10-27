"use client";

import Link from "next/link";
import { ArrowRight, FlaskConical, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Drawer } from "@/components/ui/drawer";
import { formatPrice } from "@/lib/utils";
import { useCart } from "./cart-context";
import { CartLines, FreeShippingMeter } from "./cart-lines";

export function CartDrawer() {
  const { open, setOpen, lines, count, subtotalCents } = useCart();
  const close = () => setOpen(false);
  return (
    <Drawer
      open={open}
      onOpenChange={setOpen}
      title={`Your cart${count ? ` (${count})` : ""}`}
      description={lines.length ? <FreeShippingMeter /> : undefined}
      footer={
        lines.length ? (
          <div className="space-y-3">
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-muted">Subtotal</span>
              <span className="text-xl font-semibold tracking-tight tabular-nums">{formatPrice(subtotalCents)}</span>
            </div>
            <p className="text-xs text-subtle">Shipping is calculated at checkout.</p>
            <Button asChild size="lg" className="w-full">
              <Link href="/checkout" onClick={close}>
                Checkout <ArrowRight />
              </Link>
            </Button>
            <Button asChild variant="ghost" size="sm" className="w-full">
              <Link href="/cart" onClick={close}>
                View full cart
              </Link>
            </Button>
            <p className="flex items-center justify-center gap-1.5 text-[11px] text-subtle">
              <FlaskConical className="size-3" /> For laboratory research use only.
            </p>
          </div>
        ) : null
      }
    >
      {lines.length ? (
        <CartLines onNavigate={close} />
      ) : (
        <div className="flex h-full flex-col items-center justify-center py-16 text-center">
          <div className="grid size-14 place-items-center rounded-2xl border border-line bg-surface text-violet-300">
            <ShoppingBag className="size-6" />
          </div>
          <p className="mt-5 font-medium">Your cart is empty</p>
          <p className="mt-1 text-sm text-muted">Browse lot-verified compounds and add them here.</p>
          <Button asChild className="mt-6">
            <Link href="/shop" onClick={close}>
              Shop the catalog <ArrowRight />
            </Link>
          </Button>
        </div>
      )}
    </Drawer>
  );
}
