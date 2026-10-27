import type { Metadata } from "next";
import { CartPage } from "@/components/cart/cart-page";

export const metadata: Metadata = { title: "Your cart", robots: { index: false } };

export default function Cart() {
  return (
    <div className="container-page py-10 sm:py-14">
      <p className="eyebrow">Cart</p>
      <h1 className="mt-2 mb-8 text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">Your cart</h1>
      <CartPage />
    </div>
  );
}
