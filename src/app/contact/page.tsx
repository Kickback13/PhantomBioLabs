import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Boxes, Clock, MessageCircle, PackageSearch } from "lucide-react";
import { WhatsAppCta } from "@/components/content/whatsapp-cta";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { Spotlight } from "@/components/ui/spotlight";
import { faq } from "@/content/faq";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: `Questions about a compound, a lot or an order? Message Phantom Bio Labs on WhatsApp at ${site.contact.whatsapp}, ${site.contact.hours}.`,
};

const cards = [
  {
    icon: Clock,
    title: "Support hours",
    body: `${site.contact.hours}. After-hours messages are answered first thing the next business morning.`,
  },
  {
    icon: PackageSearch,
    title: "Order help",
    body: "Have your order number ready. For a damaged or defective shipment, contact us within 7 days of delivery.",
  },
  {
    icon: Boxes,
    title: "Bulk & institutional",
    body: "Include your institution and the quantities you need, and we'll quote tiered pricing.",
    message: "Hi, I'd like a bulk / institutional quote. Institution: ",
  },
];

export default function ContactPage() {
  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title={
          <>
            Talk to <span className="text-gradient-violet">the team.</span>
          </>
        }
        description="Questions about a compound, a specific lot or an order? Our team replies within one business day."
      />

      <section className="container-page grid gap-4 py-14 sm:py-20 lg:grid-cols-[1.15fr_1fr]">
        <Reveal>
          <Spotlight className="grain relative isolate h-full overflow-hidden rounded-3xl border border-violet-400/25 bg-[radial-gradient(120%_120%_at_0%_0%,#2a0f5c_0%,#0b0a10_60%)] p-8 sm:p-10">
            <div className="grid size-12 place-items-center rounded-2xl border border-violet-400/40 bg-violet-500/15 text-violet-200">
              <MessageCircle className="size-5" />
            </div>
            <p className="eyebrow mt-8 !text-violet-300">Fastest response</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">WhatsApp</h2>
            <a href={site.contact.whatsappHref} target="_blank" rel="noopener noreferrer" className="mt-3 block font-mono text-xl tracking-wide text-ink-100 hover:text-violet-200 sm:text-2xl">
              {site.contact.whatsapp}
            </a>
            <p className="mt-4 max-w-md text-[15px] leading-relaxed text-ink-200">
              Message us any time. We cover compound specifications, lot certificates, orders and shipping.
            </p>
            <WhatsAppCta className="mt-8" />
          </Spotlight>
        </Reveal>

        <div className="grid gap-4">
          {cards.map((c, i) => (
            <Reveal key={c.title} delay={0.06 * (i + 1)}>
              <Spotlight className="flex h-full gap-5 rounded-[var(--radius-card)] border border-line bg-surface p-6">
                <div className="grid size-11 shrink-0 place-items-center rounded-xl border border-violet-400/30 bg-violet-500/10 text-violet-300">
                  <c.icon className="size-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold tracking-tight">{c.title}</h3>
                  <p className="mt-1 text-[14px] leading-relaxed text-muted">{c.body}</p>
                  {c.message && <WhatsAppCta size="sm" variant="outline" label="Request a quote" message={c.message} className="mt-4" />}
                </div>
              </Spotlight>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="container-page">
        <div className="rounded-3xl border border-line bg-surface p-8 sm:p-10">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow">Quick answers</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">Skip the wait.</h2>
            </div>
            <Button asChild variant="outline">
              <Link href="/faq">
                All {faq.length} questions <ArrowRight />
              </Link>
            </Button>
          </div>
          <ul className="mt-8 grid gap-3 md:grid-cols-2">
            {faq.slice(0, 4).map((item) => (
              <li key={item.q} className="rounded-2xl border border-line bg-ink-950/60 p-5">
                <p className="font-medium tracking-tight">{item.q}</p>
                <p className="mt-2 line-clamp-3 text-[14px] leading-relaxed text-muted">{item.a}</p>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-xs text-subtle">
            We can&apos;t give advice on using any compound outside laboratory research. {site.compliance.short}
          </p>
        </div>
      </section>
    </>
  );
}
