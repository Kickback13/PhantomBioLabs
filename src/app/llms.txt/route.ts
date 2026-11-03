import { getCategories } from "@/lib/catalog";
import { absoluteUrl } from "@/lib/seo";
import { site } from "@/lib/site";

// Short markdown summary for AI assistants and answer engines (https://llmstxt.org).
export async function GET() {
  const categories = await getCategories();
  const body = `# ${site.name}

> ${site.description}

${site.name} supplies research peptides for in-vitro laboratory research. Every lot is tested by an independent third-party laboratory by HPLC, and each lot has its own Certificate of Analysis (COA).

${site.compliance.ruo}

## Shop

- [All research peptides](${absoluteUrl("/shop")})
${categories.map((c) => `- [${c.name}](${absoluteUrl(`/category/${c.slug}`)})${c.description ? `: ${c.description}` : ""}`).join("\n")}

## Testing and documentation

- [COA library](${absoluteUrl("/coa")}): certificates of analysis matched to lot numbers
- [Quality & testing](${absoluteUrl("/quality")}): how lots are tested and documented
- [Research use policy](${absoluteUrl("/research-use")})

## Support

- [FAQ](${absoluteUrl("/faq")})
- [Shipping & returns](${absoluteUrl("/shipping")})
- [Contact](${absoluteUrl("/contact")}): WhatsApp ${site.contact.whatsapp}, ${site.contact.hours}
`;
  return new Response(body, { headers: { "Content-Type": "text/markdown; charset=utf-8" } });
}
