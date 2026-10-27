import type { ReactNode } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Prose } from "@/components/layout/prose";
import { AnimatedTabLinks } from "@/components/ui/animated-tabs";
import { site } from "@/lib/site";
import { WhatsAppCta } from "./whatsapp-cta";

export const POLICY_UPDATED = "October 2026";

const policies = [
  { href: "/terms", label: "Terms of Service" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/shipping", label: "Shipping & Returns" },
  { href: "/research-use", label: "Research Use Policy" },
];

/** Shared frame for the four policy pages: header, tab switcher, contents list and long-form text. */
export function PolicyLayout({
  active,
  eyebrow,
  title,
  intro,
  sections,
  children,
}: {
  active: string;
  eyebrow: string;
  title: string;
  intro: ReactNode;
  sections: { id: string; title: string }[];
  children: ReactNode;
}) {
  return (
    <>
      <PageHeader eyebrow={eyebrow} title={title} description={intro}>
        <AnimatedTabLinks tabs={policies} active={active} label="Policies" />
      </PageHeader>
      <div className="container-page grid gap-12 py-14 sm:py-20 lg:grid-cols-[240px_1fr] lg:gap-16">
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <p className="eyebrow">Last updated</p>
          <p className="mt-1 text-sm">{POLICY_UPDATED}</p>
          <p className="eyebrow mt-8">On this page</p>
          <ol className="mt-3 space-y-2 text-sm">
            {sections.map((s, i) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="group flex gap-3 text-muted transition-colors hover:text-foreground">
                  <span className="font-mono text-[11px] text-violet-400/80 group-hover:text-violet-300">{String(i + 1).padStart(2, "0")}</span>
                  {s.title}
                </a>
              </li>
            ))}
          </ol>
          <div className="mt-8 hidden rounded-2xl border border-line bg-surface p-5 lg:block">
            <p className="text-sm font-medium">Questions about this policy?</p>
            <p className="mt-1 text-[13px] text-muted">{site.contact.hours}</p>
            <WhatsAppCta size="sm" variant="outline" label="WhatsApp us" className="mt-4 w-full" />
          </div>
        </aside>
        <Prose>{children}</Prose>
      </div>
    </>
  );
}
