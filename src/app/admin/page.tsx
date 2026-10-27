import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowRight, Boxes, FileCheck2, PackageX, Receipt } from "lucide-react";
import { AdminPage, AdminSkeleton } from "@/components/admin/admin-page";
import { Card } from "@/components/admin/fields";
import { OrderStatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import { NumberTicker } from "@/components/ui/number-ticker";
import { Spotlight } from "@/components/ui/spotlight";
import { getAdminDashboard, getAdminOrders, ORDER_STATUSES } from "@/lib/admin";
import { requireAdmin } from "@/lib/auth";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = { title: "Dashboard" };

export default function AdminDashboardPage() {
  return (
    <AdminPage title="Dashboard" description="Catalog health and the latest orders.">
      <Suspense fallback={<AdminSkeleton rows={4} />}>
        <Dashboard />
      </Suspense>
    </AdminPage>
  );
}

async function Dashboard() {
  const profile = await requireAdmin();
  const [stats, orders] = await Promise.all([getAdminDashboard(), getAdminOrders()]);
  const cards = [
    { label: "Products live", value: stats.productsActive, note: `${stats.productsHidden} hidden`, icon: Boxes, href: "/admin/products" },
    { label: "Sizes in stock", value: stats.sizesInStock, note: `${stats.sizesOutOfStock} out of stock`, icon: PackageX, href: "/admin/products" },
    { label: "Awaiting payment", value: stats.ordersByStatus.pending_payment, note: `${stats.ordersTotal} orders in total`, icon: Receipt, href: "/admin/orders?status=pending_payment" },
    { label: "To ship", value: stats.ordersByStatus.paid + stats.ordersByStatus.processing, note: `${stats.ordersByStatus.shipped} shipped`, icon: FileCheck2, href: "/admin/orders?status=paid" },
  ];

  return (
    <div className="space-y-8">
      <p className="text-sm text-muted">Signed in as {profile.email}.</p>
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {cards.map((c) => (
          <Spotlight key={c.label} asChild className="rounded-[var(--radius-card)]">
            <Link href={c.href} className="block rounded-[var(--radius-card)] border border-line bg-surface p-5 transition-colors hover:border-line-strong">
              <div className="flex items-center justify-between">
                <p className="font-mono text-[10.5px] tracking-[0.14em] text-muted uppercase">{c.label}</p>
                <c.icon className="size-4 text-violet-400" />
              </div>
              <p className="mt-4 text-4xl font-semibold tracking-tight">
                <NumberTicker value={c.value} />
              </p>
              <p className="mt-1 text-xs text-subtle">{c.note}</p>
            </Link>
          </Spotlight>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_300px]">
        <Card
          title="Latest orders"
          action={
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin/orders">
                All orders <ArrowRight />
              </Link>
            </Button>
          }
        >
          {orders.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted">No orders yet. They appear here as soon as someone checks out.</p>
          ) : (
            <ul className="divide-y divide-line">
              {orders.slice(0, 6).map((o) => (
                <li key={o.id}>
                  <Link href={`/admin/orders/${o.id}`} className="flex items-center gap-4 py-3 hover:text-violet-200">
                    <span className="font-mono text-sm">#{o.orderNumber}</span>
                    <span className="min-w-0 flex-1 truncate text-sm text-muted">{o.email}</span>
                    <span className="hidden text-sm tabular-nums sm:inline">{formatPrice(o.totalCents)}</span>
                    <OrderStatusBadge status={o.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card title="Orders by status">
          <ul className="space-y-2.5 text-sm">
            {ORDER_STATUSES.map((s) => (
              <li key={s.value} className="flex items-center justify-between">
                <Link href={`/admin/orders?status=${s.value}`} className="text-muted hover:text-foreground">
                  {s.label}
                </Link>
                <span className="font-mono tabular-nums">{stats.ordersByStatus[s.value]}</span>
              </li>
            ))}
          </ul>
          <p className="mt-5 border-t border-line pt-4 text-xs text-subtle">
            Paid, processing and shipped: <span className="text-foreground tabular-nums">{formatPrice(stats.paidRevenueCents)}</span>
          </p>
        </Card>
      </div>
    </div>
  );
}
