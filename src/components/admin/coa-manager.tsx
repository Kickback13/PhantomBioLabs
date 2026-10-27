"use client";

import { useActionState, useCallback, useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { ExternalLink, FileCheck2, Pencil, Trash2 } from "lucide-react";
import { deleteCoa, discardCoaUpload, saveCoa, setCoaPublished } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { FileDropzone } from "@/components/ui/file-dropzone";
import { Switch } from "@/components/ui/switch";
import type { AdminCoa } from "@/lib/admin";
import { createClient } from "@/lib/supabase/client";
import { Card, Field, Input, Select } from "./fields";
import { Pill } from "./status-badge";
import { initialActionState, useActionToast } from "./use-action-toast";

export type CoaProductOption = { id: string; name: string; slug: string; variants: { id: string; label: string }[] };

const formatDate = (iso: string | null) =>
  iso ? new Date(`${iso}T00:00:00`).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "—";

export function CoaManager({ coas, products }: { coas: AdminCoa[]; products: CoaProductOption[] }) {
  const [editing, setEditing] = useState<AdminCoa | null>(null);
  const [deleting, setDeleting] = useState<AdminCoa | null>(null);
  const [formVersion, setFormVersion] = useState(0);
  const [busy, startTransition] = useTransition();
  // A fresh form after every save: remounting resets every field.
  const onSaved = useCallback(() => {
    setEditing(null);
    setFormVersion((v) => v + 1);
  }, []);

  return (
    <div className="space-y-6">
      <Card
        title={editing ? `Edit certificate · lot ${editing.lotNumber}` : "Add a certificate"}
        description={editing ? "Change the details, or attach a new PDF to replace the old one." : "Upload the lab's PDF and fill in the lot details. Published certificates appear on the product page and in the COA library."}
        action={
          editing ? (
            <Button type="button" variant="ghost" size="sm" onClick={() => setEditing(null)}>
              Cancel edit
            </Button>
          ) : null
        }
      >
        <CoaForm key={`${editing?.id ?? "new"}-${formVersion}`} coa={editing} products={products} onSaved={onSaved} />
      </Card>

      <Card title={`Certificates (${coas.length})`} description="Newest first.">
        {coas.length === 0 ? (
          <div className="flex flex-col items-center py-10 text-center">
            <span className="grid size-12 place-items-center rounded-2xl border border-line bg-ink-950 text-violet-300">
              <FileCheck2 className="size-5" />
            </span>
            <p className="mt-4 font-medium">No certificates yet</p>
            <p className="mt-1 text-sm text-muted">Upload the first one above.</p>
          </div>
        ) : (
          <ul className="divide-y divide-line">
            {coas.map((coa) => (
              <li key={coa.id} className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 md:flex-row md:items-center">
                <div className="min-w-0 flex-1">
                  <p className="font-medium">
                    {coa.productName}
                    {coa.variantLabel && <span className="ml-2 font-mono text-xs text-muted">{coa.variantLabel}</span>}
                  </p>
                  <p className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted">
                    <span className="font-mono text-foreground">Lot {coa.lotNumber}</span>
                    <span>Tested {formatDate(coa.testedOn)}</span>
                    {coa.purityPercent !== null && <span>{coa.purityPercent}% purity</span>}
                    {coa.labName && <span>{coa.labName}</span>}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Switch
                    checked={coa.published}
                    disabled={busy}
                    label={coa.published ? "Published" : "Hidden"}
                    onCheckedChange={(published) =>
                      startTransition(async () => {
                        const result = await setCoaPublished(coa.id, published);
                        if (result.ok) toast.success(result.message);
                        else toast.error(result.message);
                      })
                    }
                  />
                  <Button asChild variant="ghost" size="sm">
                    <a href={coa.fileUrl} target="_blank" rel="noreferrer">
                      PDF <ExternalLink />
                    </a>
                  </Button>
                  <Button type="button" variant="ghost" size="sm" onClick={() => setEditing(coa)}>
                    <Pencil /> Edit
                  </Button>
                  <Button type="button" variant="ghost" size="sm" onClick={() => setDeleting(coa)} className="text-subtle hover:text-danger">
                    <Trash2 /> Delete
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={`Delete the certificate for lot ${deleting?.lotNumber ?? ""}?`}
        description="It's removed from the store and the PDF is deleted. This can't be undone."
        pending={busy}
        onConfirm={() =>
          deleting &&
          startTransition(async () => {
            const result = await deleteCoa(deleting.id);
            if (result.ok) toast.success(result.message);
            else toast.error(result.message);
            if (editing?.id === deleting.id) setEditing(null);
            setDeleting(null);
          })
        }
      />
    </div>
  );
}

function CoaForm({ coa, products, onSaved }: { coa: AdminCoa | null; products: CoaProductOption[]; onSaved: () => void }) {
  const [state, dispatch, saving] = useActionState(saveCoa, initialActionState);
  const [uploading, setUploading] = useState(false);
  const [productId, setProductId] = useState(coa?.productId ?? "");
  const [variantId, setVariantId] = useState(coa?.variantId ?? "");
  const [lot, setLot] = useState(coa?.lotNumber ?? "");
  const [testedOn, setTestedOn] = useState(coa?.testedOn ?? "");
  const [purity, setPurity] = useState(coa?.purityPercent?.toString() ?? "");
  const [lab, setLab] = useState(coa?.labName ?? "");
  const [published, setPublished] = useState(coa?.published ?? true);
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const uploadedPath = useRef<string | null>(null);
  const [, startTransition] = useTransition();
  useActionToast(state);

  const product = products.find((p) => p.id === productId);
  const errors = state.errors ?? {};

  // After each save: tidy up a failed upload, or hand back to the manager on success.
  useEffect(() => {
    if (!state.at) return;
    const path = uploadedPath.current;
    uploadedPath.current = null;
    if (!state.ok && path) void discardCoaUpload(path);
    if (state.ok) onSaved();
  }, [state, onSaved]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFileError(null);
    const form = new FormData(event.currentTarget);
    if (!coa && !file) {
      setFileError("Attach the certificate PDF.");
      return;
    }
    if (file) {
      if (!product) return;
      setUploading(true);
      const safeLot = (lot.trim() || "lot").replace(/[^A-Za-z0-9._-]+/g, "-").slice(0, 40);
      const path = `${product.slug}/${safeLot}-${Date.now()}.pdf`;
      const { error } = await createClient().storage.from("coas").upload(path, file, { contentType: "application/pdf", upsert: false });
      setUploading(false);
      if (error) {
        setFileError(`Upload failed: ${error.message}`);
        return;
      }
      uploadedPath.current = path;
      form.set("file_path", path);
    }
    startTransition(() => dispatch(form));
  }

  const busy = uploading || saving;

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <input type="hidden" name="id" value={coa?.id ?? ""} />
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        <Field label="Product" htmlFor="coa-product" error={errors.product_id}>
          <Select
            id="coa-product"
            name="product_id"
            required
            value={productId}
            onChange={(e) => {
              setProductId(e.target.value);
              setVariantId("");
            }}
          >
            <option value="">Choose a product</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Size" htmlFor="coa-size" error={errors.variant_id} hint="Leave on all sizes if one lot covers every size.">
          <Select id="coa-size" name="variant_id" value={variantId} onChange={(e) => setVariantId(e.target.value)} disabled={!product}>
            <option value="">All sizes</option>
            {product?.variants.map((v) => (
              <option key={v.id} value={v.id}>
                {v.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Lot number" htmlFor="coa-lot" error={errors.lot_number}>
          <Input id="coa-lot" name="lot_number" required maxLength={60} value={lot} onChange={(e) => setLot(e.target.value)} placeholder="e.g. PBL-2410-07" className="font-mono" />
        </Field>
        <Field label="Test date" htmlFor="coa-date" error={errors.tested_on}>
          <Input id="coa-date" name="tested_on" type="date" value={testedOn} onChange={(e) => setTestedOn(e.target.value)} />
        </Field>
        <Field label="Purity (%)" htmlFor="coa-purity" error={errors.purity_percent}>
          <Input id="coa-purity" name="purity_percent" inputMode="decimal" value={purity} onChange={(e) => setPurity(e.target.value)} placeholder="e.g. 99.4" />
        </Field>
        <Field label="Testing lab" htmlFor="coa-lab" error={errors.lab_name} hint="Optional. Shown on the certificate listing.">
          <Input id="coa-lab" name="lab_name" maxLength={120} value={lab} onChange={(e) => setLab(e.target.value)} />
        </Field>
      </div>

      <div className="grid gap-5 md:grid-cols-[1fr_auto] md:items-end">
        <Field label={coa ? "Replace PDF (optional)" : "Certificate PDF"} error={fileError ?? errors.file}>
          <FileDropzone file={file} onFileChange={setFile} disabled={busy} />
        </Field>
        <div className="flex flex-col gap-4 md:items-end">
          <Switch name="published" checked={published} onCheckedChange={setPublished} label={published ? "Publish on the store" : "Keep hidden"} />
          {coa && (
            <p className="text-xs text-muted">
              Current file:{" "}
              <a href={coa.fileUrl} target="_blank" rel="noreferrer" className="text-violet-300 hover:text-violet-200">
                open PDF
              </a>
            </p>
          )}
          <Button type="submit" disabled={busy} className="w-full md:w-auto">
            {uploading ? "Uploading PDF…" : saving ? "Saving…" : coa ? "Save certificate" : "Add certificate"}
          </Button>
        </div>
      </div>
      {coa && !coa.published && <Pill tone="off">Hidden from the store</Pill>}
    </form>
  );
}
