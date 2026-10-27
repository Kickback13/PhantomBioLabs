import type { Metadata } from "next";
import Link from "next/link";
import { PolicyLayout } from "@/components/content/policy-layout";
import { ProseSection } from "@/components/layout/prose";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms that apply when you use the Phantom Bio Labs website or buy research compounds from us.",
};

const sections = [
  { id: "research-use", title: "Research use only" },
  { id: "eligibility", title: "Eligibility" },
  { id: "orders", title: "Orders and acceptance" },
  { id: "pricing", title: "Pricing and payment" },
  { id: "shipping", title: "Shipping, risk and returns" },
  { id: "responsibilities", title: "Your responsibilities" },
  { id: "no-advice", title: "No medical advice" },
  { id: "liability", title: "Limitation of liability" },
  { id: "changes", title: "Changes to these terms" },
  { id: "law", title: "Governing law" },
  { id: "contact", title: "Contact" },
];

export default function TermsPage() {
  return (
    <PolicyLayout
      active="/terms"
      eyebrow="Legal"
      title="Terms of Service"
      intro="By using this website or purchasing from Phantom Bio Labs, you agree to these terms. Please read them with our Research Use Policy."
      sections={sections}
    >
      <ProseSection id="research-use" index={1} title="Research use only">
        <p>
          All products sold by {site.name} are supplied strictly for in-vitro laboratory research and analytical use. They are not intended for human or animal consumption, therapeutic use, diagnostic applications or veterinary use. Our full requirements are set out in the{" "}
          <Link href="/research-use">Research Use Policy</Link>, which forms part of these terms.
        </p>
      </ProseSection>
      <ProseSection id="eligibility" index={2} title="Eligibility">
        <p>To buy from us you must:</p>
        <ul>
          <li>be at least 21 years of age;</li>
          <li>be a qualified researcher or act on behalf of a research institution; and</li>
          <li>be legally permitted to receive research chemicals where the order will be delivered.</li>
        </ul>
      </ProseSection>
      <ProseSection id="orders" index={3} title="Orders and acceptance">
        <p>
          An order is an offer to buy. We accept it when we confirm payment and dispatch the goods. We may refuse or cancel any order at our discretion, including for suspected non-research use, incomplete or inconsistent information, pricing or listing errors, or delivery to a restricted destination. If we cancel an order you have paid for, we refund the full amount.
        </p>
      </ProseSection>
      <ProseSection id="pricing" index={4} title="Pricing and payment">
        <p>
          Prices are listed in U.S. dollars and may change at any time before an order is accepted. Shipping charges are shown at checkout. Orders are held as pending until payment is confirmed, and nothing ships before then.
        </p>
      </ProseSection>
      <ProseSection id="shipping" index={5} title="Shipping, risk and returns">
        <p>
          Dispatch times, carriers, international delivery, damaged shipments and returns are covered by our <Link href="/shipping">Shipping &amp; Returns policy</Link>. Responsibility for the goods passes to you on delivery to the address you provide.
        </p>
      </ProseSection>
      <ProseSection id="responsibilities" index={6} title="Your responsibilities">
        <p>
          You accept full responsibility for the safe handling, storage, use and disposal of everything you buy, in line with laboratory safety practice and the laws that apply to you. You confirm that the information you give us, including your age and research purpose, is accurate.
        </p>
      </ProseSection>
      <ProseSection id="no-advice" index={7} title="No medical advice">
        <p>
          Nothing on this website is medical, therapeutic or dosing advice. {site.compliance.fda}
        </p>
      </ProseSection>
      <ProseSection id="liability" index={8} title="Limitation of liability">
        <p>
          To the fullest extent the law allows, {site.name} is not liable for any loss or damage arising from misuse of our products, use outside laboratory research, or breach of applicable law. Our total liability for any order is limited to the amount you paid for it.
        </p>
      </ProseSection>
      <ProseSection id="changes" index={9} title="Changes to these terms">
        <p>We may update these terms from time to time. The version on this page when you place an order applies to that order.</p>
      </ProseSection>
      <ProseSection id="law" index={10} title="Governing law">
        <p>
          These terms are governed by the laws of the United States and the state in which {site.name} is registered, without regard to conflict-of-law principles.
        </p>
      </ProseSection>
      <ProseSection id="contact" index={11} title="Contact">
        <p>
          Questions about these terms? Message us on <a href={site.contact.whatsappHref}>WhatsApp at {site.contact.whatsapp}</a>, {site.contact.hours}.
        </p>
      </ProseSection>
    </PolicyLayout>
  );
}
