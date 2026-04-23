import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const url = new URL(request.url);
  const provider = url.searchParams.get("provider") === "apple" ? "apple" : "google";
  const next = url.searchParams.get("next") ?? "/onboarding";

  if (!supabase) {
    return NextResponse.redirect(new URL("/auth/sign-in?notice=configure-supabase", url.origin));
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${url.origin}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });

  if (error || !data.url) {
    return NextResponse.redirect(new URL("/auth/sign-in", url.origin));
  }

  return NextResponse.redirect(data.url);
}
