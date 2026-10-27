"use client";

import { SearchX } from "lucide-react";
import { useMemo, useState } from "react";
import { Accordion } from "@/components/ui/accordion";
import { BeamSearch } from "@/components/ui/beam-search";
import { ChipGroup } from "@/components/ui/chip-group";
import type { FaqItem } from "@/content/faq";

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

/** Searchable, topic-filtered FAQ. Topics are listed in the order they first appear. */
export function FaqExplorer({ items }: { items: FaqItem[] }) {
  const [query, setQuery] = useState("");
  const [topic, setTopic] = useState<string[]>([]);

  const topics = useMemo(() => {
    const order: string[] = [];
    for (const item of items) if (!order.includes(item.topic)) order.push(item.topic);
    return order.map((t) => ({ value: t, label: t, count: items.filter((i) => i.topic === t).length }));
  }, [items]);

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const visible = items.filter(
      (i) => (!topic.length || topic.includes(i.topic)) && (!q || i.q.toLowerCase().includes(q) || i.a.toLowerCase().includes(q)),
    );
    return topics
      .map((t) => ({ topic: t.value, items: visible.filter((i) => i.topic === t.value) }))
      .filter((g) => g.items.length);
  }, [items, topics, query, topic]);

  const total = groups.reduce((n, g) => n + g.items.length, 0);

  return (
    <div className="grid gap-10 lg:grid-cols-[300px_1fr] lg:gap-16">
      <div className="space-y-5 lg:sticky lg:top-28 lg:self-start">
        <BeamSearch value={query} onChange={setQuery} placeholder="Search questions" label="Search the FAQ" />
        <div>
          <p className="eyebrow mb-3">Topics</p>
          <ChipGroup label="Filter by topic" options={topics} value={topic} onValueChange={setTopic} />
        </div>
        <p className="font-mono text-[11px] tracking-[0.16em] text-subtle uppercase" aria-live="polite">
          {total} {total === 1 ? "answer" : "answers"}
        </p>
      </div>

      <div className="space-y-12">
        {groups.length ? (
          groups.map((g, gi) => (
            <section key={g.topic} aria-labelledby={`faq-${slug(g.topic)}`}>
              <h2 id={`faq-${slug(g.topic)}`} className="eyebrow mb-2 flex items-center gap-3">
                <span aria-hidden="true" className="size-1.5 rounded-full bg-violet-400" />
                {g.topic}
              </h2>
              <Accordion
                headingLevel={3}
                defaultOpen={gi === 0 ? [slug(g.items[0].q)] : []}
                items={g.items.map((i) => ({ id: slug(i.q), title: i.q, content: <p>{i.a}</p> }))}
              />
            </section>
          ))
        ) : (
          <div className="flex flex-col items-center rounded-[var(--radius-card)] border border-dashed border-line-strong px-6 py-16 text-center">
            <SearchX className="size-6 text-violet-300" />
            <p className="mt-4 font-medium">No answers match that search</p>
            <p className="mt-1 text-sm text-muted">Try another word, or message the team on WhatsApp.</p>
          </div>
        )}
      </div>
    </div>
  );
}
