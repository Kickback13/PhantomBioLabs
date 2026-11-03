import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { breadcrumbSchema, type Crumb } from "@/lib/structured-data";
import { cn } from "@/lib/utils";
import { JsonLd } from "./json-ld";

/** Visible breadcrumb trail plus matching BreadcrumbList schema. The last crumb is the current page. */
export function Breadcrumbs({ crumbs, className }: { crumbs: Crumb[]; className?: string }) {
  return (
    <>
      <JsonLd data={breadcrumbSchema(crumbs)} />
      <nav aria-label="Breadcrumb" className={cn("flex flex-wrap items-center gap-1.5 text-[13px] text-muted", className)}>
        {crumbs.map((c, i) => {
          const last = i === crumbs.length - 1;
          return (
            <span key={c.path} className="flex items-center gap-1.5">
              {i > 0 && <ChevronRight aria-hidden="true" className="size-3.5 text-subtle" />}
              {last ? (
                <span aria-current="page" className="text-foreground">
                  {c.name}
                </span>
              ) : (
                <Link href={c.path} className="hover:text-foreground">
                  {c.name}
                </Link>
              )}
            </span>
          );
        })}
      </nav>
    </>
  );
}
