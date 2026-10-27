import type { Metadata } from "next";
import { FlaskConical } from "lucide-react";
import { PolicyLayout } from "@/components/content/policy-layout";
import { ProseSection } from "@/components/layout/prose";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Research Use Policy",
  description: "Phantom Bio Labs products are sold only to qualified researchers aged 21+ for in-vitro laboratory research. Read the full research use policy.",
};

const sections = [
  { id: "intended-use", title: "Intended use" },
  { id: "prohibited", title: "Prohibited use" },
  { id: "who", title: "Who may buy" },
  { id: "claims", title: "No claims or usage guidance" },
  { id: "handling", title: "Handling and compliance" },
  { id: "refusal", title: "Our right to refuse or cancel" },
  { id: "acknowledgement", title: "Your acknowledgement" },
];

export default function ResearchUsePage() {
  return (
    <PolicyLayout
      active="/research-use"
      eyebrow="Compliance"
      title="Research Use Policy"
      intro="Every product we sell is a research material. This policy explains what that means and what we expect from every buyer."
      sections={sections}
    >
      <div className="!mt-0 flex gap-4 rounded-2xl border border-violet-400/30 bg-violet-500/[0.07] p-5">
        <FlaskConical className="mt-0.5 size-5 shrink-0 text-violet-300" />
        <p className="!mt-0 font-medium text-foreground">{site.compliance.short}</p>
      </div>
      <div className="h-6" />
      <ProseSection id="intended-use" index={1} title="Intended use">
        <p>
          All compounds sold by {site.name} are supplied solely for in-vitro laboratory research and analytical use, such as cell-culture studies, assay development and reference standards.
        </p>
      </ProseSection>
      <ProseSection id="prohibited" index={2} title="Prohibited use">
        <p>Our products must not be used:</p>
        <ul>
          <li>in or on humans, including self-administration;</li>
          <li>in or on animals outside an approved research protocol;</li>
          <li>as food, drugs, supplements, cosmetics or household products; or</li>
          <li>for any diagnostic, therapeutic or veterinary purpose.</li>
        </ul>
      </ProseSection>
      <ProseSection id="who" index={3} title="Who may buy">
        <p>
          Buyers must be at least 21 years old, be qualified researchers or act for a research institution, and be legally permitted to receive research chemicals where the order is delivered. We may ask for proof of age, affiliation or intended research use before or after accepting an order.
        </p>
      </ProseSection>
      <ProseSection id="claims" index={4} title="No claims or usage guidance">
        <p>
          We make no claims about the effects of any product on people or animals, and our team will not give advice on dosing, administration or use outside the laboratory. Product descriptions summarise published research contexts only. Support conversations are limited to product specifications, certificates of analysis, orders and shipping.
        </p>
        <p>{site.compliance.fda}</p>
      </ProseSection>
      <ProseSection id="handling" index={5} title="Handling and compliance">
        <p>
          You are responsible for handling, storing and disposing of all materials in line with laboratory safety standards, and for complying with every law and regulation that applies where you are, including import rules for international orders.
        </p>
      </ProseSection>
      <ProseSection id="refusal" index={6} title="Our right to refuse or cancel">
        <p>
          We may refuse or cancel any order, close an account or stop supplying a customer if we believe products are intended for non-research use, if information provided is inconsistent or incomplete, or if delivery would breach the law. Paid orders that we cancel are refunded in full.
        </p>
      </ProseSection>
      <ProseSection id="acknowledgement" index={7} title="Your acknowledgement">
        <p>
          When you enter the site you confirm you are 21 or older, and at checkout you confirm that you are buying for laboratory research use only. Placing an order means you accept this policy and our Terms of Service.
        </p>
      </ProseSection>
    </PolicyLayout>
  );
}
