import Link from "next/link";
import { cacheLife } from "next/cache";
import { FlaskConical } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { getCategories } from "@/lib/catalog";
import { footerNav, site } from "@/lib/site";

async function CopyrightYear() {
  "use cache";
  cacheLife("days");
  return <>{new Date().getFullYear()}</>;
}

export async function SiteFooter() {
  const categories = await getCategories();
  return (
    <footer className="relative mt-24 border-t border-line bg-ink-950">
      <div className="border-b border-line bg-violet-500/[0.06]">
        <div className="container-page flex items-center gap-3 py-4 text-sm">
          <FlaskConical className="size-4 shrink-0 text-violet-400" />
          <p className="font-medium tracking-tight">{site.compliance.short}</p>
        </div>
      </div>
      <div className="container-page grid gap-12 py-16 lg:grid-cols-[1.3fr_repeat(4,1fr)]">
        <div className="max-w-sm">
          <Logo />
          <p className="mt-5 text-sm leading-relaxed text-muted">
            Research-grade peptides, independently HPLC-tested by a third-party lab, with a lot-specific Certificate of Analysis in every box.
          </p>
          <div className="mt-6 text-sm">
            <a href={site.contact.whatsappHref} className="text-foreground hover:text-violet-300">
              WhatsApp {site.contact.whatsapp}
            </a>
            <p className="mt-1 text-muted">{site.contact.hours}</p>
          </div>
        </div>
        <FooterColumn title="Shop" links={[{ href: "/shop", label: "All products" }, ...categories.map((c) => ({ href: `/category/${c.slug}`, label: c.name }))]} />
        {Object.entries(footerNav).map(([title, links]) => (
          <FooterColumn key={title} title={title} links={links} />
        ))}
      </div>
      <div className="border-t border-line">
        <div className="container-page flex flex-col gap-4 py-8 text-xs leading-relaxed text-subtle lg:flex-row lg:items-start lg:justify-between">
          <p className="max-w-3xl">
            <span className="font-medium text-muted">FDA disclosure.</span> {site.compliance.fda}
          </p>
          <p className="shrink-0">
            © <CopyrightYear /> {site.name}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: readonly { href: string; label: string }[] }) {
  return (
    <div>
      <p className="eyebrow">{title}</p>
      <ul className="mt-4 space-y-2.5 text-sm">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="text-muted transition-colors hover:text-foreground">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
