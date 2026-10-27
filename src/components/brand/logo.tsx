import { cn } from "@/lib/utils";

/** Line-art ghost mark, drawn after the old logo. Replace with the final SVG when it's ready (see IMAGE_SPEC.md). */
export function GhostMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" aria-hidden="true" className={cn("size-7", className)}>
      <path
        d="M16 3.2c-5.6 0-9.4 4.2-9.4 9.9v11.6c0 1.2 1.4 1.9 2.3 1.1l1.8-1.5 2.1 1.9c.5.4 1.2.4 1.7 0L16 24.4l1.5 1.8c.5.4 1.2.4 1.7 0l2.1-1.9 1.8 1.5c.9.8 2.3.1 2.3-1.1V13.1c0-5.7-3.8-9.9-9.4-9.9Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M11.6 13.4c.7-1 2.1-1 2.8 0M17.6 13.4c.7-1 2.1-1 2.8 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function Logo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5 text-foreground", className)}>
      <GhostMark className="size-7 text-violet-400" />
      <span className="flex flex-col leading-none">
        <span className="text-[13px] font-semibold tracking-[0.28em]">PHANTOM</span>
        {!compact && <span className="mt-1 font-mono text-[9px] tracking-[0.42em] text-muted">BIO LABS</span>}
      </span>
      <span className="sr-only">Phantom Bio Labs</span>
    </span>
  );
}
