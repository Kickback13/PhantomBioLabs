import type { OrderStatus } from "@/lib/admin";
import { cn } from "@/lib/utils";

const ORDER_STYLES: Record<OrderStatus, { label: string; className: string }> = {
  pending_payment: { label: "Pending payment", className: "border-amber-400/30 bg-amber-400/10 text-amber-200" },
  paid: { label: "Paid", className: "border-violet-400/40 bg-violet-500/15 text-violet-200" },
  processing: { label: "Processing", className: "border-sky-400/30 bg-sky-400/10 text-sky-200" },
  shipped: { label: "Shipped", className: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200" },
  cancelled: { label: "Cancelled", className: "border-line-strong bg-white/[0.03] text-subtle" },
  refunded: { label: "Refunded", className: "border-line-strong bg-white/[0.03] text-subtle" },
};

export function OrderStatusBadge({ status, className }: { status: OrderStatus; className?: string }) {
  const style = ORDER_STYLES[status];
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 font-mono text-[10px] tracking-wider whitespace-nowrap uppercase", style.className, className)}>
      {style.label}
    </span>
  );
}

export function Pill({ tone = "neutral", children }: { tone?: "neutral" | "on" | "off" | "warn"; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 font-mono text-[10px] tracking-wider whitespace-nowrap uppercase",
        tone === "on" && "border-violet-400/40 bg-violet-500/15 text-violet-200",
        tone === "off" && "border-line-strong bg-white/[0.03] text-subtle",
        tone === "warn" && "border-amber-400/30 bg-amber-400/10 text-amber-200",
        tone === "neutral" && "border-line-strong text-muted",
      )}
    >
      {children}
    </span>
  );
}
