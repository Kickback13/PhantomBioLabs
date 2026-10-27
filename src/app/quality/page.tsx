import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Atom, FileCheck2, Fingerprint, Gauge, RefreshCcw, Snowflake } from "lucide-react";
import { SectionHeading } from "@/components/home/section-heading";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { ScrollTimeline, type TimelineEntry } from "@/components/ui/scroll-timeline";
import { Spotlight } from "@/components/ui/spotlight";

export const metadata: Metadata = {
  title: "Quality & Testing",
  description: "How every Phantom Bio Labs lot is synthesized, purified, independently verified by HPLC and mass spectrometry, and documented with a lot-specific Certificate of Analysis.",
};

const specs = [
  { icon: Gauge, label: "Purity", value: "≥ 99.0%", note: "Reverse-phase HPLC, every lot" },
  { icon: Fingerprint, label: "Identity", value: "Confirmed", note: "Mass spectrometry against the expected mass" },
  { icon: FileCheck2, label: "Traceability", value: "Lot-matched", note: "The lot on your vial matches its COA" },
  { icon: Snowflake, label: "Format", value: "Lyophilized", note: "Freeze-dried and sealed for stability" },
];

function StepBody({ text, points }: { text: string; points: string[] }) {
  return (
    <div className="rounded-[var(--radius-card)] border border-line bg-surface p-6 sm:p-8">
      <p className="text-[15px] leading-relaxed text-ink-200">{text}</p>
      <ul className="mt-5 grid gap-2 sm:grid-cols-2">
        {points.map((p) => (
          <li key={p} className="flex items-start gap-2.5 text-[13.5px] text-muted">
            <span aria-hidden="true" className="mt-[7px] size-1.5 shrink-0 rounded-full bg-violet-400" />
            {p}
          </li>
        ))}
      </ul>
    </div>
  );
}

const process: TimelineEntry[] = [
  {
    title: "Synthesis",
    label: "Checkpoint 01",
    content: (
      <StepBody
        text="Each compound is built by solid-phase synthesis at a certified partner facility, with every batch traced back to its raw-material origin."
        points={["Certified partner facilities", "Research-grade solvents and reagents", "Batch records kept per lot"]}
      />
    ),
  },
  {
    title: "Purification",
    label: "Checkpoint 02",
    content: (
      <StepBody
        text="Crude peptide is purified by reverse-phase HPLC to the ≥99% specification. Retention data is logged and archived alongside the lot."
        points={["Reverse-phase HPLC", "≥99% purity target", "Retention data archived"]}
      />
    ),
  },
  {
    title: "Verification",
    label: "Checkpoint 03",
    content: (
      <StepBody
        text="An independent third-party lab tests a sample from the lot. Purity is measured by HPLC and identity is confirmed by mass spectrometry. Lots that miss specification are not released."
        points={["Independent third-party lab", "HPLC purity measurement", "Mass-spec identity check", "Out-of-spec lots held back"]}
      />
    ),
  },
  {
    title: "Lyophilization",
    label: "Checkpoint 04",
    content: (
      <StepBody
        text="Released material is freeze-dried under sterile conditions, sealed, labelled with its lot number and checked for fill uniformity."
        points={["Freeze-dried and sealed", "Lot number on every vial", "Fill-weight checks"]}
      />
    ),
  },
  {
    title: "Dispatch",
    label: "Checkpoint 05",
    content: (
      <StepBody
        text="Orders placed before 2pm ET ship the same business day in discreet, unmarked packaging, with the lot-specific COA in the box and tracking on every shipment."
        points={["Same-day dispatch before 2pm ET", "Discreet, unmarked packaging", "COA in every box", "Tracked delivery"]}
      />
    ),
  },
];

const coaFields = [
  ["Compound and size", "Exactly what was tested, matched to the product you ordered."],
  ["Lot number", "The same number printed on your vial, so the certificate and the vial can't be mixed up."],
  ["HPLC purity", "The measured purity with the chromatogram, against the ≥99% specification."],
  ["Mass spectrometry", "Confirmation that the measured mass matches the expected compound."],
  ["Testing laboratory and date", "Who ran the analysis and when."],
] as const;

