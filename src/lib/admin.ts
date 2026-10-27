import "server-only";
import type { Database } from "./supabase/database.types";
import { createClient } from "./supabase/server";

// Data loaders for the admin area. They read as the signed-in admin (row-level security lets
// admins see hidden products, every order and unpublished COAs). Request-time only: call them
// inside <Suspense> after requireAdmin(), never inside "use cache".

export type OrderStatus = Database["public"]["Enums"]["order_status"];
export const ORDER_STATUSES: { value: OrderStatus; label: string }[] = [
  { value: "pending_payment", label: "Pending payment" },
  { value: "paid", label: "Paid" },
  { value: "processing", label: "Processing" },
  { value: "shipped", label: "Shipped" },
  { value: "cancelled", label: "Cancelled" },
  { value: "refunded", label: "Refunded" },
];

export type AdminVariant = {
  id: string;
  label: string;
  sku: string | null;
  priceCents: number;
  compareAtCents: number | null;
  inStock: boolean;
  stockQuantity: number | null;
  active: boolean;
  sortOrder: number;
};

export type AdminProduct = {
  id: string;
  slug: string;
  legacySlug: string | null;
  name: string;
  summary: string | null;
  description: string | null;
  status: "active" | "hidden";
  featuredRank: number | null;
  categoryId: string | null;
  categoryName: string | null;
  updatedAt: string;
  variants: AdminVariant[];
};

const PRODUCT_SELECT =
  "id, slug, legacy_slug, name, summary, description, status, featured_rank, sort_order, updated_at, category_id, category:categories(name), variants:product_variants(id, label, sku, price_cents, compare_at_cents, in_stock, stock_quantity, active, sort_order)";

type ProductRow = {
  id: string;
  slug: string;
  legacy_slug: string | null;
  name: string;
  summary: string | null;
  description: string | null;
  status: "active" | "hidden";
  featured_rank: number | null;
  updated_at: string;
  category_id: string | null;
  category: { name: string } | null;
  variants: {
    id: string;
    label: string;
    sku: string | null;
    price_cents: number;
    compare_at_cents: number | null;
    in_stock: boolean;
    stock_quantity: number | null;
    active: boolean;
    sort_order: number;
  }[];
};

function toAdminProduct(row: ProductRow): AdminProduct {
  return {
    id: row.id,
    slug: row.slug,
    legacySlug: row.legacy_slug,
    name: row.name,
    summary: row.summary,
    description: row.description,
    status: row.status,
    featuredRank: row.featured_rank,
    categoryId: row.category_id,
    categoryName: row.category?.name ?? null,
    updatedAt: row.updated_at,
    variants: [...row.variants]
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((v) => ({
        id: v.id,
        label: v.label,
        sku: v.sku,
        priceCents: v.price_cents,
        compareAtCents: v.compare_at_cents,
        inStock: v.in_stock,
        stockQuantity: v.stock_quantity,
        active: v.active,
        sortOrder: v.sort_order,
      })),
  };
}

export async function getAdminProducts(): Promise<AdminProduct[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("products").select(PRODUCT_SELECT).order("sort_order");
  if (error) throw new Error(`Could not load products: ${error.message}`);
  return (data as unknown as ProductRow[]).map(toAdminProduct);
}

export async function getAdminProduct(id: string): Promise<AdminProduct | null> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const supabase = await createClient();
  const { data, error } = await supabase.from("products").select(PRODUCT_SELECT).eq("id", id).maybeSingle();
  if (error) throw new Error(`Could not load product: ${error.message}`);
  return data ? toAdminProduct(data as unknown as ProductRow) : null;
}

export async function getAdminCategories() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("categories").select("id, slug, name").order("sort_order");
  if (error) throw new Error(`Could not load categories: ${error.message}`);
  return data ?? [];
}

export type AdminCoa = {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  variantId: string | null;
  variantLabel: string | null;
  lotNumber: string;
  testedOn: string | null;
  purityPercent: number | null;
  labName: string | null;
  filePath: string;
  fileUrl: string;
  published: boolean;
  createdAt: string;
};

