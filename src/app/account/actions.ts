"use server";

import { refresh } from "next/cache";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export type ProfileState = { ok?: boolean; error?: string };

export async function updateName(_prev: ProfileState, formData: FormData): Promise<ProfileState> {
  const user = await requireUser("/account");
  const name = String(formData.get("full_name") ?? "").trim().slice(0, 120);
  if (!name) return { error: "Please enter your name." };
  const supabase = await createClient();
  const { error } = await supabase.from("profiles").update({ full_name: name }).eq("id", user.id);
  if (error) return { error: "Couldn't save your name. Please try again." };
  refresh();
  return { ok: true };
}
