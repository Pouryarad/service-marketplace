import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient, createSupabaseServiceClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const service = createSupabaseServiceClient();
  const formData = await req.formData();
  const id = Number(formData.get("id"));
  const name = String(formData.get("name") ?? "").trim();
  const imageUrl = String(formData.get("imageUrl") ?? "").trim();
  const rawRelated = String(formData.get("relatedSlugs") ?? "[]");
  console.log("relatedSlugs raw:", rawRelated);
  const relatedSlugs = JSON.parse(rawRelated);
  console.log("relatedSlugs parsed:", relatedSlugs);
  const imageFile = formData.get("imageFile") as File | null;

  let finalImageUrl = imageUrl;

  if (imageFile && imageFile.size > 0) {
    const ext = imageFile.name.split(".").pop();
    const path = `categories/${id}-${Date.now()}.${ext}`;
    const buffer = await imageFile.arrayBuffer();
    const { error: uploadError } = await service.storage
      .from("provider-photos")
      .upload(path, buffer, { contentType: imageFile.type, upsert: true });

    if (!uploadError) {
      const { data: urlData } = service.storage.from("provider-photos").getPublicUrl(path);
      finalImageUrl = urlData.publicUrl;
    }
  }

  const { error } = await service.from("categories").update({
    name,
    image_url: finalImageUrl || null,
    related_slugs: relatedSlugs,
  }).eq("id", id);
    if (error) console.error("Update error:", error);


   return NextResponse.json({ ok: true });

}