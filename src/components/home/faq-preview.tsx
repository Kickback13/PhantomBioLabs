import Link from "next/link";
import { ArrowRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { faq } from "@/content/faq";
import { site } from "@/lib/site";

export function FaqPreview() {
  const items = faq.slice(0, 5);
  return (
    <section className="container-page grid gap-12 py-20 sm:py-28 lg:grid-cols-[0.8fr_1.2fr]">
      <div>
        <p className="eyebrow flex items-center gap-3">
          <span className="text-violet-400">06</span>
          <span aria-hidden="true" className="h-px w-8 bg-line-strong" />
          FAQ
        </p>
        <h2 className="mt-4 text-3xl leading-[1.02] font-semibold tracking-[-0.035em] sm:text-5xl">Answers, before you ask.</h2>
        <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-muted">
          Can&apos;t find it? Message the team on WhatsApp at {site.contact.whatsapp}, {site.contact.hours}.
        </p>
        <Button asChild variant="outline" className="mt-7">
          <Link href="/faq">
            All questions <ArrowRight />
          </Link>
        </Button>
      </div>
      <div className="divide-y divide-line border-y border-line">
        {items.map((item) => (
          <details key={item.q} className="group py-1 [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-4 text-[16px] font-medium tracking-tight transition-colors hover:text-violet-200 sm:text-lg">
              {item.q}
              <Plus className="size-4 shrink-0 text-violet-400 transition-transform duration-300 group-open:rotate-45" />
            </summary>
            <p className="pb-5 pr-10 text-[14.5px] leading-relaxed text-muted">{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
