"use client";

// Adapted from 21st.dev "Number Ticker" by danielpetho: tweens to a target when scrolled into view.
// Renders the final value on the server so the number is right before JavaScript loads.
import { animate, motion, useInView, useMotionValue, useTransform } from "motion/react";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface NumberTickerProps {
  value: number;
  from?: number;
  decimals?: number;
  duration?: number;
  className?: string;
}

export function NumberTicker({ value, from = 0, decimals = 0, duration = 1.6, className }: NumberTickerProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const count = useMotionValue(value);
  const text = useTransform(count, (v) => v.toFixed(decimals));

  useEffect(() => {
    if (!inView) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    count.set(from);
    const controls = animate(count, value, { duration, ease: [0.16, 1, 0.3, 1] });
    return () => controls.stop();
  }, [inView, count, from, value, duration]);

  return (
    <motion.span ref={ref} className={cn("tabular-nums", className)}>
      {text}
    </motion.span>
  );
}
