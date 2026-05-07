import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const id = Number(formData.get("id"));
  const name = String(formData.get("name") ?? "").trim();
  const imageUrl = String(formData.get("imageUrl") ?? "").trim();
  const imageFile = formData.get("imageFile") as File | null;

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  let finalImageUrl = imageUrl || undefined;

  if (imageFile && imageFile.size > 0) {
    const ext = imageFile.name.split(".").pop();
    const path = `categories/${slug}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage
      .from("provider-media")
      .upload(path, imageFile, { upsert: true });

    if (!error) {
      const { data } = supabase.storage.from("provider-media").getPublicUrl(path);
      finalImageUrl = data.publicUrl;
    }
  }

  const updates: Record<string, unknown> = { name, slug };
  if (finalImageUrl) updates.image_url = finalImageUrl;

  await supabase.from("categories").update(updates).eq("id", id);

  return NextResponse.json({ success: true });
}