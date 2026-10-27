import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { createPublicClient } from "./supabase/public";

// Cache tags. Admin edits call updateTag(CATALOG_TAG) so changes show up right away.
export const CATALOG_TAG = "catalog";
export const SETTINGS_TAG = "settings";

export type Category = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  productCount: number;
};

export type Variant = {
  id: string;
  label: string;
  sku: string | null;
  priceCents: number;
  compareAtCents: number | null;
  inStock: boolean;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  summary: string | null;
  description: string | null;
  specs: Record<string, string | null>;
  featuredRank: number | null;
  category: { slug: string; name: string } | null;
  variants: Variant[];
  inStock: boolean;
};

export type StoreSettings = {
  freeShippingThresholdCents: number;
  flatShippingCents: number;
};

const PRODUCT_SELECT =
  "id, slug, name, summary, description, specs, featured_rank, sort_order, category:categories(slug, name), variants:product_variants(id, label, sku, price_cents, compare_at_cents, in_stock, sort_order)";

type ProductRow = {
  id: string;
  slug: string;
  name: string;
  summary: string | null;
  description: string | null;
  specs: unknown;
  featured_rank: number | null;
  sort_order: number;
  category: { slug: string; name: string } | null;
  variants: {
    id: string;
    label: string;
    sku: string | null;
    price_cents: number;
    compare_at_cents: number | null;
    in_stock: boolean;
    sort_order: number;
  }[];
};

function toProduct(row: ProductRow): Product {
  const variants = [...row.variants]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((v) => ({
      id: v.id,
      label: v.label,
      sku: v.sku,
      priceCents: v.price_cents,
      compareAtCents: v.compare_at_cents && v.compare_at_cents > v.price_cents ? v.compare_at_cents : null,
      inStock: v.in_stock,
    }));
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    summary: row.summary,
    description: row.description,
    specs: (row.specs ?? {}) as Record<string, string | null>,
    featuredRank: row.featured_rank,
    category: row.category,
    variants,
    inStock: variants.some((v) => v.inStock),
  };
}

export async function getProducts(): Promise<Product[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(CATALOG_TAG);
  const { data, error } = await createPublicClient()
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("status", "active")
    .order("sort_order");
  if (error) throw new Error(`Could not load products: ${error.message}`);
  return (data as unknown as ProductRow[]).map(toProduct);
}

export async function getFeaturedProducts(limit = 8): Promise<Product[]> {
  const products = await getProducts();
  const featured = products
    .filter((p) => p.featuredRank !== null && p.inStock)
    .sort((a, b) => (a.featuredRank ?? 0) - (b.featuredRank ?? 0));
  const fill = products.filter((p) => p.inStock && !featured.includes(p));
  return [...featured, ...fill].slice(0, limit);
}

export async function getProduct(slug: string): Promise<Product | null> {
  const products = await getProducts();
  return products.find((p) => p.slug === slug) ?? null;
}

export async function getCategories(): Promise<Category[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(CATALOG_TAG);
  const supabase = createPublicClient();
  const [{ data: categories, error }, products] = await Promise.all([
    supabase.from("categories").select("id, slug, name, description").order("sort_order"),
    getProducts(),
  ]);
  if (error) throw new Error(`Could not load categories: ${error.message}`);
  return (categories ?? []).map((c) => ({
    ...c,
    productCount: products.filter((p) => p.category?.slug === c.slug).length,
  }));
}

export async function getStoreSettings(): Promise<StoreSettings> {
  "use cache";
  cacheLife("hours");
  cacheTag(SETTINGS_TAG);
  const { data, error } = await createPublicClient().from("settings").select("key, value");
  if (error) throw new Error(`Could not load settings: ${error.message}`);
  const map = new Map((data ?? []).map((row) => [row.key, row.value]));
  return {
    freeShippingThresholdCents: Number(map.get("free_shipping_threshold_cents") ?? 12500),
    flatShippingCents: Number(map.get("flat_shipping_cents") ?? 999),
  };
}
