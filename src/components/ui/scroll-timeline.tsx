"use client";

// Adapted from 21st.dev "Timeline" by Aceternity (manuarora700): sticky step titles with a beam
// that fills down the rail as you scroll. The beam scales instead of measuring the list height.
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef, type ReactNode } from "react";

export type TimelineEntry = { title: string; label?: string; content: ReactNode };

export function ScrollTimeline({ data }: { data: TimelineEntry[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 30%", "end 60%"] });
  const scaleY = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.05], [0, 1]);

  return (
    <div ref={ref} className="relative">
      {data.map((item, index) => (
        <div key={item.title} className="flex justify-start gap-6 pt-10 first:pt-0 md:gap-10 md:pt-20">
          <div className="sticky top-28 z-10 flex w-10 shrink-0 flex-col items-start self-start md:w-72 md:flex-row md:items-center lg:w-80">
            <div className="grid size-10 shrink-0 place-items-center rounded-full border border-violet-400/40 bg-ink-950 shadow-[0_0_24px_-6px_var(--violet-500)]">
              <span className="font-mono text-[11px] text-violet-300">{String(index + 1).padStart(2, "0")}</span>
            </div>
            <div className="hidden md:block md:pl-6">
              {item.label && <p className="eyebrow">{item.label}</p>}
              <h3 className="mt-1 text-3xl font-semibold tracking-tight text-ink-200 lg:text-4xl">{item.title}</h3>
            </div>
          </div>
          <div className="w-full min-w-0">
            <div className="md:hidden">
              {item.label && <p className="eyebrow">{item.label}</p>}
              <h3 className="mt-1 mb-3 text-2xl font-semibold tracking-tight">{item.title}</h3>
            </div>
            {item.content}
          </div>
        </div>
      ))}
      <div
        aria-hidden="true"
        className="absolute top-0 bottom-0 left-[19px] w-px overflow-hidden bg-gradient-to-b from-transparent via-line-strong to-transparent [mask-image:linear-gradient(to_bottom,transparent_0%,black_8%,black_92%,transparent_100%)]"
      >
        <motion.div
          style={reduced ? undefined : { scaleY, opacity }}
          className="absolute inset-0 origin-top bg-gradient-to-b from-violet-300 via-violet-500 to-transparent"
        />
      </div>
    </div>
  );
}
