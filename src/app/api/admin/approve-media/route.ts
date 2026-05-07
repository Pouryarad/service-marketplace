import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const providerId = Number(formData.get("providerId"));
  const field = String(formData.get("field"));

  const { data: provider } = await supabase
    .from("providers")
    .select("pending_profile_photo_url, pending_portfolio_photo_urls, pending_video_url, pending_category_slug")
    .eq("id", providerId)
    .maybeSingle();

  if (!provider) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updates: Record<string, unknown> = {};

  if (field === "profile_photo" && provider.pending_profile_photo_url) {
    updates.profile_photo_url = provider.pending_profile_photo_url;
    updates.pending_profile_photo_url = null;
  }

  if (field === "portfolio" && provider.pending_portfolio_photo_urls) {
    updates.portfolio_photo_urls = provider.pending_portfolio_photo_urls;
    updates.pending_portfolio_photo_urls = null;
  }

  if (field === "video" && provider.pending_video_url) {
    updates.video_url = provider.pending_video_url;
    updates.pending_video_url = null;
  }

  if (field === "category" && provider.pending_category_slug) {
    updates.category_slug = provider.pending_category_slug;
    updates.pending_category_slug = null;
    updates.category_approved = true;
  }

  await supabase.from("providers").update(updates).eq("id", providerId);

  return NextResponse.redirect(new URL(`/admin/approvals/${providerId}`, req.url), 303);
}