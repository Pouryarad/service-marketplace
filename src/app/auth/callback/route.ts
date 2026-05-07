import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  const supabase = await createSupabaseServerClient();
  if (!supabase) return NextResponse.redirect(new URL("/", url.origin));

  if (code) {
    await supabase.auth.exchangeCodeForSession(code);
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL("/", url.origin));

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role === "admin") {
    return NextResponse.redirect(new URL("/admin", url.origin));
  }

  if (profile?.role === "provider") {
    return NextResponse.redirect(new URL("/provider/dashboard", url.origin));
  }

  if (profile?.role === "client") {
    return NextResponse.redirect(new URL("/", url.origin));
  }

  // New user — let client side handle role assignment
  return NextResponse.redirect(new URL("/auth/setup-role", url.origin));
}