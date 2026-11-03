import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArrowUpRight, FileText, FlaskConical } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import { getCoas, type Coa } from "@/lib/catalog";
import { coaPath, findCoa, formatTestedOn, lotSlug } from "@/lib/coa";
import { pageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";
import { coaDatasetSchema } from "@/lib/structured-data";

// Placeholder param so the route still builds while no COA is published yet; it renders a 404.
const NONE = { compound: "none", lot: "none" };

export async function generateStaticParams() {
  const coas = await getCoas();
  return coas.length ? coas.map((c) => ({ compound: c.productSlug, lot: lotSlug(c.lotNumber) })) : [NONE];
}

async function load(params: PageProps<"/coa/[compound]/[lot]">["params"]) {
  const { compound, lot } = await params;
  return findCoa(await getCoas(), compound, lot);
}

export async function generateMetadata({ params }: PageProps<"/coa/[compound]/[lot]">): Promise<Metadata> {
  const coa = await load(params);
  if (!coa) return {};
  return pageMetadata({
    title: `${coa.productName} COA, Lot ${coa.lotNumber}`,
    description: `Certificate of Analysis for ${coa.productName} lot ${coa.lotNumber}: third-party lab results and the original PDF. For laboratory research use only.`,
    path: coaPath(coa),
  });
}

export default function CoaLotPage(props: PageProps<"/coa/[compound]/[lot]">) {
  return (
    <Suspense fallback={<div className="container-page min-h-[60vh] py-20" />}>
      <CoaLotView params={props.params} />
    </Suspense>
  );
}

async function CoaLotView({ params }: Pick<PageProps<"/coa/[compound]/[lot]">, "params">) {
  const coa = await load(params);
  if (!coa) notFound();
  const path = coaPath(coa);

  return (
    <>
      <JsonLd data={coaDatasetSchema(coa, path)} />
      <div className="container-page pt-6">
        <Breadcrumbs
          crumbs={[
            { name: "Home", path: "/" },
            { name: "COA Library", path: "/coa" },
            { name: coa.productName, path: `/product/${coa.productSlug}` },
            { name: `Lot ${coa.lotNumber}`, path },
          ]}
        />
      </div>
      <PageHeader eyebrow="Certificate of Analysis" title={`${coa.productName}, lot ${coa.lotNumber}`} />
      <section className="container-page grid gap-10 py-14 sm:py-20 lg:grid-cols-[1.2fr_0.8fr]">
        <LotFacts coa={coa} />
        <div className="space-y-4">
          <a
            href={coa.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-2xl border border-line-strong bg-surface p-5 font-medium hover:border-violet-400/60"
          >
            <FileText aria-hidden="true" className="size-5 text-violet-300" /> Open the original PDF <ArrowUpRight aria-hidden="true" className="ml-auto size-4" />
          </a>
          <Link href={`/product/${coa.productSlug}`} className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-5 hover:border-violet-400/60">
            View {coa.productName} <ArrowUpRight aria-hidden="true" className="ml-auto size-4" />
          </Link>
          <div className="flex gap-3 rounded-2xl border border-violet-400/25 bg-violet-500/[0.06] p-5">
            <FlaskConical aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-violet-300" />
            <p className="text-[13px] leading-relaxed text-ink-200">{site.compliance.ruo}</p>
          </div>
        </div>
      </section>
    </>
  );
}

/** Values from the COA table only. Rows without data are hidden. */
function LotFacts({ coa }: { coa: Coa }) {
  const rows: [string, string | null][] = [
    ["Compound", coa.productName],
    ["Size", coa.variantLabel],
    ["Lot number", coa.lotNumber],
    ["Laboratory", coa.labName],
    ["Test date", formatTestedOn(coa.testedOn)],
    ["Purity (HPLC)", coa.purityPercent !== null ? `${coa.purityPercent.toFixed(2)}%` : null],
    // TODO(SEO-DESK/KEANU): identity method (e.g. LC-MS) and a lab verification link need columns in
    // the coas table before they can be shown. Hidden until then; never filled in by hand here.
  ];
  return (
    <dl className="h-fit divide-y divide-line overflow-hidden rounded-2xl border border-line">
      {rows
        .filter((r): r is [string, string] => Boolean(r[1]))
        .map(([k, v]) => (
          <div key={k} className="grid gap-1 px-5 py-3.5 sm:grid-cols-[180px_1fr] sm:gap-6">
            <dt className="font-mono text-[11px] tracking-[0.14em] text-muted uppercase sm:pt-0.5">{k}</dt>
            <dd className="text-sm">{v}</dd>
          </div>
        ))}
    </dl>
  );
}
