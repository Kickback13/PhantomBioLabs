"use client";

// Adapted from 21st.dev "Animated Grid" by rmahammad: a CSS-only drifting grid with an accent
// glow. No canvas and no JS animation loop; stops for reduced motion.
import { useId, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface AnimatedGridProps extends HTMLAttributes<HTMLDivElement> {
  size?: number;
  color?: string;
  accent?: string;
  opacity?: number;
  fade?: boolean;
}

export function AnimatedGrid({
  size = 44,
  color = "color-mix(in oklab, #f7f5fb 7%, transparent)",
  accent = "var(--violet-500)",
  opacity = 0.9,
  fade = true,
  className,
  style,
  ...props
}: AnimatedGridProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const cls = `pbl-grid-${uid}`;
  const major = size * 4;

  const css = `
.${cls}::before, .${cls}::after { content: ""; position: absolute; inset: -${major}px; }
.${cls}::before {
  background-image: linear-gradient(to right, ${color} 1px, transparent 1px), linear-gradient(to bottom, ${color} 1px, transparent 1px);
  background-size: ${size}px ${size}px;
  opacity: ${opacity * 0.6};
  animation: ${cls}-drift 40s linear infinite;
}
.${cls}::after {
  background-image: linear-gradient(to right, color-mix(in oklab, ${accent} 40%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in oklab, ${accent} 40%, transparent) 1px, transparent 1px);
  background-size: ${major}px ${major}px;
  opacity: ${opacity * 0.45};
  animation: ${cls}-drift 40s linear infinite;
}
.${cls} > .${cls}-glow {
  position: absolute; inset: 0;
  background: radial-gradient(40% 45% at 62% 42%, color-mix(in oklab, ${accent} 30%, transparent), transparent 70%);
  animation: ${cls}-pulse 10s ease-in-out infinite;
}
@keyframes ${cls}-drift { from { background-position: 0 0, 0 0; } to { background-position: ${major}px ${major}px, ${major}px ${major}px; } }
@keyframes ${cls}-pulse { 0%, 100% { transform: scale(1); opacity: .75; } 50% { transform: scale(1.1); opacity: 1; } }
@media (prefers-reduced-motion: reduce) { .${cls}::before, .${cls}::after, .${cls} > .${cls}-glow { animation: none; } }
@media (forced-colors: active) { .${cls}::before, .${cls}::after, .${cls} > .${cls}-glow { display: none; } }`.trim();

  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", cls, className)}
      style={{
        ...(fade
          ? {
              WebkitMaskImage: "radial-gradient(ellipse 70% 70% at 55% 45%, #000 30%, transparent 78%)",
              maskImage: "radial-gradient(ellipse 70% 70% at 55% 45%, #000 30%, transparent 78%)",
            }
          : null),
        ...style,
      }}
      {...props}
    >
      <span className={`${cls}-glow`} />
      <style dangerouslySetInnerHTML={{ __html: css }} />
    </div>
  );
}
