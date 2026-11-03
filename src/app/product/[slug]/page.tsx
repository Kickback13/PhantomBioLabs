import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { BookOpen, FileText, FlaskConical } from "lucide-react";
import { Citations } from "@/components/content/guide-layout";
import { ProductPurchase, ProductPurchaseFromUrl } from "@/components/product/product-purchase";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { DeskBrief } from "@/components/seo/desk-brief";
import { JsonLd } from "@/components/seo/json-ld";
import { ProductGrid } from "@/components/shop/product-grid";
import { findProductBySlug, getCoas, getProducts, getStoreSettings, type Coa, type Product } from "@/lib/catalog";
import { pageMetadata, productTitle } from "@/lib/seo";
import { site } from "@/lib/site";
import { faqSchema, productSchema } from "@/lib/structured-data";
import { getGuide, isGuideVisible } from "@/content/guides";
import { coaPath, formatTestedOn } from "@/lib/coa";
import { compoundFacts, type CompoundFacts } from "@/lib/compound-facts";

const LAB_HANDLING_GUIDE = "/guides/lab-handling-reconstitution-storage";
import { formatPrice } from "@/lib/utils";

const isSupply = (product: Product) => product.category?.slug === "solvents-and-supplies";

/** "{Compound} research peptide, third-party HPLC tested with lot-specific COA. For laboratory research use only." */
function productDescription(product: Product) {
  if (isSupply(product)) {
    return `${product.name}: ${(product.summary ?? "laboratory supply").toLowerCase()} for lyophilized research peptides. For laboratory research use only.`;
  }
  // TODO(SEO-DESK/KEANU): add "to ≥99%" and "Same-day dispatch" once both are confirmed for current stock.
  return `${product.name} research peptide, third-party HPLC tested with lot-specific COA. For laboratory research use only.`;
}

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/product/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const { product } = await findProductBySlug(slug);
  if (!product) return {};
  const coas = (await getCoas()).filter((c) => c.productSlug === product.slug);
  return pageMetadata({
    title: productTitle(product.name, { isSupply: isSupply(product), coaPurity99: coas.some((c) => (c.purityPercent ?? 0) >= 99) }),
    description: productDescription(product),
    path: `/product/${product.slug}`,
    image: `/og/product/${product.slug}`,
    imageAlt: `${product.name}, ${site.name}`,
  });
}

export default function ProductPage(props: PageProps<"/product/[slug]">) {
  return (
    <Suspense fallback={<div className="container-page min-h-[80vh] py-10" />}>
      <ProductView params={props.params} />
    </Suspense>
  );
}

async function ProductView({ params }: Pick<PageProps<"/product/[slug]">, "params">) {
  const { slug } = await params;
  const { product, redirectTo } = await findProductBySlug(slug);
  if (redirectTo) permanentRedirect(`/product/${redirectTo}`);
  if (!product) notFound();

  const [products, coas, settings] = await Promise.all([getProducts(), getCoas(), getStoreSettings()]);
  const productCoas = coas.filter((c) => c.productSlug === product.slug);
  const facts = compoundFacts(product.slug);
  const handling = getGuide(LAB_HANDLING_GUIDE);
  const sameCategory = products.filter((p) => p.id !== product.id && p.category?.slug === product.category?.slug);
  const related = [...sameCategory.filter((p) => p.inStock), ...sameCategory.filter((p) => !p.inStock), ...products.filter((p) => p.id !== product.id && p.inStock && !sameCategory.includes(p))].slice(0, 4);

  return (
    <>
      <JsonLd data={productSchema(product, settings, productCoas)} />
      {facts.faq.length > 0 && <JsonLd data={faqSchema(facts.faq)} />}
      <div className="container-page pt-6 pb-16 sm:pt-8">
        <Breadcrumbs
          className="mb-6"
          crumbs={[
            { name: "Home", path: "/" },
            { name: "Shop", path: "/shop" },
            ...(product.category ? [{ name: product.category.name, path: `/category/${product.category.slug}` }] : []),
            { name: product.name, path: `/product/${product.slug}` },
          ]}
        />

        {/* 1. H1 and variant picker */}
        <Suspense fallback={<ProductPurchase product={product} />}>
          <ProductPurchaseFromUrl product={product} />
        </Suspense>

        <div className="mt-16 grid gap-14 sm:mt-20 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          <div className="min-w-0 space-y-14">
            {/* 2. Key facts, 3. COA link */}
            <Section id="key-facts" eyebrow="Specifications" title="Key facts">
              <KeyFacts product={product} facts={facts} coa={productCoas[0] ?? null} />
              <CoaLinks coas={productCoas} />
            </Section>

            {/* 4. Research overview: catalog description, desk copy, citations from data */}
            <Section id="research-overview" eyebrow="Research" title="Research overview">
              <div className="max-w-2xl space-y-4 text-[15px] leading-relaxed text-ink-200">
                <p>{product.description}</p>
              </div>
              <DeskBrief brief={`Research overview for ${product.name}: "studied in [model] research" wording only, each statement cited (PubMed/DOI in data/compound-facts.json). No human or animal use, benefit or dosing.`} />
              <Citations citations={facts.citations} />
            </Section>

            {/* 7. Short FAQ from data */}
            {facts.faq.length > 0 && (
              <Section id="faq" eyebrow="FAQ" title={`${product.name} questions`}>
                <div className="divide-y divide-line border-y border-line">
                  {facts.faq.map((item) => (
                    <details key={item.q} className="group py-1 [&_summary::-webkit-details-marker]:hidden">
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-4 font-medium">{item.q}</summary>
                      <p className="pb-5 text-[14.5px] leading-relaxed text-muted">{item.a}</p>
                    </details>
                  ))}
                </div>
              </Section>
            )}
          </div>

          <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
            {/* 5. Lab handling link (only once the guide is live) */}
            {isGuideVisible(handling) && (
              <Link href={handling.path} className="group flex gap-4 rounded-2xl border border-line bg-surface p-5 transition-colors hover:border-violet-400/50">
                <BookOpen aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-violet-300" />
                <span>
                  <span className="block font-medium group-hover:text-violet-200">{handling.title}</span>
                  <span className="mt-1 block text-sm text-muted">In-vitro concentration math, solvents, and storage of lyophilized research peptides.</span>
                </span>
              </Link>
            )}
            {/* 6. RUO disclaimer */}
            <div className="flex gap-3 rounded-2xl border border-violet-400/25 bg-violet-500/[0.06] p-5">
              <FlaskConical aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-violet-300" />
              <p className="text-[13px] leading-relaxed text-ink-200">
                {site.compliance.ruo} Buyers are responsible for complying with the laws of their jurisdiction.
              </p>
            </div>
            <ShippingNote thresholdCents={settings.freeShippingThresholdCents} />
          </aside>
        </div>
      </div>

      {/* 8. Related compounds */}
      {related.length > 0 && (
        <section className="border-t border-line bg-ink-900/40 py-16 sm:py-20">
          <div className="container-page">
            <p className="eyebrow">Related compounds</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
              More in {product.category?.name ?? "the catalog"}
            </h2>
            <ProductGrid products={related} className="mt-8" priorityCount={0} />
          </div>
        </section>
      )}
    </>
  );
}

