import type { Metadata } from "next";
import { ogImage } from "./images";
import { SITE_ORIGIN, site } from "./site";

/**
 * Search engines may index the site only when NEXT_PUBLIC_ALLOW_INDEXING=true is set in Vercel.
 * Previews run as Vercel "production" deployments, so VERCEL_ENV can't be used for this.
 */
export const indexingAllowed = process.env.NEXT_PUBLIC_ALLOW_INDEXING === "true";

/** Absolute production URL for a path ("/shop" -> "https://www.phantombiopeptides.com/shop"). */
export function absoluteUrl(path = "/") {
  return new URL(path, SITE_ORIGIN).toString();
}

/** "| Phantom Bio Labs" is added by the root layout's title template. Titles stay ≤ 60 characters. */
export const TITLE_SUFFIX = ` | ${site.name}`;
export const TITLE_MAX = 60;
export const DESCRIPTION_MAX = 155;

/** Default 1200×630 share card: the real file from IMAGE_SPEC.md when it exists, otherwise the generated one. */
export function defaultOgImage() {
  return ogImage() ?? "/og";
}

type PageMetadataInput = {
  /** Page title without the brand suffix. */
  title: string;
  description: string;
  /** Canonical path, without query string. */
  path: string;
  /** 1200×630 share image path. Defaults to the site card. */
  image?: string;
  imageAlt?: string;
  /** Keep this page out of search results even after launch. */
  noindex?: boolean;
  /** Use `title` as the full title, without the brand suffix. */
  absoluteTitle?: boolean;
  type?: "website" | "article";
};

/**
 * Metadata for one public page: title, description, canonical, robots, Open Graph and Twitter.
 * Next.js replaces (not merges) openGraph objects, so every page builds the full set here.
 */
export function pageMetadata({ title, description, path, image, imageAlt, noindex = false, absoluteTitle = false, type = "website" }: PageMetadataInput): Metadata {
  const fullTitle = absoluteTitle ? title : `${title}${TITLE_SUFFIX}`;
  const images = [{ url: image ?? defaultOgImage(), width: 1200, height: 630, alt: imageAlt ?? fullTitle }];
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: path },
    robots: robotsFor(noindex),
    openGraph: {
      type,
      siteName: site.name,
      locale: "en_US",
      url: path,
      title: fullTitle,
      description,
      images,
    },
    twitter: { card: "summary_large_image", title: fullTitle, description, images: images.map((i) => i.url) },
  };
}

/** Robots meta: noindex everywhere until launch, and always for pages that ask for it. */
export function robotsFor(noindex = false): Metadata["robots"] {
  if (!indexingAllowed) return { index: false, follow: false };
  if (noindex) return { index: false, follow: true };
  return { index: true, follow: true };
}

/** Product page title: "{Compound} Research Peptide", dropping the descriptor when it would pass 60 characters. */
export function productTitle(name: string, { isSupply = false, coaPurity99 = false }: { isSupply?: boolean; coaPurity99?: boolean } = {}) {
  const fits = (t: string) => t.length + TITLE_SUFFIX.length <= TITLE_MAX;
  const descriptor = isSupply ? "Laboratory Solvent" : "Research Peptide";
  const base = fits(`${name} ${descriptor}`) ? `${name} ${descriptor}` : name;
  // Only when a published COA in the data shows ≥99% purity.
  const withPurity = `${base} — ≥99% HPLC`;
  return coaPurity99 && fits(withPurity) ? withPurity : base;
}
