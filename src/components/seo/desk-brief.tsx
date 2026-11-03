import { indexingAllowed } from "@/lib/seo";
import { cn } from "@/lib/utils";

/**
 * Slot for copy the SEO desk still has to supply. Shows a labelled {{SEO_DESK_BRIEF: ...}} box on
 * preview builds and renders nothing in production (NEXT_PUBLIC_ALLOW_INDEXING=true). Pages that
 * still contain one are kept noindex and out of the sitemap (see src/content/guides.ts).
 */
export function DeskBrief({ brief, kind = "copy", className }: { brief: string; kind?: "copy" | "diagram"; className?: string }) {
  if (indexingAllowed) return null;
  return (
    <div
      data-desk-brief
      className={cn("my-6 rounded-xl border border-dashed border-amber-400/50 bg-amber-400/[0.06] p-4 font-mono text-[12.5px] leading-relaxed text-amber-200", className)}
    >
      <span className="mb-1 block text-[10px] tracking-[0.18em] text-amber-300/80 uppercase">
        {kind === "diagram" ? "Diagram slot · hidden in production" : "Placeholder · hidden in production"}
      </span>
      {`{{SEO_DESK_BRIEF: ${brief}}}`}
    </div>
  );
}
