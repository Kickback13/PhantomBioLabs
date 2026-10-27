"use client";

import Link from "next/link";
import { ArrowUpRight, FileCheck2, FileText, SearchX } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState, type ReactNode } from "react";
import { BeamSearch } from "@/components/ui/beam-search";
import { ChipGroup } from "@/components/ui/chip-group";
import { Spotlight } from "@/components/ui/spotlight";
import type { Coa } from "@/lib/catalog";

const dateFormat = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });

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
        <motion.ul layout className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence initial={false}>
            {filtered.map((c) => (
              <motion.li
                key={c.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.25 }}
              >
                <Spotlight className="flex h-full flex-col rounded-[var(--radius-card)] border border-line bg-surface p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <Link href={`/product/${c.productSlug}`} className="text-lg font-semibold tracking-tight hover:text-violet-300">
                        {c.productName}
                      </Link>
                      {c.variantLabel && <p className="mt-0.5 font-mono text-[11px] tracking-wide text-muted">{c.variantLabel}</p>}
                    </div>
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-violet-400/30 bg-violet-500/10 text-violet-300">
                      <FileText className="size-4" />
                    </span>
                  </div>
                  <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                    <Field label="Lot" value={c.lotNumber} mono />
                    <Field label="Purity" value={c.purityPercent !== null ? `${c.purityPercent.toFixed(2)}%` : "See PDF"} mono />
                    <Field label="Tested" value={c.testedOn ? dateFormat.format(new Date(`${c.testedOn}T00:00:00Z`)) : "See PDF"} />
                    <Field label="Laboratory" value={c.labName ?? "Third-party lab"} />
                  </dl>
                  <a
                    href={c.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-6 inline-flex items-center gap-1.5 self-start rounded-lg border border-line-strong px-3 py-2 text-sm font-medium transition-colors hover:border-violet-400/60 hover:bg-violet-500/10"
                  >
                    View PDF <ArrowUpRight className="size-4" />
                  </a>
                </Spotlight>
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
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

function Field({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="min-w-0">
      <dt className="eyebrow !text-[10px]">{label}</dt>
      <dd className={mono ? "mt-1 truncate font-mono text-[13px]" : "mt-1 truncate"}>{value}</dd>
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
