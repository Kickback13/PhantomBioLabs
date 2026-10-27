import { useId, type ComponentProps, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export const inputClass =
  "h-12 w-full rounded-xl border border-line-strong bg-ink-950 px-3.5 text-[15px] text-foreground outline-none transition-colors placeholder:text-subtle focus:border-violet-400/70 focus:bg-ink-900 aria-[invalid=true]:border-danger/70";

/** Labelled input with an optional hint and error message. */
export function Field({
  label,
  hint,
  error,
  className,
  id,
  ...props
}: ComponentProps<"input"> & { label: string; hint?: ReactNode; error?: string }) {
  const auto = useId();
  const fieldId = id ?? auto;
  return (
    <div className={cn("space-y-1.5", className)}>
      <label htmlFor={fieldId} className="block text-[13px] font-medium text-ink-200">
        {label}
        {props.required ? null : <span className="ml-1 font-normal text-subtle">(optional)</span>}
      </label>
      <input
        id={fieldId}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined}
        className={inputClass}
        {...props}
      />
      {error ? (
        <p id={`${fieldId}-error`} className="text-xs text-danger">
          {error}
        </p>
      ) : hint ? (
        <p id={`${fieldId}-hint`} className="text-xs text-subtle">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

/** Checkbox with a rich label; used for the research-use and age confirmations. */
export function CheckField({ children, className, ...props }: ComponentProps<"input"> & { children: ReactNode }) {
  return (
    <label className={cn("flex cursor-pointer gap-3 rounded-xl border border-line p-4 text-sm leading-relaxed transition-colors hover:border-line-strong has-[:checked]:border-violet-400/50 has-[:checked]:bg-violet-500/[0.06]", className)}>
      <input type="checkbox" className="mt-0.5 size-4 shrink-0 accent-[var(--violet-500)]" {...props} />
      <span className="text-ink-200">{children}</span>
    </label>
  );
}

export function FormError({ children }: { children?: ReactNode }) {
  if (!children) return null;
  return (
    <p role="alert" className="rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">
      {children}
    </p>
  );
}
