import type { Metadata } from "next";
import Link from "next/link";
import { FlaskConical, Info } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Prose } from "@/components/layout/prose";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { DeskBrief } from "@/components/seo/desk-brief";
import { JsonLd } from "@/components/seo/json-ld";
import { ProductGrid } from "@/components/shop/product-grid";
import { notFound } from "next/navigation";
import { getGuide, isGuideReady, isGuideVisible, type GuidePage } from "@/content/guides";
import { getProducts } from "@/lib/catalog";
import type { Citation } from "@/lib/compound-facts";
import { pageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";
import { articleSchema } from "@/lib/structured-data";

const dateFormat = new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });

/** Guides and hubs stay noindex until every placeholder is filled and any sign-off is done. */
export function guideMetadata(path: string): Metadata {
  const page = getGuide(path);
  return pageMetadata({ title: page.title, description: page.description, path: page.path, noindex: !isGuideReady(page), type: "article" });
}

/** Shared layout for guides and research hubs: byline, last updated, contents, sections, citations, schema. */
export async function GuideView({ path }: { path: string }) {
  const page = getGuide(path);
  if (!isGuideVisible(page)) notFound();
  const products = await getProducts();
  const compounds = page.compounds.map((slug) => products.find((p) => p.slug === slug)).filter((p) => p !== undefined);
  const toc = page.sections.map((s) => ({ id: s.id, heading: s.heading }));

  return (
    <>
      <JsonLd data={articleSchema(page)} />
      <div className="container-page pt-6">
        <Breadcrumbs
          crumbs={[
            { name: "Home", path: "/" },
            { name: page.title, path: page.path },
          ]}
        />
      </div>
      <PageHeader eyebrow={page.eyebrow} title={page.title}>
        <Byline page={page} />
      </PageHeader>

      <div className="container-page grid gap-12 py-14 sm:py-20 lg:grid-cols-[240px_1fr] lg:gap-16">
        <aside className="lg:sticky lg:top-28 lg:self-start">
          {toc.length > 0 && (
            <>
              <p className="eyebrow">On this page</p>
              <ol className="mt-3 space-y-2 text-sm">
                {toc.map((s, i) => (
                  <li key={s.id}>
                    <a href={`#${s.id}`} className="group flex gap-3 text-muted transition-colors hover:text-foreground">
                      <span className="font-mono text-[11px] text-violet-400/80 group-hover:text-violet-300">{String(i + 1).padStart(2, "0")}</span>
                      {s.heading}
                    </a>
                  </li>
                ))}
              </ol>
            </>
          )}
          {compounds.length > 0 && page.kind === "guide" && (
            <>
              <p className="eyebrow mt-8">Compounds mentioned</p>
              <ul className="mt-3 space-y-2 text-sm">
                {compounds.map((p) => (
                  <li key={p.slug}>
                    <Link href={`/product/${p.slug}`} className="text-muted transition-colors hover:text-foreground">
                      {p.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}
        </aside>

        <div className="min-w-0">
          {page.notice && (
            <div className="mb-8 flex max-w-3xl gap-3 rounded-xl border border-line-strong bg-surface p-4 text-[13.5px] leading-relaxed text-ink-200">
              <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-violet-300" />
              <p>{page.notice}</p>
            </div>
          )}
          <Prose>
            {page.intro.body.length ? page.intro.body.map((p, i) => <p key={i}>{p}</p>) : <DeskBrief brief={page.intro.brief} />}
            {page.sections.map((s) => (
              <section key={s.id} aria-labelledby={s.id}>
                <h2 id={s.id}>{s.heading}</h2>
                {s.body.length ? s.body.map((p, i) => <p key={i}>{p}</p>) : <DeskBrief brief={s.brief} />}
                {s.diagram && <DeskBrief kind="diagram" brief={s.diagram} />}
              </section>
            ))}
          </Prose>

          {page.kind === "hub" && compounds.length > 0 && (
            <section aria-labelledby="compounds" className="mt-14">
              <h2 id="compounds" className="text-2xl font-semibold tracking-tight">
                Compounds in this hub
              </h2>
              <ProductGrid products={compounds} className="mt-6 lg:grid-cols-3 xl:grid-cols-3" priorityCount={0} />
            </section>
          )}

          <Citations citations={page.citations} />

          <div className="mt-14 flex max-w-3xl gap-3 rounded-xl border border-violet-400/25 bg-violet-500/[0.06] p-4">
            <FlaskConical aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-violet-300" />
            <p className="text-[13px] leading-relaxed text-ink-200">{site.compliance.ruo}</p>
          </div>
        </div>
      </div>
    </>
  );
}

function Byline({ page }: { page: GuidePage }) {
  return (
    <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm">
      {page.author && (
        <p>
          <span className="text-muted">Written by </span>
          {page.author}
        </p>
      )}
      {page.reviewer && (
        <p>
          <span className="text-muted">Reviewed by </span>
          {page.reviewer}
        </p>
      )}
      <p>
        <span className="text-muted">Last updated </span>
        <time dateTime={page.updated}>{dateFormat.format(new Date(`${page.updated}T00:00:00Z`))}</time>
      </p>
      {(!page.author || !page.reviewer) && <DeskBrief className="my-0 w-full" brief="Author and reviewer names for the byline (TODO SEO-DESK/KEANU)." />}
    </div>
  );
}

/** PubMed/DOI (or primary FDA/HHS) sources from the data. Nothing renders when there are none. */
export function Citations({ citations, title = "References" }: { citations: Citation[]; title?: string }) {
  if (!citations.length) return null;
  return (
    <section aria-labelledby="references" className="mt-14 max-w-3xl">
      <h2 id="references" className="text-2xl font-semibold tracking-tight">
        {title}
      </h2>
      <ol className="mt-5 list-decimal space-y-3 pl-5 text-sm text-ink-200 marker:text-violet-400">
        {citations.map((c) => (
          <li key={c.url}>
            <a href={c.url} target="_blank" rel="noopener noreferrer" className="text-violet-300 underline decoration-violet-400/40 underline-offset-4">
              {c.title}
            </a>
            {c.source && <span className="text-muted"> · {c.source}</span>}
          </li>
        ))}
      </ol>
    </section>
  );
}
