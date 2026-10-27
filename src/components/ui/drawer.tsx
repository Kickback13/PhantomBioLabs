"use client";

// Adapted from 21st.dev "Drawer" by ddoemonn: drag-to-dismiss side panel with scrim,
// scroll lock, focus trap and inert background. Restyled for the Phantom theme.
import { useCallback, useEffect, useId, useRef, useSyncExternalStore, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { animate, motion, useDragControls, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const SPRING = { type: "spring", stiffness: 260, damping: 32, mass: 0.9 } as const;
const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';
type Inertable = HTMLElement & { inert?: boolean };

export type DrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  width?: number;
  className?: string;
};

export function Drawer({ open, onOpenChange, title, description, children, footer, width = 440, className }: DrawerProps) {
  const titleId = useId();
  const away = width + 32;
  const x = useMotionValue(away);
  const veil = useTransform(x, (v) => 1 - Math.min(1, Math.abs(v) / width));
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const returnTo = useRef<HTMLElement | null>(null);
  const reduced = useReducedMotion();
  const controls = useDragControls();
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false);
  const close = useCallback(() => onOpenChange(false), [onOpenChange]);

  useEffect(() => {
    const anim = animate(x, open ? 0 : away, reduced ? { duration: 0 } : SPRING);
    return () => anim.stop();
  }, [open, away, x, reduced]);

  // Focus in on open, back to the trigger on close.
  useEffect(() => {
    const panel = panelRef.current as Inertable | null;
    if (!panel) return;
    panel.inert = !open;
    if (open) {
      returnTo.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      (panel.querySelector<HTMLElement>(FOCUSABLE) ?? panel).focus({ preventScroll: true });
    } else if (returnTo.current?.isConnected) {
      returnTo.current.focus({ preventScroll: true });
      returnTo.current = null;
    }
  }, [open, mounted]);

  // Scroll lock and inert background while open.
  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const prev = { overflow: root.style.overflow, padding: root.style.paddingRight };
    const gutter = window.innerWidth - root.clientWidth;
    root.style.overflow = "hidden";
    if (gutter > 0) root.style.paddingRight = `${gutter}px`;
    const muted: Inertable[] = [];
    const shell = rootRef.current;
    for (const node of Array.from(document.body.children)) {
      if (!(node instanceof HTMLElement) || (shell && node.contains(shell))) continue;
      const el = node as Inertable;
      if (!el.inert) {
        el.inert = true;
        muted.push(el);
      }
    }
    return () => {
      root.style.overflow = prev.overflow;
      root.style.paddingRight = prev.padding;
      for (const el of muted) el.inert = false;
    };
  }, [open]);

  function onKeyDown(event: React.KeyboardEvent) {
    const panel = panelRef.current;
    if (!panel) return;
    if (event.key === "Escape") {
      event.stopPropagation();
      close();
      return;
    }
    if (event.key !== "Tab") return;
    const nodes = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE));
    if (!nodes.length) return;
    const [first, last] = [nodes[0], nodes[nodes.length - 1]];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  const tree = (
    <div ref={rootRef} className={cn("fixed inset-0 z-[90] overflow-hidden", !open && "pointer-events-none")}>
      <motion.div aria-hidden style={{ opacity: veil }} onClick={close} className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <motion.div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onKeyDown={onKeyDown}
        drag="x"
        dragControls={controls}
        dragListener={false}
        dragMomentum={false}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={{ left: 0, right: 1, top: 0, bottom: 0 }}
        onDragEnd={(_, info) => {
          if (info.offset.x > width * 0.35 || info.velocity.x > 520) close();
          else animate(x, 0, SPRING);
        }}
        style={{ x, width, maxWidth: "calc(100% - 28px)", touchAction: "pan-y" }}
        className={cn(
          "absolute inset-y-0 right-0 flex flex-col rounded-l-2xl border-l border-line-strong bg-ink-900 shadow-[0_0_80px_-20px_rgba(139,61,255,0.45)] outline-none",
          className,
        )}
      >
        <header onPointerDown={(e) => open && controls.start(e)} className="flex cursor-grab items-start gap-3 border-b border-line px-5 py-4 select-none active:cursor-grabbing">
          <div className="min-w-0 flex-1">
            <h2 id={titleId} className="text-base font-semibold tracking-tight">
              {title}
            </h2>
            {description ? <div className="mt-0.5 text-[13px] text-muted">{description}</div> : null}
          </div>
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={close}
            aria-label="Close"
            className="grid size-8 shrink-0 place-items-center rounded-lg text-muted transition-colors hover:bg-white/5 hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4">{children}</div>
        {footer ? <div className="border-t border-line px-5 py-4">{footer}</div> : null}
      </motion.div>
    </div>
  );

  return mounted ? createPortal(tree, document.body) : null;
}
