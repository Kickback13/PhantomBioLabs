// schema.org JSON-LD builders. Every value comes from the catalog, the COA table, site.ts or the
// visible page copy. Nothing here may be invented (no ratings, reviews, lots or lab names).
import type { Coa, Product, StoreSettings } from "./catalog";
import { productImage } from "./images";
import { absoluteUrl, defaultOgImage } from "./seo";
import { SITE_ORIGIN, site } from "./site";

type Thing = { "@type": string | string[]; "@id"?: string; [key: string]: unknown };
export type JsonLdNode = Thing & { "@context"?: "https://schema.org" };

const ORG_ID = `${SITE_ORIGIN}/#organization`;
const WEBSITE_ID = `${SITE_ORIGIN}/#website`;

export function organizationSchema(): JsonLdNode {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": ORG_ID,
    name: site.name,
    legalName: site.legalName,
    url: absoluteUrl("/"),
    // TODO(SEO-DESK/KEANU): swap for the final raster logo (IMAGE_SPEC.md §1) when it exists.
    logo: absoluteUrl("/icon.svg"),
    description: site.description,
    address: {
      "@type": "PostalAddress",
      addressLocality: site.address.locality,
      addressRegion: site.address.region,
      addressCountry: site.address.country,
    },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      telephone: site.contact.telephone,
      url: absoluteUrl("/contact"),
      areaServed: "US",
      availableLanguage: "English",
    },
  };
}

/** The shop filter reads ?q=, so the site search action points there. */
export function websiteSchema(): JsonLdNode {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    name: site.name,
    url: absoluteUrl("/"),
    publisher: { "@type": "Organization", "@id": ORG_ID, name: site.name },
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${absoluteUrl("/shop")}?q={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
  };
}

export type Crumb = { name: string; path: string };

export function breadcrumbSchema(crumbs: Crumb[]): JsonLdNode {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.name, item: absoluteUrl(c.path) })),
  };
}

/** Must match the questions and answers visible on the page. */
export function faqSchema(items: { q: string; a: string }[]): JsonLdNode {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}

/**
 * Real return policy (Shipping & Returns page): opened products can't be returned; damaged or
 * defective items are replaced or refunded at no cost if reported within 7 days of delivery.
 */
function returnPolicy(): Thing {
  return {
    "@type": "MerchantReturnPolicy",
    applicableCountry: "US",
    returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
    merchantReturnDays: 7,
    itemCondition: "https://schema.org/DamagedCondition",
    returnFees: "https://schema.org/FreeReturn",
    refundType: ["https://schema.org/ExchangeRefund", "https://schema.org/FullRefund"],
    merchantReturnLink: absoluteUrl("/shipping#returns"),
  };
}

/** U.S. shipping: free at or over the threshold, otherwise the flat rate (both from store settings). */
function shippingDetails(priceCents: number, settings: StoreSettings): Thing {
  const free = priceCents >= settings.freeShippingThresholdCents;
  return {
    "@type": "OfferShippingDetails",
    shippingDestination: { "@type": "DefinedRegion", addressCountry: "US" },
    shippingRate: { "@type": "MonetaryAmount", value: free ? 0 : settings.flatShippingCents / 100, currency: "USD" },
    // TODO(SEO-DESK/KEANU): add deliveryTime (handling + transit days) once confirmed. Not guessed here.
  };
}

/** Share card or real photo used as the product image in schema and Open Graph. */
export function productShareImage(product: Product) {
  return productImage(product.slug, product.variants[0]?.label) ?? `/og/product/${product.slug}`;
}

export function productSchema(product: Product, settings: StoreSettings, coas: Coa[] = []): JsonLdNode {
  const url = absoluteUrl(`/product/${product.slug}`);
  const images = [...new Set(product.variants.map((v) => productImage(product.slug, v.label)).filter((x): x is string => Boolean(x)))];
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${url}#product`,
    name: product.name,
    url,
    sku: product.variants.find((v) => v.sku)?.sku ?? undefined,
    description: [product.description, site.compliance.ruo].filter(Boolean).join(" "),
    image: (images.length ? images : [productShareImage(product)]).map((src) => absoluteUrl(src)),
    brand: { "@type": "Brand", name: site.name },
    category: product.category?.name,
    // Links each published COA PDF for this compound. Values come from the COA table only.
    subjectOf: coas.length
      ? coas.map((c) => ({ "@type": "DigitalDocument", name: `Certificate of Analysis, lot ${c.lotNumber}`, url: c.fileUrl, encodingFormat: "application/pdf" }))
      : undefined,
    offers: product.variants.map((v) => ({
      "@type": "Offer",
      name: `${product.name} ${v.label}`,
      sku: v.sku ?? undefined,
      url,
      price: (v.priceCents / 100).toFixed(2),
      priceCurrency: "USD",
      availability: v.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@type": "Organization", "@id": ORG_ID, name: site.name },
      hasMerchantReturnPolicy: returnPolicy(),
      shippingDetails: shippingDetails(v.priceCents, settings),
    })),
  };
}

/** Article schema for guides and research hubs. Author and reviewer are added only when named. */
export function articleSchema(page: { path: string; title: string; description: string; updated: string; author: string | null; reviewer: string | null }): JsonLdNode {
  const url = absoluteUrl(page.path);
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${url}#article`,
    headline: page.title,
    description: page.description,
    url,
    mainEntityOfPage: url,
    dateModified: page.updated,
    image: absoluteUrl(defaultOgImage()),
    author: page.author ? { "@type": "Person", name: page.author } : { "@type": "Organization", "@id": ORG_ID, name: site.name },
    reviewedBy: page.reviewer ? { "@type": "Person", name: page.reviewer } : undefined,
    publisher: { "@type": "Organization", "@id": ORG_ID, name: site.name, logo: { "@type": "ImageObject", url: absoluteUrl("/icon.svg") } },
  };
}

/**
 * One certificate of analysis as a Dataset: the lab's measured results for one lot. Values come
 * from the COA table only; fields without data are left out.
 */
export function coaDatasetSchema(coa: Coa, path: string): JsonLdNode {
  const url = absoluteUrl(path);
  return {
    "@context": "https://schema.org",
    "@type": "Dataset",
    "@id": `${url}#dataset`,
    name: `Certificate of Analysis: ${coa.productName}${coa.variantLabel ? ` ${coa.variantLabel}` : ""}, lot ${coa.lotNumber}`,
    description: `Third-party laboratory test results for ${coa.productName} lot ${coa.lotNumber}, supplied by ${site.name}. ${site.compliance.short}`,
    url,
    identifier: coa.lotNumber,
    dateCreated: coa.testedOn ?? undefined,
    dateModified: coa.updatedAt,
    creator: coa.labName ? { "@type": "Organization", name: coa.labName } : undefined,
    publisher: { "@type": "Organization", "@id": ORG_ID, name: site.name },
    isAccessibleForFree: true,
    about: { "@type": "Product", "@id": `${absoluteUrl(`/product/${coa.productSlug}`)}#product`, name: coa.productName },
    variableMeasured:
      coa.purityPercent !== null ? [{ "@type": "PropertyValue", name: "Purity (HPLC)", value: coa.purityPercent, unitText: "%" }] : undefined,
    distribution: [{ "@type": "DataDownload", encodingFormat: "application/pdf", contentUrl: coa.fileUrl }],
  };
}
