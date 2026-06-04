import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient, createSupabaseServiceClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { bucket, path } = await req.json();
  if (!bucket || !path) return NextResponse.json({ error: "Missing params" }, { status: 400 });

  // Only allow uploads to user's own folder
  if (!path.startsWith(user.id + "/")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const service = createSupabaseServiceClient();
  const { data, error } = await service.storage
    .from(bucket)
    .createSignedUploadUrl(path);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const publicUrl = service.storage.from(bucket).getPublicUrl(path).data.publicUrl;

  return NextResponse.json({ signedUrl: data.signedUrl, token: data.token, publicUrl });
}