import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowRight } from "lucide-react";
import { NameForm } from "@/components/account/account-ui";
import { OrderCard } from "@/components/account/order-card";
import { getProfile } from "@/lib/auth";
import { getMyOrders } from "@/lib/orders";

export const metadata: Metadata = { title: "Your account", robots: { index: false } };

export default function AccountPage() {
  return (
    <Suspense fallback={<div className="h-64 animate-pulse rounded-2xl bg-surface" />}>
      <Overview />
    </Suspense>
  );
}

async function Overview() {
  const profile = await getProfile();
  if (!profile) return null; // proxy.ts sends signed-out visitors to /login
  const orders = await getMyOrders(3);
  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1.4fr]">
      <section className="rounded-2xl border border-line bg-surface p-6">
        <p className="eyebrow">Profile</p>
        <p className="mt-3 text-lg font-medium">{profile.full_name || "Researcher"}</p>
        <p className="text-sm text-muted">{profile.email}</p>
        <div className="mt-6">
          <NameForm name={profile.full_name ?? ""} />
        </div>
        {profile.is_admin && (
          <Link href="/admin" className="mt-6 inline-flex items-center gap-2 text-sm text-violet-300 hover:underline">
            Open the admin area <ArrowRight className="size-4" />
          </Link>
        )}
      </section>
      <section>
        <div className="flex items-center justify-between">
          <p className="eyebrow">Recent orders</p>
          <Link href="/account/orders" className="text-sm text-violet-300 hover:underline">
            All orders
          </Link>
        </div>
        <div className="mt-4 space-y-4">
          {orders.length ? (
            orders.map((o) => <OrderCard key={o.id} order={o} />)
          ) : (
            <div className="rounded-2xl border border-dashed border-line-strong p-6 text-sm text-muted">
              No orders yet.{" "}
              <Link href="/shop" className="text-violet-300 hover:underline">
                Browse the catalog
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
