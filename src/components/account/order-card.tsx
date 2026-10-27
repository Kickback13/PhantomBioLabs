import { ORDER_STATUS_LABEL, type OrderSummary } from "@/lib/orders";
import { cn, formatPrice } from "@/lib/utils";

export function OrderCard({ order }: { order: OrderSummary }) {
  const pending = order.status === "pending_payment";
  return (
    <article className="rounded-2xl border border-line bg-surface p-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-mono text-sm">Order #{order.orderNumber}</p>
          <p className="mt-0.5 text-xs text-muted">{new Date(order.createdAt).toLocaleDateString("en-US", { dateStyle: "medium" })}</p>
        </div>
        <span
          className={cn(
            "rounded-full border px-2.5 py-1 font-mono text-[10px] tracking-wider uppercase",
            pending ? "border-violet-400/40 text-violet-200" : order.status === "cancelled" || order.status === "refunded" ? "border-line text-subtle" : "border-violet-400/60 bg-violet-500/15 text-violet-100",
          )}
        >
          {ORDER_STATUS_LABEL[order.status] ?? order.status}
        </span>
      </header>
      <ul className="mt-4 divide-y divide-line border-y border-line text-sm">
        {order.items.map((i, idx) => (
          <li key={idx} className="flex justify-between gap-4 py-2.5">
            <span>
              {i.productName} <span className="font-mono text-xs text-muted">{i.variantLabel}</span> <span className="text-muted">× {i.quantity}</span>
            </span>
            <span className="tabular-nums">{formatPrice(i.lineTotalCents)}</span>
          </li>
        ))}
      </ul>
      <dl className="mt-3 space-y-1 text-sm">
        <div className="flex justify-between text-muted">
          <dt>Shipping</dt>
          <dd className="tabular-nums">{order.shippingCents ? formatPrice(order.shippingCents) : "Free"}</dd>
        </div>
        <div className="flex justify-between font-semibold">
          <dt>Total</dt>
          <dd className="tabular-nums">{formatPrice(order.totalCents)}</dd>
        </div>
      </dl>
      {pending && <p className="mt-3 text-xs text-muted">Our team will contact you with payment instructions for this order.</p>}
    </article>
  );
}
