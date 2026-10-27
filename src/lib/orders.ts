import "server-only";
import { createClient } from "./supabase/server";

export type OrderSummary = {
  id: string;
  orderNumber: number;
  status: string;
  createdAt: string;
  subtotalCents: number;
  shippingCents: number;
  totalCents: number;
  items: { productName: string; variantLabel: string; quantity: number; lineTotalCents: number }[];
};

export const ORDER_STATUS_LABEL: Record<string, string> = {
  pending_payment: "Pending payment",
  paid: "Paid",
  processing: "Processing",
  shipped: "Shipped",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

/** The signed-in customer's orders, newest first (row-level security limits it to their own). */
export async function getMyOrders(limit = 50): Promise<OrderSummary[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select("id, order_number, status, created_at, subtotal_cents, shipping_cents, total_cents, order_items(product_name, variant_label, quantity, line_total_cents)")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(`Could not load orders: ${error.message}`);
  return (data ?? []).map((o) => ({
    id: o.id,
    orderNumber: o.order_number,
    status: o.status,
    createdAt: o.created_at,
    subtotalCents: o.subtotal_cents,
    shippingCents: o.shipping_cents,
    totalCents: o.total_cents,
    items: (o.order_items ?? []).map((i) => ({ productName: i.product_name, variantLabel: i.variant_label, quantity: i.quantity, lineTotalCents: i.line_total_cents })),
  }));
}
