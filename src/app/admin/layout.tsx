import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowUpRight, ShieldCheck } from "lucide-react";
import { AdminNav, AdminNavLinks } from "@/components/admin/admin-nav";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Admin" },
  robots: { index: false, follow: false },
};

// Behind a login and rarely visited: never prefetch.
export const prefetch = "force-disabled";

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="container-page grid gap-6 py-8 lg:grid-cols-[210px_minmax(0,1fr)] lg:gap-10 lg:py-12">
      <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
        <p className="eyebrow hidden items-center gap-2 lg:flex">
          <ShieldCheck className="size-3.5 text-violet-400" /> Store admin
        </p>
        <Suspense fallback={<AdminNavLinks />}>
          <AdminNav />
        </Suspense>
        <Link href="/" className="hidden items-center gap-1.5 px-3 text-xs text-subtle hover:text-foreground lg:inline-flex">
          View the store <ArrowUpRight className="size-3" />
        </Link>
      </aside>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
