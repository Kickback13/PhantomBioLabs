import "server-only";

/**
 * Payment processor slot. Checkout saves every order as "pending_payment" and then asks the
 * active provider to take payment. No provider is connected yet, so orders stay pending and the
 * team follows up with payment instructions.
 *
 * To connect a processor: implement PaymentProvider in a new file (e.g. ./acme.ts) using the
 * processor's server SDK and secret keys from Vercel environment variables, return it from
 * getPaymentProvider(), and add a webhook route that marks orders "paid" when payment clears.
 */

export type PaymentRequest = {
  orderId: string;
  orderNumber: number;
  amountCents: number;
  currency: "USD";
  email: string;
  /** Absolute URL to send the customer back to after paying. */
  returnUrl: string;
};

export type PaymentResult =
  | { kind: "redirect"; url: string } // hosted payment page
  | { kind: "pending" }; // no live payment step; the order waits for manual payment

export interface PaymentProvider {
  id: string;
  name: string;
  createPayment(request: PaymentRequest): Promise<PaymentResult>;
}

export function getPaymentProvider(): PaymentProvider | null {
  return null;
}
