import type { ReactNode } from "react";
import { getStoreSettings } from "@/lib/catalog";
import { CartProvider } from "./cart-context";
import { CartDrawer } from "./cart-drawer";
import { WishlistProvider } from "@/components/wishlist/wishlist-context";

/** Wraps the page in the cart (with shipping settings from Supabase, cached) and the wishlist. */
export async function CartRoot({ children }: { children: ReactNode }) {
  const settings = await getStoreSettings();
  return (
    <CartProvider settings={settings}>
      <WishlistProvider>
        {children}
        <CartDrawer />
      </WishlistProvider>
    </CartProvider>
  );
}
