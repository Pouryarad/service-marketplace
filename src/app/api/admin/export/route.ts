import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user?.id ?? "").single();
  if (profile?.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const type = request.nextUrl.searchParams.get("type") ?? "providers";
  const service = createSupabaseServiceClient();

  let rows: Record<string, any>[] = [];
  let filename = "";

  if (type === "providers") {
    const { data, error } = await service.from("providers").select("full_name, email, phone, location, language, category_slug, subscription_status, approved, suspended").order("full_name", { ascending: true });
    rows = (data ?? []).map((p) => ({
      Name: p.full_name,
      Email: p.email,
      Phone: p.phone,
      Location: p.location,
      Language: p.language,
      Category: p.category_slug,
      Subscription: p.subscription_status,
      Approved: p.approved ? "Yes" : "No",
      Suspended: p.suspended ? "Yes" : "No",
    }));
    filename = "providers.csv";
  } else {
    const { data, error: clientError } = await service.from("profiles").select("id, full_name, phone, city, created_at").eq("role", "client").order("created_at", { ascending: false });

const ids = (data ?? []).map((c) => c.id);
const { data: { users } } = await service.auth.admin.listUsers({ perPage: 1000 });

const emailMap: Record<string, string> = {};
users.forEach((u) => { emailMap[u.id] = u.email ?? ""; });

rows = (data ?? []).map((c) => ({
  Name: c.full_name ?? "",
  Email: emailMap[c.id] ?? "",
  Phone: c.phone ?? "",
  City: c.city ?? "",
  Joined: c.created_at ? new Date(c.created_at).toLocaleDateString("en-CA") : "",
}));
filename = "clients.csv";
  }

  if (rows.length === 0) {
    return new NextResponse("No data", { status: 200 });
  }

  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(","),
    ...rows.map((row) =>
      headers.map((h) => `"${String(row[h] ?? "").replace(/"/g, '""')}"`).join(",")
    ),
  ].join("\n");

  return new NextResponse("\uFEFF" + csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}