"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { Field, FormError } from "@/components/forms/field";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { safeNext } from "@/lib/safe-next";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNext(params.get("next"));
  const [error, setError] = useState<string | null>(params.get("error"));
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setPending(true);
    setError(null);
    const { error } = await createClient().auth.signInWithPassword({
      email: String(form.get("email")).trim(),
      password: String(form.get("password")),
    });
    if (error) {
      setPending(false);
      setError(error.message === "Email not confirmed" ? "Please confirm your email first. Check your inbox for the link." : "Email or password is incorrect.");
      return;
    }
    router.replace(next);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <FormError>{error}</FormError>
      <Field label="Email" name="email" type="email" autoComplete="email" required />
      <Field label="Password" name="password" type="password" autoComplete="current-password" required minLength={6} />
      <div className="flex justify-end">
        <Link href="/forgot-password" className="text-xs text-muted hover:text-violet-300">
          Forgot password?
        </Link>
      </div>
      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? "Signing in…" : "Sign in"} {!pending && <ArrowRight />}
      </Button>
    </form>
  );
}
