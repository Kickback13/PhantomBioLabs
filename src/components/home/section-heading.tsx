import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function SectionHeading({
  index,
  eyebrow,
  title,
  description,
  action,
  className,
}: {
  index?: string;
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-6 md:flex-row md:items-end md:justify-between", className)}>
      <div className="max-w-2xl">
        <p className="eyebrow flex items-center gap-3">
          {index && <span className="text-violet-400">{index}</span>}
          {index && <span aria-hidden="true" className="h-px w-8 bg-line-strong" />}
          {eyebrow}
        </p>
        <h2 className="mt-4 text-3xl leading-[1.02] font-semibold tracking-[-0.035em] sm:text-5xl">{title}</h2>
        {description && <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}
