import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/";

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.redirect(new URL("/", url.origin));
  }

  if (code) {
    await supabase.auth.exchangeCodeForSession(code);
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(new URL("/", url.origin));
  }

  // Check if profile exists
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  // Returning provider → go to their dashboard
  if (profile?.role === "provider") {
    return NextResponse.redirect(new URL("/provider/dashboard", url.origin));
  }

  // Returning client → go to their dashboard
  if (profile?.role === "client") {
    return NextResponse.redirect(new URL("/dashboard", url.origin));
  }

  // New user → use the next param to determine role and create profile
  const isProvider = next.includes("/provider");

  await supabase.from("profiles").upsert(
    {
      id: user.id,
      full_name: user.user_metadata?.full_name ?? user.email,
      role: isProvider ? "provider" : "client",
    },
    { onConflict: "id" }
  );

  return NextResponse.redirect(new URL(next, url.origin));
}