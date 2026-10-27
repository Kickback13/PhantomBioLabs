"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { AlertTriangle, ArrowDown, ArrowUp, ExternalLink, Plus, Trash2 } from "lucide-react";
import { saveProduct } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import type { AdminProduct } from "@/lib/admin";
import { slugify, type VariantInput } from "@/lib/admin-validation";
import { cn } from "@/lib/utils";
import { Card, Field, Input, Select, Textarea } from "./fields";
import { initialActionState, useActionToast } from "./use-action-toast";

type Row = VariantInput & { key: string };

const dollars = (cents: number | null) => (cents === null ? "" : (cents / 100).toFixed(2));
let rowCounter = 0;
const newKey = () => `new-${++rowCounter}`;

function toRows(product: AdminProduct | null): Row[] {
  if (!product?.variants.length) {
    return [{ key: newKey(), label: "", sku: "", price: "", compareAt: "", inStock: true, stockQuantity: "", active: true }];
  }
  return product.variants.map((v) => ({
    key: v.id,
    id: v.id,
    label: v.label,
    sku: v.sku ?? "",
    price: dollars(v.priceCents),
    compareAt: dollars(v.compareAtCents),
    inStock: v.inStock,
    stockQuantity: v.stockQuantity === null ? "" : String(v.stockQuantity),
    active: v.active,
  }));
}

