import Link from "next/link";
import type { ComponentProps, CSSProperties } from "react";
import { cn } from "@/lib/utils";

// Adapted from 21st.dev "Shimmer Button" (dillionverma / Magic UI): a spark of light runs around the
// edge of the button. Rendered as a Next.js link because every use here is navigation.
export function ShimmerLink({
  className,
  children,
  shimmerColor = "#ffffff",
  background = "linear-gradient(135deg, var(--violet-500), var(--violet-700))",
  speed = "3s",
  ...props
}: ComponentProps<typeof Link> & { shimmerColor?: string; background?: string; speed?: string }) {
  return (
    <Link
      {...props}
      style={
        {
          "--spread": "90deg",
          "--shimmer-color": shimmerColor,
          "--speed": speed,
          "--cut": "1.5px",
          "--bg": background,
        } as CSSProperties
      }
      className={cn(
        "group/shimmer relative z-0 inline-flex h-13 items-center justify-center gap-2 overflow-hidden rounded-xl border border-white/15 px-7 text-[15px] font-medium whitespace-nowrap text-white [background:var(--bg)]",
        "shadow-[0_10px_40px_-8px_var(--accent-glow)] transition-[transform,box-shadow] duration-300 hover:shadow-[0_14px_50px_-6px_var(--accent-glow)] active:translate-y-px [&_svg]:size-4 [&_svg]:shrink-0",
        className,
      )}
    >
      {/* spark */}
      <span aria-hidden="true" className="absolute inset-0 -z-30 overflow-visible blur-[2px] [container-type:size]">
        <span className="absolute inset-0 h-[100cqh] animate-shimmer-slide [aspect-ratio:1]">
          <span className="absolute -inset-full w-auto rotate-0 animate-spin-around [background:conic-gradient(from_calc(270deg-(var(--spread)*0.5)),transparent_0,var(--shimmer-color)_var(--spread),transparent_var(--spread))]" />
        </span>
      </span>
      {children}
      {/* inner highlight */}
      <span
        aria-hidden="true"
        className="absolute inset-0 rounded-[inherit] shadow-[inset_0_-8px_10px_#ffffff1f] transition-shadow duration-300 group-hover/shimmer:shadow-[inset_0_-6px_10px_#ffffff3f] group-active/shimmer:shadow-[inset_0_-10px_10px_#ffffff3f]"
      />
      {/* backdrop */}
      <span aria-hidden="true" className="absolute -z-20 rounded-[inherit] [background:var(--bg)] [inset:var(--cut)]" />
    </Link>
  );
}
