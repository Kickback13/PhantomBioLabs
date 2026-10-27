"use server";

import { headers } from "next/headers";
import { getPaymentProvider } from "@/lib/payments";
import { createClient } from "@/lib/supabase/server";

export type CheckoutState =
  | { status: "idle" }
  | { status: "error"; message: string; fields?: Record<string, string> }
  | { status: "placed"; orderNumber: number; totalCents: number; email: string; redirectUrl?: string };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

function text(formData: FormData, key: string, max = 200) {
  return String(formData.get(key) ?? "").trim().slice(0, max);
}

export async function placeOrder(_prev: CheckoutState, formData: FormData): Promise<CheckoutState> {
  const fields: Record<string, string> = {};
  const email = text(formData, "email", 254).toLowerCase();
  if (!EMAIL.test(email)) fields.email = "Enter a valid email address.";

  const address = {
    name: text(formData, "name", 120),
    line1: text(formData, "line1"),
    line2: text(formData, "line2"),
    city: text(formData, "city", 120),
    region: text(formData, "region", 120),
    postal_code: text(formData, "postal_code", 20),
    country: text(formData, "country", 60) || "United States",
    phone: text(formData, "phone", 40),
  };
  if (!address.name) fields.name = "Enter the recipient's name.";
  if (!address.line1) fields.line1 = "Enter a street address.";
  if (!address.city) fields.city = "Enter a city.";
  if (!address.region) fields.region = "Enter a state or region.";
  if (!address.postal_code) fields.postal_code = "Enter a ZIP or postal code.";

  const researchUse = formData.get("research_use") === "on";
  const age = formData.get("age") === "on";
  if (!researchUse) fields.research_use = "Please confirm research use.";
  if (!age) fields.age = "Please confirm you are 21 or older.";

  let items: { variant_id: string; quantity: number }[] = [];
  try {
    const parsed = JSON.parse(String(formData.get("items") ?? "[]"));
    if (Array.isArray(parsed)) {
      items = parsed
        .filter((i) => i && UUID.test(String(i.variantId)) && Number.isInteger(i.quantity) && i.quantity >= 1 && i.quantity <= 20)
        .slice(0, 50)
        .map((i) => ({ variant_id: String(i.variantId), quantity: Number(i.quantity) }));
    }
  } catch {
    items = [];
  }
  if (!items.length) return { status: "error", message: "Your cart is empty." };
  if (Object.keys(fields).length) return { status: "error", message: "Please fix the highlighted fields.", fields };

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("place_order", {
    p_email: email,
    p_items: items,
    p_shipping_address: address,
    p_shipping_method: "standard",
    p_customer_note: text(formData, "note", 1000) || undefined,
    p_research_use_confirmed: researchUse,
    p_age_confirmed: age,
  });

  if (error || !data?.[0]) {
    const unavailable = error?.message?.includes("unavailable");
    return {
      status: "error",
      message: unavailable
        ? "One or more items just went out of stock. Please review your cart and try again."
        : "We couldn't place your order. Please try again, or message us on WhatsApp.",
    };
  }

  const order = data[0];
  const provider = getPaymentProvider();
  if (provider) {
    const host = (await headers()).get("host");
    const result = await provider.createPayment({
      orderId: order.order_id,
      orderNumber: order.order_number,
      amountCents: order.total_cents,
      currency: "USD",
      email,
      returnUrl: `https://${host}/account/orders`,
    });
    if (result.kind === "redirect") {
      return { status: "placed", orderNumber: order.order_number, totalCents: order.total_cents, email, redirectUrl: result.url };
    }
  }
  return { status: "placed", orderNumber: order.order_number, totalCents: order.total_cents, email };
}
