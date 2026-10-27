"use client";

// Adapted from 21st.dev "Quantity Stepper" (Spectrum UI): rolling digits, press-and-hold repeat,
// and a shake at the limits. Restyled for the Phantom theme.
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useAnimationControls, useReducedMotion } from "motion/react";
import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

export function QuantityStepper({
  value,
  onValueChange,
  min = 1,
  max = 20,
  size = "md",
  className,
  label = "Quantity",
}: {
  value: number;
  onValueChange: (value: number) => void;
  min?: number;
  max?: number;
  size?: "sm" | "md";
  className?: string;
  label?: string;
}) {
  const reduced = useReducedMotion();
  const shake = useAnimationControls();
  const [direction, setDirection] = useState(1);
  const [flash, setFlash] = useState(false);
  const current = clamp(value, min, max);
  const valueRef = useRef(current);
  const timers = useRef<{ delay?: ReturnType<typeof setTimeout>; repeat?: ReturnType<typeof setInterval> }>({});

  useEffect(() => {
    valueRef.current = current;
  }, [current]);

  const stop = useCallback(() => {
    clearTimeout(timers.current.delay);
    clearInterval(timers.current.repeat);
  }, []);
  useEffect(() => stop, [stop]);

  const step = useCallback(
    (delta: number) => {
      const next = clamp(valueRef.current + delta, min, max);
      if (next === valueRef.current) {
        setFlash(true);
        if (!reduced) void shake.start({ x: [0, -4, 4, -2, 2, 0], transition: { duration: 0.3 } });
        setTimeout(() => setFlash(false), 400);
        return false;
      }
      valueRef.current = next;
      setDirection(delta > 0 ? 1 : -1);
      onValueChange(next);
      return true;
    },
    [min, max, onValueChange, reduced, shake],
  );

  function startHold(delta: number, event: React.PointerEvent) {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    stop();
    if (!step(delta)) return;
    timers.current.delay = setTimeout(() => {
      timers.current.repeat = setInterval(() => {
        if (!step(delta)) stop();
      }, 80);
    }, 400);
  }

  const btn = cn(
    "grid shrink-0 touch-manipulation place-items-center rounded-full text-muted transition-colors hover:bg-white/8 hover:text-foreground",
    size === "sm" ? "size-7" : "size-8",
  );

  return (
    <div
      role="group"
      aria-label={label}
      className={cn("inline-flex items-center rounded-full border border-line-strong bg-ink-950 select-none", size === "sm" ? "h-9 px-1" : "h-11 px-1.5", className)}
    >
      <motion.button type="button" tabIndex={-1} aria-label="Decrease quantity" onPointerDown={(e) => startHold(-1, e)} onPointerUp={stop} onPointerLeave={stop} whileTap={reduced ? undefined : { scale: 0.85 }} className={cn(btn, current <= min && "opacity-40")}>
        <Minus className="size-3.5" />
      </motion.button>
      <motion.span
        role="spinbutton"
        tabIndex={0}
        aria-valuenow={current}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-label={label}
        animate={shake}
        onKeyDown={(e) => {
          if (e.key !== "ArrowUp" && e.key !== "ArrowDown") return;
          e.preventDefault();
          step(e.key === "ArrowUp" ? 1 : -1);
        }}
        className={cn("flex min-w-8 items-center justify-center overflow-hidden px-1 font-mono text-sm tabular-nums", flash ? "text-danger" : "text-foreground")}
      >
        <AnimatePresence mode="popLayout" initial={false} custom={direction}>
          <motion.span
            key={current}
            custom={direction}
            initial={{ y: direction * 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: direction * -12, opacity: 0 }}
            transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 400, damping: 30 }}
            className="inline-block"
          >
            {current}
          </motion.span>
        </AnimatePresence>
      </motion.span>
      <motion.button type="button" tabIndex={-1} aria-label="Increase quantity" onPointerDown={(e) => startHold(1, e)} onPointerUp={stop} onPointerLeave={stop} whileTap={reduced ? undefined : { scale: 0.85 }} className={cn(btn, current >= max && "opacity-40")}>
        <Plus className="size-3.5" />
      </motion.button>
    </div>
  );
}
