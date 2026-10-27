"use server";

import { refresh, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { CATALOG_TAG, COAS_TAG, SETTINGS_TAG } from "@/lib/catalog";
import { ORDER_STATUSES, type OrderStatus } from "@/lib/admin";
import { friendlyDbError, parseDollars, validateProduct, type CleanProduct, type CleanVariant } from "@/lib/admin-validation";
import { createClient } from "@/lib/supabase/server";

export type ActionState = {
  ok: boolean;
  message: string;
  errors?: Record<string, string>;
  /** Changes on every completed submit, so forms can show a toast once per save. */
  at?: number;
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// ---------------------------------------------------------------- products

export async function saveProduct(_prev: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  const { errors, product, variants } = validateProduct(form);
  if (Object.keys(errors).length) {
    return { ok: false, message: errors.form ?? "Fix the highlighted fields and save again.", errors, at: Date.now() };
  }

  const supabase = await createClient();
  // admin_save_product comes from migration 20261027000400 and isn't in the generated types yet.
  const callRpc = supabase.rpc.bind(supabase) as unknown as (
    fn: string,
    args: Record<string, unknown>,
  ) => Promise<{ data: unknown; error: { code?: string; message: string; details?: string } | null }>;
  const { data, error } = await callRpc("admin_save_product", { p_product: product, p_variants: variants });
  let savedId = typeof data === "string" ? data : null;

  if (error) {
    // PGRST202: the database function isn't installed yet. Save step by step instead.
    if (error.code !== "PGRST202") return { ok: false, message: friendlyDbError(error), at: Date.now() };
    const fallback = await saveProductStepByStep(product, variants);
    if (!fallback.ok) return { ok: false, message: fallback.message, at: Date.now() };
    savedId = fallback.id;
  }

  updateTag(CATALOG_TAG);
  if (!product.id && savedId) redirect(`/admin/products/${savedId}?created=1`);
  // Re-render the edit page so new sizes get their ids and the slug warning clears.
  refresh();
  return { ok: true, message: `${product.name} saved.`, at: Date.now() };
}

async function saveProductStepByStep(product: CleanProduct, variants: CleanVariant[]): Promise<{ ok: true; id: string } | { ok: false; message: string }> {
  const supabase = await createClient();
  let id = product.id;
  const fields = {
    name: product.name,
    slug: product.slug,
    category_id: product.category_id,
    summary: product.summary,
    description: product.description,
    status: product.status,
    featured_rank: product.featured_rank,
  };

  if (id) {
    const { data: current } = await supabase.from("products").select("slug, legacy_slug").eq("id", id).maybeSingle();
    if (!current) return { ok: false, message: "This product no longer exists." };
    const legacy_slug = current.slug !== product.slug ? current.slug : current.legacy_slug;
    const { error } = await supabase.from("products").update({ ...fields, legacy_slug }).eq("id", id);
    if (error) return { ok: false, message: friendlyDbError(error) };
  } else {
    const { data: last } = await supabase.from("products").select("sort_order").order("sort_order", { ascending: false }).limit(1).maybeSingle();
    const { data, error } = await supabase
      .from("products")
      .insert({ ...fields, sort_order: (last?.sort_order ?? -1) + 1 })
      .select("id")
      .single();
    if (error) return { ok: false, message: friendlyDbError(error) };
    id = data.id;
  }

  const keep = variants.map((v) => v.id).filter((v): v is string => Boolean(v));
  let removal = supabase.from("product_variants").delete().eq("product_id", id);
  if (keep.length) removal = removal.not("id", "in", `(${keep.join(",")})`);
  const { error: removeError } = await removal;
  if (removeError) return { ok: false, message: friendlyDbError(removeError) };

  for (const v of variants) {
    const row = {
      label: v.label,
      sku: v.sku,
      price_cents: v.price_cents,
      compare_at_cents: v.compare_at_cents,
      in_stock: v.in_stock,
      stock_quantity: v.stock_quantity,
      active: v.active,
      sort_order: v.sort_order,
    };
    const { error } = v.id
      ? await supabase.from("product_variants").update(row).eq("id", v.id).eq("product_id", id)
      : await supabase.from("product_variants").insert({ ...row, product_id: id });
    if (error) return { ok: false, message: `${v.label}: ${friendlyDbError(error)}` };
  }
  return { ok: true, id };
}

// ---------------------------------------------------------------- COAs

export async function saveCoa(_prev: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  const text = (key: string) => String(form.get(key) ?? "").trim();
  const errors: Record<string, string> = {};

  const id = text("id");
  const productId = text("product_id");
  const variantId = text("variant_id");
  const lot = text("lot_number");
  const testedOn = text("tested_on");
  const purityRaw = text("purity_percent");
  const labName = text("lab_name");
  const filePath = text("file_path");
  const purity = purityRaw ? Number(purityRaw) : null;

  if (id && !UUID.test(id)) errors.form = "This certificate can't be found. Reload and try again.";
  if (!UUID.test(productId)) errors.product_id = "Pick the product this certificate is for.";
  if (variantId && !UUID.test(variantId)) errors.variant_id = "Pick a size from the list, or leave it on all sizes.";
  if (!lot) errors.lot_number = "Lot number is required.";
  else if (lot.length > 60) errors.lot_number = "Keep the lot number under 60 characters.";
  if (testedOn && !/^\d{4}-\d{2}-\d{2}$/.test(testedOn)) errors.tested_on = "Use the date picker.";
  if (purity !== null && (Number.isNaN(purity) || purity <= 0 || purity > 100)) errors.purity_percent = "Enter a percentage between 0 and 100, e.g. 99.4.";
  if (labName.length > 120) errors.lab_name = "Keep the lab name under 120 characters.";
  if (!id && !filePath) errors.file = "Attach the certificate PDF.";
  if (filePath && !/^[a-z0-9-]+\/[A-Za-z0-9._-]+\.pdf$/.test(filePath)) errors.file = "The upload didn't finish. Try attaching the PDF again.";
  if (Object.keys(errors).length) return { ok: false, message: errors.form ?? "Fix the highlighted fields and save again.", errors, at: Date.now() };

  const supabase = await createClient();
  // When a new PDF replaces an old one, remember the old file so it can be cleaned up.
  let replacedPath: string | null = null;
  if (id && filePath) {
    const { data: current } = await supabase.from("coas").select("file_path").eq("id", id).maybeSingle();
    if (current && current.file_path !== filePath) replacedPath = current.file_path;
  }
  const row = {
    product_id: productId,
    variant_id: variantId || null,
    lot_number: lot,
    tested_on: testedOn || null,
    purity_percent: purity,
    lab_name: labName || null,
    published: form.get("published") !== "off",
    ...(filePath ? { file_path: filePath } : {}),
  };
  const { error } = id ? await supabase.from("coas").update(row).eq("id", id) : await supabase.from("coas").insert({ ...row, file_path: filePath });
  if (error) return { ok: false, message: friendlyDbError(error), at: Date.now() };
  if (replacedPath) await supabase.storage.from("coas").remove([replacedPath]);

  updateTag(COAS_TAG);
  refresh();
  return { ok: true, message: id ? `Certificate for lot ${lot} updated.` : `Certificate for lot ${lot} added.`, at: Date.now() };
}

export async function setCoaPublished(id: string, published: boolean): Promise<ActionState> {
  await requireAdmin();
  if (!UUID.test(id)) return { ok: false, message: "Certificate not found." };
  const supabase = await createClient();
  const { error } = await supabase.from("coas").update({ published }).eq("id", id);
  if (error) return { ok: false, message: friendlyDbError(error), at: Date.now() };
  updateTag(COAS_TAG);
  refresh();
  return { ok: true, message: published ? "Certificate published." : "Certificate hidden from the site.", at: Date.now() };
}

export async function deleteCoa(id: string): Promise<ActionState> {
  await requireAdmin();
  if (!UUID.test(id)) return { ok: false, message: "Certificate not found." };
  const supabase = await createClient();
  const { data: coa, error: readError } = await supabase.from("coas").select("file_path, lot_number").eq("id", id).maybeSingle();
  if (readError || !coa) return { ok: false, message: readError ? friendlyDbError(readError) : "Certificate not found.", at: Date.now() };
  const { error } = await supabase.from("coas").delete().eq("id", id);
  if (error) return { ok: false, message: friendlyDbError(error), at: Date.now() };
  const { error: fileError } = await supabase.storage.from("coas").remove([coa.file_path]);

  updateTag(COAS_TAG);
  refresh();
  return {
    ok: true,
    message: fileError ? `Lot ${coa.lot_number} removed from the site, but the PDF file couldn't be deleted from storage.` : `Certificate for lot ${coa.lot_number} deleted.`,
    at: Date.now(),
  };
}

/** Removes a PDF that was uploaded for a certificate that then failed to save. */
export async function discardCoaUpload(path: string): Promise<void> {
  await requireAdmin();
  if (!/^[a-z0-9-]+\/[A-Za-z0-9._-]+\.pdf$/.test(path)) return;
  const supabase = await createClient();
  const { count } = await supabase.from("coas").select("id", { count: "exact", head: true }).eq("file_path", path);
  if (!count) await supabase.storage.from("coas").remove([path]);
}

// ---------------------------------------------------------------- orders

export async function updateOrder(_prev: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = String(form.get("id") ?? "");
  const status = String(form.get("status") ?? "") as OrderStatus;
  const provider = String(form.get("payment_provider") ?? "").trim();
  const reference = String(form.get("payment_reference") ?? "").trim();
  if (!UUID.test(id)) return { ok: false, message: "Order not found.", at: Date.now() };
  if (!ORDER_STATUSES.some((s) => s.value === status)) return { ok: false, message: "Pick a status from the list.", at: Date.now() };
  if (provider.length > 60 || reference.length > 200) return { ok: false, message: "Payment details are too long.", at: Date.now() };

  const supabase = await createClient();
  const { error } = await supabase
    .from("orders")
    .update({ status, payment_provider: provider || null, payment_reference: reference || null })
    .eq("id", id);
  if (error) return { ok: false, message: friendlyDbError(error), at: Date.now() };
  refresh();
  return { ok: true, message: `Order marked ${ORDER_STATUSES.find((s) => s.value === status)?.label.toLowerCase()}.`, at: Date.now() };
}

// ---------------------------------------------------------------- settings

export async function saveSettings(_prev: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  const errors: Record<string, string> = {};
  const threshold = parseDollars(String(form.get("free_shipping_threshold") ?? ""));
  const flat = parseDollars(String(form.get("flat_shipping") ?? ""));
  const whatsapp = String(form.get("support_whatsapp") ?? "").trim();
  const hours = String(form.get("support_hours") ?? "").trim();

  if (threshold === null || Number.isNaN(threshold)) errors.free_shipping_threshold = "Enter an amount like 125.";
  if (flat === null || Number.isNaN(flat)) errors.flat_shipping = "Enter an amount like 9.99, or 0 for free shipping on every order.";
  if (whatsapp && !/^\+?[\d\s()-]{7,20}$/.test(whatsapp)) errors.support_whatsapp = "Use a phone number like +1 559 360 6568.";
  if (hours.length > 80) errors.support_hours = "Keep this under 80 characters.";
  if (Object.keys(errors).length) return { ok: false, message: "Fix the highlighted fields and save again.", errors, at: Date.now() };

  const supabase = await createClient();
  const { error } = await supabase.from("settings").upsert(
    [
      { key: "free_shipping_threshold_cents", value: threshold },
      { key: "flat_shipping_cents", value: flat },
      { key: "support_whatsapp", value: whatsapp },
      { key: "support_hours", value: hours },
    ],
    { onConflict: "key" },
  );
  if (error) return { ok: false, message: friendlyDbError(error), at: Date.now() };
  updateTag(SETTINGS_TAG);
  refresh();
  return { ok: true, message: "Settings saved. The store updates right away.", at: Date.now() };
}
