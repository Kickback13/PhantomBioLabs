import Image from "next/image";
import { VialArt } from "@/components/brand/vial-art";
import { productImage } from "@/lib/images";
import { cn, sizeSlug } from "@/lib/utils";

/**
 * Square product image well. Shows the real photo when one exists under
 * public/images/products/<slug>/, otherwise the labelled placeholder vial.
 */
export function ProductImage({
  slug,
  name,
  size,
  priority = false,
  sizes = "(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 80vw",
  className,
}: {
  slug: string;
  name: string;
  size?: string | null;
  priority?: boolean;
  sizes?: string;
  className?: string;
}) {
  const src = productImage(slug, size);
  return (
    <div className={cn("relative aspect-square w-full overflow-hidden", className)}>
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(60%_55%_at_50%_55%,color-mix(in_oklab,var(--violet-500)_18%,transparent),transparent_70%)]"
      />
      {src ? (
        <Image
          src={src}
          alt={`${name}${size ? ` ${size}` : ""}`}
          fill
          sizes={sizes}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : undefined}
          className="object-contain"
        />
      ) : (
        <>
          <div className="absolute inset-0 flex items-center justify-center py-[9%]">
            <VialArt id={`v-${slug}-${size ? sizeSlug(size) : "main"}`} name={name} size={size ?? undefined} glow={false} />
          </div>
          <span className="pointer-events-none absolute bottom-2.5 left-3 font-mono text-[9px] tracking-[0.2em] text-ink-500">
            PLACEHOLDER
          </span>
        </>
      )}
    </div>
  );
}