export default function QualityPage() {
  return (
    <>
      <PageHeader
        eyebrow="Quality & testing"
        title={
          <>
            Proof, <span className="text-gradient-violet">not promises.</span>
          </>
        }
        description="Every lot passes five checkpoints between raw material and your bench, including independent third-party verification. Here's exactly what happens and what the certificate in your box tells you."
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link href="/coa">
              Browse the COA library <ArrowRight />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/shop">Shop the catalog</Link>
          </Button>
        </div>
      </PageHeader>

      <section className="container-page py-20 sm:py-28">
        <SectionHeading index="01" eyebrow="The specification" title="What every lot has to meet." />
        <div className="mt-12 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
          {specs.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.05}>
              <Spotlight className="h-full rounded-[var(--radius-card)] border border-line bg-surface p-6">
                <s.icon className="size-5 text-violet-300" />
                <p className="eyebrow mt-6">{s.label}</p>
                <p className="mt-1 text-3xl font-semibold tracking-tight">{s.value}</p>
                <p className="mt-2 text-[13.5px] text-muted">{s.note}</p>
              </Spotlight>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="border-y border-line bg-ink-900/40 py-20 sm:py-28">
        <div className="container-page">
          <SectionHeading
            index="02"
            eyebrow="From synthesis to shipment"
            title="Five checkpoints. No shortcuts."
            description="A lot only moves forward when it clears the step before. Scroll to follow it through."
          />
          <div className="mt-14">
            <ScrollTimeline data={process} />
          </div>
        </div>
      </section>

      <section className="container-page grid gap-12 py-20 sm:py-28 lg:grid-cols-2 lg:gap-20">
        <div>
          <SectionHeading index="03" eyebrow="Reading a COA" title="What's on the certificate in your box." />
          <p className="mt-6 max-w-lg text-[15px] leading-relaxed text-muted">
            The Certificate of Analysis is issued by the independent lab that tested the lot, not written by us. Published certificates are in the COA library so you can check a lot before you order.
          </p>
          <Button asChild variant="outline" className="mt-8">
            <Link href="/coa">
              Open the COA library <ArrowRight />
            </Link>
          </Button>
        </div>
        <ol className="space-y-3">
          {coaFields.map(([title, body], i) => (
            <Reveal key={title} delay={i * 0.05}>
              <li className="flex gap-5 rounded-[var(--radius-card)] border border-line bg-surface p-5">
                <span className="grid size-9 shrink-0 place-items-center rounded-full border border-violet-400/40 bg-violet-500/10 font-mono text-[11px] text-violet-300">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <p className="font-medium tracking-tight">{title}</p>
                  <p className="mt-1 text-[14px] leading-relaxed text-muted">{body}</p>
                </div>
              </li>
            </Reveal>
          ))}
        </ol>
      </section>

      <section className="container-page">
        <div className="grain relative isolate overflow-hidden rounded-3xl border border-violet-400/25 bg-[radial-gradient(120%_120%_at_100%_0%,#2a0f5c_0%,#0b0a10_55%)] p-8 sm:p-12">
          <div className="grid gap-10 lg:grid-cols-[auto_1fr] lg:items-center">
            <div className="grid size-16 place-items-center rounded-2xl border border-violet-400/40 bg-violet-500/15 text-violet-200">
              <RefreshCcw className="size-7" />
            </div>
            <div>
              <p className="eyebrow !text-violet-300">Our guarantee</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">If a lot misses spec, we replace it or refund it.</h2>
              <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-ink-200">
                Damaged shipments are reshipped at our cost. Contact us within 7 days of delivery with your order number and we&apos;ll make it right.
              </p>
            </div>
          </div>
          <Atom aria-hidden="true" className="absolute -right-10 -bottom-10 -z-10 size-64 text-violet-500/10" />
        </div>
      </section>
    </>
  );
}
