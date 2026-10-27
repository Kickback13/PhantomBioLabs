import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";
import { supabaseEnv } from "./env";

/**
 * Cookie-free client for public catalog reads. Safe to call inside "use cache" functions,
 * because it never touches the request. Only sees what row-level security allows anonymously.
 */
export function createPublicClient() {
  const { url, key } = supabaseEnv();
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}
