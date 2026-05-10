import { createSupabaseServerClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const providerId = request.nextUrl.searchParams.get("id");
  if (!providerId) return NextResponse.redirect(new URL("/admin/users", request.url));

  const supabase = await createSupabaseServerClient();
  if (!supabase) return NextResponse.redirect(new URL("/admin", request.url));

  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user?.id ?? "").single();
  if (profile?.role !== "admin") return NextResponse.redirect(new URL("/admin", request.url));

  const response = NextResponse.redirect(new URL("/provider/dashboard", request.url));
  response.cookies.set("impersonating_provider_id", providerId, { path: "/", httpOnly: true, maxAge: 60 * 60 });
  return response;
}