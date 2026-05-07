import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const providerId = Number(formData.get("providerId"));
  const field = String(formData.get("field"));

  const updates: Record<string, unknown> = {};

  if (field === "profile_photo") updates.pending_profile_photo_url = null;
  if (field === "portfolio") updates.pending_portfolio_photo_urls = null;
  if (field === "video") updates.pending_video_url = null;
  if (field === "category") {
    updates.pending_category_slug = null;
    updates.category_approved = false;
  }

  await supabase.from("providers").update(updates).eq("id", providerId);

  return NextResponse.redirect(new URL(`/admin/approvals/${providerId}`, req.url), 303);
}