export function ProductForm({
  product,
  categories,
  justCreated = false,
}: {
  product: AdminProduct | null;
  categories: { id: string; name: string }[];
  justCreated?: boolean;
}) {
  const [state, action, pending] = useActionState(saveProduct, initialActionState);
  useActionToast(state);

  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(product));
  const [visible, setVisible] = useState(product ? product.status === "active" : false);
  const [summary, setSummary] = useState(product?.summary ?? "");
  const [categoryId, setCategoryId] = useState(product?.categoryId ?? "");
  const [featured, setFeatured] = useState(product?.featuredRank ? String(product.featuredRank) : "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [rows, setRows] = useState<Row[]>(() => toRows(product));

  // After a save the page re-renders with fresh data. When sizes were added or removed, take the
  // saved rows (with their new ids) so the next save updates them instead of adding them again.
  const savedSizes = product ? product.variants.map((v) => v.id).join(",") : "";
  const [syncedSizes, setSyncedSizes] = useState(savedSizes);
  if (savedSizes !== syncedSizes) {
    setSyncedSizes(savedSizes);
    setRows(toRows(product));
  }

  const announced = useRef(false);
  useEffect(() => {
    if (justCreated && !announced.current) {
      announced.current = true;
      toast.success("Product created. Add a COA and photos when you have them.");
    }
  }, [justCreated]);

  const errors = state.errors ?? {};
  const sizeErrors = Object.entries(errors).filter(([k]) => k.startsWith("variant_") || k === "variants");
  const slugChanged = Boolean(product && slug && slug !== product.slug);

  function update(key: string, patch: Partial<Row>) {
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  }
  function move(index: number, by: -1 | 1) {
    setRows((prev) => {
      const next = [...prev];
      const target = index + by;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="id" value={product?.id ?? ""} />
      <input type="hidden" name="variants" value={JSON.stringify(rows, (k, v) => (k === "key" ? undefined : v))} />

      {state.message && !state.ok && (
        <div role="alert" className="flex gap-3 rounded-xl border border-danger/30 bg-danger/10 p-4 text-sm">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-danger" />
          <div>
            <p className="font-medium">{state.message}</p>
            {sizeErrors.length > 0 && (
              <ul className="mt-1.5 list-disc space-y-0.5 pl-4 text-muted">
                {sizeErrors.map(([k, v]) => (
                  <li key={k}>{v}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <Card title="Product details">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Name" htmlFor="name" error={errors.name} className="sm:col-span-2">
              <Input
                id="name"
                name="name"
                value={name}
                maxLength={120}
                required
                aria-invalid={Boolean(errors.name)}
                onChange={(e) => {
                  setName(e.target.value);
                  if (!slugTouched) setSlug(slugify(e.target.value));
                }}
              />
            </Field>
            <Field
              label="URL"
              htmlFor="slug"
              error={errors.slug}
              className="sm:col-span-2"
              hint={
                slugChanged ? (
                  <span className="flex items-center gap-1.5 text-amber-200">
                    <AlertTriangle className="size-3.5" /> The old address /product/{product?.slug} will redirect to the new one.
                  </span>
                ) : (
                  "Lowercase letters, numbers and hyphens."
                )
              }
            >
              <div className="flex">
                <span className="inline-flex items-center rounded-l-lg border border-r-0 border-line-strong bg-ink-850 px-3 font-mono text-xs text-subtle">/product/</span>
                <Input
                  id="slug"
                  name="slug"
                  value={slug}
                  maxLength={80}
                  required
                  aria-invalid={Boolean(errors.slug)}
                  className="rounded-l-none font-mono"
                  onChange={(e) => {
                    setSlugTouched(true);
                    setSlug(e.target.value.toLowerCase());
                  }}
                />
              </div>
            </Field>
            <Field label="Category" htmlFor="category_id" error={errors.category_id}>
              <Select id="category_id" name="category_id" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                <option value="">No category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Featured on home page" htmlFor="featured_rank" error={errors.featured_rank} hint="1 shows first. Leave empty to not feature it.">
              <Input id="featured_rank" name="featured_rank" inputMode="numeric" value={featured} onChange={(e) => setFeatured(e.target.value)} placeholder="e.g. 3" />
            </Field>
            <Field label="Summary" htmlFor="summary" error={errors.summary} hint={`${summary.length}/160 · shown on product cards`} className="sm:col-span-2">
              <Input id="summary" name="summary" value={summary} maxLength={160} onChange={(e) => setSummary(e.target.value)} placeholder="e.g. GLP-1 receptor agonist" />
            </Field>
            <Field
              label="Description"
              htmlFor="description"
              error={errors.description}
              className="sm:col-span-2"
              hint={`${description.length}/4000 · Say what the compound is and what research it's used in. No effects on people, no dosing.`}
            >
              <Textarea id="description" name="description" value={description} maxLength={4000} rows={6} onChange={(e) => setDescription(e.target.value)} />
            </Field>
          </div>
        </Card>

        <div className="space-y-6">
          <Card title="Visibility">
            <Switch
              name="active"
              checked={visible}
              onCheckedChange={setVisible}
              label={visible ? "Visible on the store" : "Hidden from the store"}
              description={visible ? "Shown in the shop and search." : "Only admins can see it."}
            />
            {product && product.status === "active" && (
              <Link href={`/product/${product.slug}`} target="_blank" className="mt-5 inline-flex items-center gap-1.5 text-sm text-violet-300 hover:text-violet-200">
                View on store <ExternalLink className="size-3.5" />
              </Link>
            )}
            {product?.legacySlug && <p className="mt-3 text-xs text-subtle">Old address /product/{product.legacySlug} redirects here.</p>}
          </Card>
        </div>
      </div>

      <Card
        title="Sizes and prices"
        description="Each size has its own price, sale price and stock. The order here is the order on the store."
        action={
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={rows.length >= 20}
            onClick={() => setRows((prev) => [...prev, { key: newKey(), label: "", sku: "", price: "", compareAt: "", inStock: true, stockQuantity: "", active: true }])}
          >
            <Plus /> Add size
          </Button>
        }
      >
        <div className="space-y-3">
          {rows.map((row, index) => (
            <div
              key={row.key}
              className={cn(
                "rounded-xl border bg-ink-950/50 p-4",
                errors[`variant_${index}`] ? "border-danger/50" : "border-line",
                !row.active && "opacity-70",
              )}
            >
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1.1fr_1.2fr_0.9fr_0.9fr_0.8fr]">
                <Field label="Size label" htmlFor={`label-${row.key}`}>
                  <Input id={`label-${row.key}`} value={row.label} placeholder="10 mg" maxLength={40} onChange={(e) => update(row.key, { label: e.target.value })} />
                </Field>
                <Field label="SKU" htmlFor={`sku-${row.key}`}>
                  <Input id={`sku-${row.key}`} value={row.sku} placeholder="PBL-BPC157-10MG" maxLength={40} className="font-mono uppercase" onChange={(e) => update(row.key, { sku: e.target.value })} />
                </Field>
                <Field label="Price ($)" htmlFor={`price-${row.key}`}>
                  <Input id={`price-${row.key}`} value={row.price} inputMode="decimal" placeholder="34.99" onChange={(e) => update(row.key, { price: e.target.value })} />
                </Field>
                <Field label='"Was" price ($)' htmlFor={`was-${row.key}`}>
                  <Input id={`was-${row.key}`} value={row.compareAt} inputMode="decimal" placeholder="Optional" onChange={(e) => update(row.key, { compareAt: e.target.value })} />
                </Field>
                <Field label="Stock count" htmlFor={`stock-${row.key}`}>
                  <Input id={`stock-${row.key}`} value={row.stockQuantity} inputMode="numeric" placeholder="Optional" onChange={(e) => update(row.key, { stockQuantity: e.target.value })} />
                </Field>
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-5">
                  <Switch checked={row.inStock} onCheckedChange={(v) => update(row.key, { inStock: v })} label={row.inStock ? "In stock" : "Out of stock"} />
                  <Switch checked={row.active} onCheckedChange={(v) => update(row.key, { active: v })} label={row.active ? "Shown" : "Hidden"} />
                </div>
                <div className="flex items-center gap-1">
                  <Button type="button" variant="ghost" size="icon" aria-label="Move size up" disabled={index === 0} onClick={() => move(index, -1)} className="size-8">
                    <ArrowUp />
                  </Button>
                  <Button type="button" variant="ghost" size="icon" aria-label="Move size down" disabled={index === rows.length - 1} onClick={() => move(index, 1)} className="size-8">
                    <ArrowDown />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={rows.length === 1}
                    onClick={() => setRows((prev) => prev.filter((r) => r.key !== row.key))}
                    className="text-subtle hover:text-danger"
                  >
                    <Trash2 /> Remove
                  </Button>
                </div>
              </div>
              {errors[`variant_${index}`] && <p className="mt-3 text-xs text-danger">{errors[`variant_${index}`]}</p>}
            </div>
          ))}
        </div>
      </Card>

      <div className="sticky bottom-4 z-10 flex items-center justify-between gap-3 rounded-2xl border border-line-strong bg-ink-900/90 p-3 pl-5 backdrop-blur-xl">
        <p className="hidden text-sm text-muted sm:block">{product ? "Changes go live on the store as soon as you save." : "New products go live when they're set to visible."}</p>
        <div className="flex w-full gap-2 sm:w-auto">
          <Button asChild variant="ghost" className="flex-1 sm:flex-none">
            <Link href="/admin/products">Cancel</Link>
          </Button>
          <Button type="submit" disabled={pending} className="flex-1 sm:flex-none">
            {pending ? "Saving…" : product ? "Save changes" : "Create product"}
          </Button>
        </div>
      </div>
    </form>
  );
}
