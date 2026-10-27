"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { ArrowRight, MailCheck } from "lucide-react";
import { CheckField, Field, FormError } from "@/components/forms/field";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { safeNext } from "@/lib/safe-next";

export function RegisterForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNext(params.get("next"));
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email")).trim();
    const password = String(form.get("password"));
    if (password !== String(form.get("confirm"))) return setError("Passwords don't match.");
    setPending(true);
    setError(null);
    const { data, error } = await createClient().auth.signUp({
      email,
      password,
      options: {
        data: { full_name: String(form.get("name")).trim() },
        emailRedirectTo: `${window.location.origin}/auth/confirm?next=${encodeURIComponent(next)}`,
      },
    });
    setPending(false);
    if (error) return setError(error.message);
    if (data.session) {
      router.replace(next);
      router.refresh();
      return;
    }
    setSentTo(email);
  }

  if (sentTo) {
    return (
      <div className="rounded-2xl border border-violet-400/30 bg-violet-500/[0.07] p-5 text-sm leading-relaxed">
        <MailCheck className="size-5 text-violet-300" />
        <p className="mt-3 font-medium">Check your inbox</p>
        <p className="mt-1 text-ink-200">
          We sent a confirmation link to <span className="font-medium text-foreground">{sentTo}</span>. Open it to finish creating your account.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <FormError>{error}</FormError>
      <Field label="Full name" name="name" autoComplete="name" required />
      <Field label="Email" name="email" type="email" autoComplete="email" required />
      <Field label="Password" name="password" type="password" autoComplete="new-password" required minLength={8} hint="At least 8 characters." />
      <Field label="Confirm password" name="confirm" type="password" autoComplete="new-password" required minLength={8} />
      <CheckField name="eligible" required>
        I am 21 or older and a qualified researcher. I understand all products are for laboratory research use only.
      </CheckField>
      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? "Creating account…" : "Create account"} {!pending && <ArrowRight />}
      </Button>
    </form>
  );
}
