"use client";

// Inspired by 21st.dev "Beam Search Bar" (Spectrum UI): the bottom edge lights up with a travelling
// violet beam while the field has focus. The beam is pure CSS here instead of the border-beam package.
import { Search, X } from "lucide-react";
import { useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export function BeamSearch({
  value,
  onChange,
  placeholder = "Search…",
  trailing,
  className,
  autoFocus,
  label = "Search",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  trailing?: ReactNode;
  className?: string;
  autoFocus?: boolean;
  label?: string;
}) {
  const [focused, setFocused] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  return (
    <label
      className={cn(
        "relative flex h-12 w-full items-center gap-3 overflow-hidden rounded-xl border bg-ink-950 px-3.5 transition-colors",
        focused ? "border-violet-400/50" : "border-line-strong",
        className,
      )}
    >
      <span className="sr-only">{label}</span>
      <Search className="size-4 shrink-0 text-subtle" aria-hidden />
      <input
        ref={input}
        type="search"
        value={value}
        placeholder={placeholder}
        autoFocus={autoFocus}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onKeyDown={(e) => e.key === "Escape" && onChange("")}
        className="min-w-0 flex-1 bg-transparent text-[15px] text-foreground outline-none placeholder:text-subtle [&::-webkit-search-cancel-button]:hidden"
      />
      {value ? (
        <button
          type="button"
          aria-label="Clear search"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            onChange("");
            input.current?.focus();
          }}
          className="grid size-6 place-items-center rounded-full text-subtle hover:bg-white/8 hover:text-foreground"
        >
          <X className="size-3.5" />
        </button>
      ) : (
        trailing
      )}
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-x-0 bottom-0 h-px bg-[linear-gradient(90deg,transparent,var(--violet-400),var(--violet-300),transparent)] bg-[length:40%_100%] bg-no-repeat transition-opacity duration-300 motion-safe:animate-beam",
          focused ? "opacity-100" : "opacity-0",
        )}
      />
    </label>
  );
}
