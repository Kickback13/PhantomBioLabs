"use client";

// Inspired by 21st.dev "Chip Group" by kuratlielia: selectable filter chips where a check draws
// itself in as the label slides over and neighbours glide into place. Simplified for this theme.
import { LayoutGroup, motion, useReducedMotion } from "motion/react";
import type { KeyboardEvent } from "react";
import { cn } from "@/lib/utils";

export type ChipOption = { value: string; label: string; count?: number };

export function ChipGroup({
  options,
  value,
  onValueChange,
  label,
  multiple = false,
  className,
}: {
  options: ChipOption[];
  value: string[];
  onValueChange: (value: string[]) => void;
  label: string;
  multiple?: boolean;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const spring = reduced ? { duration: 0 } : ({ type: "spring", stiffness: 520, damping: 34 } as const);

  function toggle(next: string) {
    const on = value.includes(next);
    if (!multiple) return onValueChange(on ? [] : [next]);
    onValueChange(on ? value.filter((v) => v !== next) : [...value, next]);
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const buttons = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>("button[data-chip]"));
    const index = buttons.indexOf(document.activeElement as HTMLButtonElement);
    if (index < 0) return;
    const last = buttons.length - 1;
    const moves: Record<string, number> = {
      ArrowRight: index === last ? 0 : index + 1,
      ArrowLeft: index === 0 ? last : index - 1,
      Home: 0,
      End: last,
    };
    if (!(event.key in moves)) return;
    event.preventDefault();
    buttons[moves[event.key]].focus();
  }

  return (
    <LayoutGroup>
      <div role="group" aria-label={label} onKeyDown={onKeyDown} className={cn("flex flex-wrap gap-2", className)}>
        {options.map((option) => {
          const selected = value.includes(option.value);
          return (
            <motion.button
              key={option.value}
              layout="position"
              transition={{ layout: spring }}
              type="button"
              data-chip={option.value}
              aria-pressed={selected}
              onClick={() => toggle(option.value)}
              className={cn(
                "inline-flex h-9 items-center rounded-full border px-3.5 text-[13px] font-medium whitespace-nowrap transition-colors",
                selected
                  ? "border-violet-400/60 bg-violet-500/15 text-foreground shadow-[0_0_18px_-6px_var(--violet-500)]"
                  : "border-line-strong text-muted hover:border-violet-400/40 hover:text-foreground",
              )}
            >
              <motion.span
                aria-hidden="true"
                initial={false}
                animate={{ width: selected ? 18 : 0, opacity: selected ? 1 : 0 }}
                transition={spring}
                className="inline-flex overflow-hidden text-violet-300"
              >
                <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round">
                  <motion.path d="M4 12.5 9.5 18 20 6.5" initial={false} animate={{ pathLength: selected ? 1 : 0 }} transition={reduced ? { duration: 0 } : { duration: 0.25, delay: selected ? 0.05 : 0 }} />
                </svg>
              </motion.span>
              {option.label}
              {option.count !== undefined && <span className={cn("ml-2 font-mono text-[10.5px]", selected ? "text-violet-200" : "text-subtle")}>{option.count}</span>}
            </motion.button>
          );
        })}
      </div>
    </LayoutGroup>
  );
}
