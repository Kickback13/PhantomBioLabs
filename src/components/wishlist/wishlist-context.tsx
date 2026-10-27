"use client";

import { useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

type WishlistValue = {
  signedIn: boolean;
  ids: Set<string>;
  isSaved: (productId: string) => boolean;
  toggle: (productId: string, name: string) => Promise<void>;
};

const WishlistContext = createContext<WishlistValue | null>(null);

/** Saved products for signed-in customers, read and written straight to Supabase (row-level security). */
export function WishlistProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [ids, setIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;
    async function load(uid: string | null) {
      if (cancelled) return;
      setUserId(uid);
      if (!uid) return setIds(new Set());
      const { data } = await supabase.from("wishlist_items").select("product_id");
      if (!cancelled) setIds(new Set((data ?? []).map((r) => r.product_id)));
    }
    supabase.auth.getSession().then(({ data }) => load(data.session?.user.id ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      void load(session?.user.id ?? null);
    });
    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  const toggle = useCallback(
    async (productId: string, name: string) => {
      if (!userId) {
        toast("Sign in to save compounds to your wishlist", {
          action: { label: "Sign in", onClick: () => router.push(`/login?next=${encodeURIComponent(window.location.pathname)}`) },
        });
        return;
      }
      const supabase = createClient();
      const saved = ids.has(productId);
      setIds((prev) => {
        const next = new Set(prev);
        if (saved) next.delete(productId);
        else next.add(productId);
        return next;
      });
      const { error } = saved
        ? await supabase.from("wishlist_items").delete().eq("product_id", productId).eq("user_id", userId)
        : await supabase.from("wishlist_items").insert({ product_id: productId, user_id: userId });
      if (error) {
        setIds((prev) => {
          const next = new Set(prev);
          if (saved) next.add(productId);
          else next.delete(productId);
          return next;
        });
        toast.error("Couldn't update your wishlist. Please try again.");
        return;
      }
      toast.success(saved ? `Removed ${name} from your wishlist` : `Saved ${name} to your wishlist`);
      router.refresh();
    },
    [userId, ids, router],
  );

  const value = useMemo<WishlistValue>(
    () => ({ signedIn: Boolean(userId), ids, isSaved: (id) => ids.has(id), toggle }),
    [userId, ids, toggle],
  );
  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used inside <WishlistProvider>");
  return ctx;
}
