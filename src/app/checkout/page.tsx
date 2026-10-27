import type { Metadata } from "next";
import { CheckoutForm } from "@/components/checkout/checkout-form";

export const metadata: Metadata = { title: "Checkout", robots: { index: false } };
export const prefetch = "force-disabled";

export default function CheckoutPage() {
  return (
    <div className="container-page py-10 sm:py-14">
      <p className="eyebrow text-center">Secure checkout</p>
      <h1 className="mt-2 mb-10 text-center text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">Checkout</h1>
      <CheckoutForm />
    </div>
  );
}
