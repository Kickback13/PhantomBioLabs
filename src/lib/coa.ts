import type { Coa } from "./catalog";

/** URL-safe lot segment: "PBL 24-001/A" -> "pbl-24-001-a". */
export function lotSlug(lot: string) {
  return lot.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "lot";
}

/** Page for one certificate: /coa/{product}/{lot}. */
export function coaPath(coa: Pick<Coa, "productSlug" | "lotNumber">) {
  return `/coa/${coa.productSlug}/${lotSlug(coa.lotNumber)}`;
}

export function findCoa(coas: Coa[], productSlug: string, lot: string) {
  return coas.find((c) => c.productSlug === productSlug && lotSlug(c.lotNumber) === lot) ?? null;
}

export const coaDate = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });

export function formatTestedOn(testedOn: string | null) {
  return testedOn ? coaDate.format(new Date(`${testedOn}T00:00:00Z`)) : null;
}
