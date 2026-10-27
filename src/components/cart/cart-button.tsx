"use client";

import { ShoppingBag } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCart } from "./cart-context";

export function CartButton() {
  const { count, ready, setOpen } = useCart();
  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      aria-label={`Open cart${ready && count ? `, ${count} item${count === 1 ? "" : "s"}` : ""}`}
      className="relative grid size-10 place-items-center rounded-xl text-foreground transition-colors hover:bg-white/5"
    >
      <ShoppingBag className="size-[18px]" />
      <AnimatePresence>
        {ready && count > 0 && (
          <motion.span
            key={count}
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.4, opacity: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 22 }}
            className="absolute top-1 right-1 grid h-4 min-w-4 place-items-center rounded-full bg-violet-500 px-1 font-mono text-[9px] text-white shadow-[0_0_10px_var(--violet-500)]"
          >
            {count}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}
