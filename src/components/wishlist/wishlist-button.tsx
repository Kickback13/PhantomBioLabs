"use client";

import { Heart } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { useWishlist } from "./wishlist-context";

export function WishlistButton({ productId, name, className }: { productId: string; name: string; className?: string }) {
  const { isSaved, toggle } = useWishlist();
  const saved = isSaved(productId);
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.88 }}
      onClick={() => void toggle(productId, name)}
      aria-pressed={saved}
      aria-label={saved ? `Remove ${name} from wishlist` : `Save ${name} to wishlist`}
      className={cn(
        "grid size-13 shrink-0 place-items-center rounded-xl border transition-colors",
        saved ? "border-violet-400/60 bg-violet-500/15 text-violet-300" : "border-line-strong text-muted hover:border-violet-400/50 hover:text-foreground",
        className,
      )}
    >
      <Heart className={cn("size-5", saved && "fill-current")} />
    </motion.button>
  );
}
