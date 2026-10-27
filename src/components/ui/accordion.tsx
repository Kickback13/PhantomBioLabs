"use client";

// Adapted from 21st.dev "Accordion" by ddoemonn: spring-animated disclosure with single or
// multiple open panels and arrow-key navigation. Restyled for the Phantom theme; height animates
// to "auto" through motion instead of being measured by hand.
import { motion, useReducedMotion } from "motion/react";
import { Plus } from "lucide-react";
import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { cn } from "@/lib/utils";

const DISCLOSE = { type: "spring", stiffness: 380, damping: 38, mass: 0.7 } as const;

export type AccordionItem = { id: string; title: ReactNode; content: ReactNode; meta?: ReactNode };

export function Accordion({
  items,
  type = "single",
  defaultOpen = [],
  className,
  headingLevel = 3,
}: {
  items: readonly AccordionItem[];
  type?: "single" | "multiple";
  defaultOpen?: readonly string[];
  className?: string;
  headingLevel?: 2 | 3 | 4;
}) {
  const base = useId();
  const reduced = useReducedMotion();
  const [open, setOpen] = useState<string[]>(() => (type === "single" ? defaultOpen.slice(0, 1) : [...defaultOpen]));
  const headers = useRef(new Map<string, HTMLButtonElement>());

  function toggle(id: string) {
    setOpen((prev) => {
      const active = prev.includes(id);
      if (type === "single") return active ? [] : [id];
      return active ? prev.filter((x) => x !== id) : [...prev, id];
    });
  }

  function onKeyDown(event: KeyboardEvent, index: number) {
    const keys: Record<string, number> = {
      ArrowDown: (index + 1) % items.length,
      ArrowUp: (index - 1 + items.length) % items.length,
      Home: 0,
      End: items.length - 1,
    };
    if (!(event.key in keys)) return;
    event.preventDefault();
    headers.current.get(items[keys[event.key]].id)?.focus();
  }

  return (
    <div className={cn("divide-y divide-line border-y border-line", className)}>
      {items.map((item, index) => {
        const isOpen = open.includes(item.id);
        const headerId = `${base}-h-${item.id}`;
        const panelId = `${base}-p-${item.id}`;
        return (
          <div key={item.id} className={cn("transition-colors duration-300", isOpen && "bg-violet-500/[0.04]")}>
            <div role="heading" aria-level={headingLevel}>
              <button
                ref={(node) => {
                  if (node) headers.current.set(item.id, node);
                  else headers.current.delete(item.id);
                }}
                id={headerId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggle(item.id)}
                onKeyDown={(e) => onKeyDown(e, index)}
                className="group flex w-full items-center gap-4 px-1 py-5 text-left sm:px-3"
              >
                <span className={cn("min-w-0 flex-1 text-[16px] font-medium tracking-tight transition-colors sm:text-lg", isOpen ? "text-foreground" : "text-ink-100 group-hover:text-violet-200")}>
                  {item.title}
                </span>
                {item.meta ? <span className="hidden shrink-0 font-mono text-[10.5px] tracking-[0.16em] text-subtle uppercase sm:inline">{item.meta}</span> : null}
                <motion.span
                  aria-hidden="true"
                  initial={false}
                  animate={{ rotate: isOpen ? 45 : 0 }}
                  transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 600, damping: 40 }}
                  className={cn(
                    "grid size-8 shrink-0 place-items-center rounded-full border transition-colors",
                    isOpen ? "border-violet-400/50 bg-violet-500/15 text-violet-200" : "border-line text-violet-400 group-hover:border-violet-400/40",
                  )}
                >
                  <Plus className="size-4" />
                </motion.span>
              </button>
            </div>
            <motion.div
              id={panelId}
              role="region"
              aria-labelledby={headerId}
              initial={false}
              animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
              transition={reduced ? { duration: 0 } : { height: DISCLOSE, opacity: { duration: isOpen ? 0.25 : 0.12 } }}
              className="overflow-hidden"
              inert={!isOpen}
            >
              <div className="px-1 pr-14 pb-6 text-[15px] leading-relaxed text-muted sm:px-3 sm:pr-20">{item.content}</div>
            </motion.div>
          </div>
        );
      })}
    </div>
  );
}
