import type { Metadata } from "next";
import { FaqExplorer } from "@/components/content/faq-explorer";
import { WhatsAppCta } from "@/components/content/whatsapp-cta";
import { PageHeader } from "@/components/layout/page-header";
import { faq } from "@/content/faq";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Answers about testing, shipping, returns, storage and research-use compliance at Phantom Bio Labs.",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faq.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  })),
};

export default function FaqPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <PageHeader
        eyebrow={`Support · ${faq.length} questions`}
        title={
          <>
            Frequently <span className="text-gradient-violet">asked.</span>
          </>
        }
        description={`Search or filter by topic. Can't find it? Message the team on WhatsApp at ${site.contact.whatsapp}, ${site.contact.hours}.`}
      />
      <section className="container-page py-14 sm:py-20">
        <FaqExplorer items={faq} />
      </section>
      <section className="container-page">
        <div className="flex flex-col items-start justify-between gap-6 rounded-3xl border border-line bg-surface p-8 sm:flex-row sm:items-center sm:p-10">
          <div>
            <p className="eyebrow">Still stuck?</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">Talk to a real person.</h2>
            <p className="mt-2 text-[15px] text-muted">We answer questions about compounds, lots and orders within one business day.</p>
          </div>
          <WhatsAppCta />
        </div>
      </section>
    </>
  );
}
