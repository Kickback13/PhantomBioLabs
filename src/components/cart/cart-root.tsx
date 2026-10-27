import type { ReactNode } from "react";
import { getStoreSettings } from "@/lib/catalog";
import { CartProvider } from "./cart-context";
import { CartDrawer } from "./cart-drawer";

/** Wraps the page in the cart, with the shipping settings from Supabase (cached). */
export async function CartRoot({ children }: { children: ReactNode }) {
  const settings = await getStoreSettings();
  return (
    <CartProvider settings={settings}>
      {children}
      <CartDrawer />
    </CartProvider>
  );
}
