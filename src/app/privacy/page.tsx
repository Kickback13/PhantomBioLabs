import type { Metadata } from "next";
import { PolicyLayout } from "@/components/content/policy-layout";
import { ProseSection } from "@/components/layout/prose";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "What personal information Phantom Bio Labs collects, why, who it is shared with and the choices you have.",
};

const sections = [
  { id: "collect", title: "What we collect" },
  { id: "use", title: "How we use it" },
  { id: "share", title: "Who we share it with" },
  { id: "storage", title: "Cookies and browser storage" },
  { id: "retention", title: "How long we keep it" },
  { id: "security", title: "Security" },
  { id: "choices", title: "Your choices" },
  { id: "age", title: "Age requirement" },
  { id: "changes", title: "Changes and contact" },
];

export default function PrivacyPage() {
  return (
    <PolicyLayout
      active="/privacy"
      eyebrow="Legal"
      title="Privacy Policy"
      intro="We collect only what we need to run the store, fulfil your orders and keep you informed about them. We don't sell your personal information."
      sections={sections}
    >
      <ProseSection id="collect" index={1} title="What we collect">
        <ul>
          <li>
            <strong>Account details:</strong> your email address, name and password (stored securely by our authentication provider) if you create an account.
          </li>
          <li>
            <strong>Order details:</strong> the items you order, your email, shipping address and phone number if you give one, any note you add, and your confirmation that you are 21 or older and buying for research use.
          </li>
          <li>
            <strong>Wishlist:</strong> the products you save, if you&apos;re signed in.
          </li>
          <li>
            <strong>Messages:</strong> what you send us on WhatsApp when you contact support.
          </li>
          <li>
            <strong>Technical data:</strong> standard server logs kept by our hosting providers, such as IP address, browser type and pages requested.
          </li>
        </ul>
      </ProseSection>
      <ProseSection id="use" index={2} title="How we use it">
        <ul>
          <li>to process, ship and support your orders;</li>
          <li>to manage your account and wishlist;</li>
          <li>to answer your questions;</li>
          <li>to check eligibility and prevent fraud or non-research use; and</li>
          <li>to meet our legal, tax and accounting obligations.</li>
        </ul>
      </ProseSection>
      <ProseSection id="share" index={3} title="Who we share it with">
        <p>We share personal information only with the service providers that help us run the store, and only as much as they need:</p>
        <ul>
          <li>Supabase, which hosts our database and account sign-in;</li>
          <li>Vercel, which hosts this website;</li>
          <li>shipping carriers, which receive your name and delivery address;</li>
          <li>our payment provider, once payment is taken online; and</li>
          <li>authorities, where the law requires it.</li>
        </ul>
        <p>We do not sell or rent your personal information, and we don&apos;t share it for advertising.</p>
      </ProseSection>
      <ProseSection id="storage" index={4} title="Cookies and browser storage">
        <p>
          When you sign in, we set cookies that keep you signed in. Your cart and your age confirmation are saved in your browser&apos;s local storage on your own device, and are never sent to us until you check out. We don&apos;t use advertising or cross-site tracking cookies.
        </p>
      </ProseSection>
      <ProseSection id="retention" index={5} title="How long we keep it">
        <p>
          We keep order records for as long as tax and accounting rules require. Account details are kept until you ask us to delete your account. Support messages are kept as long as needed to resolve your request.
        </p>
      </ProseSection>
      <ProseSection id="security" index={6} title="Security">
        <p>
          Data is encrypted in transit, and our database only lets each customer read their own orders and account. No system is perfectly secure, but we limit who can access personal information and what they can see.
        </p>
      </ProseSection>
      <ProseSection id="choices" index={7} title="Your choices">
        <p>
          You can ask us to show you, correct or delete the personal information we hold about you, subject to records we must keep by law. Message us on <a href={site.contact.whatsappHref}>WhatsApp at {site.contact.whatsapp}</a> from the number or email linked to your account.
        </p>
      </ProseSection>
      <ProseSection id="age" index={8} title="Age requirement">
        <p>This website and our products are for adults aged 21 or older. We don&apos;t knowingly collect information from anyone younger.</p>
      </ProseSection>
      <ProseSection id="changes" index={9} title="Changes and contact">
        <p>
          We&apos;ll update this page if our practices change. Questions about your privacy? Message us on WhatsApp, {site.contact.hours}.
        </p>
      </ProseSection>
    </PolicyLayout>
  );
}
