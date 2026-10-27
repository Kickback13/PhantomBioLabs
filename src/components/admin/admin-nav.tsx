"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileCheck2, LayoutDashboard, Package, Receipt, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

export const adminLinks = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/coas", label: "COAs", icon: FileCheck2 },
  { href: "/admin/orders", label: "Orders", icon: Receipt },
  { href: "/admin/settings", label: "Settings", icon: Settings },
] as const;

/** Sidebar on desktop, a scrollable tab row on phones. */
export function AdminNav() {
  const pathname = usePathname();
  return <AdminNavLinks activePath={pathname} />;
}

export function AdminNavLinks({ activePath }: { activePath?: string }) {
  return (
    <nav aria-label="Admin" className="flex gap-1 overflow-x-auto [scrollbar-width:none] lg:flex-col lg:overflow-visible">
      {adminLinks.map(({ href, label, icon: Icon }) => {
        const active = activePath ? (href === "/admin" ? activePath === href : activePath.startsWith(href)) : false;
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
              active ? "bg-violet-500/15 text-foreground ring-1 ring-violet-400/30" : "text-muted hover:bg-white/[0.04] hover:text-foreground",
            )}
          >
            <Icon className={cn("size-4", active ? "text-violet-300" : "text-subtle")} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
