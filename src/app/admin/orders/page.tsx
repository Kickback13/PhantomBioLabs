import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AdminPage, AdminSkeleton } from "@/components/admin/admin-page";
import { OrderStatusBadge } from "@/components/admin/status-badge";
import { getAdminOrders, ORDER_STATUSES, type OrderStatus } from "@/lib/admin";
import { requireAdmin } from "@/lib/auth";
import { cn, formatPrice } from "@/lib/utils";

export const metadata: Metadata = { title: "Orders" };

const dateFormat = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });

export default function AdminOrdersPage(props: PageProps<"/admin/orders">) {
  return (
    <AdminPage title="Orders" description="Filter by status and open an order to update it.">
      <Suspense fallback={<AdminSkeleton rows={8} />}>
        <Orders searchParams={props.searchParams} />
      </Suspense>
    </AdminPage>
  );
}

async function Orders({ searchParams }: Pick<PageProps<"/admin/orders">, "searchParams">) {
  await requireAdmin();
  const { status: raw } = await searchParams;
  const status = ORDER_STATUSES.find((s) => s.value === raw)?.value ?? null;
  const orders = await getAdminOrders(status);

  return (
    <div className="space-y-5">
      <nav aria-label="Filter by status" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
        <FilterChip href="/admin/orders" active={!status}>
          All
        </FilterChip>
        {ORDER_STATUSES.map((s) => (
          <FilterChip key={s.value} href={`/admin/orders?status=${s.value}`} active={status === s.value}>
            {s.label}
          </FilterChip>
        ))}
      </nav>

      {orders.length === 0 ? (
        <div className="rounded-[var(--radius-card)] border border-dashed border-line px-6 py-14 text-center">
          <p className="font-medium">{status ? `No ${label(status).toLowerCase()} orders.` : "No orders yet."}</p>
          <p className="mt-1 text-sm text-muted">Orders appear here as soon as someone checks out.</p>
        </div>
      ) : (
        <>
          {/* Phones: cards */}
          <ul className="space-y-2 md:hidden">
            {orders.map((o) => (
              <li key={o.id}>
                <Link href={`/admin/orders/${o.id}`} className="block rounded-xl border border-line bg-surface p-4 hover:border-line-strong">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-mono text-sm">#{o.orderNumber}</span>
                    <OrderStatusBadge status={o.status} />
                  </div>
                  <p className="mt-2 truncate text-sm text-muted">{o.email}</p>
                  <div className="mt-2 flex items-center justify-between text-xs text-subtle">
                    <span>{dateFormat.format(new Date(o.createdAt))}</span>
                    <span className="text-sm text-foreground tabular-nums">{formatPrice(o.totalCents)}</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>

          {/* Tablet and up: table */}
          <div className="hidden overflow-hidden rounded-[var(--radius-card)] border border-line md:block">
            <table className="w-full text-sm">
              <thead className="bg-surface text-left font-mono text-[10.5px] tracking-[0.14em] text-muted uppercase">
                <tr>
                  <th className="px-4 py-3 font-normal">Order</th>
                  <th className="px-4 py-3 font-normal">Placed</th>
                  <th className="px-4 py-3 font-normal">Customer</th>
                  <th className="px-4 py-3 text-right font-normal">Items</th>
                  <th className="px-4 py-3 text-right font-normal">Total</th>
                  <th className="px-4 py-3 font-normal">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {orders.map((o) => (
                  <tr key={o.id} className="relative hover:bg-surface/60">
                    <td className="px-4 py-3 font-mono">
                      <Link href={`/admin/orders/${o.id}`} className="after:absolute after:inset-0 hover:text-violet-200">
                        #{o.orderNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-muted">{dateFormat.format(new Date(o.createdAt))}</td>
                    <td className="max-w-[16rem] truncate px-4 py-3">{o.email}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{o.itemCount}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{formatPrice(o.totalCents)}</td>
                    <td className="px-4 py-3">
                      <OrderStatusBadge status={o.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {orders.length >= 200 && <p className="text-xs text-subtle">Showing the latest 200 orders.</p>}
        </>
      )}
    </div>
  );
}

function label(status: OrderStatus) {
  return ORDER_STATUSES.find((s) => s.value === status)?.label ?? status;
}

function FilterChip({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "shrink-0 rounded-full border px-3.5 py-1.5 text-xs transition-colors",
        active ? "border-violet-400/60 bg-violet-500/15 text-violet-100" : "border-line text-muted hover:border-line-strong hover:text-foreground",
      )}
    >
      {children}
    </Link>
  );
}