function Section({ id, eyebrow, title, children }: { id: string; eyebrow: string; title: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={id} className="scroll-mt-28">
      <p className="eyebrow">{eyebrow}</p>
      <h2 id={id} className="mt-2 text-2xl font-semibold tracking-[-0.03em] sm:text-3xl">
        {title}
      </h2>
      <div className="mt-6">{children}</div>
    </section>
  );
}

/** Every value comes from the catalog, data/compound-facts.json or the latest published COA. Empty rows are hidden. */
function KeyFacts({ product, facts, coa }: { product: Product; facts: CompoundFacts; coa: Coa | null }) {
  const rows: [string, string | null | undefined][] = [
    ["Compound", product.name],
    ["Sequence", facts.sequence],
    ["Molecular formula", facts.molecularFormula],
    ["Molecular weight", facts.molecularWeight],
    ["CAS number", facts.cas],
    ["Salt form", facts.saltForm],
    ["Format", product.specs.form],
    ["Sizes", product.variants.map((v) => v.label).join(", ")],
    ["Purity specification", product.specs.purity],
    ["Test method", isSupply(product) ? null : "HPLC by an independent third-party lab, every lot"],
    ["Current lot", coa?.lotNumber],
    ["Lot purity", coa?.purityPercent != null ? `${coa.purityPercent.toFixed(2)}%` : null],
    ["Laboratory", coa?.labName],
    ["Test date", formatTestedOn(coa?.testedOn ?? null)],
    ["Storage", facts.storage],
    ["SKUs", product.variants.map((v) => v.sku).filter(Boolean).join(", ") || null],
  ];
  return (
    <dl className="divide-y divide-line overflow-hidden rounded-2xl border border-line">
      {rows
        .filter((r): r is [string, string] => Boolean(r[1]))
        .map(([k, v]) => (
          <div key={k} className="grid gap-1 px-5 py-3.5 sm:grid-cols-[200px_1fr] sm:gap-6">
            <dt className="font-mono text-[11px] tracking-[0.14em] text-muted uppercase sm:pt-0.5">{k}</dt>
            <dd className="text-sm break-words">{v}</dd>
          </div>
        ))}
    </dl>
  );
}

function CoaLinks({ coas }: { coas: Coa[] }) {
  if (!coas.length) {
    return (
      <div className="mt-5 rounded-2xl border border-dashed border-line-strong p-5">
        <p className="font-medium">Certificates for current lots are being published.</p>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          A lot-specific Certificate of Analysis ships in every box. To see the COA for a specific lot before ordering, message us on{" "}
          <a href={site.contact.whatsappHref} className="text-violet-300 hover:underline">
            WhatsApp
          </a>
          .
        </p>
      </div>
    );
  }
  const [latest, ...older] = coas;
  return (
    <div className="mt-5">
      <Link href={coaPath(latest)} className="inline-flex items-center gap-2 rounded-xl border border-line-strong px-4 py-2.5 text-sm font-medium hover:border-violet-400/60 hover:bg-violet-500/10">
        <FileText aria-hidden="true" className="size-4 text-violet-300" /> View this lot&apos;s COA (lot {latest.lotNumber})
      </Link>
      {older.length > 0 && (
        <p className="mt-3 text-sm text-muted">
          Earlier lots:{" "}
          {older.map((c, i) => (
            <span key={c.id}>
              {i > 0 && ", "}
              <Link href={coaPath(c)} className="text-violet-300 hover:underline">
                {c.lotNumber}
              </Link>
            </span>
          ))}
        </p>
      )}
    </div>
  );
}

function ShippingNote({ thresholdCents }: { thresholdCents: number }) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-5 text-sm leading-relaxed text-ink-200">
      <p className="eyebrow">Shipping</p>
      <p className="mt-2">
        Orders placed before {site.dispatch.cutoff} on business days ship the same day by USPS Priority or UPS Ground, in discreet packaging. Free U.S. shipping over{" "}
        {formatPrice(thresholdCents).replace(".00", "")}.{" "}
        <Link href="/shipping" className="text-violet-300 hover:underline">
          Shipping &amp; returns
        </Link>
      </p>
    </div>
  );
}
