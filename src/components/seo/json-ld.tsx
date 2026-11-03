import type { JsonLdNode } from "@/lib/structured-data";

/** Renders one or more schema.org nodes as a JSON-LD script. `<` is escaped so copy can't close the tag. */
export function JsonLd({ data }: { data: JsonLdNode | JsonLdNode[] }) {
  const nodes = Array.isArray(data) ? data : [data];
  return (
    <>
      {nodes.map((node, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(node).replace(/</g, "\\u003c") }} />
      ))}
    </>
  );
}
