import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminPage, AdminSkeleton } from "@/components/admin/admin-page";
import { SettingsForm } from "@/components/admin/settings-form";
import { getAdminSettings } from "@/lib/admin";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = { title: "Settings" };

export default function AdminSettingsPage() {
  return (
    <AdminPage title="Settings" description="Shipping prices and the support contact shown to customers.">
      <Suspense fallback={<AdminSkeleton rows={4} />}>
        <Settings />
      </Suspense>
    </AdminPage>
  );
}

async function Settings() {
  await requireAdmin();
  const settings = await getAdminSettings();
  return <SettingsForm settings={settings} />;
}
