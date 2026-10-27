"use client";

// Adapted from 21st.dev "Animated Progress Stepper" (shadcnspace): spring progress line, travelling
// dot, pulsing active step and icon-to-check morph. Display-only here.
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Check, ClipboardList, PackageCheck, ShieldCheck, ShoppingBag, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS: { title: string; icon: LucideIcon }[] = [
  { title: "Cart", icon: ShoppingBag },
  { title: "Details", icon: ClipboardList },
  { title: "Confirm", icon: ShieldCheck },
  { title: "Placed", icon: PackageCheck },
];

export function CheckoutStepper({ active }: { active: number }) {
  const reduced = useReducedMotion();
  const progress = active / (STEPS.length - 1);
  return (
    <ol className="relative mx-auto flex max-w-xl items-start justify-between">
      <span aria-hidden className="absolute top-5 h-0.5 bg-line-strong" style={{ left: "12.5%", right: "12.5%" }} />
      <motion.span
        aria-hidden
        className="absolute top-5 h-0.5 origin-left bg-gradient-to-r from-violet-600 to-violet-300"
        style={{ left: "12.5%", right: "12.5%" }}
        initial={false}
        animate={{ scaleX: progress }}
        transition={{ type: "spring", stiffness: 120, damping: 20 }}
      />
      <motion.span
        aria-hidden
        className="absolute size-2 rounded-full bg-violet-300 shadow-[0_0_10px_var(--violet-400)]"
        style={{ top: 21, x: "-50%", y: "-50%" }}
        initial={false}
        animate={{ left: `${12.5 + progress * 75}%` }}
        transition={{ type: "spring", stiffness: 160, damping: 24 }}
      />
      {STEPS.map((step, i) => {
        const done = i < active;
        const current = i === active;
        return (
          <li key={step.title} aria-current={current ? "step" : undefined} className="relative flex flex-1 flex-col items-center gap-2">
            <span className="relative z-10 grid size-10 place-items-center rounded-full">
              <span className={cn("absolute inset-0 rounded-full border", done || current ? "border-violet-400 bg-violet-500" : "border-line-strong bg-ink-900")} />
              {current && !reduced && (
                <motion.span
                  className="absolute inset-0 rounded-full ring-2 ring-violet-400/50"
                  animate={{ scale: [1, 1.4, 1], opacity: [1, 0.2, 1] }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                />
              )}
              <AnimatePresence mode="wait" initial={false}>
                {done ? (
                  <motion.span key="check" initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0 }} className="relative text-white">
                    <Check className="size-4" strokeWidth={3} />
                  </motion.span>
                ) : (
                  <motion.span key="icon" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className={cn("relative", current ? "text-white" : "text-subtle")}>
                    <step.icon className="size-4" />
                  </motion.span>
                )}
              </AnimatePresence>
            </span>
            <span className={cn("text-xs font-medium", done || current ? "text-foreground" : "text-subtle")}>{step.title}</span>
          </li>
        );
      })}
    </ol>
  );
}
