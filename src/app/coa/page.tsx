import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CoaEmptyState, CoaLibrary } from "@/components/content/coa-library";
import { WhatsAppCta } from "@/components/content/whatsapp-cta";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { getCoas } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "COA Library",
  description: "Certificates of Analysis for Phantom Bio Labs research compounds: independent HPLC purity and mass-spec identity results, matched to each lot number.",
};

export default async function CoaPage() {
  const coas = await getCoas();
  return (
    <>
      <PageHeader
        eyebrow="Certificate of Analysis library"
        title={
          <>
            Every certificate,
            <br className="hidden sm:block" /> <span className="text-gradient-violet">on the record.</span>
          </>
        }
        description="Independent HPLC purity and mass-spec identity results for each lot, issued by the third-party lab that tested it. Search by compound or by the lot number printed on your vial."
      />
      <section className="container-page py-14 sm:py-20">
        {coas.length ? (
          <CoaLibrary coas={coas} />
        ) : (
          <CoaEmptyState>
            <WhatsAppCta label="Request a COA" message="Hi, I'd like the COA for this lot: " />
            <Button asChild size="lg" variant="outline">
              <Link href="/shop">
                Browse compounds <ArrowRight />
              </Link>
            </Button>
          </CoaEmptyState>
        )}
      </section>
    </>
  );
}
