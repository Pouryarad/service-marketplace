import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient, createSupabaseServiceClient } from "@/lib/supabase/server";

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

  
  const service = createSupabaseServiceClient();
  const { data: profile } = await service
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  const nextParam = url.searchParams.get("next") ?? request.cookies.get("auth_next")?.value ?? null;

const redirectTo =
  profile?.role === "admin" ? "/admin" :
  !profile?.role ? `/auth/setup-role${nextParam ? `?next=${encodeURIComponent(nextParam)}` : ""}` :
  profile?.role === "provider" ? "/provider/dashboard" :
  nextParam ? nextParam : "/dashboard";

const res = NextResponse.redirect(new URL(redirectTo, url.origin));

  if (profile?.role) {
    res.cookies.set("user-role", profile.role, { path: "/", httpOnly: false, maxAge: 60 * 60 * 24 * 30 });
  }

  // Handle referral
  const refCode = request.cookies.get("ref_code")?.value;
  if (refCode && !profile?.role) {
    const { data: referrer } = await supabase
      .from("providers")
      .select("id")
      .eq("referral_code", refCode)
      .maybeSingle();

    if (referrer) {
      await supabase.from("referrals").insert({
        referrer_id: referrer.id,
        referred_user_id: user.id,
        status: "pending",
      });
    }
    res.cookies.delete("ref_code");
  }

  return res;
}