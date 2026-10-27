"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import { LogOut } from "lucide-react";
import { toast } from "sonner";
import { updateName, type ProfileState } from "@/app/account/actions";
import { inputClass } from "@/components/forms/field";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const links = [
  { href: "/account", label: "Overview" },
  { href: "/account/orders", label: "Orders" },
  { href: "/account/wishlist", label: "Wishlist" },
];

export function AccountNav() {
  const path = usePathname();
  return (
    <nav aria-label="Account" className="flex gap-1 overflow-x-auto">
      {links.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          aria-current={path === l.href ? "page" : undefined}
          className={cn(
            "shrink-0 rounded-lg px-3.5 py-2 text-sm transition-colors",
            path === l.href ? "bg-violet-500/15 text-foreground" : "text-muted hover:bg-white/5 hover:text-foreground",
          )}
        >
          {l.label}
        </Link>
      ))}
    </nav>
  );
}

export function SignOutButton() {
  const router = useRouter();
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={async () => {
        await createClient().auth.signOut();
        router.replace("/");
        router.refresh();
      }}
    >
      <LogOut /> Sign out
    </Button>
  );
}

export function NameForm({ name }: { name: string }) {
  const [state, action, pending] = useActionState<ProfileState, FormData>(updateName, {});
  useEffect(() => {
    if (state.ok) toast.success("Name saved");
  }, [state]);
  return (
    <form action={action} className="flex flex-col gap-3 sm:flex-row">
      <label className="sr-only" htmlFor="full_name">
        Full name
      </label>
      <input id="full_name" name="full_name" defaultValue={name} required maxLength={120} className={inputClass} />
      <Button type="submit" size="lg" variant="outline" disabled={pending} className="sm:w-32">
        {pending ? "Saving…" : "Save"}
      </Button>
      {state.error && <p className="text-sm text-danger sm:hidden">{state.error}</p>}
    </form>
  );
}
