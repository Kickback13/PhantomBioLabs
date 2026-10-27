import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Spotlight } from "@/components/ui/spotlight";
import { Reveal } from "@/components/ui/reveal";
import { getCategories } from "@/lib/catalog";
import { categoryImage } from "@/lib/images";
import { cn } from "@/lib/utils";
import { SectionHeading } from "./section-heading";

export async function ResearchAreas() {
  const categories = await getCategories();
  return (
    <section className="container-page py-20 sm:py-28">
      <SectionHeading
        index="01"
        eyebrow="Research areas"
        title={
          <>
            Nine research areas.
            <br className="hidden sm:block" /> <span className="text-muted">One standard.</span>
          </>
        }
        description="Browse compounds by the pathway they're studied in. Every lot in every category is held to the same ≥99% HPLC specification."
      />
      <div className="mt-12 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 lg:grid-rows-3">
        {categories.map((c, i) => (
          <Reveal key={c.slug} delay={Math.min(i * 0.04, 0.3)} className={cn(i === 0 && "col-span-2 lg:row-span-2")}>
            <Spotlight asChild className="h-full">
              <Link
                href={`/category/${c.slug}`}
                className={cn(
                  "relative flex h-full min-h-[150px] flex-col justify-between overflow-hidden rounded-[var(--radius-card)] border border-line bg-surface p-4 transition-colors hover:border-line-strong sm:min-h-[180px] sm:p-5",
                  i === 0 && "min-h-[260px] sm:min-h-[320px] lg:p-8",
                )}
              >
                <CategoryArt slug={c.slug} index={i} large={i === 0} />
                <div className="relative flex items-start justify-between">
                  <span className="font-mono text-[11px] tracking-[0.2em] text-violet-400">{String(i + 1).padStart(2, "0")}</span>
                  <ArrowUpRight className="size-4 text-subtle transition-all duration-300 group-hover/spotlight:translate-x-0.5 group-hover/spotlight:-translate-y-0.5 group-hover/spotlight:text-violet-300" />
                </div>
                <div className="relative">
                  <h3 className={cn("font-semibold tracking-tight", i === 0 ? "text-3xl sm:text-4xl" : "text-[17px] sm:text-xl")}>{c.name}</h3>
                  {i === 0 && c.description && <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted">{c.description}</p>}
                  <p className="mt-1.5 font-mono text-[10.5px] tracking-[0.14em] text-muted uppercase">
                    {c.productCount} {c.productCount === 1 ? "compound" : "compounds"}
                  </p>
                </div>
              </Link>
            </Spotlight>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/** Category banner photo when present, otherwise a peptide-chain line drawing. */
function CategoryArt({ slug, index, large }: { slug: string; index: number; large: boolean }) {
  const photo = categoryImage(slug);
  if (photo) {
    return (
      <>
        <Image src={photo} alt="" fill sizes={large ? "(min-width: 1024px) 50vw, 100vw" : "(min-width: 1024px) 25vw, 50vw"} className="-z-10 object-cover opacity-70" />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-t from-ink-950 via-ink-950/60 to-transparent" />
      </>
    );
  }
  // Deterministic chain of "residues" per category so each tile looks different.
  const points = Array.from({ length: 7 }, (_, k) => {
    const angle = (index * 47 + k * 52) * (Math.PI / 180);
    return { x: 120 + k * 26 + Math.cos(angle) * 10, y: 60 + Math.sin(angle * 1.7) * 34 };
  });
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 320 140"
      className={cn(
        "pointer-events-none absolute -right-6 text-violet-400 transition-opacity duration-500 group-hover/spotlight:opacity-100",
        large ? "top-8 w-[78%] opacity-45 sm:top-14 sm:opacity-60" : "top-1 w-[92%] opacity-25",
      )}
    >
      <polyline points={points.map((p) => `${p.x},${p.y}`).join(" ")} fill="none" stroke="currentColor" strokeOpacity="0.6" strokeWidth="1" />
      {points.map((p, k) => (
        <g key={k}>
          <circle cx={p.x} cy={p.y} r={k % 3 === 0 ? 7 : 5} fill="var(--ink-900)" stroke="currentColor" strokeWidth="1" />
          {k % 2 === 0 && <line x1={p.x} y1={p.y} x2={p.x + 6} y2={p.y - 22} stroke="currentColor" strokeOpacity="0.45" />}
          {k % 2 === 0 && <circle cx={p.x + 6} cy={p.y - 24} r="2.5" fill="currentColor" fillOpacity="0.7" />}
        </g>
      ))}
    </svg>
  );
}
