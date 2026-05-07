import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { sendMediaRejectedEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const providerId = Number(formData.get("providerId"));
  const field = String(formData.get("field"));
  const reason = formData.get("reason") ? String(formData.get("reason")) : null;

  const { data: provider } = await supabase
    .from("providers")
    .select("email, full_name, pending_category_slug")
    .eq("id", providerId)
    .maybeSingle();

  const updates: Record<string, unknown> = {};
  const rejectedItems: string[] = [];

  if (field === "profile_photo") {
    updates.pending_profile_photo_url = null;
    rejectedItems.push("Profile photo");
  }
  if (field === "portfolio") {
    updates.pending_portfolio_photo_urls = null;
    rejectedItems.push("Portfolio photos");
  }
  if (field === "video") {
    updates.pending_video_url = null;
    rejectedItems.push("Intro video");
  }
  if (field === "category") {
    updates.pending_category_slug = null;
    updates.category_approved = false;
    rejectedItems.push(`Category: ${provider?.pending_category_slug ?? field}`);
  }

  await supabase.from("providers").update(updates).eq("id", providerId);

  if (provider?.email && rejectedItems.length > 0) {
    await sendMediaRejectedEmail({
      providerEmail: provider.email,
      providerName: provider.full_name,
      items: rejectedItems,
      reason,
    });
  }

  return NextResponse.redirect(new URL(`/admin/approvals/${providerId}`, req.url), 303);
}