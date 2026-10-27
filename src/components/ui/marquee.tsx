"use client";

// Adapted from 21st.dev "Marquee" by kevingirelli: one CSS transform animation, copies hidden
// from screen readers, pauses off screen and on hover/focus, holds still for reduced motion.
import { useMemo, type ComponentProps, type CSSProperties, type Ref } from "react";
import { cn } from "@/lib/utils";
import { useInView } from "./use-in-view";

function mergeRefs<T>(...refs: (Ref<T> | undefined)[]) {
  return (node: T | null) => {
    for (const ref of refs) {
      if (typeof ref === "function") ref(node);
      else if (ref) (ref as { current: T | null }).current = node;
    }
  };
}

interface MarqueeProps extends ComponentProps<"div"> {
  /** Seconds for the content to travel its own length. */
  duration?: number;
  /** Space between items. Any CSS length. */
  gap?: string;
  pauseOnHover?: boolean;
  reverse?: boolean;
  fade?: boolean;
  /** Copies of the content in the loop. Raise it for short content in a wide marquee. */
  repeat?: number;
}

function Marquee({
  duration = 30,
  gap = "2rem",
  pauseOnHover = false,
  reverse = false,
  fade = true,
  repeat = 3,
  className,
  style,
  ref,
  children,
  ...props
}: MarqueeProps) {
  const [observe, inView] = useInView<HTMLDivElement>({ rootMargin: "100px" });
  const mergedRef = useMemo(() => mergeRefs(ref, observe), [ref, observe]);
  const copies = Math.max(2, Math.floor(repeat));
  const mask = fade ? "linear-gradient(to right, transparent, #000 8%, #000 92%, transparent)" : undefined;

  return (
    <div
      ref={mergedRef}
      data-slot="marquee"
      className={cn("group/marquee flex overflow-hidden", className)}
      style={
        {
          "--marquee-gap": gap,
          "--marquee-copies": copies,
          maskImage: mask,
          WebkitMaskImage: mask,
          ...style,
        } as CSSProperties
      }
      {...props}
    >
      <div
        className={cn(
          "flex w-max shrink-0 motion-safe:animate-marquee-x group-focus-within/marquee:[animation-play-state:paused]",
          pauseOnHover && "group-hover/marquee:[animation-play-state:paused]",
        )}
        style={{
          animationDuration: `${duration}s`,
          animationDirection: reverse ? "reverse" : undefined,
          animationPlayState: inView ? undefined : "paused",
        }}
      >
        {Array.from({ length: copies }, (_, copy) => (
          <div
            key={copy}
            aria-hidden={copy > 0 ? true : undefined}
            inert={copy > 0 ? true : undefined}
            className={cn("flex shrink-0 items-center gap-[var(--marquee-gap)] pr-[var(--marquee-gap)]", copy > 0 && "motion-reduce:hidden")}
          >
            {children}
          </div>
        ))}
      </div>
    </div>
  );
}

export { Marquee, type MarqueeProps };
