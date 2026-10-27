"use client";

import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Product, Variant } from "@/lib/catalog";
import { cn } from "@/lib/utils";
import { useCart } from "./cart-context";

export function AddToCartButton({
  product,
  variant,
  quantity = 1,
  size = "sm",
  label = "Add",
  className,
}: {
  product: Pick<Product, "slug" | "name">;
  variant: Variant;
  quantity?: number;
  size?: "sm" | "md" | "lg";
  label?: string;
  className?: string;
}) {
  const { add } = useCart();
  if (!variant.inStock) {
    return (
      <Button size={size} variant="outline" disabled className={className}>
        Out of stock
      </Button>
    );
  }
  return (
    <Button
      size={size}
      className={cn("relative z-10", className)}
      aria-label={`Add ${product.name} ${variant.label} to cart`}
      onClick={() =>
        add(
          {
            variantId: variant.id,
            slug: product.slug,
            name: product.name,
            label: variant.label,
            priceCents: variant.priceCents,
            compareAtCents: variant.compareAtCents,
          },
          quantity,
        )
      }
    >
      <ShoppingBag /> {label}
    </Button>
  );
}
