// Input parsing and validation for admin forms. Plain functions, shared by the Server Actions.

export const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export type VariantInput = {
  id?: string;
  label: string;
  sku: string;
  price: string;
  compareAt: string;
  inStock: boolean;
  stockQuantity: string;
  active: boolean;
};

export type CleanVariant = {
  id: string | null;
  label: string;
  sku: string | null;
  price_cents: number;
  compare_at_cents: number | null;
  in_stock: boolean;
  stock_quantity: number | null;
  active: boolean;
  sort_order: number;
};

export type CleanProduct = {
  id: string | null;
  name: string;
  slug: string;
  category_id: string | null;
  summary: string | null;
  description: string | null;
  status: "active" | "hidden";
  featured_rank: number | null;
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** "34.99" or "$1,034.9" -> cents. Empty -> null. Invalid -> NaN. */
export function parseDollars(value: string): number | null {
  const clean = value.replace(/[$,\s]/g, "");
  if (!clean) return null;
  if (!/^\d+(\.\d{1,2})?$/.test(clean)) return Number.NaN;
  return Math.round(Number(clean) * 100);
}

function parseWholeNumber(value: string): number | null {
  const clean = value.trim();
  if (!clean) return null;
  return /^\d+$/.test(clean) ? Number(clean) : Number.NaN;
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function validateProduct(form: FormData) {
  const errors: Record<string, string> = {};
  const text = (key: string) => String(form.get(key) ?? "").trim();

  const id = text("id");
  const name = text("name");
  const slug = text("slug").toLowerCase();
  const categoryId = text("category_id");
  const summary = text("summary");
  const description = text("description");
  const featured = parseWholeNumber(text("featured_rank"));

  if (id && !UUID.test(id)) errors.form = "This product can't be found. Reload the page and try again.";
  if (!name) errors.name = "Name is required.";
  else if (name.length > 120) errors.name = "Keep the name under 120 characters.";
  if (!slug) errors.slug = "URL is required.";
  else if (!SLUG_PATTERN.test(slug) || slug.length > 80) errors.slug = "Use lowercase letters, numbers and single hyphens, e.g. bpc-157.";
  if (categoryId && !UUID.test(categoryId)) errors.category_id = "Pick a category from the list.";
  if (summary.length > 160) errors.summary = "Keep the summary under 160 characters.";
  if (description.length > 4000) errors.description = "Keep the description under 4,000 characters.";
  if (Number.isNaN(featured) || (featured !== null && featured > 999)) errors.featured_rank = "Use a whole number from 1 to 999, or leave it empty.";

  let rawVariants: VariantInput[] = [];
  try {
    const parsed = JSON.parse(String(form.get("variants") ?? "[]"));
    if (Array.isArray(parsed)) rawVariants = parsed;
  } catch {
    errors.variants = "The size list couldn't be read. Reload the page and try again.";
  }
  if (!errors.variants && rawVariants.length === 0) errors.variants = "Add at least one size.";
  if (rawVariants.length > 20) errors.variants = "A product can have up to 20 sizes.";

  const variants: CleanVariant[] = [];
  const labels = new Set<string>();
  rawVariants.forEach((v, index) => {
    const row = `Size ${index + 1}`;
    const label = String(v.label ?? "").trim();
    const sku = String(v.sku ?? "").trim().toUpperCase();
    const price = parseDollars(String(v.price ?? ""));
    const compareAt = parseDollars(String(v.compareAt ?? ""));
    const stock = parseWholeNumber(String(v.stockQuantity ?? ""));
    const variantId = v.id && UUID.test(v.id) ? v.id : null;

    if (!label) errors[`variant_${index}`] = `${row}: add a label, e.g. 10 mg.`;
    else if (label.length > 40) errors[`variant_${index}`] = `${row}: keep the label under 40 characters.`;
    else if (labels.has(label.toLowerCase())) errors[`variant_${index}`] = `${row}: "${label}" is listed twice.`;
    else if (sku.length > 40 || (sku && !/^[A-Z0-9-]+$/.test(sku))) errors[`variant_${index}`] = `${row}: SKUs use letters, numbers and hyphens only.`;
    else if (price === null || Number.isNaN(price)) errors[`variant_${index}`] = `${row}: enter a price like 34.99.`;
    else if (price > 10_000_000) errors[`variant_${index}`] = `${row}: that price looks too high.`;
    else if (compareAt !== null && (Number.isNaN(compareAt) || compareAt <= price))
      errors[`variant_${index}`] = `${row}: the "was" price must be higher than the price, or empty.`;
    else if (Number.isNaN(stock) || (stock !== null && stock > 1_000_000)) errors[`variant_${index}`] = `${row}: stock count must be a whole number, or empty.`;
    labels.add(label.toLowerCase());

    variants.push({
      id: variantId,
      label,
      sku: sku || null,
      price_cents: price && !Number.isNaN(price) ? price : 0,
      compare_at_cents: compareAt && !Number.isNaN(compareAt) ? compareAt : null,
      in_stock: Boolean(v.inStock),
      stock_quantity: stock !== null && !Number.isNaN(stock) ? stock : null,
      active: v.active !== false,
      sort_order: index,
    });
  });

  const product: CleanProduct = {
    id: id || null,
    name,
    slug,
    category_id: categoryId || null,
    summary: summary || null,
    description: description || null,
    status: form.get("active") === "off" ? "hidden" : "active",
    featured_rank: featured !== null && !Number.isNaN(featured) && featured > 0 ? featured : null,
  };

  return { errors, product, variants };
}

/** Turns Postgres constraint errors into messages a store owner can act on. */
export function friendlyDbError(error: { code?: string; message?: string; details?: string } | null | undefined) {
  if (!error) return "Something went wrong.";
  const text = `${error.message ?? ""} ${error.details ?? ""}`;
  if (error.code === "23505") {
    if (text.includes("products_slug_key")) return "Another product already uses that URL.";
    if (text.includes("legacy_slug")) return "That old URL is already redirecting to another product. Pick a different URL.";
    if (text.includes("sku")) return "That SKU is already used by another size.";
    if (text.includes("product_id_label")) return "Two sizes on this product have the same label.";
    return "That value is already in use.";
  }
  if (error.code === "23514") {
    if (text.includes("compare_at")) return "A \"was\" price must be higher than the price.";
    if (text.includes("slug")) return "The URL can only use lowercase letters, numbers and hyphens.";
    return "One of the values isn't allowed.";
  }
  if (error.code === "42501") return "Your account doesn't have admin access.";
  if (error.code === "23503") return "That item is linked to something that no longer exists. Reload and try again.";
  return error.message ?? "Something went wrong.";
}
