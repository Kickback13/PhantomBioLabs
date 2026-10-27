import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Plus } from "lucide-react";
import { AdminPage, AdminSkeleton } from "@/components/admin/admin-page";
import { ProductsTable } from "@/components/admin/products-table";
import { Button } from "@/components/ui/button";
import { getAdminCategories, getAdminProducts } from "@/lib/admin";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = { title: "Products" };

export default function AdminProductsPage() {
  return (
    <AdminPage
      title="Products"
      description="Every product, including hidden ones. Click a product to edit its details, sizes, prices and stock."
      actions={
        <Button asChild>
          <Link href="/admin/products/new">
            <Plus /> New product
          </Link>
        </Button>
      }
    >
      <Suspense fallback={<AdminSkeleton rows={8} />}>
        <Products />
      </Suspense>
    </AdminPage>
  );
}

async function Products() {
  await requireAdmin();
  const [products, categories] = await Promise.all([getAdminProducts(), getAdminCategories()]);
  return <ProductsTable products={products} categories={categories} />;
}
