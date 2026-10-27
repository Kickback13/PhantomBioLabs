"use client";

// Adapted from 21st.dev "Animated Tabs" by educalvolpz: a pill indicator that springs between
// tabs via a shared layoutId. This version renders links, for switching between pages.
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { useEffect, useId, useRef } from "react";
import { cn } from "@/lib/utils";

export function AnimatedTabLinks({
  tabs,
  active,
  label,
  className,
}: {
  tabs: { href: string; label: string }[];
  active: string;
  label: string;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const layoutId = `tabs-${useId()}`;
  const navRef = useRef<HTMLElement>(null);

  // On narrow screens the row scrolls sideways: bring the active tab into view.
  useEffect(() => {
    const nav = navRef.current;
    const current = nav?.querySelector<HTMLElement>('[aria-current="page"]');
    if (!nav || !current || nav.scrollWidth <= nav.clientWidth) return;
    const navBox = nav.getBoundingClientRect();
    const box = current.getBoundingClientRect();
    nav.scrollLeft += box.left - navBox.left - (navBox.width - box.width) / 2;
  }, [active]);
  return (
    <nav ref={navRef} aria-label={label} className={cn("-mx-4 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden", className)}>
      <ul className="inline-flex gap-1 rounded-full border border-line bg-ink-900/70 p-1 backdrop-blur">
        {tabs.map((tab) => {
          const isActive = tab.href === active;
          return (
            <li key={tab.href} className="relative">
              {isActive && (
                <motion.span
                  layoutId={layoutId}
                  transition={reduced ? { duration: 0 } : { type: "spring", bounce: 0.12, duration: 0.35 }}
                  className="absolute inset-0 rounded-full border border-violet-400/40 bg-violet-500/20 shadow-[0_0_20px_-6px_var(--violet-500)]"
                />
              )}
              <Link
                href={tab.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "relative z-10 block rounded-full px-4 py-2 text-[13px] font-medium whitespace-nowrap transition-colors",
                  isActive ? "text-foreground" : "text-muted hover:text-foreground",
                )}
              >
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
