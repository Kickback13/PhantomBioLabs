"use client";

import Link from "next/link";
import { ArrowUpRight, FileCheck2, SearchX } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { BeamSearch } from "@/components/ui/beam-search";
import { ChipGroup } from "@/components/ui/chip-group";
import type { Coa } from "@/lib/catalog";
import { coaPath, formatTestedOn } from "@/lib/coa";

export function CoaLibrary({ coas }: { coas: Coa[] }) {
  const [query, setQuery] = useState("");
  const [product, setProduct] = useState<string[]>([]);

  const products = useMemo(() => {
    const counts = new Map<string, { label: string; count: number }>();
    for (const c of coas) {
      const entry = counts.get(c.productSlug) ?? { label: c.productName, count: 0 };
      entry.count += 1;
      counts.set(c.productSlug, entry);
    }
    return [...counts.entries()]
      .map(([value, { label, count }]) => ({ value, label, count }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [coas]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return coas.filter((c) => {
      if (product.length && !product.includes(c.productSlug)) return false;
      if (!q) return true;
      return [c.productName, c.lotNumber, c.variantLabel ?? "", c.labName ?? ""].some((v) => v.toLowerCase().includes(q));
    });
  }, [coas, query, product]);

  return (
    <div>
      <div className="flex flex-col gap-4">
        <BeamSearch value={query} onChange={setQuery} placeholder="Search by compound or lot number" label="Search certificates" className="max-w-xl" />
        {products.length > 1 && <ChipGroup label="Filter by compound" options={products} value={product} onValueChange={setProduct} />}
      </div>

      <p className="mt-8 font-mono text-[11px] tracking-[0.16em] text-subtle uppercase" aria-live="polite">
        {filtered.length} {filtered.length === 1 ? "certificate" : "certificates"}
      </p>

      {filtered.length ? (
        <div className="mt-4 overflow-x-auto rounded-[var(--radius-card)] border border-line">
          <table className="w-full min-w-[720px] text-left text-sm">
            <caption className="sr-only">Published certificates of analysis</caption>
            <thead>
              <tr className="border-b border-line bg-surface font-mono text-[10.5px] tracking-[0.14em] text-muted uppercase">
                <th scope="col" className="p-4 font-normal">Compound</th>
                <th scope="col" className="p-4 font-normal">Size</th>
                <th scope="col" className="p-4 font-normal">Lot</th>
                <th scope="col" className="p-4 font-normal">Tested</th>
                <th scope="col" className="p-4 font-normal">Purity</th>
                <th scope="col" className="p-4 font-normal">Laboratory</th>
                <th scope="col" className="p-4 font-normal">
                  <span className="sr-only">Links</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="border-b border-line last:border-0">
                  <th scope="row" className="p-4 font-medium">
                    <Link href={`/product/${c.productSlug}`} className="hover:text-violet-300">
                      {c.productName}
                    </Link>
                  </th>
                  <td className="p-4 font-mono text-[13px] text-muted">{c.variantLabel ?? "All sizes"}</td>
                  <td className="p-4 font-mono text-[13px]">
                    <Link href={coaPath(c)} className="text-violet-300 hover:underline">
                      {c.lotNumber}
                    </Link>
                  </td>
                  <td className="p-4">{formatTestedOn(c.testedOn) ?? "See PDF"}</td>
                  <td className="p-4 font-mono text-[13px]">{c.purityPercent !== null ? `${c.purityPercent.toFixed(2)}%` : "See PDF"}</td>
                  <td className="p-4">{c.labName ?? "Third-party lab"}</td>
                  <td className="p-4 text-right whitespace-nowrap">
                    <a href={c.fileUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-medium hover:text-violet-300">
                      PDF <ArrowUpRight aria-hidden="true" className="size-3.5" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="mt-6 flex flex-col items-center rounded-[var(--radius-card)] border border-dashed border-line-strong px-6 py-16 text-center">
          <SearchX className="size-6 text-violet-300" />
          <p className="mt-4 font-medium">No certificates match that search</p>
          <p className="mt-1 text-sm text-muted">Try a compound name or the lot number printed on your vial.</p>
        </div>
      )}
    </div>
  );
}

/** Shown while the library has no published certificates yet. */
export function CoaEmptyState({ children }: { children?: ReactNode }) {
  return (
    <div className="grain relative isolate overflow-hidden rounded-3xl border border-line bg-surface px-6 py-16 text-center sm:py-24">
      <div aria-hidden="true" className="absolute top-1/2 left-1/2 -z-10 size-[460px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/15 blur-[100px]" />
      <div className="relative mx-auto grid size-20 place-items-center">
        <span aria-hidden="true" className="absolute inset-0 rounded-full border border-violet-400/30 motion-safe:animate-pulse-ring" />
        <span aria-hidden="true" className="absolute inset-3 rounded-full border border-violet-400/20" />
        <FileCheck2 className="size-8 text-violet-300" />
      </div>
      <p className="eyebrow mt-8">Library in progress</p>
      <h2 className="mx-auto mt-3 max-w-xl text-3xl font-semibold tracking-tight sm:text-4xl">Certificates are being added.</h2>
      <p className="mx-auto mt-4 max-w-lg text-[15px] leading-relaxed text-muted">
        Every order already ships with its lot-specific COA in the box. Need the certificate for a lot before you order? Message us with the compound and lot number and we&apos;ll send it over.
      </p>
      {children && <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">{children}</div>}
    </div>
  );
}
