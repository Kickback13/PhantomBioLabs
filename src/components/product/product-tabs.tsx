"use client";

// Tab bar adapted from 21st.dev "Animated Tabs" by educalvolpz: sliding indicator with keyboard
// navigation. Panels fade between tabs.
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useId, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export function ProductTabs({ tabs }: { tabs: { id: string; label: string; content: ReactNode }[] }) {
  const [active, setActive] = useState(tabs[0]?.id);
  const reduced = useReducedMotion();
  const uid = useId();

  function onKeyDown(event: React.KeyboardEvent, index: number) {
    const delta = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
    if (!delta) return;
    event.preventDefault();
    const next = tabs[(index + delta + tabs.length) % tabs.length];
    setActive(next.id);
    document.getElementById(`${uid}-tab-${next.id}`)?.focus();
  }

  const current = tabs.find((t) => t.id === active) ?? tabs[0];
  return (
    <div>
      <div role="tablist" aria-label="Product information" className="relative flex gap-1 overflow-x-auto border-b border-line [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {tabs.map((tab, i) => {
          const isActive = tab.id === current.id;
          return (
            <button
              key={tab.id}
              id={`${uid}-tab-${tab.id}`}
              role="tab"
              type="button"
              aria-selected={isActive}
              aria-controls={`${uid}-panel`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => setActive(tab.id)}
              onKeyDown={(e) => onKeyDown(e, i)}
              className={cn(
                "relative shrink-0 px-4 py-3 text-sm font-medium transition-colors",
                isActive ? "text-foreground" : "text-muted hover:text-foreground",
              )}
            >
              {isActive && (
                <motion.span
                  layoutId={`${uid}-indicator`}
                  className="absolute inset-x-0 -bottom-px h-0.5 bg-gradient-to-r from-violet-500 to-violet-300 shadow-[0_0_12px_var(--violet-500)]"
                  transition={reduced ? { duration: 0 } : { type: "spring", bounce: 0.05, duration: 0.25 }}
                />
              )}
              {tab.label}
            </button>
          );
        })}
      </div>
      <div id={`${uid}-panel`} role="tabpanel" aria-labelledby={`${uid}-tab-${current.id}`} className="pt-8">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={current.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }}>
            {current.content}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
