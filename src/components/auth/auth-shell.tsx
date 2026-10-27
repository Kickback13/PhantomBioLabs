import type { ReactNode } from "react";
import { GhostMark } from "@/components/brand/logo";
import { AnimatedGrid } from "@/components/ui/animated-grid";

/** Centered card layout for sign-in, registration and password pages. */
export function AuthShell({ eyebrow, title, description, children, footer }: { eyebrow: string; title: string; description?: ReactNode; children: ReactNode; footer?: ReactNode }) {
  return (
    <section className="grain relative isolate flex min-h-[calc(100dvh-100px)] items-center overflow-hidden py-12">
      <AnimatedGrid className="-z-10" />
      <div className="container-page">
        <div className="mx-auto w-full max-w-md rounded-3xl border border-line-strong bg-ink-900/80 p-6 shadow-[0_40px_120px_-30px_rgba(139,61,255,0.4)] backdrop-blur-xl sm:p-8">
          <GhostMark className="size-9 text-violet-400" />
          <p className="eyebrow mt-6">{eyebrow}</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.03em]">{title}</h1>
          {description && <div className="mt-2 text-sm leading-relaxed text-muted">{description}</div>}
          <div className="mt-7">{children}</div>
        </div>
        {footer && <div className="mx-auto mt-6 max-w-md text-center text-sm text-muted">{footer}</div>}
      </div>
    </section>
  );
}
