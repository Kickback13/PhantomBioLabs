import { cn } from "@/lib/utils";

export function StockBadge({ inStock, className }: { inStock: boolean; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 font-mono text-[10px] tracking-wider uppercase backdrop-blur",
        inStock ? "border-violet-400/40 bg-ink-950/70 text-violet-200" : "border-line bg-ink-950/70 text-subtle",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn("size-1.5 rounded-full", inStock ? "bg-violet-400 shadow-[0_0_6px_var(--violet-400)]" : "bg-ink-500")}
      />
      {inStock ? "In stock" : "Out of stock"}
    </span>
  );
}
