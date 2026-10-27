import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ProductGrid } from "@/components/shop/product-grid";
import { getProducts } from "@/lib/catalog";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Your wishlist", robots: { index: false } };

export default function WishlistPage() {
  return (
    <Suspense fallback={<div className="h-64 animate-pulse rounded-2xl bg-surface" />}>
      <Wishlist />
    </Suspense>
  );
}

async function Wishlist() {
  const supabase = await createClient();
  const [{ data }, products] = await Promise.all([supabase.from("wishlist_items").select("product_id").order("created_at", { ascending: false }), getProducts()]);
  const ids = (data ?? []).map((r) => r.product_id);
  const saved = ids.map((id) => products.find((p) => p.id === id)).filter((p) => p !== undefined);
  if (!saved.length) {
    return (
      <div className="rounded-2xl border border-dashed border-line-strong p-8 text-center text-sm text-muted">
        Nothing saved yet. Tap the heart on any product to save it here.{" "}
        <Link href="/shop" className="text-violet-300 hover:underline">
          Browse the catalog
        </Link>
      </div>
    );
  }
  return <ProductGrid products={saved} priorityCount={0} />;
}
