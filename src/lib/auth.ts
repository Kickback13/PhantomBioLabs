import "server-only";
import { notFound, redirect } from "next/navigation";
import { createClient } from "./supabase/server";

/** The signed-in user, verified with Supabase Auth, or null. Request-time only (use inside Suspense). */
export async function getUser() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  return data.user ?? null;
}

export async function getProfile() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return null;
  const { data } = await supabase.from("profiles").select("id, email, full_name, is_admin").eq("id", auth.user.id).maybeSingle();
  return data ? { ...data, user: auth.user } : null;
}

/** Sends signed-out visitors to /login and back afterwards. */
export async function requireUser(next: string) {
  const user = await getUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(next)}`);
  return user;
}

/** Admin pages and actions call this first. Non-admins get a 404 so the area isn't advertised. */
export async function requireAdmin() {
  const profile = await getProfile();
  if (!profile) redirect("/login?next=/admin");
  if (!profile.is_admin) notFound();
  return profile;
}
