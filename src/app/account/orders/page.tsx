import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { OrderCard } from "@/components/account/order-card";
import { getMyOrders } from "@/lib/orders";

export const metadata: Metadata = { title: "Your orders", robots: { index: false } };

export default function OrdersPage() {
  return (
    <Suspense fallback={<div className="h-64 animate-pulse rounded-2xl bg-surface" />}>
      <Orders />
    </Suspense>
  );
}

async function Orders() {
  const orders = await getMyOrders();
  if (!orders.length) {
    return (
      <div className="rounded-2xl border border-dashed border-line-strong p-8 text-center text-sm text-muted">
        You haven&apos;t placed an order yet.{" "}
        <Link href="/shop" className="text-violet-300 hover:underline">
          Browse the catalog
        </Link>
      </div>
    );
  }
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {orders.map((o) => (
        <OrderCard key={o.id} order={o} />
      ))}
    </div>
  );
}
