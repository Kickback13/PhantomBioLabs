import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

// Adapted from 21st.dev "Border Beam" (dillionverma / Magic UI): a light that travels around the
// border of its container. Drop it inside any element with `position: relative` and a border radius.
// The animation lives in globals.css (.border-beam) so browsers without offset-path just show nothing.
export function BorderBeam({
  className,
  size = 160,
  duration = 12,
  anchor = 90,
  borderWidth = 1.5,
  colorFrom = "var(--violet-300)",
  colorTo = "var(--violet-600)",
  delay = 0,
}: {
  className?: string;
  size?: number;
  duration?: number;
  anchor?: number;
  borderWidth?: number;
  colorFrom?: string;
  colorTo?: string;
  delay?: number;
}) {
  return (
    <div
      aria-hidden="true"
      className={cn("border-beam", className)}
      style={
        {
          "--size": size,
          "--duration": duration,
          "--anchor": anchor,
          "--border-width": borderWidth,
          "--color-from": colorFrom,
          "--color-to": colorTo,
          "--delay": `-${delay}s`,
        } as CSSProperties
      }
    />
  );
}
