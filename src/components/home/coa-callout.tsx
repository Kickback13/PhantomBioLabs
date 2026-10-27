import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";

export function CoaCallout() {
  return (
    <section className="relative overflow-hidden border-y border-line bg-ink-900/40">
      <div aria-hidden="true" className="absolute -top-40 -left-40 size-[520px] rounded-full bg-violet-600/15 blur-[120px]" />
      <div className="container-page relative grid items-center gap-12 py-20 sm:py-28 lg:grid-cols-2">
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

        <Reveal>
          <CoaSample />
        </Reveal>
      </div>
    </section>
  );
}

/** Illustrative COA layout. Real certificates are uploaded per lot in the admin area. */
function CoaSample() {
  const rows: [string, string][] = [
    ["Compound", "—"],
    ["Lot number", "PBL-XXXX-XX"],
    ["Method", "RP-HPLC · ESI-MS"],
    ["Specification", "≥ 99.0%"],
    ["Laboratory", "Independent third party"],
  ];
  return (
    <div className="relative mx-auto max-w-lg rotate-[1.5deg] rounded-2xl border border-line-strong bg-ink-50 p-6 text-ink-950 shadow-[0_50px_120px_-30px_rgba(139,61,255,0.45)] sm:p-8">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-mono text-[10px] tracking-[0.2em] text-ink-500 uppercase">Certificate of Analysis</p>
          <p className="mt-1 text-xl font-semibold tracking-tight">Phantom Bio Labs</p>
        </div>
        <span className="rounded-md border border-violet-600/40 px-2 py-1 font-mono text-[9px] tracking-[0.18em] text-violet-700 uppercase">Sample layout</span>
      </div>
      <svg viewBox="0 0 400 120" className="mt-6 w-full" aria-label="Sample HPLC chromatogram">
        <line x1="0" y1="110" x2="400" y2="110" stroke="#c9c4d6" />
        {[80, 160, 240, 320].map((x) => (
          <line key={x} x1={x} y1="10" x2={x} y2="110" stroke="#ece9f3" />
        ))}
        <path
          d="M0 108 L60 107 L90 106 L110 104 L130 107 L180 106 L196 100 L204 60 L210 14 L216 58 L224 100 L240 106 L300 107 L318 103 L326 106 L400 107"
          fill="none"
          stroke="#7424f0"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <text x="222" y="22" fontSize="10" fontFamily="var(--font-geist-mono), monospace" fill="#5a16c4">
          main peak
        </text>
      </svg>
      <dl className="mt-5 divide-y divide-ink-200 text-sm">
        {rows.map(([k, v]) => (
          <div key={k} className="flex justify-between py-2">
            <dt className="text-ink-500">{k}</dt>
            <dd className="font-mono text-[13px]">{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
