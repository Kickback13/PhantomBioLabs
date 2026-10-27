import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminPage, AdminSkeleton, BackLink } from "@/components/admin/admin-page";
import { ProductForm } from "@/components/admin/product-form";
import { getAdminCategories } from "@/lib/admin";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = { title: "New product" };

export default function NewProductPage() {
  return (
    <AdminPage
      title="New product"
      description="New products start hidden. Switch them to visible when the details, sizes and prices are ready."
      backLink={<BackLink href="/admin/products">All products</BackLink>}
    >
      <Suspense fallback={<AdminSkeleton rows={5} />}>
        <NewProduct />
      </Suspense>
    </AdminPage>
  );
}

async function NewProduct() {
  await requireAdmin();
  const categories = await getAdminCategories();
  return <ProductForm product={null} categories={categories} />;
}
