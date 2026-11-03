import { getProducts } from "@/lib/catalog";
import { ogCard } from "@/lib/og-card";

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((p) => ({ slug: p.slug }));
}

// Per-product 1200×630 share card. Product photos are square, so this card is used for sharing
// even after the real photos arrive.
export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = (await getProducts()).find((p) => p.slug === slug);
  if (!product) return new Response("Not found", { status: 404 });
  return ogCard({
    eyebrow: product.category?.name ?? "Research compound",
    title: product.name,
    footnote: `${product.variants.map((v) => v.label).join(" · ")}  ·  For laboratory research use only`,
  });
}
