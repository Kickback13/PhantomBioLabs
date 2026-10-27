"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ChevronRight } from "lucide-react";
import { BeamSearch } from "@/components/ui/beam-search";
import type { AdminProduct } from "@/lib/admin";
import { formatPrice } from "@/lib/utils";
import { Select } from "./fields";
import { Pill } from "./status-badge";

function priceRange(p: AdminProduct) {
  const prices = p.variants.filter((v) => v.active).map((v) => v.priceCents);
  if (!prices.length) return "—";
  const [min, max] = [Math.min(...prices), Math.max(...prices)];
  return min === max ? formatPrice(min) : `${formatPrice(min)}–${formatPrice(max)}`;
}

function stockSummary(p: AdminProduct) {
  const shown = p.variants.filter((v) => v.active);
  const inStock = shown.filter((v) => v.inStock).length;
  return { inStock, total: shown.length };
}

export function ProductsTable({ products, categories }: { products: AdminProduct[]; categories: { id: string; name: string }[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [stock, setStock] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      if (q && !`${p.name} ${p.slug} ${p.variants.map((v) => `${v.label} ${v.sku ?? ""}`).join(" ")}`.toLowerCase().includes(q)) return false;
      if (category && p.categoryId !== category) return false;
      if (status && p.status !== status) return false;
      const { inStock, total } = stockSummary(p);
      if (stock === "in" && inStock === 0) return false;
      if (stock === "out" && inStock > 0) return false;
      if (stock === "partial" && (inStock === 0 || inStock === total)) return false;
      return true;
    });
  }, [products, query, category, status, stock]);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-[1fr_auto_auto_auto]">
        <BeamSearch value={query} onChange={setQuery} placeholder="Search by name, URL, size or SKU" label="Search products" />
        <Select aria-label="Category" value={category} onChange={(e) => setCategory(e.target.value)} className="h-12 md:w-52">
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
        <Select aria-label="Visibility" value={status} onChange={(e) => setStatus(e.target.value)} className="h-12 md:w-36">
          <option value="">Any visibility</option>
          <option value="active">Visible</option>
          <option value="hidden">Hidden</option>
        </Select>
        <Select aria-label="Stock" value={stock} onChange={(e) => setStock(e.target.value)} className="h-12 md:w-40">
          <option value="">Any stock</option>
          <option value="in">Has stock</option>
          <option value="partial">Some sizes out</option>
          <option value="out">Fully out</option>
        </Select>
      </div>

      <p className="font-mono text-[11px] tracking-wider text-subtle uppercase">
        {filtered.length} of {products.length} products
      </p>

      {/* Phones: cards */}
      <ul className="space-y-2 md:hidden">
        {filtered.map((p) => {
          const { inStock, total } = stockSummary(p);
          return (
            <li key={p.id}>
              <Link href={`/admin/products/${p.id}`} className="flex items-center gap-3 rounded-xl border border-line bg-surface p-4 hover:border-line-strong">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{p.name}</p>
                  <p className="mt-0.5 truncate text-xs text-muted">
                    {p.categoryName ?? "No category"} · {priceRange(p)}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <Pill tone={p.status === "active" ? "on" : "off"}>{p.status === "active" ? "Visible" : "Hidden"}</Pill>
                    <Pill tone={inStock === 0 ? "off" : inStock < total ? "warn" : "on"}>
                      {inStock}/{total} in stock
                    </Pill>
                  </div>
                </div>
                <ChevronRight className="size-4 text-subtle" />
              </Link>
            </li>
          );
        })}
      </ul>

      {/* Tablet and up: table */}
      <div className="hidden overflow-hidden rounded-[var(--radius-card)] border border-line md:block">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line bg-surface font-mono text-[10.5px] tracking-wider text-muted uppercase">
            <tr>
              <th className="px-4 py-3 font-normal">Product</th>
              <th className="px-4 py-3 font-normal">Category</th>
              <th className="px-4 py-3 font-normal">Sizes</th>
              <th className="px-4 py-3 font-normal">Price</th>
              <th className="px-4 py-3 font-normal">Stock</th>
              <th className="px-4 py-3 font-normal">Status</th>
              <th className="px-4 py-3">
                <span className="sr-only">Edit</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {filtered.map((p) => {
              const { inStock, total } = stockSummary(p);
              return (
                <tr key={p.id} className="group transition-colors hover:bg-white/[0.02]">
                  <td className="px-4 py-3">
                    <Link href={`/admin/products/${p.id}`} className="font-medium group-hover:text-violet-200">
                      {p.name}
                    </Link>
                    <p className="font-mono text-[11px] text-subtle">/{p.slug}</p>
                  </td>
                  <td className="px-4 py-3 text-muted">{p.categoryName ?? "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {p.variants.map((v) => (
                        <span
                          key={v.id}
                          className={`rounded-md border px-1.5 py-0.5 font-mono text-[10.5px] ${v.inStock && v.active ? "border-line-strong text-foreground" : "border-line text-subtle line-through"}`}
                        >
                          {v.label}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 tabular-nums">{priceRange(p)}</td>
                  <td className="px-4 py-3">
                    <Pill tone={inStock === 0 ? "off" : inStock < total ? "warn" : "on"}>
                      {inStock}/{total}
                    </Pill>
                  </td>
                  <td className="px-4 py-3">
                    <Pill tone={p.status === "active" ? "on" : "off"}>{p.status === "active" ? "Visible" : "Hidden"}</Pill>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/products/${p.id}`} className="text-sm text-violet-300 hover:text-violet-200">
                      Edit
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {filtered.length === 0 && <p className="rounded-xl border border-dashed border-line-strong p-8 text-center text-sm text-muted">No products match those filters.</p>}
    </div>
  );
}
