import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const providerId = Number(formData.get("providerId"));
  const photoUrl = String(formData.get("photoUrl"));

  const { data: provider } = await supabase
    .from("providers")
    .select("pending_portfolio_photo_urls")
    .eq("id", providerId)
    .maybeSingle();

  const updated = (provider?.pending_portfolio_photo_urls ?? []).filter(
    (url: string) => url !== photoUrl
  );

  await supabase
    .from("providers")
    .update({ pending_portfolio_photo_urls: updated })
    .eq("id", providerId);

  return NextResponse.redirect(new URL(`/admin/approvals/${providerId}`, req.url), 303);
}