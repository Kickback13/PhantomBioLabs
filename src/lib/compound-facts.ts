import facts from "../../data/compound-facts.json";

export type Citation = { title: string; url: string; source?: string };
export type FaqEntry = { q: string; a: string };

/** Reference data for one compound (data/compound-facts.json). Every field is optional and hidden when empty. */
export type CompoundFacts = {
  sequence: string | null;
  molecularFormula: string | null;
  molecularWeight: string | null;
  cas: string | null;
  saltForm: string | null;
  storage: string | null;
  citations: Citation[];
  faq: FaqEntry[];
};

const EMPTY: CompoundFacts = { sequence: null, molecularFormula: null, molecularWeight: null, cas: null, saltForm: null, storage: null, citations: [], faq: [] };

/** Only PubMed and DOI links are accepted as citations. */
const CITATION_HOSTS = /^https:\/\/(pubmed\.ncbi\.nlm\.nih\.gov|www\.ncbi\.nlm\.nih\.gov\/pmc|doi\.org)\//;

export function compoundFacts(slug: string): CompoundFacts {
  const entry = (facts as Record<string, unknown>)[slug] as Partial<CompoundFacts> | undefined;
  if (!entry) return EMPTY;
  return {
    ...EMPTY,
    ...entry,
    citations: (entry.citations ?? []).filter((c) => c?.title && CITATION_HOSTS.test(c.url)),
    faq: (entry.faq ?? []).filter((f) => f?.q && f?.a),
  };
}
