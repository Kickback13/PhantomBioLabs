import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { GhostMark } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";

export function CtaBand() {
  return (
    <section className="container-page">
      <div className="grain relative isolate overflow-hidden rounded-3xl border border-violet-400/25 bg-[radial-gradient(120%_120%_at_0%_0%,#2a0f5c_0%,#0b0a10_55%)] px-6 py-16 sm:px-12 sm:py-20">
        <GhostMark className="absolute -right-10 -bottom-16 -z-10 size-[340px] text-violet-500/10" />
        <p className="eyebrow !text-violet-300">Ready when you are</p>
        <h2 className="mt-4 max-w-3xl text-4xl leading-[0.98] font-semibold tracking-[-0.04em] sm:text-6xl">
          Start with compounds you can verify.
        </h2>
        <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-ink-200">
          Independently tested lots, a COA in every box, and same-day dispatch. Free U.S. shipping on larger orders.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg" variant="secondary">
            <Link href="/shop">
              Shop peptides <ArrowRight />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/about">Our story</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
