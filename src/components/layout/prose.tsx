import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Long-form text styling for policy and legal pages. */
export function Prose({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "max-w-3xl text-[15.5px] leading-[1.75] text-ink-200",
        "[&_h2]:mt-14 [&_h2]:scroll-mt-28 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2]:text-foreground first:[&_h2]:mt-0",
        "[&_h3]:mt-8 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:tracking-tight [&_h3]:text-foreground",
        "[&_p]:mt-4 [&_ul]:mt-4 [&_ul]:space-y-2 [&_ul]:pl-5 [&_li]:list-disc [&_li]:marker:text-violet-400",
        "[&_a]:text-violet-300 [&_a]:underline [&_a]:decoration-violet-400/40 [&_a]:underline-offset-4 hover:[&_a]:decoration-violet-300",
        "[&_strong]:font-semibold [&_strong]:text-foreground",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** Section heading inside Prose with a numbered mono label. */
export function ProseSection({ id, index, title, children }: { id: string; index: number; title: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id}>
      <h2 id={id}>
        <span className="mr-3 font-mono text-[13px] text-violet-400">{String(index).padStart(2, "0")}</span>
        {title}
      </h2>
      {children}
    </section>
  );
}
