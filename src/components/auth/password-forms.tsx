"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { MailCheck } from "lucide-react";
import { Field, FormError } from "@/components/forms/field";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export function ForgotPasswordForm() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    const email = String(new FormData(event.currentTarget).get("email")).trim();
    const { error } = await createClient().auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/confirm?next=/account/reset-password`,
    });
    setPending(false);
    if (error) return setError("We couldn't send the email. Please try again in a few minutes.");
    setSent(true);
  }

  if (sent) {
    return (
      <div className="rounded-2xl border border-violet-400/30 bg-violet-500/[0.07] p-5 text-sm">
        <MailCheck className="size-5 text-violet-300" />
        <p className="mt-3 text-ink-200">If an account exists for that email, a reset link is on its way.</p>
      </div>
    );
  }
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <FormError>{error}</FormError>
      <Field label="Email" name="email" type="email" autoComplete="email" required />
      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? "Sending…" : "Send reset link"}
      </Button>
    </form>
  );
}

export function NewPasswordForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password"));
    if (password !== String(form.get("confirm"))) return setError("Passwords don't match.");
    setPending(true);
    const { error } = await createClient().auth.updateUser({ password });
    setPending(false);
    if (error) return setError(error.message);
    router.replace("/account");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <FormError>{error}</FormError>
      <Field label="New password" name="password" type="password" autoComplete="new-password" required minLength={8} hint="At least 8 characters." />
      <Field label="Confirm new password" name="confirm" type="password" autoComplete="new-password" required minLength={8} />
      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? "Saving…" : "Save password"}
      </Button>
    </form>
  );
}
