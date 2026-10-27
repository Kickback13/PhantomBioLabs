import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = { title: "Create an account", robots: { index: false } };

export default function RegisterPage() {
  return (
    <AuthShell
      eyebrow="Account"
      title="Create your account"
      description="Track orders, save compounds to your wishlist and check out faster. You can also check out as a guest."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="text-violet-300 hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <Suspense>
        <RegisterForm />
      </Suspense>
    </AuthShell>
  );
}
