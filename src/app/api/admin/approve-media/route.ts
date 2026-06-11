import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient, createSupabaseServiceClient } from "@/lib/supabase/server";
import { sendMediaApprovedEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const providerId = Number(formData.get("providerId"));
  const field = String(formData.get("field"));

  const { data: provider } = await supabase
    .from("providers")
    .select("email, full_name, pending_profile_photo_url, pending_portfolio_photo_urls, pending_video_url, pending_category_slug")
    .eq("id", providerId)
    .maybeSingle();

  if (!provider) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updates: Record<string, unknown> = {};
  const approvedItems: string[] = [];

  if (field === "profile_photo" && provider.pending_profile_photo_url) {
    updates.profile_photo_url = provider.pending_profile_photo_url;
    updates.pending_profile_photo_url = null;
    approvedItems.push("Profile photo");
  }

  if (field === "portfolio" && provider.pending_portfolio_photo_urls) {
    updates.portfolio_photo_urls = provider.pending_portfolio_photo_urls;
    updates.pending_portfolio_photo_urls = null;
    approvedItems.push("Portfolio photos");
  }

  if (field === "video" && provider.pending_video_url) {
    updates.video_url = provider.pending_video_url;
    updates.pending_video_url = null;
    approvedItems.push("Intro video");
  }

  console.log("APPROVE MEDIA FIELD:", field, "PENDING CATEGORY:", provider.pending_category_slug);
  if (field === "category" && provider.pending_category_slug) {
    updates.category_slug = provider.pending_category_slug;
    updates.pending_category_slug = null;
    updates.category_approved = true;
    approvedItems.push(`Category: ${provider.pending_category_slug}`);

    // Auto-insert into categories table if not already there
    const slug = provider.pending_category_slug;
    const name = slug.split("-").map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
    const service = createSupabaseServiceClient();
    const { data: existing } = await service.from("categories").select("id").eq("slug", slug).maybeSingle();
    if (!existing) {
      await service.from("categories").insert({ slug, name });
    }
  }

  await supabase.from("providers").update(updates).eq("id", providerId);

  if (provider.email && approvedItems.length > 0) {
    await sendMediaApprovedEmail({
      providerEmail: provider.email,
      providerName: provider.full_name,
      items: approvedItems,
    });
  }

  return NextResponse.redirect(new URL(`/admin/approvals/${providerId}`, req.url), 303);
}