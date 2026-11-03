import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { BorderBeam } from "@/components/ui/border-beam";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { Tilt } from "@/components/ui/tilt";
import { getCoas, type Coa } from "@/lib/catalog";
import { cn } from "@/lib/utils";

export async function CoaCallout() {
  // TODO(SEO-DESK/KEANU): real data needed. Until a COA is published in /admin/coas, no sample card is shown.
  const latest = (await getCoas())[0] ?? null;
  return (
    <section className="relative overflow-hidden border-y border-line bg-ink-900/40">
      <div aria-hidden="true" className="absolute -top-40 -left-40 size-[520px] rounded-full bg-violet-600/15 blur-[120px]" />
      <div className={cn("container-page relative grid items-center gap-12 py-20 sm:py-28", latest && "lg:grid-cols-2")}>
        <div>
          <p className="eyebrow flex items-center gap-3">
            <span className="text-violet-400">04</span>
            <span aria-hidden="true" className="h-px w-8 bg-line-strong" />
            Certificate of Analysis
          </p>
          <h2 className="mt-4 text-3xl leading-[1.02] font-semibold tracking-[-0.035em] sm:text-5xl">
            Every lot. Every box.
            <br />
            <span className="text-muted">On the record.</span>
          </h2>
          <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-muted">
            The COA in your box is issued by an independent third-party lab, not written by us. It&apos;s tied to the lot number on your vial and published in the COA library so you can check it before you order.
          </p>
          <ul className="mt-6 space-y-2.5 text-[14.5px]">
            {["Identity confirmed by mass spectrometry", "Purity measured by HPLC", "Lot number matched to your order"].map((t) => (
              <li key={t} className="flex items-center gap-3">
                <span className="grid size-5 place-items-center rounded-full bg-violet-500/15 text-violet-300">
                  <Check className="size-3" />
                </span>
                {t}
              </li>
            ))}
          </ul>
          <Button asChild className="mt-8" size="lg">
            <Link href="/coa">
              Open the COA library <ArrowRight />
            </Link>
          </Button>
        </div>

        {latest && (
          <Reveal>
            <Tilt rotationFactor={6}>
              <LatestCoa coa={latest} />
            </Tilt>
          </Reveal>
        )}
      </div>
    </section>
  );
}

const dateFormat = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });

/** The most recent published certificate, with its real values only. */
function LatestCoa({ coa }: { coa: Coa }) {
  const rows: [string, string | null][] = [
    ["Compound", coa.variantLabel ? `${coa.productName} · ${coa.variantLabel}` : coa.productName],
    ["Lot number", coa.lotNumber],
    ["Tested", coa.testedOn ? dateFormat.format(new Date(`${coa.testedOn}T00:00:00Z`)) : null],
    ["Purity (HPLC)", coa.purityPercent !== null ? `${coa.purityPercent.toFixed(2)}%` : null],
    ["Laboratory", coa.labName],
  ];
  return (
    <div className="relative mx-auto max-w-lg rotate-[1.5deg] rounded-2xl border border-line-strong bg-ink-50 p-6 text-ink-950 shadow-[0_50px_120px_-30px_rgba(139,61,255,0.45)] sm:p-8">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-mono text-[10px] tracking-[0.2em] text-ink-500 uppercase">Certificate of Analysis</p>
          <p className="mt-1 text-xl font-semibold tracking-tight">Latest published lot</p>
        </div>
      </div>
      <BorderBeam size={220} duration={10} borderWidth={2} colorFrom="var(--violet-400)" colorTo="var(--violet-700)" />
      <dl className="mt-5 divide-y divide-ink-200 text-sm">
        {rows
          .filter((r): r is [string, string] => Boolean(r[1]))
          .map(([k, v]) => (
            <div key={k} className="flex justify-between gap-4 py-2">
              <dt className="text-ink-500">{k}</dt>
              <dd className="text-right font-mono text-[13px]">{v}</dd>
            </div>
          ))}
      </dl>
      <a href={coa.fileUrl} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex text-sm font-medium text-violet-700 hover:underline">
        View the PDF
      </a>
    </div>
  );
}
