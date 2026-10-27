import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProductCard } from "@/components/product/product-card";
import { Button } from "@/components/ui/button";
import { getFeaturedProducts, getProducts } from "@/lib/catalog";
import { SectionHeading } from "./section-heading";

export async function FeaturedProducts() {
  const [featured, all] = await Promise.all([getFeaturedProducts(8), getProducts()]);
  return (
    <section className="border-y border-line bg-ink-900/40 py-20 sm:py-28">
      <div className="container-page">
        <SectionHeading
          index="02"
          eyebrow="In stock now"
          title="Ready to ship today."
          description="Lot-verified compounds in stock and dispatched the same day when ordered before 2pm ET."
          action={
            <Button asChild variant="outline">
              <Link href="/shop">
                View all {all.length} compounds <ArrowRight />
              </Link>
            </Button>
          }
        />
      </div>
      {/* Swipe row on phones, grid from tablet up */}
      <div className="mt-12 sm:container-page">
        <ul className="flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-4 [scrollbar-width:none] sm:grid sm:grid-cols-2 sm:gap-4 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-4 [&::-webkit-scrollbar]:hidden">
          {featured.map((product, i) => (
            <li key={product.id} className="w-[78vw] max-w-[320px] shrink-0 snap-start sm:w-auto sm:max-w-none">
              <ProductCard product={product} priority={i < 2} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
