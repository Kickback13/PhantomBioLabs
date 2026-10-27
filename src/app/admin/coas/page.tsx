import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminPage, AdminSkeleton } from "@/components/admin/admin-page";
import { CoaManager, type CoaProductOption } from "@/components/admin/coa-manager";
import { getAdminCoas, getAdminProducts } from "@/lib/admin";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = { title: "COAs" };

export default function AdminCoasPage() {
  return (
    <AdminPage
      title="Certificates of analysis"
      description="Upload a PDF for each product or batch. Published COAs show on the product page and the COA library."
    >
      <Suspense fallback={<AdminSkeleton rows={6} />}>
        <Coas />
      </Suspense>
    </AdminPage>
  );
}

async function Coas() {
  await requireAdmin();
  const [coas, products] = await Promise.all([getAdminCoas(), getAdminProducts()]);
  const options: CoaProductOption[] = products.map((p) => ({
    id: p.id,
    name: p.status === "hidden" ? `${p.name} (hidden)` : p.name,
    slug: p.slug,
    variants: p.variants.map((v) => ({ id: v.id, label: v.label })),
  }));
  return <CoaManager coas={coas} products={options} />;
}
