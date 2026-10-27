import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { ProductGrid } from "@/components/shop/product-grid";
import { getCategories, getProducts } from "@/lib/catalog";
import { categoryImage } from "@/lib/images";
import { cn } from "@/lib/utils";

export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/category/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const category = (await getCategories()).find((c) => c.slug === slug);
  if (!category) return {};
  return {
    title: `${category.name} research peptides`,
    description: `${category.description ?? ""} Lot-verified, ≥99% HPLC purity. For laboratory research use only.`.trim(),
  };
}

export default function CategoryPage(props: PageProps<"/category/[slug]">) {
  return (
    <Suspense fallback={<div className="container-page min-h-[60vh] py-20" />}>
      <CategoryView params={props.params} />
    </Suspense>
  );
}

async function CategoryView({ params }: Pick<PageProps<"/category/[slug]">, "params">) {
  const { slug } = await params;
  const [categories, products] = await Promise.all([getCategories(), getProducts()]);
  const category = categories.find((c) => c.slug === slug);
  if (!category) notFound();
  const items = products
    .filter((p) => p.category?.slug === slug)
    .sort((a, b) => (a.inStock === b.inStock ? a.name.localeCompare(b.name) : a.inStock ? -1 : 1));
  const banner = categoryImage(slug);

  return (
    <>
      <PageHeader
        eyebrow={`Research area · ${String(categories.indexOf(category) + 1).padStart(2, "0")}`}
        title={category.name}
        description={category.description}
      >
        <p className="font-mono text-[11px] tracking-[0.14em] text-muted uppercase">
          {items.length} {items.length === 1 ? "compound" : "compounds"} · {items.filter((p) => p.inStock).length} in stock
        </p>
      </PageHeader>
      {banner && (
        <div className="container-page mt-8">
          <div className="relative aspect-[16/6] overflow-hidden rounded-2xl border border-line">
            <Image src={banner} alt="" fill preload sizes="(min-width: 1320px) 1240px, 100vw" className="object-cover" />
          </div>
        </div>
      )}
      <div className="container-page mt-10">
        <nav aria-label="Research areas" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0 [&::-webkit-scrollbar]:hidden">
          {categories.map((c) => (
            <Link
              key={c.slug}
              href={`/category/${c.slug}`}
              aria-current={c.slug === slug ? "page" : undefined}
              className={cn(
                "flex h-9 shrink-0 items-center rounded-full border px-3.5 text-[13px] transition-colors",
                c.slug === slug ? "border-violet-400/70 bg-violet-500/15 text-foreground" : "border-line text-muted hover:border-line-strong hover:text-foreground",
              )}
            >
              {c.name}
            </Link>
          ))}
        </nav>
        <ProductGrid products={items} className="mt-8" />
      </div>
    </>
  );
}
