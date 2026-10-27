"use client";

// Adapted from 21st.dev "Spotlight" by kevingirelli: a soft light that follows the pointer,
// with a lit edge ring. Updates two CSS variables per frame, so nothing re-renders.
import { Slot, Slottable } from "@radix-ui/react-slot";
import { useEffect, useRef, type ComponentProps, type CSSProperties } from "react";
import { cn } from "@/lib/utils";

const RING_MASK = "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)";

const lightClassName = cn(
  "pointer-events-none absolute inset-0 -z-10 rounded-[inherit] opacity-0",
  "transition-opacity duration-300 motion-reduce:transition-none",
  "group-focus-within/spotlight:opacity-100 group-hover/spotlight:opacity-100",
);

interface SpotlightProps extends ComponentProps<"div"> {
  asChild?: boolean;
  /** Radius of the light, in px. */
  size?: number;
  /** Any CSS colour, including theme variables. */
  color?: string;
  /** Also light the part of the edge nearest the pointer. */
  ring?: boolean;
  /** Strength of the fill light, 0-100. */
  intensity?: number;
}

function Spotlight({
  asChild = false,
  size = 360,
  color = "var(--violet-500)",
  ring = true,
  intensity = 14,
  className,
  children,
  onPointerMove,
  ...props
}: SpotlightProps) {
  const frame = useRef(0);
  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  const Comp = asChild ? Slot : "div";
  const circle = `${size}px circle at var(--spotlight-x, 50%) var(--spotlight-y, 50%)`;
  const ringStyle: CSSProperties = {
    background: `radial-gradient(${circle}, color-mix(in oklab, ${color} 70%, transparent), transparent 60%)`,
    mask: RING_MASK,
    maskComposite: "exclude",
    WebkitMask: RING_MASK,
    WebkitMaskComposite: "xor",
  };

  return (
    <Comp
      data-slot="spotlight"
      className={cn("group/spotlight relative isolate", className)}
      onPointerMove={(event) => {
        onPointerMove?.(event);
        if (event.pointerType === "touch") return;
        const target = event.currentTarget;
        const { clientX, clientY } = event;
        cancelAnimationFrame(frame.current);
        frame.current = requestAnimationFrame(() => {
          const bounds = target.getBoundingClientRect();
          target.style.setProperty("--spotlight-x", `${clientX - bounds.left}px`);
          target.style.setProperty("--spotlight-y", `${clientY - bounds.top}px`);
        });
      }}
      {...props}
    >
      <span
        aria-hidden="true"
        className={lightClassName}
        style={{
          background: `radial-gradient(${circle}, color-mix(in oklab, ${color} ${intensity}%, transparent), transparent 70%)`,
        }}
      />
      {ring ? <span aria-hidden="true" className={cn(lightClassName, "-inset-px p-px")} style={ringStyle} /> : null}
      <Slottable>{children}</Slottable>
    </Comp>
  );
}

export { Spotlight, type SpotlightProps };
