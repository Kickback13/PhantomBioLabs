import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { safeNext } from "@/lib/safe-next";
import { createClient } from "@/lib/supabase/server";

// Landing point for links in Supabase emails (sign-up confirmation and password reset).
// Handles both the token-hash format and the PKCE code format.
export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const next = safeNext(url.searchParams.get("next"));
  const supabase = await createClient();

  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as EmailOtpType | null;

  const { error } = code
    ? await supabase.auth.exchangeCodeForSession(code)
    : tokenHash && type
      ? await supabase.auth.verifyOtp({ type, token_hash: tokenHash })
      : { error: new Error("Missing token") };

  if (error) {
    const login = new URL("/login", request.url);
    login.searchParams.set("error", "That link has expired or was already used. Please sign in or request a new one.");
    return NextResponse.redirect(login);
  }
  return NextResponse.redirect(new URL(next, request.url));
}
