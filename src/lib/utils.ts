import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

export function formatPrice(cents: number) {
  return usd.format(cents / 100);
}

/** Percent saved, rounded down, or null when there is no real discount. */
export function discountPercent(priceCents: number, compareAtCents: number | null) {
  if (!compareAtCents || compareAtCents <= priceCents) return null;
  return Math.floor(((compareAtCents - priceCents) / compareAtCents) * 100);
}

/** "10 mg" -> "10mg", "5000 IU" -> "5000iu": used in image file names and URLs. */
export function sizeSlug(label: string) {
  return label.toLowerCase().replace(/[^a-z0-9.]+/g, "");
}
