import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AdminPage, AdminSkeleton, BackLink } from "@/components/admin/admin-page";
import { ProductForm } from "@/components/admin/product-form";
import { getAdminCategories, getAdminProduct } from "@/lib/admin";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = { title: "Edit product" };

const back = <BackLink href="/admin/products">All products</BackLink>;

export default function EditProductPage(props: PageProps<"/admin/products/[id]">) {
  return (
    <Suspense
      fallback={
        <AdminPage title="Edit product" backLink={back}>
          <AdminSkeleton rows={5} />
        </AdminPage>
      }
    >
      <EditProduct params={props.params} searchParams={props.searchParams} />
    </Suspense>
  );
}

async function EditProduct({ params, searchParams }: Pick<PageProps<"/admin/products/[id]">, "params" | "searchParams">) {
  await requireAdmin();
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const [product, categories] = await Promise.all([getAdminProduct(id), getAdminCategories()]);
  if (!product) notFound();
  return (
    <AdminPage title={product.name} description={product.summary ?? undefined} backLink={back}>
      <ProductForm product={product} categories={categories} justCreated={query.created === "1"} />
    </AdminPage>
  );
}
