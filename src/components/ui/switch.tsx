"use client";

// Adapted from 21st.dev "Switch" by halaska-studio: an aria-switch toggle with a spring-eased
// thumb that stretches while pressed. Restyled with Phantom tokens and motion/react.
import { motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function Switch({
  checked,
  onCheckedChange,
  label,
  description,
  name,
  disabled,
  className,
}: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  /** When set, a hidden input submits "on"/"off" with the surrounding form. */
  name?: string;
  disabled?: boolean;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const [pressed, setPressed] = useState(false);
  const thumb = pressed ? 22 : 18;
  return (
    <label className={cn("inline-flex cursor-pointer items-center gap-3 select-none", disabled && "cursor-not-allowed opacity-50", className)}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label ? undefined : name}
        disabled={disabled}
        onClick={() => onCheckedChange(!checked)}
        onPointerDown={() => setPressed(true)}
        onPointerUp={() => setPressed(false)}
        onPointerLeave={() => setPressed(false)}
        className={cn(
          "relative h-6 w-11 shrink-0 rounded-full border transition-colors duration-200",
          checked ? "border-violet-400/60 bg-violet-500 shadow-[0_0_14px_-2px_var(--violet-500)]" : "border-line-strong bg-ink-800",
        )}
      >
        <motion.span
          aria-hidden
          className="absolute top-[2px] h-[18px] rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.4)]"
          initial={false}
          animate={{ left: checked ? 44 - thumb - 4 : 2, width: thumb }}
          transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 520, damping: 32 }}
        />
      </button>
      {(label || description) && (
        <span className="flex flex-col">
          {label && <span className="text-sm font-medium">{label}</span>}
          {description && <span className="text-xs text-muted">{description}</span>}
        </span>
      )}
      {name && <input type="hidden" name={name} value={checked ? "on" : "off"} />}
    </label>
  );
}
