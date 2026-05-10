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

const res = NextResponse.redirect(new URL(
    profile?.role === "admin" ? "/admin" :
    profile?.role ? "/" :
    "/auth/setup-role",
    url.origin
  ));

  if (profile?.role) {
    res.cookies.set("user-role", profile.role, { path: "/", httpOnly: false, maxAge: 60 * 60 * 24 * 30 });
  }

  return res;
}