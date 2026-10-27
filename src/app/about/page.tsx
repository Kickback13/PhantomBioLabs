import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Factory, FileCheck2, PackageCheck, ShieldCheck } from "lucide-react";
import { GhostMark } from "@/components/brand/logo";
import { SectionHeading } from "@/components/home/section-heading";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { NumberTicker } from "@/components/ui/number-ticker";
import { Reveal } from "@/components/ui/reveal";
import { Spotlight } from "@/components/ui/spotlight";

export const metadata: Metadata = {
  title: "About",
  description: "Phantom Bio Labs supplies research-grade peptides, independently tested to a ≥99% purity specification, with a Certificate of Analysis in every box.",
};

const commitments = [
  {
    icon: Factory,
    title: "Pharma-grade sourcing",
    body: "Compounds are synthesized at certified partner facilities with research-grade solvents and excipients. Every batch is lyophilized, sealed and checked before it reaches a shipping label.",
  },
  {
    icon: ShieldCheck,
    title: "Independent verification",
    body: "Every lot is tested by HPLC at an independent third-party lab before release. Their certificate, not our own paperwork, is what ships in your box.",
  },
  {
    icon: PackageCheck,
    title: "Same-day fulfilment",
    body: "Orders placed before 2pm ET ship the same business day in discreet, unmarked packaging, tracked from our door to your bench.",
  },
];

const stats = [
  { value: <><NumberTicker value={99} />%+</>, label: "Purity specification, every lot" },
  { value: "Every lot", label: "Third-party tested before release" },
  { value: "Same day", label: "Dispatch for orders before 2pm ET" },
  { value: "21+", label: "Qualified researchers only" },
];

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="About Phantom Bio Labs"
        title={
          <>
            The next evolution
            <br className="hidden sm:block" /> <span className="text-gradient-violet">is unseen.</span>
          </>
        }
        description="Phantom Bio Labs supplies research-grade peptides to qualified researchers. Every lot is independently tested to a ≥99% purity specification, and the certificate that proves it ships in the box."
      />

      <section className="container-page grid gap-12 py-20 sm:py-28 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
        <SectionHeading
          index="01"
          eyebrow="Our mission"
          title={
            <>
              Purity above
              <br className="hidden sm:block" /> <span className="text-muted">everything else.</span>
            </>
          }
        />
        <Reveal className="space-y-5 self-end text-[16px] leading-relaxed text-ink-200 sm:text-[17px]">
          <p>
            We started Phantom because we were tired of the gray market. Too many compounds sold under a research label ship without any certificate at all, and the ones that do often carry paperwork written by the seller: the same party grading its own homework.
          </p>
          <p>
            So we hold one rule. Nothing goes on sale until an independent third-party lab has verified the lot, and that lab&apos;s Certificate of Analysis, with its HPLC purity result and mass-spec identity check, ships in every box, matched to the lot number on your vial. If a lot misses specification, we replace it or refund it.
          </p>
        </Reveal>
      </section>

      <section className="border-y border-line bg-ink-900/40">
        <dl className="container-page grid grid-cols-2 lg:grid-cols-4">
          {stats.map((s, i) => (
            <div
              key={s.label}
              className={[
                "flex flex-col gap-2 py-10 sm:py-14",
                i % 2 === 1 && "border-l border-line pl-5 sm:pl-8",
                i >= 2 && "border-t border-line lg:border-t-0",
                i === 2 && "lg:border-l lg:pl-8",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <dt className="order-last text-[13px] leading-snug text-muted">{s.label}</dt>
              <dd className="text-3xl font-semibold tracking-tight sm:text-4xl">{s.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="container-page py-20 sm:py-28">
        <SectionHeading
          index="02"
          eyebrow="What we don't compromise on"
          title="Three commitments on every order."
          action={
            <Button asChild variant="outline">
              <Link href="/quality">
                How we test <ArrowRight />
              </Link>
            </Button>
          }
        />
        <div className="mt-12 grid gap-3 sm:gap-4 md:grid-cols-3">
          {commitments.map((c, i) => (
            <Reveal key={c.title} delay={i * 0.06}>
              <Spotlight className="h-full rounded-[var(--radius-card)] border border-line bg-surface p-6 sm:p-8">
                <div className="grid size-11 place-items-center rounded-xl border border-violet-400/30 bg-violet-500/10 text-violet-300">
                  <c.icon className="size-5" />
                </div>
                <h3 className="mt-6 text-xl font-semibold tracking-tight">{c.title}</h3>
                <p className="mt-2 text-[14.5px] leading-relaxed text-muted">{c.body}</p>
              </Spotlight>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="container-page pb-20 sm:pb-28">
        <div className="grain relative isolate overflow-hidden rounded-3xl border border-violet-400/25 bg-[radial-gradient(120%_120%_at_0%_0%,#2a0f5c_0%,#0b0a10_55%)] px-6 py-16 sm:px-12 sm:py-20">
          <GhostMark className="absolute -right-10 -bottom-16 -z-10 size-[340px] text-violet-500/10" />
          <p className="eyebrow !text-violet-300">See it for yourself</p>
          <h2 className="mt-4 max-w-3xl text-4xl leading-[0.98] font-semibold tracking-[-0.04em] sm:text-6xl">
            Don&apos;t take our word for it.
          </h2>
          <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-ink-200">
            Browse the catalog, or check a lot&apos;s certificate before you order. For laboratory research use only.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" variant="secondary">
              <Link href="/shop">
                Shop the catalog <ArrowRight />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/coa">
                <FileCheck2 /> COA library
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
