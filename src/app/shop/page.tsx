import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { ProductGrid } from "@/components/shop/product-grid";
import { ShopBrowser } from "@/components/shop/shop-browser";
import { getCategories, getProducts } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Shop research peptides",
  description: "Browse every lot-verified research compound by research area. HPLC-tested to ≥99% purity. For laboratory research use only.",
};

export default async function ShopPage() {
  const [products, categories] = await Promise.all([getProducts(), getCategories()]);
  const inStock = products.filter((p) => p.inStock).length;
  return (
    <>
      <PageHeader
        eyebrow="Catalog"
        title={
          <>
            Every compound.
            <br />
            <span className="text-gradient-violet">Every lot verified.</span>
          </>
        }
        description={`${products.length} research compounds across ${categories.length} research areas, ${inStock} in stock and ready to ship today.`}
      />
      <div className="container-page pb-8">
        {/* Filters read the URL, so they render in the browser; the full grid shows until then. */}
        <Suspense fallback={<ProductGrid products={products} className="mt-8" />}>
          <ShopBrowser products={products} categories={categories} />
        </Suspense>
      </div>
    </>
  );
}