export async function getAdminCoas(): Promise<AdminCoa[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("coas")
    .select("id, product_id, variant_id, lot_number, tested_on, purity_percent, lab_name, file_path, published, created_at, product:products(name, slug), variant:product_variants(label)")
    .order("created_at", { ascending: false });
  if (error) throw new Error(`Could not load COAs: ${error.message}`);
  type Row = {
    id: string;
    product_id: string;
    variant_id: string | null;
    lot_number: string;
    tested_on: string | null;
    purity_percent: number | null;
    lab_name: string | null;
    file_path: string;
    published: boolean;
    created_at: string;
    product: { name: string; slug: string } | null;
    variant: { label: string } | null;
  };
  return ((data ?? []) as unknown as Row[]).map((r) => ({
    id: r.id,
    productId: r.product_id,
    productName: r.product?.name ?? "Deleted product",
    productSlug: r.product?.slug ?? "",
    variantId: r.variant_id,
    variantLabel: r.variant?.label ?? null,
    lotNumber: r.lot_number,
    testedOn: r.tested_on,
    purityPercent: r.purity_percent,
    labName: r.lab_name,
    filePath: r.file_path,
    fileUrl: supabase.storage.from("coas").getPublicUrl(r.file_path).data.publicUrl,
    published: r.published,
    createdAt: r.created_at,
  }));
}

export type AdminOrderSummary = {
  id: string;
  orderNumber: number;
  email: string;
  status: OrderStatus;
  totalCents: number;
  itemCount: number;
  createdAt: string;
};

export async function getAdminOrders(status?: OrderStatus | null): Promise<AdminOrderSummary[]> {
  const supabase = await createClient();
  let query = supabase
    .from("orders")
    .select("id, order_number, email, status, total_cents, created_at, items:order_items(quantity)")
    .order("created_at", { ascending: false })
    .limit(200);
  if (status) query = query.eq("status", status);
  const { data, error } = await query;
  if (error) throw new Error(`Could not load orders: ${error.message}`);
  type Row = { id: string; order_number: number; email: string; status: OrderStatus; total_cents: number; created_at: string; items: { quantity: number }[] };
  return ((data ?? []) as unknown as Row[]).map((o) => ({
    id: o.id,
    orderNumber: o.order_number,
    email: o.email,
    status: o.status,
    totalCents: o.total_cents,
    itemCount: o.items.reduce((n, i) => n + i.quantity, 0),
    createdAt: o.created_at,
  }));
}

export async function getAdminOrder(id: string) {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*, items:order_items(id, product_name, variant_label, sku, unit_price_cents, quantity, line_total_cents, product:products(slug))")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(`Could not load order: ${error.message}`);
  return data as
    | (Database["public"]["Tables"]["orders"]["Row"] & {
        items: {
          id: string;
          product_name: string;
          variant_label: string;
          sku: string | null;
          unit_price_cents: number;
          quantity: number;
          line_total_cents: number;
          product: { slug: string } | null;
        }[];
      })
    | null;
}

export async function getAdminDashboard() {
  const supabase = await createClient();
  const [products, variants, orders] = await Promise.all([
    supabase.from("products").select("status"),
    supabase.from("product_variants").select("in_stock, active"),
    supabase.from("orders").select("status, total_cents"),
  ]);
  if (products.error || variants.error || orders.error) {
    throw new Error(`Could not load dashboard: ${(products.error ?? variants.error ?? orders.error)!.message}`);
  }
  const countBy = <T,>(rows: T[], pick: (r: T) => boolean) => rows.filter(pick).length;
  const orderRows = orders.data ?? [];
  return {
    productsActive: countBy(products.data ?? [], (p) => p.status === "active"),
    productsHidden: countBy(products.data ?? [], (p) => p.status === "hidden"),
    sizesInStock: countBy(variants.data ?? [], (v) => v.active && v.in_stock),
    sizesOutOfStock: countBy(variants.data ?? [], (v) => v.active && !v.in_stock),
    ordersByStatus: Object.fromEntries(ORDER_STATUSES.map((s) => [s.value, countBy(orderRows, (o) => o.status === s.value)])) as Record<OrderStatus, number>,
    ordersTotal: orderRows.length,
    paidRevenueCents: orderRows
      .filter((o) => ["paid", "processing", "shipped"].includes(o.status))
      .reduce((n, o) => n + o.total_cents, 0),
  };
}

export type AdminSettings = {
  freeShippingThresholdCents: number;
  flatShippingCents: number;
  supportWhatsapp: string;
  supportHours: string;
};

export async function getAdminSettings(): Promise<AdminSettings> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("settings").select("key, value");
  if (error) throw new Error(`Could not load settings: ${error.message}`);
  const map = new Map((data ?? []).map((r) => [r.key, r.value]));
  return {
    freeShippingThresholdCents: Number(map.get("free_shipping_threshold_cents") ?? 12500),
    flatShippingCents: Number(map.get("flat_shipping_cents") ?? 999),
    supportWhatsapp: String(map.get("support_whatsapp") ?? ""),
    supportHours: String(map.get("support_hours") ?? ""),
  };
}
