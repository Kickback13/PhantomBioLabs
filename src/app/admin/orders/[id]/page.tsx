import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Check, X } from "lucide-react";
import { AdminPage, AdminSkeleton, BackLink } from "@/components/admin/admin-page";
import { Card } from "@/components/admin/fields";
import { OrderForm } from "@/components/admin/order-form";
import { OrderStatusBadge } from "@/components/admin/status-badge";
import { getAdminOrder, ORDER_STATUSES } from "@/lib/admin";
import { requireAdmin } from "@/lib/auth";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = { title: "Order" };

const back = <BackLink href="/admin/orders">All orders</BackLink>;
const dateFormat = new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" });

export default function AdminOrderPage(props: PageProps<"/admin/orders/[id]">) {
  return (
    <Suspense
      fallback={
        <AdminPage title="Order" backLink={back}>
          <AdminSkeleton rows={5} />
        </AdminPage>
      }
    >
      <OrderDetail params={props.params} />
    </Suspense>
  );
}

async function OrderDetail({ params }: Pick<PageProps<"/admin/orders/[id]">, "params">) {
  await requireAdmin();
  const { id } = await params;
  const order = await getAdminOrder(id);
  if (!order) notFound();
  const address = formatAddress(order.shipping_address);

  return (
    <AdminPage
      title={
        <span className="flex flex-wrap items-center gap-3">
          Order <span className="font-mono">#{order.order_number}</span> <OrderStatusBadge status={order.status} />
        </span>
      }
      description={`Placed ${dateFormat.format(new Date(order.created_at))} · last updated ${dateFormat.format(new Date(order.updated_at))}`}
      backLink={back}
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          <Card title="Items">
            <ul className="divide-y divide-line">
              {order.items.map((item) => (
                <li key={item.id} className="flex items-start justify-between gap-4 py-3">
                  <div className="min-w-0">
                    {item.product ? (
                      <Link href={`/product/${item.product.slug}`} target="_blank" className="font-medium hover:text-violet-200">
                        {item.product_name}
                      </Link>
                    ) : (
                      <p className="font-medium">{item.product_name}</p>
                    )}
                    <p className="mt-0.5 text-xs text-muted">
                      {item.variant_label}
                      {item.sku && <span className="font-mono"> · {item.sku}</span>}
                    </p>
                  </div>
                  <div className="shrink-0 text-right text-sm tabular-nums">
                    <p>{formatPrice(item.line_total_cents)}</p>
                    <p className="text-xs text-subtle">
                      {item.quantity} × {formatPrice(item.unit_price_cents)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
            <dl className="mt-4 space-y-1.5 border-t border-line pt-4 text-sm">
              <Row label="Subtotal" value={formatPrice(order.subtotal_cents)} />
              <Row label={`Shipping (${order.shipping_method})`} value={order.shipping_cents === 0 ? "Free" : formatPrice(order.shipping_cents)} />
              <div className="flex justify-between pt-1.5 text-base font-semibold">
                <dt>Total</dt>
                <dd className="tabular-nums">
                  {formatPrice(order.total_cents)} <span className="text-xs font-normal text-subtle">{order.currency.toUpperCase()}</span>
                </dd>
              </div>
            </dl>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <Card title="Ship to">
              {address.length > 0 ? (
                <address className="space-y-0.5 text-sm not-italic">
                  {address.map((line, i) => (
                    <p key={i} className={i === 0 ? "font-medium" : "text-muted"}>
                      {line}
                    </p>
                  ))}
                </address>
              ) : (
                <p className="text-sm text-muted">No address on file.</p>
              )}
            </Card>
            <Card title="Customer">
              <a href={`mailto:${order.email}`} className="text-sm break-all hover:text-violet-200">
                {order.email}
              </a>
              <p className="mt-1 text-xs text-subtle">{order.user_id ? "Has an account" : "Guest checkout"}</p>
              <ul className="mt-4 space-y-2 text-sm">
                <Confirmation ok={order.research_use_confirmed}>Confirmed research use only</Confirmation>
                <Confirmation ok={order.age_confirmed}>Confirmed 21 or older</Confirmation>
              </ul>
              {order.customer_note && (
                <div className="mt-4 rounded-lg border border-line bg-background/40 p-3 text-sm">
                  <p className="mb-1 font-mono text-[10.5px] tracking-[0.14em] text-muted uppercase">Note</p>
                  <p className="whitespace-pre-wrap">{order.customer_note}</p>
                </div>
              )}
            </Card>
          </div>
        </div>

        <Card title="Status and payment" description="Payments are confirmed by hand for now. Record how and where it was paid.">
          <OrderForm
            id={order.id}
            status={order.status}
            statuses={ORDER_STATUSES}
            paymentProvider={order.payment_provider}
            paymentReference={order.payment_reference}
          />
        </Card>
      </div>
    </AdminPage>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-muted">
      <dt>{label}</dt>
      <dd className="text-foreground tabular-nums">{value}</dd>
    </div>
  );
}

function Confirmation({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return (
    <li className="flex items-center gap-2">
      {ok ? <Check className="size-4 text-emerald-400" /> : <X className="size-4 text-danger" />}
      <span className={ok ? "" : "text-danger"}>{children}</span>
    </li>
  );
}

const NAME_KEYS = ["name", "full_name", "fullName"];
const ORDERED_KEYS = [
  ["company"],
  ["line1", "address1", "address_line1", "street"],
  ["line2", "address2", "address_line2"],
];
const PHONE_KEYS = ["phone"];

/** Turns the saved address object into display lines, whatever keys checkout used. */
function formatAddress(raw: unknown): string[] {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return [];
  const a = raw as Record<string, unknown>;
  const used = new Set<string>();
  const take = (keys: string[]) => {
    for (const k of keys) {
      const v = a[k];
      if (typeof v === "string" && v.trim()) {
        used.add(k);
        return v.trim();
      }
    }
    return "";
  };

  const lines: string[] = [];
  const first = take(["first_name", "firstName"]);
  const last = take(["last_name", "lastName"]);
  const name = take(NAME_KEYS) || [first, last].filter(Boolean).join(" ");
  if (name) lines.push(name);
  for (const keys of ORDERED_KEYS) {
    const v = take(keys);
    if (v) lines.push(v);
  }
  const city = take(["city", "town"]);
  const region = take(["state", "region", "province"]);
  const postal = take(["postal_code", "postalCode", "zip", "postcode"]);
  const cityLine = [city, [region, postal].filter(Boolean).join(" ")].filter(Boolean).join(", ");
  if (cityLine) lines.push(cityLine);
  const country = take(["country", "country_code"]);
  if (country) lines.push(country);
  const phone = take(PHONE_KEYS);
  if (phone) lines.push(phone);

  // Anything else checkout saved, so nothing is hidden.
  for (const [k, v] of Object.entries(a)) {
    if (used.has(k) || v == null || v === "") continue;
    lines.push(`${k.replace(/_/g, " ")}: ${typeof v === "string" ? v : JSON.stringify(v)}`);
  }
  return lines;
}
