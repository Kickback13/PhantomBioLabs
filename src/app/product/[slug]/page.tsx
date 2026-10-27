import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { Suspense } from "react";
import { ChevronRight, FileText } from "lucide-react";
import { ProductPurchase, ProductPurchaseFromUrl } from "@/components/product/product-purchase";
import { ProductTabs } from "@/components/product/product-tabs";
import { ProductGrid } from "@/components/shop/product-grid";
import { findProductBySlug, getCoas, getProducts, getStoreSettings, type Coa, type Product } from "@/lib/catalog";
import { site } from "@/lib/site";
import { formatPrice } from "@/lib/utils";

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/product/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const { product } = await findProductBySlug(slug);
  if (!product) return {};
  return {
    title: product.name,
    description: `${product.name}: ${product.summary ?? "research compound"}. ≥99% HPLC purity, lot-specific COA. ${site.compliance.short}`,
    alternates: { canonical: `/product/${product.slug}` },
  };
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
  const sameCategory = products.filter((p) => p.id !== product.id && p.category?.slug === product.category?.slug);
  const related = [...sameCategory.filter((p) => p.inStock), ...sameCategory.filter((p) => !p.inStock), ...products.filter((p) => p.id !== product.id && p.inStock && !sameCategory.includes(p))].slice(0, 4);

  return (
    <>
      <div className="container-page pt-6 pb-16 sm:pt-8">
        <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-1.5 text-[13px] text-muted">
          <Link href="/shop" className="hover:text-foreground">
            Shop
          </Link>
          {product.category && (
            <>
              <ChevronRight className="size-3.5 text-subtle" />
              <Link href={`/category/${product.category.slug}`} className="hover:text-foreground">
                {product.category.name}
              </Link>
            </>
          )}
          <ChevronRight className="size-3.5 text-subtle" />
          <span className="text-foreground">{product.name}</span>
        </nav>

        <Suspense fallback={<ProductPurchase product={product} />}>
          <ProductPurchaseFromUrl product={product} />
        </Suspense>

        <div className="mt-16 sm:mt-20">
          <ProductTabs
            tabs={[
              { id: "description", label: "Description", content: <Description product={product} /> },
              { id: "specs", label: "Specifications", content: <Specs product={product} /> },
              { id: "coa", label: `COA${productCoas.length ? ` (${productCoas.length})` : ""}`, content: <CoaList coas={productCoas} /> },
              { id: "shipping", label: "Shipping", content: <Shipping thresholdCents={settings.freeShippingThresholdCents} /> },
            ]}
          />
        </div>
      </div>

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

function Description({ product }: { product: Product }) {
  return (
    <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
      <div className="max-w-2xl space-y-4 text-[15px] leading-relaxed text-ink-200">
        <p>{product.description}</p>
        <p className="text-muted">
          Supplied for in-vitro laboratory research and analytical use only. Not for human or animal use, and not for therapeutic, diagnostic or veterinary
          purposes. Buyers are responsible for complying with the laws of their jurisdiction.
        </p>
      </div>
      <div className="rounded-2xl border border-line bg-surface p-5">
        <p className="eyebrow">Available sizes</p>
        <ul className="mt-3 divide-y divide-line text-sm">
          {product.variants.map((v) => (
            <li key={v.id} className="flex items-center justify-between py-2.5">
              <span className="font-mono">{v.label}</span>
              <span className="flex items-center gap-3">
                <span className="tabular-nums">{formatPrice(v.priceCents)}</span>
                <span className={v.inStock ? "font-mono text-[10px] text-violet-300 uppercase" : "font-mono text-[10px] text-subtle uppercase"}>
                  {v.inStock ? "In stock" : "Out"}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Specs({ product }: { product: Product }) {
  const rows: [string, string][] = [
    ["Compound", product.name],
    ["Classification", product.summary ?? "—"],
    ["Research area", product.category?.name ?? "—"],
    ["Form", product.specs.form ?? "—"],
    ["Purity specification", product.specs.purity ?? "—"],
    ["Testing", "HPLC by an independent third-party lab, every lot"],
    ["Sizes", product.variants.map((v) => v.label).join(", ")],
    ["SKUs", product.variants.map((v) => v.sku).filter(Boolean).join(", ") || "—"],
    ["Intended use", "In-vitro laboratory research only"],
  ];
  return (
    <dl className="max-w-3xl divide-y divide-line overflow-hidden rounded-2xl border border-line">
      {rows.map(([k, v]) => (
        <div key={k} className="grid gap-1 px-5 py-3.5 sm:grid-cols-[220px_1fr] sm:gap-6">
          <dt className="font-mono text-[11px] tracking-[0.14em] text-muted uppercase sm:pt-0.5">{k}</dt>
          <dd className="text-sm">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

function CoaList({ coas }: { coas: Coa[] }) {
  if (!coas.length) {
    return (
      <div className="max-w-2xl rounded-2xl border border-dashed border-line-strong p-6">
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
  return (
    <ul className="grid max-w-3xl gap-3">
      {coas.map((c) => (
        <li key={c.id} className="flex flex-wrap items-center gap-4 rounded-2xl border border-line bg-surface p-4">
          <div className="grid size-10 place-items-center rounded-xl bg-violet-500/10 text-violet-300">
            <FileText className="size-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-medium">
              Lot {c.lotNumber}
              {c.variantLabel ? <span className="ml-2 font-mono text-xs text-muted">{c.variantLabel}</span> : null}
            </p>
            <p className="mt-0.5 text-xs text-muted">
              {[c.testedOn && `Tested ${new Date(c.testedOn + "T00:00:00").toLocaleDateString("en-US", { dateStyle: "medium" })}`, c.purityPercent && `${c.purityPercent}% purity`, c.labName]
                .filter(Boolean)
                .join(" · ")}
            </p>
          </div>
          <a href={c.fileUrl} target="_blank" rel="noopener noreferrer" className="rounded-lg border border-line-strong px-3 py-1.5 text-sm hover:border-violet-400/60">
            View PDF
          </a>
        </li>
      ))}
    </ul>
  );
}

function Shipping({ thresholdCents }: { thresholdCents: number }) {
  return (
    <div className="grid max-w-3xl gap-4 text-[15px] leading-relaxed text-ink-200 sm:grid-cols-2">
      {[
        ["Dispatch", "Orders placed before 2pm ET on business days ship the same day. Later orders ship the next business day."],
        ["Carriers", "Domestic orders ship by USPS Priority or UPS Ground in discreet, unmarked packaging."],
        ["Free shipping", `Orders over ${formatPrice(thresholdCents).replace(".00", "")} ship free within the United States.`],
        ["Handling", "Lyophilized peptides are typically stable sealed at 2–8°C. Storage notes are on each COA."],
      ].map(([title, body]) => (
        <div key={title} className="rounded-2xl border border-line bg-surface p-5">
          <p className="eyebrow">{title}</p>
          <p className="mt-2 text-sm text-ink-200">{body}</p>
        </div>
      ))}
    </div>
  );
}
