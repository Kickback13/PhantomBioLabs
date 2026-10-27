import manifest from "@/generated/image-manifest.json";
import { sizeSlug } from "./utils";

// Real photos live under public/images. Any format works; the first match wins.
const available = new Map<string, string>();
for (const file of manifest as string[]) {
  available.set(file.replace(/\.(webp|avif|png|jpe?g)$/i, ""), file);
}

function find(base: string) {
  return available.get(base) ?? null;
}

/** Photo for one size of a product, falling back to the product's main photo. */
export function productImage(slug: string, size?: string | null) {
  return (size ? find(`/images/products/${slug}/${sizeSlug(size)}`) : null) ?? find(`/images/products/${slug}/main`);
}

export function categoryImage(slug: string) {
  return find(`/images/categories/${slug}`);
}

export function heroImage() {
  return find("/images/hero/hero-vial");
}

export function ogImage() {
  return find("/images/og/og-default");
}
