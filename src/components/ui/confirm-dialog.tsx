"use client";

// Confirmation dialog for destructive actions, modelled on the shadcn/21st.dev "Alert Dialog"
// pattern, built on the native <dialog> element so it needs no extra package.
import { AlertTriangle } from "lucide-react";
import { useEffect, useRef, type ReactNode } from "react";
import { Button } from "@/components/ui/button";

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Delete",
  pending = false,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: ReactNode;
  confirmLabel?: string;
  pending?: boolean;
  onConfirm: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={() => onOpenChange(false)}
      onClick={(e) => e.target === ref.current && onOpenChange(false)}
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl border border-line-strong bg-ink-900 p-0 text-foreground shadow-[0_40px_120px_-20px_rgba(0,0,0,0.9)] backdrop:bg-black/70 backdrop:backdrop-blur-sm"
    >
      <div className="p-6">
        <div className="flex gap-4">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-danger/30 bg-danger/10 text-danger">
            <AlertTriangle className="size-5" />
          </span>
          <div>
            <h2 className="text-base font-semibold tracking-tight">{title}</h2>
            {description && <div className="mt-1.5 text-sm leading-relaxed text-muted">{description}</div>}
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)} disabled={pending}>
            Cancel
          </Button>
          <Button type="button" size="sm" onClick={onConfirm} disabled={pending} className="bg-danger text-white shadow-none hover:bg-danger/85">
            {pending ? "Working…" : confirmLabel}
          </Button>
        </div>
      </div>
    </dialog>
  );
}
