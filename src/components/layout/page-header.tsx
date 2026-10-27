import type { ReactNode } from "react";
import { AnimatedGrid } from "@/components/ui/animated-grid";
import { TextReveal } from "@/components/ui/text-reveal";
import { cn } from "@/lib/utils";

/** Standard top section for inner pages: eyebrow, big title, optional intro and actions. */
export function PageHeader({
  eyebrow,
  title,
  description,
  children,
  className,
}: {
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("grain relative isolate overflow-hidden border-b border-line", className)}>
      <AnimatedGrid className="-z-10 opacity-70" />
      <div className="container-page py-14 sm:py-20">
        <p className="eyebrow flex items-center gap-3">
          <span aria-hidden="true" className="size-1.5 rounded-full bg-violet-400 shadow-[0_0_8px_var(--violet-400)]" />
          {eyebrow}
        </p>
        <TextReveal className="mt-4 max-w-4xl text-4xl leading-[0.98] font-semibold tracking-[-0.04em] sm:text-6xl">{title}</TextReveal>
        {description && <div className="mt-5 max-w-2xl text-[15px] leading-relaxed text-muted sm:text-base">{description}</div>}
        {children && <div className="mt-8">{children}</div>}
      </div>
    </section>
  );
}
